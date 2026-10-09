/* Landing como um vídeo que anda com a rolagem (GSAP + ScrollTrigger + SplitText, em js/vendor).
   Sem GSAP ou com "reduzir movimento" ligado, a página fica estática e completa. */
(window.DLuhDepoisDoCatalogo || (fn => fn()))(function () {
  "use strict";
  const gsap = window.gsap, ST = window.ScrollTrigger, D = window.DLuh;
  if (!gsap || !ST || !D) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.registerPlugin(ST);
  /* No celular a barra de endereço some e volta ao rolar; sem isto as cenas presas recalculam e pulam. */
  ST.config({ ignoreMobileResize: true });
  /* O topo (cabeçalho) é fixo: as cenas presas param logo abaixo dele, não por baixo. */
  const alturaTopo = () => (document.querySelector(".topo")?.offsetHeight || 0);
  document.documentElement.classList.add("com-cenas");

  /* Barra de progresso no topo, como a linha do tempo de um vídeo. */
  gsap.to(".progresso", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  /* 1. A abertura se afasta: o painel encolhe e o texto sobe. */
  gsap.to(".banner", { scale: 0.92, borderRadius: 48, ease: "none", scrollTrigger: { trigger: ".abertura", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".banner__texto", { yPercent: -18, opacity: 0.15, ease: "none", scrollTrigger: { trigger: ".abertura", start: "top top", end: "bottom top", scrub: true } });

  /* Títulos das seções: as palavras sobem por trás de uma máscara, uma vez, quando entram na tela. */
  if (window.SplitText) {
    gsap.registerPlugin(window.SplitText);
    const titulos = [...document.querySelectorAll("main .secao .titulo")];
    const partir = () => titulos.forEach(t => {
      const sp = window.SplitText.create(t, { type: "lines,words", mask: "lines", linesClass: "titulo__linha" });
      gsap.from(sp.words, { yPercent: 110, duration: 0.8, stagger: 0.05, ease: "power3.out", scrollTrigger: { trigger: t, start: "top 88%", once: true } });
    });
    if (document.fonts) document.fonts.ready.then(partir); else partir();
  }

  /* 2. As categorias sobem uma a uma. */
  gsap.from(".cat-foto", { y: 90, opacity: 0, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: "#categorias-foto", start: "top 90%", end: "top 45%", scrub: 0.8 } });

  /* 3. Preferidos: a vitrine anda de lado enquanto você rola (só em tela larga). */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 900px)", () => {
    const cena = document.getElementById("preferidos-cena");
    const trilho = document.getElementById("preferidos");
    if (!cena || !trilho) return;
    const distancia = () => Math.max(0, trilho.scrollWidth - trilho.parentElement.clientWidth);
    gsap.to(trilho, {
      x: () => -distancia(), ease: "none",
      scrollTrigger: { trigger: cena, start: () => `top ${alturaTopo()}px`, end: () => "+=" + distancia(), pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 }
    });
  });

  /* 4. O bolo cresce do aro 13 ao 30 conforme a rolagem. */
  const cat = window.DLUH_CATALOGO;
  const cenaBolo = document.getElementById("cena-bolo");
  if (cat && cenaBolo) {
    const aros = cat.produtos
      .map(p => ({ p, aro: Number((p.nome.match(/aro\s*(\d+)/i) || [])[1]) }))
      .filter(x => x.aro).sort((a, b) => a.aro - b.aro);
    if (aros.length) {
      cenaBolo.hidden = false;
      const maior = aros[aros.length - 1].aro;
      const bolo = cenaBolo.querySelector(".cena-bolo__bolo");
      const recheio = cenaBolo.querySelector(".cena-bolo__recheio");
      const corte = cenaBolo.querySelector(".cena-bolo__corte");
      const foto = cenaBolo.querySelector(".cena-bolo__foto");
      const el = k => cenaBolo.querySelector(`[data-bolo="${k}"]`);
      el("marcas").innerHTML = aros.map(() => "<li></li>").join("");
      const marcas = [...el("marcas").children];
      let atual = -1, bolo3d = null;
      const mostrar = i => {
        if (i === atual) return;
        atual = i;
        const { p, aro } = aros[i];
        const r = 30 + (aro / maior) * 62;
        gsap.to(bolo, { attr: { r }, duration: 0.5, ease: "power3.out" });
        gsap.to([recheio, corte], { attr: { r }, duration: 0.5, ease: "power3.out" });
        /* A foto do próprio bolo dentro do círculo, do tamanho do aro. */
        if (p.imagem && foto) {
          foto.setAttribute("href", p.imagem);
          gsap.fromTo(foto, { opacity: 0.2 }, { opacity: 1, duration: 0.45, ease: "power2.out" });
        }
        el("aro").textContent = aro;
        el("serve").textContent = (p.descricao || "").replace(/!$/, "").replace(/^Serve de/i, "Serve");
        el("preco").textContent = D.brlPlaca(p.valorUnit);
        marcas.forEach((m, k) => m.classList.toggle("ativo", k <= i));
        if (bolo3d) bolo3d.definir(aro / maior, p.imagem);
      };
      /* Bolo em 3D (Three.js), baixado só quando a seção chega perto. Sem WebGL, fica o círculo em SVG. */
      const temWebGL = (() => { try { return !!document.createElement("canvas").getContext("webgl2"); } catch (e) { return false; } })();
      if (temWebGL) ST.create({
        trigger: "#bolos-cena", start: "top bottom+=600", once: true,
        onEnter: () => import("./bolo3d.js?v=24").then(({ criarBolo3D }) => {
          bolo3d = criarBolo3D(cenaBolo.querySelector(".cena-bolo__prato"));
          cenaBolo.classList.add("cena-bolo--3d");
          const { aro, p } = aros[Math.max(0, atual)];
          bolo3d.definir(aro / maior, p.imagem);
        }).catch(() => {})
      });
      mostrar(0);
      ST.create({
        trigger: "#bolos-cena", start: () => `top ${alturaTopo()}px`, end: () => "+=" + aros.length * 150, pin: true, scrub: true,
        anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: self => mostrar(Math.min(aros.length - 1, Math.floor(self.progress * aros.length)))
      });
    }
  }

  /* Preferidos no celular (sem a vitrine presa): os cards entram em sequência. */
  mm.add("(max-width: 899px)", () => {
    ST.batch("#preferidos > li", { start: "top 92%", once: true,
      onEnter: els => gsap.from(els, { y: 36, opacity: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" }) });
  });

  /* 5. Como pedir: os passos acendem em sequência. */
  gsap.from(".passo", { opacity: 0.2, y: 40, stagger: 0.25, ease: "power2.out", scrollTrigger: { trigger: ".passos", start: "top 85%", end: "top 35%", scrub: 0.8 } });

  /* 6. Salão: as fotos da galeria andam em velocidades diferentes (profundidade). */
  document.querySelectorAll("#galeria li").forEach((li, i) => {
    const forca = [28, -16, 40, -22, 18, -32][i % 6];
    gsap.fromTo(li, { y: forca }, { y: -forca, ease: "none", scrollTrigger: { trigger: "#salao", start: "top bottom", end: "bottom top", scrub: true } });
  });
  gsap.from(".salao__texto > *", { y: 50, opacity: 0, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: "#salao", start: "top 80%", end: "top 40%", scrub: 0.8 } });

  /* Recalcula depois que fotos e fontes chegam (as alturas mudam). */
  if (document.readyState === "complete") ST.refresh(); else window.addEventListener("load", () => ST.refresh());
  if (document.fonts) document.fonts.ready.then(() => ST.refresh());
});
