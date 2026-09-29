/* Alexa na cozinha. Duas partes:
   1. Skill personalizada (modelo em backend/alexa/modelo-pt-BR.json), que a Amazon chama em
      POST /webhook/alexa:
        "Alexa, abre a cozinha"                  → quantos pedidos tem na fila de hoje
        "o que tem pra fazer?"                   → lê a fila (Em produção, ainda não feitos, de hoje e atrasados)
        "o pedido da Maria está pronto" / "o 3012 está feito" → pergunta "confirma?" e, no sim, marcarFeito
      Só vale requisição assinada pela Amazon para a skill ALEXA_SKILL_ID.
   2. Aviso falado sem ninguém pedir (skill não consegue): pelo Voice Monkey, quando um pedido
      entra na fila. Sem VOICEMONKEY_TOKEN e VOICEMONKEY_DEVICE fica desligado. */
import { importX509 } from "jose";
import { PEDIDOS } from "./pedidos.js";
import { hojeSP } from "./lembretes.js";

const alexaLigada = env => !!env.ALEXA_SKILL_ID;
const anuncioLigado = env => !!(env.VOICEMONKEY_TOKEN && env.VOICEMONKEY_DEVICE);

// ── Conferir que quem chamou foi a Amazon ──
/* Regras da Amazon: certificado baixado só de https://s3.amazonaws.com/echo.api/…, emitido para
   echo-api.amazon.com, assinatura RSA-SHA256 do corpo e timestamp com no máximo 150 s de diferença. */
function urlDoCertificadoOk(u) {
  let url;
  try { url = new URL(u); } catch { return false; }
  return url.protocol === "https:" && url.hostname.toLowerCase() === "s3.amazonaws.com"
    && (url.port === "" || url.port === "443") && url.pathname.startsWith("/echo.api/");
}

const CHAVES = new Map(); // url do certificado → chave pública (o Worker reaproveita entre chamadas)
const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

async function chaveDaAmazon(urlCert, fetchFn) {
  if (CHAVES.has(urlCert)) return CHAVES.get(urlCert);
  const res = await fetchFn(urlCert, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`certificado da Alexa ${res.status}`);
  const pem = (await res.text()).match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/)?.[0];
  if (!pem) throw new Error("certificado da Alexa vazio");
  const der = new TextDecoder("latin1").decode(b64(pem.replace(/-----[A-Z ]+-----|\s/g, "")));
  if (!der.includes("echo-api.amazon.com")) throw new Error("certificado não é da Alexa");
  const chave = await importX509(pem, "RS256");
  CHAVES.set(urlCert, chave);
  return chave;
}

async function requisicaoValida({ corpo, dados, urlCert, assinatura, env, agora = Date.now(), fetchFn = fetch }) {
  if (!urlCert || !assinatura || !urlDoCertificadoOk(urlCert)) return false;
  const quando = Date.parse(dados?.request?.timestamp || "");
  if (!(Math.abs(agora - quando) <= 150e3)) return false;
  const skill = dados?.session?.application?.applicationId || dados?.context?.System?.application?.applicationId;
  if (skill !== env.ALEXA_SKILL_ID) return false;
  try {
    const chave = await chaveDaAmazon(urlCert, fetchFn);
    return await crypto.subtle.verify("RSASSA-PKCS1-v1_5", chave, b64(assinatura), new TextEncoder().encode(corpo));
  } catch (e) {
    console.error(JSON.stringify({ msg: "Alexa: assinatura não conferiu", erro: String(e) }));
    return false;
  }
}

// ── A fila e como ela é falada ──
async function filaDeHoje(db, agora = Date.now()) {
  const hoje = hojeSP(agora);
  return (await db.collection(PEDIDOS).consultar([["status", "==", "Em produção"]]))
    .filter(p => p.cozinha !== "feito" && (!p.entrega?.data || p.entrega.data <= hoje))
    .sort((a, b) => `${a.entrega?.data} ${a.entrega?.hora}`.localeCompare(`${b.entrega?.data} ${b.entrega?.hora}`));
}

const numero = id => String(id).replace(/^PED-/, "");
const horaFalada = h => {
  const [hh, mm] = String(h || "").split(":").map(Number);
  if (!Number.isFinite(hh)) return "";
  return mm ? `às ${hh} e ${mm}` : hh === 1 ? "à uma hora" : `às ${hh} horas`;
};
/* A cozinha só quer as quantidades: "100 salgados, 100 doces e 1 bolo com topper". Vale a
   categoria do produto; pedido antigo sem categoria cai no nome. Outros itens vão pelo nome. */
const SALGADO = /salgad|coxinh|kibe|quibe|risol|pastel|esfi|empad|enroladinh|bolinha|croquete|mini ?pizza|salsich|p[aã]o de queijo/;
const DOCE = /doce|brigadeir|beijinh|cajuzinh|bombo|trufa|casadinh|bicho de p|surpresa de uva|olho de sogra|palha italiana/;
const BOLO = /bolo|torta/;
const semAcentoMin = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
const juntar = partes => partes.length <= 1 ? partes.join("") : `${partes.slice(0, -1).join(", ")} e ${partes.at(-1)}`;

function itensFalados(p) {
  let salgados = 0, doces = 0, bolosCom = 0, bolosSem = 0;
  const outros = [];
  for (const i of p.itens || []) {
    const qtd = Number(i.qtd) || 0;
    const cat = semAcentoMin(i.categoria), nome = semAcentoMin(i.nome);
    const tipo = /pacote/.test(cat) ? null
      : BOLO.test(cat) || (!cat && BOLO.test(nome)) ? "bolo"
      : SALGADO.test(cat) || (!cat && SALGADO.test(nome)) ? "salgado"
      : DOCE.test(cat) || (!cat && DOCE.test(nome)) ? "doce" : null;
    if (tipo === "salgado") salgados += qtd;
    else if (tipo === "doce") doces += qtd;
    else if (tipo === "bolo") i.topo ? (bolosCom += qtd) : (bolosSem += qtd);
    else outros.push(`${qtd} ${i.nome}`);
  }
  return juntar([
    salgados ? plural(salgados, "salgado", "salgados") : "",
    doces ? plural(doces, "doce", "doces") : "",
    bolosCom ? `${plural(bolosCom, "bolo", "bolos")} com topper` : "",
    bolosSem ? `${plural(bolosSem, "bolo", "bolos")} sem topper` : "",
    ...outros
  ].filter(Boolean));
}
const primeiroNome = p => String(p.cliente?.nome || "").trim().split(/\s+/)[0] || "sem nome";

/* "Pedido de Fernanda, às 14 horas: 100 salgados e 1 bolo com topper." */
function pedidoFalado(p, hoje) {
  const e = p.entrega || {};
  const quando = [e.data && e.data < hoje ? "atrasado" : "", horaFalada(e.hora)].filter(Boolean).join(", ");
  return `Pedido de ${primeiroNome(p)}${quando ? `, ${quando}` : ""}: ${itensFalados(p)}.`;
}

/* Lembrete de 15 em 15 minutos na última hora antes do horário (cron a cada 15 min). Pedidos do
   mesmo horário saem juntos. Só o que ainda está na fila: marcado como feito, para de avisar. */
const minutosAte = (p, agora) => {
  const e = p.entrega || {};
  if (!e.data || !/^\d{2}:\d{2}$/.test(e.hora || "")) return null;
  return Math.round((Date.parse(`${e.data}T${e.hora}:00-03:00`) - agora) / 60e3);
};

function lembreteFalado(fila, agora) {
  const porHora = new Map();
  for (const p of fila) {
    const m = minutosAte(p, agora);
    if (m === null || m < 5 || m > 62) continue; // 60, 45, 30 e 15 minutos antes (com folga do cron)
    const h = p.entrega.hora;
    if (!porHora.has(h)) porHora.set(h, { minutos: m, pedidos: [] });
    porHora.get(h).pedidos.push(p);
  }
  if (!porHora.size) return null;
  return [...porHora.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([hora, { minutos, pedidos }]) => {
    const falta = `Daqui a ${Math.round(minutos / 5) * 5} minutos`;
    if (pedidos.length === 1) return `${falta}: pedido de ${primeiroNome(pedidos[0])}, ${horaFalada(hora)}: ${itensFalados(pedidos[0])}.`;
    return `${falta}, ${horaFalada(hora)}, ${pedidos.length} pedidos: ${pedidos.map(p => `de ${primeiroNome(p)}, ${itensFalados(p)}`).join("; ")}.`;
  }).join(" ");
}

async function lembrarProximos(env, db, { agora = Date.now(), fetchFn } = {}) {
  if (!anuncioLigado(env)) return;
  const texto = lembreteFalado(await filaDeHoje(db, agora), agora);
  if (texto) await anunciar(env, texto, fetchFn);
}

const LIDOS_POR_VEZ = 5;
function filaFalada(fila, hoje) {
  if (!fila.length) return "A fila de hoje está vazia. Nada para fazer agora.";
  const abre = fila.length === 1 ? "Tem 1 pedido na fila." : `Tem ${fila.length} pedidos na fila.`;
  const resto = fila.length > LIDOS_POR_VEZ ? ` E mais ${fila.length - LIDOS_POR_VEZ}; veja no tablet.` : "";
  return `${abre} ${fila.slice(0, LIDOS_POR_VEZ).map(p => pedidoFalado(p, hoje)).join(" ")}${resto}`;
}

/* "Maria", "maria clara", "3012" ou "12" (fim do número) → os pedidos da fila que batem. */
const semAcento = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
function acharNaFila(fila, { numero: n, cliente }) {
  if (n) {
    const exato = fila.filter(p => numero(p.id) === String(n));
    return exato.length ? exato : fila.filter(p => numero(p.id).endsWith(String(n)));
  }
  const nome = semAcento(cliente);
  if (!nome) return [];
  return fila.filter(p => {
    const completo = semAcento(p.cliente?.nome);
    return completo === nome || completo.split(/\s+/)[0] === nome || completo.startsWith(nome + " ");
  });
}

// ── Respostas no formato da Alexa ──
const resposta = (texto, { continuar = true, sessao = {}, cartao } = {}) => ({
  version: "1.0",
  sessionAttributes: sessao,
  response: {
    outputSpeech: { type: "PlainText", text: texto },
    ...(continuar ? { reprompt: { outputSpeech: { type: "PlainText", text: "Pode falar: o que tem pra fazer, ou, o pedido da Maria está pronto." } } } : {}),
    ...(cartao ? { card: { type: "Simple", title: "Cozinha D'Luh", content: cartao } } : {}),
    shouldEndSession: !continuar
  }
});

const valorDoSlot = (intent, nome) => {
  const s = intent?.slots?.[nome];
  const resolvido = s?.slotValue?.resolutions?.resolutionsPerAuthority?.[0]?.values?.[0]?.value?.name;
  const v = resolvido || s?.value;
  return v && v !== "?" ? String(v) : "";
};

/* Uma requisição da Alexa → a resposta. `marcarFeito(pedidoId)` é a mesma ação da tela da Cozinha. */
async function responder(dados, { db, marcarFeito, agora = Date.now() }) {
  const req = dados?.request || {};
  const sessao = dados?.session?.attributes || {};
  const hoje = hojeSP(agora);

  if (req.type === "SessionEndedRequest") return { version: "1.0", response: {} };
  if (req.type === "LaunchRequest") {
    const fila = await filaDeHoje(db, agora);
    const qtd = fila.length === 0 ? "A fila de hoje está vazia." : fila.length === 1 ? "Tem 1 pedido na fila." : `Tem ${fila.length} pedidos na fila.`;
    return resposta(`Cozinha D'Luh. ${qtd} Quer que eu leia, ou marque algum como feito?`);
  }
  if (req.type !== "IntentRequest") return resposta("Não entendi.", { continuar: false });

  const intent = req.intent || {};
  switch (intent.name) {
    case "FilaIntent": {
      const fila = await filaDeHoje(db, agora);
      const texto = filaFalada(fila, hoje);
      return resposta(texto, { cartao: texto });
    }
    case "FeitoIntent": {
      const fila = await filaDeHoje(db, agora);
      const achados = acharNaFila(fila, { numero: valorDoSlot(intent, "numero"), cliente: valorDoSlot(intent, "cliente") });
      if (!achados.length) {
        return resposta(fila.length ? "Não achei esse pedido na fila de hoje. Pode falar o número do pedido?" : "A fila de hoje está vazia.");
      }
      if (achados.length > 1) {
        return resposta(`Achei ${achados.length}: ${achados.map(p => `o ${numero(p.id)}, ${itensFalados(p)}`).join("; ")}. Qual é o número?`);
      }
      const p = achados[0];
      return resposta(`Marcar como feito o pedido de ${primeiroNome(p)}${p.entrega?.hora ? `, ${horaFalada(p.entrega.hora)}` : ""}?`, { sessao: { pendente: p.id, nome: primeiroNome(p) } });
    }
    case "AMAZON.YesIntent": {
      if (!sessao.pendente) return resposta("Sim para quê? Fale qual pedido ficou pronto.");
      try {
        const r = await marcarFeito(sessao.pendente);
        const de = sessao.nome ? `de ${sessao.nome}` : numero(sessao.pendente);
        return resposta(r?.mudou === false ? `O pedido ${de} já estava marcado como feito.` : `Pronto, o pedido ${de} saiu da fila.`);
      } catch (e) {
        return resposta(e?.codigo === "failed-precondition" ? `Esse pedido não está mais em produção.` : "Não deu para marcar agora. Tente pelo tablet.");
      }
    }
    case "AMAZON.NoIntent":
      return resposta(sessao.pendente ? "Tá bom, não marquei." : "Tá bom.");
    case "AMAZON.HelpIntent":
      return resposta("Você pode perguntar: o que tem pra fazer? Ou dizer: o pedido da Maria está pronto, ou, o pedido 3012 está feito.");
    case "AMAZON.StopIntent":
    case "AMAZON.CancelIntent":
      return resposta("Até mais.", { continuar: false });
    default:
      return resposta("Não entendi. Pode falar: o que tem pra fazer, ou, o pedido da Maria está pronto.");
  }
}

// ── Aviso falado (Voice Monkey) ──
async function anunciar(env, texto, fetchFn = fetch) {
  if (!anuncioLigado(env)) return;
  const res = await fetchFn("https://api-v3.voicemonkey.io/announce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: env.VOICEMONKEY_TOKEN, device: env.VOICEMONKEY_DEVICE, speech: texto }),
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) throw new Error(`Voice Monkey ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
}

/* Pedido entrou em produção: a Alexa da cozinha fala. Pedido para outro dia diz o dia. */
async function avisarNovoNaFila(env, db, pedidoId, { agora = Date.now(), fetchFn } = {}) {
  if (!anuncioLigado(env)) return;
  const snap = await db.collection(PEDIDOS).doc(String(pedidoId)).get();
  if (!snap.exists) return;
  const p = snap.data();
  const e = p.entrega || {};
  const dia = !e.data || e.data <= hojeSP(agora) ? "para hoje" : `para o dia ${Number(e.data.slice(8, 10))}`;
  return anunciar(env, `Novo pedido na cozinha: de ${primeiroNome(p)}, ${dia}${e.hora ? ` ${horaFalada(e.hora)}` : ""}: ${itensFalados(p)}.`, fetchFn);
}

export { alexaLigada, anuncioLigado, urlDoCertificadoOk, requisicaoValida, filaDeHoje, filaFalada, acharNaFila, responder, anunciar, avisarNovoNaFila, itensFalados, lembreteFalado, lembrarProximos };
