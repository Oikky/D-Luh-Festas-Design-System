/* Formulário "Monte sua festa" do site (POST /site/festa, sem login): o cliente conta a festa e
   escolhe os pratos do cardápio do buffet (sis_catalogo/buffet, publicado pela tela Custos). Vira
   um atendimento "novo" no funil (sis_atendimentos) com a festa e o pedido do cliente em
   `formulario`; a equipe é avisada no Telegram e no WhatsApp, e o cliente recebe a confirmação.
   Sem preço: o orçamento sai depois, pela equipe. */
import { ErroDominio } from "./dominio.js";
import { ATENDIMENTOS } from "./sofia-atendimento.js";
import { CARDAPIO_BUFFET } from "./custos.js";
import { enviarTexto, whatsappLigado, numeroDe } from "./whatsapp.js";
import { enviar as enviarTelegram, telegramLigado, topicos } from "./telegram.js";
import { hojeBrasilia } from "./site.js";

const FORMATOS = { servido: "Buffet servido", self: "Self-service" };
const EXTRAS = { bebidas: "Bebidas", bolo: "Bolo", doces: "Doces", decoracao: "Decoração" };
const erro = m => { throw new ErroDominio("invalid-argument", m); };
const texto = (v, max, campo) => {
  const s = String(v ?? "").trim();
  if (s.length > max) erro(`${campo}: no máximo ${max} caracteres`);
  return s;
};
const dataBR = d => d.split("-").reverse().join("/");

async function festaDoSite(db, d, agora = new Date()) {
  const nome = texto(d?.nome, 80, "Nome") || erro("Diga seu nome");
  const telefone = String(d.telefone ?? "").replace(/\D/g, "");
  if (telefone.length < 10 || telefone.length > 13) erro("WhatsApp com DDD");
  const tipoEvento = texto(d.tipoEvento, 60, "Tipo de festa") || erro("Que festa vai ser?");
  const data = String(d.data ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || data <= hojeBrasilia(agora)) erro("Escolha uma data a partir de amanhã");
  const inicio = String(d.inicio ?? "");
  if (inicio && !/^([01]\d|2[0-3]):[0-5]\d$/.test(inicio)) erro("Horário no formato HH:MM");
  const convidados = Number(d.convidados);
  if (!Number.isInteger(convidados) || convidados < 10 || convidados > 1000) erro("Convidados: de 10 a 1000");
  const noSalao = d.local === "salao";
  const endereco = noSalao ? "" : texto(d.endereco, 160, "Endereço") || erro("Diga onde vai ser a festa");
  const formato = FORMATOS[d.formato] ? d.formato : erro("Escolha buffet servido ou self-service");

  const snap = await db.doc(CARDAPIO_BUFFET).get();
  const cardapio = snap.exists ? snap.data() : { pacotes: [], limites: {} };
  const pacote = (cardapio.pacotes || []).find(p => p.id === d.pacote) || erro("Escolha o cardápio");
  const todos = new Map((cardapio.pacotes || []).flatMap(p => p.pratos.map(x => [x.id, x])));
  const ids = [...new Set(Array.isArray(d.pratos) ? d.pratos.map(String) : [])];
  if (ids.length > 40) erro("Pratos demais");
  const pratos = ids.map(id => todos.get(id) || erro("Um dos pratos saiu do cardápio; recarregue a página"));
  if (!pratos.length) erro("Escolha os pratos");
  const conta = {};
  pratos.forEach(p => { conta[p.tipo] = (conta[p.tipo] || 0) + 1; });
  Object.entries(conta).forEach(([tipo, n]) => {
    const max = (cardapio.limites || {})[tipo];
    if (max != null && n > max) erro(`${tipo}: escolha até ${max}`);
  });
  const extras = [...new Set(Array.isArray(d.extras) ? d.extras.filter(x => EXTRAS[x]) : [])];

  const formulario = {
    formato, pacote: pacote.nome, pratos: pratos.map(p => ({ tipo: p.tipo, nome: p.nome })), extras,
    restricoes: texto(d.restricoes, 300, "Restrições"), obs: texto(d.obs, 600, "Observações")
  };
  const a = {
    tipo: "evento", nome, telefone, data: dataBR(data), pessoas: String(convidados),
    obs: [FORMATOS[formato], `cardápio ${pacote.nome}`, noSalao ? "no salão D'Roma" : `em ${endereco}`].join(" · "),
    canal: "Site (formulário)", origem: "site", status: "novo", etapa: "novo",
    festa: { data, inicio, fim: "", tipoEvento, convidados, servicos: noSalao ? ["salao", "buffet"] : ["buffet"],
      local: noSalao ? "Salão D'Roma" : endereco, valor: 0 },
    formulario,
    historico: [{ para: "novo", por: "site", em: agora }], notas: [], pedidos: [],
    criadoEm: agora, atualizadoEm: agora
  };
  const ref = await db.collection(ATENDIMENTOS).add(a);
  return { id: ref.id, ...a };
}

/* Os pratos agrupados por tipo, uma linha cada. */
const linhasPratos = f => [...new Set(f.pratos.map(p => p.tipo))].map(t => `• ${t}: ${f.pratos.filter(p => p.tipo === t).map(p => p.nome).join(", ")}`);

function textoEquipe(a) {
  const f = a.formulario;
  return [
    `🎉 Festa pelo site — ${a.festa.tipoEvento}`,
    `${a.nome} · ${a.telefone}`,
    `${a.data}${a.festa.inicio ? ` às ${a.festa.inicio}` : ""} · ${a.pessoas} convidados`,
    `${FORMATOS[f.formato]} · ${a.festa.local}`,
    `Cardápio ${f.pacote}:`, ...linhasPratos(f),
    ...(f.extras.length ? [`Também quer: ${f.extras.map(x => EXTRAS[x]).join(", ")}`] : []),
    ...(f.restricoes ? [`Restrições: ${f.restricoes}`] : []),
    ...(f.obs ? [`Obs.: ${f.obs}`] : []),
    "Está em Atendimentos (novo). Responda pelo WhatsApp da loja."
  ].join("\n");
}

function textoCliente(a) {
  const f = a.formulario;
  return [
    `Olá, ${a.nome.split(" ")[0]}! 🩷`,
    `Recebemos os detalhes da sua festa na D'Luh Festas:`,
    "",
    `${a.festa.tipoEvento} · ${a.data}${a.festa.inicio ? ` às ${a.festa.inicio}` : ""} · ${a.pessoas} convidados`,
    `${FORMATOS[f.formato]} · cardápio ${f.pacote}`,
    ...linhasPratos(f),
    "",
    "Agora a equipe monta o seu orçamento e te chama por aqui."
  ].join("\n");
}

/* Telegram (tópico Festas) + WhatsApp de cada número de WHATSAPP_ATENDIMENTO + confirmação ao cliente.
   Um envio falhar não derruba os outros. */
async function avisarFesta(env, a) {
  const equipe = textoEquipe(a);
  const envios = [
    // Tópico Festas; sem ele configurado em TELEGRAM_TOPICOS, cai em Pendentes.
    ...(telegramLigado(env) ? [enviarTelegram(env, topicos(env).festas ? "festas" : "pendentes", equipe, [{ titulo: "Abrir no Whats", url: `https://wa.me/${numeroDe(a.telefone)}` }])] : []),
    ...(whatsappLigado(env) ? [
      ...String(env.WHATSAPP_ATENDIMENTO || "").split(",").map(s => s.trim()).filter(Boolean).map(n => enviarTexto(env, n, equipe)),
      enviarTexto(env, a.telefone, textoCliente(a))
    ] : [])
  ];
  const res = await Promise.allSettled(envios);
  res.filter(r => r.status === "rejected").forEach(f => console.error(JSON.stringify({ msg: "aviso de festa do site falhou", erro: String(f.reason) })));
  return res.length;
}

export { festaDoSite, avisarFesta, textoEquipe, textoCliente };
