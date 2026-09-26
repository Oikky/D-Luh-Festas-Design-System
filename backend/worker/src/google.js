/* Google Drive (fotos de produto, imagem do topo, backup) e Google Agenda, com uma conta Google da
   loja autorizada uma vez (OAuth com refresh token — ver README "Google Drive e Agenda").
   Sem os três segredos GOOGLE_*, tudo aqui fica desligado: `googleLigado(env)` é falso. */
import { ErroDominio } from "./dominio.js";

const googleLigado = env => !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REFRESH_TOKEN);

let acesso = null; // cache do access token (1 h) entre requisições

async function tokenGoogle(env, fetchFn = fetch) {
  if (acesso && acesso.expira > Date.now() + 60_000) return acesso.valor;
  const res = await fetchFn("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN, grant_type: "refresh_token"
    })
  });
  const r = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Google recusou o login: ${r.error || res.status}`);
  acesso = { valor: r.access_token, expira: Date.now() + Number(r.expires_in) * 1000 };
  return acesso.valor;
}

async function google(env, metodo, url, corpo, cabecalhos = {}) {
  const res = await fetch(url, {
    method: metodo,
    headers: { Authorization: `Bearer ${await tokenGoogle(env)}`, ...(corpo && !(corpo instanceof Uint8Array) && typeof corpo !== "string" ? { "Content-Type": "application/json" } : {}), ...cabecalhos },
    ...(corpo ? { body: corpo instanceof Uint8Array || typeof corpo === "string" ? corpo : JSON.stringify(corpo) } : {})
  });
  if (res.status === 204) return null;
  const r = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(`Google ${res.status}: ${r.error?.message || ""}`), { status: res.status });
  return r;
}

// ── Drive ──

/* Sobe um arquivo na pasta GOOGLE_DRIVE_PASTA. `publico` deixa qualquer um com o link ver
   (fotos do site); o backup não é público. */
async function enviarArquivo(env, { nome, mime, bytes, publico }) {
  const limite = "dluh" + crypto.randomUUID().replace(/-/g, "");
  const meta = JSON.stringify({ name: nome, ...(env.GOOGLE_DRIVE_PASTA ? { parents: [env.GOOGLE_DRIVE_PASTA] } : {}) });
  const enc = new TextEncoder();
  const partes = [
    enc.encode(`--${limite}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${limite}\r\nContent-Type: ${mime}\r\n\r\n`),
    bytes,
    enc.encode(`\r\n--${limite}--`)
  ];
  const corpo = new Uint8Array(partes.reduce((s, p) => s + p.length, 0));
  partes.reduce((pos, p) => (corpo.set(p, pos), pos + p.length), 0);
  const { id } = await google(env, "POST", "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", corpo,
    { "Content-Type": `multipart/related; boundary=${limite}` });
  if (publico) await google(env, "POST", `https://www.googleapis.com/drive/v3/files/${id}/permissions`, { role: "reader", type: "anyone" });
  return { id, url: `https://lh3.googleusercontent.com/d/${id}` };
}

const TIPOS_IMAGEM = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_IMAGEM = 5 * 1024 * 1024;

/* A tela manda a imagem como data URL (já reduzida no aparelho). */
async function enviarImagem(env, { dataUrl, prefixo }) {
  if (!googleLigado(env)) throw new ErroDominio("failed-precondition", "O envio de imagens ainda não foi configurado");
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ""));
  if (!m) throw new ErroDominio("invalid-argument", "Envie uma imagem JPG, PNG ou WebP");
  const bin = atob(m[2]);
  if (bin.length > MAX_IMAGEM) throw new ErroDominio("invalid-argument", "Imagem maior que 5 MB");
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  const nome = `${prefixo}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.${TIPOS_IMAGEM[m[1]]}`;
  return enviarArquivo(env, { nome, mime: m[1], bytes, publico: true });
}

// ── Agenda ──

const agendaId = env => encodeURIComponent(env.GOOGLE_AGENDA_ID || "primary");
/* Id fixo por pedido (a Agenda só aceita a-v e 0-9), para atualizar em vez de duplicar. */
const idEvento = pedidoId => "dluh" + String(pedidoId).toLowerCase().replace(/[^a-v0-9]/g, "");

async function salvarEvento(env, pedidoId, evento) {
  const base = `https://www.googleapis.com/calendar/v3/calendars/${agendaId(env)}/events`;
  const id = idEvento(pedidoId);
  try {
    return await google(env, "PUT", `${base}/${id}`, { ...evento, status: "confirmed" });
  } catch (e) {
    if (e.status !== 404) throw e;
    return google(env, "POST", base, { id, ...evento });
  }
}

async function apagarEvento(env, pedidoId) {
  try {
    await google(env, "DELETE", `https://www.googleapis.com/calendar/v3/calendars/${agendaId(env)}/events/${idEvento(pedidoId)}`);
  } catch (e) {
    if (![404, 410].includes(e.status)) throw e;
  }
}

export { googleLigado, tokenGoogle, enviarArquivo, enviarImagem, salvarEvento, apagarEvento, idEvento };
