/* API de TESTE do site (só com ?api=teste na URL) — mesmo formato das rotas /site/pedido e
   /site/consultar do Worker dluh-api (js/api.js). Nada sai do aparelho: os pedidos ficam no
   localStorage. Na etapa 4 este arquivo é trocado por api.js, com as mesmas duas funções. */
(function () {
  "use strict";
  if (!/[?&]api=teste\b/.test(location.search)) return; // produção: api.js
  const CHAVE = "dluh_site_pedidos_teste_v1";
  const espera = ms => new Promise(r => setTimeout(r, ms));

  function lerTodos() {
    try { return JSON.parse(localStorage.getItem(CHAVE) || "{}"); } catch (_) { return {}; }
  }
  function salvarTodos(t) {
    try { localStorage.setItem(CHAVE, JSON.stringify(t)); } catch (_) { /* só na memória */ }
  }

  /* Pedidos de demonstração pra ver cada estado em "Acompanhar pedido" (telefone: qualquer um
     terminado em 4410). Os números são inventados e ficam só neste arquivo de teste. */
  function hojeMais(dias) {
    const d = new Date(); d.setDate(d.getDate() + dias);
    return d.toISOString().slice(0, 10);
  }
  const DEMO = {
    "PED-3101": { status: "Aguardando confirmação", pago: 0 },
    "PED-3102": { status: "Confirmado — Esperando pagamento", pago: 0, linkPagamento: "https://checkout.infinitepay.io/" },
    "PED-3103": { status: "Em produção", pago: 14000 },
    "PED-3104": { status: "Entregue — Esperando restante", pago: 14000 },
    "PED-3105": { status: "Finalizado", pago: 28000 },
    "PED-3106": { status: "Cancelado", pago: 0 }
  };
  function pedidoDemo(id) {
    const d = DEMO[id];
    if (!d) return null;
    return {
      id, status: d.status, pago: d.pago, total: 28000, entradaPct: 50, linkPagamento: d.linkPagamento || null,
      cliente: { nome: "Cliente de teste", telefone: "38998124410" },
      entrega: { modo: "entrega", data: hojeMais(5), hora: "15:00", endereco: "Rua de teste, 100 — Centro" },
      itens: [
        { nome: "Coxinha", qtd: 100, valorUnit: 75 },
        { nome: "Brigadeiro", qtd: 50, valorUnit: 130 },
        { nome: "Bolo aro 18", qtd: 1, valorUnit: 14000, recheios: ["Creme Ninho", "Creme Belga com Morangos"] }
      ],
      taxaEntrega: 0
    };
  }

  /* Mesmas regras de telefone do Worker: DDD + 8 dígitos finais. */
  function telIguais(a, b) {
    const x = String(a).replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
    const y = String(b).replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
    if (x.length >= 10 && y.length >= 10) return x.slice(0, 2) === y.slice(0, 2) && x.slice(-8) === y.slice(-8);
    return x.slice(-8) === y.slice(-8);
  }

  async function criarPedido(dados) {
    await espera(900);
    const todos = lerTodos();
    const ultimo = Object.keys(todos).map(k => Number(k.split("-")[1])).filter(Boolean);
    const numero = Math.max(3200, ...ultimo) + 1;
    const id = `PED-${numero}`;
    const total = dados.itens.reduce((s, it) => s + it.qtd * it.valorUnit, 0) + (dados.taxaEntrega || 0);
    todos[id] = { ...dados, id, total, pago: 0, status: "Aguardando confirmação", criadoEm: Date.now() };
    salvarTodos(todos);
    return { id };
  }

  async function consultarPedido(id, telefone) {
    await espera(700);
    const chave = String(id).trim().toUpperCase().replace(/^(PED)?[\s-]*/, "PED-");
    const p = lerTodos()[chave] || pedidoDemo(chave);
    if (!p) return { erro: "nao-encontrado" };
    const telDemo = DEMO[chave] ? String(telefone).replace(/\D/g, "").endsWith("4410") : false;
    if (!telDemo && !telIguais(p.cliente.telefone, telefone)) return { erro: "nao-encontrado" };
    return { pedido: p };
  }

  window.DLuhAPI = { criarPedido, consultarPedido, modo: "teste" };
})();
