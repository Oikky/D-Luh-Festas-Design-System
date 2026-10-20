/* Lista de bloqueio da Sofia: números (robôs de outras empresas etc.) com quem ela nunca fala — a
   conversa vai direto para atendimento humano, sem gastar crédito. Fica em sis_ia/sofia-bloqueio
   e o Worker lê a cada mensagem (sofia-humano.js), então vale na hora, sem deploy.

   Uso (na pasta backend):
     node scripts/sofia-bloquear.mjs                     → mostra a lista
     node scripts/sofia-bloquear.mjs <tel> [<tel>...]    → bloqueia
     node scripts/sofia-bloquear.mjs --tirar <tel>       → desbloqueia
   Telefone em qualquer formato (compara os 8 últimos dígitos). Senha: SISTEMA_SENHA no backend/.env. */
import fs from "node:fs";
import { criarFirestore } from "../worker/src/firestore.js";
import { tokenDoSistema } from "../worker/src/auth.js";

const sair = msg => { console.error(msg); process.exit(1); };
function senha() {
  if (process.env.SISTEMA_SENHA) return process.env.SISTEMA_SENHA;
  const arq = new URL("../.env", import.meta.url);
  const linha = fs.existsSync(arq) && fs.readFileSync(arq, "utf8").split(/\r?\n/).find(l => l.startsWith("SISTEMA_SENHA="));
  return linha ? linha.slice("SISTEMA_SENHA=".length).trim().replace(/^(["'])(.*)\1$/, "$2") : sair("Defina SISTEMA_SENHA (ou backend/.env com SISTEMA_SENHA=...).");
}
const env = { FIREBASE_API_KEY: "AIzaSyCV7LcTZmCE9MpezCvBah0hHQ245WYcixs", SISTEMA_EMAIL: "sistema@dluh-festas.firebaseapp.com", SISTEMA_SENHA: senha() };
const db = criarFirestore({ projectId: "dluh-festas", token: () => tokenDoSistema(env) });

const fim8 = t => String(t).replace(/\D/g, "").slice(-8);
const ref = db.collection("sis_ia").doc("sofia-bloqueio");
const snap = await ref.get();
let numeros = snap.exists ? snap.data().numeros || [] : [];

const args = process.argv.slice(2);
const tirar = args[0] === "--tirar";
const tels = (tirar ? args.slice(1) : args).map(t => String(t).replace(/\D/g, ""));
if (tels.some(t => t.length < 8)) sair(`Telefone estranho: ${tels.find(t => t.length < 8)}`);

if (tels.length) {
  numeros = tirar
    ? numeros.filter(n => !tels.some(t => fim8(t) === fim8(n)))
    : [...numeros, ...tels.filter(t => !numeros.some(n => fim8(n) === fim8(t)))];
  await ref.set({ numeros, atualizado: Date.now() });
}
console.log(numeros.length ? `Bloqueados (${numeros.length}):\n${numeros.join("\n")}` : "Lista de bloqueio vazia.");
