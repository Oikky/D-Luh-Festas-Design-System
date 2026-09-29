import { test } from "node:test";
import assert from "node:assert/strict";
import { topicos, lerUpdate, enviar } from "../src/telegram.js";

const env = { TELEGRAM_TOKEN: "t", TELEGRAM_CHAT: "-1004334694564", TELEGRAM_TOPICOS: "pendentes:6, confirmados:4,pagamentos:8,ia:174,ruim:x" };
const grupo = { id: -1004334694564 };

test("topicos lê o mapa nome:número e ignora o que não é número", () => {
  assert.deepEqual(topicos(env), { pendentes: 6, confirmados: 4, pagamentos: 8, ia: 174 });
  assert.deepEqual(topicos({}), {});
});

test("lerUpdate: toque em botão do grupo", () => {
  const u = lerUpdate(env, { callback_query: { id: "q1", data: "estoque:PED-3010", from: { id: 7, username: "lu" }, message: { chat: grupo, message_id: 9, text: "x" } } });
  assert.equal(u.tipo, "toque");
  assert.equal(u.dados, "estoque:PED-3010");
});

test("lerUpdate: só o tópico IA vira conversa; outro chat, outro tópico e bot são ignorados", () => {
  const msg = (extra = {}) => ({ message: { message_id: 5, chat: grupo, from: { id: 7, first_name: "Lu" }, message_thread_id: 174, text: "pedidos de hoje?", ...extra } });
  const u = lerUpdate(env, msg());
  assert.equal(u.tipo, "ia");
  assert.deepEqual({ de: u.msg.de, tipo: u.msg.tipo, texto: u.msg.texto }, { de: "telegram", tipo: "text", texto: "pedidos de hoje?" });
  assert.equal(lerUpdate(env, msg({ message_thread_id: 6 })), null);
  assert.equal(lerUpdate(env, msg({ chat: { id: 123 } })), null);
  assert.equal(lerUpdate(env, msg({ from: { id: 1, is_bot: true } })), null);
  assert.equal(lerUpdate(env, { callback_query: { id: "q", data: "x", message: { chat: { id: 1 } } } }), null);
});

test("lerUpdate: voz no tópico IA vira áudio com o file_id", () => {
  const u = lerUpdate(env, { message: { message_id: 6, chat: grupo, from: { id: 7 }, message_thread_id: 174, voice: { file_id: "F1" } } });
  assert.equal(u.msg.tipo, "audio");
  assert.equal(u.msg.midia, "F1");
});

test("enviar manda no tópico certo, com os botões em linhas", async () => {
  let corpo;
  const fetchFn = async (url, init) => { corpo = JSON.parse(init.body); return { status: 200, json: async () => ({ ok: true, result: {} }) }; };
  await enviar(env, "pendentes", "oi", [{ id: "estoque:PED-1", titulo: "✅ Confirmar estoque" }], fetchFn);
  assert.equal(corpo.message_thread_id, 6);
  assert.equal(corpo.chat_id, "-1004334694564");
  assert.deepEqual(corpo.reply_markup.inline_keyboard, [[{ text: "✅ Confirmar estoque", callback_data: "estoque:PED-1" }]]);
  await enviar({ ...env, TELEGRAM_TOPICOS: "" }, "pendentes", "oi", null, fetchFn);
  assert.equal(corpo.message_thread_id, undefined);
});
