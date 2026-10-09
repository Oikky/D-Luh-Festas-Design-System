/* A Sofia volta sozinha para a conversa depois de 2h sem a equipe falar nela.
   No canal do GPTMaker, mensagem da dona pelo celular da loja faz a conversa passar para
   "atendimento humano" (a Sofia fica quieta). Só que o GPTMaker não guarda essas mensagens, só a
   hora em que a conversa foi assumida. Então:
   - o webhook da Evolution (mesmo número) anota a hora de cada mensagem que SAI da loja para o
     cliente (anotarNossaMensagem), em sis_ia/humano-<telefone>;
   - o cron de 15 em 15 min (voltarParaSofia) olha as conversas em atendimento humano e, se a
     última fala nossa (essa anotação ou a hora em que assumiu, a mais nova) tem mais de 2h,
     devolve para a Sofia (PUT /chat/<id>/stop-human). Ela responde a próxima mensagem do cliente. */
const API = "https://api.gptmaker.ai/v2";
const ESPERA = 2 * 60 * 60 * 1000;
const docNosso = (db, telefone) => db.collection("sis_ia").doc(`humano-${telefone}`);

/* Mensagem que a loja mandou para um cliente (não grupo/status): o telefone e, em conta nova do
   WhatsApp, também o "…@lid" — o GPTMaker usa um ou outro no fim do id da conversa. */
function telefonesDaNossaMensagem(corpo) {
  if (String(corpo?.event || "").toLowerCase().replace("_", ".") !== "messages.upsert") return [];
  const d = Array.isArray(corpo.data) ? corpo.data[0] : corpo.data;
  const k = d?.key || {};
  if (!k.fromMe) return [];
  return [...new Set([k.remoteJid, k.remoteJidAlt]
    .map(j => String(j || ""))
    .filter(j => /@s\.whatsapp\.net$/.test(j) || j.endsWith("@lid"))
    .map(j => j.endsWith("@lid") ? j : j.split("@")[0]))];
}

async function anotarNossaMensagem(db, corpo, agora = Date.now()) {
  await Promise.all(telefonesDaNossaMensagem(corpo).map(tel => docNosso(db, tel).set({ ultima: agora })));
}

async function gpt(env, metodo, caminho, fetchFn) {
  const res = await fetchFn(`${API}${caminho}`, {
    method: metodo, headers: { Authorization: `Bearer ${env.GPTMAKER_TOKEN}` }, signal: AbortSignal.timeout(15000)
  });
  const corpo = await res.text();
  if (!res.ok) throw new Error(`GPTMaker ${metodo} ${caminho.split("?")[0]} ${res.status}: ${corpo.slice(0, 200)}`);
  try { return JSON.parse(corpo); } catch { return corpo; }
}

async function voltarParaSofia(env, db, { agora = Date.now(), fetchFn = fetch } = {}) {
  if (!env.GPTMAKER_TOKEN || !env.GPTMAKER_WORKSPACE) return [];
  const chats = await gpt(env, "GET", `/workspace/${env.GPTMAKER_WORKSPACE}/chats?pageSize=100`, fetchFn);
  const voltaram = [];
  for (const c of (Array.isArray(chats) ? chats : []).filter(c => c.humanTalk && !c.finished && !c.isGroup)) {
    const msgs = await gpt(env, "GET", `/chat/${encodeURIComponent(c.id)}/messages?pageSize=50`, fetchFn);
    const assumiu = Math.max(0, ...(Array.isArray(msgs) ? msgs : [])
      .filter(m => m.conversationNotificationType === "START_INTERACTION_HUMAN" || (m.userId && m.role !== "system"))
      .map(m => Number(m.time) || 0));
    const tel = String(c.id).slice(String(c.id).indexOf("-") + 1);
    const snap = await docNosso(db, tel).get();
    const ultima = Math.max(assumiu, snap.exists ? Number(snap.data().ultima) || 0 : 0);
    // Sem nenhuma hora conhecida não mexe: melhor a Sofia calada do que atropelar a dona. Inclui a
    // conversa que a própria Sofia passou para a equipe (TRANSFER_QUEUE): fica esperando a equipe.
    if (!ultima || agora - ultima < ESPERA) continue;
    await gpt(env, "PUT", `/chat/${encodeURIComponent(c.id)}/stop-human`, fetchFn);
    voltaram.push(tel);
  }
  if (voltaram.length) console.log(JSON.stringify({ msg: "Sofia voltou depois de 2h sem a equipe", telefones: voltaram }));
  return voltaram;
}

export { anotarNossaMensagem, telefonesDaNossaMensagem, voltarParaSofia };
