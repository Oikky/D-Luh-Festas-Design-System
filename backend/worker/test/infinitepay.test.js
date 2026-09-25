import { test } from "node:test";
import assert from "node:assert/strict";
import { conferirPagamento, criarLink } from "../src/infinitepay.js";

const resposta = (corpo, status = 200) => async () => ({ ok: status < 400, status, json: async () => corpo });

test("só conta como pago quando o payment_check confirma, e credita o valor do pedido (sem juros)", async () => {
  const pago = await conferirPagamento({}, resposta({ success: true, paid: true, amount: 1500, paid_amount: 1510, capture_method: "credit_card" }));
  assert.deepEqual(pago, { pago: true, valor: 1500, meio: "credit_card" });
  assert.equal((await conferirPagamento({}, resposta({ success: true, paid: false, amount: 1500 }))).pago, false);
  await assert.rejects(conferirPagamento({}, resposta({}, 500)), /500/);
});

test("criarLink manda o pedido como order_nsu e devolve a url", async () => {
  let enviado;
  const url = await criarLink({ handle: "dluh_festas", pedidoId: "PED-3001", valor: 13500, descricao: "Entrada", webhookUrl: "https://x" },
    async (_, init) => { enviado = JSON.parse(init.body); return { ok: true, json: async () => ({ url: "https://checkout/abc" }) }; });
  assert.equal(url, "https://checkout/abc");
  assert.equal(enviado.order_nsu, "PED-3001");
  assert.deepEqual(enviado.items, [{ quantity: 1, price: 13500, description: "Entrada" }]);
});
