/* Abertura da landing: um pincel pinta o D da D'Luh no meio da tela; enquanto "’Luh Festas" é escrito,
   o D desliza pro lado e o conjunto fica centrado. O nome se apaga, o D volta ao centro e derrete numa
   gota dourada que escorre até o cantinho do topo; ali o pincel repinta o D e a página ondula, como
   água onde a gota caiu. Uma vez por sessão; pula com clique, Esc ou o botão; quem pediu menos movimento
   não vê. ?intro=1 força. */
(function () {
  "use strict";
  const Marca = window.DLuhMarca;
  if (!Marca || !Element.prototype.animate) return;

  const CHAVE = "dluh_intro_vista";
  const forcar = /[?&]intro=1\b/.test(location.search);
  let jaViu = false;
  try { jaViu = sessionStorage.getItem(CHAVE) === "1"; } catch (_) { /* mostra */ }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (jaViu && !forcar) return;
  try { sessionStorage.setItem(CHAVE, "1"); } catch (_) { /* segue */ }

  const EASE_IO = "cubic-bezier(0.77, 0, 0.175, 1)";
  const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
  const raiz = document.documentElement;
  raiz.classList.add("intro-ativa");

  const intro = document.createElement("div");
  intro.className = "intro";
  intro.setAttribute("aria-hidden", "true");
  intro.innerHTML = `
    <div class="intro__palco">
      <div class="intro__d">${Marca.svgMarca("marca__svg", { animada: true })}</div>
      <div class="intro__nome">’Luh <span>Festas</span></div>
    </div>`;
  const pular = document.createElement("button");
  pular.className = "intro__pular";
  pular.type = "button";
  pular.textContent = "Pular";
  document.body.append(intro, pular);

  const palco = intro.querySelector(".intro__palco");
  const caixaD = intro.querySelector(".intro__d");
  const svgD = caixaD.querySelector("svg");
  const nome = intro.querySelector(".intro__nome");
  const animacoes = [];
  const anima = (el, q, o) => { const a = el.animate(q, { fill: "forwards", ...o }); animacoes.push(a); return a; };
  const espera = ms => new Promise(r => setTimeout(r, ms));
  let ondas = null;

  let acabou = false;
  function terminar() {
    if (acabou) return;
    acabou = true;
    animacoes.forEach(a => { try { a.cancel(); } catch (_) { /* nada */ } });
    if (ondas) ondas.parar();
    intro.remove(); pular.remove();
    document.querySelector(".intro__gota")?.remove();
    raiz.classList.remove("intro-ativa");
    document.removeEventListener("keydown", tecla);
    const destino = document.querySelector(".topo [data-marca-d]");
    if (destino && !destino.querySelector("svg")) Marca.montar();
  }
  function tecla(e) { if (["Escape", "Enter", " "].includes(e.key)) terminar(); }
  intro.addEventListener("click", terminar);
  pular.addEventListener("click", terminar);
  document.addEventListener("keydown", tecla);

  /* Quanto o palco precisa andar pra o D ficar no meio da tela (o nome já ocupa o lugar dele, só está oculto). */
  function desvioAoCentro() {
    const r = caixaD.getBoundingClientRect();
    return { x: innerWidth / 2 - (r.left + r.width / 2), y: innerHeight / 2 - (r.top + r.height / 2) };
  }

  async function rodar() {
    /* 1. O D, sozinho no meio, é pintado (ritmo ~30% mais rápido que o do editor). */
    const RITMO = 0.7;
    const c = desvioAoCentro();
    const noCentro = `translate(${c.x}px, ${c.y}px)`;
    palco.style.transform = noCentro;
    const pintura = Marca.pintar(svgD, RITMO);
    await espera(3500 * RITMO);
    if (acabou) return;

    /* 2. O nome é escrito com a borda em degradê, e o D desliza pro lado no mesmo ritmo. */
    const ESCRITA = 1300;
    anima(nome, [{ maskPosition: "100% 0" }, { maskPosition: "0% 0" }], { duration: ESCRITA, easing: EASE_IO });
    anima(nome, [{ opacity: 0.4 }, { opacity: 1 }], { duration: ESCRITA * 0.6, easing: EASE_OUT });
    anima(palco, [{ transform: noCentro }, { transform: "translate(0px, 0px)" }], { duration: ESCRITA, easing: EASE_IO });
    await pintura;
    await espera(600);
    if (acabou) return;

    /* 3. O nome se apaga do fim pro começo e o D volta ao centro. */
    const APAGA = 850;
    anima(nome, [{ maskPosition: "0% 0" }, { maskPosition: "100% 0" }], { duration: APAGA, easing: EASE_IO });
    await anima(palco, [{ transform: "translate(0px, 0px)" }, { transform: noCentro }], { duration: APAGA, easing: EASE_IO }).finished;
    if (acabou) return;
    const destino = document.querySelector(".topo [data-marca-d]");
    if (!destino) return terminar();

    /* 4. O D derrete numa gota que escorre até o topo; lá o pincel repinta o D e a página ondula. */
    await gota(destino);
    if (acabou) return;
    await espera(ondas ? ondas.duracao - 250 : 0);
    terminar();
  }

  /* A gota: uma cópia do D num SVG por cima de tudo, com filtro "gooey" (desfoque + corte de alfa).
     O D encolhe pro centro e o desfoque cresce: as partes finas (laço, chapéu) somem primeiro e o
     grosso se junta numa gota, que corre em curva até o lugar do D no topo, esticando com a
     velocidade. Uma linha do tempo só, sem paradas: derreter, correr e repintar se sobrepõem. */
  function gota(destino) {
    return new Promise(resolve => {
      const ns = "http://www.w3.org/2000/svg";
      const de = caixaD.getBoundingClientRect(), para = destino.getBoundingClientRect();
      const cx = de.left + de.width * 0.52, cy = de.top + de.height * 0.74;
      const px = para.left + para.width * 0.5, py = para.top + para.height * 0.55;
      const R = de.width * 0.11, rFim = para.height * 0.3;
      const tela = document.createElementNS(ns, "svg");
      tela.setAttribute("class", "intro__gota");
      tela.setAttribute("aria-hidden", "true");
      tela.setAttribute("viewBox", `0 0 ${innerWidth} ${innerHeight}`);
      tela.innerHTML = `
        <defs>
          <filter id="dluh-goo" filterUnits="userSpaceOnUse" x="0" y="0" width="${innerWidth}" height="${innerHeight}" color-interpolation-filters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.001"/>
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/>
          </filter>
          <radialGradient id="dluh-gota-ouro" cx="38%" cy="32%" r="75%">
            <stop offset="0" stop-color="#f7e6ae"/><stop offset=".45" stop-color="#d9b45e"/><stop offset="1" stop-color="#9a7429"/>
          </radialGradient>
        </defs>
        <g filter="url(#dluh-goo)">
          <g class="gota__d"></g>
          <ellipse class="gota__pingo" rx="0" ry="0" fill="url(#dluh-gota-ouro)"/>
        </g>`;
      const gD = tela.querySelector(".gota__d");
      gD.innerHTML = Marca.svgMarca("");
      const copia = gD.firstElementChild;
      [["x", de.left], ["y", de.top], ["width", de.width], ["height", de.height]].forEach(([k, v]) => copia.setAttribute(k, v));
      const borrao = tela.querySelector("feGaussianBlur");
      const alfa = tela.querySelector("feColorMatrix");
      const pingo = tela.querySelector(".gota__pingo");
      document.body.appendChild(tela);
      caixaD.style.visibility = "hidden";

      const liso = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
      const io = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      /* caminho: sobe primeiro e depois curva pro topo, como um fio escorrendo */
      const kx = cx + (px - cx) * 0.15, ky = py + (cy - py) * 0.1;
      const ponto = u => [(1 - u) * (1 - u) * cx + 2 * u * (1 - u) * kx + u * u * px, (1 - u) * (1 - u) * cy + 2 * u * (1 - u) * ky + u * u * py];
      const DERRETE = 750, CORRE_INI = 620, CORRE = 850, TOTAL = CORRE_INI + CORRE + 350;
      let inicio = null, ultimo = [cx, cy], repintou = false, fundoSumiu = false;

      function quadro(agora) {
        if (acabou) { tela.remove(); return resolve(); }
        if (inicio === null) inicio = agora;
        const t = agora - inicio;
        /* derreter: primeiro amolece (desfoque + corte de alfa), depois escorre pra baixo, achatando
           mais na altura que na largura, e o que sobra vira a gota */
        const kd = io(Math.min(1, Math.max(0, (t - 120) / DERRETE)));
        const sx = 1 - 0.84 * kd, sy = 1 - 0.94 * kd;
        gD.setAttribute("transform", `translate(${cx} ${cy}) scale(${sx} ${sy}) translate(${-cx} ${-cy})`);
        gD.style.opacity = String(1 - liso(0.75, 1, kd));
        const corte = liso(0, 220, t);
        borrao.setAttribute("stdDeviation", Math.max(0.001, 14 * liso(0, DERRETE * 0.7, t)).toFixed(3));
        alfa.setAttribute("values", `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${1 + 21 * corte} ${-9 * corte}`);
        /* correr: a gota segue a curva e estica na direção do movimento */
        const u = io(Math.min(1, Math.max(0, (t - CORRE_INI) / CORRE)));
        const [x, y] = ponto(u);
        const vel = Math.hypot(x - ultimo[0], y - ultimo[1]);
        const ang = Math.atan2(y - ultimo[1], x - ultimo[0]) * 180 / Math.PI;
        ultimo = [x, y];
        const r = (R + (rFim - R) * u) * liso(250, 700, t) * (1 - liso(CORRE_INI + CORRE - 60, TOTAL, t));
        const estica = 1 + Math.min(0.9, vel * 0.045);
        pingo.setAttribute("cx", x); pingo.setAttribute("cy", y);
        pingo.setAttribute("rx", (r * estica).toFixed(2)); pingo.setAttribute("ry", (r / Math.sqrt(estica)).toFixed(2));
        pingo.setAttribute("transform", vel > 0.3 ? `rotate(${ang} ${x} ${y})` : "");
        /* o fundo some enquanto a gota corre, revelando a página */
        if (!fundoSumiu && t > CORRE_INI) {
          fundoSumiu = true;
          anima(intro, [{ backgroundColor: getComputedStyle(intro).backgroundColor }, { backgroundColor: "rgba(253, 243, 240, 0)" }],
            { duration: 700, easing: EASE_OUT });
          anima(pular, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 });
        }
        /* a gota chegando: o pincel começa a repintar a partir dela e a água ondula dali */
        if (!repintou && t > CORRE_INI + CORRE - 120) {
          repintou = true;
          destino.innerHTML = Marca.svgMarca("marca__svg", { animada: true });
          raiz.classList.remove("intro-ativa");
          Marca.pintar(destino.querySelector("svg"), 0.32);
          ondas = ondular([document.querySelector(".topo"), document.getElementById("conteudo")].filter(Boolean), px, py);
        }
        if (t < TOTAL) { requestAnimationFrame(quadro); return; }
        tela.remove();
        intro.style.visibility = "hidden";
        resolve();
      }
      requestAnimationFrame(quadro);
    });
  }

  /* Ondulação de água: um mapa de anéis (canvas) desloca os pixels da página por um filtro SVG.
     Os anéis crescem mudando só o tamanho da imagem do mapa, e a força cai até zero; nada é
     redesenhado por quadro. */
  function ondular(elementos, cx, cy) {
    const DURACAO = 1900;
    const mapa = mapaDeAneis(256);
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "intro__filtros");
    svg.setAttribute("aria-hidden", "true");
    document.body.appendChild(svg);
    const alvos = elementos.map((el, i) => {
      const r = el.getBoundingClientRect();
      const id = "dluh-onda-" + i;
      const alto = Math.max(1, Math.min(r.height, innerHeight - r.top));
      svg.insertAdjacentHTML("beforeend", `
        <filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="0" width="${r.width}" height="${alto}" color-interpolation-filters="sRGB">
          <feFlood flood-color="rgb(128,128,128)" result="neutro"/>
          <feImage href="${mapa}" preserveAspectRatio="none" result="aneis"/>
          <feMerge result="mapa"><feMergeNode in="neutro"/><feMergeNode in="aneis"/></feMerge>
          <feDisplacementMap in="SourceGraphic" in2="mapa" scale="0" xChannelSelector="R" yChannelSelector="G"/>
        </filter>`);
      const f = svg.lastElementChild;
      el.style.filter = `url(#${id})`;
      return { el, img: f.querySelector("feImage"), desloc: f.querySelector("feDisplacementMap"), lx: cx - r.left, ly: cy - r.top };
    });
    const alcance = Math.hypot(innerWidth, innerHeight) * 2.3;
    let inicio = null, rodando = true;
    function quadro(agora) {
      if (!rodando) return;
      if (inicio === null) inicio = agora;
      const k = Math.min(1, (agora - inicio) / DURACAO);
      /* começa já com anéis largos (anel miúdo com força alta rasga o texto) e a força só cai */
      const tam = alcance * (0.22 + 0.78 * (1 - Math.pow(1 - k, 2.2)));
      const forca = 26 * Math.pow(1 - k, 1.5);
      alvos.forEach(a => {
        a.img.setAttribute("x", a.lx - tam / 2); a.img.setAttribute("y", a.ly - tam / 2);
        a.img.setAttribute("width", tam); a.img.setAttribute("height", tam);
        a.desloc.setAttribute("scale", forca.toFixed(2));
      });
      if (k < 1) requestAnimationFrame(quadro); else parar();
    }
    function parar() {
      if (!rodando) return;
      rodando = false;
      alvos.forEach(a => { a.el.style.filter = ""; });
      svg.remove();
    }
    requestAnimationFrame(quadro);
    return { parar, duracao: DURACAO };
  }

  /* Anéis concêntricos: vermelho = desloca em x, verde = em y (128 = parado). A frente da onda (borda)
     é a mais forte; pra dentro, a água já vai se acalmando. */
  function mapaDeAneis(n) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = n;
    const ctx = cv.getContext("2d");
    const img = ctx.createImageData(n, n);
    const suave = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const ux = (x + 0.5) / n * 2 - 1, uy = (y + 0.5) / n * 2 - 1;
        const r = Math.hypot(ux, uy) || 1e-6;
        const env = suave(0.05, 0.8, r) * (1 - suave(0.86, 1, r));
        const d = Math.sin(r * 5.5 * Math.PI * 2) * env;
        const i = (y * n + x) * 4;
        img.data[i] = 128 + 127 * d * ux / r;
        img.data[i + 1] = 128 + 127 * d * uy / r;
        img.data[i + 2] = 128;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return cv.toDataURL("image/png");
  }

  const comecar = () => rodar().catch(terminar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(comecar);
  else comecar();
})();
