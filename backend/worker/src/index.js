/* API do sistema D'Luh.
     POST /api/<acao>          telas da equipe — Authorization: Bearer <ID token do Firebase>
     POST /webhook/infinitepay aviso de pagamento da InfinitePay
   As telas LEEM direto do Firestore (tempo real); toda ESCRITA passa por aqui e deixa evento. */
import { criarFirestore } from "./firestore.js";
import { verificarToken, tokenDoSistema, quemESistema } from "./auth.js";
import { ErroDominio, MEIOS } from "./dominio.js";
import { ehEquipe } from "./equipe.js";
import * as pedidos from "./pedidos.js";
import * as infinitepay from "./infinitepay.js";

const STATUS_HTTP = { "invalid-argument": 400, unauthenticated: 401, "permission-denied": 403, "not-found": 404, "failed-precondition": 409 };

function corsDe(request, env) {
  const origem = request.headers.get("Origin");
  const permitidas = String(env.ORIGENS || "").split(",").map(s => s.trim());
  if (!origem || !permitidas.includes(origem)) return {};
  return {
    "Access-Control-Allow-Origin": origem,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

const json = (dados, status = 200, extra = {}) =>
  new Response(JSON.stringify(dados), { status, headers: { "Content-Type": "application/json", ...extra } });

function banco(env) {
  return criarFirestore({ projectId: env.FIREBASE_PROJECT_ID, token: () => tokenDoSistema(env) });
}

const ACOES = {
  criarPedido: (db, dados, por) => pedidos.criarPedido(db, dados, por),
  mudarStatus: (db, dados, por) => pedidos.mudarStatus(db, dados, por),
  marcarFeito: (db, dados, por) => pedidos.marcarFeito(db, dados, por),

  /* Pix direto na conta, dinheiro, maquininha, ou "outro". A tela manda uma `chave` nova por clique
     (crypto.randomUUID()), então um clique repetido não paga duas vezes. */
  registrarPagamentoManual: (db, dados, por) => {
    if (!MEIOS.includes(dados.meio)) throw new ErroDominio("invalid-argument", `Meio deve ser ${MEIOS.join(", ")}`);
    if (!dados.chave) throw new ErroDominio("invalid-argument", "Falta a chave do pagamento");
    return pedidos.registrarPagamento(db, { ...dados, chave: `manual-${dados.chave}` }, por);
  },

  async gerarCobranca(db, { pedidoId, tipo }, por, env, origem) {
    const snap = await db.collection(pedidos.PEDIDOS).doc(String(pedidoId || "")).get();
    if (!snap.exists) throw new ErroDominio("not-found", `Pedido ${pedidoId} não existe`);
    const { total, pago, cliente, entradaPct = 50 } = snap.data();
    const valor = { entrada: Math.round(total * entradaPct / 100) - pago, restante: total - pago, total }[tipo];
    if (valor === undefined) throw new ErroDominio("invalid-argument", "Tipo deve ser entrada, restante ou total");
    if (valor <= 0) throw new ErroDominio("failed-precondition", "Não há nada a cobrar nesse pedido");

    const nomeTipo = { entrada: "Entrada", restante: "Restante", total: "Total" }[tipo];
    const url = await infinitepay.criarLink({
      handle: env.INFINITEPAY_HANDLE, pedidoId: snap.id, valor,
      descricao: `${nomeTipo} — Pedido ${snap.id} — ${cliente.nome}`,
      webhookUrl: `${origem}/webhook/infinitepay`
    });
    await snap.ref.collection("eventos").add({ tipo: "cobranca", cobranca: tipo, valor, url, por, em: new Date() });
    return { url, valor };
  }
};

async function api(request, env, acao) {
  const bearer = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!bearer) throw new ErroDominio("unauthenticated", "Faça login");
  let claims;
  try { claims = await verificarToken(bearer, env.FIREBASE_PROJECT_ID); }
  catch { throw new ErroDominio("unauthenticated", "Login expirado. Entre de novo."); }
  if (!ehEquipe(claims)) throw new ErroDominio("permission-denied", "Só a equipe da D'Luh pode fazer isso");

  const dados = await request.json().catch(() => { throw new ErroDominio("invalid-argument", "Corpo não é JSON"); });
  return ACOES[acao](banco(env), dados || {}, claims.email, env, new URL(request.url).origin);
}

async function webhookInfinitepay(request, env) {
  const ok = (message = null) => json({ success: true, message });
  const tentarDeNovo = message => json({ success: false, message }, 400); // a InfinitePay reenvia no 400

  const corpo = await request.json().catch(() => ({}));
  const { order_nsu, transaction_nsu, invoice_slug, receipt_url } = corpo;
  if (!order_nsu || !transaction_nsu || !invoice_slug) return ok("ignorado: campos ausentes");

  try {
    const conf = await infinitepay.conferirPagamento({ handle: env.INFINITEPAY_HANDLE, order_nsu, transaction_nsu, slug: invoice_slug });
    if (!conf.pago) return tentarDeNovo("pagamento não confirmado no payment_check");
    const r = await pedidos.registrarPagamento(banco(env), {
      pedidoId: order_nsu, valor: conf.valor, chave: `ip-${transaction_nsu}`, meio: conf.meio, comprovante: receipt_url
    }, "infinitepay");
    return ok(r.duplicado ? "já registrado" : null);
  } catch (e) {
    if (e instanceof ErroDominio && e.codigo === "not-found") {
      console.error(JSON.stringify({ msg: "pagamento de pedido inexistente", order_nsu, transaction_nsu }));
      return ok("pedido não encontrado"); // reenviar não vai fazer o pedido aparecer
    }
    console.error(JSON.stringify({ msg: "erro no webhook", erro: String(e), order_nsu }));
    return tentarDeNovo("erro temporário");
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/webhook/infinitepay") {
      if (request.method !== "POST") return new Response(null, { status: 405 });
      return webhookInfinitepay(request, env);
    }

    const cors = corsDe(request, env);
    const acao = url.pathname.match(/^\/api\/(\w+)$/)?.[1];
    if (!acao || !Object.hasOwn(ACOES, acao)) return json({ erro: "Não encontrado" }, 404, cors);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ erro: "Use POST" }, 405, cors);

    try {
      return json(await api(request, env, acao), 200, cors);
    } catch (e) {
      if (e instanceof ErroDominio) return json({ erro: e.message, codigo: e.codigo }, STATUS_HTTP[e.codigo] || 400, cors);
      console.error(JSON.stringify({ msg: "erro na api", acao, erro: String(e), chamada: e.chamada, sistema: quemESistema() }));
      return json({ erro: "Não deu certo. Tente de novo.", codigo: "internal" }, 500, cors);
    }
  }
};
