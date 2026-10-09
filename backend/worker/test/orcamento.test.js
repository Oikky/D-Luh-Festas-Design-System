/* Alerta de gasto do Google Cloud (orcamento.js), contra o emulador do Firestore. */
import { test, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { criarFirestore } from "../src/firestore.js";
import { tratarAlerta, lerAlerta } from "../src/orcamento.js";

const HOST = `http://${process.env.FIRESTORE_EMULATOR_HOST}`;
const PROJETO = "demo-dluh";
const b64 = o => Buffer.from(JSON.stringify(o)).toString("base64url");
const agora = Math.floor(Date.now() / 1000);
const SISTEMA = `${b64({ alg: "none", typ: "JWT" })}.${b64({
  iss: `https://securetoken.google.com/${PROJETO}`, aud: PROJETO, iat: agora, exp: agora + 3600, auth_time: agora,
  sub: "sistema-uid", user_id: "sistema-uid", email: "sistema@dluh-festas.firebaseapp.com", firebase: { sign_in_provider: "password", identities: {} }
})}.`;
const db = criarFirestore({ projectId: PROJETO, token: async () => SISTEMA, host: HOST });

before(async () => {
  const res = await fetch(`${HOST}/emulator/v1/projects/${PROJETO}:securityRules`, {
    method: "PUT", body: JSON.stringify({ rules: { files: [{ content: fs.readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8") }] } })
  });
  assert.ok(res.ok);
});
beforeEach(() => fetch(`${HOST}/emulator/v1/projects/${PROJETO}/databases/(default)/documents`, { method: "DELETE" }));

const push = a => ({ message: { data: Buffer.from(JSON.stringify(a)).toString("base64") } });
const env = { TELEGRAM_TOKEN: "t", TELEGRAM_CHAT: "-1", EVOLUTION_URL: "https://evo", EVOLUTION_KEY: "k", EVOLUTION_INSTANCE: "i", IA_NUMEROS: "5538999540665,5538997457788" };

test("avisa uma vez por limite no mês, no Telegram e nos dois WhatsApp", async () => {
  const chamadas = [];
  const fetchFn = async (url, init) => { chamadas.push({ url: String(url), corpo: init?.body }); return new Response(JSON.stringify({ ok: true }), { status: 200 }); };
  const a = { budgetDisplayName: "Alerta", alertThresholdExceeded: 0.5, costAmount: 10.4, budgetAmount: 20, currencyCode: "BRL", costIntervalStart: "2026-10-01T07:00:00Z" };
  const r = await tratarAlerta(env, db, push(a), { fetchFn });
  assert.equal(r.avisou, true);
  assert.equal(chamadas.length, 3);
  assert.ok(chamadas.some(c => c.corpo.includes("R$ 10,40 de R$ 20,00")));
  assert.equal((await tratarAlerta(env, db, push(a), { fetchFn })).motivo, "já avisado");
  assert.equal((await tratarAlerta(env, db, push({ ...a, alertThresholdExceeded: 0.9 }), { fetchFn })).avisou, true);
});

test("relatório sem limite passado ou corpo estranho não avisa", async () => {
  assert.equal((await tratarAlerta(env, db, push({ costAmount: 1, budgetAmount: 20 }))).avisou, false);
  assert.equal(lerAlerta({ message: { data: "!!" } }), null);
  assert.equal((await tratarAlerta(env, db, null)).avisou, false);
});
