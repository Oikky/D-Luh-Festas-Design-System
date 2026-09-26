/* Catálogo: produtos (sis_produtos/{id}) e a lista de recheios (sis_catalogo/recheios).
   O site lê direto do Firestore (leitura pública); só a equipe grava, por aqui. */
import { FieldValue } from "./firestore.js";
import { centavos, ErroDominio } from "./dominio.js";

const PRODUTOS = "sis_produtos";
const RECHEIOS = "sis_catalogo/recheios";

const texto = (v, max, campo) => {
  const s = String(v ?? "").trim();
  if (s.length > max) throw new ErroDominio("invalid-argument", `${campo}: no máximo ${max} caracteres`);
  return s;
};

function validarProduto(d) {
  const nome = texto(d?.nome, 80, "Nome");
  const categoria = texto(d?.categoria, 40, "Categoria");
  if (!nome) throw new ErroDominio("invalid-argument", "Informe o nome do produto");
  if (!categoria) throw new ErroDominio("invalid-argument", "Informe a categoria");
  const valorUnit = centavos(d.valorUnit, "Preço");
  if (valorUnit === 0) throw new ErroDominio("invalid-argument", "Preço deve ser maior que zero");
  const qtdMin = d.qtdMin == null || d.qtdMin === "" ? 1 : Number(d.qtdMin);
  if (!Number.isInteger(qtdMin) || qtdMin < 1) throw new ErroDominio("invalid-argument", "Quantidade mínima deve ser 1 ou mais");
  const imagem = String(d.imagem || "");
  if (imagem && !/^https:\/\//.test(imagem)) throw new ErroDominio("invalid-argument", "Link da foto inválido");
  const tiposPacote = Array.isArray(d.tiposPacote) ? d.tiposPacote.map(t => String(t).trim()).filter(Boolean).slice(0, 20) : [];
  return {
    nome, categoria, valorUnit, qtdMin,
    ingredientes: texto(d.ingredientes, 500, "Ingredientes"),
    imagem,
    ativo: d.ativo !== false,
    destaque: d.destaque === true,
    tiposPacote
  };
}

/* Sem `id`: cria. Com `id`: substitui os dados daquele produto (precisa existir). */
async function salvarProduto(db, { id, ...dados }, por) {
  const p = validarProduto(dados);
  const agora = FieldValue.serverTimestamp();
  if (!id) {
    const ref = db.collection(PRODUTOS).doc();
    await db.runTransaction(async tx => { tx.create(ref, { ...p, criadoEm: agora, atualizadoEm: agora, por }); });
    return { id: ref.id, criado: true };
  }
  const ref = db.collection(PRODUTOS).doc(String(id));
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ErroDominio("not-found", "Produto não existe mais");
    tx.update(ref, { ...p, atualizadoEm: agora, por });
    return { id: ref.id, criado: false };
  });
}

async function apagarProduto(db, { id }) {
  const ref = db.collection(PRODUTOS).doc(String(id || ""));
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) return { apagado: false };
    tx.delete(ref);
    return { apagado: true };
  });
}

async function salvarRecheios(db, { lista }, por) {
  if (!Array.isArray(lista)) throw new ErroDominio("invalid-argument", "Envie a lista de recheios");
  const vistos = new Set();
  const limpa = lista.map(r => texto(r, 60, "Recheio")).filter(r => r && !vistos.has(r.toLowerCase()) && vistos.add(r.toLowerCase()));
  if (limpa.length > 100) throw new ErroDominio("invalid-argument", "No máximo 100 recheios");
  await db.doc(RECHEIOS).set({ lista: limpa, atualizadoEm: FieldValue.serverTimestamp(), por });
  return { lista: limpa };
}

export { salvarProduto, apagarProduto, salvarRecheios, validarProduto, PRODUTOS, RECHEIOS };
