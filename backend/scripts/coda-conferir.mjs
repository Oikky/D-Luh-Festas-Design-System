/* Confere se os pedidos do Coda batem com os do Firestore. Sem --gravar só lê, nos dois lados;
   com --gravar leva ao Firestore o que mudou só no Coda (ver o fim do arquivo).
   1. Baixa do Coda, agora, as tabelas que a importação usa (para .coda-export/conferencia/).
   2. Monta os pedidos com a mesma regra de coda-importar.mjs (sem gravar nada).
   3. Lê sis_pedidos no Firestore (conta sistema) e compara pedido a pedido:
      PED-n pelo número; ANT-n (histórico) pela linha do Coda, porque a numeração ANT é refeita.
   O que o sistema novo mudou depois da importação (status, pagamento…) aparece separado de
   divergência de verdade.

   Uso (na pasta backend):
     SISTEMA_SENHA='...' node scripts/coda-conferir.mjs <TOKEN_DO_CODA>          (bash)
     $env:SISTEMA_SENHA="..."; node scripts/coda-conferir.mjs <TOKEN_DO_CODA>   (PowerShell)
   Relatório completo em .coda-export/conferencia/relatorio.json. */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const PASTA = path.join(AQUI, "..", ".coda-export", "conferencia");
const DOC = "Wq8ktEEI3N";
const TABELAS = ["Pedidos Site", "Pedidos Base", "Produtos Site", "Recheios Site"];
const PROJETO = "dluh-festas";
const API_KEY = "AIzaSyCV7LcTZmCE9MpezCvBah0hHQ245WYcixs";
const EMAIL = "sistema@dluh-festas.firebaseapp.com";

const token = process.argv[2], senha = process.env.SISTEMA_SENHA;
if (!token || !senha) { console.error("Uso: SISTEMA_SENHA=... node scripts/coda-conferir.mjs <TOKEN_DO_CODA>"); process.exit(1); }

// ── 1. Coda ──
async function coda(url) {
  for (let tentativa = 1; ; tentativa++) {
    const r = await fetch(url.startsWith("http") ? url : `https://coda.io/apis/v1/docs/${DOC}${url}`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.status === 429 && tentativa < 6) { await new Promise(ok => setTimeout(ok, 2000 * tentativa)); continue; }
    if (!r.ok) throw new Error(`Coda ${r.status} em ${url}: ${(await r.text()).slice(0, 200)}`);
    return r.json();
  }
}
async function todos(url) {
  const itens = [];
  for (let prox = url; prox;) { const j = await coda(prox); itens.push(...j.items); prox = j.nextPageLink; }
  return itens;
}

fs.mkdirSync(PASTA, { recursive: true });
const tabelas = (await todos("/tables?limit=100")).filter(t => TABELAS.includes(t.name));
const rich = {};
for (const t of tabelas) {
  const linhas = await todos(`/tables/${t.id}/rows?limit=500&valueFormat=rich&useColumnNames=true`);
  rich[t.name] = linhas.map(l => ({ id: l.id, v: l.values }));
  if (t.name === "Pedidos Site") {
    fs.writeFileSync(path.join(PASTA, "Pedidos Site.json"), JSON.stringify({ linhas: linhas.map(l => ({ id: l.id, criada: l.createdAt })) }));
  }
  console.log(`Coda · ${t.name}: ${linhas.length} linhas`);
}
const faltando = TABELAS.filter(n => !rich[n]);
if (faltando.length) { console.error("Tabelas não encontradas no Coda:", faltando.join(", ")); process.exit(1); }
fs.writeFileSync(path.join(PASTA, "rich.json"), JSON.stringify(rich));

// ── 2. Pedidos como a importação monta ──
execFileSync(process.execPath, [path.join(AQUI, "coda-importar.mjs")], { env: { ...process.env, CODA_PASTA: PASTA, SISTEMA_SENHA: "" }, stdio: ["ignore", "ignore", "inherit"] });
const { pedidos: doCoda } = JSON.parse(fs.readFileSync(path.join(PASTA, "previa.json"), "utf8"));

// ── 3. Firestore ──
const login = await (await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: senha, returnSecureToken: true })
})).json();
if (!login.idToken) { console.error("Login da conta sistema falhou:", login.error?.message); process.exit(1); }
const valor = f => {
  if (!f) return undefined;
  if ("stringValue" in f) return f.stringValue;
  if ("integerValue" in f) return Number(f.integerValue);
  if ("doubleValue" in f) return f.doubleValue;
  if ("booleanValue" in f) return f.booleanValue;
  if ("timestampValue" in f) return f.timestampValue;
  if ("nullValue" in f) return null;
  if ("arrayValue" in f) return (f.arrayValue.values || []).map(valor);
  if ("mapValue" in f) return Object.fromEntries(Object.entries(f.mapValue.fields || {}).map(([k, v]) => [k, valor(v)]));
};
const noFirebase = [];
for (let pagina = ""; ;) {
  const j = await (await fetch(`https://firestore.googleapis.com/v1/projects/${PROJETO}/databases/(default)/documents/sis_pedidos?pageSize=300${pagina ? `&pageToken=${pagina}` : ""}`,
    { headers: { Authorization: `Bearer ${login.idToken}` } })).json();
  if (j.error) { console.error("Leitura do Firestore falhou:", j.error.message); process.exit(1); }
  for (const d of j.documents || []) noFirebase.push({ id: d.name.split("/").pop(), ...valor({ mapValue: { fields: d.fields } }) });
  if (!(pagina = j.nextPageToken)) break;
}

// ── Comparação ──
const chaveDe = p => p.coda?.tabela === "Pedidos Base" ? `base:${p.coda.linha}` : p.id;
const fb = new Map(noFirebase.filter(p => p.origem === "coda").map(p => [chaveDe(p), p]));
const CAMPOS = {
  status: p => p.status,
  total: p => p.total,
  pago: p => p.pago,
  cliente: p => `${p.cliente?.nome} · ${p.cliente?.telefone}`,
  entrega: p => `${p.entrega?.modo} ${p.entrega?.data} ${p.entrega?.hora || ""}`.trim(),
  itens: p => (p.itens || []).map(i => `${i.qtd} ${i.nome}`).join(" + ")
};
const reais = c => typeof c === "number" ? `R$ ${(c / 100).toFixed(2).replace(".", ",")}` : String(c);
const mostrar = (campo, v) => ["total", "pago"].includes(campo) ? reais(v) : v;

const soNoCoda = [], divergentes = [], mexidosNoSistema = [];
let iguais = 0;
for (const c of doCoda) {
  const f = fb.get(chaveDe(c));
  if (!f) { soNoCoda.push(c); continue; }
  fb.delete(chaveDe(c));
  const dif = Object.entries(CAMPOS).filter(([, g]) => JSON.stringify(g(c)) !== JSON.stringify(g(f)))
    .map(([campo, g]) => ({ campo, coda: mostrar(campo, g(c)), firebase: mostrar(campo, g(f)) }));
  if (!dif.length) { iguais++; continue; }
  // Mexido no admin/assistente depois da importação: diferença esperada, não erro.
  const mexido = f.atualizadoEm && f.importadoEm && new Date(f.atualizadoEm) - new Date(f.importadoEm) > 60e3;
  (mexido ? mexidosNoSistema : divergentes).push({ id: f.id, cliente: c.cliente.nome, dif, coda: c });
}
const soNoFirebase = [...fb.values()];
const novos = noFirebase.filter(p => p.origem !== "coda");

const linha = p => `${p.id} · ${p.cliente?.nome} · ${p.entrega?.data} · ${reais(p.total)} · ${p.status}`;
console.log(`\nCoda: ${doCoda.length} pedidos · Firestore: ${noFirebase.length} (${noFirebase.length - novos.length} vindos do Coda, ${novos.length} criados no sistema novo)`);
console.log(`✔ Iguais: ${iguais}`);
console.log(`✖ Só no Coda (faltam no Firestore): ${soNoCoda.length}`);
soNoCoda.slice(0, 40).forEach(p => console.log("   " + linha(p)));
console.log(`✖ Diferentes: ${divergentes.length}`);
divergentes.slice(0, 40).forEach(d => console.log(`   ${d.id} · ${d.cliente}: ` + d.dif.map(x => `${x.campo} Coda "${x.coda}" × Firebase "${x.firebase}"`).join("; ")));
console.log(`• Mudados no sistema novo depois da importação (esperado): ${mexidosNoSistema.length}`);
mexidosNoSistema.slice(0, 20).forEach(d => console.log(`   ${d.id} · ${d.cliente}: ` + d.dif.map(x => `${x.campo} "${x.coda}" → "${x.firebase}"`).join("; ")));
console.log(`• No Firestore como vindos do Coda, mas não estão mais no Coda: ${soNoFirebase.length}`);
soNoFirebase.slice(0, 20).forEach(p => console.log("   " + linha(p)));
fs.writeFileSync(path.join(PASTA, "relatorio.json"), JSON.stringify({ geradoEm: new Date(), iguais, soNoCoda, divergentes, mexidosNoSistema, soNoFirebase, novos: novos.map(p => p.id) }, null, 1));
console.log("\nRelatório completo em .coda-export/conferencia/relatorio.json.");

/* ── --gravar: leva para o Firestore o que mudou só no Coda ──
   Grava os pedidos "só no Coda" e os "diferentes" (o Coda mudou, o sistema novo não mexeu).
   Os "mudados no sistema novo" ficam como estão: o que foi feito no Firestore vale. */
if (!process.argv.includes("--gravar")) { console.log("Nada foi gravado. Para levar ao Firestore o que mudou só no Coda: --gravar"); process.exit(0); }
const DB = `projects/${PROJETO}/databases/(default)/documents`;
const cod = v => {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(v) ? { timestampValue: v } : { stringValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(cod) } };
  return { mapValue: { fields: campos(v) } };
};
const campos = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, cod(v)]));
const doc = (colecao, id, dados) => ({ update: { name: `${DB}/${colecao}/${id}`, fields: campos(dados) } });

// Histórico novo no Coda ganha o próximo ANT livre (a numeração da prévia é refeita e colidiria).
let ultimoAnt = Math.max(0, ...noFirebase.map(p => /^ANT-(\d+)$/.exec(p.id)?.[1]).filter(Boolean).map(Number));
const agora = new Date(), escritas = [], feitos = [];
const gravar = (id, { _pagamento, ...p }) => {
  escritas.push(doc("sis_pedidos", id, { ...p, id, atualizadoEm: agora, importadoEm: agora }));
  if (_pagamento) escritas.push(doc("sis_pagamentos", `coda-${id}`, { pedidoId: id, ..._pagamento, por: "importacao-coda", em: p.criadoEm }));
  feitos.push(id);
};
for (const c of soNoCoda) gravar(c.coda?.tabela === "Pedidos Base" ? `ANT-${++ultimoAnt}` : c.id, c);
for (const d of divergentes) gravar(d.id, d.coda);
if (!escritas.length) { console.log("Nada a levar: o Firestore já está com tudo o que mudou no Coda."); process.exit(0); }
const res = await fetch(`https://firestore.googleapis.com/v1/${DB}:commit`, {
  method: "POST", headers: { Authorization: `Bearer ${login.idToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ writes: escritas })
});
if (!res.ok) { console.error("Gravação falhou:", (await res.json()).error?.message); process.exit(1); }
console.log(`Gravado no Firestore: ${feitos.join(", ")}. Os mudados no sistema novo ficaram como estavam.`);
