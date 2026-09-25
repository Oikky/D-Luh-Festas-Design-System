/* Roda contra o emulador do Firestore: `npm test` na pasta backend.
   Igual à produção: as regras de firestore.rules valem, e quem grava é a conta sistema
   (e-mail/senha). Com o token "owner" o emulador pula as regras e esconde erros de permissão. */
import { test, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { criarFirestore } from "../src/firestore.js";
import { criarPedido, mudarStatus, marcarFeito, registrarPagamento } from "../src/pedidos.js";
import { pagamentoDe } from "../src/dominio.js";

const HOST = `http://${process.env.FIRESTORE_EMULATOR_HOST}`;
const PROJETO = "demo-dluh";

/* O emulador aceita ID tokens sem assinatura (alg "none") com as claims que quisermos. */
function tokenFalso(claims) {
  const b64 = o => Buffer.from(JSON.stringify(o)).toString("base64url");
  const agora = Math.floor(Date.now() / 1000);
  return `${b64({ alg: "none", typ: "JWT" })}.${b64({
    iss: `https://securetoken.google.com/${PROJETO}`, aud: PROJETO, iat: agora, exp: agora + 3600, auth_time: agora,
    sub: "sistema-uid", user_id: "sistema-uid", ...claims
  })}.`;
}
const SISTEMA = tokenFalso({ email: "sistema@dluh-festas.firebaseapp.com", firebase: { sign_in_provider: "password", identities: {} } });
// Em produção o Firestore recusa :beginTransaction/:rollback para login de usuário; o emulador não.
// Aqui eles falham de propósito, para os testes pegarem se algum código voltar a usá-los.
const soOQueProducaoAceita = (url, init) => /:(beginTransaction|rollback)/.test(url)
  ? Promise.resolve(new Response(JSON.stringify({ error: { code: 403, message: "Missing or insufficient permissions.", status: "PERMISSION_DENIED" } }), { status: 403 }))
  : fetch(url, init);
const db = criarFirestore({ projectId: PROJETO, token: async () => SISTEMA, host: HOST, fetchFn: soOQueProducaoAceita });

before(async () => {
  const res = await fetch(`${HOST}/emulator/v1/projects/${PROJETO}:securityRules`, {
    method: "PUT",
    body: JSON.stringify({ rules: { files: [{ content: fs.readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8") }] } })
  });
  assert.ok(res.ok, "regras não carregaram no emulador");
});

beforeEach(async () => {
  await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/demo-dluh/databases/(default)/documents`, { method: "DELETE" });
});

const base = () => ({
  cliente: { nome: "Cliente Teste", telefone: "(38) 99999-0000" },
  entrega: { modo: "retirada", data: "2026-10-10", hora: "15:00" },
  itens: [{ nome: "Bolo 1kg", qtd: 1, valorUnit: 12000 }, { nome: "Salgados", qtd: 100, valorUnit: 150 }]
});

const eventos = async id => (await db.collection(`sis_pedidos/${id}/eventos`).listar()).sort((a, b) => a.em - b.em);

test("pagamentoDe separa os três estados", () => {
  assert.equal(pagamentoDe(1000, 0), "Não pago");
  assert.equal(pagamentoDe(1000, 500), "Só entrada");
  assert.equal(pagamentoDe(1000, 1000), "Totalmente pago");
});

test("criarPedido numera em sequência, soma em centavos e registra evento", async () => {
  const a = await criarPedido(db, base(), "ana@dluh");
  const b = await criarPedido(db, base(), "ana@dluh");
  assert.equal(a.id, "PED-3001");
  assert.equal(b.id, "PED-3002");
  assert.equal(a.total, 27000);
  const p = (await db.doc("sis_pedidos/PED-3001").get()).data();
  assert.equal(p.status, "Aguardando confirmação");
  assert.equal(p.pagamento, "Não pago");
  assert.equal(p.cliente.telefone, "38999990000");
  assert.deepEqual((await eventos(a.id)).map(e => e.tipo), ["criado"]);
});

test("criarPedido guarda entrada 100%, forma de pagamento e aceita hora vazia", async () => {
  const { id } = await criarPedido(db, { ...base(), entrega: { modo: "retirada", data: "2026-10-10", hora: "" }, entradaPct: 100, formaPagamento: "dinheiro" }, "ana");
  const p = (await db.doc(`sis_pedidos/${id}`).get()).data();
  assert.equal(p.entradaPct, 100);
  assert.equal(p.formaPagamento, "dinheiro");
  assert.equal(p.entrega.hora, "");
  const q = (await db.doc(`sis_pedidos/${(await criarPedido(db, { ...base(), formaPagamento: "cheque" }, "ana")).id}`).get()).data();
  assert.equal(q.entradaPct, 50);
  assert.equal(q.formaPagamento, undefined);
});

test("criarPedido recusa dados inválidos", async () => {
  await assert.rejects(criarPedido(db, { ...base(), itens: [] }, "x"), /pelo menos um item/);
  await assert.rejects(criarPedido(db, { ...base(), entrega: { modo: "entrega", data: "2026-10-10", hora: "15:00" } }, "x"), /endereço/);
  await assert.rejects(criarPedido(db, { ...base(), itens: [{ nome: "Bolo", qtd: 1, valorUnit: 120.5 }] }, "x"), /centavos/);
});

test("mudarStatus aceita só status conhecidos e registra de → para", async () => {
  const { id } = await criarPedido(db, base(), "ana");
  await assert.rejects(mudarStatus(db, { pedidoId: id, status: "Pago — Em produção" }, "ana"), /desconhecido/);
  await assert.rejects(mudarStatus(db, { pedidoId: "PED-1", status: "Finalizado" }, "ana"), /não existe/);
  assert.deepEqual(await mudarStatus(db, { pedidoId: id, status: "Confirmado — Esperando pagamento" }, "ana"), { mudou: true, status: "Confirmado — Esperando pagamento" });
  assert.deepEqual(await mudarStatus(db, { pedidoId: id, status: "Confirmado — Esperando pagamento" }, "ana"), { mudou: false, status: "Confirmado — Esperando pagamento" });
  const ev = (await eventos(id)).filter(e => e.tipo === "status");
  assert.equal(ev.length, 1);
  assert.equal(ev[0].de, "Aguardando confirmação");
  assert.equal(ev[0].por, "ana");
});

test("pagamento repetido (webhook duas vezes) conta uma vez só", async () => {
  const { id } = await criarPedido(db, base(), "ana");
  await mudarStatus(db, { pedidoId: id, status: "Confirmado — Esperando pagamento" }, "ana");
  const pg = { pedidoId: id, valor: 13500, chave: "ip-abc", meio: "pix" };
  const [r1, r2] = await Promise.all([registrarPagamento(db, pg, "infinitepay"), registrarPagamento(db, pg, "infinitepay")]);
  assert.equal([r1, r2].filter(r => r.duplicado).length, 1);
  const p = (await db.doc(`sis_pedidos/${id}`).get()).data();
  assert.equal(p.pago, 13500);
  assert.equal(p.pagamento, "Só entrada");
  assert.equal(p.status, "Em produção"); // a entrada libera a produção, como hoje
});

test("pagamento não mexe no status fora da espera de pagamento", async () => {
  const { id } = await criarPedido(db, base(), "ana");
  await mudarStatus(db, { pedidoId: id, status: "Entregue — Esperando restante" }, "ana");
  const r = await registrarPagamento(db, { pedidoId: id, valor: 27000, chave: "manual-1", meio: "dinheiro" }, "ana");
  assert.equal(r.pagamento, "Totalmente pago");
  assert.equal(r.status, "Entregue — Esperando restante");
});

test("cozinha marca feito só em produção, uma vez, sem mexer em status ou pagamento", async () => {
  const { id } = await criarPedido(db, base(), "ana");
  await assert.rejects(marcarFeito(db, { pedidoId: id }, "cozinha"), /não está em produção/);
  await mudarStatus(db, { pedidoId: id, status: "Em produção" }, "ana");
  assert.deepEqual(await marcarFeito(db, { pedidoId: id }, "cozinha"), { mudou: true });
  assert.deepEqual(await marcarFeito(db, { pedidoId: id }, "cozinha"), { mudou: false });
  const p = (await db.doc(`sis_pedidos/${id}`).get()).data();
  assert.equal(p.cozinha, "feito");
  assert.equal(p.status, "Em produção");
  assert.equal(p.pagamento, "Não pago");
  assert.ok(p.feitoEm instanceof Date);
});

test("mudanças simultâneas de status não se perdem", async () => {
  const { id } = await criarPedido(db, base(), "ana");
  await Promise.all([
    mudarStatus(db, { pedidoId: id, status: "Em produção" }, "cozinha"),
    mudarStatus(db, { pedidoId: id, status: "Cancelado" }, "ana")
  ]);
  const final = (await db.doc(`sis_pedidos/${id}`).get()).get("status");
  const ev = (await eventos(id)).filter(e => e.tipo === "status");
  // O histórico forma uma corrente sem buracos e termina no estado que ficou gravado.
  assert.equal(ev[0].de, "Aguardando confirmação");
  for (let i = 1; i < ev.length; i++) assert.equal(ev[i].de, ev[i - 1].para);
  assert.equal(ev.at(-1).para, final);
});
