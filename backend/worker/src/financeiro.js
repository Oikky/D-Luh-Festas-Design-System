/* Financeiro da loja: o que a equipe lança à mão em sis_financeiro/{id} — transações do caixa
   (entradas e saídas avulsas), boletos a pagar e cartões da loja. O dinheiro que entra pelos
   pedidos já está em sis_pagamentos e não é repetido aqui: a tela junta os dois.
   Dinheiro em centavos inteiros, datas AAAA-MM-DD. */
import { FieldValue } from "./firestore.js";
import { centavos, ErroDominio } from "./dominio.js";

const FINANCEIRO = "sis_financeiro";
const TIPOS = ["transacao", "boleto", "cartao"];
const MEIOS_FIN = ["Pix", "Cartão", "Dinheiro", "Boleto", "Transferência"];
const BANDEIRAS = ["Visa", "Mastercard", "Elo", "Outra"];

const texto = (v, max, campo, obrigatorio) => {
  const s = String(v ?? "").trim();
  if (obrigatorio && !s) throw new ErroDominio("invalid-argument", `Preencha ${campo}`);
  if (s.length > max) throw new ErroDominio("invalid-argument", `${campo}: no máximo ${max} caracteres`);
  return s;
};
const data = (v, campo, obrigatorio) => {
  const s = String(v ?? "");
  if (!s && !obrigatorio) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new ErroDominio("invalid-argument", `${campo} no formato AAAA-MM-DD`);
  return s;
};
const positivo = (v, campo) => {
  centavos(v, campo);
  if (v === 0) throw new ErroDominio("invalid-argument", `${campo} deve ser maior que zero`);
  return v;
};

function validar(tipo, d) {
  if (tipo === "transacao") return {
    desc: texto(d.desc, 120, "a descrição", true),
    entrada: d.entrada === true,
    meio: MEIOS_FIN.includes(d.meio) ? d.meio : "Pix",
    data: data(d.data, "Data", true),
    valor: positivo(d.valor, "Valor")
  };
  if (tipo === "boleto") return {
    desc: texto(d.desc, 120, "o fornecedor", true),
    venc: data(d.venc, "Vencimento", true),
    valor: positivo(d.valor, "Valor"),
    codigo: texto(d.codigo, 80, "Linha digitável")
  };
  if (tipo === "cartao") {
    const final = String(d.final ?? "");
    if (!/^\d{4}$/.test(final)) throw new ErroDominio("invalid-argument", "Final do cartão: os 4 últimos números");
    const venc = d.venc == null || d.venc === "" ? null : Number(d.venc);
    if (venc !== null && !(Number.isInteger(venc) && venc >= 1 && venc <= 31)) throw new ErroDominio("invalid-argument", "Dia do vencimento entre 1 e 31");
    return {
      nome: texto(d.nome, 60, "o nome do cartão", true), final,
      bandeira: BANDEIRAS.includes(d.bandeira) ? d.bandeira : "Outra",
      limite: centavos(d.limite ?? 0, "Limite"), fatura: centavos(d.fatura ?? 0, "Fatura"), venc
    };
  }
  throw new ErroDominio("invalid-argument", `Tipo deve ser ${TIPOS.join(", ")}`);
}

/* Sem `id`: lança. Com `id`: troca os dados daquele lançamento (o tipo não muda; um boleto pago
   continua pago). */
async function salvarFinanceiro(db, { id, tipo, ...dados }, por) {
  const agora = FieldValue.serverTimestamp();
  if (!id) {
    const item = validar(tipo, dados);
    const ref = db.collection(FINANCEIRO).doc();
    await db.runTransaction(async tx => {
      tx.create(ref, { tipo, ...item, ...(tipo === "boleto" ? { pago: false } : {}), criadoEm: agora, atualizadoEm: agora, por });
    });
    return { id: ref.id, criado: true };
  }
  const ref = db.collection(FINANCEIRO).doc(String(id));
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ErroDominio("not-found", "Esse lançamento não existe mais");
    tx.update(ref, { ...validar(snap.get("tipo"), dados), atualizadoEm: agora, por });
    return { id: ref.id, criado: false };
  });
}

async function apagarFinanceiro(db, { id }) {
  const ref = db.collection(FINANCEIRO).doc(String(id || ""));
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) return { apagado: false };
    tx.delete(ref);
    return { apagado: true };
  });
}

/* Boleto pago vira saída do caixa no dia `data` (hoje, se não vier). Pagar de novo não muda nada;
   `pago: false` desfaz. */
async function pagarBoleto(db, { id, pago = true, data: dia }, por) {
  const ref = db.collection(FINANCEIRO).doc(String(id || ""));
  const quando = pago ? data(dia, "Data do pagamento") || hojeEmBrasilia() : null;
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists || snap.get("tipo") !== "boleto") throw new ErroDominio("not-found", "Esse boleto não existe mais");
    if (!!snap.get("pago") === !!pago) return { mudou: false };
    tx.update(ref, { pago: !!pago, pagoEm: quando, atualizadoEm: FieldValue.serverTimestamp(), por });
    return { mudou: true };
  });
}

function hojeEmBrasilia() {
  return new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
}

export { salvarFinanceiro, apagarFinanceiro, pagarBoleto, validar as validarFinanceiro, FINANCEIRO };
