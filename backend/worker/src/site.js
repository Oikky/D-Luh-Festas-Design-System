/* Rotas públicas do site dos clientes (sem login):
     POST /site/pedido     cria o pedido — preço, nome e mínimo vêm do catálogo (sis_produtos), nunca do navegador
     POST /site/consultar  "Acompanhar pedido": nº do pedido + telefone de quem pediu
     POST /site/frete      taxa de entrega para um endereço, pela estimativa da Moblets (frete.js)
   Quem protege: limite por IP (binding LIMITE_SITE no wrangler.jsonc) e, se TURNSTILE_SECRET existir,
   o desafio do Turnstile. O pedido nasce "Aguardando confirmação", como os do admin. */
import { ErroDominio } from "./dominio.js";
import { criarPedido, PEDIDOS } from "./pedidos.js";
import { PRODUTOS, RECHEIOS } from "./produtos.js";

const MAX_ITENS = 60;
const texto = (v, max) => String(v ?? "").trim().slice(0, max);

/* Hoje em Brasília, AAAA-MM-DD. */
function hojeBrasilia(agora = new Date()) {
  return new Date(agora.getTime() - 3 * 3600e3).toISOString().slice(0, 10);
}

/* frete: (local) => { disponivel, taxa } — a taxa é refeita aqui, nunca vem do navegador. Sem
   estimativa (Moblets fora do ar, sem chave), a taxa fica 0 e a loja combina na confirmação. */
async function pedidoDoSite(db, dados, { agora = new Date(), frete = null, origem = "site" } = {}) {
  const itensEntrada = Array.isArray(dados?.itens) ? dados.itens : [];
  if (!itensEntrada.length) throw new ErroDominio("invalid-argument", "O pedido precisa de pelo menos um item");
  if (itensEntrada.length > MAX_ITENS) throw new ErroDominio("invalid-argument", "Itens demais num pedido só");

  const data = String(dados?.entrega?.data || "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(data) && data < hojeBrasilia(agora)) {
    throw new ErroDominio("invalid-argument", "Escolha um dia a partir de hoje");
  }
  // Horário de atendimento: 8h às 19h, de 15 em 15 minutos; para hoje, com 1 hora de antecedência.
  const hora = String(dados?.entrega?.hora || "");
  const m = /^(\d{2}):(\d{2})$/.exec(hora);
  const min = m ? Number(m[1]) * 60 + Number(m[2]) : -1;
  if (min < 8 * 60 || min > 19 * 60 || min % 15) throw new ErroDominio("invalid-argument", "Escolha um horário entre 8h e 19h");
  const sp = new Date(agora.getTime() - 3 * 3600e3);
  if (data === hojeBrasilia(agora) && min < sp.getUTCHours() * 60 + sp.getUTCMinutes() + 60) {
    throw new ErroDominio("invalid-argument", "Para hoje, escolha um horário com pelo menos 1 hora de antecedência");
  }

  // Catálogo: só produtos que existem e estão ativos; o preço é o de lá.
  const ids = [...new Set(itensEntrada.map(it => String(it?.produtoId || "")))];
  if (ids.some(id => !id)) throw new ErroDominio("invalid-argument", "Item sem produto");
  const catalogo = new Map();
  await Promise.all(ids.map(async id => {
    const snap = await db.collection(PRODUTOS).doc(id).get();
    if (!snap.exists || snap.get("ativo") === false) throw new ErroDominio("failed-precondition", "Um item do seu pedido saiu do cardápio. Atualize a página.");
    catalogo.set(id, snap.data());
  }));
  const recheiosSnap = await db.doc(RECHEIOS).get();
  const recheiosValidos = new Set((recheiosSnap.exists ? recheiosSnap.get("lista") || [] : []).map(r => r.toLowerCase()));

  const somaPorProduto = new Map();
  const itens = itensEntrada.map((it, i) => {
    const p = catalogo.get(String(it.produtoId));
    const qtd = Number(it.qtd);
    if (!Number.isInteger(qtd) || qtd < 1 || qtd > 100000) throw new ErroDominio("invalid-argument", `Item ${i + 1}: quantidade inválida`);
    somaPorProduto.set(it.produtoId, (somaPorProduto.get(it.produtoId) || 0) + qtd);
    // Recheios (bolos) ou tipos (pacotes): só o que existe no catálogo, até 3.
    const tipos = new Set((p.tiposPacote || []).map(t => t.toLowerCase()));
    const escolhas = Array.isArray(it.recheios) ? it.recheios.map(r => texto(r, 80)).filter(Boolean) : [];
    if (escolhas.length > 3) throw new ErroDominio("invalid-argument", `Item ${i + 1}: escolhas demais`);
    const validas = escolhas.filter(r => recheiosValidos.has(r.toLowerCase()) || tipos.size > 0);
    const tema = texto(it?.topo?.tema, 200);
    return {
      nome: String(p.nome).replace(/^[^\p{L}\p{N}]+/u, "").trim(),
      qtd, valorUnit: p.valorUnit, produtoId: String(it.produtoId), categoria: p.categoria,
      ...(validas.length ? { recheios: validas } : {}),
      ...(tema ? { topo: { tema } } : {})
    };
  });
  for (const [id, soma] of somaPorProduto) {
    const p = catalogo.get(String(id));
    if (soma < (p.qtdMin || 1)) throw new ErroDominio("invalid-argument", `${p.nome}: o mínimo é ${p.qtdMin}`);
  }

  /* Só a entrada (50%) vale para pedido acima de R$ 100 ou para daqui a mais de 1 dia; fora disso
     o pagamento é do total. A escolha do cliente só vale quando a regra deixa. */
  const totalItens = itens.reduce((s, it) => s + it.qtd * it.valorUnit, 0);
  const depoisDeAmanha = new Date(agora.getTime() - 3 * 3600e3 + 2 * 864e5).toISOString().slice(0, 10);
  const podeEntrada = totalItens > 10000 || data >= depoisDeAmanha;
  const entradaPct = podeEntrada && dados?.entradaPct !== 100 ? 50 : 100;

  const modo = dados?.entrega?.modo;
  const estimativa = modo === "entrega" && frete ? await frete(dados?.entrega?.local) : null;
  return criarPedido(db, {
    entradaPct,
    cliente: { nome: texto(dados?.cliente?.nome, 80), telefone: texto(dados?.cliente?.telefone, 20), email: texto(dados?.cliente?.email, 120) },
    ...(dados?.clienteUid ? { clienteUid: String(dados.clienteUid) } : {}),
    entrega: {
      modo, data, hora: texto(dados?.entrega?.hora, 5),
      ...(modo === "entrega" ? { endereco: texto(dados?.entrega?.endereco, 300) } : {})
    },
    itens,
    taxaEntrega: estimativa?.disponivel ? estimativa.taxa : 0,
    obs: texto(dados?.obs, 1000),
    origem
  }, origem);
}

/* Mesmas regras do site: DDD + 8 dígitos finais (o 9 extra e o 55 não importam). */
function telIguais(a, b) {
  const limpa = s => String(s || "").replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  const x = limpa(a), y = limpa(b);
  if (x.length < 10 || y.length < 10) return false;
  return x.slice(0, 2) === y.slice(0, 2) && x.slice(-8) === y.slice(-8);
}

/* Pedido pelo nº + telefone de quem pediu; nº ou telefone errados dão o mesmo `null`. */
async function pedidoDoCliente(db, { numero, telefone }) {
  const n = String(numero || "").toUpperCase().replace(/[^\d]/g, "");
  if (!n) return null;
  const snap = await db.collection(PEDIDOS).doc(`PED-${Number(n)}`).get();
  if (!snap.exists || !telIguais(snap.get("cliente")?.telefone, telefone)) return null;
  return snap.data();
}

/* Entregador da RYD como o cliente vê: andamento, e nome e foto depois que alguém aceitou.
   Entrega cancelada some (a equipe pode chamar outro entregador). */
function entregadorParaCliente(p) {
  const r = p.ryd;
  if (!r?.deliveryId || !r.status || r.status === "canceled") return null;
  const aceito = !["pending", "scheduled"].includes(r.status);
  return {
    status: r.status,
    ...(aceito && r.entregador?.nome ? { nome: String(r.entregador.nome).split(/\s+/)[0], foto: r.entregador.foto || null } : {})
  };
}

/* Devolve só o que o cliente precisa ver; nº ou telefone errados dão a mesma resposta. */
async function consultarDoSite(db, dados) {
  const p = await pedidoDoCliente(db, dados);
  if (!p) return { erro: "nao-encontrado" };
  const entregador = entregadorParaCliente(p);
  return {
    pedido: {
      id: p.id, status: p.status, pagamento: p.pagamento, pago: p.pago || 0, total: p.total,
      entradaPct: p.entradaPct || 50, taxaEntrega: p.taxaEntrega || 0,
      cliente: { nome: p.cliente?.nome || "" },
      entrega: p.entrega,
      ...(entregador ? { entregador } : {}),
      itens: (p.itens || []).map(it => ({
        nome: it.nome, qtd: it.qtd, valorUnit: it.valorUnit,
        ...(it.recheios ? { recheios: it.recheios } : {}),
        ...(it.topo ? { topo: typeof it.topo === "string" ? it.topo : it.topo.tema } : {})
      }))
    }
  };
}

/* "Acompanhar pedido" com a tela aberta: a cada 30 s pergunta só pelo pedido e pelo entregador,
   sem o anti-robô (o limite por IP segura abuso e a resposta não tem endereço nem itens). */
async function entregaDoSite(db, dados) {
  const p = await pedidoDoCliente(db, dados);
  if (!p) return { erro: "nao-encontrado" };
  return { status: p.status, entregador: entregadorParaCliente(p) };
}

async function turnstileOk(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return true;
  if (!token) return false;
  const corpo = new FormData();
  corpo.append("secret", env.TURNSTILE_SECRET);
  corpo.append("response", token);
  if (ip) corpo.append("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: corpo });
  return !!(await r.json().catch(() => ({}))).success;
}

/* Limite por IP: 8 chamadas por minuto em cada rota (o binding é opcional nos testes). */
async function dentroDoLimite(env, rota, ip) {
  if (!env.LIMITE_SITE) return true;
  const { success } = await env.LIMITE_SITE.limit({ key: `${rota}:${ip || "?"}` });
  return success;
}

export { pedidoDoSite, consultarDoSite, entregaDoSite, telIguais, hojeBrasilia, turnstileOk, dentroDoLimite };
