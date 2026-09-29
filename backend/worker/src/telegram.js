/* Grupo da equipe no Telegram (supergrupo com tópicos), junto com o WhatsApp:
     Pendentes    pedido novo, com o botão "Confirmar estoque"
     Confirmados  pedido confirmado (estoque ok), esperando pagamento
     Pagamentos   cada pagamento que entra
     IA           a assistente (a mesma do WhatsApp) conversa ali
   O Telegram chama /webhook/telegram com o cabeçalho X-Telegram-Bot-Api-Secret-Token.
   Sem TELEGRAM_TOKEN e TELEGRAM_CHAT fica desligado; tópico sem número manda no Geral. */

const telegramLigado = env => !!(env.TELEGRAM_TOKEN && env.TELEGRAM_CHAT);

/* TELEGRAM_TOPICOS = "pendentes:6,confirmados:4,pagamentos:8,ia:174" */
function topicos(env) {
  return Object.fromEntries(String(env.TELEGRAM_TOPICOS || "").split(",")
    .map(par => par.split(":").map(s => s.trim())).filter(([k, v]) => k && /^\d+$/.test(v || ""))
    .map(([k, v]) => [k.toLowerCase(), Number(v)]));
}

async function chamar(env, metodo, corpo, fetchFn = fetch) {
  const res = await fetchFn(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/${metodo}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
    signal: AbortSignal.timeout(10000)
  });
  const r = await res.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Telegram ${metodo} ${res.status}: ${String(r.description || "").slice(0, 200)}`);
  return r.result;
}

// O Telegram corta mensagem acima de 4096 caracteres.
const cortar = s => (s.length > 4096 ? s.slice(0, 4095) + "…" : s);
const teclado = botoes => botoes?.length ? { reply_markup: { inline_keyboard: botoes.map(b => [{ text: b.titulo, callback_data: b.id }]) } } : {};

/* Texto simples (sem parse_mode: nome de cliente com "_" ou "*" não quebra a mensagem). */
function enviar(env, topico, texto, botoes, fetchFn) {
  const fio = typeof topico === "number" ? topico : topicos(env)[topico];
  return chamar(env, "sendMessage", {
    chat_id: env.TELEGRAM_CHAT, text: cortar(texto), link_preview_options: { is_disabled: true },
    ...(fio ? { message_thread_id: fio } : {}), ...teclado(botoes)
  }, fetchFn);
}

/* Depois do toque: acrescenta quem fez o quê no fim da mensagem e tira os botões. */
const fecharMensagem = (env, msg, rodape, fetchFn) => chamar(env, "editMessageText", {
  chat_id: msg.chat.id, message_id: msg.message_id, text: cortar(`${msg.text || ""}\n\n${rodape}`),
  link_preview_options: { is_disabled: true }
}, fetchFn);

const responderToque = (env, id, texto, fetchFn) =>
  chamar(env, "answerCallbackQuery", { callback_query_id: id, ...(texto ? { text: texto.slice(0, 190) } : {}) }, fetchFn).catch(() => {});

const quemE = u => u?.username ? `@${u.username}` : [u?.first_name, u?.last_name].filter(Boolean).join(" ") || `id ${u?.id}`;

/* Áudio (voz) do Telegram em base64, para o Whisper. */
async function baixarArquivo(env, fileId, fetchFn = fetch) {
  const { file_path } = await chamar(env, "getFile", { file_id: fileId }, fetchFn);
  const res = await fetchFn(`https://api.telegram.org/file/bot${env.TELEGRAM_TOKEN}/${file_path}`, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Telegram arquivo ${res.status}`);
  return Buffer.from(await res.arrayBuffer()).toString("base64");
}

/* O que interessa de um update: { tipo: "toque", ... } ou { tipo: "ia", msg } (mensagem no tópico
   da IA, no formato da assistente). Update de outro chat ou de bot é ignorado. */
function lerUpdate(env, u) {
  const doGrupo = chat => String(chat?.id) === String(env.TELEGRAM_CHAT);
  if (u?.callback_query) {
    const q = u.callback_query;
    if (!doGrupo(q.message?.chat)) return null;
    return { tipo: "toque", id: q.id, dados: String(q.data || ""), de: q.from, mensagem: q.message };
  }
  const m = u?.message;
  if (!m || !doGrupo(m.chat) || m.from?.is_bot) return null;
  const ia = topicos(env).ia;
  if (!ia || m.message_thread_id !== ia) return null;
  const voz = m.voice || m.audio;
  return {
    tipo: "ia",
    msg: {
      id: `tg-${m.chat.id}-${m.message_id}`,
      // Uma conversa só para o tópico: qualquer um da equipe pode confirmar o que a IA propôs.
      de: "telegram",
      nome: quemE(m.from),
      tipo: m.text ? "text" : voz ? "audio" : "outro",
      texto: m.text || "",
      ...(voz ? { midia: voz.file_id } : {})
    }
  };
}

/* A assistente no tópico IA. Quem está no grupo é da equipe, então não passa pela lista de números. */
const canalTelegram = (env, fetchFn) => ({
  confiavel: true,
  baixarAudio: msg => baixarArquivo(env, msg.midia, fetchFn),
  texto: (_, t) => enviar(env, "ia", t, null, fetchFn),
  botoes: (_, t, b) => enviar(env, "ia", t, b.map(x => ({ ...x, id: `ia:${x.id}` })), fetchFn)
});

export { telegramLigado, topicos, enviar, fecharMensagem, responderToque, quemE, lerUpdate, canalTelegram, chamar };
