/* Pedido e consultas da Sofia (sofia.js), contra o emulador do Firestore — `npm test` na pasta backend. */
import { test, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { criarFirestore } from "../src/firestore.js";
import { pedidoDaSofia, pedidosDoCliente, conferirParaPagar, sugestoes } from "../src/sofia.js";

const HOST = `http://${process.env.FIRESTORE_EMULATOR_HOST}`;
const PROJETO = "demo-dluh";
function tokenFalso(claims) {
  const b64 = o => Buffer.from(JSON.stringify(o)).toString("base64url");
  const agora = Math.floor(Date.now() / 1000);
  return `${b64({ alg: "none", typ: "JWT" })}.${b64({
    iss: `https://securetoken.google.com/${PROJETO}`, aud: PROJETO, iat: agora, exp: agora + 3600, auth_time: agora,
    sub: "sistema-uid", user_id: "sistema-uid", ...claims
  })}.`;
}
const SISTEMA = tokenFalso({ email: "sistema@dluh-festas.firebaseapp.com", firebase: { sign_in_provider: "password", identities: {} } });
const db = criarFirestore({ projectId: PROJETO, token: async () => SISTEMA, host: HOST });

before(async () => {
  const res = await fetch(`${HOST}/emulator/v1/projects/${PROJETO}:securityRules`, {
    method: "PUT",
    body: JSON.stringify({ rules: { files: [{ content: fs.readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8") }] } })
  });
  assert.ok(res.ok, "regras não carregaram no emulador");
});

beforeEach(async () => {
  await fetch(`${HOST}/emulator/v1/projects/${PROJETO}/databases/(default)/documents`, { method: "DELETE" });
  await db.collection("sis_produtos").doc("coxinha").set({ nome: "Coxinha", categoria: "Salgado Frito", valorUnit: 75, qtdMin: 25, ativo: true, tiposPacote: [] });
  await db.collection("sis_produtos").doc("pastel").set({ nome: "Pastel frango", categoria: "Assado", valorUnit: 80, qtdMin: 25, ativo: true, tiposPacote: [] });
  await db.collection("sis_produtos").doc("pipoca").set({ nome: "Pastel Pipoca de Frango", categoria: "Salgado Frito", valorUnit: 75, qtdMin: 25, ativo: true, tiposPacote: [] });
  await db.collection("sis_produtos").doc("bolo15").set({ nome: "🍰Bolo aro 15", categoria: "Bolo", valorUnit: 11000, qtdMin: 1, ativo: true, tiposPacote: [] });
  await db.doc("sis_catalogo/recheios").set({ lista: ["Creme Ninho", "Brigadeiro"] });
});

const AGORA = new Date("2026-10-08T15:00:00Z");
const base = (extra = {}) => ({
  nome: "Maria", telefone: "5538998124410", data: "15/10/2026", hora: "15h", modo: "retirada",
  itens: "50 coxinhas\n1 bolo aro 15 (recheios: Creme Ninho e Brigadeiro; tema: Frozen)", ...extra
});

test("vira o mesmo pedido do site, com preço do catálogo e origem whatsapp", async () => {
  const r = await pedidoDaSofia(db, base(), { agora: AGORA });
  const p = (await db.collection("sis_pedidos").doc(r.id).get()).data();
  assert.equal(p.total, 50 * 75 + 11000);
  assert.equal(p.origem, "whatsapp");
  assert.equal(p.status, "Aguardando confirmação");
  assert.deepEqual(p.entrega, { modo: "retirada", data: "2026-10-15", hora: "15:00" });
  assert.equal(p.itens[1].nome, "Bolo aro 15");
  assert.deepEqual(p.itens[1].recheios, ["Creme Ninho", "Brigadeiro"]);
  assert.deepEqual(p.itens[1].topo, { tema: "Frozen" });
});

test("nome ambíguo ou inexistente volta erro com os parecidos, sem criar pedido", async () => {
  await assert.rejects(pedidoDaSofia(db, base({ itens: "50 pastel" }), { agora: AGORA }), /mais de um produto.*Pastel/);
  await assert.rejects(pedidoDaSofia(db, base({ itens: "50 esfiha" }), { agora: AGORA }), /não achei "esfiha"/);
  assert.equal((await db.collection("sis_pedidos").listar()).length, 0);
});

test("regras do site continuam valendo: mínimo, horário e entrega com endereço", async () => {
  await assert.rejects(pedidoDaSofia(db, base({ itens: "10 coxinha" }), { agora: AGORA }), /mínimo é 25/);
  await assert.rejects(pedidoDaSofia(db, base({ hora: "21h" }), { agora: AGORA }), /entre 8h e 19h/);
  await assert.rejects(pedidoDaSofia(db, base({ modo: "entrega" }), { agora: AGORA }), /endereço/);
});

test("consulta acha o pedido com ou sem 55/9 e mostra o que falta; link só para pedido confirmado do mesmo telefone", async () => {
  const r = await pedidoDaSofia(db, base({ telefone: "(38) 99812-4410" }), { agora: AGORA });
  const c = await pedidosDoCliente(db, "553898124410");
  assert.equal(c.pedidos.length, 1);
  assert.equal(c.pedidos[0].falta, "R$ 147,50");

  await assert.rejects(conferirParaPagar(db, { telefone: "5538998124410", pedido: r.id }), /ainda não foi confirmado/);
  await db.collection("sis_pedidos").doc(r.id).set({ status: "Confirmado", pago: 7375 }, { merge: true });
  assert.equal(await conferirParaPagar(db, { telefone: "5538998124410", pedido: r.id.replace("PED-", "") }), r.id);
  await assert.rejects(conferirParaPagar(db, { telefone: "5538911112222", pedido: r.id }), /Não achei/);
  assert.deepEqual((await pedidosDoCliente(db, "5538911112222")).pedidos, []);
});

test("sugestões: o que o cliente costuma pedir; sem histórico, os mais pedidos da semana", async () => {
  await pedidoDaSofia(db, base({ itens: "50 coxinha\n25 pastel frango", data: "10/10/2026" }), { agora: AGORA });
  await pedidoDaSofia(db, base({ itens: "50 coxinha", data: "11/10/2026" }), { agora: AGORA });
  await pedidoDaSofia(db, base({ telefone: "5538911112222", itens: "100 pastel pipoca de frango", data: "09/10/2026" }), { agora: AGORA });

  const minhas = await sugestoes(db, "38998124410", { agora: AGORA });
  assert.equal(minhas.base, "pedidos anteriores do cliente");
  assert.deepEqual(minhas.itens.map(i => [i.produto, i.quantidade, i.pedidos]), [["Coxinha", 100, 2], ["Pastel frango", 25, 1]]);

  const novo = await sugestoes(db, "5538900000000", { agora: new Date("2026-10-12T15:00:00Z") });
  assert.equal(novo.base, "mais pedidos da semana");
  assert.equal(novo.itens[0].produto, "Coxinha");
  assert.ok(novo.itens.some(i => i.produto === "Pastel Pipoca de Frango"));
});
