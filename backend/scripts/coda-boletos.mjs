/* Boletos já registrados no Coda → sis_financeiro (tipo "boleto"). Vêm de dois docs, montados de jeitos
   diferentes; cada parcela vira um boleto com fornecedor, valor, vencimento, se está pago e cnpjAntigo.
   - "Gestor Geral" (51KbZXbhpb): pai em grid-pbYV6toV8X, parcelas na tabela Gastos (coluna Gastos do pai).
     O "Pago?" das parcelas parou de ser marcado; quem diz o que foi pago é "Boletos pagos" do pai.
   - "Notas Fiscais D'Luh" (_3pbn1gzh3): notas em grid-nGAxFib51k, duplicatas em grid-F5NKboTSzn.
   Tudo que veio do Coda é do CNPJ antigo. O id é coda-<linha>, então rodar de novo só repõe os mesmos.

   Uso (na pasta backend, PowerShell):
     node scripts/coda-boletos.mjs <TOKEN_DO_CODA>      baixa do Coda para .coda-export/boletos/ e mostra a prévia
     node scripts/coda-boletos.mjs                      prévia com a cópia já baixada
     $env:SISTEMA_SENHA="..."; node scripts/coda-boletos.mjs --gravar */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const PASTA = path.join(AQUI, "..", ".coda-export", "boletos");
const PROJETO = "dluh-festas";
// A mesma chave do Firebase que o Worker usa (vars do wrangler.jsonc).
const API_KEY = /"FIREBASE_API_KEY":\s*"([^"]+)"/.exec(fs.readFileSync(path.join(AQUI, "..", "worker", "wrangler.jsonc"), "utf8"))?.[1];
const EMAIL = "sistema@dluh-festas.firebaseapp.com";
const TABELAS = {
  gestor: ["51KbZXbhpb", "grid-pbYV6toV8X"],
  gastos: ["51KbZXbhpb", "grid-_sT-G3sNbr"],
  "notas-pai": ["_3pbn1gzh3", "grid-nGAxFib51k"],
  "notas-filhos": ["_3pbn1gzh3", "grid-F5NKboTSzn"]
};

// ── Cópia do Coda (só leitura) ──
const token = process.argv.slice(2).find(a => !a.startsWith("--"));
if (token) {
  fs.mkdirSync(PASTA, { recursive: true });
  for (const [nome, [doc, tabela]] of Object.entries(TABELAS)) {
    const items = [];
    for (let url = `https://coda.io/apis/v1/docs/${doc}/tables/${tabela}/rows?limit=500&valueFormat=rich&useColumnNames=true`; url; ) {
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (r.status === 429) { await new Promise(ok => setTimeout(ok, 3000)); continue; }
      if (!r.ok) { console.error(`${r.status} em ${nome}: ${await r.text()}`); process.exit(1); }
      const j = await r.json();
      items.push(...j.items);
      url = j.nextPageLink;
    }
    fs.writeFileSync(path.join(PASTA, `${nome}.rows.json`), JSON.stringify({ items }));
    console.log(`  ${nome}: ${items.length} linhas`);
  }
}
const linhas = nome => JSON.parse(fs.readFileSync(path.join(PASTA, `${nome}.rows.json`), "utf8")).items;

// ── Valores no formato "rich" do Coda ──
const txt = v => v == null ? "" : Array.isArray(v) ? v.map(txt).join(", ")
  : typeof v === "object" ? String(v.amount ?? v.name ?? "") : String(v).replace(/```/g, "").trim();
const cent = v => Math.round((typeof v === "object" && v && "amount" in v ? v.amount : Number(txt(v).replace(/[R$\s]/g, "").replace(",", "."))) * 100) || 0;
const dia = v => (/^\d{4}-\d{2}-\d{2}/.exec(txt(v)) || [""])[0];
const brParaIso = s => s.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, "$3-$2-$1");

// Só o nome que a loja usa. OESA, Imperial, Delly's, "D'LUH FESTAS" (NF 3235017) e Manoel Jacinto (NF 2587570)
// são todos Delly's, como o dono confirmou.
const FORNECEDORES = [
  [/^(OESA|OSA |DELL[YI]|IMPERIAL|D.LUH FESTAS|MANOEL JACINTO)/i, "Delly's"],
  [/^FERMONTES/i, "Fermontes"],
  [/^(COOPERATIVA|CEMIL)/i, "Cemil"],
  [/^CERCAL/i, "Cercal"],
  [/^PREFEITURA/i, "Prefeitura"]
];
const desconhecidos = new Set();
const fornecedor = s => {
  const nome = txt(s);
  const achou = FORNECEDORES.find(([re]) => re.test(nome));
  if (!achou) desconhecidos.add(nome);
  return achou ? achou[1] : nome;
};

const boletos = [];
const avisos = [];

// ── Gestor Geral ──
const gastos = new Map(linhas("gastos").map(g => [g.id, g]));
for (const pai of linhas("gestor")) {
  const v = pai.values;
  // "Parcela - 2 |04/06/2026|" no resumo dá o vencimento de cada parcela.
  const vencDoResumo = new Map([...txt(v["Resumo do Boleto"]).matchAll(/Parcela - (\d+) \|(\d{2}\/\d{2}\/\d{4})\|/g)].map(m => [Number(m[1]), brParaIso(m[2])]));
  const parcelas = (v.Gastos || []).map(r => gastos.get(r.rowId)).filter(Boolean)
    .sort((a, b) => dia(a.values.Data).localeCompare(dia(b.values.Data)));
  if (parcelas.length < (v.Gastos || []).length) avisos.push(`${txt(v.Fornecedor)} ${dia(v.Vencimento)}: ${(v.Gastos || []).length - parcelas.length} parcela(s) apagada(s) no Coda`);
  const pagas = Number(txt(v["Boletos pagos"])) || 0;
  parcelas.forEach((g, i) => {
    const n = Number(txt(g.values.Parcela)) || i + 1;
    // "Data" da parcela é o dia em que foi paga, menos nas lançadas de uma vez quando o Gestor começou
    // (22/09/2025, boletos de meses antes): aí fica o próprio vencimento.
    const data = dia(g.values.Data);
    const venc = vencDoResumo.get(n) || data;
    const pagoEm = (new Date(data) - new Date(venc)) / 864e5 > 30 ? venc : data;
    boletos.push({
      id: `coda-${g.id}`, desc: fornecedor(v.Fornecedor), valor: cent(g.values["Valor Gasto"]),
      venc, pago: i < pagas || /^Pago$/i.test(txt(g.values["Pago?"])), pagoEm,
      origem: "Gestor Geral"
    });
  });
}

// ── Notas Fiscais D'Luh ──
const notas = new Map(linhas("notas-pai").map(n => [n.id, n]));
for (const d of linhas("notas-filhos")) {
  const v = d.values;
  const nota = notas.get(v["Notas Fiscais"]?.rowId);
  const venc = dia(v.Vencimento);
  const pago = /^pago$/i.test(txt(v.Status));
  boletos.push({
    id: `coda-${d.id}`, desc: fornecedor(nota ? nota.values.Fornecedor : v.Fornecedor), valor: cent(v["Valor Duplicata"]),
    venc, pago, pagoEm: pago ? venc : null, // a planilha não guardava o dia do pagamento
    codigo: txt(v["Linha Digitável"]) || txt(nota?.values["Linha Digitável"]),
    origem: "Notas Fiscais"
  });
}

for (const b of boletos) {
  if (!b.valor || !b.venc) avisos.push(`${b.id} ${b.desc}: sem ${!b.valor ? "valor" : "vencimento"}`);
  if (b.codigo && b.codigo.length > 80) b.codigo = b.codigo.slice(0, 80);
}

// ── Resumo ──
const real = c => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const porNome = {};
for (const b of boletos) (porNome[b.desc] ||= { n: 0, total: 0, abertos: 0 }), porNome[b.desc].n++, porNome[b.desc].total += b.valor, porNome[b.desc].abertos += b.pago ? 0 : 1;
console.log(`\n${boletos.length} boletos (Gestor Geral ${boletos.filter(b => b.origem === "Gestor Geral").length}, Notas Fiscais ${boletos.filter(b => b.origem === "Notas Fiscais").length})`);
for (const [nome, s] of Object.entries(porNome).sort((a, b) => b[1].total - a[1].total))
  console.log(`  ${nome.padEnd(12)} ${String(s.n).padStart(4)} boletos  ${real(s.total).padStart(14)}  ${s.abertos ? s.abertos + " em aberto" : "todos pagos"}`);
const vencs = boletos.map(b => b.venc).filter(Boolean).sort();
console.log(`  vencimentos de ${vencs[0]} a ${vencs.at(-1)}; todos marcados como CNPJ antigo`);
if (desconhecidos.size) console.log(`\nFornecedor sem nome curto definido (ficou como veio): ${[...desconhecidos].join(" | ")}`);
if (avisos.length) console.log(`\nAvisos:\n  ${avisos.join("\n  ")}`);
fs.writeFileSync(path.join(PASTA, "previa.json"), JSON.stringify(boletos, null, 1));
console.log("\nPrévia em .coda-export/boletos/previa.json");

if (!process.argv.includes("--gravar")) { console.log("Nada foi gravado. Para gravar: --gravar (com SISTEMA_SENHA)."); process.exit(0); }
if (desconhecidos.size) { console.error("Defina o nome curto desses fornecedores antes de gravar."); process.exit(1); }

// ── Gravação (REST, como a conta sistema) ──
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

const cod = v => v == null ? { nullValue: null } : typeof v === "boolean" ? { booleanValue: v }
  : typeof v === "number" ? { integerValue: String(v) } : v instanceof Date ? { timestampValue: v.toISOString() } : { stringValue: String(v) };
const campos = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, cod(v)]));

const agora = new Date();
const escritas = boletos.map(({ id, origem, codigo, ...b }) => ({
  update: { name: `${DB}/sis_financeiro/${id}`, fields: campos({
    tipo: "boleto", ...b, codigo: codigo || "", cnpjAntigo: true,
    origem: "coda", codaDoc: origem, criadoEm: agora, atualizadoEm: agora, por: "importacao-coda"
  }) }
}));
for (let i = 0; i < escritas.length; i += 400) {
  const res = await fetch(`${API}:commit`, { method: "POST", headers: auth, body: JSON.stringify({ writes: escritas.slice(i, i + 400) }) });
  if (!res.ok) { console.error(`Lote ${i / 400 + 1} falhou:`, (await res.json()).error?.message); process.exit(1); }
  console.log(`  gravado ${Math.min(i + 400, escritas.length)}/${escritas.length}`);
}
console.log("Pronto.");
