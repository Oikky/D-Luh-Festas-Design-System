/* API do sistema D'Luh.
     POST /api/<acao>          telas da equipe — Authorization: Bearer <ID token do Firebase>
                               (as ações de CLIENTE aceitam qualquer login do Firebase, até anônimo)
     POST /site/pedido, /site/consultar  site dos clientes, sem login (site.js)
     POST /webhook/infinitepay aviso de pagamento da InfinitePay
     GET/POST /webhook/whatsapp  assistente da equipe no WhatsApp da Meta (ia/assistente.js)
     cron diário               backup no Google Drive
   As telas LEEM direto do Firestore (tempo real); toda ESCRITA passa por aqui e deixa evento. */
import { criarFirestore } from "./firestore.js";
import { verificarToken, tokenDoSistema, quemESistema } from "./auth.js";
import { ErroDominio, MEIOS } from "./dominio.js";
import { ehEquipe } from "./equipe.js";
import * as pedidos from "./pedidos.js";
import * as infinitepay from "./infinitepay.js";
import * as produtos from "./produtos.js";
import { enviarImagem } from "./google.js";
import { whatsappLigado, enviarTexto } from "./whatsapp.js";
import * as efeitos from "./efeitos.js";
import { metaLigado, verificarWebhook, assinaturaValida, mensagensDe, canalMeta } from "./ia/meta.js";
import { mensagemEvolution, canalEvolution } from "./ia/evolution.js";
import { iaPronta, autorizado, tratarMensagem } from "./ia/assistente.js";
import * as site from "./site.js";

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
  editarPedido: (db, dados, por) => pedidos.editarPedido(db, dados, por),
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
  },

  salvarProduto: (db, dados, por) => produtos.salvarProduto(db, dados, por),
  apagarProduto: (db, dados) => produtos.apagarProduto(db, dados),
  salvarRecheios: (db, dados, por) => produtos.salvarRecheios(db, dados, por),
  enviarImagem: (db, dados, por, env) => enviarImagem(env, { dataUrl: dados.dataUrl, prefixo: "produto" }),

  /* "Notificar alterações": manda ao cliente, pelo WhatsApp da loja, o resumo atual do pedido. */
  async avisarCliente(db, { pedidoId }, por, env) {
    if (!whatsappLigado(env)) throw new ErroDominio("failed-precondition", "O WhatsApp automático ainda não foi configurado");
    const p = await efeitos.lerPedido(db, pedidoId);
    if (!p) throw new ErroDominio("not-found", `Pedido ${pedidoId} não existe`);
    await enviarTexto(env, p.cliente?.telefone, efeitos.resumoParaCliente(p));
    await db.collection(pedidos.PEDIDOS).doc(p.id).collection("eventos").add({ tipo: "aviso", canal: "whatsapp", por, em: new Date() });
    return { enviado: true };
  }
};

/* Ações que qualquer pessoa logada no Firebase pode chamar (clientes do site). */
const ACOES_CLIENTE = {
  /* Imagem de referência do topo do bolo. Devolve o link para ir em itens[].topo.imagem. */
  enviarTopo: (db, dados, por, env) => enviarImagem(env, { dataUrl: dados.dataUrl, prefixo: "topo" })
};

/* Ações só da conta "sistema" (e-mail/senha de SISTEMA_EMAIL), para scripts de manutenção como
   backend/scripts/fotos-para-drive.mjs. */
const ACOES_SISTEMA = {
  /* Troca a foto de um produto: sobe a imagem pro Drive e grava o link em sis_produtos/{id}.imagem. */
  async trocarFotoProduto(db, { id, dataUrl }, por, env) {
    const ref = db.collection(produtos.PRODUTOS).doc(String(id || ""));
    const snap = await ref.get();
    if (!snap.exists) throw new ErroDominio("not-found", `Produto ${id} não existe`);
    const { url } = await enviarImagem(env, { dataUrl, prefixo: `produto-${snap.id}` });
    await ref.set({ imagem: url, por }, { merge: true });
    return { id: snap.id, imagem: url };
  }
};
const ehSistema = (claims, env) => !!claims && claims.email === env.SISTEMA_EMAIL && claims.firebase?.sign_in_provider === "password";

/* Depois de uma ação dar certo: Agenda e avisos, sem segurar a resposta da tela. */
const DEPOIS = {
  criarPedido: (env, db, dados, r) => [efeitos.sincronizarAgenda(env, db, r.id), efeitos.avisarLojaNovoPedido(env, db, r.id)],
  editarPedido: (env, db, dados, r) => r.mudou ? [efeitos.sincronizarAgenda(env, db, dados.pedidoId)] : [],
  mudarStatus: (env, db, dados, r) => !r.mudou ? [] : [
    efeitos.sincronizarAgenda(env, db, dados.pedidoId),
    ...(r.status === "Pronto" ? [efeitos.avisarClientePronto(env, db, dados.pedidoId)] : [])
  ],
  registrarPagamentoManual: (env, db, dados, r) => r.duplicado ? [] : [
    efeitos.sincronizarAgenda(env, db, dados.pedidoId), efeitos.avisarClientePagamento(env, db, dados.pedidoId, dados.valor)
  ]
};

async function api(request, env, ctx, acao) {
  const bearer = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!bearer) throw new ErroDominio("unauthenticated", "Faça login");
  let claims;
  try { claims = await verificarToken(bearer, env.FIREBASE_PROJECT_ID); }
  catch { throw new ErroDominio("unauthenticated", "Login expirado. Entre de novo."); }
  const doCliente = Object.hasOwn(ACOES_CLIENTE, acao);
  const doSistema = Object.hasOwn(ACOES_SISTEMA, acao);
  if (doSistema ? !ehSistema(claims, env) : (!doCliente && !ehEquipe(claims))) {
    throw new ErroDominio("permission-denied", "Só a equipe da D'Luh pode fazer isso");
  }

  const dados = (await request.json().catch(() => { throw new ErroDominio("invalid-argument", "Corpo não é JSON"); })) || {};
  const db = banco(env);
  const quem = claims.email || `uid:${claims.sub}`;
  const r = await (doSistema ? ACOES_SISTEMA : doCliente ? ACOES_CLIENTE : ACOES)[acao](db, dados, quem, env, new URL(request.url).origin);
  depois(ctx, (DEPOIS[acao]?.(env, db, dados, r) || []), acao, dados.pedidoId || r?.id);
  return r;
}

function depois(ctx, promessas, oque, pedidoId) {
  const todas = Promise.all(promessas.map(p => Promise.resolve(p).catch(efeitos.falhou(oque, pedidoId))));
  if (ctx?.waitUntil) ctx.waitUntil(todas);
}

/* Site dos clientes: sem login, com limite por IP e (se configurado) Turnstile. */
async function rotaDoSite(request, env, ctx, rota, cors) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "POST") return json({ erro: "Use POST" }, 405, cors);
  const ip = request.headers.get("CF-Connecting-IP") || "";
  if (!(await site.dentroDoLimite(env, rota, ip))) {
    return json({ erro: "Muitas tentativas seguidas. Espere um minuto e tente de novo.", codigo: "limite" }, 429, cors);
  }
  try {
    const dados = (await request.json().catch(() => { throw new ErroDominio("invalid-argument", "Corpo não é JSON"); })) || {};
    if (!(await site.turnstileOk(env, dados.turnstile, ip))) throw new ErroDominio("permission-denied", "Confirme que você não é um robô");
    const db = banco(env);
    if (rota === "consultar") return json(await site.consultarDoSite(db, dados), 200, cors);
    const r = await site.pedidoDoSite(db, dados);
    depois(ctx, [...DEPOIS.criarPedido(env, db, dados, r), efeitos.avisarClienteRecebido(env, db, r.id)], "pedidoDoSite", r.id);
    return json({ id: r.id, total: r.total }, 200, cors);
  } catch (e) {
    if (e instanceof ErroDominio) return json({ erro: e.message, codigo: e.codigo }, STATUS_HTTP[e.codigo] || 400, cors);
    console.error(JSON.stringify({ msg: "erro no site", rota, erro: String(e), chamada: e.chamada }));
    return json({ erro: "Não deu certo. Tente de novo.", codigo: "internal" }, 500, cors);
  }
}

async function webhookInfinitepay(request, env, ctx) {
  const ok = (message = null) => json({ success: true, message });
  const tentarDeNovo = message => json({ success: false, message }, 400); // a InfinitePay reenvia no 400

  const corpo = await request.json().catch(() => ({}));
  const { order_nsu, transaction_nsu, invoice_slug, receipt_url } = corpo;
  if (!order_nsu || !transaction_nsu || !invoice_slug) return ok("ignorado: campos ausentes");

  try {
    const conf = await infinitepay.conferirPagamento({ handle: env.INFINITEPAY_HANDLE, order_nsu, transaction_nsu, slug: invoice_slug });
    if (!conf.pago) return tentarDeNovo("pagamento não confirmado no payment_check");
    const db = banco(env);
    const r = await pedidos.registrarPagamento(db, {
      pedidoId: order_nsu, valor: conf.valor, chave: `ip-${transaction_nsu}`, meio: conf.meio, comprovante: receipt_url
    }, "infinitepay");
    if (!r.duplicado) depois(ctx, [efeitos.sincronizarAgenda(env, db, order_nsu), efeitos.avisarClientePagamento(env, db, order_nsu, conf.valor)], "webhook", order_nsu);
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

/* Ações confirmadas na assistente passam pelas mesmas ACOES e DEPOIS das telas. */
function executorDaIA(env, ctx, db) {
  return async (acao, dados, por) => {
    const r = await ACOES[acao](db, dados, por, env);
    depois(ctx, DEPOIS[acao]?.(env, db, dados, r) || [], acao, dados.pedidoId || r?.id);
    return r;
  };
}

const conversaDaIA = (env, ctx, db, msg, canal) => tratarMensagem({ env, db, msg, executar: executorDaIA(env, ctx, db), canal })
  .catch(e => console.error(JSON.stringify({ msg: "assistente falhou", erro: String(e) })));

/* Assistente no WhatsApp da Meta. Responde 200 na hora (a Meta reenvia se demorar) e conversa
   depois, em waitUntil. */
async function webhookWhatsapp(request, env, ctx, url) {
  if (!iaPronta(env) || !metaLigado(env)) return new Response(null, { status: 404 });
  if (request.method === "GET") return verificarWebhook(url, env);
  if (request.method !== "POST") return new Response(null, { status: 405 });

  const corpo = await request.text();
  if (!(await assinaturaValida(corpo, request.headers.get("X-Hub-Signature-256"), env.META_APP_SECRET))) {
    return new Response(null, { status: 401 });
  }
  let dados;
  try { dados = JSON.parse(corpo); } catch { return new Response(null, { status: 400 }); }

  const db = banco(env);
  ctx.waitUntil(Promise.all(mensagensDe(dados).map(msg => conversaDaIA(env, ctx, db, msg, canalMeta(env)))));
  return new Response("ok");
}

/* Todos os eventos da Evolution (número da loja). Mensagem de texto de quem está em IA_NUMEROS vai
   para a assistente; todo o resto segue igual para EVOLUTION_REPASSE (quem recebia antes). */
async function webhookEvolution(request, env, ctx, token) {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  if (!env.EVOLUTION_WEBHOOK_TOKEN || token !== env.EVOLUTION_WEBHOOK_TOKEN) return new Response(null, { status: 404 });

  const corpo = await request.text();
  let dados;
  try { dados = JSON.parse(corpo); } catch { return new Response(null, { status: 400 }); }

  const msg = mensagemEvolution(dados);
  // Com a Meta ligada a assistente mora só no número dela; o da loja volta a repassar tudo.
  const daIA = !!(msg && iaPronta(env) && !metaLigado(env) && autorizado(env, msg.de));
  if (msg) {
    // Diagnóstico de quem é quem (o WhatsApp pode identificar o contato por @lid): só os 4 últimos dígitos.
    const mascara = s => (s == null ? undefined : String(s).replace(/\d(?=\d{4})/g, "•"));
    const k = (Array.isArray(dados.data) ? dados.data[0] : dados.data)?.key || {};
    console.log(JSON.stringify({ msg: "evolution: mensagem recebida", campos: Object.keys(k), remoteJid: mascara(k.remoteJid),
      remoteJidAlt: mascara(k.remoteJidAlt), senderPn: mascara(k.senderPn), participant: mascara(k.participant), de: mascara(msg.de), daIA }));
  }
  if (daIA) {
    ctx.waitUntil(conversaDaIA(env, ctx, banco(env), msg, canalEvolution(env)));
  } else if (env.EVOLUTION_REPASSE) {
    ctx.waitUntil(fetch(env.EVOLUTION_REPASSE, { method: "POST", headers: { "Content-Type": "application/json" }, body: corpo })
      .then(r => { if (!r.ok) console.error(JSON.stringify({ msg: "repasse da Evolution recusado", status: r.status, evento: dados?.event })); })
      .catch(e => console.error(JSON.stringify({ msg: "repasse da Evolution falhou", erro: String(e) }))));
  }
  return new Response("ok");
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/webhook/whatsapp") return webhookWhatsapp(request, env, ctx, url);
    const evo = url.pathname.match(/^\/webhook\/evolution\/([\w-]+)$/);
    if (evo) return webhookEvolution(request, env, ctx, evo[1]);

    if (url.pathname === "/webhook/infinitepay") {
      if (request.method !== "POST") return new Response(null, { status: 405 });
      return webhookInfinitepay(request, env, ctx);
    }

    const cors = corsDe(request, env);
    const rotaSite = url.pathname.match(/^\/site\/(pedido|consultar)$/)?.[1];
    if (rotaSite) return rotaDoSite(request, env, ctx, rotaSite, cors);
    const acao = url.pathname.match(/^\/api\/(\w+)$/)?.[1];
    if (!acao || ![ACOES, ACOES_CLIENTE, ACOES_SISTEMA].some(a => Object.hasOwn(a, acao))) return json({ erro: "Não encontrado" }, 404, cors);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ erro: "Use POST" }, 405, cors);

    try {
      return json(await api(request, env, ctx, acao), 200, cors);
    } catch (e) {
      if (e instanceof ErroDominio) return json({ erro: e.message, codigo: e.codigo }, STATUS_HTTP[e.codigo] || 400, cors);
      console.error(JSON.stringify({ msg: "erro na api", acao, erro: String(e), chamada: e.chamada, sistema: quemESistema() }));
      return json({ erro: "Não deu certo. Tente de novo.", codigo: "internal" }, 500, cors);
    }
  },

  async scheduled(evento, env, ctx) {
    ctx.waitUntil(efeitos.backup(env, banco(env)).catch(e => console.error(JSON.stringify({ msg: "backup falhou", erro: String(e) }))));
  }
};
