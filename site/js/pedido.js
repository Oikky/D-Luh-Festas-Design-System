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
      }
    } catch (_) {
      resultado.innerHTML = `<div class="situacao"><p class="aviso aviso--erro" role="alert">${D.icone("alerta")}<span>Não deu pra buscar agora. Confira a internet e tente de novo.</span></p></div>`;
    } finally {
      botao.disabled = false;
      botao.lastChild.textContent = " Ver pedido";
    }
  });

  function htmlPedido(p) {
    const s = SITUACAO[p.status] || { etapa: 0, titulo: p.status, frase: "" };
    const cancelado = s.etapa === -1;
    const total = p.total || 0;
    const pago = p.pago || 0;
    const falta = Math.max(total - pago, 0);
    const entrada = Math.round(total * (p.entradaPct || 50) / 100);
    const faltaEntrada = Math.max(entrada - pago, 0);

    let acao = "";
    if (p.status === "Confirmado — Esperando pagamento" && faltaEntrada > 0) {
      acao = p.linkPagamento
        ? `<a class="botao botao--grande" href="${D.esc(p.linkPagamento)}" target="_blank" rel="noopener">Pagar a entrada de ${D.brl(faltaEntrada)}</a>`
        : `<p class="aviso">${D.icone("info")}<span>O link da entrada (${D.brl(faltaEntrada)}) chega pelo WhatsApp.</span></p>`;
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
            const estado = cancelado ? "" : i < s.etapa || (i === s.etapa && p.status === "Finalizado") ? "feito" : i === s.etapa ? "agora" : "";
            const rotulo = estado === "feito" ? "feito" : estado === "agora" ? "agora" : "ainda não";
            return `<li class="${estado}" ${estado === "agora" ? 'aria-current="step"' : ""}>${D.icone(estado === "feito" ? "check" : t.icone)}<span>${t.nome}</span><small>${rotulo}</small></li>`;
          }).join("")}
        </ol>
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

  if (numero.value && D.soDigitos(tel.value).length >= 10) form.requestSubmit();
})();
