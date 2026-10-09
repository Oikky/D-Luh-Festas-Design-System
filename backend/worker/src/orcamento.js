/* Alerta de gasto do Google Cloud (orçamento "Alerta D'Luh 20 reais" da conta 01CF73…). O orçamento
   publica no Pub/Sub várias vezes por dia; a assinatura push chama /webhook/orcamento/<ORCAMENTO_TOKEN>.
   Só avisa quando um limite (10, 18, 20 reais…) foi passado, uma vez por limite por mês: WhatsApp
   do usuário e da dona (IA_NUMEROS) e o grupo do Telegram. */
import { whatsappLigado, enviarTexto } from "./whatsapp.js";
import { telegramLigado, enviar as enviarTelegram } from "./telegram.js";

const AVISADOS = "sis_config/orcamento";
const reais = v => `R$ ${(Number(v) || 0).toFixed(2).replace(".", ",")}`;

/* Corpo do push do Pub/Sub → o JSON do orçamento, ou null se não der para ler. */
function lerAlerta(corpo) {
  try {
    const dados = corpo?.message?.data;
    return dados ? JSON.parse(atob(dados)) : null;
  } catch { return null; }
}

function textoAlerta(a) {
  const pct = Math.round((a.alertThresholdExceeded || 0) * 100);
  return [
    `⚠️ Gasto do Google Cloud (Firebase) passou de ${pct}% do orçamento`,
    `Gasto no mês: ${reais(a.costAmount)} de ${reais(a.budgetAmount)}${a.currencyCode && a.currencyCode !== "BRL" ? ` (${a.currencyCode})` : ""}`,
    "É só aviso: nada foi cortado. Se não esperava esse gasto, peça para conferir o que está lendo o banco."
  ].join("\n");
}

/* Devolve o que fez, para o log e os testes. */
async function tratarAlerta(env, db, corpo, { fetchFn } = {}) {
  const a = lerAlerta(corpo);
  if (!a || !(a.alertThresholdExceeded > 0)) return { avisou: false, motivo: "sem limite passado" };
  const chave = `${a.costIntervalStart || ""}|${a.alertThresholdExceeded}`;
  const ref = db.doc(AVISADOS);
  const snap = await ref.get();
  const ja = (snap.exists ? snap.get("chaves") : null) || [];
  if (ja.includes(chave)) return { avisou: false, motivo: "já avisado" };

  const texto = textoAlerta(a);
  const envios = [];
  if (telegramLigado(env)) envios.push(enviarTelegram(env, null, texto, null, fetchFn));
  if (whatsappLigado(env)) {
    for (const n of String(env.IA_NUMEROS || "").split(",").map(s => s.trim()).filter(Boolean)) envios.push(enviarTexto(env, n, texto, fetchFn));
  }
  const res = await Promise.allSettled(envios);
  res.filter(r => r.status === "rejected").forEach(r => console.error(JSON.stringify({ msg: "aviso de orçamento falhou", erro: String(r.reason) })));
  // Guarda só os 24 últimos (dois anos de limites).
  await ref.set({ chaves: [...ja, chave].slice(-24), atualizadoEm: new Date() }, { merge: true });
  return { avisou: true, enviados: res.filter(r => r.status === "fulfilled").length, chave };
}

export { tratarAlerta, lerAlerta, textoAlerta };
