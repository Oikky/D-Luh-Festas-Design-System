/* Fichas técnicas e custos do buffet (tela Custos do admin): ingredientes com preço, receitas,
   equipe, despesas da festa, pacotes e margem — tudo num documento só (sis_custos/base), que só a
   equipe lê. Aqui só se confere o formato e grava; as contas ficam no admin (custos-calculo.js). */
import { FieldValue } from "./firestore.js";
import { ErroDominio } from "./dominio.js";

const CUSTOS = "sis_custos/base";
const UNIDADES = ["kg", "g", "L", "ml", "un"];
const FAIXAS = ["50", "80", "100", "120", "150"];

const erro = m => { throw new ErroDominio("invalid-argument", m); };
const texto = (v, max, campo) => {
  const s = String(v ?? "").trim();
  if (s.length > max) erro(`${campo}: no máximo ${max} caracteres`);
  return s;
};
const lista = (v, max, campo) => {
  if (v == null) return [];
  if (!Array.isArray(v)) erro(`${campo}: envie uma lista`);
  if (v.length > max) erro(`${campo}: no máximo ${max}`);
  return v;
};
// null = ainda não informado (a conta não fecha enquanto faltar).
const numero = (v, campo) => {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) erro(`${campo}: número inválido`);
  return n;
};
const centavosOuNulo = (v, campo) => {
  const n = numero(v, campo);
  if (n != null && !Number.isInteger(n)) erro(`${campo}: deve ser inteiro em centavos`);
  return n;
};
const id = (v, campo) => texto(v, 40, campo) || erro(`${campo}: falta o id`);
const pendencias = (v, campo) => lista(v, 30, campo).map(p => texto(p, 120, campo)).filter(Boolean);
const porFaixa = (v, campo) => Object.fromEntries(FAIXAS.map(f => [f, numero(v && v[f], `${campo} (${f})`)]));

function validarCustos(d) {
  const ingredientes = lista(d?.ingredientes, 300, "Ingredientes").map((x, i) => {
    const unidade = UNIDADES.includes(x?.unidade) ? x.unidade : erro(`Ingrediente ${i + 1}: unidade inválida`);
    return { id: id(x.id, "Ingrediente"), nome: texto(x.nome, 60, "Ingrediente") || erro(`Ingrediente ${i + 1}: falta o nome`),
      preco: centavosOuNulo(x.preco, `Preço de ${x.nome}`), qtd: numero(x.qtd, `Embalagem de ${x.nome}`), unidade };
  });
  const fichas = lista(d?.fichas, 200, "Fichas").map((f, i) => ({
    id: id(f?.id, "Ficha"), nome: texto(f.nome, 60, "Ficha") || erro(`Ficha ${i + 1}: falta o nome`), categoria: texto(f.categoria, 30, "Categoria"),
    rendimentoKg: numero(f.rendimentoKg, `Rendimento de ${f.nome}`), porcaoG: numero(f.porcaoG, `Porção de ${f.nome}`),
    itens: lista(f.itens, 60, `Itens de ${f.nome}`).map(it => ({
      ing: id(it?.ing, "Item"), qtd: numero(it.qtd, `Quantidade em ${f.nome}`),
      unidade: UNIDADES.includes(it.unidade) ? it.unidade : erro(`${f.nome}: unidade inválida`)
    })),
    pendencias: pendencias(f.pendencias, `Pendências de ${f.nome}`)
  }));
  const equipe = lista(d?.equipe, 20, "Equipe").map(e => ({
    id: id(e?.id, "Equipe"), funcao: texto(e.funcao, 40, "Função") || erro("Equipe: falta a função"),
    valor: centavosOuNulo(e.valor, `Valor de ${e.funcao}`), servido: porFaixa(e.servido, e.funcao), self: porFaixa(e.self, e.funcao)
  }));
  const o = d?.operacao || {};
  const operacao = {
    gas: centavosOuNulo(o.gas, "Gás por evento"), gasolinaLitro: centavosOuNulo(o.gasolinaLitro, "Gasolina"),
    kmPorLitro: numero(o.kmPorLitro, "Km por litro"), km: numero(o.km, "Distância"),
    outros: lista(o.outros, 40, "Outras despesas").map(x => ({
      id: id(x?.id, "Despesa"), nome: texto(x.nome, 60, "Despesa") || erro("Despesa sem nome"),
      valor: centavosOuNulo(x.valor, `Valor de ${x.nome}`), por: x.por === "pessoa" ? "pessoa" : "evento"
    })),
    pendencias: pendencias(o.pendencias, "Pendências da operação")
  };
  const pacotes = lista(d?.pacotes, 10, "Pacotes").map(p => ({
    id: id(p?.id, "Pacote"), nome: texto(p.nome, 40, "Pacote") || erro("Pacote sem nome"),
    fichas: lista(p.fichas, 60, `Fichas de ${p.nome}`).map(x => id(x, "Ficha do pacote"))
  }));
  const limites = Object.fromEntries(Object.entries(d?.limites || {}).slice(0, 20).map(([k, v]) => {
    const n = numero(v, `Limite de ${k}`);
    if (n != null && !Number.isInteger(n)) erro(`Limite de ${k}: número inteiro`);
    return [texto(k, 30, "Tipo de prato"), n];
  }));
  const pr = d?.precos || {};
  const precos = { margemPct: numero(pr.margemPct, "Margem"), taxasPct: numero(pr.taxasPct, "Taxas e tributos") };
  if ((precos.margemPct || 0) + (precos.taxasPct || 0) >= 100) erro("Margem + taxas precisam ficar abaixo de 100%");
  return { ingredientes, fichas, equipe, operacao, pacotes, limites, precos };
}

// shortcut: o documento inteiro é regravado a cada salvar (quem salvar por último ganha); dividir por parte se duas pessoas editarem juntas.
async function salvarCustos(db, dados, por) {
  const c = validarCustos(dados);
  await db.doc(CUSTOS).set({ ...c, atualizadoEm: FieldValue.serverTimestamp(), por });
  return { ok: true };
}

/* O formulário de festa do site (público) lê só o cardápio: nomes dos pratos por pacote e tipo, e
   quantos o cliente escolhe. Nada de preço, receita ou custo sai daqui. Refeito a cada salvar. */
const CARDAPIO_BUFFET = "sis_catalogo/buffet";
async function publicarCardapio(db) {
  const snap = await db.doc(CUSTOS).get();
  if (!snap.exists) return { pacotes: 0 };
  const c = snap.data(), porId = new Map((c.fichas || []).map(f => [f.id, f]));
  const pacotes = (c.pacotes || []).map(p => ({ id: p.id, nome: p.nome,
    pratos: p.fichas.map(id => porId.get(id)).filter(Boolean).map(f => ({ id: f.id, nome: f.nome, tipo: f.categoria || "Outros" })) }));
  await db.doc(CARDAPIO_BUFFET).set({ pacotes, limites: c.limites || {}, atualizadoEm: FieldValue.serverTimestamp() });
  return { pacotes: pacotes.length };
}

export { salvarCustos, validarCustos, publicarCardapio, CUSTOS, CARDAPIO_BUFFET };
