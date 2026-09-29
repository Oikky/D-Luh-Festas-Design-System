import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";
import { urlDoCertificadoOk, requisicaoValida, acharNaFila, filaFalada, responder, avisarNovoNaFila } from "../src/alexa.js";

/* Certificado autoassinado para echo-api.amazon.com, só para os testes. */
const PEM = readFileSync(new URL("./fixtures/alexa-teste.pem", import.meta.url), "utf8");
const CERT = PEM.match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/)[0];
const CHAVE = PEM.match(/-----BEGIN PRIVATE KEY-----[\s\S]+?-----END PRIVATE KEY-----/)[0];
const assinar = corpo => createSign("RSA-SHA256").update(corpo).sign(CHAVE, "base64");

const agora = Date.parse("2026-10-01T15:00:00Z"); // 01/10, 12h em Brasília
const env = { ALEXA_SKILL_ID: "amzn1.ask.skill.cozinha" };

function banco(pedidos) {
  return {
    collection: () => ({
      consultar: async filtros => pedidos.filter(p => filtros.every(([c, , v]) => p[c] === v)),
      doc: id => ({ get: async () => { const p = pedidos.find(x => x.id === id); return { exists: !!p, data: () => p }; } })
    })
  };
}
const ped = (id, nome, data, hora, extra = {}) => ({ id, status: "Em produção", cozinha: "pendente",
  cliente: { nome }, entrega: { data, hora }, itens: [{ qtd: 50, nome: "Brigadeiro" }], ...extra });
const PEDIDOS = [
  ped("PED-3012", "Maria Clara", "2026-10-01", "15:00"),
  ped("PED-3009", "Joana", "2026-09-30", "10:30"),
  ped("PED-3020", "Maria Souza", "2026-10-01", "17:00"),
  ped("PED-3030", "Ana", "2026-10-05", "09:00"),                      // outro dia
  ped("PED-3031", "Bia", "2026-10-01", "08:00", { cozinha: "feito" }), // já feito
  ped("PED-3032", "Caio", "2026-10-01", "08:00", { status: "Pronto" })
];

test("certificado só do bucket da Alexa na Amazon", () => {
  assert.ok(urlDoCertificadoOk("https://s3.amazonaws.com/echo.api/echo-api-cert.pem"));
  assert.ok(urlDoCertificadoOk("https://s3.amazonaws.com:443/echo.api/../echo.api/echo-api-cert.pem"));
  assert.ok(!urlDoCertificadoOk("http://s3.amazonaws.com/echo.api/echo-api-cert.pem"));
  assert.ok(!urlDoCertificadoOk("https://notamazon.com/echo.api/echo-api-cert.pem"));
  assert.ok(!urlDoCertificadoOk("https://s3.amazonaws.com/EcHo.aPi/echo-api-cert.pem"));
  assert.ok(!urlDoCertificadoOk("https://s3.amazonaws.com/invalid.path/echo-api-cert.pem"));
  assert.ok(!urlDoCertificadoOk("https://s3.amazonaws.com:563/echo.api/echo-api-cert.pem"));
});

test("requisição da Alexa: assinatura, skill e horário", async () => {
  const dados = { session: { application: { applicationId: env.ALEXA_SKILL_ID } }, request: { type: "LaunchRequest", timestamp: new Date(agora).toISOString() } };
  const corpo = JSON.stringify(dados);
  const urlCert = "https://s3.amazonaws.com/echo.api/teste-1.pem";
  const fetchFn = async () => new Response(CERT);
  const base = { corpo, dados, urlCert, assinatura: assinar(corpo), env, agora, fetchFn };
  assert.equal(await requisicaoValida(base), true);
  assert.equal(await requisicaoValida({ ...base, corpo: corpo + " " }), false);                    // corpo mexido
  assert.equal(await requisicaoValida({ ...base, env: { ALEXA_SKILL_ID: "outra" } }), false);      // outra skill
  assert.equal(await requisicaoValida({ ...base, agora: agora + 151e3 }), false);                  // velha
  assert.equal(await requisicaoValida({ ...base, urlCert: "https://evil.example/echo.api/c.pem" }), false);
  assert.equal(await requisicaoValida({ ...base, assinatura: null }), false);
});

test("fila de hoje: só em produção, não feitos, de hoje e atrasados, na ordem do horário", async () => {
  let r = await responder({ request: { type: "IntentRequest", intent: { name: "FilaIntent" } } }, { db: banco(PEDIDOS), agora });
  const texto = r.response.outputSpeech.text;
  assert.match(texto, /^Tem 3 pedidos na fila\. Pedido 3009, de Joana, atrasado, às 10 e 30: 50 Brigadeiro\. Pedido 3012/);
  assert.doesNotMatch(texto, /3030|3031|3032/);
  assert.equal(filaFalada([], "2026-10-01"), "A fila de hoje está vazia. Nada para fazer agora.");
});

test("achar pedido por nome ou número", () => {
  const fila = PEDIDOS.slice(0, 3);
  assert.deepEqual(acharNaFila(fila, { cliente: "joana" }).map(p => p.id), ["PED-3009"]);
  assert.deepEqual(acharNaFila(fila, { cliente: "Maria" }).map(p => p.id), ["PED-3012", "PED-3020"]);
  assert.deepEqual(acharNaFila(fila, { cliente: "maria clara" }).map(p => p.id), ["PED-3012"]);
  assert.deepEqual(acharNaFila(fila, { numero: "3020" }).map(p => p.id), ["PED-3020"]);
  assert.deepEqual(acharNaFila(fila, { numero: "9" }).map(p => p.id), ["PED-3009"]);
  assert.deepEqual(acharNaFila(fila, {}), []);
});

test("marcar feito: pergunta antes, marca só no sim", async () => {
  const marcados = [];
  const ctx = { db: banco(PEDIDOS), agora, marcarFeito: async id => { marcados.push(id); return { mudou: true }; } };
  const feito = slots => ({ request: { type: "IntentRequest", intent: { name: "FeitoIntent", slots } } });

  let r = await responder(feito({ cliente: { value: "Joana" } }), ctx);
  assert.match(r.response.outputSpeech.text, /^Marcar como feito o pedido 3009, de Joana/);
  assert.deepEqual(r.sessionAttributes, { pendente: "PED-3009" });
  assert.deepEqual(marcados, []);

  r = await responder({ session: { attributes: { pendente: "PED-3009" } }, request: { type: "IntentRequest", intent: { name: "AMAZON.NoIntent" } } }, ctx);
  assert.deepEqual(marcados, []);
  r = await responder({ session: { attributes: { pendente: "PED-3009" } }, request: { type: "IntentRequest", intent: { name: "AMAZON.YesIntent" } } }, ctx);
  assert.deepEqual(marcados, ["PED-3009"]);
  assert.equal(r.response.outputSpeech.text, "Pronto, o 3009 saiu da fila.");

  r = await responder(feito({ cliente: { value: "Maria" } }), ctx);
  assert.match(r.response.outputSpeech.text, /^Achei 2: .*Qual é o número\?$/);
  r = await responder(feito({ cliente: { value: "Zé" } }), ctx);
  assert.match(r.response.outputSpeech.text, /Não achei/);
  r = await responder({ request: { type: "IntentRequest", intent: { name: "AMAZON.YesIntent" } } }, ctx);
  assert.match(r.response.outputSpeech.text, /Sim para quê/);
  assert.deepEqual(marcados, ["PED-3009"]);
});

test("aviso falado: só com Voice Monkey configurado", async () => {
  const chamadas = [];
  const fetchFn = async (url, init) => { chamadas.push({ url, corpo: JSON.parse(init.body) }); return new Response("{}"); };
  await avisarNovoNaFila({}, banco(PEDIDOS), "PED-3012", { agora, fetchFn });
  assert.equal(chamadas.length, 0);
  const envVM = { VOICEMONKEY_TOKEN: "t", VOICEMONKEY_DEVICE: "cozinha" };
  await avisarNovoNaFila(envVM, banco(PEDIDOS), "PED-3012", { agora, fetchFn });
  await avisarNovoNaFila(envVM, banco(PEDIDOS), "PED-3030", { agora, fetchFn });
  assert.equal(chamadas[0].url, "https://api-v3.voicemonkey.io/announce");
  assert.deepEqual(chamadas[0].corpo, { token: "t", device: "cozinha", speech: "Novo pedido na cozinha: 3012, de Maria, para hoje às 15 horas. 50 Brigadeiro." });
  assert.match(chamadas[1].corpo.speech, /para o dia 5 às 9 horas/);
});
