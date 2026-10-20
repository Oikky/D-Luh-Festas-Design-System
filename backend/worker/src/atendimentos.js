/* Tela Atendimentos do admin: cada pedido de visita/evento (da Sofia ou lançado pela equipe) anda
   por um funil até virar festa — novo → conversando → visita → orçamento → fechada → realizada,
   ou perdida em qualquer ponto. A festa (data no salão, convidados, valor), o contrato, as
   encomendas ligadas e as anotações ficam no próprio sis_atendimentos/{id}.
   O dinheiro da festa vira transação de entrada em sis_financeiro com `festaId`: o Financeiro já
   mostra, e a tela soma o que foi pago lendo de lá (uma fonte só). Centavos inteiros, datas AAAA-MM-DD. */
import { FieldValue } from "./firestore.js";
import { ErroDominio, centavos } from "./dominio.js";
import { ATENDIMENTOS } from "./sofia-atendimento.js";
import { FINANCEIRO, validarFinanceiro } from "./financeiro.js";
import { googleLigado, salvarEvento, apagarEvento } from "./google.js";

const ETAPAS = ["novo", "conversando", "visita", "orcamento", "fechada", "realizada", "perdida"];
const NOME_ETAPA = { novo: "Novo", conversando: "Em conversa", visita: "Visita marcada", orcamento: "Orçamento enviado",
  fechada: "Festa fechada", realizada: "Festa realizada", perdida: "Perdida" };
const TIPOS = ["visita", "evento", "outro"];
const SERVICOS = ["salao", "buffet", "doces"];
const MODELOS_CONTRATO = ["buffet", "salao"];
/* Festa ocupa o salão nestas etapas (agenda, Google Agenda e aviso de data já ocupada). */
const OCUPA = ["fechada", "realizada"];

const texto = (v, max, campo) => {
  const s = String(v ?? "").trim();
  if (s.length > max) throw new ErroDominio("invalid-argument", `${campo}: no máximo ${max} caracteres`);
  return s;
};
const dia = (v, campo) => {
  const s = String(v ?? "");
  if (!s) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new ErroDominio("invalid-argument", `${campo} no formato AAAA-MM-DD`);
  return s;
};
const hora = (v, campo) => {
  const s = String(v ?? "");
  if (!s) return "";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s)) throw new ErroDominio("invalid-argument", `${campo} no formato HH:MM`);
  return s;
};
const telefoneDe = v => {
  const t = String(v ?? "").replace(/\D/g, "");
  if (t && t.length < 10) throw new ErroDominio("invalid-argument", "Telefone com DDD, pelo menos 10 números");
  if (t.length > 13) throw new ErroDominio("invalid-argument", "Telefone com números demais");
  return t;
};

function validarFesta(f) {
  if (f == null) return null;
  if (typeof f !== "object") throw new ErroDominio("invalid-argument", "Dados da festa inválidos");
  const convidados = f.convidados === "" || f.convidados == null ? null : Number(f.convidados);
  if (convidados !== null && !(Number.isInteger(convidados) && convidados > 0 && convidados <= 5000)) {
    throw new ErroDominio("invalid-argument", "Convidados: um número inteiro");
  }
  const servicos = Array.isArray(f.servicos) ? [...new Set(f.servicos.filter(s => SERVICOS.includes(s)))] : [];
  return {
    data: dia(f.data, "Data da festa"),
    inicio: hora(f.inicio, "Início"),
    fim: hora(f.fim, "Término"),
    tipoEvento: texto(f.tipoEvento, 80, "Tipo de festa"),
    convidados,
    servicos,
    local: texto(f.local, 160, "Local"),
    valor: centavos(f.valor ?? 0, "Valor da festa")
  };
}
const validarPedidos = lista => {
  if (lista == null) return [];
  if (!Array.isArray(lista) || lista.length > 30) throw new ErroDominio("invalid-argument", "No máximo 30 encomendas por festa");
  return [...new Set(lista.map(p => texto(p, 30, "Número do pedido").toUpperCase()).filter(Boolean))];
};

/* Sem `id`: a equipe lança um atendimento (quem ligou, veio na loja, chamou no Instagram).
   Com `id`: troca só os campos enviados. Etapa muda por moverAtendimento. */
async function salvarAtendimento(db, { id, ...d }, por, agora = new Date()) {
  const campos = {};
  if ("nome" in d) campos.nome = texto(d.nome, 80, "Nome");
  if ("telefone" in d) campos.telefone = telefoneDe(d.telefone);
  if ("tipo" in d) campos.tipo = TIPOS.includes(d.tipo) ? d.tipo : "outro";
  if ("data" in d) campos.data = texto(d.data, 80, "Quando quer");
  if ("pessoas" in d) campos.pessoas = texto(d.pessoas, 40, "Pessoas");
  if ("obs" in d) campos.obs = texto(d.obs, 500, "Observação");
  if ("canal" in d) campos.canal = texto(d.canal, 40, "Por onde chegou");
  if ("visitaEm" in d) {
    const v = String(d.visitaEm ?? "");
    if (v && !/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(v)) throw new ErroDominio("invalid-argument", "Visita: data e hora");
    campos.visitaEm = v;
  }
  if ("festa" in d) campos.festa = validarFesta(d.festa);
  if ("pedidos" in d) campos.pedidos = validarPedidos(d.pedidos);

  if (!id) {
    if (!campos.nome && !campos.telefone) throw new ErroDominio("invalid-argument", "Preencha o nome ou o telefone");
    const ref = db.collection(ATENDIMENTOS).doc();
    const novo = {
      tipo: "evento", nome: "", telefone: "", data: "", pessoas: "", obs: "", ...campos,
      etapa: "novo", status: "novo", origem: "equipe", por,
      historico: [{ para: "novo", por, em: agora }], notas: [],
      criadoEm: agora, atualizadoEm: agora
    };
    await db.runTransaction(async tx => { tx.create(ref, novo); });
    return { id: ref.id, criado: true };
  }
  const ref = db.collection(ATENDIMENTOS).doc(String(id));
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ErroDominio("not-found", "Esse atendimento não existe mais");
    tx.update(ref, { ...campos, atualizadoEm: agora });
    const etapa = etapaDe(snap.data());
    return { id: ref.id, criado: false, etapa, mudouFesta: "festa" in campos };
  });
}

/* Atendimentos de antes do funil só têm status novo/resolvido. */
const etapaDe = a => ETAPAS.includes(a?.etapa) ? a.etapa : a?.status === "resolvido" ? "conversando" : "novo";

async function moverAtendimento(db, { id, etapa, motivo }, por, agora = new Date()) {
  if (!ETAPAS.includes(etapa)) throw new ErroDominio("invalid-argument", `Etapa deve ser ${ETAPAS.join(", ")}`);
  const ref = db.collection(ATENDIMENTOS).doc(String(id || ""));
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ErroDominio("not-found", "Esse atendimento não existe mais");
    const a = snap.data(), de = etapaDe(a);
    if (de === etapa) return { id: ref.id, etapa, mudou: false };
    if (OCUPA.includes(etapa) && !a.festa?.data) throw new ErroDominio("failed-precondition", "Preencha a data da festa antes de fechar");
    const m = texto(motivo, 200, "Motivo");
    const historico = [...(Array.isArray(a.historico) ? a.historico : []), { de, para: etapa, por, em: agora, ...(m ? { motivo: m } : {}) }].slice(-100);
    tx.update(ref, {
      etapa, status: etapa === "novo" ? "novo" : "resolvido", historico, atualizadoEm: agora,
      ...(etapa === "perdida" ? { motivoPerda: m } : {}),
      ...(etapa !== "novo" && de === "novo" ? { resolvidoPor: por, resolvidoEm: agora } : {})
    });
    return { id: ref.id, etapa, de, mudou: true };
  });
}

async function anotarAtendimento(db, { id, texto: t }, por, agora = new Date()) {
  const nota = texto(t, 1000, "Anotação");
  if (!nota) throw new ErroDominio("invalid-argument", "Escreva a anotação");
  const ref = db.collection(ATENDIMENTOS).doc(String(id || ""));
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ErroDominio("not-found", "Esse atendimento não existe mais");
    const notas = [...(Array.isArray(snap.get("notas")) ? snap.get("notas") : []), { texto: nota, por, em: agora }].slice(-200);
    tx.update(ref, { notas, atualizadoEm: agora });
    return { id: ref.id, total: notas.length };
  });
}

/* O contrato da festa (modelos de contratos-data.js do admin): o que foi preenchido, campo a campo. */
async function salvarContratoFesta(db, { id, contrato }, por, agora = new Date()) {
  if (!contrato || !MODELOS_CONTRATO.includes(contrato.tipo)) throw new ErroDominio("invalid-argument", "Modelo de contrato deve ser buffet ou salao");
  const dados = {};
  for (const m of MODELOS_CONTRATO) {
    const origem = contrato.dados?.[m];
    if (origem == null) continue;
    if (typeof origem !== "object" || Array.isArray(origem)) throw new ErroDominio("invalid-argument", "Campos do contrato inválidos");
    dados[m] = {};
    for (const [k, v] of Object.entries(origem)) {
      if (!/^\w{1,40}$/.test(k)) throw new ErroDominio("invalid-argument", "Campo do contrato inválido");
      dados[m][k] = texto(v, 600, "Campo do contrato");
    }
  }
  if (JSON.stringify(dados).length > 40000) throw new ErroDominio("invalid-argument", "Contrato grande demais");
  const ref = db.collection(ATENDIMENTOS).doc(String(id || ""));
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ErroDominio("not-found", "Esse atendimento não existe mais");
    const antes = snap.get("contrato");
    if (antes?.status === "Finalizado" && contrato.status !== "Rascunho") throw new ErroDominio("failed-precondition", "O contrato já foi finalizado");
    const status = contrato.status === "Finalizado" ? "Finalizado" : "Rascunho";
    tx.update(ref, { contrato: { tipo: contrato.tipo, dados, status, por, atualizadoEm: agora }, atualizadoEm: agora });
    return { id: ref.id, status };
  });
}

const dataBR = d => d ? `${d.slice(8, 10)}/${d.slice(5, 7)}` : "sem data";

/* Pagamento da festa (entrada, parcela, restante): uma transação de entrada no Financeiro. */
async function pagarFesta(db, { id, valor, meio, data }, por) {
  const item = validarFinanceiro("transacao", { desc: "Festa", entrada: true, meio, data, valor });
  const ref = db.collection(ATENDIMENTOS).doc(String(id || ""));
  const novo = db.collection(FINANCEIRO).doc();
  const agora = FieldValue.serverTimestamp();
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ErroDominio("not-found", "Esse atendimento não existe mais");
    const a = snap.data();
    const desc = `Festa — ${a.nome || "sem nome"} (${dataBR(a.festa?.data)})`.slice(0, 120);
    tx.create(novo, { tipo: "transacao", ...item, desc, festaId: ref.id, criadoEm: agora, atualizadoEm: agora, por });
    return { id: novo.id, festaId: ref.id, valor: item.valor };
  });
}

/* Google Agenda: festa fechada (ou realizada) com data fica na agenda; senão, sai. */
async function sincronizarFesta(env, db, id) {
  if (!googleLigado(env)) return;
  const snap = await db.collection(ATENDIMENTOS).doc(String(id)).get();
  const chave = "festa-" + id;
  if (!snap.exists) return apagarEvento(env, chave);
  const a = snap.data(), f = a.festa || {};
  if (!OCUPA.includes(etapaDe(a)) || !f.data) return apagarEvento(env, chave);
  let start, end;
  if (f.inicio) {
    const fim = f.fim && f.fim > f.inicio ? f.fim : `${String(Math.min(Number(f.inicio.slice(0, 2)) + 4, 23)).padStart(2, "0")}:${f.inicio.slice(3)}`;
    start = { dateTime: `${f.data}T${f.inicio}:00`, timeZone: "America/Sao_Paulo" };
    end = { dateTime: `${f.data}T${fim}:00`, timeZone: "America/Sao_Paulo" };
  } else {
    const d = new Date(`${f.data}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1);
    start = { date: f.data }; end = { date: d.toISOString().slice(0, 10) };
  }
  const servicos = (f.servicos || []).map(s => ({ salao: "Salão", buffet: "Buffet", doces: "Doces e salgados" }[s])).filter(Boolean);
  return salvarEvento(env, chave, {
    summary: `🎉 ${a.nome || "Festa"}${f.tipoEvento ? ` · ${f.tipoEvento}` : ""}`.slice(0, 250),
    location: f.local || "Salão D' Roma Festas",
    description: [
      NOME_ETAPA[etapaDe(a)],
      a.telefone ? `WhatsApp: ${a.telefone}` : null,
      f.convidados ? `${f.convidados} convidados` : null,
      servicos.length ? servicos.join(", ") : null,
      f.valor ? `Valor: R$ ${(f.valor / 100).toFixed(2).replace(".", ",")}` : null,
      (a.pedidos || []).length ? `Encomendas: ${a.pedidos.join(", ")}` : null
    ].filter(Boolean).join("\n"),
    start, end
  });
}

export { ETAPAS, NOME_ETAPA, OCUPA, etapaDe, validarFesta, salvarAtendimento, moverAtendimento, anotarAtendimento, salvarContratoFesta, pagarFesta, sincronizarFesta };
