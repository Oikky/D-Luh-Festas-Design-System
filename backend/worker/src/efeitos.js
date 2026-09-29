/* O que acontece DEPOIS de uma gravação dar certo: Google Agenda, avisos de WhatsApp e Telegram e o backup
   diário. Nada aqui desfaz a gravação: se o Google ou a Evolution falharem, fica só o log
   (`wrangler tail`) e o pedido segue certo no Firestore. Cada integração desligada é pulada. */
import { googleLigado, salvarEvento, apagarEvento, enviarArquivo } from "./google.js";
import { whatsappLigado, enviarTexto } from "./whatsapp.js";
import { telegramLigado, enviar as enviarTelegram } from "./telegram.js";
import { PEDIDOS } from "./pedidos.js";

const brl = c => "R$ " + ((Number(c) || 0) / 100).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const dataBR = d => d ? `${d.slice(8, 10)}/${d.slice(5, 7)}` : "";
const topoTexto = t => !t ? "" : typeof t === "string" ? t : [t.tema, t.detalhes].filter(Boolean).join(" — ");

function linhasItens(p) {
  return (p.itens || []).map(i => [
    `${i.qtd}× ${i.nome}`,
    i.recheios?.length ? `  recheio: ${i.recheios.join(", ")}` : null,
    i.topo ? `  topo: ${topoTexto(i.topo)}${i.topo.imagem ? ` (${i.topo.imagem})` : ""}` : null,
    i.obs ? `  obs: ${i.obs}` : null
  ].filter(Boolean).join("\n"));
}

const falhou = (oque, pedidoId) => e => console.error(JSON.stringify({ msg: `falhou: ${oque}`, pedidoId, erro: String(e) }));

async function lerPedido(db, pedidoId) {
  const snap = await db.collection(PEDIDOS).doc(String(pedidoId)).get();
  return snap.exists ? snap.data() : null;
}

/* Um evento por pedido na Agenda da loja; cancelado sai da Agenda. */
async function sincronizarAgenda(env, db, pedidoId) {
  if (!googleLigado(env)) return;
  const p = await lerPedido(db, pedidoId);
  if (!p) return;
  if (p.status === "Cancelado") return apagarEvento(env, pedidoId);
  const { data, hora, modo, endereco } = p.entrega || {};
  const resumo = (p.itens || []).map(i => `${i.qtd} ${i.nome}`).join(", ");
  let inicio, fim;
  if (hora) {
    const [h, m] = hora.split(":").map(Number);
    const fimH = `${String(Math.min(h + 1, 23)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    inicio = { dateTime: `${data}T${hora}:00`, timeZone: "America/Sao_Paulo" };
    fim = { dateTime: `${data}T${fimH}:00`, timeZone: "America/Sao_Paulo" };
  } else {
    const d = new Date(`${data}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1);
    inicio = { date: data }; fim = { date: d.toISOString().slice(0, 10) };
  }
  return salvarEvento(env, pedidoId, {
    summary: `${modo === "entrega" ? "🚚" : "🎂"} ${p.cliente?.nome} · ${resumo}`.slice(0, 250),
    location: modo === "entrega" ? endereco : "Retirada na loja",
    description: [
      `${p.id} · ${p.status} · ${p.pagamento}`,
      `WhatsApp: ${p.cliente?.telefone}`,
      "", ...linhasItens(p), "",
      `Total ${brl(p.total)} · pago ${brl(p.pago)}`,
      p.obs ? `Obs.: ${p.obs}` : null
    ].filter(x => x !== null).join("\n"),
    start: inicio, end: fim
  });
}

function textoNovoPedido(p) {
  const e = p.entrega || {};
  return [
    `🆕 Novo pedido ${p.id} (${p.origem})`,
    `${p.cliente?.nome} · ${p.cliente?.telefone}`,
    `${dataBR(e.data)}${e.hora ? ` ${e.hora}` : ""} · ${e.modo === "entrega" ? `Entrega: ${e.endereco}` : "Retirada"}`,
    "", ...linhasItens(p), "",
    `Total ${brl(p.total)}`,
    p.obs ? `Obs.: ${p.obs}` : null
  ].filter(x => x !== null).join("\n");
}

/* Telegram, tópico Pendentes: o pedido novo com o botão que confirma o estoque (index.js trata). */
async function telegramNovoPedido(env, db, pedidoId) {
  if (!telegramLigado(env)) return;
  const p = await lerPedido(db, pedidoId);
  if (!p) return;
  return enviarTelegram(env, "pendentes", textoNovoPedido(p), [{ id: `estoque:${p.id}`, titulo: "✅ Confirmar estoque" }]);
}

/* Telegram, tópico Confirmados: estoque confirmado, esperando o pagamento da entrada. */
async function telegramConfirmado(env, db, pedidoId) {
  if (!telegramLigado(env)) return;
  const p = await lerPedido(db, pedidoId);
  if (!p) return;
  const e = p.entrega || {};
  return enviarTelegram(env, "confirmados", [
    `✅ ${p.id} confirmado — esperando pagamento`,
    `${p.cliente?.nome} · ${dataBR(e.data)}${e.hora ? ` ${e.hora}` : ""} · ${e.modo === "entrega" ? "Entrega" : "Retirada"}`,
    `Total ${brl(p.total)} · entrada de ${brl(Math.round(p.total * (p.entradaPct || 50) / 100))}`
  ].join("\n"));
}

const MEIO_TEXTO = { pix: "Pix", dinheiro: "dinheiro", cartao: "cartão", outro: "" };

/* Telegram, tópico Pagamentos: cada pagamento que entra, com o estado do pedido depois dele. */
async function telegramPagamento(env, db, pedidoId, valor, meio, por) {
  if (!telegramLigado(env)) return;
  const p = await lerPedido(db, pedidoId);
  if (!p) return;
  const falta = Math.max(0, p.total - p.pago);
  const como = [MEIO_TEXTO[meio] ?? meio, por === "infinitepay" ? "InfinitePay" : null].filter(Boolean).join(" · ");
  return enviarTelegram(env, "pagamentos", [
    `💰 ${brl(valor)} recebido — ${p.id}${como ? ` (${como})` : ""}`,
    `${p.cliente?.nome} · ${p.pagamento}${falta ? ` · falta ${brl(falta)}` : ""}`,
    `Status: ${p.status}`
  ].join("\n"));
}

async function avisarLojaNovoPedido(env, db, pedidoId) {
  if (!whatsappLigado(env) || !env.WHATSAPP_LOJA) return;
  const p = await lerPedido(db, pedidoId);
  if (!p) return;
  const texto = textoNovoPedido(p);
  // WHATSAPP_LOJA aceita vários destinos separados por vírgula (números ou grupo "…@g.us").
  const destinos = String(env.WHATSAPP_LOJA).split(",").map(s => s.trim()).filter(Boolean);
  const res = await Promise.allSettled(destinos.map(d => enviarTexto(env, d, texto)));
  const falhas = res.filter(r => r.status === "rejected");
  if (falhas.length === res.length) throw falhas[0].reason;
  falhas.forEach(f => console.error(JSON.stringify({ msg: "aviso da loja falhou", erro: String(f.reason) })));
  return true;
}

async function avisarClientePagamento(env, db, pedidoId, valor) {
  if (!whatsappLigado(env)) return;
  const p = await lerPedido(db, pedidoId);
  if (!p) return;
  const falta = Math.max(0, p.total - p.pago);
  return enviarTexto(env, p.cliente?.telefone, [
    `Olá, ${p.cliente?.nome}! 🩷`,
    `Recebemos seu pagamento de ${brl(valor)} do pedido ${p.id}.`,
    p.status === "Em produção" ? "Seu pedido já está em produção! 🎂" : null,
    falta ? `O restante, de ${brl(falta)}, é pago quando o pedido estiver pronto, na ${momento(p)}.` : "Pedido totalmente pago. Obrigada!"
  ].filter(x => x !== null).join("\n"));
}

const momento = p => p.entrega?.modo === "entrega" ? "entrega" : "retirada";

/* Status virou "Pronto": avisa o cliente e lembra o restante, se houver. */
/* Pedido feito pelo site: o cliente recebe no WhatsApp o resumo e o link para acompanhar. */
async function avisarClienteRecebido(env, db, pedidoId) {
  if (!whatsappLigado(env)) return;
  const p = await lerPedido(db, pedidoId);
  if (!p) return;
  const e = p.entrega || {};
  return enviarTexto(env, p.cliente?.telefone, [
    `Olá, ${p.cliente?.nome}! 🩷`,
    `Recebemos seu pedido ${p.id} na D'Luh Festas:`,
    "", ...linhasItens(p), "",
    `${e.modo === "entrega" ? `Entrega em ${e.endereco}` : "Retirada na loja"} · ${dataBR(e.data)}${e.hora ? ` às ${e.hora}` : ""}`,
    `Total ${brl(p.total)}${e.modo === "entrega" ? " (a taxa de entrega vem na confirmação)" : ""}`,
    "",
    "Agora a loja confere o estoque e confirma por aqui, com o link para pagar a entrada.",
    `Acompanhe: https://www.dluhfestas.com/pedido?n=${p.id}`
  ].join("\n"));
}

async function avisarClientePronto(env, db, pedidoId) {
  if (!whatsappLigado(env)) return;
  const p = await lerPedido(db, pedidoId);
  if (!p) return;
  const e = p.entrega || {};
  const falta = Math.max(0, p.total - p.pago);
  return enviarTexto(env, p.cliente?.telefone, [
    `Olá, ${p.cliente?.nome}! 🩷`,
    `Seu pedido ${p.id} está pronto! 🎉`,
    e.modo === "entrega"
      ? "Em breve sai para entrega."
      : `Já pode ser retirado${e.data ? ` (combinado: ${dataBR(e.data)}${e.hora ? ` às ${e.hora}` : ""})` : ""}.`,
    falta ? `Valor restante: ${brl(falta)}, pago na ${momento(p)}.` : "Está totalmente pago. Obrigada!"
  ].join("\n"));
}

/* "Notificar alterações" no admin: manda ao cliente o resumo atual do pedido. */
function resumoParaCliente(p) {
  const e = p.entrega || {};
  return [
    `Olá, ${p.cliente?.nome}! 🩷`,
    `Seu pedido ${p.id} na D'Luh Festas foi atualizado:`,
    "", ...linhasItens(p), "",
    `${e.modo === "entrega" ? `Entrega em ${e.endereco}` : "Retirada na loja"} · ${dataBR(e.data)}${e.hora ? ` às ${e.hora}` : ""}`,
    `Total ${brl(p.total)}${p.pago ? ` · pago ${brl(p.pago)}` : ""}`
  ].join("\n");
}

/* Backup diário (cron do wrangler.jsonc): um JSON com as coleções do sistema na pasta do Drive.
   Não é público. O histórico de eventos de cada pedido não entra (seria uma leitura por pedido). */
const COLECOES_BACKUP = ["sis_pedidos", "sis_pagamentos", "sis_produtos", "sis_catalogo", "sis_config"];

async function backup(env, db) {
  if (!googleLigado(env)) { console.log(JSON.stringify({ msg: "backup pulado: Google não configurado" })); return null; }
  const dados = { geradoEm: new Date().toISOString() };
  for (const c of COLECOES_BACKUP) dados[c] = await db.collection(c).listar();
  const bytes = new TextEncoder().encode(JSON.stringify(dados));
  const r = await enviarArquivo(env, { nome: `backup-dluh-${dados.geradoEm.slice(0, 10)}.json`, mime: "application/json", bytes, publico: false });
  console.log(JSON.stringify({ msg: "backup feito", id: r.id, bytes: bytes.length }));
  return r;
}

export { brl, dataBR, linhasItens, sincronizarAgenda, avisarLojaNovoPedido, telegramNovoPedido, telegramConfirmado, telegramPagamento, avisarClientePagamento, avisarClientePronto, avisarClienteRecebido, resumoParaCliente, backup, falhou, lerPedido };
