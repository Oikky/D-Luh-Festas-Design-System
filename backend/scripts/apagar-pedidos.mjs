/* Apaga de vez pedidos (de teste): o documento em sis_pedidos, o histórico (eventos) e os
   pagamentos ligados a ele em sis_pagamentos. Só apaga pedido que está "Cancelado".
   Sem --apagar só lista o que sairia.

   Uso (na pasta backend, PowerShell):
     $env:SISTEMA_SENHA='...'; node scripts/apagar-pedidos.mjs PED-3001 PED-3002
     $env:SISTEMA_SENHA='...'; node scripts/apagar-pedidos.mjs PED-3001 PED-3002 --apagar */
const PROJETO = "dluh-festas";
const API_KEY = "AIzaSyCV7LcTZmCE9MpezCvBah0hHQ245WYcixs";
const EMAIL = "sistema@dluh-festas.firebaseapp.com";
const DB = `projects/${PROJETO}/databases/(default)/documents`;
const API = `https://firestore.googleapis.com/v1/${DB}`;

const ids = process.argv.slice(2).filter(a => !a.startsWith("--"));
const apagar = process.argv.includes("--apagar");
if (!ids.length) { console.error("Informe os IDs: node scripts/apagar-pedidos.mjs PED-3001 ..."); process.exit(1); }
if (!process.env.SISTEMA_SENHA) { console.error("Defina SISTEMA_SENHA (senha da conta sistema)."); process.exit(1); }

const login = await (await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: process.env.SISTEMA_SENHA, returnSecureToken: true })
})).json();
if (!login.idToken) { console.error("Login da conta sistema falhou:", login.error?.message); process.exit(1); }
const auth = { Authorization: `Bearer ${login.idToken}`, "Content-Type": "application/json" };
const json = async (url, init) => { const r = await fetch(url, { headers: auth, ...init }); const j = await r.json(); if (!r.ok && r.status !== 404) throw new Error(j.error?.message || r.status); return r.status === 404 ? null : j; };

const apagaveis = [];
for (const id of ids) {
  const doc = await json(`${API}/sis_pedidos/${encodeURIComponent(id)}`);
  if (!doc) { console.log(`${id}: não existe`); continue; }
  const f = doc.fields || {};
  const status = f.status?.stringValue;
  const cliente = f.cliente?.mapValue?.fields?.nome?.stringValue;
  if (status !== "Cancelado") { console.log(`${id} (${cliente}): está "${status}", não é cancelado — fica`); continue; }
  const eventos = (await json(`${API}/sis_pedidos/${encodeURIComponent(id)}/eventos?pageSize=300&mask.fieldPaths=tipo`))?.documents || [];
  const pagtos = ((await json(`${API}:runQuery`, { method: "POST", body: JSON.stringify({ structuredQuery: {
    from: [{ collectionId: "sis_pagamentos" }],
    where: { fieldFilter: { field: { fieldPath: "pedidoId" }, op: "EQUAL", value: { stringValue: id } } }
  } }) })) || []).filter(r => r.document).map(r => r.document);
  console.log(`${id} (${cliente}): ${eventos.length} eventos, ${pagtos.length} pagamentos`);
  apagaveis.push(doc.name, ...eventos.map(e => e.name), ...pagtos.map(p => p.name));
}

if (!apagar) { console.log(`\nNada foi apagado (${apagaveis.length} documentos sairiam). Para apagar: --apagar`); process.exit(0); }
for (let i = 0; i < apagaveis.length; i += 400) {
  await json(`${API}:commit`, { method: "POST", body: JSON.stringify({ writes: apagaveis.slice(i, i + 400).map(name => ({ delete: name })) }) });
}
console.log(`\nApagados ${apagaveis.length} documentos.`);
