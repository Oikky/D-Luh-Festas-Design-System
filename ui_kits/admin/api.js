/* The one door every screen goes through to read or write data. Today it answers from the fake
   rows in data.js; when Coda, InfinitePay and the rest are wired in, only this file changes and
   the screens keep their loading, error and retry states.

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

  return {
    ErroApi,
    carregar: colecao => chamar("carregar", () => copia(colecao ? window.DLUH[colecao] : window.DLUH)),
    escrever: (acao, dados) => chamar("escrever", () => ({ ok: true, acao, dados }))
  };
})();
