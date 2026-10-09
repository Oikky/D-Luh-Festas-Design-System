/* Desfaz a gambiarra de 08/10/2026: copia de volta para o banco principal (dluh-festas) o que mudou
   no reserva (dluh-festas-reserva) depois do backup que o montou (2026-10-08T06:01Z).

   - sis_pedidos: os da reserva com atualizadoEm depois do corte (PED-3261+ e edições de antigos),
     com a subcoleção eventos. Se o mesmo pedido também mudou no principal depois do corte, é
     conflito: não grava, só lista.
   - Outras coleções (pagamentos, financeiro, IA...): documento que não existe no principal é
     copiado; se existe nos dois e o do principal não mudou depois do corte, vale o da reserva
     quando ele tem data (atualizadoEm/em/criadoEm) depois do corte; senão fica o do principal.
   - sis_config/contador: fica o maior "ultimo".
   Os pedidos PED-3061..3260 que só existem no principal não são tocados.

   Uso (na pasta backend):  node scripts/juntar-reserva.mjs [--gravar]
   Senha: SISTEMA_SENHA do backend/.env (a mesma nos dois projetos desde 09/10). O .env é lido à mão
   porque a senha termina em "#" e o `node --env-file` corta ali. */
import fs from "node:fs";
import { criarFirestore } from "../worker/src/firestore.js";

const CORTE = new Date("2026-10-08T06:01:34Z");
const EMAIL = "sistema@dluh-festas.firebaseapp.com";
const PROJETOS = {
  principal: { id: "dluh-festas", key: "AIzaSyCV7LcTZmCE9MpezCvBah0hHQ245WYcixs" },
  reserva: { id: "dluh-festas-reserva", key: "AIzaSyAeUAqcEZojhEqrsubbV0nx6zmN-4hcBX0" }
};
const gravar = process.argv.includes("--gravar");
const env = Object.fromEntries(fs.readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)
  .filter(l => /^\w+=/.test(l)).map(l => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]));

async function conectar({ id, key }, senha) {
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${key}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: senha, returnSecureToken: true })
  }).then(r => r.json());
  if (!r.idToken) throw new Error(`login em ${id} falhou: ${r.error?.message}`);
  return criarFirestore({ projectId: id, token: async () => r.idToken });
}

const princ = await conectar(PROJETOS.principal, env.SISTEMA_SENHA);
const res = await conectar(PROJETOS.reserva, env.SISTEMA_SENHA_RESERVA || env.SISTEMA_SENHA);

// As coleções do sistema (as de firestore.rules); listar coleções não é permitido para essa conta.
const COLECOES = ["sis_pedidos", "sis_pagamentos", "sis_financeiro", "sis_produtos", "sis_catalogo", "sis_config", "sis_ia", "sis_ia_msgs"];
const dataDe = d => [d.atualizadoEm, d.em, d.criadoEm].find(x => x instanceof Date) || null;
const depois = d => { const x = dataDe(d); return !!x && x > CORTE; };

// Lê do principal só os documentos que interessam, 100 por vez.
async function lerVarios(db, colecao, ids) {
  const mapa = new Map();
  for (let i = 0; i < ids.length; i += 100) {
    const snaps = await db._batchGet(ids.slice(i, i + 100).map(id => db.collection(colecao).doc(id)));
    for (const s of snaps) if (s.exists) mapa.set(s.id, s.data());
  }
  return mapa;
}


const plano = []; // { colecao, id, dados, eventos? }
const conflitos = [];
const resumo = {};

for (const c of COLECOES) {
  const docsRes = await res.collection(c).listar();
  if (c === "sis_config") {
    const r = docsRes.find(d => d.id === "contador");
    const p = (await lerVarios(princ, c, ["contador"])).get("contador");
    if (r && p) resumo.contador = { reserva: r.ultimo, principal: p.ultimo };
    continue;
  }
  const candidatos = c === "sis_pedidos" ? docsRes.filter(depois) : docsRes;
  const doPrinc = await lerVarios(princ, c, candidatos.map(d => d.id));
  let novos = 0, atualizados = 0;
  for (const { id, ...dados } of candidatos) {
    const p = doPrinc.get(id);
    if (!p) { plano.push({ colecao: c, id, dados }); novos++; continue; }
    if (c !== "sis_pedidos" && !depois(dados)) continue; // igual ao backup: nada a fazer
    if (depois(p)) { conflitos.push(`${c}/${id} (principal ${dataDe(p)?.toISOString()}, reserva ${dataDe(dados)?.toISOString()})`); continue; }
    plano.push({ colecao: c, id, dados }); atualizados++;
  }
  resumo[c] = { naReserva: docsRes.length, novos, atualizados };
}

// Eventos dos pedidos que vão ser copiados.
for (const item of plano.filter(i => i.colecao === "sis_pedidos")) {
  item.eventos = (await res.collection("sis_pedidos").doc(item.id).collection("eventos").listar())
    .filter(e => depois(e) || !(dataDe(e)));
}

console.log("\nresumo:", JSON.stringify(resumo, null, 1));
const peds = plano.filter(i => i.colecao === "sis_pedidos").map(i => i.id);
console.log(`\npedidos a gravar (${peds.length}):`, peds.join(", "));
console.log(`eventos a gravar: ${plano.reduce((s, i) => s + (i.eventos?.length || 0), 0)}`);
console.log(`conflitos (${conflitos.length}):`, conflitos.join("; ") || "nenhum");

if (!gravar) { console.log("\nmodo seco: nada gravado. Rode com --gravar."); process.exit(0); }

for (let i = 0; i < plano.length; i += 20) {
  await Promise.all(plano.slice(i, i + 20).map(async ({ colecao, id, dados, eventos }) => {
    await princ.collection(colecao).doc(id).set(dados);
    for (const { id: eid, ...ev } of eventos || []) await princ.collection(colecao).doc(id).collection("eventos").doc(eid).set(ev);
  }));
}
if (resumo.contador) {
  const ultimo = Math.max(resumo.contador.reserva, resumo.contador.principal);
  await princ.collection("sis_config").doc("contador").set({ ultimo }, { merge: true });
  console.log("contador do principal:", ultimo);
}
console.log(`gravado: ${plano.length} documentos`);
