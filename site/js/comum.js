/* D'Luh Festas — site público: peças comuns às três páginas (ícones, formatos, carrinho, recado). */
(function () {
  "use strict";

  const WHATSAPP = "5538992229178";
  const CHAVE_CARRINHO = "dluh_site_carrinho_v1";

  /* Ícones: traço único de 2.25, desenhados no formato do Lucide. */
  const ICONES = {
    seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    voltar: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    menos: '<path d="M5 12h14"/>',
    fechar: '<path d="M18 6 6 18M6 6l12 12"/>',
    sacola: '<path d="M6 7h12l1 13H5L6 7Z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/>',
    moto: '<circle cx="5.5" cy="17" r="3"/><circle cx="18.5" cy="17" r="3"/><path d="M8.5 17h6l3-6h-4l-2-4H8"/><path d="M14.5 11 12 17"/>',
    loja: '<path d="M3 9 5 4h14l2 5"/><path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9Z"/><path d="M5 13v7h14v-7"/><path d="M10 20v-4h4v4"/>',
    check: '<path d="M4 12.5 9.5 18 20 6.5"/>',
    relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    forno: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><rect x="7" y="12" width="10" height="5" rx="1"/><path d="M7 6.5h.01M11 6.5h.01"/>',
    recebido: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h5"/>',
    entregue: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    alerta: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/>',
    bolo: '<path d="M4 20h16v-7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7Z"/><path d="M4 15c2 1.5 4 1.5 6 0s4-1.5 6 0 3 1 4 0"/><path d="M12 11V7"/><path d="M12 4.5c.8.7.8 1.8 0 2.5-.8-.7-.8-1.8 0-2.5Z"/>',
    whats: '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19l-4 1Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.7-2-1-1 1c-1-.4-1.9-1.3-2.3-2.3l1-1-1-2L9 9.5Z"/>',
    lupa: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    lixo: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    pino: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    pausa: '<path d="M9 5v14M15 5v14"/>',
    insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    play: '<path d="M7 4.5v15l12-7.5-12-7.5Z"/>',
    salgado: '<path d="M12 3c-4 4.5-7 8.6-7 11.5A7 7 0 0 0 19 14.5C19 11.6 16 7.5 12 3Z"/><path d="M9 15.5c1.8 1.2 4.2 1.2 6 0"/>'
  };

  function injetarIcones() {
    if (document.getElementById("icones-dluh")) return;
    const simbolos = Object.entries(ICONES)
      .map(([nome, corpo]) => `<symbol id="i-${nome}" viewBox="0 0 24 24">${corpo}</symbol>`)
      .join("");
    const div = document.createElement("div");
    div.innerHTML = `<svg id="icones-dluh" xmlns="http://www.w3.org/2000/svg" style="display:none">${simbolos}</svg>`;
    document.body.prepend(div.firstChild);
  }

  function icone(nome, rotulo) {
    const aria = rotulo ? `role="img" aria-label="${esc(rotulo)}"` : 'aria-hidden="true"';
    return `<svg class="icone" ${aria}><use href="#i-${nome}"/></svg>`;
  }

  /* ── Formatos ── */
  const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  function brl(centavos) { return fmtBRL.format((centavos || 0) / 100).replace(/ /g, " "); }
  /* Preço de placa: sem ",00" quando é redondo. */
  function brlPlaca(centavos) {
    const s = brl(centavos);
    return centavos % 100 === 0 ? s.replace(/,00$/, "") : s;
  }
  function dataCurta(iso) {
    if (!iso) return "";
    const [a, m, d] = iso.split("-");
    return `${d}/${m}`;
  }
  function dataLonga(iso) {
    if (!iso) return "";
    const dt = new Date(iso + "T12:00:00");
    return dt.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  }
  function hora(hhmm) {
    if (!hhmm) return "";
    const [h, m] = hhmm.split(":");
    return m === "00" ? `${Number(h)}h` : `${Number(h)}:${m}`;
  }
  /* Produto sem foto: a marca da casa, clarinha, no lugar. */
  function semFoto() { return '<img class="marca-vazia" src="img/logo-192.png" alt="" width="192" height="192">'; }
  function soDigitos(s) { return String(s || "").replace(/\D/g, ""); }
  function mascaraTelefone(valor) {
    const d = soDigitos(valor).slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ── Catálogo ── */
  const CATEGORIAS = [
    { tipo: "Salgado Frito", nome: "Salgados fritos", slug: "salgados-fritos" },
    { tipo: "Assado", nome: "Assados", slug: "assados" },
    { tipo: "Salgado Especial", nome: "Salgados especiais", slug: "salgados-especiais" },
    { tipo: "Lanches", nome: "Lanches", slug: "lanches" },
    { tipo: "Doce", nome: "Docinhos", slug: "docinhos" },
    { tipo: "Doce Goumert", nome: "Doces gourmet", slug: "doces-gourmet" },
    { tipo: "Bolo", nome: "Bolos", slug: "bolos" },
    { tipo: "Pacote Congelado", nome: "Congelados pra fritar ou assar", slug: "congelados" }
  ];
  function slugDe(texto) {
    return String(texto).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function categoriasDoCatalogo(produtos) {
    const tipos = [...new Set(produtos.map(p => p.categoria))];
    const conhecidas = CATEGORIAS.filter(c => tipos.includes(c.tipo));
    const outras = tipos.filter(t => !CATEGORIAS.some(c => c.tipo === t)).map(t => ({ tipo: t, nome: t, slug: slugDe(t) }));
    return [...conhecidas, ...outras].map(c => ({ ...c, produtos: produtos.filter(p => p.categoria === c.tipo) }));
  }
  function ehBolo(p) { return /bolo/i.test(p.categoria); }
  function ehPacote(p) { return Array.isArray(p.tiposPacote) && p.tiposPacote.length > 0; }
  /* Opções de um pacote: "Tipos (Pacotes)" nomeia CATEGORIAS; as opções são os produtos delas. */
  function opcoesPacote(p, produtos) {
    const cats = p.tiposPacote.map(c => c.toLowerCase().trim());
    return produtos.filter(x => x.id !== p.id && cats.includes(String(x.categoria).toLowerCase().trim())).map(x => x.nome);
  }
  /* Quanto soma cada toque no "+": de 25 em 25 pra quem vende por cento, de 1 em 1 no resto. */
  /* Depois do mínimo, o que vende por cento anda de 5 em 5; o resto (bolo, pacote), de 1 em 1. */
  function passoDe(p) { return p.qtdMin >= 25 ? 5 : 1; }
  function nomeLimpo(nome) { return String(nome).replace(/^[^\p{L}\p{N}]+/u, "").trim(); }

  /* ── Carrinho (fica no aparelho) ── */
  function lerCarrinho() {
    try {
      const bruto = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || "null");
      if (bruto && typeof bruto === "object" && bruto.linhas) return bruto;
    } catch (_) { /* navegador sem armazenamento: começa vazio */ }
    return { linhas: {}, topo: "", atualizado: 0 };
  }
  function salvarCarrinho(c) {
    c.atualizado = Date.now();
    try { localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(c)); } catch (_) { /* segue só na memória */ }
  }
  function limparCarrinho() {
    try { localStorage.removeItem(CHAVE_CARRINHO); } catch (_) { /* nada */ }
  }

  /* ── Recado (toast) ── */
  let recadoTimer;
  function recado(texto, link) {
    let el = document.querySelector(".recado");
    if (!el) {
      el = document.createElement("div");
      el.className = "recado";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.innerHTML = `<span>${esc(texto)}</span>${link ? `<a href="${esc(link.href)}">${esc(link.texto)}</a>` : ""}`;
    requestAnimationFrame(() => el.classList.add("visivel"));
    clearTimeout(recadoTimer);
    recadoTimer = setTimeout(() => el.classList.remove("visivel"), link ? 4200 : 2600);
  }

  /* Número na sacola do topo: quantos itens diferentes estão no pedido. */
  function atualizarSacola() {
    const n = Object.keys(lerCarrinho().linhas).length;
    document.querySelectorAll("[data-sacola-n]").forEach(el => { el.textContent = n; el.hidden = n === 0; });
    document.querySelectorAll("[data-sacola]").forEach(a => a.setAttribute("aria-label", n ? `Seu pedido: ${n} ${n === 1 ? "item" : "itens"}` : "Seu pedido"));
  }

  /* Repinta um número: troca o texto e passa o pincel da esquerda pra direita. */
  function repintar(el, texto) {
    if (!el || el.textContent === texto) return;
    el.textContent = texto;
    el.classList.remove("pintando");
    void el.offsetWidth;
    el.classList.add("pintando");
  }

  function linkWhats(texto) {
    return `https://wa.me/${WHATSAPP}${texto ? "?text=" + encodeURIComponent(texto) : ""}`;
  }

  window.DLuh = {
    WHATSAPP, injetarIcones, icone, brl, brlPlaca, dataCurta, dataLonga, hora, soDigitos, mascaraTelefone, esc,
    CATEGORIAS, categoriasDoCatalogo, ehBolo, ehPacote, opcoesPacote, passoDe, nomeLimpo, slugDe,
    lerCarrinho, salvarCarrinho, limparCarrinho, recado, repintar, linkWhats, atualizarSacola, semFoto
  };

  function iniciar() { injetarIcones(); atualizarSacola(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
