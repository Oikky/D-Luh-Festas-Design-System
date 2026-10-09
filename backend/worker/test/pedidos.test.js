/* Roda contra o emulador do Firestore: `npm test` na pasta backend.
   Igual à produção: as regras de firestore.rules valem, e quem grava é a conta sistema
   (e-mail/senha). Com o token "owner" o emulador pula as regras e esconde erros de permissão. */
import { test, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { criarFirestore } from "../src/firestore.js";
import { criarPedido, editarPedido, mudarStatus, marcarFeito, registrarPagamento, apagarPedido, apagarPagamento } from "../src/pedidos.js";
import { salvarProduto, apagarProduto, salvarRecheios, publicarCatalogo } from "../src/produtos.js";
import { salvarFinanceiro, apagarFinanceiro, pagarBoleto, pagarFatura, faturaDaData, parcelasDaCompra, vencDaFatura } from "../src/financeiro.js";
import { pagamentoDe } from "../src/dominio.js";
import { registrarNota } from "../src/notas.js";

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

test("quitar pedido entregue finaliza; pagamento parcial não mexe no status", async () => {
  const { id } = await criarPedido(db, base(), "ana");
  await mudarStatus(db, { pedidoId: id, status: "Entregue — Esperando restante" }, "ana");
  const parcial = await registrarPagamento(db, { pedidoId: id, valor: 7000, chave: "manual-0", meio: "pix" }, "ana");
  assert.equal(parcial.status, "Entregue — Esperando restante");
  const r = await registrarPagamento(db, { pedidoId: id, valor: 20000, chave: "manual-1", meio: "dinheiro" }, "ana");
  assert.equal(r.pagamento, "Totalmente pago");
  assert.equal(r.status, "Finalizado");
  const ev = (await eventos(id)).filter(e => e.tipo === "status");
  assert.deepEqual(ev.at(-1), { ...ev.at(-1), de: "Entregue — Esperando restante", para: "Finalizado", por: "sistema" });
});

test("fiado: pagamento parcial continua fiado; quitar finaliza", async () => {
  const { id } = await criarPedido(db, base(), "ana");
  await mudarStatus(db, { pedidoId: id, status: "Fiado" }, "ana");
  const parcial = await registrarPagamento(db, { pedidoId: id, valor: 7000, chave: "fiado-0", meio: "pix" }, "ana");
  assert.equal(parcial.status, "Fiado");
  const r = await registrarPagamento(db, { pedidoId: id, valor: 20000, chave: "fiado-1", meio: "dinheiro" }, "ana");
  assert.equal(r.status, "Finalizado");
});

test("fiado na criação: nasce Fiado e na fila da cozinha; marcar feito funciona", async () => {
  const { id, status } = await criarPedido(db, base(), "ana", { fiado: true });
  assert.equal(status, "Fiado");
  let p = (await db.doc(`sis_pedidos/${id}`).get()).data();
  assert.deepEqual([p.status, p.cozinha], ["Fiado", "pendente"]);
  await marcarFeito(db, { pedidoId: id }, "cozinha");
  p = (await db.doc(`sis_pedidos/${id}`).get()).data();
  assert.equal(p.cozinha, "feito");
});

test("virar fiado depois de entregue não volta para a fila da cozinha", async () => {
  const { id } = await criarPedido(db, base(), "ana");
  await mudarStatus(db, { pedidoId: id, status: "Entregue — Esperando restante" }, "ana");
  await mudarStatus(db, { pedidoId: id, status: "Fiado" }, "ana");
  assert.equal((await db.doc(`sis_pedidos/${id}`).get()).data().cozinha, "feito");
});

test("pagamento não mexe no status em produção", async () => {
  const { id } = await criarPedido(db, base(), "ana");
  await mudarStatus(db, { pedidoId: id, status: "Em produção" }, "ana");
  const r = await registrarPagamento(db, { pedidoId: id, valor: 27000, chave: "manual-2", meio: "dinheiro" }, "ana");
  assert.equal(r.status, "Em produção");
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

test("editarPedido troca dados, refaz total e pagamento e guarda o antes no evento", async () => {
  const { id } = await criarPedido(db, base(), "ana");
  await registrarPagamento(db, { pedidoId: id, valor: 13500, chave: "manual-e1", meio: "pix" }, "ana");
  const r = await editarPedido(db, { pedidoId: id, ...base(), itens: [{ nome: "Bolo 1kg", qtd: 1, valorUnit: 12000, topo: { tema: "Frozen", imagem: "https://lh3.googleusercontent.com/d/x" }, recheios: ["Ninho"] }] }, "ana");
  assert.deepEqual(r.campos, ["itens", "total"]);
  const p = (await db.doc(`sis_pedidos/${id}`).get()).data();
  assert.equal(p.total, 12000);
  assert.equal(p.pagamento, "Totalmente pago"); // já tinha pago 135,00
  assert.equal(p.status, "Aguardando confirmação");
  assert.deepEqual(p.itens[0].topo, { tema: "Frozen", imagem: "https://lh3.googleusercontent.com/d/x" });
  assert.deepEqual(p.itens[0].recheios, ["Ninho"]);
  const ev = (await eventos(id)).find(e => e.tipo === "editado");
  assert.equal(ev.antes.total, 27000);
  assert.deepEqual(await editarPedido(db, { pedidoId: id, ...base(), itens: p.itens }, "ana"), { mudou: false });
});

test("editarPedido tira a forma de pagamento quando ela é apagada e recusa pedido cancelado", async () => {
  const { id } = await criarPedido(db, { ...base(), formaPagamento: "pix" }, "ana");
  await editarPedido(db, { pedidoId: id, ...base() }, "ana");
  assert.equal((await db.doc(`sis_pedidos/${id}`).get()).get("formaPagamento"), undefined);
  await mudarStatus(db, { pedidoId: id, status: "Cancelado" }, "ana");
  await assert.rejects(editarPedido(db, { pedidoId: id, ...base() }, "ana"), /cancelado/);
  await assert.rejects(editarPedido(db, { pedidoId: "PED-1", ...base() }, "ana"), /não existe/);
});

test("produtos: cria, edita, valida e apaga; recheios sem repetidos", async () => {
  const { id } = await salvarProduto(db, { nome: "Coxinha", categoria: "Salgado Frito", valorUnit: 150, qtdMin: 25 }, "ana");
  let p = (await db.doc(`sis_produtos/${id}`).get()).data();
  assert.equal(p.ativo, true);
  assert.equal(p.qtdMin, 25);
  await salvarProduto(db, { id, nome: "Coxinha", categoria: "Salgado Frito", valorUnit: 180, ativo: false }, "ana");
  p = (await db.doc(`sis_produtos/${id}`).get()).data();
  assert.equal(p.valorUnit, 180);
  assert.equal(p.ativo, false);
  assert.equal(p.qtdMin, 1);
  await assert.rejects(salvarProduto(db, { nome: "X", categoria: "Y", valorUnit: 1.5 }, "ana"), /centavos/);
  await assert.rejects(salvarProduto(db, { id: "nao-existe", nome: "X", categoria: "Y", valorUnit: 100 }, "ana"), /não existe/);
  assert.deepEqual(await apagarProduto(db, { id }), { apagado: true });
  assert.equal((await db.doc(`sis_produtos/${id}`).get()).exists, false);
  assert.deepEqual((await salvarRecheios(db, { lista: ["Ninho", " ninho ", "Brigadeiro", ""] }, "ana")).lista, ["Ninho", "Brigadeiro"]);
});

test("financeiro: boleto com parcelas — lança, paga uma parcela, edita e apaga", async () => {
  const parcelas = [
    { venc: "2026-10-05", valor: 7350, codigo: "111", arquivos: [{ url: "https://lh3.googleusercontent.com/d/a", nome: "boleto1.jpg" }] },
    { venc: "2026-10-12", valor: 7350 },
    { venc: "2026-10-19", valor: 7350 }
  ];
  const { id } = await salvarFinanceiro(db, { tipo: "boleto", desc: "Delly's", periodo: "semanal", parcelas,
    arquivos: [{ url: "https://drive.google.com/file/d/x/view", nome: "nota.pdf", pdf: true }] }, "ana");
  let doc = (await db.collection("sis_financeiro").doc(id).get()).data();
  assert.equal(doc.tipo, "boleto");
  assert.equal(doc.valor, 22050);
  assert.equal(doc.venc, "2026-10-05");
  assert.equal(doc.pago, false);
  assert.equal(doc.cnpjAntigo, false);
  assert.deepEqual(doc.parcelas.map(p => [p.n, p.pago, p.codigo]), [[1, false, "111"], [2, false, ""], [3, false, ""]]);
  assert.equal(doc.arquivos[0].pdf, true);

  assert.deepEqual(await pagarBoleto(db, { id, n: 1, data: "2026-10-04" }, "ana"), { mudou: true });
  assert.deepEqual(await pagarBoleto(db, { id, n: 1 }, "ana"), { mudou: false });
  doc = (await db.collection("sis_financeiro").doc(id).get()).data();
  assert.equal(doc.parcelas[0].pagoEm, "2026-10-04");
  assert.equal(doc.venc, "2026-10-12"); // o próximo em aberto
  assert.equal(doc.pago, false);

  // Editar mantém a parcela 1 paga e pode mudar as outras.
  await salvarFinanceiro(db, { id, desc: "Delly's", cnpjAntigo: true, periodo: "semanal",
    parcelas: [parcelas[0], { venc: "2026-10-13", valor: 7350, codigo: "222" }, parcelas[2]] }, "ana");
  doc = (await db.collection("sis_financeiro").doc(id).get()).data();
  assert.equal(doc.cnpjAntigo, true);
  assert.equal(doc.parcelas[0].pago, true);
  assert.equal(doc.parcelas[1].codigo, "222");

  await pagarBoleto(db, { id, n: 2 }, "ana");
  await pagarBoleto(db, { id, n: 3, data: "2026-10-20" }, "ana");
  doc = (await db.collection("sis_financeiro").doc(id).get()).data();
  assert.equal(doc.pago, true);
  assert.equal(doc.pagoEm, "2026-10-20");
  await pagarBoleto(db, { id, n: 3, pago: false }, "ana");
  doc = (await db.collection("sis_financeiro").doc(id).get()).data();
  assert.equal(doc.pago, false);
  assert.equal(doc.parcelas[2].pagoEm, null);
  await assert.rejects(pagarBoleto(db, { id, n: 9 }, "ana"), /parcela 9/);

  assert.deepEqual(await apagarFinanceiro(db, { id }), { apagado: true });
  assert.equal((await db.collection("sis_financeiro").doc(id).get()).exists, false);
});

test("financeiro: boleto antigo, sem parcelas, paga como parcela única", async () => {
  await db.collection("sis_financeiro").doc("velho").set({ tipo: "boleto", desc: "Cemig", venc: "2026-10-05", valor: 48690, pago: false });
  assert.deepEqual(await pagarBoleto(db, { id: "velho", data: "2026-10-05" }, "ana"), { mudou: true });
  const doc = (await db.collection("sis_financeiro").doc("velho").get()).data();
  assert.equal(doc.pago, true);
  assert.deepEqual(doc.parcelas.map(p => [p.n, p.valor, p.pagoEm]), [[1, 48690, "2026-10-05"]]);
});

test("financeiro: boleto recusa parcela sem vencimento e link que não é https", async () => {
  await assert.rejects(salvarFinanceiro(db, { tipo: "boleto", desc: "X", parcelas: [] }, "ana"), /pelo menos uma parcela/);
  await assert.rejects(salvarFinanceiro(db, { tipo: "boleto", desc: "X", parcelas: [{ valor: 100 }] }, "ana"), /Vencimento da parcela 1/);
  await assert.rejects(salvarFinanceiro(db, { tipo: "boleto", desc: "X", parcelas: [{ venc: "2026-10-01", valor: 100, arquivos: [{ url: "javascript:alert(1)" }] }] }, "ana"), /Link/);
});

test("financeiro: recusa valores e datas fora do formato", async () => {
  await assert.rejects(salvarFinanceiro(db, { tipo: "transacao", desc: "Gás", data: "2026-10-01", valor: 13.5 }, "ana"), /centavos/);
  await assert.rejects(salvarFinanceiro(db, { tipo: "transacao", desc: "Gás", data: "01/10", valor: 1350 }, "ana"), /AAAA-MM-DD/);
  await assert.rejects(salvarFinanceiro(db, { tipo: "cartao", nome: "Nubank", final: "12", limite: 0 }, "ana"), /4 últimos/);
  await assert.rejects(salvarFinanceiro(db, { tipo: "outro" }, "ana"), /Tipo/);
  const { id } = await salvarFinanceiro(db, { tipo: "transacao", desc: "Gás", entrada: false, meio: "Dinheiro", data: "2026-10-01", valor: 13000 }, "ana");
  await assert.rejects(pagarBoleto(db, { id }, "ana"), /boleto/);
});

test("fatura do cartão: fechamento, parcelas e vencimento", () => {
  assert.equal(faturaDaData("2026-10-04", 5), "2026-10");
  assert.equal(faturaDaData("2026-10-05", 5), "2026-11"); // no dia do fechamento já vai pra próxima
  assert.equal(faturaDaData("2026-12-20", 5), "2027-01");
  assert.equal(faturaDaData("2026-02-28", 31), "2026-03"); // fecha 31 = último dia do mês
  assert.equal(faturaDaData("2026-10-30", null), "2026-10");
  assert.deepEqual(parcelasDaCompra({ data: "2026-10-20", valor: 10000, parcelas: 3 }, 5).map(p => [p.fatura, p.valor]),
    [["2026-11", 3334], ["2026-12", 3333], ["2027-01", 3333]]);
  assert.equal(vencDaFatura("2026-10", { fecha: 3, venc: 10 }), "2026-10-10");
  assert.equal(vencDaFatura("2026-10", { fecha: 25, venc: 5 }), "2026-11-05");
  assert.equal(vencDaFatura("2026-01", { fecha: 20, venc: 31 }), "2026-01-31");
  assert.equal(vencDaFatura("2026-10", { fecha: 3 }), null);
});

test("cartão: compras entram na fatura; pagar fatura zera o lançado à parte e desfaz", async () => {
  const { id: cartaoId } = await salvarFinanceiro(db, { tipo: "cartao", nome: "Nubank", final: "4821", limite: 500000, fatura: 5000, venc: 10, fecha: 3 }, "ana");
  await salvarFinanceiro(db, { tipo: "compra", cartaoId, desc: "Atacadão", data: "2026-10-01", valor: 20000 }, "ana");
  await salvarFinanceiro(db, { tipo: "compra", cartaoId, desc: "Batedeira", data: "2026-10-02", valor: 60000, parcelas: 3 }, "ana");
  await salvarFinanceiro(db, { tipo: "compra", cartaoId, desc: "Gás", data: "2026-10-03", valor: 13000 }, "ana"); // já na de novembro
  await assert.rejects(salvarFinanceiro(db, { tipo: "compra", cartaoId: "nao-existe", desc: "X", data: "2026-10-01", valor: 100 }, "ana"), /cartão não existe/);
  await assert.rejects(salvarFinanceiro(db, { tipo: "compra", cartaoId, desc: "X", data: "2026-10-01", valor: 100, parcelas: 30 }, "ana"), /Parcelas/);

  assert.deepEqual(await pagarFatura(db, { id: cartaoId, mes: "2026-10", data: "2026-10-10", meio: "Pix" }, "ana"), { mudou: true, valor: 20000 + 20000 + 5000 });
  assert.deepEqual(await pagarFatura(db, { id: cartaoId, mes: "2026-10" }, "ana"), { mudou: false });
  let c = (await db.collection("sis_financeiro").doc(cartaoId).get()).data();
  assert.equal(c.fatura, 0);
  assert.deepEqual(c.faturas["2026-10"], { pagoEm: "2026-10-10", valor: 45000, outros: 5000, meio: "Pix" });
  assert.equal((await pagarFatura(db, { id: cartaoId, mes: "2026-11", data: "2026-11-10" }, "ana")).valor, 20000 + 13000);
  await assert.rejects(pagarFatura(db, { id: cartaoId, mes: "2027-06" }, "ana"), /zerada/);

  assert.deepEqual(await pagarFatura(db, { id: cartaoId, mes: "2026-10", pago: false }, "ana"), { mudou: true, valor: 0 });
  c = (await db.collection("sis_financeiro").doc(cartaoId).get()).data();
  assert.equal(c.fatura, 5000);
  assert.equal(c.faturas["2026-10"], undefined);
  assert.ok(c.faturas["2026-11"]);
  await assert.rejects(pagarFatura(db, { id: cartaoId, mes: "10/2026" }, "ana"), /AAAA-MM/);

  await assert.rejects(apagarFinanceiro(db, { id: cartaoId }), /3 compras lançadas/);
  for (const x of await db.collection("sis_financeiro").consultar([["cartaoId", "==", cartaoId]])) await apagarFinanceiro(db, { id: x.id });
  assert.deepEqual(await apagarFinanceiro(db, { id: cartaoId }), { apagado: true });
});

test("apagarPedido tira o pedido, os eventos e os pagamentos dele", async () => {
  const { id } = await criarPedido(db, base(), "ana");
  const outro = await criarPedido(db, base(), "ana");
  await registrarPagamento(db, { pedidoId: id, valor: 100, chave: "p-1", meio: "pix" }, "ana");
  await registrarPagamento(db, { pedidoId: outro.id, valor: 100, chave: "p-2", meio: "pix" }, "ana");
  const r = await apagarPedido(db, { pedidoId: id });
  assert.equal(r.pagamentos, 1);
  assert.ok(r.eventos >= 2);
  assert.equal((await db.collection("sis_pedidos").doc(id).get()).exists, false);
  assert.equal((await db.collection("sis_pedidos").doc(id).collection("eventos").listar()).length, 0);
  assert.equal((await db.collection("sis_pagamentos").doc("p-1").get()).exists, false);
  assert.equal((await db.collection("sis_pagamentos").doc("p-2").get()).exists, true);
  await assert.rejects(apagarPedido(db, { pedidoId: id }), /não existe/);
});

test("apagarPagamento desconta do pedido e reabre o finalizado", async () => {
  const { id } = await criarPedido(db, base(), "ana");
  await mudarStatus(db, { pedidoId: id, status: "Entregue — Esperando restante" }, "ana");
  await registrarPagamento(db, { pedidoId: id, valor: 7000, chave: "ap-1", meio: "pix" }, "ana");
  await registrarPagamento(db, { pedidoId: id, valor: 20000, chave: "ap-2", meio: "dinheiro" }, "ana");
  assert.equal((await db.doc(`sis_pedidos/${id}`).get()).get("status"), "Finalizado");
  const r = await apagarPagamento(db, { pagamentoId: "ap-2" }, "ana");
  assert.deepEqual([r.pago, r.pagamento, r.status], [7000, "Só entrada", "Entregue — Esperando restante"]);
  assert.equal((await db.collection("sis_pagamentos").doc("ap-2").get()).exists, false);
  assert.equal((await db.collection("sis_pagamentos").doc("ap-1").get()).exists, true);
  const ev = (await eventos(id)).find(e => e.tipo === "pagamento-apagado");
  assert.equal(ev.valor, 20000);
  await assert.rejects(apagarPagamento(db, { pagamentoId: "ap-2" }, "ana"), /não existe/);
});

test("publicarCatalogo junta produtos ativos e recheios em sis_catalogo/site", async () => {
  const a = await salvarProduto(db, { nome: "Brigadeiro", categoria: "Doce", valorUnit: 150, qtdMin: 25 }, "ana");
  await salvarProduto(db, { nome: "Oculto", categoria: "Doce", valorUnit: 100, ativo: false }, "ana");
  await salvarRecheios(db, { lista: ["Ninho"] }, "ana");
  await publicarCatalogo(db);
  const site = (await db.doc("sis_catalogo/site").get()).data();
  assert.ok(site.produtos.some(p => p.id === a.id && p.nome === "Brigadeiro" && p.valorUnit === 150));
  assert.ok(!site.produtos.some(p => p.nome === "Oculto"));
  assert.deepEqual(site.recheios, ["Ninho"]);
});

test("registrarNota grava tipo, número e CPF/CNPJ; corrigir guarda a anterior no evento", async () => {
  const { id } = await criarPedido(db, base(), "ana@dluh");
  await assert.rejects(registrarNota(db, { pedidoId: id, tipo: "NF-e", numero: "1" }, "ana@dluh"), /Tipo de nota/);
  await assert.rejects(registrarNota(db, { pedidoId: id, tipo: "NFS-e", numero: " " }, "ana@dluh"), /número da nota/);
  await assert.rejects(registrarNota(db, { pedidoId: id, tipo: "NFS-e", numero: "1", documento: "123" }, "ana@dluh"), /CPF/);

  await registrarNota(db, { pedidoId: id, tipo: "NFS-e", numero: " 152 ", documento: "12.345.678/0001-90" }, "ana@dluh");
  let p = (await db.collection("sis_pedidos").doc(id).get()).data();
  assert.equal(p.nota.tipo, "NFS-e");
  assert.equal(p.nota.numero, "152");
  assert.equal(p.nota.documento, "12345678000190");

  await registrarNota(db, { pedidoId: id, tipo: "NFC-e", numero: "77" }, "bia@dluh");
  p = (await db.collection("sis_pedidos").doc(id).get()).data();
  assert.equal(p.nota.numero, "77");
  assert.equal(p.nota.documento, undefined);
  const ev = (await eventos(id)).filter(e => e.tipo === "nota");
  assert.equal(ev.length, 2);
  assert.equal(ev[1].antes.numero, "152");
});
