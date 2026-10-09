import { test } from "node:test";
import assert from "node:assert/strict";
import { registrarAtendimento, avisarAtendimento, marcarAtendimento, tipoDe } from "../src/sofia-atendimento.js";

function banco() {
  const docs = {};
  const doc = id => ({
    id,
    get: async () => ({ id, exists: id in docs, data: () => docs[id] }),
    set: async (d, { merge } = {}) => { docs[id] = merge ? { ...docs[id], ...d } : d; }
  });
  return { docs, collection: () => ({ doc, add: async d => { const id = `a${Object.keys(docs).length + 1}`; docs[id] = d; return { id }; } }) };
}

test("grava o pedido de visita com os campos vazios da Intenção limpos", async () => {
  const db = banco();
  const agora = new Date("2026-10-09T15:00:00Z");
  const a = await registrarAtendimento(db, { telefone: "+55 38 99969-1571", tipo: "Visita", nome: "Ana", data: "sábado de manhã", pessoas: "nenhuma", obs: "-" }, agora);
  assert.deepEqual(db.docs[a.id], { tipo: "visita", nome: "Ana", telefone: "5538999691571", data: "sábado de manhã", pessoas: "", obs: "", status: "novo", criadoEm: agora });
  await assert.rejects(registrarAtendimento(db, { telefone: "123" }), /telefone/);
  assert.equal(tipoDe("aluguel do espaço"), "evento");
  assert.equal(tipoDe("quero falar com alguém"), "outro");
});

test("avisa no Telegram e no WhatsApp; um canal caído não derruba o outro", async () => {
  const chamadas = [];
  const orig = globalThis.fetch;
  globalThis.fetch = async (url, op) => {
    chamadas.push({ url, corpo: JSON.parse(op.body) });
    if (url.includes("evolution")) return new Response("caiu", { status: 502 });
    return new Response(JSON.stringify({ ok: true, result: {} }));
  };
  try {
    const env = { TELEGRAM_TOKEN: "t", TELEGRAM_CHAT: "-1", TELEGRAM_TOPICOS: "pendentes:6", EVOLUTION_URL: "https://evolution", EVOLUTION_KEY: "k", EVOLUTION_INSTANCE: "dluh", WHATSAPP_ATENDIMENTO: "5538997457788" };
    const a = { tipo: "visita", nome: "Ana", telefone: "5538999691571", data: "sábado", pessoas: "80", obs: "" };
    assert.equal(await avisarAtendimento(env, a), 1);
    const tg = chamadas.find(c => c.url.includes("telegram"));
    assert.equal(tg.corpo.message_thread_id, 6);
    assert.match(tg.corpo.text, /Visita ao salão[\s\S]*Ana · 5538999691571[\s\S]*Pessoas: 80/);
    assert.equal(chamadas.find(c => c.url.includes("evolution")).corpo.number, "5538997457788");
    globalThis.fetch = async () => new Response("caiu", { status: 502 });
    await assert.rejects(avisarAtendimento(env, a));
  } finally { globalThis.fetch = orig; }
});

test("admin marca como resolvido e volta para novo", async () => {
  const db = banco();
  db.docs.x = { status: "novo", nome: "Ana" };
  assert.deepEqual(await marcarAtendimento(db, { id: "x", resolvido: true }, "eu@x"), { id: "x", status: "resolvido" });
  assert.equal(db.docs.x.resolvidoPor, "eu@x");
  assert.equal(db.docs.x.nome, "Ana");
  await marcarAtendimento(db, { id: "x", resolvido: false }, "eu@x");
  assert.equal(db.docs.x.status, "novo");
  await assert.rejects(marcarAtendimento(db, { id: "nada" }, "eu@x"), /não existe/);
});
