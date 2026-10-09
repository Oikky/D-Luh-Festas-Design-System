/* Cliente que quer visitar o salão (D' Roma Festas) ou falar de evento com a equipe:
     POST /sofia/atendimento/<SOFIA_TOKEN>?telefone={{contact_phone}}
   A Intenção do GPTMaker manda campos soltos em texto. Grava em sis_atendimentos (o admin mostra
   na tela Atendimentos) e avisa a equipe no Telegram e a dona no WhatsApp. O GPTMaker, pela
   transferência da Intenção, já põe a conversa em espera para a equipe. */
import { ErroDominio } from "./dominio.js";
import { opcional } from "./sofia.js";
import { enviarTexto, whatsappLigado } from "./whatsapp.js";
import { enviar as enviarTelegram, telegramLigado } from "./telegram.js";

const ATENDIMENTOS = "sis_atendimentos";
const TIPOS = { visita: "Visita ao salão", evento: "Evento no salão", outro: "Falar com a equipe" };

const tipoDe = t => {
  const s = String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  return /visit/.test(s) ? "visita" : /event|festa|alug|orcament|reserv/.test(s) ? "evento" : "outro";
};

/* dados: { telefone, tipo, nome, data, pessoas, obs } — tudo texto. */
async function registrarAtendimento(db, dados, agora = new Date()) {
  const telefone = String(dados?.telefone || "").replace(/\D/g, "");
  if (telefone.length < 10) throw new ErroDominio("invalid-argument", "Falta o telefone do cliente");
  const a = {
    tipo: tipoDe(dados.tipo),
    nome: opcional(dados.nome, 80),
    telefone,
    data: opcional(dados.data, 80),
    pessoas: opcional(dados.pessoas, 40),
    obs: opcional(dados.obs, 500),
    status: "novo",
    criadoEm: agora
  };
  const ref = await db.collection(ATENDIMENTOS).add(a);
  return { id: ref.id, ...a };
}

function textoAviso(a) {
  return [
    `📍 ${TIPOS[a.tipo]} — pela Sofia`,
    `${a.nome || "Cliente sem nome"} · ${a.telefone}`,
    ...(a.data ? [`Quando: ${a.data}`] : []),
    ...(a.pessoas ? [`Pessoas: ${a.pessoas}`] : []),
    ...(a.obs ? [`Obs.: ${a.obs}`] : []),
    "A conversa ficou em espera no GPTMaker. Responda pelo WhatsApp da loja; a Sofia volta com #sofia."
  ].join("\n");
}

/* Telegram (tópico Pendentes) e WhatsApp de cada número de WHATSAPP_ATENDIMENTO. Um canal falhar
   não derruba o outro; só dá erro se todos falharem. */
async function avisarAtendimento(env, a) {
  const texto = textoAviso(a);
  const envios = [
    ...(telegramLigado(env) ? [enviarTelegram(env, "pendentes", texto)] : []),
    ...(whatsappLigado(env) ? String(env.WHATSAPP_ATENDIMENTO || "").split(",").map(s => s.trim()).filter(Boolean)
      .map(n => enviarTexto(env, n, texto)) : [])
  ];
  const res = await Promise.allSettled(envios);
  const falhas = res.filter(r => r.status === "rejected");
  falhas.forEach(f => console.error(JSON.stringify({ msg: "aviso de atendimento falhou", erro: String(f.reason) })));
  if (falhas.length && falhas.length === res.length) throw falhas[0].reason;
  return res.length - falhas.length;
}

/* Admin: marca como resolvido (ou volta para novo). */
async function marcarAtendimento(db, { id, resolvido }, por, agora = new Date()) {
  const ref = db.collection(ATENDIMENTOS).doc(String(id || ""));
  const snap = await ref.get();
  if (!snap.exists) throw new ErroDominio("not-found", "Atendimento não existe");
  await ref.set(resolvido ? { status: "resolvido", resolvidoPor: por, resolvidoEm: agora } : { status: "novo", resolvidoPor: null, resolvidoEm: null }, { merge: true });
  return { id: snap.id, status: resolvido ? "resolvido" : "novo" };
}

export { ATENDIMENTOS, registrarAtendimento, avisarAtendimento, marcarAtendimento, textoAviso, tipoDe };
