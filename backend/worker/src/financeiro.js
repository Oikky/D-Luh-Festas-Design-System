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
/* Boleto = o pai (fornecedor, nota, CNPJ) com as parcelas dentro; cada parcela tem vencimento,
   valor, código e foto, e é paga sozinha. valor/venc/pago/pagoEm do pai são o resumo das parcelas
   (total, próximo vencimento em aberto, todas pagas, último pagamento). */
const PERIODOS = ["semanal", "quinzenal", "mensal"];
const MAX_PARCELAS = 60;

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
/* Foto ou PDF já no Drive (enviarArquivoBoleto devolve o link). */
const arquivos = lista => {
  if (lista == null) return [];
  if (!Array.isArray(lista) || lista.length > 10) throw new ErroDominio("invalid-argument", "No máximo 10 arquivos por boleto ou parcela");
  return lista.map(a => {
    const url = String(a?.url || "");
    if (!/^https:\/\/\S+$/.test(url) || url.length > 500) throw new ErroDominio("invalid-argument", "Link de arquivo inválido");
    return { url, nome: String(a.nome || "").slice(0, 120), pdf: a.pdf === true };
  });
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
  if (tipo === "boleto") {
    if (!Array.isArray(d.parcelas) || !d.parcelas.length) throw new ErroDominio("invalid-argument", "O boleto precisa de pelo menos uma parcela");
    if (d.parcelas.length > MAX_PARCELAS) throw new ErroDominio("invalid-argument", `No máximo ${MAX_PARCELAS} parcelas`);
    return {
      desc: texto(d.desc, 120, "o fornecedor", true),
      cnpjAntigo: d.cnpjAntigo === true, // a loja trocou de CNPJ; os boletos de antes ficam marcados
      periodo: PERIODOS.includes(d.periodo) ? d.periodo : "semanal",
      arquivos: arquivos(d.arquivos),
      parcelas: d.parcelas.map((p, i) => ({
        n: i + 1,
        venc: data(p?.venc, `Vencimento da parcela ${i + 1}`, true),
        valor: positivo(p?.valor, `Valor da parcela ${i + 1}`),
        codigo: texto(p?.codigo, 80, `Código da parcela ${i + 1}`),
        arquivos: arquivos(p?.arquivos)
      }))
    };
  }
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

/* Sem `id`: lança. Com `id`: troca os dados daquele lançamento (o tipo não muda). Num boleto,
   a parcela que já estava paga continua paga (pela posição: parcela 1, 2…). */
async function salvarFinanceiro(db, { id, tipo, ...dados }, por) {
  const agora = FieldValue.serverTimestamp();
  if (!id) {
    const item = validar(tipo, dados);
    const ref = db.collection(FINANCEIRO).doc();
    await db.runTransaction(async tx => {
      tx.create(ref, { tipo, ...(tipo === "boleto" ? comResumo(item, []) : item), criadoEm: agora, atualizadoEm: agora, por });
    });
    return { id: ref.id, criado: true };
  }
  const ref = db.collection(FINANCEIRO).doc(String(id));
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ErroDominio("not-found", "Esse lançamento não existe mais");
    const item = validar(snap.get("tipo"), dados);
    tx.update(ref, { ...(snap.get("tipo") === "boleto" ? comResumo(item, parcelasDe(snap.data())) : item), atualizadoEm: agora, por });
    return { id: ref.id, criado: false };
  });
}

/* Boleto lançado antes das parcelas existirem (um documento por parcela) vira um pai de uma parcela só. */
function parcelasDe(d) {
  if (Array.isArray(d.parcelas)) return d.parcelas;
  return [{ n: 1, venc: d.venc || "", valor: d.valor || 0, codigo: d.codigo || "", arquivos: [], pago: !!d.pago, pagoEm: d.pagoEm || null }];
}

/* Junta o pago/pagoEm das parcelas que já existiam e calcula o resumo do pai. */
function comResumo(item, antigas) {
  const parcelas = item.parcelas.map(p => {
    const a = antigas.find(x => x.n === p.n);
    return { ...p, pago: !!a?.pago, pagoEm: a?.pago ? a.pagoEm || null : null };
  });
  return { ...item, parcelas, ...resumo(parcelas) };
}
function resumo(parcelas) {
  const abertas = parcelas.filter(p => !p.pago).sort((a, b) => a.venc.localeCompare(b.venc));
  const ultima = parcelas.map(p => p.venc).sort().at(-1);
  return {
    valor: parcelas.reduce((s, p) => s + p.valor, 0),
    venc: abertas.length ? abertas[0].venc : ultima,
    pago: !abertas.length,
    pagoEm: abertas.length ? null : parcelas.map(p => p.pagoEm || "").sort().at(-1) || null
  };
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

/* Parcela `n` paga vira saída do caixa no dia `data` (hoje, se não vier). Pagar de novo não muda
   nada; `pago: false` desfaz. */
async function pagarBoleto(db, { id, n = 1, pago = true, data: dia }, por) {
  const ref = db.collection(FINANCEIRO).doc(String(id || ""));
  const quando = pago ? data(dia, "Data do pagamento") || hojeEmBrasilia() : null;
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists || snap.get("tipo") !== "boleto") throw new ErroDominio("not-found", "Esse boleto não existe mais");
    const parcelas = parcelasDe(snap.data());
    const alvo = parcelas.find(p => p.n === Number(n));
    if (!alvo) throw new ErroDominio("not-found", `O boleto não tem a parcela ${n}`);
    if (!!alvo.pago === !!pago) return { mudou: false };
    const novas = parcelas.map(p => p === alvo ? { ...p, pago: !!pago, pagoEm: quando } : p);
    tx.update(ref, { parcelas: novas, ...resumo(novas), atualizadoEm: FieldValue.serverTimestamp(), por });
    return { mudou: true };
  });
}

function hojeEmBrasilia() {
  return new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
}

export { salvarFinanceiro, apagarFinanceiro, pagarBoleto, validar as validarFinanceiro, FINANCEIRO };
