/* Boletos já registrados no Coda → sis_financeiro (tipo "boleto"): um documento por boleto-pai com as
   parcelas dentro, cada uma com vencimento, valor, código, foto e pagamento. Vêm de dois docs,
   montados de jeitos diferentes:
   - "Gestor Geral" (51KbZXbhpb): pai em grid-pbYV6toV8X, parcelas na tabela Gastos (coluna Gastos do pai).
     O "Pago?" das parcelas parou de ser marcado; quem diz o que foi pago é "Boletos pagos" do pai.
     Fotos na coluna "Boletos JPEG" do pai: a _0001 é a nota e as seguintes, uma por parcela.
   - "Notas Fiscais D'Luh" (_3pbn1gzh3): notas em grid-nGAxFib51k (PDF da nota em "Link"), duplicatas em
     grid-F5NKboTSzn (imagem do boleto em "Link Boleto"). Esses links são arquivos deste PC (Downloads).
   Tudo que veio do Coda é do CNPJ antigo. O id do pai é coda-<linha do pai>; os documentos de uma
   parcela só, da primeira importação (coda-<linha da parcela>), são apagados. Rodar de novo é seguro:
   as fotos já enviadas ficam anotadas em .coda-export/boletos/arquivos.json e não sobem de novo.

   Uso (na pasta backend, PowerShell):
     node scripts/coda-boletos.mjs <TOKEN_DO_CODA>      baixa do Coda para .coda-export/boletos/ e mostra a prévia
     node scripts/coda-boletos.mjs                      prévia com a cópia já baixada
     $env:SISTEMA_SENHA="..."; node scripts/coda-boletos.mjs --gravar     (o Worker precisa estar publicado) */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const PASTA = path.join(AQUI, "..", ".coda-export", "boletos");
const PROJETO = "dluh-festas";
// A mesma chave do Firebase que o Worker usa (vars do wrangler.jsonc).
const API_KEY = /"FIREBASE_API_KEY":\s*"([^"]+)"/.exec(fs.readFileSync(path.join(AQUI, "..", "worker", "wrangler.jsonc"), "utf8"))?.[1];
const EMAIL = "sistema@dluh-festas.firebaseapp.com";
const WORKER = "https://api.dluhfestas.com";
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
const arquivoLocal = v => { const s = txt(v); return s.startsWith("file:///") ? decodeURI(s.slice(8)) : ""; };

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
// Intervalo entre os vencimentos → período (a planilha de notas não guardava).
const periodoPelasDatas = vencs => {
  if (vencs.length < 2) return "semanal";
  const dias = (new Date(vencs[1]) - new Date(vencs[0])) / 864e5;
  return dias >= 25 ? "mensal" : dias >= 12 ? "quinzenal" : "semanal";
};

/* Arquivo a subir: { fonte: url do Coda ou caminho deste PC, nome, pdf }. Na prévia só conta. */
const fonte = (de, nome) => ({ fonte: de, nome: nome.slice(0, 120), pdf: /\.pdf$/i.test(nome) });

const boletos = [];        // pais
const antigos = [];        // ids da primeira importação (uma parcela por documento), a apagar
const avisos = [];

// ── Gestor Geral ──
const gastos = new Map(linhas("gastos").map(g => [g.id, g]));
for (const pai of linhas("gestor")) {
  const v = pai.values;
  // "Parcela - 2 |04/06/2026|" no resumo dá o vencimento de cada parcela.
  const vencDoResumo = new Map([...txt(v["Resumo do Boleto"]).matchAll(/Parcela - (\d+) \|(\d{2}\/\d{2}\/\d{4})\|/g)].map(m => [Number(m[1]), brParaIso(m[2])]));
  const refs = v.Gastos || [];
  refs.forEach(r => antigos.push(`coda-${r.rowId}`));
  const filhos = refs.map(r => gastos.get(r.rowId)).filter(Boolean).sort((a, b) => dia(a.values.Data).localeCompare(dia(b.values.Data)));
  if (filhos.length < refs.length) avisos.push(`${txt(v.Fornecedor)} ${dia(v.Vencimento)}: ${refs.length - filhos.length} parcela(s) apagada(s) no Coda`);
  if (!filhos.length) continue;
  const pagas = Number(txt(v["Boletos pagos"])) || 0;
  const parcelas = filhos.map((g, i) => {
    // "Data" da parcela é o dia em que foi paga, menos nas lançadas de uma vez quando o Gestor começou
    // (22/09/2025, boletos de meses antes): aí fica o próprio vencimento.
    const data = dia(g.values.Data);
    const venc = vencDoResumo.get(Number(txt(g.values.Parcela)) || i + 1) || data;
    const pago = i < pagas || /^Pago$/i.test(txt(g.values["Pago?"]));
    return { n: i + 1, venc, valor: cent(g.values["Valor Gasto"]), codigo: "", arquivos: [], pago,
      pagoEm: pago ? ((new Date(data) - new Date(venc)) / 864e5 > 30 ? venc : data) : null };
  });
  // Fotos: _0001 é a nota; com uma a mais que as parcelas, cada seguinte é o boleto de uma parcela.
  const fotos = (v["Boletos JPEG"] || []).filter(f => f && f.url).sort((a, b) => String(a.name).localeCompare(String(b.name)))
    .map(f => fonte(f.url, f.name || "boleto.jpg"));
  const porParcela = fotos.length === parcelas.length + 1;
  boletos.push({
    id: `coda-${pai.id}`, desc: fornecedor(v.Fornecedor), periodo: /mensal/i.test(txt(v.Periodo)) ? "mensal" : "semanal",
    arquivos: porParcela ? fotos.slice(0, 1) : fotos,
    parcelas: parcelas.map((p, i) => ({ ...p, arquivos: porParcela ? [fotos[i + 1]] : [] })),
    origem: "Gestor Geral"
  });
}

// ── Notas Fiscais D'Luh ──
const duplicatas = new Map();
for (const d of linhas("notas-filhos")) {
  antigos.push(`coda-${d.id}`);
  const id = d.values["Notas Fiscais"]?.rowId;
  if (!duplicatas.has(id)) duplicatas.set(id, []);
  duplicatas.get(id).push(d);
}
for (const nota of linhas("notas-pai")) {
  const v = nota.values;
  const ds = (duplicatas.get(nota.id) || []).sort((a, b) => dia(a.values.Vencimento).localeCompare(dia(b.values.Vencimento)));
  if (!ds.length) { avisos.push(`Nota ${txt(v["NF Número"])} de ${txt(v.Fornecedor)} sem duplicatas`); continue; }
  const pdf = arquivoLocal(v.Link);
  boletos.push({
    id: `coda-${nota.id}`, desc: fornecedor(v.Fornecedor), periodo: periodoPelasDatas(ds.map(d => dia(d.values.Vencimento))),
    arquivos: pdf ? [fonte(pdf, txt(v.Arquivo) || path.basename(pdf))] : [],
    parcelas: ds.map((d, i) => {
      const venc = dia(d.values.Vencimento), pago = /^pago$/i.test(txt(d.values.Status)), img = arquivoLocal(d.values["Link Boleto"]);
      return { n: i + 1, venc, valor: cent(d.values["Valor Duplicata"]), codigo: txt(d.values["Linha Digitável"]).slice(0, 80),
        arquivos: img ? [fonte(img, path.basename(img))] : [], pago, pagoEm: pago ? venc : null }; // não guardava o dia do pagamento
    }),
    origem: "Notas Fiscais"
  });
}

for (const b of boletos) for (const p of b.parcelas) if (!p.valor || !p.venc) avisos.push(`${b.id} ${b.desc} parcela ${p.n}: sem ${!p.valor ? "valor" : "vencimento"}`);

// ── Resumo ──
const real = c => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const todasParcelas = boletos.flatMap(b => b.parcelas);
const todosArquivos = boletos.flatMap(b => [...b.arquivos, ...b.parcelas.flatMap(p => p.arquivos)]);
const faltando = todosArquivos.filter(a => !/^https:/.test(a.fonte) && !fs.existsSync(a.fonte));
const porNome = {};
for (const b of boletos) {
  const s = porNome[b.desc] ||= { n: 0, p: 0, total: 0, abertas: 0 };
  s.n++; s.p += b.parcelas.length; s.total += b.parcelas.reduce((t, p) => t + p.valor, 0); s.abertas += b.parcelas.filter(p => !p.pago).length;
}
console.log(`\n${boletos.length} boletos com ${todasParcelas.length} parcelas (Gestor Geral ${boletos.filter(b => b.origem === "Gestor Geral").length}, Notas Fiscais ${boletos.filter(b => b.origem === "Notas Fiscais").length})`);
for (const [nome, s] of Object.entries(porNome).sort((a, b) => b[1].total - a[1].total))
  console.log(`  ${nome.padEnd(12)} ${String(s.n).padStart(4)} boletos ${String(s.p).padStart(4)} parcelas  ${real(s.total).padStart(14)}  ${s.abertas ? s.abertas + " em aberto" : "todas pagas"}`);
console.log(`  ${todosArquivos.length} fotos/PDFs (${todosArquivos.filter(a => /^https:/.test(a.fonte)).length} do Coda, ${todosArquivos.filter(a => !/^https:/.test(a.fonte)).length} deste PC); todos como CNPJ antigo`);
if (faltando.length) console.log(`\nArquivos que não estão mais neste PC (ficam de fora):\n  ${faltando.map(a => a.fonte).join("\n  ")}`);
if (desconhecidos.size) console.log(`\nFornecedor sem nome curto definido (ficou como veio): ${[...desconhecidos].join(" | ")}`);
if (avisos.length) console.log(`\nAvisos:\n  ${avisos.join("\n  ")}`);
fs.writeFileSync(path.join(PASTA, "previa.json"), JSON.stringify(boletos, null, 1));
console.log("\nPrévia em .coda-export/boletos/previa.json");

if (!process.argv.includes("--gravar")) { console.log("Nada foi gravado. Para gravar: --gravar (com SISTEMA_SENHA)."); process.exit(0); }
if (desconhecidos.size) { console.error("Defina o nome curto desses fornecedores antes de gravar."); process.exit(1); }

// ── Login da conta sistema ──
const senha = process.env.SISTEMA_SENHA;
if (!senha) { console.error("Defina SISTEMA_SENHA (senha da conta sistema)."); process.exit(1); }
const login = await (await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: senha, returnSecureToken: true })
})).json();
if (!login.idToken) { console.error("Login da conta sistema falhou:", login.error?.message); process.exit(1); }
const auth = { Authorization: `Bearer ${login.idToken}`, "Content-Type": "application/json" };

// ── Fotos e PDFs → Google Drive, pelo Worker ──
const CACHE = path.join(PASTA, "arquivos.json");
const enviados = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};
const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf" };
let feitos = 0;
const falhas = [];
async function subir(a) {
  if (enviados[a.fonte]) return enviados[a.fonte];
  let bytes, tipo;
  if (/^https:/.test(a.fonte)) {
    const r = await fetch(a.fonte);
    if (!r.ok) throw new Error(`${r.status} ao baixar do Coda`);
    bytes = Buffer.from(await r.arrayBuffer());
    tipo = (r.headers.get("content-type") || "").split(";")[0];
  } else {
    if (!fs.existsSync(a.fonte)) throw new Error("não está mais neste PC");
    bytes = fs.readFileSync(a.fonte);
    tipo = MIME[path.extname(a.fonte).slice(1).toLowerCase()];
  }
  if (!Object.values(MIME).includes(tipo)) throw new Error(`tipo ${tipo || "desconhecido"}`);
  const body = JSON.stringify({ dataUrl: `data:${tipo};base64,${bytes.toString("base64")}` });
  // 5xx/429 costuma ser passageiro (limite do Worker ou do Drive): tenta de novo com pausa crescente.
  let r, corpo;
  for (let tentativa = 1; ; tentativa++) {
    r = await fetch(`${WORKER}/api/enviarArquivoBoletoSistema`, { method: "POST", headers: auth, body }).catch(() => null);
    corpo = r ? await r.json().catch(() => ({})) : {};
    if ((r && r.ok) || (r && r.status < 500 && r.status !== 429) || tentativa === 5) break;
    await new Promise(ok => setTimeout(ok, 3000 * tentativa));
  }
  if (!r || !r.ok) throw new Error(corpo.erro || String(r ? r.status : "sem conexão"));
  enviados[a.fonte] = { url: corpo.url, pdf: !!corpo.pdf };
  fs.writeFileSync(CACHE, JSON.stringify(enviados, null, 1));
  return enviados[a.fonte];
}
const resolver = async lista => {
  const saida = [];
  for (const a of lista) {
    try {
      const r = await subir(a);
      saida.push({ url: r.url, nome: a.nome, pdf: r.pdf });
      process.stdout.write(`\r  fotos/PDFs: ${++feitos}/${todosArquivos.length}`);
    } catch (e) { falhas.push(`${a.fonte}: ${e.message}`); }
  }
  return saida;
};
for (const b of boletos) {
  b.arquivos = await resolver(b.arquivos);
  for (const p of b.parcelas) p.arquivos = await resolver(p.arquivos);
}
console.log(`\n  ${falhas.length ? `${falhas.length} arquivo(s) não subiram:\n    ${falhas.join("\n    ")}` : "todos no Drive"}`);

// ── Gravação (REST, em lotes) ──
const DB = `projects/${PROJETO}/databases/(default)/documents`;
const API = `https://firestore.googleapis.com/v1/${DB}`;
const cod = v => v == null ? { nullValue: null } : typeof v === "boolean" ? { booleanValue: v }
  : typeof v === "number" ? { integerValue: String(v) } : v instanceof Date ? { timestampValue: v.toISOString() }
  : Array.isArray(v) ? { arrayValue: { values: v.map(cod) } } : typeof v === "object" ? { mapValue: { fields: campos(v) } } : { stringValue: String(v) };
const campos = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, cod(v)]));
// O mesmo resumo que o Worker grava no pai (financeiro.js).
const resumo = ps => {
  const abertas = ps.filter(p => !p.pago).sort((a, b) => a.venc.localeCompare(b.venc));
  return { valor: ps.reduce((s, p) => s + p.valor, 0), venc: abertas.length ? abertas[0].venc : ps.map(p => p.venc).sort().at(-1),
    pago: !abertas.length, pagoEm: abertas.length ? null : ps.map(p => p.pagoEm || "").sort().at(-1) || null };
};

const agora = new Date();
const novos = new Set(boletos.map(b => b.id));
const escritas = [
  ...antigos.filter(id => !novos.has(id)).map(id => ({ delete: `${DB}/sis_financeiro/${id}` })),
  ...boletos.map(({ id, origem, ...b }) => ({ update: { name: `${DB}/sis_financeiro/${id}`, fields: campos({
    tipo: "boleto", ...b, ...resumo(b.parcelas), cnpjAntigo: true,
    origem: "coda", codaDoc: origem, criadoEm: agora, atualizadoEm: agora, por: "importacao-coda"
  }) } }))
];
for (let i = 0; i < escritas.length; i += 400) {
  const res = await fetch(`${API}:commit`, { method: "POST", headers: auth, body: JSON.stringify({ writes: escritas.slice(i, i + 400) }) });
  if (!res.ok) { console.error(`Lote ${i / 400 + 1} falhou:`, (await res.json()).error?.message); process.exit(1); }
  console.log(`  gravado ${Math.min(i + 400, escritas.length)}/${escritas.length}`);
}
console.log(`Pronto: ${boletos.length} boletos no lugar das ${antigos.length} parcelas soltas da primeira importação.`);
