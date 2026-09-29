import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const env = { FIREBASE_PROJECT_ID: "dluh-festas", ORIGENS: "https://sitedluh.github.io" };
const chamar = (caminho, init = {}) => worker.fetch(new Request(`https://dluh-api.test${caminho}`, init), env);

test("rota desconhecida é 404 e só POST é aceito", async () => {
  assert.equal((await chamar("/api/apagarTudo", { method: "POST" })).status, 404);
  assert.equal((await chamar("/api/mudarStatus")).status, 405);
  assert.equal((await chamar("/webhook/infinitepay")).status, 405);
});

test("sem login ou com token inválido é 401", async () => {
  const sem = await chamar("/api/mudarStatus", { method: "POST", body: "{}" });
  assert.equal(sem.status, 401);
  const invalido = await chamar("/api/mudarStatus", { method: "POST", body: "{}", headers: { Authorization: "Bearer abc.def.ghi" } });
  assert.equal(invalido.status, 401);
  assert.equal((await invalido.json()).codigo, "unauthenticated");
});

test("CORS só libera as origens da lista", async () => {
  const ok = await chamar("/api/mudarStatus", { method: "OPTIONS", headers: { Origin: "https://sitedluh.github.io" } });
  assert.equal(ok.status, 204);
  assert.equal(ok.headers.get("Access-Control-Allow-Origin"), "https://sitedluh.github.io");
  const outro = await chamar("/api/mudarStatus", { method: "OPTIONS", headers: { Origin: "https://evil.example" } });
  assert.equal(outro.headers.get("Access-Control-Allow-Origin"), null);
});

test("webhook ignora aviso sem os campos da InfinitePay, sem consultar nada", async () => {
  const r = await chamar("/webhook/infinitepay", { method: "POST", body: JSON.stringify({ order_nsu: "PED-1" }) });
  assert.equal(r.status, 200);
  assert.match((await r.json()).message, /ignorado/);
});

test("webhook da Evolution só responde com o token certo", async () => {
  const env2 = { ...env, EVOLUTION_WEBHOOK_TOKEN: "certo" };
  const chamar2 = caminho => worker.fetch(new Request(`https://dluh-api.test${caminho}`, { method: "POST", body: '{"event":"connection.update"}' }), env2, { waitUntil() {} });
  assert.equal((await chamar2("/webhook/evolution/errado")).status, 404);
  assert.equal((await chamar2("/webhook/evolution/certo")).status, 200);
});

test("ações de cliente existem e também pedem login", async () => {
  const r = await chamar("/api/enviarTopo", { method: "POST", body: "{}" });
  assert.equal(r.status, 401);
});

test("ação da conta sistema existe e pede login", async () => {
  const r = await chamar("/api/trocarFotoProduto", { method: "POST", body: "{}" });
  assert.equal(r.status, 401);
});

test("webhook da Alexa: desligado sem a skill e recusa pedido sem assinatura da Amazon", async () => {
  const corpo = JSON.stringify({ session: { application: { applicationId: "s" } }, request: { type: "LaunchRequest", timestamp: new Date().toISOString() } });
  assert.equal((await chamar("/webhook/alexa", { method: "POST", body: corpo })).status, 404);
  const ligado = worker.fetch(new Request("https://dluh-api.test/webhook/alexa", { method: "POST", body: corpo }), { ...env, ALEXA_SKILL_ID: "s" }, { waitUntil() {} });
  assert.equal((await ligado).status, 400);
});
