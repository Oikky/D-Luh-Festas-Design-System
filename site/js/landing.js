/* Landing: vídeo da abertura, categorias com foto, preferidos (com +), bolos por aro e a galeria
   do salão. Tudo sai do catálogo e da lista de mídia; sem eles o HTML fica de pé. */
(window.DLuhDepoisDoCatalogo || (fn => fn()))(function () {
  "use strict";
  const D = window.DLuh;
  const cat = window.DLUH_CATALOGO;
  const midia = window.DLUH_MIDIA || { galeria: [] };
  if (!D) return;

  /* Chuva de fotos da abertura: dá pra pausar; quem pediu menos movimento já vê parado. */
  const banner = document.getElementById("banner-abertura");
  const pausa = document.getElementById("pausa-video");
  const menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (banner && pausa) {
    const videos = [...banner.querySelectorAll("video")];
    const marcar = parado => {
      banner.classList.toggle("parado", parado);
      videos.forEach(v => (parado ? v.pause() : v.play().catch(() => {})));
      pausa.setAttribute("aria-label", parado ? "Continuar animação" : "Pausar animação");
      pausa.innerHTML = D.icone(parado ? "play" : "pausa");
    };
    if (menosMovimento.matches) { marcar(true); pausa.hidden = true; }
    pausa.addEventListener("click", () => marcar(!banner.classList.contains("parado")));
  }

  if (!cat) return;
  const produtos = cat.produtos.filter(p => !/^test$/i.test(p.nome));
  const categorias = D.categoriasDoCatalogo(produtos);
  const precisaEscolha = p => D.ehPacote(p) || (D.ehBolo(p) && /aro\s*\d+/i.test(p.nome));

  function precoDe(p) {
    return p.qtdMin >= 25
      ? { valor: D.brlPlaca(p.valorUnit * 100), sufixo: "o cento" }
      : { valor: D.brlPlaca(p.valorUnit), sufixo: p.qtdMin > 1 ? `mínimo ${p.qtdMin}` : "a unidade" };
  }
  function foto(p, classeVazia) {
    return p.imagem
      ? `<img src="${D.esc(p.imagem)}" alt="" loading="lazy" decoding="async" width="225" height="225" data-sem-foto>`
      : `<span class="${classeVazia}" aria-hidden="true">${D.semFoto()}</span>`;
  }
  document.addEventListener("error", e => {
    const img = e.target;
    if (img.tagName !== "IMG" || !img.hasAttribute("data-sem-foto")) return;
    img.parentElement.classList.add("card__foto--vazia");
    img.outerHTML = D.semFoto();
  }, true);

  /* Categorias com a melhor foto de cada uma. */
  const agrupadas = [
    { nome: "Salgados", tipos: ["Salgado Frito", "Assado", "Salgado Especial"], slug: "salgados-fritos", prefere: /coxinha/i },
    { nome: "Docinhos", tipos: ["Doce", "Doce Goumert"], slug: "docinhos", prefere: /brigadeiro/i },
    { nome: "Bolos", tipos: ["Bolo"], slug: "bolos", prefere: /aro 18|aro 20/i },
    { nome: "Lanches", tipos: ["Lanches"], slug: "lanches", prefere: /hamb/i },
    { nome: "Congelados", tipos: ["Pacote Congelado"], slug: "congelados", prefere: /salgado/i }
  ];
  document.getElementById("categorias-foto").innerHTML = agrupadas.map(g => {
    const lista = produtos.filter(p => g.tipos.includes(p.categoria));
    if (!lista.length) return "";
    /* Pacote sem foto própria usa a foto de um dos salgados que vão dentro dele. */
    const dentro = lista.flatMap(p => p.tiposPacote || []);
    const reserva = produtos.filter(p => dentro.includes(p.categoria) && p.imagem);
    const capa = lista.find(p => p.imagem && g.prefere.test(p.nome)) || lista.find(p => p.imagem) || reserva.find(p => /bolinha|kibe|risol/i.test(p.nome)) || reserva[0] || lista[0];
    const menor = Math.min(...lista.map(p => (p.qtdMin >= 25 ? p.valorUnit * 100 : p.valorUnit)));
    return `<li class="cat-foto"><a href="/cardapio#${g.slug}">
      <span class="cat-foto__img">${foto(capa, "card__foto--vazia")}</span>
      <strong>${g.nome}</strong><span class="num">a partir de ${D.brlPlaca(menor)}</span>
    </a></li>`;
  }).join("");

  /* Preferidos: os marcados como populares com foto; + põe no pedido. */
  const preferidos = produtos.filter(p => p.destaque && p.imagem).slice(0, 8);
  const alvo = document.getElementById("preferidos");
  if (!preferidos.length) alvo.closest("section").hidden = true;
  function desenharPreferidos() {
    const carrinho = D.lerCarrinho();
    alvo.innerHTML = preferidos.map(p => {
      const pr = precoDe(p);
      const qtd = carrinho.linhas[p.id]?.qtd || 0;
      const nome = D.nomeLimpo(p.nome);
      const c = categorias.find(c => c.tipo === p.categoria);
      return `<li class="card">
        <div class="card__foto">${foto(p, "")}</div>
        ${qtd ? `<span class="selo selo--verde num">${qtd} no pedido</span>` : ""}
        <div class="card__corpo">
          <h3 class="card__nome">${D.esc(nome)}</h3>
          ${p.descricao ? `<p class="card__desc">${D.esc(p.descricao.replace(/!$/, ""))}</p>` : ""}
          <div class="card__pe">
            <p class="card__preco num"><strong>${pr.valor}</strong><small>${pr.sufixo}</small></p>
            ${precisaEscolha(p)
              ? `<a class="mais" href="/cardapio#${c ? c.slug : ""}" aria-label="Escolher ${D.esc(nome)} no cardápio">${D.icone("seta")}</a>`
              : `<button class="mais" type="button" data-somar="${p.id}" aria-label="Pôr ${p.qtdMin > 1 ? p.qtdMin + " " : ""}${D.esc(nome)} no pedido">${D.icone("mais")}</button>`}
          </div>
        </div>
      </li>`;
    }).join("");
  }
  desenharPreferidos();
  alvo.addEventListener("click", e => {
    const b = e.target.closest("[data-somar]");
    if (!b) return;
    const p = produtos.find(x => x.id === b.dataset.somar);
    const carrinho = D.lerCarrinho();
    const atual = carrinho.linhas[p.id]?.qtd || 0;
    carrinho.linhas[p.id] = { qtd: atual ? atual + D.passoDe(p) : p.qtdMin, escolhas: [] };
    D.salvarCarrinho(carrinho);
    D.atualizarSacola();
    desenharPreferidos();
    alvo.querySelector(`[data-somar="${p.id}"]`)?.focus({ preventScroll: true });
    D.recado(`${carrinho.linhas[p.id].qtd} ${D.nomeLimpo(p.nome)} no pedido`, { href: "/cardapio", texto: "Ver pedido" });
  });

  /* Aros: círculo proporcional ao diâmetro, todos na mesma base. */
  const aros = produtos
    .map(p => ({ p, aro: Number((p.nome.match(/aro\s*(\d+)/i) || [])[1]) }))
    .filter(x => x.aro)
    .sort((a, b) => a.aro - b.aro);
  const maior = Math.max(...aros.map(x => x.aro), 30);
  document.getElementById("aros").innerHTML = aros.map(({ p, aro }) => {
    const r = Math.round((aro / maior) * 54);
    const cy = 116 - r;
    const serve = (p.descricao || "").replace(/!$/, "").replace(/^Serve de/i, "Serve");
    return `<li class="aro">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="${cy}" r="${r}" fill="#f7e3dc"/>
        <circle cx="60" cy="${cy}" r="${Math.max(r - 7, 3)}" fill="none" stroke="#c0725a" stroke-width="2" stroke-dasharray="1 5" stroke-linecap="round"/>
      </svg>
      <span class="aro__nome">Aro ${aro}</span>
      <span class="aro__serve">${D.esc(serve)}</span>
      <span class="aro__valor num">${D.brlPlaca(p.valorUnit)}</span>
    </li>`;
  }).join("");

  /* Galeria do salão (D' Roma Festas). */
  const galeria = document.getElementById("galeria");
  if (!midia.galeria.length) galeria.hidden = true;
  galeria.innerHTML = midia.galeria.map((m, i) => `<li class="${m.alto ? "alto" : ""}">
    ${m.video
      ? `<video src="${D.esc(m.video)}" poster="${D.esc(m.src)}" muted loop playsinline preload="none" data-galeria-video aria-label="${D.esc(m.legenda || "Vídeo do salão")}"></video>`
      : `<img src="${D.esc(m.src)}" alt="${D.esc(m.alt || "")}" loading="lazy" decoding="async">`}
    ${m.legenda ? `<span class="galeria__legenda">${D.esc(m.legenda)}</span>` : ""}
  </li>`).join("");
  /* Vídeos da galeria só tocam quando aparecem na tela. */
  if (!menosMovimento.matches && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver(ents => ents.forEach(en => (en.isIntersecting ? en.target.play().catch(() => {}) : en.target.pause())), { threshold: 0.4 });
    galeria.querySelectorAll("[data-galeria-video]").forEach(v => obs.observe(v));
  }
});
