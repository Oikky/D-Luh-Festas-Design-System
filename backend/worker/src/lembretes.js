/* Lembrete da entrada: "o pedido está confirmado; a produção começa quando a entrada for paga",
   com o link da entrada, no WhatsApp do cliente.
   - Manual: botão na aba "Esperando pagamento" do admin (ação lembrarEntrada), para todos da aba.
   - Automático: todo dia às 9h (cron), para quem tem pedido daqui a 1 a 3 dias e ainda não pagou
     a entrada. Cada pedido recebe o automático uma vez só (campo lembreteEntradaAuto).
   Cada envio deixa um evento no pedido. */
import { PEDIDOS } from "./pedidos.js";
import { ErroDominio } from "./dominio.js";
import { whatsappLigado, enviarTexto } from "./whatsapp.js";
import { telegramLigado, enviar as enviarTelegram } from "./telegram.js";
import { brl, dataBR } from "./efeitos.js";

const ESPERANDO = "Confirmado — Esperando pagamento";
const DIAS_ANTES = 3;
const SEMANA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const hojeSP = (agora = Date.now()) => new Date(agora - 3 * 3600e3).toISOString().slice(0, 10);
const somarDias = (iso, n) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const diasAte = (iso, hoje) => Math.round((new Date(iso + "T12:00:00Z") - new Date(hoje + "T12:00:00Z")) / 864e5);
const entradaDe = p => Math.max(0, Math.round((p.total || 0) * (p.entradaPct || 50) / 100) - (p.pago || 0));
const temTelefone = p => String(p.cliente?.telefone || "").replace(/\D/g, "").length >= 10;
const espera = ms => new Promise(r => setTimeout(r, ms));

/* Quem recebe. Manual: todos em "Esperando pagamento" (ou só os ids pedidos). Automático: os que
   têm entrega de amanhã até daqui a DIAS_ANTES dias e ainda não receberam o automático. */
async function paraLembrar(db, { pedidoIds, automatico = false, agora = Date.now() } = {}) {
  const hoje = hojeSP(agora);
  let lista = await db.collection(PEDIDOS).consultar([["status", "==", ESPERANDO]]);
  if (pedidoIds) lista = lista.filter(p => pedidoIds.includes(p.id));
  if (automatico) {
    const limite = somarDias(hoje, DIAS_ANTES);
    lista = lista.filter(p => p.entrega?.data > hoje && p.entrega.data <= limite && !p.lembreteEntradaAuto);
  }
  return lista.filter(p => entradaDe(p) > 0 && temTelefone(p));
}

/* O cliente recebe o link curto (/pagar/PED-n), que abre a última cobrança do pedido. Se a
   última não for uma entrada com o valor de agora, gera uma nova antes. */
async function linkDaEntrada(db, p, valor, gerarCobranca) {
  const eventos = await db.collection(PEDIDOS).doc(p.id).collection("eventos").listar();
  const ultima = eventos.filter(e => e.tipo === "cobranca" && e.url).sort((a, b) => new Date(b.em) - new Date(a.em))[0];
  const serve = ultima && ultima.cobranca === "entrada" && ultima.valor === valor;
  return (await (serve ? null : gerarCobranca(p.id)))?.url || gerarCobranca.curto(p.id);
}

function mensagem(p, valor, url, hoje) {
  const e = p.entrega || {};
  const faltam = e.data ? diasAte(e.data, hoje) : null;
  const quando = e.data ? `${SEMANA[new Date(e.data + "T12:00:00Z").getUTCDay()]}, ${dataBR(e.data)}${e.hora ? ` às ${e.hora}` : ""}` : "";
  return [
    `Olá, ${p.cliente?.nome}! 🩷`,
    faltam != null && faltam > 0 && faltam <= DIAS_ANTES
      ? `Faltam ${faltam === 1 ? "1 dia" : `${faltam} dias`} para o seu pedido ${p.id} na D'Luh Festas (${e.modo === "entrega" ? "entrega" : "retirada"} ${quando}).`
      : `Seu pedido ${p.id} na D'Luh Festas está confirmado${quando ? ` para ${quando}` : ""}.`,
    "",
    `Para começarmos a produção, falta o pagamento da entrada de ${brl(valor)}.`,
    `Pague por aqui: ${url}`,
    "",
    "Se você já pagou, pode desconsiderar esta mensagem."
  ].join("\n");
}

/* Manda um a um, com uma pausa entre eles (vários envios seguidos podem ser barrados no WhatsApp). */
async function enviarLembretes({ env, db, lista, gerarCobranca, automatico = false, por, esperaMs = 1200, agora = Date.now() }) {
  const hoje = hojeSP(agora);
  const r = { enviados: [], falhas: [] };
  for (const [n, p] of lista.entries()) {
    if (n) await espera(esperaMs);
    try {
      const valor = entradaDe(p);
      const url = await linkDaEntrada(db, p, valor, gerarCobranca);
      await enviarTexto(env, p.cliente.telefone, mensagem(p, valor, url, hoje));
      const ref = db.collection(PEDIDOS).doc(p.id);
      await ref.collection("eventos").add({ tipo: "aviso", canal: "whatsapp", motivo: "lembrete-entrada", automatico, valor, por, em: new Date(agora) });
      if (automatico) await ref.set({ lembreteEntradaAuto: hoje }, { merge: true });
      r.enviados.push(p);
    } catch (e) {
      console.error(JSON.stringify({ msg: "lembrete de entrada falhou", pedidoId: p.id, erro: String(e) }));
      r.falhas.push(p);
    }
  }
  if (telegramLigado(env) && (r.enviados.length || r.falhas.length)) {
    const linha = p => `• ${p.id} · ${p.cliente?.nome} · ${dataBR(p.entrega?.data)} · entrada ${brl(entradaDe(p))}`;
    await enviarTelegram(env, "pagamentos", [
      `🔔 Lembrete de entrada ${automatico ? `automático (pedidos em até ${DIAS_ANTES} dias)` : `enviado por ${por}`}`,
      ...r.enviados.map(linha),
      ...(r.falhas.length ? ["", "Não foi:", ...r.falhas.map(linha)] : [])
    ].join("\n")).catch(e => console.error(JSON.stringify({ msg: "resumo do lembrete no Telegram falhou", erro: String(e) })));
  }
  console.log(JSON.stringify({ msg: "lembretes de entrada", automatico, enviados: r.enviados.length, falhas: r.falhas.length }));
  return r;
}

function exigirWhatsapp(env) {
  if (!whatsappLigado(env)) throw new ErroDominio("failed-precondition", "O WhatsApp automático ainda não foi configurado");
}

export { paraLembrar, enviarLembretes, mensagem, exigirWhatsapp, hojeSP, DIAS_ANTES };
