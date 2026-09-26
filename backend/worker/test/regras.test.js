import { test, before, after, beforeEach } from "node:test";
import fs from "node:fs";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";

let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-dluh-regras",
    firestore: { rules: fs.readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8") }
  });
});
after(() => env.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    await ctx.firestore().doc("sis_pedidos/PED-3001").set({ status: "Aguardando confirmação", clienteUid: "cliente-1" });
    await ctx.firestore().doc("sis_pedidos/PED-3002").set({ status: "Aguardando confirmação", clienteUid: "cliente-2" });
  });
});

const equipe = () => env.authenticatedContext("func-1", { email: "ikkysousa5@gmail.com", email_verified: true }).firestore();

test("e-mail fora da lista, ou não verificado, não é equipe", async () => {
  const outro = env.authenticatedContext("x", { email: "outra@gmail.com", email_verified: true }).firestore();
  const naoVerificado = env.authenticatedContext("y", { email: "ikkysousa5@gmail.com", email_verified: false }).firestore();
  await assertFails(outro.doc("sis_pedidos/PED-3002").get());
  await assertFails(naoVerificado.doc("sis_pedidos/PED-3002").get());
});
const cliente = uid => env.authenticatedContext(uid).firestore();
const sistema = (email = "sistema@dluh-festas.firebaseapp.com", provedor = "password") =>
  env.authenticatedContext("sis", { email, firebase: { sign_in_provider: provedor } }).firestore();

test("só a conta sistema (e-mail/senha) grava", async () => {
  await assertSucceeds(sistema().doc("sis_pedidos/PED-3001").update({ status: "Em produção" }));
  await assertSucceeds(sistema().doc("sis_pagamentos/ip-1").set({ valor: 1 }));
  await assertSucceeds(sistema().doc("sis_config/contador").set({ ultimo: 3001 }));
  await assertFails(sistema("outro@x.com").doc("sis_pedidos/PED-3001").update({ status: "Finalizado" }));
  await assertFails(sistema(undefined, "google.com").doc("sis_pedidos/PED-3001").update({ status: "Finalizado" }));
});

test("site antigo: cliente cria e lê só o próprio pedido e não passa o pedido para outro", async () => {
  const eu = cliente("cliente-1");
  await assertSucceeds(eu.doc("pedidos/a").set({ uid: "cliente-1", total: 10 }));
  await assertFails(eu.doc("pedidos/b").set({ uid: "cliente-2", total: 10 }));
  await assertSucceeds(eu.doc("pedidos/a").get());
  await assertFails(eu.doc("pedidos/a").update({ uid: "cliente-2" }));
  await assertFails(cliente("cliente-2").doc("pedidos/a").get());
});

test("equipe lê todos os pedidos, mas não escreve direto", async () => {
  await assertSucceeds(equipe().doc("sis_pedidos/PED-3002").get());
  await assertFails(equipe().doc("sis_pedidos/PED-3001").update({ status: "Finalizado" }));
});

test("cliente logado lê só o próprio pedido e não marca nada como pago", async () => {
  await assertSucceeds(cliente("cliente-1").doc("sis_pedidos/PED-3001").get());
  await assertFails(cliente("cliente-1").doc("sis_pedidos/PED-3002").get());
  await assertFails(cliente("cliente-1").doc("sis_pedidos/PED-3001").update({ pagamento: "Totalmente pago" }));
  await assertFails(cliente("cliente-1").collection("sis_pagamentos").add({ valor: 1 }));
});

test("visitante sem login não lê nada", async () => {
  await assertFails(env.unauthenticatedContext().firestore().doc("sis_pedidos/PED-3001").get());
});

test("catálogo: qualquer visitante lê, só a conta sistema grava", async () => {
  const visitante = env.unauthenticatedContext().firestore();
  await assertSucceeds(visitante.doc("sis_produtos/p1").get());
  await assertSucceeds(visitante.doc("sis_catalogo/recheios").get());
  await assertFails(visitante.doc("sis_produtos/p1").set({ nome: "x" }));
  await assertFails(equipe().doc("sis_produtos/p1").set({ nome: "x" }));
  await assertSucceeds(sistema().doc("sis_produtos/p1").set({ nome: "x" }));
  await assertSucceeds(sistema().doc("sis_catalogo/recheios").set({ lista: [] }));
});
