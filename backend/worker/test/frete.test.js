/* Cotação antiga pela Moblets (frete.js, fora de uso), com a API da Machine simulada. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { estimarFreteMoblets as estimarFrete, paraCimaNoReal, localDe } from "../src/frete.js";

const ENV = { MACHINE_API_KEY: "chave", MACHINE_USUARIO: "dluh", MACHINE_SENHA: "senha", LOJA_ENDERECO: "Rua da Loja, 10|Centro|Montes Claros|MG" };
const LOCAL = { rua: "Rua Dom Pedro II", numero: "200", bairro: "Todos os Santos", cep: "39400-000", cidade: "Montes Claros", uf: "mg" };
const responde = (corpo, status = 200, guarda = {}) => async (url, init) => {
  guarda.url = url; guarda.init = init;
  return new Response(JSON.stringify(corpo), { status });
};

test("arredonda para cima no real", () => {
  assert.equal(paraCimaNoReal(11.4), 1200);
  assert.equal(paraCimaNoReal(12), 1200);
  assert.equal(paraCimaNoReal(12.01), 1300);
  assert.equal(paraCimaNoReal(11.999999), 1200);
});

test("pede a estimativa com chave, login e os dois endereços", async () => {
  const g = {};
  const r = await estimarFrete(ENV, LOCAL, { fetchFn: responde({ success: true, data: { estimativa_valor: 11.4, estimativa_km: 3.2, estimativa_minutos: 9 } }, 200, g) });
  assert.deepEqual(r, { disponivel: true, taxa: 1200, km: 3.2, minutos: 9 });
  assert.match(g.url, /\/api\/v2\/integracao\/entregas\/estimativas$/);
  assert.equal(g.init.headers["api-key"], "chave");
  assert.equal(g.init.headers.Authorization, "Basic " + btoa("dluh:senha"));
  const corpo = JSON.parse(g.init.body);
  assert.equal(corpo.endereco_partida, "Rua da Loja, 10");
  assert.equal(corpo.bairro_partida, "Centro");
  assert.equal(corpo.endereco_desejado, "Rua Dom Pedro II, 200, 39400000");
  assert.equal(corpo.bairro_desejado, "Todos os Santos");
  assert.equal(corpo.estado_desejado, "MG");
});

test("sem segredos, sem endereço ou com recusa: indisponível (a loja combina a taxa)", async () => {
  const nunca = async () => { throw new Error("não devia chamar"); };
  assert.deepEqual(await estimarFrete({}, LOCAL, { fetchFn: nunca }), { disponivel: false });
  assert.deepEqual(await estimarFrete(ENV, { rua: "", bairro: "X" }, { fetchFn: nunca }), { disponivel: false });
  assert.deepEqual(await estimarFrete(ENV, LOCAL, { fetchFn: responde({ success: false, errors: ["fora da área"] }, 400) }), { disponivel: false });
  assert.deepEqual(await estimarFrete(ENV, LOCAL, { fetchFn: async () => { throw new Error("rede"); } }), { disponivel: false });
});

test("sem CEP, a cidade é Montes Claros", () => {
  assert.deepEqual(localDe({ rua: "Rua A", numero: "1", bairro: "B" }), { endereco: "Rua A, 1", bairro: "B", cidade: "Montes Claros", estado: "MG", cep: "" });
});
