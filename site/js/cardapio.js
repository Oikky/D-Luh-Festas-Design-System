/* Cardápio: montar o pedido (lista + comanda), finalizar em etapas (Data · Entrega · Revisão)
   e mostrar o pedido recebido. Grava pelo DLuhAPI (teste agora; Worker na etapa 4). */
(window.DLuhDepoisDoCatalogo || (fn => fn()))(function () {
  "use strict";
  const D = window.DLuh;
  const API = window.DLuhAPI;
  const CAT = window.DLUH_CATALOGO;
  if (!D || !API || !CAT) return;

  const CHAVE_CLIENTE = "dluh_site_cliente_v1";
  const produtos = CAT.produtos.filter(p => !/^test$/i.test(p.nome));
  const porId = new Map(produtos.map(p => [p.id, p]));
  const categorias = D.categoriasDoCatalogo(produtos);
  const recheios = CAT.recheios || [];

  let carrinho = D.lerCarrinho();
  // Some com o que saiu do catálogo desde a última visita.
  for (const id of Object.keys(carrinho.linhas)) if (!porId.has(id)) delete carrinho.linhas[id];

  /* Quem escolhe recheio: bolos por aro. Quem escolhe tipos: pacotes. Até 2 por unidade. */
  function opcoesDe(p) {
    if (D.ehPacote(p)) return D.opcoesPacote(p, produtos);
    if (D.ehBolo(p) && /aro\s*\d+/i.test(p.nome)) return recheios;
    return null;
  }
  const rotuloUnidade = p => (D.ehPacote(p) ? "Pacote" : "Bolo");
  const rotuloEscolha = p => (D.ehPacote(p) ? "tipos" : "recheios");

  /* ── Estado ── */
  function linha(id) { return carrinho.linhas[id]; }
  function definirQtd(id, qtd) {
    const p = porId.get(id);
    qtd = Math.max(0, Math.floor(Number(qtd) || 0));
    if (qtd > 0 && qtd < p.qtdMin) qtd = p.qtdMin;
    if (qtd > 9999) qtd = 9999;
    if (qtd === 0) { delete carrinho.linhas[id]; }
    else {
      const l = carrinho.linhas[id] || { qtd: 0, escolhas: [] };
      l.qtd = qtd;
      if (opcoesDe(p)) {
        l.escolhas = (l.escolhas || []).slice(0, qtd);
        while (l.escolhas.length < qtd) l.escolhas.push([]);
      }
      carrinho.linhas[id] = l;
    }
    D.salvarCarrinho(carrinho);
    D.atualizarSacola();
  }
  function itensDoCarrinho() {
    return Object.entries(carrinho.linhas).map(([id, l]) => ({ p: porId.get(id), l })).filter(x => x.p);
  }
  function totalCarrinho() { return itensDoCarrinho().reduce((s, { p, l }) => s + p.valorUnit * l.qtd, 0); }
  function faltaEscolha() {
    return itensDoCarrinho().filter(({ p, l }) => opcoesDe(p) && l.escolhas.some(e => !e.length));
  }
  function temBoloDeAro() { return itensDoCarrinho().some(({ p }) => D.ehBolo(p) && /aro/i.test(p.nome)); }

  /* ── Lista de produtos ── */
  const elCategorias = document.getElementById("categorias");
  const elAbas = document.getElementById("abas");

  elAbas.innerHTML = categorias.map((c, i) =>
    `<a class="aba" href="#${c.slug}" data-aba="${c.slug}" ${i === 0 ? 'aria-current="true"' : ""}>${D.esc(c.nome)}</a>`).join("");

  function regraDe(c) {
    const mins = [...new Set(c.produtos.map(p => p.qtdMin))];
    if (mins.length === 1 && mins[0] >= 25) return `Mínimo de ${mins[0]} de cada sabor · preço por unidade`;
    if (mins.every(m => m === 1)) return "Preço por unidade";
    return "Veja o mínimo em cada item";
  }

  elCategorias.innerHTML = categorias.map(c => `
    <section class="categoria" id="${c.slug}" aria-labelledby="t-${c.slug}">
      <div class="categoria__cabeca">
        <h2 class="titulo titulo--m" id="t-${c.slug}">${D.esc(c.nome)}</h2>
        <p class="categoria__regra">${regraDe(c)}</p>
      </div>
      <ul class="grade-produtos">${c.produtos.map(p => `<li class="card" data-produto="${p.id}"></li>`).join("")}</ul>
    </section>`).join("");

  function htmlProduto(p) {
    const l = linha(p.id);
    const qtd = l ? l.qtd : 0;
    const nome = D.nomeLimpo(p.nome);
    const foto = p.imagem
      ? `<div class="card__foto"><img src="${D.esc(p.imagem)}" alt="" loading="lazy" decoding="async" width="225" height="225" data-sem-foto="${D.ehBolo(p) ? "bolo" : "salgado"}"></div>`
      : `<div class="card__foto card__foto--vazia" aria-hidden="true">${D.semFoto()}</div>`;
    const preco = p.qtdMin >= 25
      ? `<strong>${D.brlPlaca(p.valorUnit * 100)}</strong><small>o cento</small><small>${D.brl(p.valorUnit)} cada</small>`
      : `<strong>${D.brl(p.valorUnit)}</strong><small>${p.qtdMin > 1 ? `mínimo ${p.qtdMin}` : "a unidade"}</small>`;
    const acao = qtd === 0
      ? `<button class="mais" type="button" data-acao="somar" data-foco="add-${p.id}" aria-label="Pôr ${p.qtdMin > 1 ? p.qtdMin + " " : ""}${D.esc(nome)} no pedido">${D.icone("mais")}</button>`
      : `<div class="contador" role="group" aria-label="Quantidade de ${D.esc(nome)}">
           <button type="button" data-acao="menos" data-foco="menos-${p.id}" aria-label="${qtd <= p.qtdMin ? "Tirar do pedido" : `Tirar ${D.passoDe(p)}`}">${D.icone(qtd <= p.qtdMin ? "lixo" : "menos")}</button>
           <input class="num" type="number" inputmode="numeric" min="${p.qtdMin}" step="1" value="${qtd}" data-acao="digitar" data-foco="qtd-${p.id}" aria-label="Quantidade de ${D.esc(nome)}">
           <button type="button" data-acao="somar" data-foco="mais-${p.id}" aria-label="Somar ${D.passoDe(p)}">${D.icone("mais")}</button>
         </div>`;
    return `${foto}
      ${qtd ? `<span class="selo selo--verde num">${qtd} no pedido</span>` : p.qtdMin > 1 ? `<span class="selo num">mín. ${p.qtdMin}</span>` : ""}
      <div class="card__corpo">
        <h3 class="card__nome">${D.esc(nome)}</h3>
        ${p.descricao ? `<p class="card__desc">${D.esc(p.descricao.replace(/!$/, ""))}</p>` : ""}
        <div class="card__pe">
          <p class="card__preco num">${preco}</p>
          ${acao}
        </div>
      </div>
      <p class="previa-total" data-previa aria-live="polite"></p>
      ${htmlEscolhas(p, l)}`;
  }

  function htmlEscolhas(p, l) {
    const opcoes = opcoesDe(p);
    if (!opcoes || !l || !l.qtd) return "";
    if (!opcoes.length) return "";
    return `<div class="escolhas">${l.escolhas.map((sel, i) => `
      <fieldset class="escolha">
        <legend>${rotuloUnidade(p)}${l.qtd > 1 ? ` ${i + 1}` : ""}: escolha até 2 ${rotuloEscolha(p)}</legend>
        <div class="chips">${opcoes.map(o => {
          const marcado = sel.includes(o);
          return `<label class="chip"><input type="checkbox" data-acao="escolher" data-unidade="${i}" value="${D.esc(o)}" data-foco="ch-${p.id}-${i}-${D.slugDe(o)}" ${marcado ? "checked" : ""} ${!marcado && sel.length >= 2 ? "disabled" : ""}>${D.esc(o)}</label>`;
        }).join("")}</div>
        ${sel.length ? `<p class="escolha__ok">${D.esc(sel.join(" e "))}</p>` : `<p class="escolha__aviso">Falta escolher</p>`}
      </fieldset>`).join("")}</div>`;
  }

  function desenharProduto(id) {
    const li = elCategorias.querySelector(`[data-produto="${id}"]`);
    if (!li) return;
    const foco = document.activeElement && li.contains(document.activeElement) ? document.activeElement.dataset.foco : null;
    const p = porId.get(id);
    li.innerHTML = htmlProduto(p);
    li.classList.toggle("card--aberto", !!(opcoesDe(p) && linha(id)));
    if (foco) {
      const alvo = li.querySelector(`[data-foco="${foco}"]`) || li.querySelector("[data-foco]");
      if (alvo) alvo.focus({ preventScroll: true });
    }
  }
  produtos.forEach(p => desenharProduto(p.id));

  /* Foto que não carrega vira o ícone da categoria. */
  elCategorias.addEventListener("error", e => {
    const img = e.target;
    if (img.tagName !== "IMG" || !img.dataset.semFoto) return;
    img.parentElement.classList.add("card__foto--vazia");
    img.outerHTML = D.semFoto();
  }, true);

  /* Interação na lista */
  /* Mais, menos e tirar: os mesmos no cartão do produto e na lista do pedido. */
  function mudar(id, acao, avisar) {
    const p = porId.get(id);
    const atual = linha(id) ? linha(id).qtd : 0;
    if (acao === "somar") {
      definirQtd(id, atual === 0 ? p.qtdMin : atual + D.passoDe(p));
      if (atual === 0 && avisar) D.recado(`${D.nomeLimpo(p.nome)} no pedido`);
    } else if (acao === "menos" || acao === "tirar") {
      const novo = acao === "tirar" ? 0 : atual - D.passoDe(p);
      definirQtd(id, novo < p.qtdMin ? 0 : novo);
      if (novo < p.qtdMin && avisar) D.recado(`${D.nomeLimpo(p.nome)} saiu do pedido`);
    }
    desenharProduto(id);
    atualizarComanda();
  }
  elCategorias.addEventListener("click", e => {
    const btn = e.target.closest("button[data-acao]");
    if (!btn) return;
    mudar(btn.closest("[data-produto]").dataset.produto, btn.dataset.acao, true);
  });

  /* Digitando a quantidade: mostra o novo total antes de valer. */
  elCategorias.addEventListener("input", e => {
    const inp = e.target.closest('input[data-acao="digitar"]');
    if (!inp) return;
    const li = inp.closest("[data-produto]");
    const p = porId.get(li.dataset.produto);
    const n = Math.floor(Number(inp.value) || 0);
    const previa = li.querySelector("[data-previa]");
    const atual = linha(p.id).qtd;
    if (!n || n === atual) { previa.textContent = ""; return; }
    const ajustado = n < p.qtdMin ? p.qtdMin : n;
    const novoTotal = totalCarrinho() - atual * p.valorUnit + ajustado * p.valorUnit;
    previa.textContent = n < p.qtdMin
      ? `O mínimo é ${p.qtdMin}. Com ${p.qtdMin}, o pedido fica em ${D.brl(novoTotal)}`
      : `Com ${n}, o pedido fica em ${D.brl(novoTotal)}. Enter pra confirmar`;
  });
  function confirmarDigitado(inp) {
    const li = inp.closest("[data-produto]");
    const id = li.dataset.produto;
    const n = Math.floor(Number(inp.value) || 0);
    if (!linha(id) || n === linha(id).qtd) { li.querySelector("[data-previa]").textContent = ""; return; }
    definirQtd(id, n);
    desenharProduto(id);
    atualizarComanda();
  }
  elCategorias.addEventListener("change", e => {
    const inp = e.target.closest('input[data-acao="digitar"]');
    if (inp) { confirmarDigitado(inp); return; }
    const ch = e.target.closest('input[data-acao="escolher"]');
    if (!ch) return;
    const id = ch.closest("[data-produto]").dataset.produto;
    const l = linha(id);
    const u = Number(ch.dataset.unidade);
    const sel = new Set(l.escolhas[u]);
    ch.checked ? sel.add(ch.value) : sel.delete(ch.value);
    l.escolhas[u] = [...sel].slice(0, 2);
    D.salvarCarrinho(carrinho);
    desenharProduto(id);
    atualizarComanda();
  });
  elCategorias.addEventListener("keydown", e => {
    const inp = e.target.closest('input[data-acao="digitar"]');
    if (inp && e.key === "Enter") { e.preventDefault(); confirmarDigitado(inp); }
  });

  /* Abas acompanham a rolagem */
  const abas = [...elAbas.querySelectorAll(".aba")];
  const vistas = new Map();
  const obs = new IntersectionObserver(entradas => {
    entradas.forEach(en => vistas.set(en.target.id, en.isIntersecting ? en.intersectionRatio : 0));
    let melhor = null, maior = 0;
    for (const c of categorias) { const r = vistas.get(c.slug) || 0; if (r > maior) { maior = r; melhor = c.slug; } }
    if (!melhor) return;
    abas.forEach(a => {
      const ativa = a.dataset.aba === melhor;
      if (ativa && a.getAttribute("aria-current") !== "true") elAbas.scrollTo({ left: a.offsetLeft - elAbas.offsetLeft - 8, behavior: "smooth" });
      ativa ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current");
    });
  }, { rootMargin: "-150px 0px -45% 0px", threshold: [0, 0.1, 0.3, 0.6] });
  categorias.forEach(c => obs.observe(document.getElementById(c.slug)));

  /* ── Comanda (coluna no desktop, folha no celular) ── */
  const comandas = [...document.querySelectorAll("[data-comanda]")];
  function htmlComanda(ehFolha) {
    const itens = itensDoCarrinho();
    const qtdLinhas = itens.length;
    const falta = faltaEscolha();
    return `
      <div class="comanda__cabeca">
        <h2 ${ehFolha ? "" : 'id="titulo-comanda"'}>Seu pedido</h2>
        ${ehFolha ? `<button class="comanda__fechar" type="button" data-fechar-folha aria-label="Fechar">${D.icone("fechar")}</button>` : ""}
      </div>
      ${qtdLinhas ? `<ul class="comanda__itens">${itens.map(({ p, l }) => `
        <li class="comanda__item">
          ${p.imagem ? `<img src="${D.esc(p.imagem)}" alt="" width="48" height="48" loading="lazy">` : `<span class="miniatura" aria-hidden="true">${D.semFoto()}</span>`}
          <strong>${D.esc(D.nomeLimpo(p.nome))}</strong><span class="num">${D.brl(p.valorUnit * l.qtd)}</span>
          ${opcoesDe(p) ? `<small>${l.escolhas.map((e, i) => e.length ? D.esc(e.join(" e ")) : `${rotuloUnidade(p)} ${i + 1}: falta escolher`).join(" · ")}</small>` : ""}
          <div class="comanda__acoes">
            <div class="contador contador--mini" role="group" aria-label="Quantidade de ${D.esc(D.nomeLimpo(p.nome))}">
              <button type="button" data-comanda="menos" data-id="${D.esc(p.id)}" aria-label="${l.qtd <= p.qtdMin ? "Tirar do pedido" : `Tirar ${D.passoDe(p)}`}">${D.icone(l.qtd <= p.qtdMin ? "lixo" : "menos")}</button>
              <input class="num" type="number" inputmode="numeric" min="${p.qtdMin}" step="1" value="${l.qtd}" data-comanda-qtd data-id="${D.esc(p.id)}" aria-label="Quantidade de ${D.esc(D.nomeLimpo(p.nome))}">
              <button type="button" data-comanda="somar" data-id="${D.esc(p.id)}" aria-label="Somar ${D.passoDe(p)}">${D.icone("mais")}</button>
            </div>
            <button class="comanda__tirar" type="button" data-comanda="tirar" data-id="${D.esc(p.id)}">${D.icone("lixo")} Tirar</button>
          </div>
        </li>`).join("")}</ul>`
        : `<p class="comanda__vazia">${D.icone("sacola")}Nada ainda. Toque no + dos itens e eles aparecem aqui.</p>`}
      <div class="comanda__pe">
        <div class="total"><span>Total</span><strong class="num repinta" data-total>${D.brl(totalCarrinho())}</strong></div>
        ${falta.length ? `<p class="total__nota total__nota--alerta">Falta escolher ${falta.map(({ p }) => rotuloEscolha(p)).filter((v, i, a) => a.indexOf(v) === i).join(" e ")} em ${falta.map(({ p }) => D.esc(D.nomeLimpo(p.nome))).join(", ")}.</p>` : `<p class="total__nota">Taxa de entrega à parte, informada na confirmação.</p>`}
        <button class="botao botao--largo" type="button" data-continuar ${!qtdLinhas || falta.length ? "disabled" : ""}>Continuar <svg class="icone" aria-hidden="true"><use href="#i-seta"/></svg></button>
      </div>`;
  }
  let totalAnterior = null;
  function atualizarComanda() {
    const total = D.brl(totalCarrinho());
    comandas.forEach(el => {
      const ehFolha = el.hasAttribute("data-folha");
      const rolagem = el.querySelector(".comanda__itens")?.scrollTop || 0;
      el.innerHTML = htmlComanda(ehFolha);
      const lista = el.querySelector(".comanda__itens");
      if (lista) lista.scrollTop = rolagem;
      if (totalAnterior !== null && totalAnterior !== total) {
        const t = el.querySelector("[data-total]");
        t.textContent = totalAnterior;
        D.repintar(t, total);
      }
    });
    const itens = itensDoCarrinho();
    const barra = document.getElementById("barra-pedido");
    barra.classList.toggle("visivel", itens.length > 0);
    barra.querySelector('[data-barra="qtd"]').textContent = itens.length === 1 ? "1 item no pedido" : `${itens.length} itens no pedido`;
    D.repintar(barra.querySelector('[data-barra="total"]'), total);
    totalAnterior = total;
  }
  atualizarComanda();

  /* Mudar e tirar direto na lista do pedido (coluna e folha). O foco volta pro mesmo botão. */
  comandas.forEach(el => {
    el.addEventListener("click", e => {
      const b = e.target.closest("button[data-comanda]");
      if (!b) return;
      const { id } = b.dataset, acao = b.dataset.comanda;
      mudar(id, acao, false);
      const volta = el.querySelector(`button[data-comanda="${acao}"][data-id="${CSS.escape(id)}"]`)
        || el.querySelector(`[data-comanda-qtd][data-id="${CSS.escape(id)}"]`) || el.querySelector("[data-continuar]");
      if (volta && !volta.disabled) volta.focus({ preventScroll: true });
    });
    el.addEventListener("change", e => {
      const inp = e.target.closest("[data-comanda-qtd]");
      if (!inp) return;
      const n = Math.floor(Number(inp.value) || 0);
      definirQtd(inp.dataset.id, n);
      desenharProduto(inp.dataset.id);
      atualizarComanda();
    });
    el.addEventListener("keydown", e => {
      if (e.key === "Enter" && e.target.closest("[data-comanda-qtd]")) { e.preventDefault(); e.target.blur(); }
    });
  });

  /* Folha no celular */
  const folha = document.getElementById("folha");
  const veu = document.getElementById("veu");
  const abrirFolhaBtn = document.getElementById("abrir-folha");
  function abrirFolha() {
    folha.classList.add("aberta"); veu.classList.add("aberto");
    document.querySelector(".recado")?.classList.remove("visivel"); // o aviso não fica em cima da folha
    abrirFolhaBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    setTimeout(() => folha.querySelector("[data-fechar-folha]")?.focus(), 50);
  }
  function fecharFolha() {
    folha.classList.remove("aberta"); veu.classList.remove("aberto");
    abrirFolhaBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  abrirFolhaBtn.addEventListener("click", abrirFolha);
  veu.addEventListener("click", fecharFolha);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && folha.classList.contains("aberta")) { fecharFolha(); abrirFolhaBtn.focus(); } });

  document.addEventListener("click", e => {
    if (e.target.closest("[data-fechar-folha]")) { fecharFolha(); abrirFolhaBtn.focus(); }
    if (e.target.closest("[data-continuar]")) { fecharFolha(); irPara("data"); }
  });

  /* ── Finalizar ── */
  const vistaMontar = document.getElementById("vista-montar");
  const vistaFinalizar = document.getElementById("vista-finalizar");
  const vistaRecebido = document.getElementById("vista-recebido");
  const passos = ["data", "entrega", "revisao"];
  const forms = Object.fromEntries(passos.map(p => [p, document.querySelector(`[data-passo="${p}"]`)]));

  /* Dia e hora: a loja atende das 8h às 19h, em horários de 15 em 15 minutos. Dá pra pedir para
     hoje com pelo menos 1 hora de antecedência. */
  const isoLocal = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const HORARIOS = [];
  for (let m = 8 * 60; m <= 19 * 60; m += 15) HORARIOS.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  const ANTECEDENCIA_MIN = 60;
  const hojeIso = () => isoLocal(new Date());
  const minutos = h => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
  const horariosDe = data => {
    if (data !== hojeIso()) return HORARIOS;
    const d = new Date(), limite = d.getHours() * 60 + d.getMinutes() + ANTECEDENCIA_MIN;
    return HORARIOS.filter(h => minutos(h) >= limite);
  };
  const primeiroDia = () => { const d = new Date(); if (!horariosDe(hojeIso()).length) d.setDate(d.getDate() + 1); return isoLocal(d); };
  const campoData = document.getElementById("f-data");
  const campoHora = document.getElementById("f-hora");
  function preencherHorarios() {
    const antes = campoHora.value;
    const lista = campoData.value ? horariosDe(campoData.value) : HORARIOS;
    campoHora.innerHTML = `<option value="">${lista.length ? "Escolha" : "Sem horário neste dia"}</option>` +
      lista.map(h => `<option value="${h}">${D.hora(h)}</option>`).join("");
    if (lista.includes(antes)) campoHora.value = antes;
  }
  campoData.min = primeiroDia();
  campoData.addEventListener("change", preencherHorarios);
  preencherHorarios();

  /* Dados que o cliente já digitou antes ficam no aparelho. */
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_CLIENTE) || "null");
    if (salvo) {
      document.getElementById("f-nome").value = salvo.nome || "";
      document.getElementById("f-tel").value = salvo.telefone ? D.mascaraTelefone(salvo.telefone) : "";
    }
  } catch (_) { /* segue sem */ }

  function irPara(passo, { empurrar = true } = {}) {
    if (passo === "montar") {
      vistaFinalizar.hidden = true; vistaRecebido.hidden = true; vistaMontar.hidden = false;
      if (empurrar) history.pushState({ passo }, "", "/cardapio");
      return;
    }
    if (!itensDoCarrinho().length || faltaEscolha().length) { irPara("montar", { empurrar }); return; }
    vistaMontar.hidden = true; vistaRecebido.hidden = true; vistaFinalizar.hidden = false;
    passos.forEach(p => { forms[p].hidden = p !== passo; });
    const idx = passos.indexOf(passo);
    document.querySelectorAll("#etapas [data-etapa]").forEach((li, i) => {
      li.classList.toggle("feita", i < idx);
      i === idx ? li.setAttribute("aria-current", "step") : li.removeAttribute("aria-current");
    });
    if (passo === "revisao") montarRevisao();
    if (empurrar) history.pushState({ passo }, "", `#${passo}`);
    window.scrollTo({ top: 0 });
    forms[passo].querySelector("h2").focus({ preventScroll: true });
  }
  window.addEventListener("popstate", e => irPara((e.state && e.state.passo) || "montar", { empurrar: false }));
  history.replaceState({ passo: "montar" }, "", location.pathname + location.hash.replace(/^#(data|entrega|revisao)$/, ""));

  document.querySelectorAll("[data-voltar]").forEach(b => b.addEventListener("click", () => irPara("montar")));
  document.querySelectorAll("[data-ir]").forEach(b => b.addEventListener("click", () => irPara(b.dataset.ir)));

  function erroCampo(id, msg) {
    const inp = document.getElementById(id);
    const p = document.getElementById(`${id}-erro`);
    if (msg) {
      inp.setAttribute("aria-invalid", "true");
      inp.setAttribute("aria-describedby", `${id}-erro`);
      p.textContent = msg; p.hidden = false;
    } else {
      inp.removeAttribute("aria-invalid");
      inp.removeAttribute("aria-describedby");
      p.hidden = true;
    }
    return !!msg;
  }
  function primeiroErro(form) { form.querySelector('[aria-invalid="true"]')?.focus(); }

  forms.data.addEventListener("submit", e => {
    e.preventDefault();
    const data = document.getElementById("f-data").value;
    const hora = document.getElementById("f-hora").value;
    let ruim = false;
    preencherHorarios(); // o relógio andou desde que a lista foi montada
    const semHorarioHoje = data === hojeIso() && !horariosDe(data).length;
    ruim = erroCampo("f-data", !data ? "Escolha o dia da festa" : data < hojeIso() ? "Escolha um dia a partir de hoje"
      : semHorarioHoje ? "Para hoje não há mais horário (pedidos com 1 hora de antecedência, até 19h). Escolha outro dia" : "") || ruim;
    ruim = erroCampo("f-hora", semHorarioHoje ? "" : !hora || !horariosDe(data).includes(hora)
      ? (data === hojeIso() ? "Para hoje, escolha um horário com pelo menos 1 hora de antecedência" : "Escolha um horário entre 8h e 19h") : "") || ruim;
    if (ruim) return primeiroErro(forms.data);
    irPara("entrega");
  });

  /* Entrega */
  const camposEndereco = document.getElementById("campos-endereco");
  function modoAtual() { return forms.entrega.querySelector('input[name="modo"]:checked').value; }
  forms.entrega.addEventListener("change", e => {
    if (e.target.name === "modo") camposEndereco.hidden = modoAtual() !== "entrega";
  });
  const cep = document.getElementById("f-cep");
  cep.addEventListener("input", async () => {
    const d = D.soDigitos(cep.value).slice(0, 8);
    cep.value = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
    if (d.length !== 8) return;
    const ajuda = document.getElementById("f-cep-ajuda");
    ajuda.textContent = "Procurando o CEP…";
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const j = await r.json();
      if (j.erro) throw new Error("cep");
      if (j.logradouro) document.getElementById("f-rua").value = j.logradouro;
      if (j.bairro) document.getElementById("f-bairro").value = j.bairro;
      ajuda.textContent = `${j.localidade || ""}${j.uf ? " · " + j.uf : ""}`;
      document.getElementById(j.logradouro ? "f-numero" : "f-rua").focus();
    } catch (_) {
      ajuda.textContent = "Não achamos esse CEP. Preencha o endereço à mão.";
    }
  });
  forms.entrega.addEventListener("submit", e => {
    e.preventDefault();
    if (modoAtual() === "entrega") {
      let ruim = false;
      ruim = erroCampo("f-rua", !document.getElementById("f-rua").value.trim() ? "Diga a rua" : "") || ruim;
      ruim = erroCampo("f-numero", !document.getElementById("f-numero").value.trim() ? "Diga o número (ou s/n)" : "") || ruim;
      ruim = erroCampo("f-bairro", !document.getElementById("f-bairro").value.trim() ? "Diga o bairro" : "") || ruim;
      if (ruim) return primeiroErro(forms.entrega);
    }
    irPara("revisao");
  });

  function enderecoTexto() {
    const v = id => document.getElementById(id).value.trim();
    return [`${v("f-rua")}, ${v("f-numero")}`, v("f-complemento"), v("f-bairro"), v("f-cep") ? `CEP ${v("f-cep")}` : ""].filter(Boolean).join(" — ");
  }

  /* Revisão */
  const tel = document.getElementById("f-tel");
  tel.addEventListener("input", () => { tel.value = D.mascaraTelefone(tel.value); });

  /* Login Google, obrigatório para mandar (?api=teste dispensa, para testar sem conta). */
  const L = window.DLuhLogin;
  const precisaLogin = !!L && !/[?&]api=teste\b/.test(location.search);
  const contaErro = document.getElementById("conta-erro");
  document.getElementById("conta").hidden = !precisaLogin;
  function mostrarConta(u) {
    document.getElementById("conta-fora").hidden = !!u;
    document.getElementById("conta-dentro").hidden = !u;
    document.getElementById("conta-email").textContent = u ? u.email : "";
    const nome = document.getElementById("f-nome");
    if (u && !nome.value.trim() && u.displayName) nome.value = u.displayName;
    if (u) contaErro.hidden = true;
  }
  if (precisaLogin) {
    L.aoMudar(mostrarConta);
    document.getElementById("botao-google").addEventListener("click", async () => {
      contaErro.hidden = true;
      if (L.naoDeixaGoogle) {
        contaErro.textContent = "O Google não deixa entrar por dentro do Instagram ou do WhatsApp. Abra este site no Chrome ou no Safari (menu ⋯ → Abrir no navegador).";
        contaErro.hidden = false; return;
      }
      try { await L.entrar(); }
      catch (e) {
        if (e && /popup-closed|cancelled-popup/.test(e.code || "")) return;
        console.error("login Google", e && e.code);
        contaErro.textContent = /admin-restricted/.test((e && e.code) || "")
          ? "A loja ainda está liberando o cadastro de clientes. Mande seu pedido pelo WhatsApp por enquanto."
          : "Não deu pra entrar com o Google. Tente de novo.";
        contaErro.hidden = false;
      }
    });
    document.getElementById("botao-trocar-conta").addEventListener("click", async () => { await L.sair(); L.entrar().catch(() => {}); });
  }

  function montarRevisao() {
    const data = document.getElementById("f-data").value;
    const hora = document.getElementById("f-hora").value;
    const modo = modoAtual();
    document.getElementById("campo-topo").hidden = !temBoloDeAro();
    document.getElementById("revisao").innerHTML = `
      <div class="revisao__bloco">
        <h3>Itens <button type="button" data-voltar-itens>Mudar</button></h3>
        <ul class="revisao__itens">${itensDoCarrinho().map(({ p, l }) =>
          `<li><span>${l.qtd} × ${D.esc(D.nomeLimpo(p.nome))}${opcoesDe(p) ? ` <small>(${D.esc(l.escolhas.map(e => e.join(" e ")).join("; "))})</small>` : ""}</span><span class="num">${D.brl(p.valorUnit * l.qtd)}</span></li>`).join("")}</ul>
      </div>
      <div class="revisao__bloco">
        <h3>Quando <button type="button" data-ir-passo="data">Mudar</button></h3>
        <p>${D.esc(D.dataLonga(data))}, ${D.esc(D.hora(hora))}</p>
        <h3>${modo === "entrega" ? "Entrega" : "Retirada na loja"} <button type="button" data-ir-passo="entrega">Mudar</button></h3>
        <p>${modo === "entrega" ? D.esc(enderecoTexto()) : "Você busca na loja na hora marcada."}</p>
      </div>`;
    document.getElementById("revisao-total").textContent = D.brl(totalCarrinho());
    const pode = podeSoEntrada(data);
    document.getElementById("bloco-pagamento").hidden = !pode;
    document.getElementById("pg-entrada-texto").textContent =
      `${D.brl(Math.round(totalCarrinho() / 2))} agora, o resto na ${modo === "entrega" ? "entrega" : "retirada"}`;
    const taxa = modo === "entrega" ? "A taxa de entrega entra na confirmação. " : "";
    document.getElementById("revisao-nota").textContent = pode
      ? `${taxa}O link de pagamento chega pelo WhatsApp depois que a loja confirmar.`
      : `${taxa}Para pedidos de até ${D.brl(LIMITE_ENTRADA)} para hoje ou amanhã, o pagamento é do valor total. O link chega pelo WhatsApp depois que a loja confirmar.`;
  }
  /* Pagar só a entrada (50%) vale para pedido acima de R$ 100 ou para daqui a mais de 1 dia.
     O servidor confere a mesma regra. */
  const LIMITE_ENTRADA = 10000;
  function podeSoEntrada(data) {
    const depoisDeAmanha = new Date(); depoisDeAmanha.setDate(depoisDeAmanha.getDate() + 2);
    return totalCarrinho() > LIMITE_ENTRADA || data >= isoLocal(depoisDeAmanha);
  }
  const entradaEscolhida = data => podeSoEntrada(data) && forms.revisao.querySelector('input[name="pagamento"]:checked')?.value === "50" ? 50 : 100;
  document.getElementById("revisao").addEventListener("click", e => {
    if (e.target.closest("[data-voltar-itens]")) irPara("montar");
    const b = e.target.closest("[data-ir-passo]");
    if (b) irPara(b.dataset.irPasso);
  });

  let enviando = false;
  forms.revisao.addEventListener("submit", async e => {
    e.preventDefault();
    if (enviando) return;
    const nome = document.getElementById("f-nome").value.trim();
    const telefone = D.soDigitos(tel.value);
    let ruim = false;
    ruim = erroCampo("f-nome", !nome ? "Diga seu nome" : "") || ruim;
    ruim = erroCampo("f-tel", telefone.length < 10 ? "Confira o WhatsApp com DDD, ex.: (38) 99999-9999" : "") || ruim;
    if (precisaLogin && !L.usuario()) {
      contaErro.textContent = "Entre com sua conta Google para mandar o pedido.";
      contaErro.hidden = false;
      document.getElementById("botao-google").focus();
      return;
    }
    if (ruim) return primeiroErro(forms.revisao);

    const topo = document.getElementById("f-topo").value.trim();
    let topoUsado = false;
    const itens = [];
    for (const { p, l } of itensDoCarrinho()) {
      const base = { nome: D.nomeLimpo(p.nome), valorUnit: p.valorUnit, produtoId: p.id, categoria: p.categoria };
      if (opcoesDe(p)) {
        l.escolhas.forEach(esc => {
          const item = { ...base, qtd: 1, recheios: esc };
          if (topo && !topoUsado && D.ehBolo(p)) { item.topo = { tema: topo }; topoUsado = true; }
          itens.push(item);
        });
      } else itens.push({ ...base, qtd: l.qtd });
    }
    const modo = modoAtual();
    const dados = {
      cliente: { nome, telefone },
      entrega: { modo, data: document.getElementById("f-data").value, hora: document.getElementById("f-hora").value, ...(modo === "entrega" ? { endereco: enderecoTexto() } : {}) },
      itens,
      entradaPct: entradaEscolhida(document.getElementById("f-data").value),
      obs: document.getElementById("f-obs").value.trim()
    };

    const botao = document.getElementById("botao-enviar");
    const erro = document.getElementById("erro-envio");
    enviando = true; erro.hidden = true;
    botao.disabled = true; botao.textContent = "Mandando…";
    try {
      const { id } = await API.criarPedido(dados);
      try { localStorage.setItem(CHAVE_CLIENTE, JSON.stringify({ nome, telefone })); } catch (_) { /* nada */ }
      mostrarRecebido(id, dados);
      carrinho = { linhas: {}, topo: "", atualizado: 0 };
      D.limparCarrinho();
      D.atualizarSacola();
      atualizarComanda();
      produtos.forEach(p => desenharProduto(p.id));
    } catch (err) {
      // Recusa do servidor com motivo (mínimo, item que saiu do cardápio, muitas tentativas): mostra o motivo.
      const motivo = ["invalid-argument", "failed-precondition", "limite"].includes(err && err.codigo) ? `${D.esc(err.message)}. ` : "";
      erro.innerHTML = `${D.icone("alerta")}<span>O pedido não foi. ${motivo || "Confira a internet e tente de novo; "}se continuar, mande pelo <a href="${D.linkWhats("Oi! Tentei fazer um pedido pelo site e não consegui.")}" target="_blank" rel="noopener">WhatsApp</a>.</span>`;
      erro.hidden = false;
    } finally {
      enviando = false; botao.disabled = false; botao.textContent = "Mandar pedido";
    }
  });

  function mostrarRecebido(id, dados) {
    const total = dados.itens.reduce((s, it) => s + it.qtd * it.valorUnit, 0);
    document.getElementById("ficha").innerHTML = `
      <div class="ficha__numero"><span>Pedido</span><strong class="num">${D.esc(id)}</strong></div>
      <dl>
        <dt>Dia</dt><dd>${D.esc(D.dataCurta(dados.entrega.data))} · ${D.esc(D.hora(dados.entrega.hora))}</dd>
        <dt>${dados.entrega.modo === "entrega" ? "Entrega" : "Retirada"}</dt><dd>${dados.entrega.modo === "entrega" ? "no endereço" : "na loja"}</dd>
        <dt>Itens</dt><dd class="num">${D.brl(total)}</dd>
        <dt>Situação</dt><dd>Aguardando confirmação</dd>
      </dl>`;
    document.getElementById("recebido-whats").href = D.linkWhats(`Oi! Acabei de fazer o pedido ${id} pelo site.`);
    document.getElementById("recebido-acompanhar").href = `/pedido?n=${encodeURIComponent(id)}`;
    vistaMontar.hidden = true; vistaFinalizar.hidden = true; vistaRecebido.hidden = false;
    history.replaceState({ passo: "montar" }, "", "/cardapio");
    window.scrollTo({ top: 0 });
    document.getElementById("titulo-recebido").focus({ preventScroll: true });
  }

  /* Veio de um link com #categoria: rola até ela depois de desenhar. */
  if (location.hash && document.getElementById(location.hash.slice(1))) {
    requestAnimationFrame(() => document.getElementById(location.hash.slice(1)).scrollIntoView());
  }
});
