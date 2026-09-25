/* The one door every screen goes through to read or write data. By default it answers from the
   fake rows in data.js. With ?fonte=firebase it talks to the real system (firebase.js): reads live
   from Firestore, writes through the dluh-api Worker. Screens not wired yet show "ainda não ligada".

   URL switches exercise those states without a backend:
     ?latencia=1500          every call waits 1.5s (loading states)
     ?falha=carregar         reads fail as if offline (load error + retry)
     ?falha=escrever         writes are rejected by the server (error toast, nothing changes)
     ?falha=timeout          calls never answer; they give up after ?timeout= ms (default 12000)
     ?dados=extremos         loads data-extremos.js rows: long names, 7-digit totals, nulls… */
window.DLUH_API = (() => {
  const p = new URLSearchParams(window.location.search);
  const latencia = Math.max(0, Number(p.get("latencia")) || 0);
  const falha = p.get("falha");
  const TIMEOUT = Math.max(1000, Number(p.get("timeout")) || 12000);

  class ErroApi extends Error {
    constructor(tipo) { super(tipo); this.tipo = tipo; }
  }
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const copia = v => v == null ? v : JSON.parse(JSON.stringify(v));

  /* Every call races a timeout, so a hung request always ends in an answer the screen can show. */
  function chamar(tipo, responder) {
    const trabalho = (async () => {
      await espera(latencia);
      if (falha === "timeout") await new Promise(() => {});
      if (tipo === "carregar" && falha === "carregar") throw new ErroApi(navigator.onLine === false ? "offline" : "rede");
      if (tipo === "escrever" && falha === "escrever") throw new ErroApi("servidor");
      return responder();
    })();
    const limite = espera(TIMEOUT).then(() => { throw new ErroApi("timeout"); });
    return Promise.race([trabalho, limite]);
  }

  const modo = p.get("fonte") === "firebase" ? "firebase" : "demo";

  /* ── Real system ── */
  const hoje = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const quando = e => !e ? "—" : e.data === hoje() ? e.hora : `${e.data.slice(8, 10)}/${e.data.slice(5, 7)} · ${e.hora}`;
  const brl = c => "R$ " + ((Number(c) || 0) / 100).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const ts = v => v && typeof v.toDate === "function" ? v.toDate() : v instanceof Date ? v : null;
  const MEIO = { pix: "Pix", dinheiro: "Dinheiro", cartao: "Cartão", outro: "Outro" };
  /* Kitchen queue: in production and not yet done, soonest first, in the shape FilaCard reads. */
  const MAPAS = {
    /* All orders, in the shape OrderCard/DetalhesModal read (money as "R$ …" strings), keeping the
       raw numbers the actions need (centavos, pedidoId…). Newest first. */
    pedidos: pedidos => pedidos
      .slice().sort((a, b) => (ts(b.criadoEm) || 0) - (ts(a.criadoEm) || 0))
      .map(x => {
        const falta = x.status === "Cancelado" ? 0 : Math.max(0, (x.total || 0) - (x.pago || 0));
        return {
          id: x.id,
          cliente: x.cliente?.nome || "",
          tel: x.cliente?.telefone || "",
          status: x.status,
          tipo: x.tipo === "empresa" ? "Empresa" : null,
          entrega: [quando(x.entrega), x.entrega?.modo === "entrega" ? "Entrega" : "Retirada"].join(" · "),
          modo: x.entrega?.modo === "entrega" ? "Entrega em endereço" : "Retirada no local",
          data: x.entrega?.data || "", hora: x.entrega?.hora || "", endereco: x.entrega?.endereco || "",
          pgto: MEIO[x.formaPagamento] || null,
          total: brl(x.total), pago: x.pago ? brl(x.pago) : null, falta: falta ? brl(falta) : null,
          pagamento: x.pagamento, feitoNaCozinha: x.cozinha === "feito",
          itens: (x.itens || []).map(i => ({ qty: i.qtd, name: i.nome, note: i.obs, topper: i.topo, price: brl(i.qtd * i.valorUnit) })),
          _c: { total: x.total || 0, pago: x.pago || 0, falta, entradaPct: x.entradaPct || 50, formaPagamento: x.formaPagamento || null }
        };
      }),
    pagamentos: lista => lista
      .slice().sort((a, b) => (ts(a.em) || 0) - (ts(b.em) || 0))
      .map(p => ({ quando: ts(p.em) ? ts(p.em).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", " ·") : null,
        valor: (p.valor || 0) / 100, origem: p.por === "infinitepay" ? "site" : "manual", meio: MEIO[p.meio] || p.meio, arquivo: null, id: p.id })),
    fila: pedidos => pedidos
      .filter(x => x.cozinha !== "feito")
      .sort((a, b) => `${a.entrega?.data} ${a.entrega?.hora}`.localeCompare(`${b.entrega?.data} ${b.entrega?.hora}`))
      .map(x => ({
        id: x.id,
        cliente: x.cliente?.nome || "",
        hora: quando(x.entrega),
        itens: (x.itens || []).map(i => `${i.qtd} ${i.nome}`).join(" · "),
        pago: x.pagamento,
        entrega: x.entrega?.modo === "entrega" ? "Entrega" : "Retirada"
      }))
  };
  /* Worker/HTTP failures in the same `tipo` vocabulary the screens already explain. */
  function erroReal(e) {
    if (e instanceof ErroApi) return e;
    const tipo = navigator.onLine === false ? "offline"
      : e.status === 401 ? "sessao" : e.status === 403 || e.code === "permission-denied" ? "sem-permissao"
      : e.status >= 400 && e.status < 500 ? "recusado" : e.status >= 500 ? "servidor" : "rede";
    return Object.assign(new ErroApi(tipo), { mensagem: tipo === "recusado" ? e.mensagem : undefined });
  }
  const naoLigada = () => Promise.reject(new ErroApi("nao-ligada"));

  if (modo === "firebase") return {
    ErroApi, modo,
    carregar: naoLigada,
    assinar(colecao, aoDados, aoErro, param) {
      if (!MAPAS[colecao]) { aoErro(new ErroApi("nao-ligada")); return () => {}; }
      let parar = () => {}, vivo = true;
      window.DLUH_FB.then(fb => {
        if (vivo) parar = fb.assinar(colecao, (docs, meta) => aoDados(MAPAS[colecao](docs), meta), e => aoErro(erroReal(e)), param);
      }, e => aoErro(erroReal(e)));
      return () => { vivo = false; parar(); };
    },
    /* `pedido` = { acao, dados } for the Worker. A screen that doesn't send one isn't wired yet. */
    async escrever(chave, pedido) {
      if (!pedido) throw new ErroApi("nao-ligada");
      const fb = await window.DLUH_FB;
      const limite = espera(TIMEOUT).then(() => { throw new ErroApi("timeout"); });
      const trabalho = typeof pedido === "function" ? pedido((acao, dados) => fb.chamar(acao, dados)) : fb.chamar(pedido.acao, pedido.dados);
      try { return await Promise.race([trabalho, limite]); }
      catch (e) { throw erroReal(e); }
    }
  };

  const carregar = colecao => chamar("carregar", () => copia(colecao ? window.DLUH[colecao] : window.DLUH));
  return {
    ErroApi, modo,
    carregar,
    /* Demo: one load, delivered like a live update. */
    assinar(colecao, aoDados, aoErro) {
      let vivo = true;
      carregar(colecao).then(d => vivo && aoDados(d, { doCache: false }), e => vivo && aoErro(e));
      return () => { vivo = false; };
    },
    escrever: (acao, dados) => chamar("escrever", () => ({ ok: true, acao, dados }))
  };
})();
