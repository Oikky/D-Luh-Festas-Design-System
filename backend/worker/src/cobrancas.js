/* Cobrança junta: um link só para vários pedidos do mesmo cliente (o "Cobrar tudo" dos fiados).
   Fica em sis_cobrancas/COB-…, que vira o order_nsu da InfinitePay: quando o webhook avisa o
   pagamento, o valor é dividido entre os pedidos com o que cada um devia na hora do link, e cada
   parte entra como um pagamento normal do pedido (registrarPagamento: quitar fiado finaliza). */
import { FieldValue } from "./firestore.js";
import { ErroDominio } from "./dominio.js";
import * as pedidos from "./pedidos.js";

const COBRANCAS = "sis_cobrancas";
const ehCobrancaJunta = id => /^COB-[\w]+$/.test(String(id || ""));

function novoId() {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return "COB-" + Array.from(bytes, b => abc[b % abc.length]).join("");
}

/* Lê os pedidos e monta a cobrança (o que falta em cada um, mais antigo primeiro). Pedido
   cancelado ou já pago fica de fora; se nada sobrar, não há o que cobrar. */
async function montar(db, pedidoIds) {
  const ids = [...new Set((Array.isArray(pedidoIds) ? pedidoIds : []).map(String).filter(Boolean))];
  if (!ids.length) throw new ErroDominio("invalid-argument", "Escolha os pedidos a cobrar");
  if (ids.length > 30) throw new ErroDominio("invalid-argument", "No máximo 30 pedidos num link");
  const snaps = await Promise.all(ids.map(id => db.collection(pedidos.PEDIDOS).doc(id).get()));
  const faltando = snaps.find(s => !s.exists);
  if (faltando) throw new ErroDominio("not-found", `Pedido ${faltando.id} não existe`);
  const itens = snaps.map(s => ({ s, d: s.data() }))
    .filter(({ d }) => d.status !== "Cancelado" && (d.total || 0) - (d.pago || 0) > 0)
    .sort((a, b) => `${a.d.entrega?.data || ""} ${a.d.entrega?.hora || ""}`.localeCompare(`${b.d.entrega?.data || ""} ${b.d.entrega?.hora || ""}`))
    .map(({ s, d }) => ({ pedidoId: s.id, valor: d.total - d.pago, cliente: d.cliente || {} }));
  if (!itens.length) throw new ErroDominio("failed-precondition", "Esses pedidos já estão pagos");
  return itens;
}

/* `criarLink` é o infinitepay.criarLink já com handle e URLs (index.js). */
async function criarCobrancaJunta(db, { pedidoIds }, por, criarLink) {
  const itens = await montar(db, pedidoIds);
  const total = itens.reduce((s, i) => s + i.valor, 0);
  const cliente = itens[0].cliente;
  const id = novoId();
  const descricao = `${itens.length === 1 ? "Pedido" : "Pedidos"} ${itens.map(i => i.pedidoId).join(", ")} — ${cliente.nome || ""}`.slice(0, 200);
  const url = await criarLink({ pedidoId: id, valor: total, descricao, cliente });
  await db.collection(COBRANCAS).doc(id).set({
    pedidos: itens.map(({ pedidoId, valor }) => ({ pedidoId, valor })), total, url,
    cliente: { nome: cliente.nome || "", telefone: cliente.telefone || "" }, paga: false, por, em: FieldValue.serverTimestamp()
  });
  await Promise.all(itens.map(i => db.collection(pedidos.PEDIDOS).doc(i.pedidoId).collection("eventos")
    .add({ tipo: "cobranca-junta", cobrancaId: id, valor: i.valor, total, por, em: new Date() })));
  return { id, total, pedidos: itens.map(({ pedidoId, valor }) => ({ pedidoId, valor })), completo: url };
}

/* Divide o que entrou entre os pedidos pelo que cada um devia no link. Se entrou diferente do
   total (não deveria), a diferença fica no último, para nenhum centavo sumir. Sempre o mesmo
   resultado para o mesmo aviso: o webhook pode repetir e cada parte tem a sua chave. */
function dividir(itens, valor) {
  const partes = itens.map(i => ({ pedidoId: i.pedidoId, valor: i.valor }));
  const soma = partes.reduce((s, p) => s + p.valor, 0);
  if (valor !== soma && partes.length) {
    let resto = valor;
    partes.forEach((p, k) => {
      p.valor = k === partes.length - 1 ? Math.max(0, resto) : Math.min(p.valor, Math.max(0, resto));
      resto -= p.valor;
    });
  }
  return partes.filter(p => p.valor > 0);
}

/* Webhook da InfinitePay com order_nsu = COB-…: registra cada parte no seu pedido. Devolve as
   partes com o resultado de cada uma (duplicado quando o aviso se repete). */
async function pagarCobrancaJunta(db, { cobrancaId, valor, transacao, meio, comprovante }, por) {
  const ref = db.collection(COBRANCAS).doc(String(cobrancaId));
  const snap = await ref.get();
  if (!snap.exists) throw new ErroDominio("not-found", `Cobrança ${cobrancaId} não existe`);
  const partes = dividir(snap.get("pedidos") || [], valor);
  const feitas = [];
  for (const p of partes) {
    try {
      const r = await pedidos.registrarPagamento(db, { pedidoId: p.pedidoId, valor: p.valor, chave: `ip-${transacao}-${p.pedidoId}`, meio, comprovante }, por);
      feitas.push({ ...p, ...r });
    } catch (e) {
      // Pedido apagado depois do link: o resto da cobrança ainda entra; a equipe vê no log.
      if (!(e instanceof ErroDominio && e.codigo === "not-found")) throw e;
      console.error(JSON.stringify({ msg: "cobrança junta com pedido apagado", cobrancaId, pedidoId: p.pedidoId, valor: p.valor }));
    }
  }
  if (!snap.get("paga")) await ref.set({ paga: true, pagaEm: FieldValue.serverTimestamp(), transacao: String(transacao), valorPago: valor }, { merge: true });
  return { cliente: snap.get("cliente") || {}, partes: feitas };
}

/* Para o link curto /pagar/COB-…: o checkout, ou nada se já foi paga. */
async function linkDaCobranca(db, cobrancaId) {
  const snap = await db.collection(COBRANCAS).doc(String(cobrancaId)).get();
  if (!snap.exists || snap.get("paga")) return null;
  return snap.get("url") || null;
}

export { COBRANCAS, ehCobrancaJunta, criarCobrancaJunta, pagarCobrancaJunta, dividir, linkDaCobranca };
