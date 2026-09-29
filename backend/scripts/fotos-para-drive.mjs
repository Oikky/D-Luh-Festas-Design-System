/* Tira as fotos dos produtos do Coda: sobe cada foto (já reduzida, uma por produto, com o nome
   <id do produto>.jpg) para o Google Drive pelo Worker e grava o link novo em sis_produtos.
   No fim apaga o produto repetido (a "Coxinha" sem foto criada em teste).
   Pode rodar de novo: pula os produtos cuja foto já não é do Coda.

   No PowerShell, na pasta backend:
     $env:SISTEMA_SENHA="..."; node scripts/fotos-para-drive.mjs "$env:USERPROFILE\Downloads\dluhfestas\img\produtos" */
import fs from "node:fs";
import path from "node:path";

const API_KEY = "AIzaSyCV7LcTZmCE9MpezCvBah0hHQ245WYcixs";
const EMAIL = "sistema@dluh-festas.firebaseapp.com";
const WORKER = "https://dluh-api.sitedluh.workers.dev";
const FIRESTORE = "https://firestore.googleapis.com/v1/projects/dluh-festas/databases/(default)/documents";
const REPETIDO = "7Mo9fsGqbHnFtKxFWV7d";

const pasta = process.argv[2];
const senha = process.env.SISTEMA_SENHA;
if (!pasta || !fs.existsSync(pasta)) { console.error("Informe a pasta das fotos (ex.: Downloads\\dluhfestas\\img\\produtos)."); process.exit(1); }
if (!senha) { console.error("Defina SISTEMA_SENHA (senha da conta sistema)."); process.exit(1); }

const login = await (await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: senha, returnSecureToken: true })
})).json();
if (!login.idToken) { console.error("Login da conta sistema falhou:", login.error?.message || login); process.exit(1); }
const token = login.idToken;

const fotos = fs.readdirSync(pasta).filter(f => /\.jpe?g$/i.test(f));
let feitas = 0, puladas = 0;
const falhas = [];
for (const [i, arq] of fotos.entries()) {
  const id = path.basename(arq, path.extname(arq));
  const atual = await (await fetch(`${FIRESTORE}/sis_produtos/${id}`)).json();
  const imagem = atual?.fields?.imagem?.stringValue || "";
  if (atual.error) { falhas.push(`${id}: produto não existe`); continue; }
  if (imagem && !imagem.includes("codahosted.io")) { puladas++; continue; }
  const dataUrl = `data:image/jpeg;base64,${fs.readFileSync(path.join(pasta, arq)).toString("base64")}`;
  const r = await fetch(`${WORKER}/api/trocarFotoProduto`, {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id, dataUrl })
  });
  const corpo = await r.json().catch(() => ({}));
  if (r.ok) feitas++; else falhas.push(`${id}: ${corpo.erro || r.status}`);
  process.stdout.write(`\r${i + 1}/${fotos.length} fotos`);
}
console.log(`\nNo Drive: ${feitas} · já estavam fora do Coda: ${puladas} · falhas: ${falhas.length}`);
falhas.forEach(f => console.log("  ", f));

const apagar = await fetch(`${FIRESTORE}/sis_produtos/${REPETIDO}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
console.log(apagar.ok ? "Coxinha repetida apagada." : `Não apaguei a Coxinha repetida (${apagar.status}).`);
