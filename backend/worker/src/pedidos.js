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

/* O que criar e editar aceitam, já conferido e no formato gravado. */
function normalizar(dados) {
  const nome = String(dados?.cliente?.nome || "").trim();
  const telefone = String(dados?.cliente?.telefone || "").replace(/\D/g, "");
  // E-mail vem do login Google do site (ou digitado no admin); vai preenchido no checkout.
  const email = String(dados?.cliente?.email || "").trim().toLowerCase();
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
  const formaPagamento = MEIOS.includes(dados.formaPagamento) ? dados.formaPagamento : undefined;

  return {
    cliente: { nome, telefone, ...(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? { email } : {}) },
    tipo: dados.tipo === "empresa" ? "empresa" : "pessoa",
    entrega: { modo, data, hora, ...(modo === "entrega" ? { endereco: String(dados.entrega.endereco).trim() } : {}) },
    itens, taxaEntrega, total, entradaPct, formaPagamento,
    obs: String(dados.obs || "")
  };
}

async function criarPedido(db, dados, por) {
  const { formaPagamento, ...p } = normalizar(dados);

  return db.runTransaction(async tx => {
    const contRef = db.doc(CONTADOR);
    const cont = await tx.get(contRef);
    const numero = cont.exists ? cont.get("ultimo") + 1 : PRIMEIRO_NUMERO;
    const id = `PED-${numero}`;
    const ref = db.collection(PEDIDOS).doc(id);

    tx.set(contRef, { ultimo: numero }, { merge: true });
    tx.create(ref, {
      id,
      ...p,
      ...(dados.clienteUid ? { clienteUid: String(dados.clienteUid) } : {}),
      ...(formaPagamento ? { formaPagamento } : {}),
      pago: 0,
      pagamento: "Não pago",
      status: "Aguardando confirmação",
      cozinha: "pendente",
      origem: ["site", "whatsapp", "empresas", "admin"].includes(dados.origem) ? dados.origem : "admin",
      criadoEm: agora(),
      atualizadoEm: agora()
    });
    evento(tx, ref, { tipo: "criado", para: "Aguardando confirmação", por });
    return { id, total: p.total };
  });
}

const EDITAVEIS = ["cliente", "tipo", "entrega", "itens", "taxaEntrega", "total", "entradaPct", "formaPagamento", "obs"];

/* Troca os dados do pedido (cliente, entrega, itens, valores). Status, pagamentos e cozinha não
   mudam aqui; só o estado do pagamento é refeito, porque o total pode ter mudado. O evento guarda
   como cada campo estava antes. */
async function editarPedido(db, { pedidoId, ...dados }, por) {
  const novo = normalizar(dados);
  const ref = db.collection(PEDIDOS).doc(String(pedidoId || ""));

  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ErroDominio("not-found", `Pedido ${pedidoId} não existe`);
    if (snap.get("status") === "Cancelado") throw new ErroDominio("failed-precondition", "Pedido cancelado não pode ser editado");
    const velho = snap.data();
    // O admin não mostra o e-mail do login Google: editar não pode apagar.
    if (velho.cliente?.email && !novo.cliente.email) novo.cliente.email = velho.cliente.email;
    const mudou = EDITAVEIS.filter(k => JSON.stringify(velho[k] ?? null) !== JSON.stringify(novo[k] ?? null));
    if (!mudou.length) return { mudou: false };

    const pagamento = pagamentoDe(novo.total, velho.pago || 0);
    tx.update(ref, { ...Object.fromEntries(mudou.map(k => [k, novo[k]])), pagamento, atualizadoEm: agora() });
    evento(tx, ref, { tipo: "editado", campos: mudou, antes: Object.fromEntries(mudou.map(k => [k, velho[k] ?? null])), por });
    return { mudou: true, campos: mudou, total: novo.total, pagamento };
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
    // O primeiro pagamento tira o pedido da espera e manda para produção; quitar um pedido já
    // entregue o finaliza.
    const status = statusAntes === "Confirmado — Esperando pagamento" ? "Em produção"
      : statusAntes === "Entregue — Esperando restante" && pagamento === "Totalmente pago" ? "Finalizado"
      : statusAntes;

    tx.create(pagRef, { pedidoId: snap.id, valor, meio: String(meio || ""), comprovante: String(comprovante || ""), por, em: agora() });
    tx.update(ref, { pago, pagamento, status, atualizadoEm: agora() });
    evento(tx, ref, { tipo: "pagamento", valor, meio: String(meio || ""), pagamento, por });
    if (status !== statusAntes) evento(tx, ref, { tipo: "status", de: statusAntes, para: status, por: "sistema" });
    return { duplicado: false, pago, pagamento, status, de: statusAntes };
  });
}

/* Comprovante que o cliente mandou (pela Sofia): fica no pedido em `aConferir` e só vira pagamento
   quando alguém da equipe confirma (decisão da loja, 09/10). `id` identifica o comprovante. */
async function informarComprovante(db, { pedidoId, valor, meio, telefone, obs }, por) {
  centavos(valor, "valor");
  if (valor === 0) throw new ErroDominio("invalid-argument", "Valor do comprovante deve ser maior que zero");
  const ref = db.collection(PEDIDOS).doc(String(pedidoId || ""));
  const id = `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ErroDominio("not-found", `Pedido ${pedidoId} não existe`);
    if (snap.get("status") === "Cancelado") throw new ErroDominio("failed-precondition", "Esse pedido está cancelado");
    const item = { id, valor, meio: MEIOS.includes(meio) ? meio : "pix", telefone: String(telefone || ""), obs: String(obs || "").slice(0, 300), por, em: new Date() };
    tx.update(ref, { aConferir: [...(snap.get("aConferir") || []), item], atualizadoEm: agora() });
    evento(tx, ref, { tipo: "comprovante", valor, meio: item.meio, por });
    return { id, pedidoId: snap.id };
  });
}

/* A equipe confirma (vira pagamento, com chave fixa para não contar duas vezes) ou recusa. */
async function decidirComprovante(db, { pedidoId, id, aceito }, por) {
  const ref = db.collection(PEDIDOS).doc(String(pedidoId || ""));
  const snap = await ref.get();
  const item = (snap.exists ? snap.get("aConferir") || [] : []).find(x => x.id === id);
  if (!item) throw new ErroDominio("not-found", "Esse comprovante já foi resolvido");
  const pag = aceito ? await registrarPagamento(db, { pedidoId, valor: item.valor, chave: `comprovante-${id}`, meio: item.meio }, por) : null;
  await db.runTransaction(async tx => {
    const atual = await tx.get(ref);
    tx.update(ref, { aConferir: (atual.get("aConferir") || []).filter(x => x.id !== id), atualizadoEm: agora() });
    if (!aceito) evento(tx, ref, { tipo: "comprovante recusado", valor: item.valor, por });
  });
  return { item, pag };
}

/* Apaga o pedido de vez: o documento, o histórico (eventos) e os pagamentos dele. Quem chama
   (index.js) já conferiu a senha da conta sistema. O backup diário no Drive guarda o que existia. */
async function apagarPedido(db, { pedidoId }) {
  const ref = db.collection(PEDIDOS).doc(String(pedidoId || ""));
  const [eventos, pagamentos] = await Promise.all([
    ref.collection("eventos").listar(),
    db.collection(PAGAMENTOS).consultar([["pedidoId", "==", ref.id]])
  ]);
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ErroDominio("not-found", `Pedido ${pedidoId} não existe`);
    eventos.forEach(e => tx.delete(ref.collection("eventos").doc(e.id)));
    pagamentos.forEach(p => tx.delete(db.collection(PAGAMENTOS).doc(p.id)));
    tx.delete(ref);
    return { apagado: true, eventos: eventos.length, pagamentos: pagamentos.length };
  });
}

/* Apaga um registro de pagamento lançado errado e tira o valor do pedido. Pedido finalizado que
   deixa de estar quitado volta a "Entregue — Esperando restante". Quem chama (index.js) já conferiu
   a senha da conta sistema. O evento guarda o que foi apagado. */
async function apagarPagamento(db, { pagamentoId }, por) {
  const pagRef = db.collection(PAGAMENTOS).doc(String(pagamentoId || ""));
  return db.runTransaction(async tx => {
    const pag = await tx.get(pagRef);
    if (!pag.exists) throw new ErroDominio("not-found", "Esse pagamento não existe mais");
    const { pedidoId, valor = 0, meio = "" } = pag.data();
    const ref = db.collection(PEDIDOS).doc(String(pedidoId || ""));
    const snap = await tx.get(ref);
    tx.delete(pagRef);
    if (!snap.exists) return { apagado: true, pedidoId };

    const pago = Math.max(0, (snap.get("pago") || 0) - valor);
    const pagamento = pagamentoDe(snap.get("total"), pago);
    const statusAntes = snap.get("status");
    const status = statusAntes === "Finalizado" && pagamento !== "Totalmente pago" ? "Entregue — Esperando restante" : statusAntes;
    tx.update(ref, { pago, pagamento, status, atualizadoEm: agora() });
    evento(tx, ref, { tipo: "pagamento-apagado", valor, meio, pagamentoId: pagRef.id, pagamento, por });
    if (status !== statusAntes) evento(tx, ref, { tipo: "status", de: statusAntes, para: status, por: "sistema" });
    return { apagado: true, pedidoId, pago, pagamento, status };
  });
}

export { apagarPagamento, apagarPedido, normalizar, informarComprovante, decidirComprovante, criarPedido, editarPedido, mudarStatus, marcarFeito, registrarPagamento, PEDIDOS, PAGAMENTOS };
