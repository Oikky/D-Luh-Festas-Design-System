/* Mensagens de WhatsApp pela Evolution API (Docker da loja, exposto por um túnel HTTPS).
   Sem EVOLUTION_URL, EVOLUTION_INSTANCE e o segredo EVOLUTION_KEY, fica desligado. */

const whatsappLigado = env => !!(env.EVOLUTION_URL && env.EVOLUTION_KEY && env.EVOLUTION_INSTANCE);

/* Número brasileiro sem DDI ganha o 55. */
const numeroDe = tel => {
  const d = String(tel || "").replace(/\D/g, "");
  return d.length <= 11 ? "55" + d : d;
};

async function enviarTexto(env, telefone, texto, fetchFn = fetch) {
  const url = `${String(env.EVOLUTION_URL).replace(/\/$/, "")}/message/sendText/${encodeURIComponent(env.EVOLUTION_INSTANCE)}`;
  const res = await fetchFn(url, {
    method: "POST",
    headers: { apikey: env.EVOLUTION_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ number: numeroDe(telefone), text: texto })
  });
  if (!res.ok) throw new Error(`Evolution ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
  return true;
}

export { whatsappLigado, enviarTexto, numeroDe };
