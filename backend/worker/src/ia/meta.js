/* WhatsApp Cloud API (Meta): número dedicado da assistente. Diferente da Evolution (que fala com
   clientes pelo número da loja), aqui a Meta chama o Worker direto — sem PC nem túnel.
   Sem META_TOKEN, META_PHONE_ID, META_APP_SECRET e META_VERIFY, fica desligado. */

const metaLigado = env => !!(env.META_TOKEN && env.META_PHONE_ID && env.META_APP_SECRET && env.META_VERIFY);

/* GET de verificação que a Meta faz ao cadastrar o webhook. */
function verificarWebhook(url, env) {
  const p = url.searchParams;
  if (p.get("hub.mode") === "subscribe" && env.META_VERIFY && p.get("hub.verify_token") === env.META_VERIFY) {
    return new Response(p.get("hub.challenge") || "", { status: 200 });
  }
  return new Response(null, { status: 403 });
}

/* X-Hub-Signature-256 = "sha256=" + HMAC-SHA256(corpo cru, app secret). Sem isso qualquer um
   poderia fingir ser o dono no webhook. */
async function assinaturaValida(corpo, cabecalho, segredo) {
  const recebida = String(cabecalho || "").replace(/^sha256=/, "");
  if (!recebida || !segredo) return false;
  const chave = await crypto.subtle.importKey("raw", new TextEncoder().encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const assinatura = await crypto.subtle.sign("HMAC", chave, new TextEncoder().encode(corpo));
  const esperada = [...new Uint8Array(assinatura)].map(b => b.toString(16).padStart(2, "0")).join("");
  if (esperada.length !== recebida.length) return false;
  let dif = 0;
  for (let i = 0; i < esperada.length; i++) dif |= esperada.charCodeAt(i) ^ recebida.charCodeAt(i);
  return dif === 0;
}

/* Mensagens recebidas no formato que a assistente usa: { id, de, tipo, texto?, botao? }. */
function mensagensDe(corpo) {
  const saida = [];
  for (const entry of corpo?.entry || []) {
    for (const change of entry.changes || []) {
      for (const m of change.value?.messages || []) {
        const arquivo = m.type === "image" || (m.type === "document" && /^(image\/|application\/pdf)/.test(m.document?.mime_type || "")) ? m[m.type] : null;
        saida.push({
          id: m.id,
          de: m.from,
          tipo: arquivo ? "imagem" : m.type,
          texto: m.type === "text" ? String(m.text?.body || "") : arquivo ? String(arquivo.caption || "") : undefined,
          midia: m.type === "audio" ? m.audio?.id : arquivo ? arquivo.id : undefined,
          mime: arquivo ? arquivo.mime_type : undefined,
          botao: m.type === "interactive" ? m.interactive?.button_reply?.id : m.type === "button" ? m.button?.payload : undefined
        });
      }
    }
  }
  return saida;
}

async function chamar(env, corpo, fetchFn = fetch) {
  const versao = env.META_VERSAO || "v23.0";
  const res = await fetchFn(`https://graph.facebook.com/${versao}/${env.META_PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.META_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", ...corpo }),
    signal: AbortSignal.timeout(10000)
  });
  if (!res.ok) throw new Error(`Meta ${res.status}: ${(await res.text().catch(() => "")).slice(0, 300)}`);
  return res.json().catch(() => ({}));
}

// O WhatsApp corta texto acima de 4096 caracteres (1024 no corpo de mensagem com botões).
const cortar = (s, max) => (s.length > max ? s.slice(0, max - 1) + "…" : s);

const enviarTexto = (env, para, texto, fetchFn) =>
  chamar(env, { to: para, type: "text", text: { body: cortar(texto, 4096), preview_url: false } }, fetchFn);

/* Até 3 botões; título de cada um com no máximo 20 caracteres. */
const enviarBotoes = (env, para, texto, botoes, fetchFn) =>
  chamar(env, {
    to: para, type: "interactive",
    interactive: {
      type: "button",
      body: { text: cortar(texto, 1024) },
      action: { buttons: botoes.map(b => ({ type: "reply", reply: { id: b.id, title: cortar(b.titulo, 20) } })) }
    }
  }, fetchFn);

/* "Visto" + "digitando…" enquanto a assistente pensa. Falhar aqui não importa. */
const marcarLida = (env, mensagemId, fetchFn) =>
  chamar(env, { status: "read", message_id: mensagemId, typing_indicator: { type: "text" } }, fetchFn).catch(() => {});

/* Mídia na Meta: o id leva a um link temporário, que também pede o token. */
async function baixarMidia(env, mediaId, fetchFn = fetch) {
  const versao = env.META_VERSAO || "v23.0";
  const auth = { Authorization: `Bearer ${env.META_TOKEN}` };
  const info = await fetchFn(`https://graph.facebook.com/${versao}/${mediaId}`, { headers: auth, signal: AbortSignal.timeout(10000) });
  if (!info.ok) throw new Error(`Meta mídia ${info.status}`);
  const { url } = await info.json();
  const arq = await fetchFn(url, { headers: auth, signal: AbortSignal.timeout(15000) });
  if (!arq.ok) throw new Error(`Meta download ${arq.status}`);
  return Buffer.from(await arq.arrayBuffer()).toString("base64");
}

const canalMeta = (env, fetchFn) => ({
  baixarAudio: msg => baixarMidia(env, msg.midia, fetchFn),
  baixarMidia: msg => baixarMidia(env, msg.midia, fetchFn),
  texto: (numero, t) => enviarTexto(env, numero, t, fetchFn),
  botoes: (numero, t, b) => enviarBotoes(env, numero, t, b, fetchFn),
  lida: msg => marcarLida(env, msg.id, fetchFn)
});

export { canalMeta, metaLigado, verificarWebhook, assinaturaValida, mensagensDe, enviarTexto, enviarBotoes, marcarLida };
