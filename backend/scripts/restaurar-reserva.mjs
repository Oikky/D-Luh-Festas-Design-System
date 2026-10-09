/* Gambiarra de 08/10/2026 (cota do Firestore estourada): copia um backup diário do Drive
   (backup-dluh-AAAA-MM-DD.json) para o projeto reserva dluh-festas-reserva.
   As datas viraram texto ISO no JSON; aqui voltam a ser timestamp. O contador de pedidos sobe
   uma folga para não repetir número de pedido criado depois do backup no banco principal.

   Uso (na pasta backend):  $env:SENHA_RESERVA="..."; node scripts/restaurar-reserva.mjs <arquivo.json> [--gravar] */
import fs from "node:fs";
import { criarFirestore } from "../worker/src/firestore.js";

const PROJETO = "dluh-festas-reserva";
const API_KEY = "AIzaSyAeUAqcEZojhEqrsubbV0nx6zmN-4hcBX0";
const EMAIL = "sistema@dluh-festas.firebaseapp.com";
const FOLGA = 200;

const [arquivo] = process.argv.slice(2).filter(a => !a.startsWith("--"));
const gravar = process.argv.includes("--gravar");
const backup = JSON.parse(fs.readFileSync(arquivo, "utf8"));

const ISO = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/;
const reviver = v => typeof v === "string" && ISO.test(v) ? new Date(v)
  : Array.isArray(v) ? v.map(reviver)
  : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, reviver(x)]))
  : v;

const colecoes = Object.keys(backup).filter(k => Array.isArray(backup[k]));
for (const c of colecoes) console.log(c, backup[c].length);
console.log("sis_config:", JSON.stringify(backup.sis_config, null, 1).slice(0, 1500));
if (!gravar) process.exit(0);

const login = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: process.env.SENHA_RESERVA, returnSecureToken: true })
}).then(r => r.json());
if (!login.idToken) throw new Error("login falhou: " + JSON.stringify(login.error));
const db = criarFirestore({ projectId: PROJETO, token: async () => login.idToken });

let total = 0;
for (const c of colecoes) {
  const docs = backup[c].map(reviver);
  for (let i = 0; i < docs.length; i += 20) {
    await Promise.all(docs.slice(i, i + 20).map(({ id, ...dados }) => {
      if (c === "sis_config") for (const [k, v] of Object.entries(dados)) if (/contador|ultimo|proximo|seq/i.test(k) && typeof v === "number") dados[k] = v + FOLGA;
      return db.collection(c).doc(id).set(dados);
    }));
    total += Math.min(20, docs.length - i);
  }
  console.log("gravado", c, docs.length);
}
console.log("total", total);
