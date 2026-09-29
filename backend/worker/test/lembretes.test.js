import { test } from "node:test";
import assert from "node:assert/strict";
import { paraLembrar, enviarLembretes, mensagem } from "../src/lembretes.js";

/* Firestore de mentira: só o que os lembretes usam. */
function banco(pedidos) {
  const docs = new Map(pedidos.map(p => [`sis_pedidos/${p.id}`, p]));
  const col = path => ({
    doc: id => ({
      collection: n => col(`${path}/${id}/${n}`),
      set: async (v, o) => docs.set(`${path}/${id}`, { ...(docs.get(`${path}/${id}`) || {}), ...v })
    }),
    add: async v => docs.set(`${path}/${Math.random()}`, v),
    listar: async () => [...docs].filter(([k]) => k.startsWith(path + "/") && !k.slice(path.length + 1).includes("/")).map(([, v]) => v),
    consultar: async filtros => (await col(path).listar()).filter(d => filtros.every(([c, , v]) => d[c] === v))
  });
  return { docs, collection: col };
}

const ESPERANDO = "Confirmado — Esperando pagamento";
const agora = Date.parse("2026-10-01T15:00:00Z"); // 01/10, 12h em Brasília
const p = (id, data, extra = {}) => ({ id, status: ESPERANDO, total: 10000, pago: 0, entradaPct: 50,
  cliente: { nome: "Ana", telefone: "38999990000" }, entrega: { modo: "retirada", data, hora: "15:00" }, ...extra });

test("manual: todos em Esperando pagamento com entrada a pagar e telefone", async () => {
  const db = banco([p("A", "2026-10-20"), p("B", "2026-10-02", { status: "Em produção" }), p("C", "2026-10-03", { pago: 5000 }), p("D", "2026-10-04", { cliente: { nome: "X", telefone: "" } })]);
  assert.deepEqual((await paraLembrar(db, { agora })).map(x => x.id), ["A"]);
  assert.deepEqual((await paraLembrar(db, { pedidoIds: ["C"], agora })).map(x => x.id), []);
});

test("automático: só pedidos de amanhã até 3 dias, uma vez", async () => {
  const db = banco([p("hoje", "2026-10-01"), p("amanha", "2026-10-02"), p("tres", "2026-10-04"), p("quatro", "2026-10-05"), p("ja", "2026-10-03", { lembreteEntradaAuto: "2026-09-30" })]);
  assert.deepEqual((await paraLembrar(db, { automatico: true, agora })).map(x => x.id).sort(), ["amanha", "tres"]);
});

test("mensagem diz quantos dias faltam e leva o link", () => {
  const m = mensagem(p("PED-1", "2026-10-04"), 5000, "https://x/pagar/PED-1", "2026-10-01");
  assert.match(m, /Faltam 3 dias para o seu pedido PED-1/);
  assert.match(m, /entrada de R\$ 50,00/);
  assert.match(m, /https:\/\/x\/pagar\/PED-1/);
  assert.match(mensagem(p("PED-2", "2026-10-20"), 5000, "u", "2026-10-01"), /está confirmado para/);
});

test("envio: usa o link curto, gera cobrança só se a última não serve, marca o automático", async () => {
  const db = banco([p("PED-1", "2026-10-03"), p("PED-2", "2026-10-02")]);
  db.docs.set("sis_pedidos/PED-2/eventos/e1", { tipo: "cobranca", cobranca: "entrada", valor: 5000, url: "https://checkout/longo", em: new Date() });
  const geradas = [];
  const gerar = Object.assign(async id => { geradas.push(id); return { url: `https://api/pagar/${id}` }; }, { curto: id => `https://api/pagar/${id}` });
  const enviados = [];
  const env = { EVOLUTION_URL: "https://evo", EVOLUTION_KEY: "k", EVOLUTION_INSTANCE: "i" };
  const fetchOriginal = globalThis.fetch;
  globalThis.fetch = async (url, init) => { enviados.push(JSON.parse(init.body)); return { ok: true, text: async () => "" }; };
  try {
    const lista = await paraLembrar(db, { automatico: true, agora });
    const r = await enviarLembretes({ env, db, lista, gerarCobranca: gerar, automatico: true, por: "teste", esperaMs: 0, agora });
    assert.equal(r.enviados.length, 2);
  } finally { globalThis.fetch = fetchOriginal; }
  assert.deepEqual(geradas, ["PED-1"]);
  assert.ok(enviados.every(e => /https:\/\/api\/pagar\/PED-\d/.test(e.text)));
  assert.equal(db.docs.get("sis_pedidos/PED-1").lembreteEntradaAuto, "2026-10-01");
});
