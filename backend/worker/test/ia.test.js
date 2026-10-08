import { test } from "node:test";
import assert from "node:assert/strict";
import { assinaturaValida, mensagensDe } from "../src/ia/meta.js";
import { autorizado, conversar, responderBotao, tratarMensagem } from "../src/ia/assistente.js";
import { executarFerramenta } from "../src/ia/ferramentas.js";
import { mensagemEvolution, canalEvolution, baixarAudio } from "../src/ia/evolution.js";

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
      return op === ">=" ? x >= v : op === "<=" ? x <= v : op === "<" ? x < v : x === v;
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

test("áudio é transcrito e entra na conversa; \"sim\" falado também confirma", async () => {
  const db = bancoFalso({ "sis_pedidos/PED-3012": pedido("PED-3012") });
  const transcricoes = ["Marca o 3012 como pronto.", "Sim."];
  const env = { IA_NUMEROS: "5538999540665", AI: { run: async (modelo, e) => ({ text: transcricoes.shift() }) } };
  const canal = { ...canalFalso(), baixarAudio: async () => "b64" };
  const claude = claudeFalso([
    { stop_reason: "tool_use", content: [{ type: "tool_use", id: "t1", name: "propor_status", input: { pedido_id: "3012", status: "Pronto" } }] },
    { stop_reason: "end_turn", content: [{ type: "text", text: "Confirma?" }] }
  ]);
  const executadas = [];
  const executar = async acao => { executadas.push(acao); return { mudou: true }; };
  const de = "553899540665";

  await tratarMensagem({ env, db, msg: { id: "x1", de, tipo: "audio" }, executar, claude, canal });
  assert.match(db.docs.get(`sis_ia/${de}`).historico[0].content, /\(áudio transcrito\) Marca o 3012/);
  await tratarMensagem({ env, db, msg: { id: "x2", de, tipo: "audio" }, executar, claude, canal });
  assert.deepEqual(executadas, ["mudarStatus"]);
});

test("Evolution: áudio ainda não salvo (\"Message not found\") é pedido de novo até vir", async () => {
  const respostas = [
    new Response('{"response":{"message":["Message not found"]}}', { status: 400 }),
    new Response('{"response":{"message":["Message not found"]}}', { status: 400 }),
    new Response('{"base64":"QUJD"}')
  ];
  let chamadas = 0;
  const fetchFn = async () => { chamadas++; return respostas.shift(); };
  const env = { EVOLUTION_URL: "https://x", EVOLUTION_INSTANCE: "dluh", EVOLUTION_KEY: "k" };
  assert.equal(await baixarAudio(env, { id: "1" }, { fetchFn, esperas: [0, 0, 0] }), "QUJD");
  assert.equal(chamadas, 3);

  const sempre404 = async () => new Response("Message not found", { status: 400 });
  await assert.rejects(baixarAudio(env, { id: "1" }, { fetchFn: sempre404, esperas: [0, 0] }), /Evolution mídia 400/);
});

test("áudio vazio ou sem transcrição pede para repetir", async () => {
  const env = { IA_NUMEROS: "5538999540665", AI: { run: async () => ({ text: "  " }) } };
  const canal = { ...canalFalso(), baixarAudio: async () => "b64" };
  await tratarMensagem({ env, db: bancoFalso(), msg: { id: "y", de: "553899540665", tipo: "audio" }, executar: null, claude: null, canal });
  assert.match(canal.envios[0][1], /Não consegui entender o áudio/);
});

test("Evolution: só mensagem recebida de pessoa vira conversa; número vem do campo ao lado do @lid", async () => {
  const evento = (key, message = { conversation: "oi" }) => ({ event: "messages.upsert", data: { key, message, messageType: "conversation" } });
  assert.deepEqual(mensagemEvolution(evento({ id: "1", remoteJid: "553899540665@s.whatsapp.net" })), { id: "1", de: "553899540665", tipo: "text", texto: "oi" });
  assert.equal(mensagemEvolution(evento({ id: "2", remoteJid: "12345@lid", senderPn: "553899540665@s.whatsapp.net" })).de, "553899540665");
  assert.equal(mensagemEvolution(evento({ id: "3", remoteJid: "553899540665@s.whatsapp.net", fromMe: true })), null);
  assert.equal(mensagemEvolution(evento({ id: "4", remoteJid: "120363@g.us" })), null);
  assert.equal(mensagemEvolution({ event: "connection.update", data: {} }), null);
  assert.equal(mensagemEvolution(evento({ id: "5", remoteJid: "553899540665@s.whatsapp.net" }, { extendedTextMessage: { text: "e aí" } })).texto, "e aí");
  assert.equal(mensagemEvolution(evento({ id: "6", remoteJid: "553899540665@s.whatsapp.net" }, { audioMessage: { seconds: 4 } })).tipo, "audio");

  const img = mensagemEvolution(evento({ id: "7", remoteJid: "553899540665@s.whatsapp.net" }, { imageMessage: { mimetype: "image/jpeg", caption: "nota" } }));
  assert.deepEqual([img.tipo, img.mime, img.texto, !!img.bruta], ["imagem", "image/jpeg", "nota", true]);
  const pdf = mensagemEvolution(evento({ id: "8", remoteJid: "553899540665@s.whatsapp.net" }, { documentMessage: { mimetype: "application/pdf" } }));
  assert.deepEqual([pdf.tipo, pdf.mime], ["imagem", "application/pdf"]);
  const comMidia = mensagemEvolution(evento({ id: "9", remoteJid: "553899540665@s.whatsapp.net" }, { imageMessage: { mimetype: "image/jpeg" }, base64: "SU1H" }));
  assert.equal(comMidia.base64, "SU1H");
  assert.equal(await canalEvolution({}).baixarMidia(comMidia), "SU1H");
});

test("foto vai para o Claude como imagem; no histórico fica só o texto", async () => {
  const db = bancoFalso();
  const env = { IA_NUMEROS: "5538999540665" };
  const canal = { ...canalFalso(), baixarMidia: async () => "SU1H" };
  const pedidos = [];
  const claude = { messages: { create: async req => (pedidos.push(structuredClone(req)), { stop_reason: "end_turn", content: [{ type: "text", text: "Atacadão, 05/10, R$ 212,40. Como pagou?" }] }) } };
  const de = "553899540665";
  await tratarMensagem({ env, db, msg: { id: "i1", de, tipo: "imagem", mime: "image/png", texto: "compra de hoje" }, executar: null, claude, canal });
  const [bloco, texto] = pedidos[0].messages.at(-1).content;
  assert.deepEqual(bloco, { type: "image", source: { type: "base64", media_type: "image/png", data: "SU1H" } });
  assert.match(texto.text, /\(mandou uma foto\) compra de hoje/);
  const h = db.docs.get(`sis_ia/${de}`).historico;
  assert.equal(typeof h[0].content, "string");
  assert.doesNotMatch(h[0].content, /SU1H/);
  assert.equal(canal.envios.at(-1)[1], "Atacadão, 05/10, R$ 212,40. Como pagou?");
});

// ── Acesso total: pedidos ──
const ctxPropor = () => { const p = []; return { lista: p, propor: (acao, dados, resumo) => (p.push({ acao, dados, resumo }), { ok: true }) }; };

test("propor_editar_pedido junta com o que já está no pedido, mantém item atual com o preço dele e recusa quando nada muda", async () => {
  const db = bancoFalso({ ...catalogoBase, "sis_pedidos/PED-3012": pedido("PED-3012", { itens: [{ nome: "Brigadeiro antigo", qtd: 50, valorUnit: 100 }], total: 5000 }) });
  const c = ctxPropor();
  await executarFerramenta("propor_editar_pedido", {
    pedido_id: "3012", entrega: { data: "2026-10-10" },
    itens: [{ item_atual: 1, qtd: 60 }, { produto_id: "bolo", qtd: 1, recheios: ["Ninho"] }]
  }, { db, propor: c.propor });
  const [{ acao, dados, resumo }] = c.lista;
  assert.equal(acao, "editarPedido");
  assert.equal(dados.pedidoId, "PED-3012");
  assert.equal(dados.entrega.hora, "15:00");
  assert.equal(dados.itens[0].valorUnit, 100);
  assert.equal(dados.itens[0].qtd, 60);
  assert.equal(dados.itens[1].valorUnit, 12000);
  assert.match(resumo, /10\/10/);
  assert.match(resumo, /Total: R\$ 50,00 → \*R\$ 180,00\*/);

  await assert.rejects(executarFerramenta("propor_editar_pedido", { pedido_id: "3012", obs: "" }, { db, propor: c.propor }), /Nada mudou/);
  await assert.rejects(executarFerramenta("propor_editar_pedido", { pedido_id: "3012", itens: [{ item_atual: 5 }] }, { db, propor: c.propor }), /não tem o item 5/);
});

test("propor_cobranca, propor_apagar_pagamento e propor_nota montam a ação certa", async () => {
  const db = bancoFalso({
    "sis_pedidos/PED-3012": pedido("PED-3012", { pago: 3750, pagamento: "Só entrada" }),
    "sis_pagamentos/manual-x": { pedidoId: "PED-3012", valor: 3750, meio: "pix", por: "ia:5538" }
  });
  const c = ctxPropor();
  await executarFerramenta("propor_cobranca", { pedido_id: "3012", tipo: "restante" }, { db, propor: c.propor });
  await assert.rejects(executarFerramenta("propor_cobranca", { pedido_id: "3012", tipo: "entrada" }, { db, propor: c.propor }), /Não há entrada/);
  await executarFerramenta("propor_apagar_pagamento", { pagamento_id: "manual-x" }, { db, propor: c.propor });
  await executarFerramenta("propor_nota", { pedido_id: "3012", tipo: "NFS-e", numero: " 123 " }, { db, propor: c.propor });
  assert.deepEqual(c.lista.map(p => [p.acao, p.dados]), [
    ["gerarCobranca", { pedidoId: "PED-3012", tipo: "restante" }],
    ["apagarPagamento", { pagamentoId: "manual-x", pedidoId: "PED-3012" }],
    ["registrarNota", { pedidoId: "PED-3012", tipo: "NFS-e", numero: "123" }]
  ]);
  assert.match(c.lista[0].resumo, /Restante: R\$ 37,50/);
  assert.match(c.lista[1].resumo, /Pago: R\$ 37,50 → R\$ 0,00/);
});

// ── Acesso total: financeiro e catálogo ──
const boleto = (extra = {}) => ({
  tipo: "boleto", desc: "Delly's", periodo: "semanal", arquivos: [], valor: 30000, venc: "2026-10-01", pago: false,
  parcelas: [
    { n: 1, venc: "2026-10-01", valor: 10000, codigo: "111", arquivos: [], pago: true, pagoEm: "2026-10-01" },
    { n: 2, venc: "2026-10-03", valor: 10000, codigo: "222", arquivos: [], pago: false, pagoEm: null },
    { n: 3, venc: "2026-10-20", valor: 10000, codigo: "333", arquivos: [], pago: false, pagoEm: null }
  ], ...extra
});

test("propor_pagar_boleto: parcela em aberto vira pagarBoleto com a data; paga de novo é recusada", async () => {
  const db = bancoFalso({ "sis_financeiro/b1": boleto() });
  const c = ctxPropor();
  await executarFerramenta("propor_pagar_boleto", { id: "b1", parcela: 2, data: "2026-10-04" }, { db, propor: c.propor });
  assert.deepEqual(c.lista[0].dados, { id: "b1", n: 2, pago: true, data: "2026-10-04" });
  assert.match(c.lista[0].resumo, /Delly's · 2ª parcela/);
  await assert.rejects(executarFerramenta("propor_pagar_boleto", { id: "b1", parcela: 1 }, { db, propor: c.propor }), /já está paga/);
  await executarFerramenta("propor_pagar_boleto", { id: "b1", parcela: 1, desfazer: true }, { db, propor: c.propor });
  assert.deepEqual(c.lista[1].dados, { id: "b1", n: 1, pago: false });
});

test("propor_boleto anexa as fotos da conversa no boleto ou na parcela; link de fora é recusado", async () => {
  const db = bancoFalso({});
  const c = ctxPropor();
  await executarFerramenta("propor_boleto", {
    fornecedor: "Fermontes", parcelas: [{ venc: "2026-10-15", valor_reais: 385.14 }, { venc: "2026-10-22", valor_reais: 385.14 }],
    arquivos: [{ url: "https://lh3.googleusercontent.com/d/abc123" }, { url: "https://lh3.googleusercontent.com/d/def456", parcela: 2 }]
  }, { db, propor: c.propor });
  const d = c.lista[0].dados;
  assert.deepEqual(d.arquivos.map(a => a.url), ["https://lh3.googleusercontent.com/d/abc123"]);
  assert.deepEqual([d.parcelas[0].arquivos.length, d.parcelas[1].arquivos[0].url], [0, "https://lh3.googleusercontent.com/d/def456"]);
  assert.match(c.lista[0].resumo, /2ª .* 📎/);
  assert.match(c.lista[0].resumo, /📎 2 arquivos anexados/);
  await assert.rejects(executarFerramenta("propor_boleto", { fornecedor: "X", parcelas: [{ venc: "2026-10-15", valor_reais: 1 }], arquivos: [{ url: "https://exemplo.com/a.jpg" }] }, { db, propor: c.propor }), /veio pela conversa/);
  await assert.rejects(executarFerramenta("propor_boleto", { fornecedor: "X", parcelas: [{ venc: "2026-10-15", valor_reais: 1 }], arquivos: [{ url: "https://lh3.googleusercontent.com/d/abc", parcela: 3 }] }, { db, propor: c.propor }), /parcela 3/);
});

test("propor_boleto, propor_transacao e propor_cartao: novo valida; com id, junta com o que já existe", async () => {
  const db = bancoFalso({
    "sis_financeiro/b1": boleto(),
    "sis_financeiro/c1": { tipo: "cartao", nome: "Nubank", final: "1234", bandeira: "Mastercard", limite: 500000, fatura: 120000, venc: 10 }
  });
  const c = ctxPropor();
  await executarFerramenta("propor_boleto", { fornecedor: "Atacadão", parcelas: [{ venc: "2026-11-01", valor_reais: 99.9, codigo: "abc" }] }, { db, propor: c.propor });
  assert.equal(c.lista[0].acao, "salvarFinanceiro");
  assert.equal(c.lista[0].dados.tipo, "boleto");
  assert.equal(c.lista[0].dados.parcelas[0].valor, 9990);

  await executarFerramenta("propor_boleto", { id: "b1", cnpj_antigo: true }, { db, propor: c.propor });
  assert.equal(c.lista[1].dados.id, "b1");
  assert.equal(c.lista[1].dados.tipo, undefined);
  assert.equal(c.lista[1].dados.parcelas.length, 3);
  assert.equal(c.lista[1].dados.cnpjAntigo, true);
  assert.match(c.lista[1].resumo, /1ª .* \(já paga\)/);

  await executarFerramenta("propor_transacao", { descricao: "Gás", valor_reais: 120, meio: "Dinheiro", data: "2026-10-05" }, { db, propor: c.propor });
  assert.deepEqual(c.lista[2].dados, { tipo: "transacao", desc: "Gás", entrada: false, meio: "Dinheiro", data: "2026-10-05", valor: 12000 });

  await executarFerramenta("propor_cartao", { id: "c1", fatura_reais: 0 }, { db, propor: c.propor });
  assert.deepEqual(c.lista[3].dados, { id: "c1", nome: "Nubank", final: "1234", bandeira: "Mastercard", limite: 500000, fatura: 0, venc: 10, fecha: null });

  await assert.rejects(executarFerramenta("propor_transacao", { id: "b1", valor_reais: 1 }, { db, propor: c.propor }), /não é uma transação/);
  await assert.rejects(executarFerramenta("propor_transacao", { valor_reais: 1 }, { db, propor: c.propor }), /descrição/);
});

test("propor_compra_cartao mostra as faturas; propor_pagar_fatura soma a fatura e o lançado à parte", async () => {
  const db = bancoFalso({
    "sis_financeiro/c1": { tipo: "cartao", nome: "Nubank", final: "1234", bandeira: "Mastercard", limite: 500000, fatura: 1000, venc: 10, fecha: 3 },
    "sis_financeiro/k1": { tipo: "compra", cartaoId: "c1", desc: "Atacadão", data: "2026-10-01", valor: 20000, parcelas: 1 },
    "sis_financeiro/t1": { tipo: "transacao", desc: "Gás", entrada: false, meio: "Pix", data: "2026-10-01", valor: 100 }
  });
  const c = ctxPropor();
  await executarFerramenta("propor_compra_cartao", { cartao_id: "c1", descricao: "Batedeira", valor_reais: 600, parcelas: 3, data: "2026-10-20" }, { db, propor: c.propor });
  assert.deepEqual(c.lista[0].dados, { tipo: "compra", cartaoId: "c1", desc: "Batedeira", data: "2026-10-20", valor: 60000, parcelas: 3 });
  assert.match(c.lista[0].resumo, /3x de R\$\s?200,00 .*\n.*faturas 11\/2026 a 01\/2027/);
  await assert.rejects(executarFerramenta("propor_compra_cartao", { cartao_id: "t1", descricao: "X", valor_reais: 1 }, { db, propor: c.propor }), /não é um cartão/);

  await executarFerramenta("propor_pagar_fatura", { id: "c1", mes: "2026-10", data: "2026-10-10" }, { db, propor: c.propor });
  assert.deepEqual(c.lista[1].dados, { id: "c1", mes: "2026-10", pago: true, data: "2026-10-10", meio: "Pix" });
  assert.match(c.lista[1].resumo, /R\$\s?210,00/);
  await assert.rejects(executarFerramenta("propor_pagar_fatura", { id: "c1", mes: "2026-10", desfazer: true }, { db, propor: c.propor }), /não está paga/);

  const v = await executarFerramenta("ver_lancamento", { id: "c1" }, { db });
  assert.equal(v.faturas.length, 1);
  assert.match(v.limite_usado, /210,00/);
});

test("buscar_financeiro acha parcela vencida; resumo_caixa junta pedidos, avulsos e boletos", async () => {
  const db = bancoFalso({
    "sis_financeiro/b1": boleto(),
    "sis_financeiro/t1": { tipo: "transacao", desc: "Gás", entrada: false, meio: "Pix", data: "2026-10-02", valor: 12000 },
    "sis_pagamentos/p1": { pedidoId: "PED-3012", valor: 5000, meio: "pix", por: "x", em: new Date("2026-10-02T15:00:00Z") },
    "sis_pagamentos/p2": { pedidoId: "PED-3013", valor: 7000, meio: "cartao", por: "x", em: new Date("2026-09-20T15:00:00Z") }
  });
  const venc = await executarFerramenta("buscar_financeiro", { tipo: "boleto", situacao: "vencido" }, { db });
  assert.equal(venc.quantidade, 1);
  assert.match(venc.lancamentos[0], /2ª 03\/10/);
  assert.doesNotMatch(venc.lancamentos[0], /3ª/);

  const r = await executarFerramenta("resumo_caixa", { de: "2026-10-01", ate: "2026-10-05" }, { db });
  assert.equal(r.entrou_de_pedidos, "R$ 50,00");
  assert.equal(r.saidas_avulsas, "R$ 120,00");
  assert.equal(r.boletos_pagos, "R$ 100,00");
  assert.equal(r.boletos_a_vencer_sem_pagar.total, "R$ 100,00");
});

test("propor_produto mostra só o que muda; propor_recheios acrescenta e tira", async () => {
  const db = bancoFalso(catalogoBase);
  const c = ctxPropor();
  await executarFerramenta("propor_produto", { id: "brig", preco_reais: 1.8 }, { db, propor: c.propor });
  assert.equal(c.lista[0].dados.valorUnit, 180);
  assert.equal(c.lista[0].dados.nome, "Brigadeiro");
  assert.deepEqual(c.lista[0].resumo.split("\n").slice(1), ["Preço: R$ 1,50 → *R$ 1,80*"]);
  await assert.rejects(executarFerramenta("propor_produto", { id: "brig", nome: "Brigadeiro" }, { db, propor: c.propor }), /Nada mudou/);

  await executarFerramenta("propor_recheios", { adicionar: ["Morango", "ninho"], remover: ["Brigadeiro"] }, { db, propor: c.propor });
  assert.deepEqual(c.lista[1].dados, { lista: ["Ninho", "Morango"] });
});

test("Telegram: só os IDs de TELEGRAM_IA_IDS falam com a assistente", async () => {
  const { iaPermitida } = await import("../src/telegram.js");
  assert.equal(iaPermitida({}, 7), true);
  assert.equal(iaPermitida({ TELEGRAM_IA_IDS: "7, 8" }, 8), true);
  assert.equal(iaPermitida({ TELEGRAM_IA_IDS: "7, 8" }, 9), false);

  const db = bancoFalso();
  const canal = { ...canalFalso(), autoriza: msg => iaPermitida({ TELEGRAM_IA_IDS: "7" }, msg.uid) };
  const claude = claudeFalso([{ stop_reason: "end_turn", content: [{ type: "text", text: "Oi!" }] }]);
  await tratarMensagem({ env: {}, db, msg: { id: "t1", de: "telegram", uid: 9, tipo: "text", texto: "oi" }, executar: null, claude, canal });
  assert.equal(canal.envios.length, 0);
  await tratarMensagem({ env: {}, db, msg: { id: "t2", de: "telegram", uid: 7, tipo: "text", texto: "oi" }, executar: null, claude, canal });
  assert.equal(canal.envios.at(-1)[1], "Oi!");
});

test("confirmação de ação do financeiro responde com o texto dela", async () => {
  const db = bancoFalso({ "sis_ia/5538": { pendentes: { abc: { acao: "pagarBoleto", dados: { id: "b1", n: 2, pago: true }, resumo: "x", criadoEm: new Date() } } } });
  let resposta;
  await responderBotao({ env: {}, db, numero: "5538", botao: "ok:abc", executar: async () => ({ mudou: true }), enviar: { texto: async t => { resposta = t; } } });
  assert.match(resposta, /2ª parcela marcada como paga/);
});
