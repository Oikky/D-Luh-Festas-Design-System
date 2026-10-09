/* Entregas pela RYD (ryd.js) e a taxa do site (frete.js), com a API da RYD simulada e o emulador
   do Firestore — `npm test` na pasta backend. */
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { criarFirestore } from "../src/firestore.js";
import { ErroDominio } from "../src/dominio.js";
import * as ryd from "../src/ryd.js";
import { estimarFrete } from "../src/frete.js";

const HOST = `http://${process.env.FIRESTORE_EMULATOR_HOST}`;
const PROJETO = "demo-dluh";
const db = criarFirestore({ projectId: PROJETO, token: async () => "owner", host: HOST });

const ENV = { RYD_ACCESS_KEY: "chave-ryd", RYD_FARE_ID: "96", RYD_TAXA_SITE: "1", LOJA_ENDERECO: "Rua da Loja, 10|Centro|Montes Claros|MG" };
const LOCAL = { rua: "Rua Dom Pedro II", numero: "200", bairro: "Todos os Santos", cep: "39400-000", cidade: "Montes Claros", uf: "mg" };

/* RYD de mentira: responde por rota e guarda o que recebeu. */
function rydFalsa(respostas) {
  const chamadas = [];
  const fetchFn = async (url, init) => {
    const rota = url.replace("https://api.ryd.com.br/api/", "");
    chamadas.push({ rota, corpo: JSON.parse(init.body) });
    return new Response(JSON.stringify(respostas[rota] ?? { erro: "rota inesperada" }), { status: 200 });
  };
  return { fetchFn, chamadas };
}
const COTACAO = { success: true, "preview-id": "15742300", amount: "11.40", distance: 3027, duration: 592,
  addresses: ["R. da Loja, 10 - Centro, Montes Claros - MG", "R. Dom Pedro II, 200 - Todos os Santos, Montes Claros - MG"], fare_id: 96 };

beforeEach(async () => {
  await fetch(`${HOST}/emulator/v1/projects/${PROJETO}/databases/(default)/documents`, { method: "DELETE" });
  await db.collection("sis_pedidos").doc("PED-10").set({
    id: "PED-10", status: "Em produção", cliente: { nome: "Maria", telefone: "(38) 99812-4410" },
    entrega: { modo: "entrega", data: "2026-10-09", hora: "15:00", endereco: "Rua Dom Pedro II, 200 - Todos os Santos" }
  });
  await db.collection("sis_pedidos").doc("PED-11").set({
    id: "PED-11", status: "Em produção", cliente: { nome: "João" }, entrega: { modo: "retirada", data: "2026-10-09", hora: "15:00" }
  });
});

test("taxa do site: cota na RYD com a chave no corpo e arredonda para cima no real", async () => {
  const { fetchFn, chamadas } = rydFalsa({ preview: COTACAO });
  const r = await estimarFrete(ENV, LOCAL, { fetchFn });
  assert.deepEqual(r, { disponivel: true, taxa: 1200, km: 3, minutos: 10 });
  const [c] = chamadas;
  assert.equal(c.rota, "preview");
  assert.equal(c.corpo["access-key"], "chave-ryd");
  assert.equal(c.corpo.from, "Rua da Loja, 10 - Centro, Montes Claros - MG");
  assert.equal(c.corpo.to, "Rua Dom Pedro II, 200 - Todos os Santos, Montes Claros - MG, 39400000");
  assert.equal(c.corpo.fare_id, 96);
});

test("taxa do site: sem chave, endereço fora ou RYD fora do ar, a loja combina a taxa", async () => {
  const nunca = async () => { throw new Error("não devia chamar"); };
  assert.deepEqual(await estimarFrete({ LOJA_ENDERECO: ENV.LOJA_ENDERECO }, LOCAL, { fetchFn: nunca }), { disponivel: false });
  assert.deepEqual(await estimarFrete({ ...ENV, RYD_TAXA_SITE: undefined }, LOCAL, { fetchFn: nunca }), { disponivel: false }, "taxa do site desligada");
  const longe = rydFalsa({ preview: { erro: "A distancia maxima para solicitcao e de 60 KM" } });
  assert.deepEqual(await estimarFrete(ENV, LOCAL, longe), { disponivel: false });
  assert.deepEqual(await estimarFrete(ENV, LOCAL, { fetchFn: async () => { throw new Error("rede"); } }), { disponivel: false });
});

test("chamar entregador: cota com o número do pedido, confirma e grava no pedido", async () => {
  const { fetchFn, chamadas } = rydFalsa({ preview: COTACAO, request: { success: true, text: "Corrida solicitada", "preview-id": "15742300", "delivery-id": "774463169" } });
  const c = await ryd.cotarEntrega(db, ENV, { pedidoId: "PED-10" }, { fetchFn });
  assert.equal(c.valor, 1140);
  assert.equal(c.previewId, "15742300");
  assert.equal(chamadas[0].corpo.extra_numeroPedido, "PED-10");
  assert.equal(chamadas[0].corpo.extra_ClientNameTo, "Maria");
  assert.equal(chamadas[0].corpo.to, "Rua Dom Pedro II, 200 - Todos os Santos");

  const r = await ryd.confirmarEntrega(db, ENV, { pedidoId: "PED-10", previewId: c.previewId, valor: c.valor }, "ana@dluh", { fetchFn });
  assert.deepEqual(r, { deliveryId: "774463169", status: "pending" });
  assert.deepEqual(chamadas[1], { rota: "request", corpo: { "access-key": "chave-ryd", "preview-id": "15742300" } });
  const p = (await db.collection("sis_pedidos").doc("PED-10").get()).data();
  assert.equal(p.ryd.deliveryId, "774463169");
  assert.equal(p.ryd.status, "pending");
  assert.equal(p.ryd.valor, 1140);
  assert.equal(p.status, "Em produção", "o resto do pedido fica igual");

  // Com entregador já chamado, não chama de novo.
  await assert.rejects(ryd.cotarEntrega(db, ENV, { pedidoId: "PED-10" }, { fetchFn }), /Já tem entregador/);
});

test("chamar entregador: retirada, sem chave ou sem saldo dão erro claro", async () => {
  const { fetchFn } = rydFalsa({ preview: COTACAO, request: { erro: "Você não tem saldo para esta solicitação: R$ 11,40, o seu crédito disponível é de R$ 0,00" } });
  await assert.rejects(ryd.cotarEntrega(db, ENV, { pedidoId: "PED-11" }, { fetchFn }), /retirar na loja/);
  await assert.rejects(ryd.cotarEntrega(db, {}, { pedidoId: "PED-10" }, { fetchFn }), /falta a chave/);
  await assert.rejects(ryd.confirmarEntrega(db, ENV, { pedidoId: "PED-10", previewId: "1" }, "ana", { fetchFn }),
    e => e instanceof ErroDominio && /RYD: Você não tem saldo/.test(e.message));
  assert.equal((await db.collection("sis_pedidos").doc("PED-10").get()).get("ryd"), undefined);
});

test("webhook: status e entregador vão para o pedido; evento repetido não duplica o histórico", async () => {
  await db.collection("sis_pedidos").doc("PED-10").set({ ryd: { deliveryId: "774463169", status: "pending", entregador: null } }, { merge: true });
  const ev = { "delivery-id": "774463169", status: "accepted", "driver-name": "João Pereira", "driver-image": "https://x/f.jpg", "event-id": "1" };
  assert.deepEqual(await ryd.eventoDaRyd(db, ev), { pedidoId: "PED-10", status: "accepted", mudou: true });
  assert.deepEqual(await ryd.eventoDaRyd(db, ev), { pedidoId: "PED-10", status: "accepted", mudou: false });
  await ryd.eventoDaRyd(db, { "delivery-id": "774463169", status: "finished", "status-final": "finished", "date-final": "2026-10-09 15:32:10", "event-id": "2" });
  const p = (await db.collection("sis_pedidos").doc("PED-10").get()).data();
  assert.equal(p.ryd.status, "finished");
  assert.equal(p.ryd.entregador.nome, "João Pereira");
  assert.equal(p.ryd.concluidaEm, "2026-10-09 15:32:10");
  const eventos = await db.collection("sis_pedidos").doc("PED-10").collection("eventos").listar();
  assert.deepEqual(eventos.map(e => e.acao).sort(), ["accepted", "finished"]);

  assert.ok((await ryd.eventoDaRyd(db, { "delivery-id": "999", status: "accepted" })).ignorado);
  assert.deepEqual(await ryd.eventoDaRyd(db, { ...ev, status: "delivering" }, { simulacao: true }), { simulacao: true });
});

test("cancelar: avisa a RYD e marca cancelada; a recusa da RYD chega como erro", async () => {
  await db.collection("sis_pedidos").doc("PED-10").set({ ryd: { deliveryId: "774463169", status: "accepted", entregador: null } }, { merge: true });
  const ok = rydFalsa({ cancel: { success: true, text: "Corrida cancelada" } });
  assert.deepEqual(await ryd.cancelarEntrega(db, ENV, { pedidoId: "PED-10" }, "ana", ok), { cancelado: true });
  assert.equal(ok.chamadas[0].corpo["delivery-id"], "774463169");
  assert.equal((await db.collection("sis_pedidos").doc("PED-10").get()).get("ryd").status, "canceled");

  await db.collection("sis_pedidos").doc("PED-10").set({ ryd: { deliveryId: "5", status: "delivering", entregador: null } }, { merge: true });
  const nao = rydFalsa({ cancel: { erro: "Cancelamento indisponível, entregador em rota de entrega" } });
  await assert.rejects(ryd.cancelarEntrega(db, ENV, { pedidoId: "PED-10" }, "ana", nao), /em rota de entrega/);
});
