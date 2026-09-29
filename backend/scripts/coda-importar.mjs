/* Passo 2 da migração Coda → Firestore. Lê backend/.coda-export/rich.json (cópia do Coda) e monta:
   - sis_pedidos: "Pedidos Site" (jun/2026 em diante, mantém o PED-n do Coda) e "Pedidos Base"
     (histórico jul/2025–jul/2026, vira ANT-n em ordem de data). Pedido que está nas duas fica só com
     a versão do Site, que tem status e pagamento. "Orçamentos" fica de fora: o que não virou pedido
     são cotações paradas em "Verificando Estoque" desde julho.
   - sis_pagamentos: um por pedido com valor pago registrado no Coda (chave coda-<id>).
   - sis_produtos (a partir de "Produtos Site") e sis_catalogo/recheios.

   Sem --gravar só mostra o resumo e salva a prévia em .coda-export/previa.json.
   Com --gravar entra como a conta sistema e grava. Não sobrescreve pedido que já exista e não veio do
   Coda; rodar de novo é seguro (repõe os que vieram do Coda).

   Uso (na pasta backend, PowerShell):
     node scripts/coda-importar.mjs
     $env:SISTEMA_SENHA="..."; node scripts/coda-importar.mjs --gravar */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pagamentoDe } from "../worker/src/dominio.js";

// CODA_PASTA: outra cópia do Coda (coda-conferir.mjs usa uma cópia nova, sem mexer nesta).
const PASTA = process.env.CODA_PASTA || path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".coda-export");
const PROJETO = "dluh-festas";
const API_KEY = "AIzaSyCV7LcTZmCE9MpezCvBah0hHQ245WYcixs";
const EMAIL = "sistema@dluh-festas.firebaseapp.com";
const HOJE = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10); // dia em Brasília
const INICIO_CONTROLE_PAGTO = "2026-07-01"; // antes disso o Coda não marcava pagamento (ver resumo)

const R = JSON.parse(fs.readFileSync(path.join(PASTA, "rich.json"), "utf8"));

// ── Valores no formato "rich" do Coda ──
const txt = v => {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map(txt).filter(Boolean).join(", ");
  if (typeof v === "object") return txt(v.name ?? v.url ?? "");
  return String(v).replace(/```/g, "").trim();
};
const url = v => Array.isArray(v) ? url(v[0]) : (v && typeof v === "object" && /^https:\/\//.test(v.url || "") ? v.url : (/^https:\/\//.test(txt(v)) ? txt(v) : ""));
const reais = v => {
  if (v && typeof v === "object" && "amount" in v) return v.amount;
  if (typeof v === "number") return v;
  const s = txt(v).replace(/[R$\s.]/g, "").replace(",", ".");
  return s ? Number(s) || 0 : 0;
};
const cent = v => Math.max(0, Math.round(reais(v) * 100));
const data = v => (/^\d{4}-\d{2}-\d{2}/.exec(txt(v)) || [""])[0];
const hora = v => { const m = /T(\d{2}:\d{2})/.exec(txt(v)); return m && m[1] !== "00:00" ? m[1] : ""; };
const quando = v => { const d = new Date(txt(v)); return isNaN(d) ? null : d; };
const fone = v => txt(v).replace(/\D/g, "");
const semNumero = s => s.replace(/^\d+\s+/, "").trim(); // "704 Breno" → "Breno" (numeração da comanda antiga)
const chave = (nome, dia) => semNumero(nome).toLowerCase() + "|" + dia;
const modo = v => /entrega/i.test(txt(v)) ? "entrega" : "retirada";

const STATUS_SITE = {
  "Pago — Em produção": "Em produção", "Em produção": "Em produção",
  "Confirmado — Esperando pagamento": "Confirmado — Esperando pagamento",
  "Entregue — Esperando restante": "Entregue — Esperando restante",
  "Finalizado": "Finalizado", "Cancelado": "Cancelado",
  "Aguardando confirmação": "Aguardando confirmação", "Verificando Estoque": "Verificando Estoque"
};
const MEIO = s => /pix/i.test(s) ? "pix" : /dinheiro/i.test(s) ? "dinheiro" : /cart|cr[eé]dito|d[eé]bito|maquin/i.test(s) ? "cartao" : "outro";

const avisos = [];
let presumidos = 0;

// ── Produtos ──
const produtos = R["Produtos Site"].filter(r => txt(r.v.Produto)).map(r => {
  const v = r.v;
  const empresa = { valorUnit: cent(v["Valor Empresa"]), qtdMin: Number(v["Quanti. Empresa"]) || 1, ativo: v["Mostrar Empresa"] === true };
  return {
    id: `coda-${r.id}`,
    nome: txt(v.Produto), categoria: txt(v.Tipo) || "Outros", valorUnit: cent(v.Valor),
    qtdMin: Number(v["Quantidade mínima"]) || 1, ingredientes: txt(v.Ingredientes), imagem: url(v.Imagem),
    ativo: v.Mostrar === true, destaque: v.Popular === true,
    tiposPacote: txt(v["Tipos (Pacotes)"]) ? txt(v["Tipos (Pacotes)"]).split(/\s*,\s*/) : [],
    ...(empresa.valorUnit ? { empresa } : {}),
    origem: "coda"
  };
});
const produtoPorNome = new Map(produtos.map(p => [p.nome.toLowerCase(), p]));
const recheios = R["Recheios Site"].filter(r => r.v.Mostrar !== false).map(r => txt(r.v.Recheio)).filter(Boolean);

function item(nome, qtd, valorUnit, extra = {}) {
  const p = produtoPorNome.get(nome.toLowerCase());
  const it = { nome: nome || "Item", qtd: Math.max(1, Math.round(Number(qtd) || 1)), valorUnit };
  if (p) { it.produtoId = p.id; it.categoria = p.categoria; }
  if (extra.categoria && !it.categoria) it.categoria = extra.categoria;
  if (extra.recheios) it.recheios = extra.recheios.split(/\s*[,;/]\s*|\s+e\s+/).map(s => s.trim()).filter(Boolean);
  if (extra.topo) it.topo = extra.topo;
  if (extra.obs) it.obs = extra.obs;
  return it;
}

/* Total do Coda manda. O que sobra além dos itens vira taxa de entrega; se os itens passam do
   total (desconto dado na mão), o desconto fica anotado em obs. */
function fechar(p, totalCoda) {
  const soma = p.itens.reduce((s, it) => s + it.qtd * it.valorUnit, 0);
  const total = totalCoda || soma;
  if (total >= soma) p.taxaEntrega = total - soma;
  else { p.taxaEntrega = 0; p.obs = [p.obs, `Desconto de R$ ${((soma - total) / 100).toFixed(2).replace(".", ",")} (Coda)`].filter(Boolean).join("\n"); }
  p.total = total;
  return p;
}

// ── Pedidos Site ──
const site = R["Pedidos Site"];
const cabSite = site.filter(r => txt(r.v.Status));
const itensSite = new Map();
for (const r of site.filter(r => !txt(r.v.Status))) {
  const id = r.v.Pedido?.rowId;
  if (!id) { avisos.push(`Item do Site sem pedido: ${txt(r.v.Produto)} (${txt(r.v.Cliente)})`); continue; }
  if (!itensSite.has(id)) itensSite.set(id, []);
  itensSite.get(id).push(r);
}

const pedidos = [];
const chavesSite = new Set();
for (const c of cabSite) {
  const v = c.v;
  const id = txt(v["ID Pedido"]);
  if (!/^PED-\d+$/.test(id)) { avisos.push(`Pedido do Site sem ID: ${txt(v.Cliente)}`); continue; }
  const status = STATUS_SITE[txt(v.Status)];
  if (!status) { avisos.push(`${id}: status desconhecido "${txt(v.Status)}"`); continue; }
  const dia = data(v["Data Desejada"]);
  chavesSite.add(chave(txt(v.Cliente), dia));
  let itens = (itensSite.get(c.id) || []).map(r => item(txt(r.v.Produto), r.v.Quantidade, cent(r.v["Valor Unit"]), {
    recheios: txt(r.v.Recheios),
    topo: txt(r.v["Topo Info"]) ? (url(r.v.Referencia) ? { tema: txt(r.v["Topo Info"]), imagem: url(r.v.Referencia) } : txt(r.v["Topo Info"])) : null
  }));
  if (!itens.length) itens = [item("Pedido (itens não registrados no Coda)", 1, cent(v.Total))];
  const pago = cent(v["Valor Pago"]);
  const p = fechar({
    id,
    cliente: { nome: txt(v.Cliente), telefone: fone(v.WhatsApp) },
    tipo: /empresa/i.test(txt(v["Tipo Cliente"])) ? "empresa" : "pessoa",
    entrega: { modo: modo(v.Entrega), data: dia, hora: hora(v.Hora), ...(modo(v.Entrega) === "entrega" ? { endereco: txt(v["Endereço"]) } : {}) },
    itens, entradaPct: 50,
    ...(txt(v.Pagamento) ? { formaPagamento: MEIO(txt(v.Pagamento)) } : {}),
    obs: txt(v["Observações"]),
    status, origem: "coda",
    coda: { tabela: "Pedidos Site", linha: c.id, ...(url(v["Link de Pagamento"]) ? { linkPagamento: url(v["Link de Pagamento"]) } : {}) },
    criadoEm: null
  }, cent(v.Total));
  // No fluxo antigo "Finalizado" já queria dizer pago (muitas vezes por fora, sem anotar o valor).
  if (status === "Finalizado" && pago < p.total) { p.pago = p.total; p.pagoPresumido = true; presumidos++; } else p.pago = pago;
  p.pagamento = pagamentoDe(p.total, p.pago);
  p.cozinha = status === "Em produção" && dia >= HOJE ? "pendente" : "feito";
  p._pagamento = pago ?{ valor: pago, meio: MEIO(txt(v.Pagamento)), comprovante: url(v.Comprovante) } : null;
  pedidos.push(p);
}
const criadaSite = new Map(JSON.parse(fs.readFileSync(path.join(PASTA, "Pedidos Site.json"), "utf8")).linhas.map(l => [l.id, l.criada]));
for (const p of pedidos) p.criadoEm = quando(criadaSite.get(p.coda.linha)) || new Date(p.entrega.data + "T12:00:00-03:00");

// ── Pedidos Base (histórico) ──
const base = R["Pedidos Base"];
const linhaBase = new Map(base.map(r => [r.id, r]));
const cabBase = base.filter(r => txt(r.v.Cliente))
  .map(r => ({ r, dia: data(r.v.Data) || data(r.v["Data e Hora"]) || data(r.v["Created on"]) }))
  .sort((a, b) => (a.dia + txt(a.r.v["Created on"])).localeCompare(b.dia + txt(b.r.v["Created on"])));
let n = 0, duplicados = 0;
for (const { r, dia } of cabBase) {
  const v = r.v;
  if (chavesSite.has(chave(txt(v.Cliente), dia))) { duplicados++; continue; }
  const id = `ANT-${++n}`;
  const itens = (Array.isArray(v.Pedidos) ? v.Pedidos : []).map(l => linhaBase.get(l?.rowId)).filter(Boolean).map(l => {
    const w = l.v;
    const topo = txt(w["Topo Info"]);
    return item(txt(w.Produtos), w.Quantidade, cent(w["Valor p/Un."]) || cent(w.Valor), {
      categoria: txt(w.Tipo), recheios: txt(w["Recheios de Bolo"]), topo: topo || null,
      obs: [txt(w["Informações"]), cent(w["Topo Valor"]) ? `Topo: R$ ${reais(w["Topo Valor"]).toFixed(2).replace(".", ",")}` : ""].filter(Boolean).join(" · ")
    });
  });
  const totalCoda = cent(v["Valor Total"]);
  if (!itens.length) itens.push(item("Pedido (itens não registrados no Coda)", 1, totalCoda));
  const p = fechar({
    id,
    cliente: { nome: semNumero(txt(v.Cliente)) || txt(v.Cliente), telefone: fone(v["Número"]) },
    tipo: v["Cliente/Empresa"] === true ? "empresa" : "pessoa",
    entrega: { modo: modo(v["Entrega/Retirada"]), data: dia, hora: hora(v.Hora) || hora(v["Data e Hora"]), ...(modo(v["Entrega/Retirada"]) === "entrega" ? { endereco: txt(v["Endereço"]) } : {}) },
    itens, entradaPct: 50,
    obs: [txt(v["Observações"]), txt(v["Informações"]), txt(v.Pagamentos) ? `Pagamentos: ${txt(v.Pagamentos)}` : ""].filter(Boolean).join("\n"),
    origem: "coda",
    coda: { tabela: "Pedidos Base", linha: r.id, comanda: (/^(\d+)\s/.exec(txt(v.Cliente)) || [])[1] || null },
    criadoEm: quando(v["Created on"]) || new Date(dia + "T12:00:00-03:00")
  }, totalCoda);

  // Pagamento: o Coda só começou a marcar em jul/2026; pedido anterior entregue conta como pago.
  const marcado = txt(v["Pago?"]);
  let pago = marcado === "Totalmente pago" ? p.total : marcado === "Só entrada" ? Math.min(cent(v["Valor pago"]) || Math.round(p.total / 2), p.total) : 0;
  if (!pago && dia && dia < INICIO_CONTROLE_PAGTO) { pago = p.total; p.pagoPresumido = true; presumidos++; }
  p.pago = pago;
  p.pagamento = pagamentoDe(p.total, pago);
  const entregue = /entregue|feito/i.test(txt(v.Entregue)) || (dia && dia < HOJE);
  p.status = !entregue ? "Em produção" : p.pagamento === "Totalmente pago" ? "Finalizado" : "Entregue — Esperando restante";
  p.cozinha = p.status === "Em produção" ? "pendente" : "feito";
  p._pagamento = pago && !p.pagoPresumido ? { valor: pago, meio: "outro", comprovante: "" } : null;
  pedidos.push(p);
}

// ── Resumo ──
const conta = (lista, f) => lista.reduce((m, x) => (m[f(x)] = (m[f(x)] || 0) + 1, m), {});
const semTel = pedidos.filter(p => p.cliente.telefone.length < 10).length;
console.log(`Pedidos: ${pedidos.length} (Site ${pedidos.filter(p => p.id.startsWith("PED-")).length}, histórico ${n}; ${duplicados} do histórico já estavam no Site)`);
console.log("Status:", conta(pedidos, p => p.status));
console.log("Pagamento:", conta(pedidos, p => p.pagamento), `— ${presumidos} contados como pagos sem valor anotado (Finalizado no Site ou antes de ${INICIO_CONTROLE_PAGTO})`);
console.log(`Na fila da cozinha: ${pedidos.filter(p => p.cozinha === "pendente").length} · sem telefone válido: ${semTel} · sem data: ${pedidos.filter(p => !p.entrega.data).length}`);
console.log(`Pagamentos registrados: ${pedidos.filter(p => p._pagamento).length} · Produtos: ${produtos.length} (${produtos.filter(p => p.ativo).length} ativos) · Recheios: ${recheios.length}`);
const faturado = pedidos.filter(p => p.status !== "Cancelado").reduce((s, p) => s + p.total, 0);
console.log(`Soma dos pedidos (sem cancelados): R$ ${(faturado / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
if (avisos.length) console.log(`Avisos (${avisos.length}):\n  ` + avisos.slice(0, 30).join("\n  "));
fs.writeFileSync(path.join(PASTA, "previa.json"), JSON.stringify({ pedidos, produtos, recheios }, null, 1));
console.log("Prévia em .coda-export/previa.json");

if (!process.argv.includes("--gravar")) { console.log("\nNada foi gravado. Para gravar: --gravar (com SISTEMA_SENHA)."); process.exit(0); }

// ── Gravação (REST, em lotes de até 500 escritas) ──
const senha = process.env.SISTEMA_SENHA;
if (!senha) { console.error("Defina SISTEMA_SENHA (senha da conta sistema)."); process.exit(1); }
const login = await (await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: senha, returnSecureToken: true })
})).json();
if (!login.idToken) { console.error("Login da conta sistema falhou:", login.error?.message); process.exit(1); }
const auth = { Authorization: `Bearer ${login.idToken}`, "Content-Type": "application/json" };
const DB = `projects/${PROJETO}/databases/(default)/documents`;
const API = `https://firestore.googleapis.com/v1/${DB}`;

const cod = v => {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(cod) } };
  return { mapValue: { fields: campos(v) } };
};
const campos = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, cod(v)]));
const doc = (colecao, id, dados) => ({ update: { name: `${DB}/${colecao}/${id}`, fields: campos(dados) } });

// Pedidos que já existem e não vieram do Coda não são tocados.
const existentes = new Map();
for (let token = ""; ;) {
  const j = await (await fetch(`${API}/sis_pedidos?pageSize=300&mask.fieldPaths=origem${token ? `&pageToken=${token}` : ""}`, { headers: auth })).json();
  if (j.error) { console.error("Leitura falhou:", j.error.message); process.exit(1); }
  for (const d of j.documents || []) existentes.set(d.name.split("/").pop(), d.fields?.origem?.stringValue);
  if (!(token = j.nextPageToken)) break;
}

const agora = new Date();
const escritas = [];
let pulados = 0;
for (const { _pagamento, ...p } of pedidos) {
  if (existentes.has(p.id) && existentes.get(p.id) !== "coda") { pulados++; continue; }
  escritas.push(doc("sis_pedidos", p.id, { ...p, atualizadoEm: agora, importadoEm: agora }));
  if (_pagamento) escritas.push(doc("sis_pagamentos", `coda-${p.id}`, { pedidoId: p.id, ..._pagamento, por: "importacao-coda", em: p.criadoEm }));
}
for (const { id, ...p } of produtos) escritas.push(doc("sis_produtos", id, { ...p, criadoEm: agora, atualizadoEm: agora, por: "importacao-coda" }));
escritas.push(doc("sis_catalogo", "recheios", { lista: recheios, atualizadoEm: agora, por: "importacao-coda" }));

for (let i = 0; i < escritas.length; i += 400) {
  const lote = escritas.slice(i, i + 400);
  const res = await fetch(`${API}:commit`, { method: "POST", headers: auth, body: JSON.stringify({ writes: lote }) });
  if (!res.ok) { console.error(`Lote ${i / 400 + 1} falhou:`, (await res.json()).error?.message); process.exit(1); }
  console.log(`  gravado ${Math.min(i + 400, escritas.length)}/${escritas.length}`);
}
console.log(`Pronto. ${pulados ? `${pulados} pedidos que já existiam fora do Coda ficaram como estavam.` : ""}`);
