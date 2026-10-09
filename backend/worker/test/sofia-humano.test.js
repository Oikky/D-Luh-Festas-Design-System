import { test } from "node:test";
import assert from "node:assert/strict";
import { anotarNossaMensagem, telefonesDaNossaMensagem, voltarParaSofia } from "../src/sofia-humano.js";

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
