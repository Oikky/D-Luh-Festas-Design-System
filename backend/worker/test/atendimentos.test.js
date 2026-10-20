import { test } from "node:test";
import assert from "node:assert/strict";
import { salvarAtendimento, moverAtendimento, anotarAtendimento, salvarContratoFesta, pagarFesta, etapaDe, validarFesta } from "../src/atendimentos.js";

/* Firestore de mentira com o que atendimentos.js usa: doc(), runTransaction (get/create/update). */
function banco() {
  const cols = {};
  let n = 0;
  const col = nome => (cols[nome] ||= {});
  const ref = (nome, id) => ({ nome, id });
  const snap = r => {
    const d = col(r.nome)[r.id];
    return { id: r.id, exists: d !== undefined, data: () => d, get: k => d?.[k] };
  };
  const db = {
    cols,
    collection: nome => ({ doc: id => ref(nome, id ?? `id${++n}`) }),
    runTransaction: async fn => {
      const escritas = [];
      const tx = {
        get: async r => snap(r),
        create: (r, d) => escritas.push(() => { if (col(r.nome)[r.id]) throw new Error("já existe"); col(r.nome)[r.id] = d; }),
        update: (r, d) => escritas.push(() => { if (!col(r.nome)[r.id]) throw new Error("não existe"); col(r.nome)[r.id] = { ...col(r.nome)[r.id], ...d }; })
      };
      const res = await fn(tx);
      escritas.forEach(e => e());
      return res;
    }
  };
  return db;
}
const agora = new Date("2026-10-20T15:00:00Z");

test("equipe lança atendimento e edita só o que mandou", async () => {
  const db = banco();
  await assert.rejects(salvarAtendimento(db, {}, "eu@x"), /nome ou o telefone/);
  await assert.rejects(salvarAtendimento(db, { nome: "Ana", telefone: "123" }, "eu@x"), /DDD/);
  const { id } = await salvarAtendimento(db, { nome: "Ana", telefone: "(38) 99969-1571", canal: "Instagram" }, "eu@x", agora);
  const a = db.cols.sis_atendimentos[id];
  assert.equal(a.etapa, "novo");
  assert.equal(a.origem, "equipe");
  assert.equal(a.telefone, "38999691571");
  assert.equal(a.canal, "Instagram");
  const r = await salvarAtendimento(db, { id, festa: { data: "2026-11-14", inicio: "19:00", convidados: "80", servicos: ["salao", "buffet", "x"], valor: 150000 } }, "eu@x", agora);
  assert.equal(r.mudouFesta, true);
  assert.deepEqual(db.cols.sis_atendimentos[id].festa, { data: "2026-11-14", inicio: "19:00", fim: "", tipoEvento: "", convidados: 80, servicos: ["salao", "buffet"], local: "", valor: 150000 });
  assert.equal(db.cols.sis_atendimentos[id].nome, "Ana");
  await assert.rejects(salvarAtendimento(db, { id: "nada", nome: "x" }, "eu@x"), /não existe/);
  assert.throws(() => validarFesta({ inicio: "25:00" }), /HH:MM/);
  assert.throws(() => validarFesta({ valor: 10.5 }), /centavos/);
});

test("funil: fechar exige data, perdida guarda o motivo, histórico registra", async () => {
  const db = banco();
  const { id } = await salvarAtendimento(db, { nome: "Bia" }, "eu@x", agora);
  assert.equal((await moverAtendimento(db, { id, etapa: "visita" }, "eu@x", agora)).mudou, true);
  assert.equal(db.cols.sis_atendimentos[id].status, "resolvido");
  await assert.rejects(moverAtendimento(db, { id, etapa: "fechada" }, "eu@x"), /data da festa/);
  await salvarAtendimento(db, { id, festa: { data: "2026-12-05" } }, "eu@x");
  await moverAtendimento(db, { id, etapa: "fechada" }, "eu@x", agora);
  assert.equal((await moverAtendimento(db, { id, etapa: "fechada" }, "eu@x")).mudou, false);
  await moverAtendimento(db, { id, etapa: "perdida", motivo: "achou mais barato" }, "eu@x", agora);
  const a = db.cols.sis_atendimentos[id];
  assert.equal(a.motivoPerda, "achou mais barato");
  assert.deepEqual(a.historico.map(h => h.para), ["novo", "visita", "fechada", "perdida"]);
  await assert.rejects(moverAtendimento(db, { id, etapa: "xyz" }, "eu@x"), /Etapa/);
  assert.equal(etapaDe({ status: "resolvido" }), "conversando");
  assert.equal(etapaDe({}), "novo");
});

test("anotação, contrato e pagamento da festa no Financeiro", async () => {
  const db = banco();
  const { id } = await salvarAtendimento(db, { nome: "Carla", festa: { data: "2026-11-21" } }, "eu@x", agora);
  await anotarAtendimento(db, { id, texto: "Quer decoração rosa" }, "eu@x", agora);
  await assert.rejects(anotarAtendimento(db, { id, texto: "  " }, "eu@x"), /Escreva/);
  assert.deepEqual(db.cols.sis_atendimentos[id].notas, [{ texto: "Quer decoração rosa", por: "eu@x", em: agora }]);

  await salvarContratoFesta(db, { id, contrato: { tipo: "salao", dados: { salao: { nome: "Carla", data_evento: "2026-11-21" } }, status: "Rascunho" } }, "eu@x", agora);
  assert.equal(db.cols.sis_atendimentos[id].contrato.dados.salao.nome, "Carla");
  await salvarContratoFesta(db, { id, contrato: { tipo: "salao", dados: { salao: { nome: "Carla" } }, status: "Finalizado" } }, "eu@x", agora);
  await assert.rejects(salvarContratoFesta(db, { id, contrato: { tipo: "salao", dados: {}, status: "Finalizado" } }, "eu@x"), /finalizado/);
  await assert.rejects(salvarContratoFesta(db, { id, contrato: { tipo: "outro" } }, "eu@x"), /Modelo/);
  const { id: id2 } = await salvarAtendimento(db, { nome: "Dora" }, "eu@x", agora);
  await salvarContratoFesta(db, { id: id2, contrato: { tipo: "buffet", dados: {}, clausulas: [{ id: "c1", titulo: "CLÁUSULA 1ª", texto: "Outro texto {{data_evento}}" }], status: "Rascunho" } }, "eu@x", agora);
  assert.equal(db.cols.sis_atendimentos[id2].contrato.clausulas[0].texto, "Outro texto {{data_evento}}");
  await salvarContratoFesta(db, { id: id2, contrato: { tipo: "salao", dados: {}, htmlProprio: "<h1>X</h1>", status: "Rascunho" } }, "eu@x", agora);
  assert.equal(db.cols.sis_atendimentos[id2].contrato.htmlProprio, "<h1>X</h1>");

  const p = await pagarFesta(db, { id, valor: 50000, meio: "Pix", data: "2026-10-20" }, "eu@x");
  const t = db.cols.sis_financeiro[p.id];
  assert.equal(t.tipo, "transacao");
  assert.equal(t.entrada, true);
  assert.equal(t.festaId, id);
  assert.equal(t.desc, "Festa — Carla (21/11)");
  await assert.rejects(pagarFesta(db, { id, valor: 0, meio: "Pix", data: "2026-10-20" }, "eu@x"), /maior que zero/);
});
