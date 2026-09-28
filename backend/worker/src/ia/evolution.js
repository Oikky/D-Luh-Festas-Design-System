/* Canal da assistente pelo número da loja (Evolution). A Evolution manda TODOS os eventos da
   instância para /webhook/evolution/<EVOLUTION_WEBHOOK_TOKEN>; a assistente só fica com as
   mensagens de texto dos números de IA_NUMEROS, e o resto segue para EVOLUTION_REPASSE (o destino
   que a Evolution usava antes), se houver. Sem botões aqui: confirma respondendo "sim"/"não". */
import { enviarTexto } from "../whatsapp.js";

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
  const texto = m.conversation || m.extendedTextMessage?.text || "";
  return { id: k.id, de: comNumero.split("@")[0], tipo: texto ? "text" : d.messageType || "outro", texto };
}

const canalEvolution = env => ({
  texto: (numero, t) => enviarTexto(env, numero, t),
  botoes: (numero, t) => enviarTexto(env, numero, `${t}\n\nResponda *sim* para confirmar ou *não* para cancelar.`)
});

export { mensagemEvolution, canalEvolution };
