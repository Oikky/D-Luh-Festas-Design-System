/* Marca D em camadas, desenhada a partir de um modelo de pontos de controle (marca-dados.js):
   - corpo: o D (letra fixa, com deslocamento/escala), o chapéu e a faixa, na mesma camada;
   - laço com coração: fita por cima, com largura em cada ponto, abrindo uma folga no D.
   Os mesmos pontos servem o site e o editor da marca. A animação pinta como um pincel:
   1) haste; 2) pé → barriga → topo, seguindo sem parar pro chapéu; faixa; 3) o laço da esquerda
   pra direita, subindo de novo pra fazer o coração, abrindo a folga no D enquanto passa. */
(function () {
  "use strict";
  let seq = 0;

  /* Curvas suaves (Hermite/Catmull-Rom) passando pelos pontos. Cada ponto pode ter uma
     curvatura no índice 3 (0 = reto, 1 = normal, 2 = bem redondo). */
  const tensao = p => (p.length > 3 && p[3] != null ? p[3] : 1);
  function trecho(p0, p1, p2, p3, passo, out, largura) {
    const m1x = (p2[0] - p0[0]) / 2 * tensao(p1), m1y = (p2[1] - p0[1]) / 2 * tensao(p1);
    const m2x = (p3[0] - p1[0]) / 2 * tensao(p2), m2y = (p3[1] - p1[1]) / 2 * tensao(p2);
    const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / passo));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t, h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
      const pt = [h00 * p1[0] + h10 * m1x + h01 * p2[0] + h11 * m2x, h00 * p1[1] + h10 * m1y + h01 * p2[1] + h11 * m2y];
      if (largura) pt.push(p1[2] + (p2[2] - p1[2]) * t);
      out.push(pt);
    }
  }
  /* largura: true quando o índice 2 é a largura da fita (laço). */
  function curva(pts, passo, largura) {
    passo = passo || 3;
    if (pts.length < 2) return pts.slice();
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      trecho(pts[Math.max(0, i - 1)], pts[i], pts[i + 1], pts[Math.min(pts.length - 1, i + 2)], passo, out, largura);
    }
    const u = pts[pts.length - 1];
    out.push(largura ? [u[0], u[1], u[2]] : [u[0], u[1]]);
    return out;
  }

  /* Contorno fechado: curva suave, mas vira canto vivo onde o ponto tem canto=1 (índice 2). */
  function contornoFechado(pts, passo) {
    passo = passo || 2.5;
    const n = pts.length, out = [];
    for (let i = 0; i < n; i++) {
      const p1 = pts[i], p2 = pts[(i + 1) % n];
      const p0 = p1[2] ? p1 : pts[(i - 1 + n) % n];
      const p3 = p2[2] ? p2 : pts[(i + 2) % n];
      trecho(p0, p1, p2, p3, passo, out, false);
    }
    return out;
  }
  const n1 = v => Math.round(v * 10) / 10;
  const linha = (p, fechar) => "M" + p.map(q => n1(q[0]) + " " + n1(q[1])).join("L") + (fechar ? "Z" : "");

  /* Fita do laço: contorno a partir do meio e da largura em cada ponto. */
  function fita(c, pontas) {
    pontas = pontas || { inicio: 0, fim: 0 };
    const e = [], d = [];
    for (let i = 0; i < c.length; i++) {
      const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1];
      const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
      const w = Math.max(0.6, c[i][2]) / 2;
      e.push([c[i][0] - ty * w, c[i][1] + tx * w]);
      d.push([c[i][0] + ty * w, c[i][1] - tx * w]);
    }
    /* ponta arredondada: meia-volta (achatada pelo valor 0..1) entre os dois lados */
    function tampa(i, sentido, r) {
      if (!r) return [];
      const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1];
      const L = Math.hypot(tx, ty) || 1; tx = tx / L * sentido; ty = ty / L * sentido;
      const w = Math.max(0.6, c[i][2]) / 2, pts = [];
      for (let k = 1; k < 12; k++) {
        const ang = Math.PI * k / 12;
        const nx = Math.cos(ang), fx = Math.sin(ang) * r;
        /* vai do lado "d" ao lado "e" passando pela frente */
        pts.push([c[i][0] + (ty * nx + tx * fx) * w, c[i][1] + (-tx * nx + ty * fx) * w]);
      }
      return pts;
    }
    const fim = tampa(c.length - 1, 1, pontas.fim);
    const ini = tampa(0, -1, pontas.inicio);
    const dr = d.reverse();
    return linha(e.concat(fim.reverse().map(p => p), dr, ini.reverse()), true);
  }

  /* Tudo que o desenho precisa, calculado do modelo. */
  function girar(pts, T, cx, cy) {
    if (!T) return pts;
    const a = (T.rot || 0) * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a), s = T.escala || 1;
    return pts.map(p => {
      const x = (p[0] - cx) * s, y = (p[1] - cy) * s;
      return [cx + x * cs - y * sn + (T.dx || 0), cy + x * sn + y * cs + (T.dy || 0)].concat(p.slice(2));
    });
  }
  /* Onde a fita volta a passar perto de um trecho já pintado (a ponta do coração encosta na fita):
     dali em diante ela é pintada como "cauda", com máscara própria, senão o pincel que passa por
     baixo revelaria a ponta antes da hora. Devolve o índice da curva densa, ou -1. */
  function inicioCauda(c, raio) {
    for (let i = 0; i < c.length; i++) {
      for (let j = 0; j < i - 60; j++) {
        if (Math.hypot(c[i][0] - c[j][0], c[i][1] - c[j][1]) < raio + c[i][2] / 2 + 3) return Math.max(1, i - 10);
      }
    }
    return -1;
  }
  function geometria(M) {
    const laco = curva(M.laco.pts, 2.5, true);
    const lacoMax = Math.max(...M.laco.pts.map(p => p[2]));
    const k = inicioCauda(laco, (lacoMax + 8) / 2);
    const pontas = M.laco.pontas || { inicio: 0, fim: 0 };
    /* os dois pedaços se sobrepõem um ponto, pra não abrir fresta na emenda */
    const partes = k < 0 ? [laco] : [laco.slice(0, k + 2), laco.slice(k)];
    const T = M.chapeuT || { dx: 0, dy: 0, rot: 0 };
    const D = M.d;
    const letra = D.contornos.map(c => linha(contornoFechado(girar(c, { dx: D.dx, dy: D.dy, escala: D.escala }, 467, 717)), true)).join("");
    return {
      letra,
      chapeu: linha(curva(girar(M.chapeu.pts, T, 300, 460))),
      /* o pincel do chapéu corre ao contrário dos pontos: começa na faixa, junto do D, e termina na ponta direita */
      chapeuPincel: linha(curva(girar(M.chapeu.pts.slice().reverse(), T, 300, 460))),
      faixa: linha(curva(girar(M.faixa.pts, T, 300, 460))),
      laco: fita(laco, pontas),
      lacoCentro: linha(laco),
      lacoPartes: partes.map((c, i) => ({
        d: fita(c, { inicio: i ? 0 : pontas.inicio, fim: i === partes.length - 1 ? pontas.fim : 0 }),
        centro: linha(c)
      })),
      lacoMax,
      pinceis: M.pinceis.map(p => ({ d: linha(curva(p.pts)), largura: p.largura }))
    };
  }

  function svgMarca(classe, opcoes) {
    const M = (opcoes && opcoes.modelo) || window.DLUH_MARCA;
    if (!M) return "";
    const G = geometria(M);
    const id = "m" + (++seq);
    const anim = !!(opcoes && opcoes.animada);
    const F = M.folga, wc = M.chapeu.largura, wf = M.faixa.largura, r = M.recorte;
    const corteLaco = `<path d="${G.laco}" fill="#000" stroke="#000" stroke-width="${2 * F}" stroke-linejoin="round"/>`;
    /* cada peça só aparece sob o próprio pincel: um pincel largo não revela a peça vizinha antes da hora */
    const mascara = (nome, conteudo) => `<mask id="${id}-${nome}" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="1200">${conteudo}</mask>`;
    const pincel = (i, d, w) => `<path class="marca__pincel" data-i="${i}" d="${d}" stroke-width="${w}"/>`;
    return `<svg class="${classe || ""}" viewBox="${M.viewBox}" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="${id}-ouro" gradientUnits="userSpaceOnUse" x1="60" y1="310" x2="880" y2="950">
          <stop offset="0" stop-color="#8f6a22"/><stop offset=".28" stop-color="#d9b45e"/>
          <stop offset=".5" stop-color="#f3dd98"/><stop offset=".72" stop-color="#c29a48"/>
          <stop offset="1" stop-color="#9a7429"/>
        </linearGradient>
        <linearGradient id="${id}-brilho" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".7"/>
          <stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        ${anim ? [
          ...G.lacoPartes.map((p, i) => mascara("pintaLaco" + i, pincel(4 + i, p.centro, G.lacoMax + 8))),
          mascara("pintaD", G.pinceis.map((p, i) => pincel(i, p.d, p.largura)).join("")),
          mascara("pintaChapeu", pincel(2, G.chapeuPincel, wc + 10)),
          mascara("pintaFaixa", pincel(3, G.faixa, wf + 10))
        ].join("") : ""}
        <mask id="${id}-folga" maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="1200">
          <rect x="0" y="0" width="1200" height="1200" fill="#fff"/>
          ${r ? `<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" fill="#000"/>` : ""}
          ${corteLaco}
          ${anim ? `<path class="marca__resto" d="${G.lacoPartes[0].centro}" fill="none" stroke="#fff" stroke-width="${G.lacoMax + 2 * F + 8}" stroke-linejoin="round"/>` : ""}
        </mask>
        <clipPath id="${id}-tudo"><path d="${G.letra}"/><path d="${G.laco}"/></clipPath>
      </defs>
      <g class="marca__camadas">
        <g class="marca__corpo">
          <g ${anim ? `mask="url(#${id}-pintaD)"` : ""}><g mask="url(#${id}-folga)"><path fill="url(#${id}-ouro)" fill-rule="evenodd" d="${G.letra}"/></g></g>
          <path d="${G.chapeu}" ${anim ? `mask="url(#${id}-pintaChapeu)"` : ""} fill="none" stroke="url(#${id}-ouro)" stroke-width="${wc}" stroke-linejoin="round" stroke-linecap="${M.chapeu.ponta || "round"}"/>
          <path d="${G.faixa}" ${anim ? `mask="url(#${id}-pintaFaixa)"` : ""} fill="none" stroke="url(#${id}-ouro)" stroke-width="${wf}" stroke-linecap="${M.faixa.ponta || "round"}"/>
        </g>
        <g class="marca__laco">${anim
          ? G.lacoPartes.map((p, i) => `<path mask="url(#${id}-pintaLaco${i})" fill="url(#${id}-ouro)" d="${p.d}"/>`).join("")
          : `<path fill="url(#${id}-ouro)" d="${G.laco}"/>`}</g>
      </g>
      <g clip-path="url(#${id}-tudo)"><rect class="marca__brilho" x="0" y="200" width="220" height="1000" fill="url(#${id}-brilho)" opacity="0"/></g>
      ${anim ? `<g class="marca__ponta" opacity="0"><ellipse rx="11" ry="6.5" fill="#6b4a1e" opacity=".85"/><ellipse rx="5.5" ry="3.2" fill="#f3dd98"/></g>` : ""}
    </svg>`;
  }

  /* Pinta a marca num svg criado com {animada:true}. escala 1 = abertura; ~0,3 = remontagem no topo.
     Pinceladas: 0 haste · 1 pé→barriga→topo · 2 chapéu · 3 faixa · 4 laço e coração. */
  function pintar(svg, escala, modelo) {
    escala = escala || 1;
    const M = modelo || window.DLUH_MARCA;
    const easeIO = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    /* uma pincelada pode ter vários trechos seguidos (o laço e a cauda do coração): um só movimento */
    const trechosDe = i => (i === 4 ? [4, 5] : [i])
      .map(j => svg.querySelectorAll(`[data-i="${j}"]`)).filter(l => l.length)
      .map(lista => ({ lista, p: lista[0], L: lista[0].getTotalLength() }));
    const ponta = svg.querySelector(".marca__ponta");
    const brilho = svg.querySelector(".marca__brilho");
    /* A folga no D: o corte já está na máscara, e um traço branco o tampa na parte da fita que o pincel
       ainda não pintou. Sem máscara dentro de máscara (o Chrome não redesenha isso quadro a quadro). */
    const resto = svg.querySelector(".marca__resto");
    const frente = (M.laco.pts.reduce((m, p) => Math.max(m, p[2]), 0) + 8) / 2;
    const tempos = (M.tempos || [520, 820, 1000, 260, 1450]).map(t => t * escala);
    /* a 1 acelera no fim e a 2 (chapéu) começa sem frear: uma pincelada só, sem parar */
    const curvas = [easeIO, t => Math.pow(t, 1.6), t => 1 - Math.pow(1 - t, 1.8), easeIO, easeIO];
    const pausas = [100, 0, 90, 140, 0].map(t => t * escala);
    const planos = [];
    let t0 = 0;
    [0, 1, 2, 3, 4].forEach(i => {
      const trechos = trechosDe(i);
      if (!trechos.length) return;
      trechos.forEach(tr => tr.lista.forEach(q => { q.style.strokeDasharray = `${tr.L} ${tr.L}`; q.style.strokeDashoffset = tr.L; }));
      planos.push({ i, trechos, L: trechos.reduce((s, tr) => s + tr.L, 0), ini: t0, dur: tempos[i], curva: curvas[i] });
      t0 += tempos[i] + pausas[i];
    });
    const laco = planos.find(pl => pl.i === 4);
    if (laco && resto) {
      const L0 = laco.trechos[0].L + frente;
      resto.style.strokeDasharray = `${L0} ${L0}`; resto.style.strokeDashoffset = 0;
    }
    const total = t0;
    let cancelado = false;
    const promessa = new Promise(resolve => {
      let inicio = null;
      function quadro(agora) {
        if (cancelado) return resolve();
        if (inicio === null) inicio = agora;
        const t = agora - inicio;
        let ativo = null;
        planos.forEach(pl => {
          const k = Math.min(1, Math.max(0, (t - pl.ini) / pl.dur));
          let feito = pl.L * pl.curva(k);
          if (pl === laco && resto) resto.style.strokeDashoffset = -(Math.min(feito, pl.trechos[0].L) + (k > 0 ? frente : 0));
          pl.trechos.forEach(tr => {
            const aqui = Math.min(tr.L, Math.max(0, feito));
            tr.lista.forEach(q => { q.style.strokeDashoffset = tr.L - aqui; });
            if (k > 0 && k < 1 && feito >= 0 && feito <= tr.L) ativo = { tr, s: aqui };
            feito -= tr.L;
          });
        });
        if (ponta && ativo) {
          const { tr, s } = ativo;
          const a = tr.p.getPointAtLength(Math.max(0, s - 1));
          const b = tr.p.getPointAtLength(Math.min(tr.L, s + 1));
          ponta.setAttribute("transform", `translate(${(a.x + b.x) / 2} ${(a.y + b.y) / 2}) rotate(${Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI})`);
          ponta.setAttribute("opacity", "1");
        } else if (ponta) ponta.setAttribute("opacity", "0");
        if (t < total) { requestAnimationFrame(quadro); return; }
        svg.querySelectorAll(".marca__camadas [mask*='-pinta']").forEach(g => g.removeAttribute("mask"));
        resto?.remove();
        if (ponta) ponta.setAttribute("opacity", "0");
        if (brilho && escala >= 0.6) {
          brilho.setAttribute("opacity", "1");
          brilho.animate([{ transform: "translateX(-300px) skewX(-18deg)" }, { transform: "translateX(1100px) skewX(-18deg)" }],
            { duration: 900, easing: "cubic-bezier(0.77, 0, 0.175, 1)", fill: "forwards" });
          setTimeout(resolve, 520);
        } else resolve();
      }
      requestAnimationFrame(quadro);
    });
    promessa.cancelar = () => { cancelado = true; };
    return promessa;
  }

  function montar() {
    document.querySelectorAll("[data-marca-d]").forEach(el => { el.innerHTML = svgMarca("marca__svg"); });
  }

  window.DLuhMarca = { svgMarca, pintar, montar, curva, geometria, girar };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar);
  else montar();
})();
