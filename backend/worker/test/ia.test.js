import { test } from "node:test";
import assert from "node:assert/strict";
import { assinaturaValida, mensagensDe } from "../src/ia/meta.js";
import { autorizado, conversar, responderBotao, tratarMensagem } from "../src/ia/assistente.js";
import { executarFerramenta } from "../src/ia/ferramentas.js";
import { mensagemEvolution } from "../src/ia/evolution.js";

/* Firestore de mentira, em memória, com a mesma forma que o código usa. */
function bancoFalso(inicial = {}) {
  const docs = new Map(Object.entries(inicial));
  const snap = path => { const d = docs.get(path); return { id: path.split("/").pop(), exists: !!d, data: () => d && structuredClone(d), get: k => d?.[k] }; };
  const docRef = path => ({
    id: path.split("/").pop(), path,
    get: async () => snap(path),
    set: async (v, o) => { docs.set(path, o?.merge ? { ...(docs.get(path) || {}), ...v } : v); },
    collection: n => colRef(`${path}/${n}`)
  });
  const colRef = path => ({
    doc: id => docRef(`${path}/${id ?? Math.random().toString(36).slice(2)}`),
    listar: async () => [...docs].filter(([k]) => k.startsWith(path + "/") && !k.slice(path.length + 1).includes("/"))
      .map(([k, v]) => ({ id: k.split("/").pop(), ...structuredClone(v) })),
    consultar: async filtros => (await colRef(path).listar()).filter(d => filtros.every(([c, op, v]) => {
      const x = c.split(".").reduce((o, k) => o?.[k], d);
      return op === ">=" ? x >= v : op === "<=" ? x <= v : x === v;
    }))
  });
  return {
    docs, doc: docRef, collection: colRef,
    runTransaction: async fn => fn({
      get: r => r.get(),
      create: (r, v) => { if (docs.has(r.path)) throw new Error("já existe"); docs.set(r.path, v); },
      set: (r, v, o) => { docs.set(r.path, o?.merge ? { ...(docs.get(r.path) || {}), ...v } : v); },
      update: (r, v) => docs.set(r.path, { ...docs.get(r.path), ...v })
    })
  };
}

const pedido = (id, extra = {}) => ({
  id, cliente: { nome: "Ana", telefone: "38999990000" }, entrega: { modo: "retirada", data: "2026-10-03", hora: "15:00" },
  itens: [{ nome: "Brigadeiro", qtd: 50, valorUnit: 150 }], total: 7500, pago: 0, pagamento: "Não pago", status: "Em produção", ...extra
});

const catalogoBase = {
  "sis_produtos/brig": { nome: "Brigadeiro", categoria: "Doces", valorUnit: 150, qtdMin: 25, ativo: true },
  "sis_produtos/bolo": { nome: "Bolo de festa", categoria: "Bolos", valorUnit: 12000, qtdMin: 1, ativo: true },
  "sis_produtos/velho": { nome: "Pudim", categoria: "Doces", valorUnit: 3000, ativo: false },
  "sis_catalogo/recheios": { lista: ["Ninho", "Brigadeiro"] }
};

test("assinatura da Meta confere o HMAC do corpo cru", async () => {
  const corpo = '{"a":1}', segredo = "s3gredo";
  const chave = await crypto.subtle.importKey("raw", new TextEncoder().encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const hex = [...new Uint8Array(await crypto.subtle.sign("HMAC", chave, new TextEncoder().encode(corpo)))].map(b => b.toString(16).padStart(2, "0")).join("");
  assert.equal(await assinaturaValida(corpo, `sha256=${hex}`, segredo), true);
  assert.equal(await assinaturaValida(corpo + " ", `sha256=${hex}`, segredo), false);
  assert.equal(await assinaturaValida(corpo, "", segredo), false);
});

test("mensagensDe lê texto e toque em botão", () => {
  const corpo = { entry: [{ changes: [{ value: { messages: [
    { id: "w1", from: "553899540665", type: "text", text: { body: "oi" } },
    { id: "w2", from: "553899540665", type: "interactive", interactive: { type: "button_reply", button_reply: { id: "ok:abc" } } }
  ] } }] }] };
  assert.deepEqual(mensagensDe(corpo).map(m => [m.id, m.texto, m.botao]), [["w1", "oi", undefined], ["w2", undefined, "ok:abc"]]);
});

test("só números autorizados, comparando pelos últimos 8 dígitos (com ou sem o nono)", () => {
  const env = { IA_NUMEROS: "5538999540665, 5538997457788" };
  assert.equal(autorizado(env, "553899540665"), true);
  assert.equal(autorizado(env, "5538999540665"), true);
  assert.equal(autorizado(env, "5538911112222"), false);
});

test("propor_pedido usa o preço do catálogo, e recusa produto inativo, abaixo do mínimo ou recheio fora da lista", async () => {
  const db = bancoFalso(catalogoBase);
  let proposta;
  const propor = (acao, dados, resumo) => (proposta = { acao, dados, resumo });
  const base = { cliente: { nome: "Ana", telefone: "38 99999-0000" }, entrega: { modo: "retirada", data: "2026-10-03" } };

  await executarFerramenta("propor_pedido", { ...base, itens: [{ produto_id: "brig", qtd: 50 }, { produto_id: "bolo", qtd: 1, recheios: ["Ninho"] }] }, { db, propor });
  assert.equal(proposta.acao, "criarPedido");
  assert.deepEqual(proposta.dados.itens.map(i => i.valorUnit), [150, 12000]);
  assert.match(proposta.resumo, /Total R\$ 195,00/);

  await assert.rejects(executarFerramenta("propor_pedido", { ...base, itens: [{ produto_id: "velho", qtd: 1 }] }, { db, propor }), /não está no catálogo/);
  await assert.rejects(executarFerramenta("propor_pedido", { ...base, itens: [{ produto_id: "brig", qtd: 10 }] }, { db, propor }), /mínimo de 25/);
  await assert.rejects(executarFerramenta("propor_pedido", { ...base, itens: [{ produto_id: "bolo", qtd: 1, recheios: ["Morango"] }] }, { db, propor }), /Recheio fora da lista/);
});

test("resumo_vendas soma pela data de entrega e deixa cancelados de fora", async () => {
  const db = bancoFalso({
    "sis_pedidos/PED-1": pedido("PED-1", { pago: 7500, pagamento: "Totalmente pago" }),
    "sis_pedidos/PED-2": pedido("PED-2", { status: "Cancelado" }),
    "sis_pedidos/PED-3": pedido("PED-3", { entrega: { modo: "retirada", data: "2026-11-01" } })
  });
  const r = await executarFerramenta("resumo_vendas", { de: "2026-09-29", ate: "2026-10-05" }, { db });
  assert.equal(r.pedidos, 1);
  assert.equal(r.cancelados, 1);
  assert.equal(r.faturamento, "R$ 75,00");
  assert.equal(r.a_receber, "R$ 0,00");
});

/* Claude de mentira: devolve as respostas na ordem. */
const claudeFalso = respostas => ({ chamadas: [], messages: { create: async function (req) { this.chamadas?.push(req); return respostas.shift(); } } });

test("proposta vira botões; Confirmar grava uma vez só, pelo caminho das telas", async () => {
  const db = bancoFalso({ "sis_pedidos/PED-3012": pedido("PED-3012") });
  const enviados = [];
  const enviar = { texto: async t => enviados.push(["texto", t]), botoes: async (t, b) => enviados.push(["botoes", t, b]) };
  const claude = claudeFalso([
    { stop_reason: "tool_use", content: [{ type: "tool_use", id: "t1", name: "propor_status", input: { pedido_id: "3012", status: "Pronto" } }] },
    { stop_reason: "end_turn", content: [{ type: "text", text: "Mandei pra você confirmar." }] }
  ]);

  const { propostas } = await conversar({ env: {}, db, numero: "553899540665", texto: "marca o 3012 como pronto", claude, enviar });
  assert.equal(propostas.length, 1);
  assert.deepEqual(enviados.map(e => e[0]), ["texto", "botoes"]);
  const [, , botoes] = enviados[1];
  assert.equal(botoes[0].id, `ok:${propostas[0].id}`);
  assert.ok(db.docs.get("sis_ia/553899540665").pendentes[propostas[0].id]);

  const executadas = [];
  const executar = async (acao, dados, por) => { executadas.push({ acao, dados, por }); return { mudou: true, status: dados.status }; };
  await responderBotao({ env: {}, db, numero: "553899540665", botao: botoes[0].id, executar, enviar });
  await responderBotao({ env: {}, db, numero: "553899540665", botao: botoes[0].id, executar, enviar });

  assert.equal(executadas.length, 1);
  assert.deepEqual(executadas[0], { acao: "mudarStatus", dados: { pedidoId: "PED-3012", status: "Pronto" }, por: "ia:553899540665" });
  assert.match(enviados.at(-2)[1], /agora está em \*Pronto\*/);
  assert.match(enviados.at(-1)[1], /já foi usada ou expirou/);
});

test("pagamento confirmado leva a chave da proposta (tocar de novo não paga duas vezes)", async () => {
  const db = bancoFalso({ "sis_pedidos/PED-3012": pedido("PED-3012") });
  const enviar = { texto: async () => {}, botoes: async () => {} };
  const claude = claudeFalso([
    { stop_reason: "tool_use", content: [{ type: "tool_use", id: "t1", name: "propor_pagamento", input: { pedido_id: "PED-3012", valor_reais: 37.5, meio: "pix" } }] },
    { stop_reason: "end_turn", content: [{ type: "text", text: "Ok." }] }
  ]);
  const { propostas } = await conversar({ env: {}, db, numero: "553899540665", texto: "entrou 37,50 no pix do 3012", claude, enviar });
  let recebido;
  await responderBotao({ env: {}, db, numero: "553899540665", botao: `ok:${propostas[0].id}`, enviar,
    executar: async (acao, dados) => { recebido = { acao, dados }; return { duplicado: false, pagamento: "Só entrada" }; } });
  assert.equal(recebido.acao, "registrarPagamentoManual");
  assert.deepEqual(recebido.dados, { pedidoId: "PED-3012", valor: 3750, meio: "pix", chave: `ia-${propostas[0].id}` });
});

test("Cancelar não grava nada", async () => {
  const db = bancoFalso({ "sis_ia/5538": { pendentes: { abc: { acao: "mudarStatus", dados: {}, resumo: "x", criadoEm: new Date() } } } });
  let chamou = false, resposta;
  await responderBotao({ env: {}, db, numero: "5538", botao: "nao:abc", executar: async () => { chamou = true; },
    enviar: { texto: async t => { resposta = t; } } });
  assert.equal(chamou, false);
  assert.match(resposta, /cancelado/i);
});

const canalFalso = () => {
  const envios = [];
  return { envios, texto: async (n, t) => envios.push(["texto", t]), botoes: async (n, t, b) => envios.push(["botoes", t, b]) };
};

test("mensagem de número não autorizado ou repetida é ignorada", async () => {
  const db = bancoFalso();
  const env = { IA_NUMEROS: "5538999540665" };
  const canal = canalFalso();
  const claude = claudeFalso([{ stop_reason: "end_turn", content: [{ type: "text", text: "Oi!" }] }]);

  await tratarMensagem({ env, db, msg: { id: "w9", de: "5511900000000", tipo: "text", texto: "oi" }, executar: null, claude, canal });
  assert.equal(canal.envios.length, 0);

  const msg = { id: "w10", de: "553899540665", tipo: "text", texto: "oi" };
  await tratarMensagem({ env, db, msg, executar: null, claude, canal });
  await tratarMensagem({ env, db, msg, executar: null, claude, canal });
  assert.deepEqual(canal.envios, [["texto", "Oi!"]]);
});

test("\"sim\" logo depois da proposta confirma pelo código; sem proposta recente, vai para o modelo", async () => {
  const db = bancoFalso({ "sis_pedidos/PED-3012": pedido("PED-3012") });
  const env = { IA_NUMEROS: "5538999540665" };
  const canal = canalFalso();
  const executadas = [];
  const executar = async (acao, dados) => { executadas.push(acao); return { mudou: true }; };
  const claude = claudeFalso([
    { stop_reason: "tool_use", content: [{ type: "tool_use", id: "t1", name: "propor_status", input: { pedido_id: "3012", status: "Pronto" } }] },
    { stop_reason: "end_turn", content: [{ type: "text", text: "Confirma?" }] },
    { stop_reason: "end_turn", content: [{ type: "text", text: "Sim o quê?" }] }
  ]);
  const de = "553899540665";

  await tratarMensagem({ env, db, msg: { id: "a", de, tipo: "text", texto: "3012 pronto" }, executar, claude, canal });
  await tratarMensagem({ env, db, msg: { id: "b", de, tipo: "text", texto: "Sim" }, executar, claude, canal });
  assert.deepEqual(executadas, ["mudarStatus"]);

  // A proposta já foi usada: o próximo "sim" não grava nada e segue para o modelo.
  await tratarMensagem({ env, db, msg: { id: "c", de, tipo: "text", texto: "sim" }, executar, claude, canal });
  assert.deepEqual(executadas, ["mudarStatus"]);
  assert.equal(canal.envios.at(-1)[1], "Sim o quê?");
});

test("Evolution: só mensagem recebida de pessoa vira conversa; número vem do campo ao lado do @lid", () => {
  const evento = (key, message = { conversation: "oi" }) => ({ event: "messages.upsert", data: { key, message, messageType: "conversation" } });
  assert.deepEqual(mensagemEvolution(evento({ id: "1", remoteJid: "553899540665@s.whatsapp.net" })), { id: "1", de: "553899540665", tipo: "text", texto: "oi" });
  assert.equal(mensagemEvolution(evento({ id: "2", remoteJid: "12345@lid", senderPn: "553899540665@s.whatsapp.net" })).de, "553899540665");
  assert.equal(mensagemEvolution(evento({ id: "3", remoteJid: "553899540665@s.whatsapp.net", fromMe: true })), null);
  assert.equal(mensagemEvolution(evento({ id: "4", remoteJid: "120363@g.us" })), null);
  assert.equal(mensagemEvolution({ event: "connection.update", data: {} }), null);
  assert.equal(mensagemEvolution(evento({ id: "5", remoteJid: "553899540665@s.whatsapp.net" }, { extendedTextMessage: { text: "e aí" } })).texto, "e aí");
});
