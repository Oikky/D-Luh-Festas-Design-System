/* Passo 1 da migração Coda → Firestore: copia o doc "Vendas 2" inteiro para backend/.coda-export/
   (um JSON por tabela, com colunas e linhas). Só lê o Coda. A pasta tem dados de clientes e fica fora do Git.
   Uso (na pasta backend):  node scripts/coda-exportar.js <TOKEN_DO_CODA> */
const fs = require("node:fs");
const path = require("node:path");

const DOC = "Wq8ktEEI3N";
const token = process.argv[2];
if (!token) { console.error("Uso: node scripts/coda-exportar.js <TOKEN_DO_CODA>"); process.exit(1); }
const destino = path.join(__dirname, "..", ".coda-export");

async function coda(url) {
  for (let tentativa = 1; ; tentativa++) {
    const r = await fetch(url.startsWith("http") ? url : `https://coda.io/apis/v1/docs/${DOC}${url}`,
      { headers: { Authorization: `Bearer ${token}` } });
    if (r.status === 429 && tentativa < 6) { await new Promise(ok => setTimeout(ok, 2000 * tentativa)); continue; }
    if (!r.ok) throw new Error(`${r.status} em ${url}: ${await r.text()}`);
    return r.json();
  }
}

async function todos(url) {
  const itens = [];
  for (let prox = url; prox; ) { const j = await coda(prox); itens.push(...j.items); prox = j.nextPageLink; }
  return itens;
}

(async () => {
  fs.mkdirSync(destino, { recursive: true });
  const tabelas = (await todos("/tables?limit=100")).filter(t => t.tableType === "table");
  console.log(`${tabelas.length} tabelas (views ficam de fora)`);
  for (const t of tabelas) {
    const colunas = await todos(`/tables/${t.id}/columns?limit=100`);
    const linhas = await todos(`/tables/${t.id}/rows?limit=500&valueFormat=simpleWithArrays&useColumnNames=true`);
    const arquivo = t.name.replace(/[^\w\- ]+/g, "_") + ".json";
    fs.writeFileSync(path.join(destino, arquivo), JSON.stringify({
      id: t.id, nome: t.name,
      colunas: colunas.map(c => ({ id: c.id, nome: c.name, tipo: c.format?.type, calculada: !!c.calculated })),
      linhas: linhas.map(l => ({ id: l.id, criada: l.createdAt, atualizada: l.updatedAt, valores: l.values }))
    }, null, 1));
    console.log(`  ${t.name}: ${linhas.length} linhas → .coda-export/${arquivo}`);
  }
  console.log("Pronto. Nada foi alterado no Coda.");
})().catch(e => { console.error(e.message); process.exit(1); });
