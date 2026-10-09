/* Rotas públicas do site (site.js), contra o emulador do Firestore — `npm test` na pasta backend. */
import { test, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { criarFirestore } from "../src/firestore.js";
import { pedidoDoSite, consultarDoSite, entregaDoSite, telIguais, hojeBrasilia } from "../src/site.js";

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
  await db.collection("sis_produtos").doc("bolo18").set({ nome: "🎂 Bolo aro 18", categoria: "Bolo", valorUnit: 14000, qtdMin: 1, ativo: true, tiposPacote: [] });
  await db.collection("sis_produtos").doc("velho").set({ nome: "Kit Festa", categoria: "Kit", valorUnit: 900, qtdMin: 1, ativo: false, tiposPacote: [] });
  await db.doc("sis_catalogo/recheios").set({ lista: ["Creme Ninho", "Brigadeiro"] });
});

const AGORA = new Date("2026-10-01T15:00:00Z");
const pedido = (extra = {}) => ({
  cliente: { nome: "Maria", telefone: "(38) 99812-4410" },
  entrega: { modo: "retirada", data: "2026-10-05", hora: "15:00" },
  itens: [{ produtoId: "coxinha", qtd: 50, valorUnit: 1, nome: "Coxinha barata" }],
  ...extra
});

test("usa o preço e o nome do catálogo, não os do navegador", async () => {
  const r = await pedidoDoSite(db, pedido({
    itens: [{ produtoId: "coxinha", qtd: 50, valorUnit: 1 }, { produtoId: "bolo18", qtd: 1, recheios: ["Creme Ninho", "Inventado"], topo: { tema: "Frozen" } }]
  }), { agora: AGORA });
  const p = (await db.collection("sis_pedidos").doc(r.id).get()).data();
  assert.equal(p.total, 50 * 75 + 14000);
  assert.equal(p.origem, "site");
  assert.equal(p.status, "Aguardando confirmação");
  assert.equal(p.itens[1].nome, "Bolo aro 18");
  assert.deepEqual(p.itens[1].recheios, ["Creme Ninho"]);
  assert.deepEqual(p.itens[1].topo, { tema: "Frozen" });
});

test("entrega: a taxa vem da estimativa do servidor, não do navegador; sem estimativa fica 0", async () => {
  const entrega = { modo: "entrega", data: "2026-10-05", hora: "15:00", endereco: "Rua A, 1 — Centro", local: { rua: "Rua A", numero: "1", bairro: "Centro" } };
  const pedidos = [];
  const r = await pedidoDoSite(db, pedido({ entrega, taxaEntrega: 1 }), { agora: AGORA, frete: async l => { pedidos.push(l); return { disponivel: true, taxa: 1200 }; } });
  const p = (await db.collection("sis_pedidos").doc(r.id).get()).data();
  assert.equal(p.taxaEntrega, 1200);
  assert.equal(p.total, 50 * 75 + 1200);
  assert.equal(pedidos[0].bairro, "Centro");
  const sem = await pedidoDoSite(db, pedido({ entrega }), { agora: AGORA, frete: async () => ({ disponivel: false }) });
  assert.equal((await db.collection("sis_pedidos").doc(sem.id).get()).get("taxaEntrega"), 0);
  const retirada = await pedidoDoSite(db, pedido(), { agora: AGORA, frete: async () => { throw new Error("retirada não tem frete"); } });
  assert.equal((await db.collection("sis_pedidos").doc(retirada.id).get()).get("taxaEntrega"), 0);
});

test("recusa produto inativo, mínimo não atingido e dia que já passou", async () => {
  await assert.rejects(pedidoDoSite(db, pedido({ itens: [{ produtoId: "velho", qtd: 1 }] }), { agora: AGORA }), /saiu do cardápio/);
  await assert.rejects(pedidoDoSite(db, pedido({ itens: [{ produtoId: "coxinha", qtd: 10 }] }), { agora: AGORA }), /mínimo é 25/);
  await assert.rejects(pedidoDoSite(db, pedido({ entrega: { modo: "retirada", data: "2026-09-30" } }), { agora: AGORA }), /a partir de hoje/);
  await assert.rejects(pedidoDoSite(db, pedido({ itens: [{ produtoId: "naoexiste", qtd: 1 }] }), { agora: AGORA }), /saiu do cardápio/);
});

test("consultar só mostra com o telefone certo, e sem o telefone completo", async () => {
  const { id } = await pedidoDoSite(db, pedido(), { agora: AGORA });
  const n = id.replace("PED-", "");
  assert.deepEqual(await consultarDoSite(db, { numero: n, telefone: "38 3333-0000" }), { erro: "nao-encontrado" });
  assert.deepEqual(await consultarDoSite(db, { numero: "999999", telefone: "38998124410" }), { erro: "nao-encontrado" });
  const r = await consultarDoSite(db, { numero: `ped ${n}`, telefone: "5538 9812-4410" });
  assert.equal(r.pedido.id, id);
  assert.equal(r.pedido.total, 50 * 75);
  assert.equal(JSON.stringify(r).includes("99812"), false);
});

test("entregador da RYD: andamento sempre; nome (só o primeiro) e foto depois que alguém aceitou; cancelada some", async () => {
  const { id } = await pedidoDoSite(db, pedido(), { agora: AGORA });
  const n = id.replace("PED-", "");
  const tel = "38998124410";
  const ref = db.collection("sis_pedidos").doc(id);
  assert.deepEqual(await entregaDoSite(db, { numero: n, telefone: tel }), { status: "Aguardando confirmação", entregador: null });
  assert.equal((await consultarDoSite(db, { numero: n, telefone: tel })).pedido.entregador, undefined);

  await ref.set({ ryd: { deliveryId: "7", status: "pending", entregador: null, valor: 800, chamadoPor: "ana@dluh" } }, { merge: true });
  assert.deepEqual((await entregaDoSite(db, { numero: n, telefone: tel })).entregador, { status: "pending" });

  await ref.set({ ryd: { deliveryId: "7", status: "delivering", entregador: { nome: "João Pereira", foto: "https://x/f.jpg" }, valor: 800 } }, { merge: true });
  const r = await consultarDoSite(db, { numero: n, telefone: tel });
  assert.deepEqual(r.pedido.entregador, { status: "delivering", nome: "João", foto: "https://x/f.jpg" });
  assert.equal(JSON.stringify(r).includes("800"), false, "o custo da RYD não aparece pro cliente");

  await ref.set({ ryd: { deliveryId: "7", status: "canceled", entregador: null } }, { merge: true });
  assert.equal((await entregaDoSite(db, { numero: n, telefone: tel })).entregador, null);
  assert.deepEqual(await entregaDoSite(db, { numero: n, telefone: "38 3333-0000" }), { erro: "nao-encontrado" });
});

test("telefone e data de Brasília", () => {
  assert.ok(telIguais("38998124410", "+55 (38) 9812-4410"));
  assert.ok(!telIguais("38998124410", "31998124410"));
  assert.ok(!telIguais("4410", "4410"));
  assert.equal(hojeBrasilia(new Date("2026-10-01T02:00:00Z")), "2026-09-30");
});
