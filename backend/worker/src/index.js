/* API do sistema D'Luh.
     POST /api/<acao>          telas da equipe — Authorization: Bearer <ID token do Firebase>
                               (as ações de CLIENTE aceitam qualquer login do Firebase, até anônimo)
     POST /site/pedido, /site/consultar, /site/frete  site dos clientes, sem login (site.js, frete.js)
     /sofia/<pedido|consultar|pagar>/<token>  agente Sofia do GPTMaker (sofia.js)
     POST /webhook/infinitepay aviso de pagamento da InfinitePay
     GET /pagar/<pedido>       link curto de pagamento (leva ao último checkout gerado)
     GET/POST /webhook/whatsapp  assistente da equipe no WhatsApp da Meta (ia/assistente.js)
     POST /webhook/telegram    grupo da equipe no Telegram: botão "Confirmar estoque" e tópico IA (telegram.js)
     POST /webhook/alexa       skill da Alexa na cozinha: lê a fila e marca feito (alexa.js)
     cron diário               backup no Google Drive; lembrete da entrada (lembretes.js)
   As telas LEEM direto do Firestore (tempo real); toda ESCRITA passa por aqui e deixa evento. */
import { criarFirestore } from "./firestore.js";
import { verificarToken, tokenDoSistema, quemESistema } from "./auth.js";
import { ErroDominio, MEIOS } from "./dominio.js";
import { ehEquipe } from "./equipe.js";
import * as pedidos from "./pedidos.js";
import * as infinitepay from "./infinitepay.js";
import * as sofia from "./sofia.js";
import * as produtos from "./produtos.js";
import * as financeiro from "./financeiro.js";
import * as notas from "./notas.js";
import { enviarImagem } from "./google.js";
import { whatsappLigado, enviarTexto } from "./whatsapp.js";
import * as efeitos from "./efeitos.js";
import { metaLigado, verificarWebhook, assinaturaValida, mensagensDe, canalMeta } from "./ia/meta.js";
import { mensagemEvolution, canalEvolution } from "./ia/evolution.js";
import { iaPronta, iaNoTelegram, autorizado, tratarMensagem } from "./ia/assistente.js";
import * as telegram from "./telegram.js";
import * as lembretes from "./lembretes.js";
import * as alexa from "./alexa.js";

const CRON_LEMBRETE = "0 12 * * *";
const CRON_COZINHA = "*/15 * * * *";
import * as site from "./site.js";
import { estimarFrete } from "./frete.js";

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

  /* Apagar de vez pede a senha da conta sistema (SISTEMA_SENHA), além do login da equipe. */
  async apagarPedido(db, { pedidoId, senha }, por, env) {
    if (!(await senhaDoSistema(env, senha))) throw new ErroDominio("invalid-argument", "Senha errada");
    return pedidos.apagarPedido(db, { pedidoId });
  },
  /* Apagar um registro de pagamento também pede a senha da conta sistema. */
  async apagarPagamento(db, { pagamentoId, senha }, por, env) {
    if (!(await senhaDoSistema(env, senha))) throw new ErroDominio("invalid-argument", "Senha errada");
    return pedidos.apagarPagamento(db, { pagamentoId }, por);
  },

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
      webhookUrl: `${origem}/webhook/infinitepay`,
      redirectUrl: `https://www.dluhfestas.com/pedido?n=${encodeURIComponent(snap.id)}`,
      cliente
    });
    await snap.ref.collection("eventos").add({ tipo: "cobranca", cobranca: tipo, valor, url, por, em: new Date() });
    // O cliente recebe o link curto (/pagar/PED-n), que leva ao checkout da InfinitePay.
    return { url: linkCurto(snap.id), completo: url, valor };
  },

  salvarProduto: (db, dados, por) => produtos.salvarProduto(db, dados, por),
  apagarProduto: (db, dados) => produtos.apagarProduto(db, dados),
  salvarRecheios: (db, dados, por) => produtos.salvarRecheios(db, dados, por),
  enviarImagem: (db, dados, por, env) => enviarImagem(env, { dataUrl: dados.dataUrl, prefixo: "produto" }),

  /* Nota fiscal emitida no ERP4ME: guarda tipo, número e CPF/CNPJ no pedido (notas.js). */
  registrarNota: (db, dados, por) => notas.registrarNota(db, dados, por),

  /* Financeiro: transações avulsas, boletos, cartões e compras no cartão (financeiro.js). */
  salvarFinanceiro: (db, dados, por) => financeiro.salvarFinanceiro(db, dados, por),
  apagarFinanceiro: (db, dados) => financeiro.apagarFinanceiro(db, dados),
  pagarBoleto: (db, dados, por) => financeiro.pagarBoleto(db, dados, por),
  pagarFatura: (db, dados, por) => financeiro.pagarFatura(db, dados, por),
  /* Foto ou PDF da nota ou de uma parcela: sobe pro Drive e devolve { url, pdf } para ir em arquivos[]. */
  enviarArquivoBoleto: (db, dados, por, env) => enviarImagem(env, { dataUrl: dados.dataUrl, prefixo: "boleto", aceitaPdf: true }),

  /* "Lembrar todos" na aba Esperando pagamento: diz quantos vão receber; o envio (um a um, com
     pausa) segue em DEPOIS, sem segurar a tela. */
  async lembrarEntrada(db, { pedidoIds }, por, env) {
    lembretes.exigirWhatsapp(env);
    const lista = await lembretes.paraLembrar(db, { pedidoIds: Array.isArray(pedidoIds) ? pedidoIds.map(String) : undefined });
    // A lista vai para o DEPOIS, não para a resposta da tela.
    return Object.defineProperty({ total: lista.length }, "lista", { value: lista, enumerable: false });
  },

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
  /* O mesmo que enviarArquivoBoleto, para backend/scripts/coda-boletos.mjs trazer as fotos do Coda. */
  enviarArquivoBoletoSistema: (db, dados, por, env) => enviarImagem(env, { dataUrl: dados.dataUrl, prefixo: "boleto", aceitaPdf: true }),
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
/* Compara pelos hashes, em tempo constante, para a resposta não entregar a senha aos poucos. */
async function senhaDoSistema(env, senha) {
  if (!env.SISTEMA_SENHA || typeof senha !== "string" || !senha) return false;
  const h = async t => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)));
  const [a, b] = await Promise.all([h(senha), h(env.SISTEMA_SENHA)]);
  return crypto.subtle.timingSafeEqual ? crypto.subtle.timingSafeEqual(a, b) : a.every((x, i) => x === b[i]);
}
const ehSistema = (claims, env) => !!claims && claims.email === env.SISTEMA_EMAIL && claims.firebase?.sign_in_provider === "password";

/* Endereço público do Worker: o link da InfinitePay avisa o pagamento aqui (o cron não tem request). */
const ORIGEM_API = "https://api.dluhfestas.com";
const linkCurto = pedidoId => `${ORIGEM_API}/pagar/${encodeURIComponent(pedidoId)}`;

/* Link curto de pagamento, como no sistema antigo (/pagar?rowId=…): leva ao último link gerado
   para o pedido. Pedido já pago, ou sem cobrança, vai para a página de acompanhamento no site. */
async function pagar(pedidoId, env) {
  const acompanhar = `https://www.dluhfestas.com/pedido?n=${encodeURIComponent(pedidoId)}`;
  const db = banco(env);
  const p = await efeitos.lerPedido(db, pedidoId);
  if (!p || p.status === "Cancelado" || (p.total || 0) - (p.pago || 0) <= 0) return Response.redirect(acompanhar, 302);
  const eventos = await db.collection(pedidos.PEDIDOS).doc(p.id).collection("eventos").listar();
  const ultimo = eventos.filter(e => e.tipo === "cobranca" && /^https:\/\//.test(e.url || ""))
    .sort((a, b) => new Date(b.em) - new Date(a.em))[0];
  return Response.redirect(ultimo ? ultimo.url : acompanhar, 302);
}
const gerarEntrada = (env, db, por) => Object.assign(
  pedidoId => ACOES.gerarCobranca(db, { pedidoId, tipo: "entrada" }, por, env, ORIGEM_API),
  { curto: pedidoId => linkCurto(pedidoId) });

/* O pagamento que tirou o pedido da espera e o mandou para a cozinha. */
const entrouNaFila = r => r.status === "Em produção" && r.de !== "Em produção";

/* Depois de uma ação dar certo: Agenda e avisos, sem segurar a resposta da tela. */
const DEPOIS = {
  criarPedido: (env, db, dados, r) => [
    efeitos.sincronizarAgenda(env, db, r.id), efeitos.avisarLojaNovoPedido(env, db, r.id), efeitos.telegramNovoPedido(env, db, r.id)
  ],
  editarPedido: (env, db, dados, r) => r.mudou ? [efeitos.sincronizarAgenda(env, db, dados.pedidoId)] : [],
  salvarProduto: (env, db) => [produtos.publicarCatalogo(db)],
  apagarProduto: (env, db) => [produtos.publicarCatalogo(db)],
  salvarRecheios: (env, db) => [produtos.publicarCatalogo(db)],
  trocarFotoProduto: (env, db) => [produtos.publicarCatalogo(db)],
  apagarPagamento: (env, db, dados, r) => r.pedidoId && r.pagamento ? [efeitos.sincronizarAgenda(env, db, r.pedidoId)] : [],
  mudarStatus: (env, db, dados, r, por) => !r.mudou ? [] : [
    efeitos.sincronizarAgenda(env, db, dados.pedidoId),
    ...(r.status === "Pronto" ? [efeitos.avisarClientePronto(env, db, dados.pedidoId)] : []),
    ...(r.status === "Em produção" ? [alexa.avisarNovoNaFila(env, db, dados.pedidoId)] : []),
    ...(r.status === "Confirmado — Esperando pagamento" ? [
      efeitos.telegramConfirmado(env, db, dados.pedidoId),
      lembretes.avisarConfirmado({ env, db, pedidoId: dados.pedidoId, gerarCobranca: gerarEntrada(env, db, por) })
    ] : [])
  ],
  lembrarEntrada: (env, db, dados, r, por) => [lembretes.enviarLembretes({ env, db, lista: r.lista, por, gerarCobranca: gerarEntrada(env, db, por) })],
  registrarPagamentoManual: (env, db, dados, r, por) => r.duplicado ? [] : [
    efeitos.sincronizarAgenda(env, db, dados.pedidoId), efeitos.avisarClientePagamento(env, db, dados.pedidoId, dados.valor),
    efeitos.telegramPagamento(env, db, dados.pedidoId, dados.valor, dados.meio, por),
    ...(entrouNaFila(r) ? [alexa.avisarNovoNaFila(env, db, dados.pedidoId)] : [])
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
  depois(ctx, (DEPOIS[acao]?.(env, db, dados, r, quem) || []), acao, dados.pedidoId || r?.id);
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
    /* Frete antes do anti-robô: a revisão do pedido pede a taxa sem desafio; o limite por IP segura abuso. */
    if (rota === "frete") return json(await estimarFrete(env, dados.local), 200, cors);
    if (!(await site.turnstileOk(env, dados.turnstile, ip))) throw new ErroDominio("permission-denied", "Confirme que você não é um robô");
    const db = banco(env);
    if (rota === "consultar") return json(await site.consultarDoSite(db, dados), 200, cors);
    /* Pedido só com login Google: o e-mail e o nome da conta vão no pedido (e preenchidos no
       checkout), e o pedido fica ligado à conta. */
    const bearer = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const claims = bearer ? await verificarToken(bearer, env.FIREBASE_PROJECT_ID).catch(() => null) : null;
    if (!claims || claims.firebase?.sign_in_provider !== "google.com" || !claims.email || claims.email_verified !== true) {
      throw new ErroDominio("unauthenticated", "Entre com sua conta Google para mandar o pedido");
    }
    dados.cliente = { ...(dados.cliente || {}), email: claims.email, nome: String(dados.cliente?.nome || claims.name || "").trim() };
    dados.clienteUid = claims.sub;
    const r = await site.pedidoDoSite(db, dados, { frete: local => estimarFrete(env, local) });
    depois(ctx, [...DEPOIS.criarPedido(env, db, dados, r), efeitos.avisarClienteRecebido(env, db, r.id)], "pedidoDoSite", r.id);
    return json({ id: r.id, total: r.total }, 200, cors);
  } catch (e) {
    if (e instanceof ErroDominio) return json({ erro: e.message, codigo: e.codigo }, STATUS_HTTP[e.codigo] || 400, cors);
    console.error(JSON.stringify({ msg: "erro no site", rota, erro: String(e), chamada: e.chamada }));
    return json({ erro: "Não deu certo. Tente de novo.", codigo: "internal" }, 500, cors);
  }
}

/* Sofia (agente do GPTMaker no WhatsApp da loja): /sofia/<pedido|consultar|pagar>/<SOFIA_TOKEN>.
   Aceita parâmetros na URL e/ou JSON no corpo. Responde sempre 200 com { ok, ... } ou { ok: false,
   erro }: o GPTMaker lê a resposta e explica ao cliente. */
async function rotaDaSofia(request, env, ctx, rota, token) {
  if (!env.SOFIA_TOKEN || token !== env.SOFIA_TOKEN) return new Response(null, { status: 404 });
  const url = new URL(request.url);
  // Parâmetros na URL e/ou JSON no corpo (o do corpo vale mais).
  const corpo = request.method === "POST" ? await request.json().catch(() => ({})) : {};
  const dados = { ...Object.fromEntries(url.searchParams), ...(corpo && typeof corpo === "object" ? corpo : {}) };
  const db = banco(env);
  try {
    if (rota === "consultar") return json({ ok: true, ...(await sofia.pedidosDoCliente(db, dados.telefone)) });
    if (rota === "pagar") {
      const pedidoId = await sofia.conferirParaPagar(db, dados);
      const tipo = dados.tipo === "entrada" ? "entrada" : "restante";
      const r = await ACOES.gerarCobranca(db, { pedidoId, tipo }, "sofia", env, ORIGEM_API);
      return json({ ok: true, pedido: pedidoId, link: r.url, valor: sofia.reais(r.valor) });
    }
    const r = await sofia.pedidoDaSofia(db, dados, { frete: local => estimarFrete(env, local) });
    depois(ctx, [...DEPOIS.criarPedido(env, db, dados, r), efeitos.avisarClienteRecebido(env, db, r.id)], "pedidoDaSofia", r.id);
    return json({ ok: true, pedido: r.id, total: sofia.reais(r.total), proximo: "A equipe confere e confirma pelo WhatsApp, com o link de pagamento." });
  } catch (e) {
    if (e instanceof ErroDominio) return json({ ok: false, erro: e.message });
    console.error(JSON.stringify({ msg: "erro na rota da Sofia", rota, erro: String(e) }));
    return json({ ok: false, erro: "O sistema não respondeu agora. Passe para a equipe." });
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
    if (!r.duplicado) depois(ctx, [efeitos.sincronizarAgenda(env, db, order_nsu), efeitos.avisarClientePagamento(env, db, order_nsu, conf.valor),
      efeitos.telegramPagamento(env, db, order_nsu, conf.valor, conf.meio, "infinitepay"),
      ...(entrouNaFila(r) ? [alexa.avisarNovoNaFila(env, db, order_nsu)] : [])], "webhook", order_nsu);
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

/* Ações confirmadas na assistente passam pelas mesmas ACOES e DEPOIS das telas. Apagar um
   pagamento não pede a senha da conta sistema: ali quem garante é o "sim" de um número autorizado. */
const ACOES_DA_IA = {
  ...ACOES,
  apagarPagamento: (db, { pagamentoId }, por) => pedidos.apagarPagamento(db, { pagamentoId }, por),
  anexarArquivosBoleto: (db, dados, por) => financeiro.anexarArquivosBoleto(db, dados, por)
};
function executorDaIA(env, ctx, db) {
  return async (acao, dados, por) => {
    if (!Object.hasOwn(ACOES_DA_IA, acao)) throw new ErroDominio("invalid-argument", `Ação desconhecida: ${acao}`);
    const r = await ACOES_DA_IA[acao](db, dados, por, env, ORIGEM_API);
    depois(ctx, DEPOIS[acao]?.(env, db, dados, r, por) || [], acao, dados.pedidoId || r?.id);
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
   para a assistente; todo o resto segue igual para EVOLUTION_REPASSE (quem recebia antes), a não ser que
   EVOLUTION_REPASSE_DESLIGADO seja "1" (08/10: clientes passaram a ser atendidos pela Sofia, do GPTMaker). */
async function webhookEvolution(request, env, ctx, token) {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  if (!env.EVOLUTION_WEBHOOK_TOKEN || token !== env.EVOLUTION_WEBHOOK_TOKEN) return new Response(null, { status: 404 });

  const corpo = await request.text();
  let dados;
  try { dados = JSON.parse(corpo); } catch { return new Response(null, { status: 400 }); }

  const msg = mensagemEvolution(dados);
  // Com a Meta ligada a assistente mora só no número dela; o da loja volta a repassar tudo.
  const daIA = !!(msg && iaPronta(env) && !metaLigado(env) && autorizado(env, msg.de));
  if (daIA) {
    ctx.waitUntil(conversaDaIA(env, ctx, banco(env), msg, canalEvolution(env)));
  } else if (env.EVOLUTION_REPASSE && env.EVOLUTION_REPASSE_DESLIGADO !== "1") {
    ctx.waitUntil(fetch(env.EVOLUTION_REPASSE, { method: "POST", headers: { "Content-Type": "application/json" }, body: corpo })
      .then(r => { if (!r.ok) console.error(JSON.stringify({ msg: "repasse da Evolution recusado", status: r.status, evento: dados?.event })); })
      .catch(e => console.error(JSON.stringify({ msg: "repasse da Evolution falhou", erro: String(e) }))));
  }
  return new Response("ok");
}

/* Grupo da equipe no Telegram: toque em "Confirmar estoque" (tópico Pendentes), botões da
   assistente e mensagens do tópico IA. Responde 200 na hora; o trabalho segue em waitUntil. */
const ESPERANDO_ESTOQUE = ["Aguardando confirmação", "Verificando Estoque"];

async function confirmarEstoquePeloTelegram(env, ctx, db, toque, pedidoId, origem) {
  const quem = telegram.quemE(toque.de);
  const p = await efeitos.lerPedido(db, pedidoId);
  if (!p) return telegram.responderToque(env, toque.id, `Pedido ${pedidoId} não existe`);
  if (!ESPERANDO_ESTOQUE.includes(p.status)) {
    await telegram.responderToque(env, toque.id, `${pedidoId} já está em "${p.status}"`);
    return telegram.fecharMensagem(env, toque.mensagem, `ℹ️ Já estava em "${p.status}".`);
  }
  const por = `telegram:${quem}`;
  const dados = { pedidoId, status: "Confirmado — Esperando pagamento" };
  const r = await ACOES.mudarStatus(db, dados, por, env);
  depois(ctx, DEPOIS.mudarStatus(env, db, dados, r, por), "mudarStatus", pedidoId);
  await telegram.responderToque(env, toque.id, "Estoque confirmado");
  // O mesmo que o admin faz: já deixa o link da entrada pronto para mandar ao cliente.
  const link = await ACOES.gerarCobranca(db, { pedidoId, tipo: "entrada" }, por, env, origem)
    .then(c => `\nLink da entrada (${efeitos.brl(c.valor)}): ${c.url}`)
    .catch(e => { console.error(JSON.stringify({ msg: "cobrança pelo Telegram falhou", pedidoId, erro: String(e) })); return "\nO link da entrada não saiu: gere no admin."; });
  return telegram.fecharMensagem(env, toque.mensagem, `✅ Estoque confirmado por ${quem}.${link}`);
}

async function webhookTelegram(request, env, ctx, url) {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  if (!telegram.telegramLigado(env) || !env.TELEGRAM_WEBHOOK_TOKEN
    || request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.TELEGRAM_WEBHOOK_TOKEN) return new Response(null, { status: 404 });
  const u = telegram.lerUpdate(env, await request.json().catch(() => null));
  if (!u) return new Response("ok");

  const db = banco(env);
  const falhou = e => console.error(JSON.stringify({ msg: "Telegram falhou", erro: String(e) }));
  if (u.tipo === "toque") {
    const [tipo, ...resto] = u.dados.split(":");
    if (tipo === "estoque") {
      ctx.waitUntil(confirmarEstoquePeloTelegram(env, ctx, db, u, resto.join(":"), url.origin)
        .catch(e => { falhou(e); return telegram.responderToque(env, u.id, e instanceof ErroDominio ? e.message : "Deu erro. Tente pelo admin."); }));
    } else if (tipo === "ia" && iaNoTelegram(env)) {
      telegram.responderToque(env, u.id);
      const msg = { id: `tgq-${u.id}`, de: "telegram", uid: u.de?.id, botao: resto.join(":") };
      ctx.waitUntil(conversaDaIA(env, ctx, db, msg, telegram.canalTelegram(env)));
    } else {
      ctx.waitUntil(telegram.responderToque(env, u.id));
    }
  } else if (u.tipo === "ia" && iaNoTelegram(env)) {
    ctx.waitUntil(conversaDaIA(env, ctx, db, u.msg, telegram.canalTelegram(env)));
  }
  return new Response("ok");
}

/* Skill da Alexa na cozinha. A Amazon espera a resposta na hora (até 8 s), então aqui não há waitUntil. */
async function webhookAlexa(request, env, ctx) {
  if (!alexa.alexaLigada(env)) return new Response(null, { status: 404 });
  if (request.method !== "POST") return new Response(null, { status: 405 });
  const corpo = await request.text();
  let dados;
  try { dados = JSON.parse(corpo); } catch { return new Response(null, { status: 400 }); }
  const valida = await alexa.requisicaoValida({
    corpo, dados, env,
    urlCert: request.headers.get("SignatureCertChainUrl"),
    assinatura: request.headers.get("Signature-256")
  });
  if (!valida) return new Response(null, { status: 400 });

  const db = banco(env);
  const por = "alexa";
  const marcarFeito = async pedidoId => {
    const r = await ACOES.marcarFeito(db, { pedidoId }, por, env);
    depois(ctx, DEPOIS.marcarFeito?.(env, db, { pedidoId }, r, por) || [], "marcarFeito", pedidoId);
    return r;
  };
  try {
    return json(await alexa.responder(dados, { db, marcarFeito }));
  } catch (e) {
    console.error(JSON.stringify({ msg: "Alexa falhou", erro: String(e) }));
    return json({ version: "1.0", response: { outputSpeech: { type: "PlainText", text: "Não consegui ver a fila agora. Tente de novo." }, shouldEndSession: true } });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const pag = url.pathname.match(/^\/pagar\/([\w-]+)$/) || (url.pathname === "/pagar" && [null, url.searchParams.get("rowId")]);
    if (pag && pag[1] && request.method === "GET") {
      return pagar(pag[1], env).catch(e => {
        console.error(JSON.stringify({ msg: "link curto falhou", pedidoId: pag[1], erro: String(e) }));
        return new Response("Não deu pra abrir o pagamento agora. Tente de novo em instantes.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
      });
    }
    if (url.pathname === "/webhook/telegram") return webhookTelegram(request, env, ctx, url);
    if (url.pathname === "/webhook/whatsapp") return webhookWhatsapp(request, env, ctx, url);
    if (url.pathname === "/webhook/alexa") return webhookAlexa(request, env, ctx);
    const sof = url.pathname.match(/^\/sofia\/(pedido|consultar|pagar)\/([\w-]+)$/);
    if (sof) return rotaDaSofia(request, env, ctx, sof[1], sof[2]);
    const evo = url.pathname.match(/^\/webhook\/evolution\/([\w-]+)$/);
    if (evo) return webhookEvolution(request, env, ctx, evo[1]);

    if (url.pathname === "/webhook/infinitepay") {
      if (request.method !== "POST") return new Response(null, { status: 405 });
      return webhookInfinitepay(request, env, ctx);
    }

    const cors = corsDe(request, env);
    const rotaSite = url.pathname.match(/^\/site\/(pedido|consultar|frete)$/)?.[1];
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

  /* Três crons (wrangler.jsonc): 06:00 UTC = backup; 12:00 UTC (9h de Brasília) = lembrete
     automático da entrada, para quem tem pedido em até 3 dias; de 15 em 15 min = a Alexa da
     cozinha lembra dos pedidos da próxima hora. */
  async scheduled(evento, env, ctx) {
    const db = banco(env);
    if (evento.cron === CRON_COZINHA) {
      ctx.waitUntil(alexa.lembrarProximos(env, db).catch(e => console.error(JSON.stringify({ msg: "lembrete da cozinha falhou", erro: String(e) }))));
      return;
    }
    if (evento.cron === CRON_LEMBRETE) {
      ctx.waitUntil(produtos.publicarCatalogo(db).catch(e => console.error(JSON.stringify({ msg: "catálogo do site falhou", erro: String(e) }))));
      if (!whatsappLigado(env)) return;
      ctx.waitUntil(lembretes.paraLembrar(db, { automatico: true })
        .then(lista => lembretes.enviarLembretes({ env, db, lista, automatico: true, por: "lembrete-automatico", gerarCobranca: gerarEntrada(env, db, "lembrete-automatico") }))
        .catch(e => console.error(JSON.stringify({ msg: "lembrete automático falhou", erro: String(e) }))));
      return;
    }
    ctx.waitUntil(efeitos.backup(env, db).catch(e => console.error(JSON.stringify({ msg: "backup falhou", erro: String(e) }))));
  }
};
