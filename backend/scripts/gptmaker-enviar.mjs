/* Disparo para cliente pelo WhatsApp da loja PASSANDO PELO GPTMAKER: a mensagem sai pelo canal da
   Sofia e fica na conversa dela, então quando o cliente responder ela sabe do que se trata
   (mandando por fora — Evolution, celular — a Sofia não vê a mensagem).

   Uso (na pasta backend):
     node scripts/gptmaker-enviar.mjs <telefone> "<mensagem>"          → envia
     node scripts/gptmaker-enviar.mjs <telefone> "<mensagem>" --seco   → só mostra o que faria
   Telefone com ou sem 55/9 (ex.: 38998732363). Token: GPTMAKER_TOKEN no backend/.env. */
import fs from "node:fs";

const CANAL = "3FA5AEE7B6A2D0F985F39EBDDD858735"; // "WhatsApp D'Luh Festas" (Sofia)
const API = "https://api.gptmaker.ai/v2";

const args = process.argv.slice(2).filter(a => a !== "--seco");
const seco = process.argv.includes("--seco");
const [telefone, mensagem] = args;
if (!telefone || !mensagem) {
  console.error('Uso: node scripts/gptmaker-enviar.mjs <telefone> "<mensagem>" [--seco]');
  process.exit(1);
}

const env = Object.fromEntries(fs.readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)
  .filter(l => /^\w+=/.test(l)).map(l => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]));
if (!env.GPTMAKER_TOKEN) throw new Error("Falta GPTMAKER_TOKEN no backend/.env");

// 55 + DDD + número (o GPTMaker usa o número do WhatsApp; com o 9 extra ele resolve igual).
let d = String(telefone).replace(/\D/g, "");
if (d.length === 10 || d.length === 11) d = `55${d}`;
if (!/^55\d{10,11}$/.test(d)) throw new Error(`Telefone estranho: ${telefone}`);

if (seco) { console.log(`[seco] enviaria para ${d}:\n${mensagem}`); process.exit(0); }

const r = await fetch(`${API}/channel/${CANAL}/start-conversation`, {
  method: "POST",
  headers: { Authorization: `Bearer ${env.GPTMAKER_TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ phone: d, message: mensagem })
});
const corpo = await r.json().catch(() => ({}));
if (!r.ok || corpo.success === false) {
  console.error(`Falhou (${r.status}):`, JSON.stringify(corpo));
  process.exit(1);
}
console.log(`Enviado para ${d} pelo GPTMaker (fica na conversa da Sofia).`);
