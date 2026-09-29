/* Catálogo do site: lê sis_produtos e sis_catalogo/recheios direto do Firestore (leitura pública,
   sem login) e monta window.DLUH_CATALOGO no formato que landing.js, cenas.js e cardapio.js usam.
   Quem depende dele roda por DLuhDepoisDoCatalogo(fn). Se o Firestore não responder, usa a última
   cópia boa guardada no aparelho e, sem ela, a cópia de reserva (js/catalogo-reserva.js). */
(function () {
  "use strict";
  const BASE = "https://firestore.googleapis.com/v1/projects/dluh-festas/databases/(default)/documents";
  const CHAVE = "dluh_site_catalogo_v1";
  const LIMITE_MS = 6000;

  const valor = v => {
    if (!v) return undefined;
    if ("stringValue" in v) return v.stringValue;
    if ("integerValue" in v) return Number(v.integerValue);
    if ("doubleValue" in v) return v.doubleValue;
    if ("booleanValue" in v) return v.booleanValue;
    if ("arrayValue" in v) return (v.arrayValue.values || []).map(valor);
    if ("mapValue" in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, valor(x)]));
    return undefined;
  };

  async function buscar(caminho) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), LIMITE_MS);
    try {
      const r = await fetch(`${BASE}/${caminho}`, { signal: ctl.signal });
      if (!r.ok) throw new Error(`Firestore ${r.status}`);
      return await r.json();
    } finally { clearTimeout(t); }
  }

  async function doFirestore() {
    const [prod, rech] = await Promise.all([buscar("sis_produtos?pageSize=300"), buscar("sis_catalogo/recheios")]);
    const produtos = (prod.documents || []).map(doc => {
      const f = Object.fromEntries(Object.entries(doc.fields || {}).map(([k, v]) => [k, valor(v)]));
      return {
        id: doc.name.split("/").pop(), nome: f.nome || "", categoria: f.categoria || "", valorUnit: f.valorUnit || 0,
        qtdMin: f.qtdMin || 1, descricao: f.ingredientes || "", imagem: f.imagem || "", destaque: f.destaque === true,
        tiposPacote: f.tiposPacote || [], ativo: f.ativo !== false
      };
    }).filter(p => p.ativo && p.nome && p.valorUnit > 0)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    if (!produtos.length) throw new Error("Catálogo vazio");
    // Mesmo nome duas vezes (cadastro repetido no admin): fica o que tem foto.
    const porNome = new Map();
    for (const p of produtos) {
      const k = p.nome.trim().toLowerCase(), outro = porNome.get(k);
      if (!outro || (!outro.imagem && p.imagem)) porNome.set(k, p);
    }
    produtos.splice(0, produtos.length, ...produtos.filter(p => porNome.get(p.nome.trim().toLowerCase()) === p));
    return { produtos, recheios: valor(rech.fields && rech.fields.lista) || [] };
  }

  function daReserva() {
    return new Promise(resolve => {
      const s = document.createElement("script");
      s.src = "js/catalogo-reserva.js?v=19";
      s.onload = () => resolve(window.DLUH_CATALOGO);
      s.onerror = () => resolve({ produtos: [], recheios: [] });
      document.head.appendChild(s);
    });
  }

  const pronto = doFirestore()
    .then(cat => { try { localStorage.setItem(CHAVE, JSON.stringify(cat)); } catch (_) { /* segue */ } return cat; })
    .catch(() => {
      try { const c = JSON.parse(localStorage.getItem(CHAVE) || "null"); if (c && c.produtos && c.produtos.length) return c; } catch (_) { /* segue */ }
      return daReserva();
    })
    .then(cat => { window.DLUH_CATALOGO = cat; return cat; });

  window.DLuhDepoisDoCatalogo = fn => pronto.then(() => fn());
})();
