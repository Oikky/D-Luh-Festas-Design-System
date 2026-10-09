/* Acompanhar pedido: número + WhatsApp → situação em linguagem de cliente, trilha e contas. */
(function () {
  "use strict";
  const D = window.DLuh;
  const API = window.DLuhAPI;
  if (!D || !API) return;

  /* Status do sistema (os mesmos do admin) → o que o cliente lê. */
  const SITUACAO = {
    "Aguardando confirmação": { etapa: 0, titulo: "Recebido", frase: "A loja recebeu seu pedido e vai conferir o estoque. A confirmação chega pelo WhatsApp." },
    "Verificando Estoque": { etapa: 0, titulo: "Conferindo o estoque", frase: "A loja está conferindo o estoque pro seu pedido. A confirmação chega pelo WhatsApp." },
    "Confirmado — Esperando pagamento": { etapa: 1, titulo: "Confirmado", frase: "Pedido confirmado! Falta pagar a entrada pra ele ir pra cozinha." },
    "Em produção": { etapa: 2, titulo: "Na cozinha", frase: "Seu pedido está sendo feito." },
    "Pronto": { etapa: 2, titulo: "Pronto", frase: "Seu pedido está pronto." },
    "Entregue — Esperando restante": { etapa: 3, titulo: "Entregue", frase: "Pedido entregue. Falta pagar o restante." },
    "Finalizado": { etapa: 3, titulo: "Tudo certo", frase: "Pedido entregue e pago. Boa festa!" },
    "Cancelado": { etapa: -1, titulo: "Cancelado", frase: "Este pedido foi cancelado. Se tiver dúvida, fale com a loja no WhatsApp." }
  };
  const TRILHA = [
    { nome: "Recebido", icone: "recebido" },
    { nome: "Confirmado", icone: "check" },
    { nome: "Na cozinha", icone: "forno" },
    { nome: "Entregue", icone: "entregue" }
  ];

  /* Entregador da RYD (o Worker manda `entregador` quando a loja chamou um): o que o cliente lê
     em cada status e em que ponto da barra ele está. */
  const ENTREGA = {
    pending: { passo: 0, titulo: () => "Chamando um entregador", frase: "Assim que alguém aceitar, o nome aparece aqui." },
    scheduled: { passo: 0, titulo: () => "Entregador agendado", frase: "Assim que alguém aceitar, o nome aparece aqui." },
    accepted: { passo: 1, titulo: n => `${n || "O entregador"} está indo buscar seu pedido`, frase: "Ele está a caminho da loja." },
    withdraw: { passo: 1, titulo: n => `${n || "O entregador"} está pegando seu pedido`, frase: "Ele chegou na loja." },
    delivering: { passo: 2, titulo: n => `${n || "O entregador"} está levando seu pedido`, frase: "Saiu para entrega. Fique de olho no portão!" },
    finished: { passo: 3, titulo: () => "Pedido entregue", frase: "O entregador marcou a entrega como feita." }
  };
  const PASSOS = ["Chamando", "Na loja", "A caminho", "Entregue"];
  // A cada 30 s com a tela aberta (o Worker deixa 8 por minuto); no ?api=teste, 5 s pra ver andar.
  const ESPERA = API.modo === "teste" ? 5000 : 30000;
  let acompanhando = null; // { numero, telefone, status, timer }

  const form = document.getElementById("form-consulta");
  const numero = document.getElementById("c-numero");
  const tel = document.getElementById("c-tel");
  const botao = document.getElementById("c-botao");
  const resultado = document.getElementById("resultado");

  tel.addEventListener("input", () => { tel.value = D.mascaraTelefone(tel.value); });

  const params = new URLSearchParams(location.search);
  if (params.get("n")) numero.value = params.get("n");
  try {
    const salvo = JSON.parse(localStorage.getItem("dluh_site_cliente_v1") || "null");
    if (salvo && salvo.telefone) tel.value = D.mascaraTelefone(salvo.telefone);
  } catch (_) { /* segue sem */ }

  function erroCampo(id, msg) {
    const inp = document.getElementById(id);
    const p = document.getElementById(`${id}-erro`);
    if (msg) { inp.setAttribute("aria-invalid", "true"); inp.setAttribute("aria-describedby", `${id}-erro`); p.textContent = msg; p.hidden = false; }
    else { inp.removeAttribute("aria-invalid"); inp.removeAttribute("aria-describedby"); p.hidden = true; }
    return !!msg;
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const n = numero.value.trim();
    const t = D.soDigitos(tel.value);
    let ruim = false;
    ruim = erroCampo("c-numero", !/\d{3,}/.test(n) ? "Digite o número do pedido, ex.: PED-3104" : "") || ruim;
    ruim = erroCampo("c-tel", t.length < 10 ? "Digite o WhatsApp com DDD" : "") || ruim;
    if (ruim) { form.querySelector('[aria-invalid="true"]').focus(); return; }

    parar();
    botao.disabled = true;
    botao.lastChild.textContent = " Buscando…";
    resultado.innerHTML = `<div class="situacao"><div class="situacao__topo carregando" aria-label="Buscando o pedido"><div></div><div></div></div></div>`;
    try {
      const r = await API.consultarPedido(n, t);
      if (r.erro) {
        resultado.innerHTML = `<div class="situacao"><p class="aviso aviso--erro" role="alert">${D.icone("alerta")}<span>Não achamos esse pedido com esse WhatsApp. Confira o número (ele começa com PED) e use o mesmo telefone do pedido.</span></p></div>`;
      } else {
        resultado.innerHTML = htmlPedido(r.pedido);
        history.replaceState(null, "", `/pedido?n=${encodeURIComponent(r.pedido.id)}`);
        acompanhar(r.pedido, t);
      }
    } catch (_) {
      resultado.innerHTML = `<div class="situacao"><p class="aviso aviso--erro" role="alert">${D.icone("alerta")}<span>Não deu pra buscar agora. Confira a internet e tente de novo.</span></p></div>`;
    } finally {
      botao.disabled = false;
      botao.lastChild.textContent = " Ver pedido";
    }
  });

  function htmlPedido(p) {
    let s = SITUACAO[p.status] || { etapa: 0, titulo: p.status, frase: "" };
    // Entregador com o pedido na mão: o topo já fala da entrega, não da cozinha.
    if (s.etapa === 2 && ["delivering", "finished"].includes(p.entregador?.status)) {
      s = p.entregador.status === "finished"
        ? { etapa: 3, titulo: "Entregue", frase: "O entregador marcou a entrega como feita.", concluido: true }
        : { etapa: 3, titulo: "Saiu para entrega", frase: "Seu pedido está a caminho." };
    }
    const cancelado = s.etapa === -1;
    const total = p.total || 0;
    const pago = p.pago || 0;
    const falta = Math.max(total - pago, 0);
    const entrada = Math.round(total * (p.entradaPct || 50) / 100);
    const faltaEntrada = Math.max(entrada - pago, 0);

    let acao = "";
    if (p.status === "Confirmado — Esperando pagamento" && faltaEntrada > 0) {
      acao = p.linkPagamento
        ? `<a class="botao botao--grande" href="${D.esc(p.linkPagamento)}" target="_blank" rel="noopener">${p.entradaPct === 100 ? "Pagar o pedido" : "Pagar a entrada"} de ${D.brl(faltaEntrada)}</a>`
        : `<p class="aviso">${D.icone("info")}<span>O link ${p.entradaPct === 100 ? "de pagamento" : "da entrada"} (${D.brl(faltaEntrada)}) chega pelo WhatsApp.</span></p>`;
    } else if (p.status === "Entregue — Esperando restante" && falta > 0 && p.linkPagamento) {
      acao = `<a class="botao botao--grande" href="${D.esc(p.linkPagamento)}" target="_blank" rel="noopener">Pagar o restante de ${D.brl(falta)}</a>`;
    }

    const e = p.entrega || {};
    return `<div class="situacao">
      <section class="situacao__topo" aria-labelledby="sit-titulo">
        <div class="situacao__titulo">
          <h2 class="titulo titulo--m" id="sit-titulo">${D.esc(s.titulo)}</h2>
          <p class="num">${D.esc(p.id)}</p>
        </div>
        ${s.frase ? `<p class="situacao__frase">${D.esc(s.frase)}</p>` : ""}
        <ol class="trilha ${cancelado ? "trilha--cancelado" : ""}" aria-label="Andamento">
          ${TRILHA.map((t, i) => {
            const estado = cancelado ? "" : i < s.etapa || (i === s.etapa && (p.status === "Finalizado" || s.concluido)) ? "feito" : i === s.etapa ? "agora" : "";
            const rotulo = estado === "feito" ? "feito" : estado === "agora" ? "agora" : "ainda não";
            return `<li class="${estado}" ${estado === "agora" ? 'aria-current="step"' : ""}>${D.icone(estado === "feito" ? "check" : t.icone)}<span>${t.nome}</span><small>${rotulo}</small></li>`;
          }).join("")}
        </ol>
        <div data-entregador>${htmlEntregador(p.entregador)}</div>
        <dl class="contas">
          <div><dt>Total</dt><dd class="num">${D.brl(total)}</dd></div>
          <div><dt>Pago</dt><dd class="num">${D.brl(pago)}</dd></div>
          <div class="${falta > 0 && !cancelado ? "falta" : ""}"><dt>Falta</dt><dd class="num">${D.brl(cancelado ? 0 : falta)}</dd></div>
        </dl>
        ${acao}
      </section>
      <section class="detalhe" aria-label="Detalhes do pedido">
        <div>
          <h2>${e.modo === "retirada" ? "Retirada na loja" : "Entrega"}</h2>
          <p>${D.esc(D.dataLonga(e.data))}${e.hora ? `, ${D.esc(D.hora(e.hora))}` : ""}</p>
          ${e.modo === "entrega" && e.endereco ? `<p>${D.esc(e.endereco)}</p>` : ""}
        </div>
        <div>
          <h2>Itens</h2>
          <ul class="revisao__itens">${(p.itens || []).map(it =>
            `<li><span>${it.qtd} × ${D.esc(it.nome)}${it.recheios && it.recheios.length ? ` <small>(${D.esc(it.recheios.join(" e "))})</small>` : ""}</span><span class="num">${D.brl(it.qtd * it.valorUnit)}</span></li>`).join("")}</ul>
        </div>
      </section>
      <p><a class="link-pintado" href="${D.linkWhats(`Oi! Queria falar sobre o pedido ${p.id}.`)}" target="_blank" rel="noopener">Falar com a loja sobre este pedido</a></p>
    </div>`;
  }

  function htmlEntregador(en) {
    const e = en && ENTREGA[en.status];
    if (!e) return "";
    const fim = en.status === "finished";
    const nome = en.nome ? D.esc(en.nome) : "";
    const foto = en.foto
      ? `<img src="${D.esc(en.foto)}" alt="" width="56" height="56" referrerpolicy="no-referrer" data-inicial="${nome ? nome[0] : ""}">`
      : nome ? `<span class="entregador__inicial">${nome[0]}</span>` : D.icone("moto");
    const hora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `<section class="entregador ${fim ? "entregador--fim" : ""}" aria-labelledby="ent-titulo" style="--passo:${e.passo}">
      <div class="entregador__quem">
        <div class="entregador__foto">${fim ? D.icone("check") : foto}</div>
        <div>
          <h3 id="ent-titulo">${D.esc(e.titulo(en.nome || ""))}</h3>
          <p>${D.esc(e.frase)}</p>
        </div>
      </div>
      <div class="entregador__barra" aria-hidden="true"><span class="entregador__feito"></span><span class="entregador__moto">${D.icone("moto")}</span></div>
      <ol class="entregador__passos" aria-label="Andamento da entrega">
        ${PASSOS.map((nomePasso, i) => `<li class="${i < e.passo || fim ? "feito" : i === e.passo ? "agora" : ""}" ${i === e.passo ? 'aria-current="step"' : ""}>${nomePasso}</li>`).join("")}
      </ol>
      ${fim ? "" : `<p class="entregador__vivo"><span class="ponto" aria-hidden="true"></span>Atualiza sozinho · ${hora}</p>`}
    </section>`;
  }

  /* Com a tela aberta, pergunta pelo entregador a cada 30 s enquanto a entrega pode mudar: pedido
     de entrega na cozinha/pronto, ou entregador a caminho. Aba escondida não pergunta; ao voltar,
     pergunta na hora. */
  const vaiMudar = (status, en) => en ? en.status !== "finished" : ["Em produção", "Pronto"].includes(status);
  function acompanhar(p, telefone) {
    if (p.entrega?.modo !== "entrega" || !vaiMudar(p.status, p.entregador) || !API.acompanharEntrega) return;
    acompanhando = { numero: p.id, telefone, status: p.status, chave: JSON.stringify(p.entregador || null) };
    agendar();
  }
  function agendar() {
    clearTimeout(acompanhando?.timer);
    if (acompanhando) acompanhando.timer = setTimeout(atualizar, ESPERA);
  }
  function parar() {
    clearTimeout(acompanhando?.timer);
    acompanhando = null;
  }
  async function atualizar() {
    const a = acompanhando;
    if (!a || document.hidden) return;
    try {
      const r = await API.acompanharEntrega(a.numero, a.telefone);
      if (a !== acompanhando || r.erro) return;
      const chave = JSON.stringify(r.entregador || null);
      if (r.status !== a.status || chave !== a.chave) {
        // Mudou o pedido ou o entregador (poucas vezes por entrega): busca de novo e redesenha
        // tudo, pra o título e a trilha de cima acompanharem.
        const c = await API.consultarPedido(a.numero, a.telefone);
        if (a !== acompanhando || c.erro) return;
        resultado.innerHTML = htmlPedido(c.pedido);
        parar();
        acompanhar(c.pedido, a.telefone);
        return;
      }
      const vivo = resultado.querySelector(".entregador__vivo");
      if (vivo) vivo.lastChild.textContent = `Atualiza sozinho · ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
      if (!vaiMudar(r.status, r.entregador)) return parar();
    } catch (_) { /* sem internet ou limite: tenta na próxima */ }
    agendar();
  }
  // Foto do entregador que não carrega vira a inicial do nome.
  resultado.addEventListener("error", e => {
    const img = e.target;
    if (img.tagName !== "IMG" || !img.closest(".entregador__foto")) return;
    const s = document.createElement("span");
    s.className = "entregador__inicial";
    s.textContent = img.dataset.inicial || "";
    img.replaceWith(s);
  }, true);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && acompanhando) atualizar(); });

  if (numero.value && D.soDigitos(tel.value).length >= 10) form.requestSubmit();
})();
