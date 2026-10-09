/* Entregas pela RYD (api.ryd.com.br, manual em https://api-doc.ryd.com.br/docs/api).
   Fluxo: /api/preview cota (não cobra nada) → /api/request confirma e DEBITA o saldo pré-pago da
   conta → a RYD avisa cada mudança no webhook (/webhook/ryd/<RYD_WEBHOOK_TOKEN>).
   Segredos (`npx wrangler secret put <NOME>`):
     RYD_ACCESS_KEY     chave da conta, fornecida pela RYD (vai no corpo JSON, não em header)
     LOJA_ENDERECO      de onde sai a entrega: "Rua X, 123|Bairro|Montes Claros|MG"
     RYD_FARE_ID        tipo de veículo (MOTO, CARRO…) do /api/fares; sem ele a RYD usa o primeiro
                        da conta em ordem alfabética, que muda quando ela cria tarifa nova
     RYD_WEBHOOK_TOKEN  parte secreta da URL do webhook cadastrada na RYD
     RYD_TAXA_SITE      "1" liga a taxa da RYD no site e na Sofia (frete.js); sem ele, só o admin usa
   A API responde 200 até no erro: o que vale é `erro` (ou `error`, no /api/info) no corpo. */
import { ErroDominio } from "./dominio.js";
import { PEDIDOS } from "./pedidos.js";

const BASE = "https://api.ryd.com.br/api";
/* Estados da RYD e como aparecem para a equipe. */
const STATUS = {
  pending: "Procurando entregador", scheduled: "Agendada", accepted: "Entregador a caminho da loja",
  withdraw: "Entregador na loja", delivering: "Saiu para entrega", finished: "Entregue", canceled: "Cancelada"
};
const ENCERRADOS = ["finished", "canceled"];

const rydLigada = env => !!(env.RYD_ACCESS_KEY && env.LOJA_ENDERECO);

/* "Rua X, 123|Bairro|Cidade|UF" vira "Rua X, 123 - Bairro, Cidade - UF", como a RYD geocodifica. */
function origem(env) {
  const [rua, bairro, cidade, uf] = String(env.LOJA_ENDERECO || "").split("|").map(s => s.trim());
  return `${rua}${bairro ? ` - ${bairro}` : ""}, ${cidade || "Montes Claros"} - ${uf || "MG"}`;
}

/* Uma chamada à RYD: devolve o corpo, ou lança ErroDominio com a mensagem dela. */
async function chamar(env, rota, corpo, { fetchFn = fetch } = {}) {
  const r = await fetchFn(`${BASE}/${rota}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "access-key": env.RYD_ACCESS_KEY, ...corpo }),
    signal: AbortSignal.timeout(10000)
  });
  const j = await r.json().catch(() => ({}));
  const erro = j.erro || j.error;
  // /api/fares e /api/options não trazem `success`: falha é `erro`/`error` ou status HTTP de erro.
  if (erro || !r.ok) {
    console.error(JSON.stringify({ msg: "RYD recusou", rota, status: r.status, erro }));
    throw new ErroDominio("failed-precondition", `RYD: ${erro || `não respondeu (${r.status})`}`);
  }
  return j;
}

/* Cotação de origem (a loja) até `para`. `extras` vai junto (número do pedido, cliente…). */
async function cotar(env, para, extras = {}, opcoes) {
  const j = await chamar(env, "preview", {
    from: origem(env), to: para,
    ...(env.RYD_FARE_ID ? { fare_id: Number(env.RYD_FARE_ID) } : {}),
    ...extras
  }, opcoes);
  if (!j["preview-id"]) throw new ErroDominio("failed-precondition", "RYD não devolveu a cotação");
  return {
    previewId: String(j["preview-id"]),
    valor: Math.round(Number(j.amount) * 100), // centavos
    metros: Number(j.distance) || null,
    segundos: Number(j.duration) || null,
    enderecos: Array.isArray(j.addresses) ? j.addresses : []
  };
}

async function lerPedidoDeEntrega(db, pedidoId) {
  const snap = await db.collection(PEDIDOS).doc(String(pedidoId || "")).get();
  if (!snap.exists) throw new ErroDominio("not-found", `Pedido ${pedidoId} não existe`);
  const p = snap.data();
  if (p.entrega?.modo !== "entrega" || !String(p.entrega?.endereco || "").trim()) {
    throw new ErroDominio("failed-precondition", "Esse pedido é para retirar na loja");
  }
  if (p.status === "Cancelado") throw new ErroDominio("failed-precondition", "Pedido cancelado");
  return { snap, p };
}

const exigirLigada = env => {
  if (!rydLigada(env)) throw new ErroDominio("failed-precondition", "A RYD ainda não foi configurada (falta a chave)");
};
const emAndamento = p => p.ryd?.deliveryId && !ENCERRADOS.includes(p.ryd.status);

/* Admin, passo 1: quanto custa chamar o entregador agora (nada é cobrado). */
async function cotarEntrega(db, env, { pedidoId }, opcoes) {
  exigirLigada(env);
  const { snap, p } = await lerPedidoDeEntrega(db, pedidoId);
  if (emAndamento(p)) throw new ErroDominio("failed-precondition", `Já tem entregador chamado (${STATUS[p.ryd.status] || p.ryd.status})`);
  const c = await cotar(env, p.entrega.endereco, {
    extra_numeroPedido: snap.id,
    extra_ClientNameTo: String(p.cliente?.nome || "").slice(0, 80),
    ...(p.cliente?.telefone ? { extra_Observations: `Tel. cliente: ${p.cliente.telefone}` } : {})
  }, opcoes);
  return { pedidoId: snap.id, ...c };
}

/* Admin, passo 2: confirma a cotação. Aqui a RYD debita o saldo e começa a chamar entregadores. */
async function confirmarEntrega(db, env, { pedidoId, previewId, valor }, por, opcoes) {
  exigirLigada(env);
  if (!previewId) throw new ErroDominio("invalid-argument", "Falta a cotação");
  const { snap, p } = await lerPedidoDeEntrega(db, pedidoId);
  if (emAndamento(p)) throw new ErroDominio("failed-precondition", `Já tem entregador chamado (${STATUS[p.ryd.status] || p.ryd.status})`);
  const j = await chamar(env, "request", { "preview-id": String(previewId) }, opcoes);
  if (!j["delivery-id"]) throw new ErroDominio("failed-precondition", "RYD não devolveu o número da entrega");
  const deliveryId = String(j["delivery-id"]);
  // O valor da cotação que a equipe viu, só para mostrar no pedido; quem cobra é a RYD.
  const custo = Math.round(Number(valor)) || 0;
  const ryd = { deliveryId, previewId: String(previewId), status: "pending", entregador: null, chamadoPor: por, em: new Date(), ...(custo > 0 ? { valor: custo } : {}) };
  await snap.ref.set({ ryd }, { merge: true });
  await snap.ref.collection("eventos").add({ tipo: "ryd", acao: "chamado", deliveryId, por, em: new Date() });
  return { deliveryId, status: "pending" };
}

/* Admin: cancela enquanto o entregador ainda não chegou na loja (a RYD recusa depois disso). */
async function cancelarEntrega(db, env, { pedidoId }, por, opcoes) {
  exigirLigada(env);
  const snap = await db.collection(PEDIDOS).doc(String(pedidoId || "")).get();
  if (!snap.exists) throw new ErroDominio("not-found", `Pedido ${pedidoId} não existe`);
  const ryd = snap.get("ryd");
  if (!ryd?.deliveryId || ENCERRADOS.includes(ryd.status)) throw new ErroDominio("failed-precondition", "Não há entregador chamado para esse pedido");
  await chamar(env, "cancel", { "delivery-id": ryd.deliveryId }, opcoes);
  await snap.ref.set({ ryd: { ...ryd, status: "canceled" } }, { merge: true });
  await snap.ref.collection("eventos").add({ tipo: "ryd", acao: "cancelado", deliveryId: ryd.deliveryId, por, em: new Date() });
  return { cancelado: true };
}

/* Webhook: grava o status e o entregador no pedido. O mesmo evento pode chegar de novo (reenvio):
   gravar o mesmo estado duas vezes não muda nada. Evento de simulação (/api/webhook/simulate) só
   é registrado no log. */
async function eventoDaRyd(db, ev, { simulacao = false } = {}) {
  const deliveryId = String(ev?.["delivery-id"] || "");
  const status = String(ev?.status || "");
  if (!deliveryId || !STATUS[status]) return { ignorado: "sem entrega ou status" };
  if (simulacao) {
    console.log(JSON.stringify({ msg: "RYD simulação", deliveryId, status }));
    return { simulacao: true };
  }
  const [achado] = await db.collection(PEDIDOS).consultar([["ryd.deliveryId", "==", deliveryId]], { limite: 1 });
  if (!achado) return { ignorado: "entrega de fora do sistema" };
  const ref = db.collection(PEDIDOS).doc(achado.id);
  const nome = String(ev["driver-name"] || "").trim();
  const ryd = {
    ...achado.ryd, status,
    entregador: nome ? { nome, foto: String(ev["driver-image"] || "") || null } : achado.ryd?.entregador || null,
    ...(ev["date-final"] ? { concluidaEm: String(ev["date-final"]), final: String(ev["status-final"] || "") } : {}),
    atualizadoEm: new Date()
  };
  await ref.set({ ryd }, { merge: true });
  if (status !== achado.ryd?.status) {
    await ref.collection("eventos").add({ tipo: "ryd", acao: status, deliveryId, eventoId: String(ev["event-id"] || ""), em: new Date() });
  }
  return { pedidoId: achado.id, status, mudou: status !== achado.ryd?.status };
}

/* Sincronização (cron de 15 min): consulta na RYD (/api/info) as entregas ainda abertas no sistema e
   grava o que mudou, como o webhook faria. Cobre evento perdido, já que sem "entrega garantida" a RYD
   tenta o webhook uma vez só. Uma consulta por entrega a cada 15 min fica bem acima do mínimo de 30 s. */
async function sincronizarEntregas(db, env, opcoes) {
  if (!rydLigada(env)) return { conferidas: 0, mudaram: 0 };
  const abertos = Object.keys(STATUS).filter(s => !ENCERRADOS.includes(s));
  const listas = await Promise.all(abertos.map(s => db.collection(PEDIDOS).consultar([["ryd.status", "==", s]])));
  const pedidos = listas.flat().filter(p => p.ryd?.deliveryId);
  let mudaram = 0;
  for (const p of pedidos) {
    try {
      const info = await chamar(env, "info", { "delivery-id": p.ryd.deliveryId }, opcoes);
      const r = await eventoDaRyd(db, { ...info, "delivery-id": p.ryd.deliveryId });
      if (r.mudou) {
        mudaram++;
        console.log(JSON.stringify({ msg: "RYD sincronizada", pedidoId: p.id, de: p.ryd.status, para: r.status }));
      }
    } catch (e) {
      console.error(JSON.stringify({ msg: "sincronizar RYD falhou", pedidoId: p.id, deliveryId: p.ryd.deliveryId, erro: String(e.message || e) }));
    }
  }
  return { conferidas: pedidos.length, mudaram };
}

/* Configuração (rota /ryd/config/<RYD_WEBHOOK_TOKEN>): tipos de veículo, recursos liberados e a URL de
   webhook da chave. Com `registrar`, cadastra `urlWebhook`; com `simular`, a RYD manda para ela a
   sequência de eventos de uma entrega de mentira (sem cobrar nada). */
async function configuracao(env, { registrar = false, simular = false, urlWebhook }, opcoes) {
  if (!env.RYD_ACCESS_KEY) throw new ErroDominio("failed-precondition", "Falta RYD_ACCESS_KEY");
  const [fares, options] = await Promise.all([chamar(env, "fares", {}, opcoes), chamar(env, "options", {}, opcoes)]);
  const r = {
    tarifas: fares.fares || [],
    recursos: Object.fromEntries(Object.entries(options.options?.[0] || {}).map(([k, v]) => [k.trim(), v === "true"])),
    tarifaEmUso: env.RYD_FARE_ID ? Number(env.RYD_FARE_ID) : null,
    lojaConfigurada: !!env.LOJA_ENDERECO
  };
  if (registrar) r.registro = await chamar(env, "webhook/set", { url: urlWebhook }, opcoes).catch(e => ({ erro: e.message }));
  r.webhook = await chamar(env, "webhook", {}, opcoes).catch(e => ({ erro: e.message }));
  if (simular) r.simulacao = await chamar(env, "webhook/simulate", {}, opcoes).catch(e => ({ erro: e.message }));
  return r;
}

export { configuracao, rydLigada, origem, chamar, cotar, cotarEntrega, confirmarEntrega, cancelarEntrega, eventoDaRyd, sincronizarEntregas, STATUS };
