/* As únicas formas de mudar um pedido. Toda mudança roda numa transação e deixa um evento em
   sis_pedidos/{id}/eventos — é o histórico de quem mudou o quê, e quando.
   Recebem o Firestore por parâmetro para os testes rodarem contra o emulador. */
import { FieldValue } from "./firestore.js";
import { STATUS, MEIOS, pagamentoDe, centavos, validarItens, totalDe, ErroDominio } from "./dominio.js";

const PEDIDOS = "sis_pedidos";
const PAGAMENTOS = "sis_pagamentos";
const CONTADOR = "sis_config/contador";
const PRIMEIRO_NUMERO = 3001; // acima dos PED-xxxx do Coda, para os dois nunca colidirem

const agora = () => FieldValue.serverTimestamp();

function evento(tx, pedidoRef, dados) {
  tx.create(pedidoRef.collection("eventos").doc(), { ...dados, em: agora() });
}

async function criarPedido(db, dados, por) {
  const nome = String(dados?.cliente?.nome || "").trim();
  const telefone = String(dados?.cliente?.telefone || "").replace(/\D/g, "");
  if (!nome) throw new ErroDominio("invalid-argument", "Informe o nome do cliente");
  if (telefone.length < 10) throw new ErroDominio("invalid-argument", "Telefone inválido");

  const modo = dados?.entrega?.modo;
  if (!["entrega", "retirada"].includes(modo)) throw new ErroDominio("invalid-argument", "Entrega deve ser 'entrega' ou 'retirada'");
  const data = String(dados.entrega.data || "");
  const hora = String(dados.entrega.hora || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new ErroDominio("invalid-argument", "Data no formato AAAA-MM-DD");
  if (hora && !/^\d{2}:\d{2}$/.test(hora)) throw new ErroDominio("invalid-argument", "Hora no formato HH:MM");
  if (modo === "entrega" && !String(dados.entrega.endereco || "").trim()) throw new ErroDominio("invalid-argument", "Entrega precisa de endereço");

  const itens = validarItens(dados.itens);
  const taxaEntrega = centavos(dados.taxaEntrega ?? 0, "taxaEntrega");
  const total = totalDe(itens, taxaEntrega);
  // Quanto do total a cobrança de entrada pede: 50% (padrão) ou 100% (tudo agora).
  const entradaPct = dados.entradaPct === 100 ? 100 : 50;
  const formaPagamento = MEIOS.includes(dados.formaPagamento) ? dados.formaPagamento : null;

  return db.runTransaction(async tx => {
    const contRef = db.doc(CONTADOR);
    const cont = await tx.get(contRef);
    const numero = cont.exists ? cont.get("ultimo") + 1 : PRIMEIRO_NUMERO;
    const id = `PED-${numero}`;
    const ref = db.collection(PEDIDOS).doc(id);

    tx.set(contRef, { ultimo: numero }, { merge: true });
    tx.create(ref, {
      id,
      cliente: { nome, telefone },
      ...(dados.clienteUid ? { clienteUid: String(dados.clienteUid) } : {}),
      tipo: dados.tipo === "empresa" ? "empresa" : "pessoa",
      entrega: { modo, data, hora, ...(modo === "entrega" ? { endereco: String(dados.entrega.endereco).trim() } : {}) },
      itens, taxaEntrega, total, entradaPct,
      ...(formaPagamento ? { formaPagamento } : {}),
      pago: 0,
      pagamento: "Não pago",
      status: "Aguardando confirmação",
      cozinha: "pendente",
      obs: String(dados.obs || ""),
      origem: ["site", "empresas", "admin"].includes(dados.origem) ? dados.origem : "admin",
      criadoEm: agora(),
      atualizadoEm: agora()
    });
    evento(tx, ref, { tipo: "criado", para: "Aguardando confirmação", por });
    return { id, total };
  });
}

async function mudarStatus(db, { pedidoId, status, motivo }, por) {
  if (!STATUS.includes(status)) throw new ErroDominio("invalid-argument", `Status desconhecido: ${status}`);
  const ref = db.collection(PEDIDOS).doc(String(pedidoId || ""));

  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ErroDominio("not-found", `Pedido ${pedidoId} não existe`);
    const de = snap.get("status");
    if (de === status) return { mudou: false, status };
    tx.update(ref, { status, atualizadoEm: agora() });
    evento(tx, ref, { tipo: "status", de, para: status, por, ...(motivo ? { motivo: String(motivo) } : {}) });
    return { mudou: true, status };
  });
}

/* A cozinha só diz "fiz". Não mexe no status nem no pagamento (cobrar é com o atendimento):
   o pedido sai da fila e continua "Em produção" até ser entregue. */
async function marcarFeito(db, { pedidoId }, por) {
  const ref = db.collection(PEDIDOS).doc(String(pedidoId || ""));
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ErroDominio("not-found", `Pedido ${pedidoId} não existe`);
    if (snap.get("status") !== "Em produção") throw new ErroDominio("failed-precondition", `Pedido ${pedidoId} não está em produção`);
    if (snap.get("cozinha") === "feito") return { mudou: false };
    tx.update(ref, { cozinha: "feito", feitoEm: agora(), atualizadoEm: agora() });
    evento(tx, ref, { tipo: "cozinha", para: "feito", por });
    return { mudou: true };
  });
}

/* `chave` identifica o pagamento de forma única (transaction_nsu da InfinitePay, ou um id gerado
   no admin). Se a mesma chave chegar de novo, nada muda — o webhook pode repetir. */
async function registrarPagamento(db, { pedidoId, valor, chave, meio, comprovante }, por) {
  centavos(valor, "valor");
  if (valor === 0) throw new ErroDominio("invalid-argument", "Valor do pagamento deve ser maior que zero");
  if (!chave) throw new ErroDominio("invalid-argument", "Pagamento sem chave de identificação");
  const ref = db.collection(PEDIDOS).doc(String(pedidoId || ""));
  const pagRef = db.collection(PAGAMENTOS).doc(String(chave));

  return db.runTransaction(async tx => {
    const [snap, jaExiste] = await Promise.all([tx.get(ref), tx.get(pagRef)]);
    if (jaExiste.exists) return { duplicado: true };
    if (!snap.exists) throw new ErroDominio("not-found", `Pedido ${pedidoId} não existe`);

    const pago = snap.get("pago") + valor;
    const pagamento = pagamentoDe(snap.get("total"), pago);
    const statusAntes = snap.get("status");
    // Mantém o fluxo de hoje: o primeiro pagamento tira o pedido da espera e manda para produção.
    const status = statusAntes === "Confirmado — Esperando pagamento" ? "Em produção" : statusAntes;

    tx.create(pagRef, { pedidoId: snap.id, valor, meio: String(meio || ""), comprovante: String(comprovante || ""), por, em: agora() });
    tx.update(ref, { pago, pagamento, status, atualizadoEm: agora() });
    evento(tx, ref, { tipo: "pagamento", valor, meio: String(meio || ""), pagamento, por });
    if (status !== statusAntes) evento(tx, ref, { tipo: "status", de: statusAntes, para: status, por: "sistema" });
    return { duplicado: false, pago, pagamento, status };
  });
}

export { criarPedido, mudarStatus, marcarFeito, registrarPagamento, PEDIDOS, PAGAMENTOS };
