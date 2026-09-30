/* Apoio à skill nota-erp4me (.claude/skills/nota-erp4me): lê o pedido para preencher a nota no
   ERP4ME e, depois de emitida, grava o número no pedido — pela mesma regra do Worker (notas.js),
   entrando no Firestore como a conta sistema.

   Uso (na raiz do projeto):
     node backend/scripts/nota-erp4me.mjs dados PED-3005
     node backend/scripts/nota-erp4me.mjs registrar PED-3005 NFS-e 152 [CPF-ou-CNPJ]
   A senha da conta sistema vem de SISTEMA_SENHA (variável de ambiente) ou de backend/.env
   (linha SISTEMA_SENHA=...; o arquivo fica fora do Git). */
import fs from "node:fs";
import { criarFirestore } from "../worker/src/firestore.js";
import { tokenDoSistema } from "../worker/src/auth.js";
import { registrarNota } from "../worker/src/notas.js";

const [comando, pedidoId, ...resto] = process.argv.slice(2);
const sair = msg => { console.error(msg); process.exit(1); };
if (!["dados", "registrar"].includes(comando) || !/^PED-\d+$/.test(pedidoId || "")) {
  sair("Uso: nota-erp4me.mjs dados PED-3005  |  nota-erp4me.mjs registrar PED-3005 NFS-e 152 [CPF/CNPJ]");
}

function senha() {
  if (process.env.SISTEMA_SENHA) return process.env.SISTEMA_SENHA;
  const arq = new URL("../.env", import.meta.url);
  const linha = fs.existsSync(arq) && fs.readFileSync(arq, "utf8").split(/\r?\n/).find(l => l.startsWith("SISTEMA_SENHA="));
  return linha ? linha.slice("SISTEMA_SENHA=".length).trim() : sair("Defina SISTEMA_SENHA (ou backend/.env com SISTEMA_SENHA=...).");
}

const env = {
  FIREBASE_API_KEY: "AIzaSyCV7LcTZmCE9MpezCvBah0hHQ245WYcixs",
  SISTEMA_EMAIL: "sistema@dluh-festas.firebaseapp.com",
  SISTEMA_SENHA: senha()
};
const db = criarFirestore({ projectId: "dluh-festas", token: () => tokenDoSistema(env) });

/* Valor no formato que o ERP4ME digita: 1240,5 → "1240,50". */
const reais = c => ((c || 0) / 100).toFixed(2).replace(".", ",");

if (comando === "dados") {
  const snap = await db.collection("sis_pedidos").doc(pedidoId).get();
  if (!snap.exists) sair(`${pedidoId} não existe`);
  const p = snap.data();
  console.log(JSON.stringify({
    id: pedidoId,
    status: p.status,
    tipo: p.tipo || "pessoa",
    cliente: { nome: p.cliente?.nome || "", telefone: p.cliente?.telefone || "", email: p.cliente?.email || "" },
    entrega: p.entrega || {},
    itens: (p.itens || []).map(i => ({ nome: i.nome, qtd: i.qtd, valorUnit: reais(i.valorUnit), total: reais(i.qtd * i.valorUnit) })),
    taxaEntrega: reais(p.taxaEntrega),
    total: reais(p.total),
    pago: reais(p.pago),
    formaPagamento: p.formaPagamento || null,
    notaJaRegistrada: p.nota ? { tipo: p.nota.tipo, numero: p.nota.numero, documento: p.nota.documento || "" } : null
  }, null, 2));
} else {
  const [tipo, numero, documento] = resto;
  const r = await registrarNota(db, { pedidoId, tipo, numero, documento }, "skill nota-erp4me");
  console.log(`${pedidoId}: ${r.nota.tipo} ${r.nota.numero} registrada no pedido.`);
}
