/* Grava no Firestore o ponto de partida da tela Custos (ui_kits/admin/custos-inicio.js: o que está em
   Contexto_Completo_Dluh_Festas.md) e publica o cardápio do formulário do site (sis_catalogo/buffet).
   Não sobrescreve o que a equipe já salvou pela tela, a menos que rode com --substituir.

   Uso (na pasta backend):  node scripts/custos-gravar.mjs [--substituir]
   Senha: SISTEMA_SENHA no backend/.env. */
import fs from "node:fs";
import { createRequire } from "node:module";
import { criarFirestore, FieldValue } from "../worker/src/firestore.js";
import { tokenDoSistema } from "../worker/src/auth.js";
import { validarCustos, publicarCardapio, CUSTOS } from "../worker/src/custos.js";

const sair = msg => { console.error(msg); process.exit(1); };
function senha() {
  if (process.env.SISTEMA_SENHA) return process.env.SISTEMA_SENHA;
  const arq = new URL("../.env", import.meta.url);
  const linha = fs.existsSync(arq) && fs.readFileSync(arq, "utf8").split(/\r?\n/).find(l => l.startsWith("SISTEMA_SENHA="));
  return linha ? linha.slice("SISTEMA_SENHA=".length).trim().replace(/^(["'])(.*)\1$/, "$2") : sair("Defina SISTEMA_SENHA (ou backend/.env com SISTEMA_SENHA=...).");
}
const env = { FIREBASE_API_KEY: "AIzaSyCV7LcTZmCE9MpezCvBah0hHQ245WYcixs", SISTEMA_EMAIL: "sistema@dluh-festas.firebaseapp.com", SISTEMA_SENHA: senha() };
const db = criarFirestore({ projectId: "dluh-festas", token: () => tokenDoSistema(env) });

const inicio = createRequire(import.meta.url)("../../ui_kits/admin/custos-inicio.js");
const atual = await db.doc(CUSTOS).get();
if (atual.exists && !process.argv.includes("--substituir")) {
  console.log("sis_custos/base já existe (salvo pela tela); não mexi. Use --substituir para trocar pelo ponto de partida.");
} else {
  await db.doc(CUSTOS).set({ ...validarCustos(inicio), atualizadoEm: FieldValue.serverTimestamp(), por: "custos-gravar" });
  console.log(`Gravado: ${inicio.ingredientes.length} ingredientes, ${inicio.fichas.length} fichas, ${inicio.pacotes.length} pacotes.`);
}
console.log("Cardápio do site publicado:", await publicarCardapio(db));
