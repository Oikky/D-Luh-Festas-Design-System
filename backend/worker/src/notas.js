/* Nota fiscal do pedido. A nota é emitida no ERP4ME da Alterdata (erpforme.alterdata.com.br), que
   ainda não tem API aberta: por enquanto a equipe emite lá e registra aqui o número. Quando a
   Alterdata liberar a API, a emissão entra aqui e grava no mesmo campo `nota`. */
import { FieldValue } from "./firestore.js";
import { ErroDominio } from "./dominio.js";
import { PEDIDOS } from "./pedidos.js";

const TIPOS_NOTA = ["NFS-e", "NFC-e"];

/* CPF (11 dígitos) ou CNPJ (14), só os números. Vazio vale: NFC-e e NFS-e de pessoa podem sair sem. */
function documentoDe(valor) {
  const d = String(valor || "").replace(/\D/g, "");
  if (d && d.length !== 11 && d.length !== 14) throw new ErroDominio("invalid-argument", "CPF deve ter 11 dígitos e CNPJ 14");
  return d;
}

/* Grava (ou corrige) a nota emitida. O evento guarda a nota anterior, se havia. */
async function registrarNota(db, { pedidoId, tipo, numero, documento }, por) {
  if (!TIPOS_NOTA.includes(tipo)) throw new ErroDominio("invalid-argument", `Tipo de nota deve ser ${TIPOS_NOTA.join(" ou ")}`);
  const n = String(numero || "").trim();
  if (!n) throw new ErroDominio("invalid-argument", "Informe o número da nota");
  if (n.length > 60) throw new ErroDominio("invalid-argument", "Número da nota muito longo");
  const doc = documentoDe(documento);
  const ref = db.collection(PEDIDOS).doc(String(pedidoId || ""));

  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ErroDominio("not-found", `Pedido ${pedidoId} não existe`);
    const antes = snap.get("nota") || null;
    const nota = { tipo, numero: n, ...(doc ? { documento: doc } : {}), por, em: new Date() };
    tx.update(ref, { nota, atualizadoEm: FieldValue.serverTimestamp() });
    tx.create(ref.collection("eventos").doc(), { tipo: "nota", nota: tipo, numero: n, antes, por, em: FieldValue.serverTimestamp() });
    return { nota };
  });
}

export { registrarNota, TIPOS_NOTA };
