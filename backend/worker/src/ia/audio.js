/* Áudio → texto com o Whisper do Workers AI (binding AI no wrangler.jsonc). O texto transcrito
   entra na conversa como se a pessoa tivesse digitado. */

const MODELO_AUDIO = "@cf/openai/whisper-large-v3-turbo";

const audioLigado = env => !!env.AI;

async function transcrever(env, base64) {
  const r = await env.AI.run(MODELO_AUDIO, {
    audio: base64,
    language: "pt",
    vad_filter: true,
    // Ajuda com nomes e termos da confeitaria.
    initial_prompt: "Conversa da confeitaria D'Luh Festas: pedidos, bolos, docinhos, salgados, brigadeiro, recheio, topo, retirada, entrega, Pix, entrada, restante."
  });
  return String(r?.text || "").trim();
}

const paraBase64 = buffer => Buffer.from(buffer).toString("base64");

export { audioLigado, transcrever, paraBase64 };
