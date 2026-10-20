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
// Números com quem a Sofia nunca fala: usuário e dona (fixos aqui) e a lista de bloqueio
// (robôs de outras empresas), em sis_ia/sofia-bloqueio { numeros: [...] }, que muda sem deploy.
// Compara os 8 últimos dígitos, porque o GPTMaker às vezes guarda o número sem o 9.
const EQUIPE = ["99540665", "97457788"];
const fim8 = tel => String(tel).replace(/\D/g, "").slice(-8);
async function calados(db) {
  const snap = await db.collection("sis_ia").doc("sofia-bloqueio").get().catch(() => null);
  const lista = snap?.exists ? snap.data().numeros || [] : [];
  return new Set([...EQUIPE, ...lista.map(fim8)]);
}
// Trava de repetição: mais que isso de respostas da Sofia em 10 min é robô conversando com robô.
const LOOP_RESPOSTAS = 20;
const LOOP_JANELA = 10 * 60 * 1000;
const telDoChat = c => String(c.id).slice(String(c.id).indexOf("-") + 1);

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
  const calar = await calados(db);
  for (const c of (Array.isArray(chats) ? chats : []).filter(c => c.humanTalk && !c.finished && !c.isGroup)) {
    const msgs = await gpt(env, "GET", `/chat/${encodeURIComponent(c.id)}/messages?pageSize=50`, fetchFn);
    const assumiu = Math.max(0, ...(Array.isArray(msgs) ? msgs : [])
      .filter(m => m.conversationNotificationType === "START_INTERACTION_HUMAN" || (m.userId && m.role !== "system"))
      .map(m => Number(m.time) || 0));
    const tel = telDoChat(c);
    if (calar.has(fim8(tel))) continue;
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

/* Passa para humano (a Sofia fica quieta) a conversa:
   - da equipe ou da lista de bloqueio, antes de a Sofia responder;
   - em que a Sofia já mandou LOOP_RESPOSTAS respostas nos últimos 10 min (robô do outro lado),
     com aviso no Telegram para a equipe olhar e, se for robô mesmo, pôr na lista de bloqueio.
   Chamada pelo webhook do GPTMaker a cada mensagem (a Sofia espera 10 s agrupando, dá tempo) e
   pelo cron, como rede de segurança. Não depende do formato do webhook. */
async function segurarConversas(env, db, { agora = Date.now(), fetchFn = fetch, avisar = async () => {} } = {}) {
  if (!env.GPTMAKER_TOKEN || !env.GPTMAKER_WORKSPACE) return [];
  const chats = await gpt(env, "GET", `/workspace/${env.GPTMAKER_WORKSPACE}/chats?pageSize=30`, fetchFn);
  const calar = await calados(db);
  const seguradas = [];
  for (const c of (Array.isArray(chats) ? chats : []).filter(c => !c.humanTalk && !c.isGroup)) {
    const tel = telDoChat(c);
    if (!calar.has(fim8(tel))) {
      if (agora - (Number(c.time) || 0) > LOOP_JANELA) continue;
      const msgs = await gpt(env, "GET", `/chat/${encodeURIComponent(c.id)}/messages?pageSize=50`, fetchFn);
      const respostas = (Array.isArray(msgs) ? msgs : []).filter(m => m.role === "assistant" && agora - (Number(m.time) || 0) <= LOOP_JANELA).length;
      if (respostas < LOOP_RESPOSTAS) continue;
      await gpt(env, "PUT", `/chat/${encodeURIComponent(c.id)}/start-human`, fetchFn);
      await avisar(`🤖 A Sofia parou de responder ${c.name || "um contato"} (${tel}): ${respostas} respostas em 10 min, parece robô. Se for, peça para pôr o número na lista de bloqueio; se for cliente, mande #sofia na conversa.`)
        .catch(e => console.error(JSON.stringify({ msg: "aviso de robô falhou", erro: String(e) })));
      seguradas.push(tel);
      continue;
    }
    await gpt(env, "PUT", `/chat/${encodeURIComponent(c.id)}/start-human`, fetchFn);
    seguradas.push(tel);
  }
  if (seguradas.length) console.log(JSON.stringify({ msg: "conversa passada para humano (equipe, bloqueio ou robô)", telefones: seguradas }));
  return seguradas;
}

export { anotarNossaMensagem, telefonesDaNossaMensagem, voltarParaSofia, segurarConversas };
