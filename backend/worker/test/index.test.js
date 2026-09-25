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
