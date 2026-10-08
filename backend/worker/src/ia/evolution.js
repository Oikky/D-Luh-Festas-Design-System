/* Canal da assistente pelo número da loja (Evolution). A Evolution manda TODOS os eventos da
   instância para /webhook/evolution/<EVOLUTION_WEBHOOK_TOKEN>; a assistente só fica com as
   mensagens (texto, áudio, foto, PDF) dos números de IA_NUMEROS, e o resto segue para EVOLUTION_REPASSE (o destino
   que a Evolution usava antes), se houver. Sem botões aqui: confirma respondendo "sim"/"não". */
import { enviarTexto } from "../whatsapp.js";

/* Baixa o áudio de uma mensagem recebida (o webhook vem sem a mídia). A Evolution procura a
   mensagem no banco dela, e o webhook costuma chegar antes de ela terminar de salvar — por isso
   tenta de novo algumas vezes ("Message not found") antes de desistir. */
async function baixarAudio(env, msg, { fetchFn = fetch, esperas = [1000, 1500, 2000, 2500], limite = 10000 } = {}) {
  const url = `${String(env.EVOLUTION_URL).replace(/\/$/, "")}/chat/getBase64FromMediaMessage/${encodeURIComponent(env.EVOLUTION_INSTANCE)}`;
  for (let tentativa = 0; ; tentativa++) {
    const res = await fetchFn(url, {
      method: "POST",
      headers: { apikey: env.EVOLUTION_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg.bruta || { key: { id: msg.id } }, convertToMp4: false }),
      signal: AbortSignal.timeout(limite)
    });
    if (res.ok) {
      const { base64 } = await res.json();
      if (!base64) throw new Error("Evolution não devolveu a mídia");
      return base64;
    }
    const corpo = await res.text().catch(() => "");
    if (!/not found/i.test(corpo) || tentativa >= esperas.length) throw new Error(`Evolution mídia ${res.status}: ${corpo.slice(0, 200)}`);
    await new Promise(r => setTimeout(r, esperas[tentativa]));
  }
}

/* { id, de, tipo, texto } de um "messages.upsert" que alguém mandou para a loja; null para o resto
   (eventos de conexão, mensagens da própria loja, grupos, status). */
function mensagemEvolution(corpo) {
  if (String(corpo?.event || "").toLowerCase().replace("_", ".") !== "messages.upsert") return null;
  const d = Array.isArray(corpo.data) ? corpo.data[0] : corpo.data;
  const k = d?.key || {};
  const jid = String(k.remoteJid || "");
  if (!k.id || k.fromMe || jid.endsWith("@g.us") || jid === "status@broadcast") return null;
  // Contas novas do WhatsApp chegam como "…@lid"; o número de verdade vem num campo ao lado.
  const comNumero = [k.senderPn, k.remoteJidAlt, jid].find(j => /@s\.whatsapp\.net$/.test(String(j || ""))) || jid;
  const m = d.message || {};
  const doc = m.documentMessage || m.documentWithCaptionMessage?.message?.documentMessage;
  const arquivo = m.imageMessage || (/^(image\/(jpeg|png|webp|gif)|application\/pdf)$/.test(doc?.mimetype || "") ? doc : null);
  const texto = m.conversation || m.extendedTextMessage?.text || "";
  const tipo = texto ? "text" : m.audioMessage ? "audio" : arquivo ? "imagem" : d.messageType || "outro";
  return {
    id: k.id, de: comNumero.split("@")[0], tipo, texto: texto || arquivo?.caption || "",
    ...(tipo === "audio" || tipo === "imagem" ? { bruta: { key: k, message: m } } : {}),
    // Com "Webhook Base64" ligado na Evolution a mídia já vem aqui e não precisa ser buscada pelo túnel.
    ...((tipo === "audio" || tipo === "imagem") && typeof m.base64 === "string" && m.base64 ? { base64: m.base64 } : {}),
    ...(tipo === "imagem" ? { mime: String(arquivo.mimetype || "image/jpeg").split(";")[0] } : {})
  };
}

const canalEvolution = env => ({
  baixarAudio: async msg => msg.base64 || baixarAudio(env, msg),
  // Foto pelo túnel até a Evolution demora mais que áudio.
  baixarMidia: async msg => msg.base64 || baixarAudio(env, msg, { limite: 15000 }),
  texto: (numero, t) => enviarTexto(env, numero, t),
  botoes: (numero, t) => enviarTexto(env, numero, `${t}\n\nResponda *sim* para confirmar ou *não* para cancelar.`)
});

export { mensagemEvolution, canalEvolution, baixarAudio };
