import { test } from "node:test";
import assert from "node:assert/strict";
import { anotarNossaMensagem, telefonesDaNossaMensagem, voltarParaSofia, segurarConversas } from "../src/sofia-humano.js";

const H = 60 * 60 * 1000;
const agora = Date.parse("2026-10-09T15:00:00Z");
const env = { GPTMAKER_TOKEN: "t", GPTMAKER_WORKSPACE: "W" };
const CANAL = "3FA5AEE7B6A2D0F985F39EBDDD858735";

function banco(inicial = {}) {
  const docs = { ...inicial };
  return {
    docs,
    collection: () => ({
      doc: id => ({
        get: async () => ({ exists: id in docs, data: () => docs[id] }),
        set: async d => { docs[id] = d; }
      })
    })
  };
}

const upsert = key => ({ event: "messages.upsert", data: { key: { id: "X", ...key }, message: { conversation: "oi" } } });

test("anota só mensagem que a loja mandou para um cliente", async () => {
  assert.deepEqual(telefonesDaNossaMensagem(upsert({ fromMe: true, remoteJid: "553899691571@s.whatsapp.net" })), ["553899691571"]);
  assert.deepEqual(telefonesDaNossaMensagem(upsert({ fromMe: true, remoteJid: "123@lid", remoteJidAlt: "553899691571@s.whatsapp.net" })), ["123@lid", "553899691571"]);
  assert.deepEqual(telefonesDaNossaMensagem(upsert({ fromMe: false, remoteJid: "553899691571@s.whatsapp.net" })), []);
  assert.deepEqual(telefonesDaNossaMensagem(upsert({ fromMe: true, remoteJid: "1203@g.us" })), []);
  assert.deepEqual(telefonesDaNossaMensagem({ event: "connection.update", data: {} }), []);
  const db = banco();
  await anotarNossaMensagem(db, upsert({ fromMe: true, remoteJid: "553899691571@s.whatsapp.net" }), agora);
  assert.deepEqual(db.docs["humano-553899691571"], { ultima: agora });
});

function gptmaker(chats, mensagens) {
  const chamadas = [];
  const fetchFn = async (url, { method }) => {
    chamadas.push(`${method} ${url.replace("https://api.gptmaker.ai/v2", "")}`);
    const m = url.match(/\/chat\/([^/]+)\/messages/);
    const corpo = url.includes("/chats?") ? chats : m ? mensagens[decodeURIComponent(m[1])] || [] : { ok: true };
    return new Response(JSON.stringify(corpo), { status: 200 });
  };
  return { fetchFn, chamadas };
}
const chat = (tel, extra = {}) => ({ id: `${CANAL}-${tel}`, humanTalk: true, finished: false, isGroup: false, ...extra });
const assumiu = t => ({ role: "system", type: "NOTIFICATION", conversationNotificationType: "START_INTERACTION_HUMAN", time: t });

test("devolve para a Sofia só conversa humana parada há 2h do nosso lado", async () => {
  const { fetchFn, chamadas } = gptmaker(
    [chat("5501"), chat("5502"), chat("5503"), chat("5504", { humanTalk: false }), chat("5505")],
    {
      [`${CANAL}-5501`]: [assumiu(agora - 3 * H)],                                    // parada → volta
      [`${CANAL}-5502`]: [assumiu(agora - 3 * H)],                                    // dona falou há 30 min
      [`${CANAL}-5503`]: [assumiu(agora - 1 * H), { role: "user", time: agora - 3 * H }],
      [`${CANAL}-5505`]: [{ role: "user", time: agora - 5 * H }]                      // sem hora nossa: não mexe
    });
  const db = banco({ "humano-5502": { ultima: agora - 0.5 * H } });
  const voltaram = await voltarParaSofia(env, db, { agora, fetchFn });
  assert.deepEqual(voltaram, ["5501"]);
  assert.ok(chamadas.includes(`PUT /chat/${CANAL}-5501/stop-human`));
  assert.equal(chamadas.filter(c => c.startsWith("PUT")).length, 1);
  assert.ok(!chamadas.some(c => c.includes("5504/messages")));
});

test("sem token do GPTMaker não faz nada", async () => {
  assert.deepEqual(await voltarParaSofia({}, banco(), { fetchFn: () => { throw new Error("não devia chamar"); } }), []);
});

test("equipe e lista de bloqueio vão para humano e nunca voltam para a Sofia", async () => {
  const { fetchFn, chamadas } = gptmaker(
    [chat("553899540665", { humanTalk: false }), chat("553897457788", { humanTalk: false }), chat("551148619361", { humanTalk: false }),
     chat("5538991234567", { humanTalk: false }), chat("5538999540665"), chat("5511948619361")],
    { [`${CANAL}-5538999540665`]: [assumiu(agora - 5 * H)], [`${CANAL}-5511948619361`]: [assumiu(agora - 5 * H)] });
  const db = banco({ "sofia-bloqueio": { numeros: ["+55 11 4861-9361"] } });
  assert.deepEqual(await segurarConversas(env, db, { agora, fetchFn }), ["553899540665", "553897457788", "551148619361"]);
  assert.ok(chamadas.includes(`PUT /chat/${CANAL}-553899540665/start-human`));
  assert.ok(!chamadas.some(c => c.includes("5538991234567/")));
  assert.deepEqual(await voltarParaSofia(env, db, { agora, fetchFn }), []);
});

test("robô em loop: muitas respostas da Sofia em 10 min vai para humano e avisa", async () => {
  const M = 60 * 1000;
  const respostas = n => Array.from({ length: n }, (_, i) => ({ role: "assistant", time: agora - i * 20 * 1000 }));
  const { fetchFn, chamadas } = gptmaker(
    [chat("5511900000001", { humanTalk: false, time: agora, name: "Neon" }), chat("5538900000002", { humanTalk: false, time: agora }),
     chat("5538900000003", { humanTalk: false, time: agora - 60 * M })],
    { [`${CANAL}-5511900000001`]: respostas(25), [`${CANAL}-5538900000002`]: respostas(12),
      [`${CANAL}-5538900000003`]: respostas(30) });
  const avisos = [];
  const r = await segurarConversas(env, banco(), { agora, fetchFn, avisar: async t => avisos.push(t) });
  assert.deepEqual(r, ["5511900000001"]);
  assert.equal(avisos.length, 1);
  assert.match(avisos[0], /Neon/);
  assert.ok(!chamadas.some(c => c.includes("5538900000003/messages")), "conversa parada nem é lida");
});
