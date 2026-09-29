/* API do site: fala com o Worker dluh-api pelas rotas /site/* (o pedido exige login Google).
   O Worker confere tudo de novo e usa os preços do catálogo; aqui só vai o que o cliente escolheu.
   Mesmas duas funções do api-teste.js (que continua existindo para testar sem mexer no sistema:
   ?api=teste na URL). */
(function () {
  "use strict";
  const BASE = "https://dluh-api.sitedluh.workers.dev";
  const teste = /[?&]api=teste\b/.test(location.search);
  if (teste) return; // api-teste.js assume

  async function chamar(rota, corpo, idToken) {
    let r;
    try {
      r = await fetch(`${BASE}/site/${rota}`, {
        method: "POST", body: JSON.stringify(corpo),
        headers: { "Content-Type": "application/json", ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) }
      });
    } catch (_) {
      const e = new Error("Sem conexão"); e.codigo = "rede"; throw e;
    }
    const dados = await r.json().catch(() => ({}));
    if (!r.ok) {
      const e = new Error(dados.erro || "Não deu certo"); e.codigo = dados.codigo || String(r.status); throw e;
    }
    return dados;
  }

  // O pedido vai com o login Google (login.js); o Worker recusa sem ele.
  const criarPedido = async dados => chamar("pedido", dados, await window.DLuhLogin?.token());
  const consultarPedido = (numero, telefone) => chamar("consultar", { numero, telefone });

  window.DLuhAPI = { criarPedido, consultarPedido, modo: "producao" };
})();
