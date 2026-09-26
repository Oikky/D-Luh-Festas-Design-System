const CT = window.DLuhFestasDesignSystem_c861a2;

/* Shared by Produtos, the order forms and printing: the live catalog, photo shrinking before
   upload, the product picker, and the printed order. */

/* Photos leave the phone already small: longest side 1600px, JPEG. A 12 MP camera shot drops
   from ~4 MB to ~300 KB, well under the Worker's 5 MB cap. */
function reduzirImagem(arquivo, lado = 1600) {
  return new Promise((ok, falha) => {
    if (!/^image\//.test(arquivo.type)) { falha(new Error("Escolha uma imagem")); return; }
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, lado / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      ok(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); falha(new Error("Não deu pra ler a imagem")); };
    img.src = url;
  });
}

/* Product names typed in an item row suggest from the catalog; picking one fills price and
   category. One <datalist> per form, shared by every row. */
function ListaProdutos({ id, produtos }) {
  return <datalist id={id}>
    {(produtos || []).filter(p => p.ativo !== false).map(p => <option key={p.id} value={p.nome}>{p.categoria} · {p.preco}</option>)}
  </datalist>;
}
const acharProduto = (produtos, nome) => (produtos || []).find(p => p.nome.toLowerCase() === String(nome || "").trim().toLowerCase());

/* The printed order, for the thermal printer (80 mm) or a sheet: items grouped by category,
   the way the kitchen reads them. Opens the browser's print dialog in a clean window. */
function imprimirPedido(p, produtos) {
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const itensRaw = (p._c && p._c.itens) || null;
  const itens = itensRaw
    ? itensRaw.map(i => ({ qtd: i.qtd, nome: i.nome, sub: window.brl(i.qtd * i.valorUnit / 100),
        cat: i.categoria || (acharProduto(produtos, i.nome) || {}).categoria || "Outros",
        extras: [i.recheios && i.recheios.length ? "Recheio: " + i.recheios.join(", ") : null,
          i.topo ? "Topo: " + (typeof i.topo === "string" ? i.topo : [i.topo.tema, i.topo.detalhes].filter(Boolean).join(" — ")) : null, i.obs].filter(Boolean) }))
    : (p.itens || []).map(i => ({ qtd: i.qty, nome: i.name, sub: i.price, cat: (acharProduto(produtos, i.name) || {}).categoria || "Outros", extras: [i.note, i.topper].filter(Boolean) }));
  const grupos = {};
  itens.forEach(i => (grupos[i.cat] = grupos[i.cat] || []).push(i));
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(p.id)}</title><style>
    @page{size:80mm auto;margin:4mm}
    body{font:13px/1.35 system-ui,sans-serif;color:#000;margin:0;width:72mm}
    h1{font-size:18px;margin:0 0 2px}h2{font-size:12px;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px dashed #000;margin:10px 0 4px;padding-bottom:2px}
    .l{display:flex;justify-content:space-between;gap:8px}.x{font-size:11px;margin:0 0 3px 14px}.m{font-size:12px}
    .t{border-top:1px solid #000;margin-top:10px;padding-top:6px;font-weight:700}
  </style></head><body>
    <h1>D'Luh Festas</h1>
    <div class="l"><b>${esc(p.id)}</b><span>${esc(p.status)}</span></div>
    <div class="m">${esc(p.cliente)} · ${esc(p.tel)}</div>
    <div class="m">${esc(p.entrega)}${p.endereco ? " · " + esc(p.endereco) : ""}</div>
    ${Object.keys(grupos).map(cat => `<h2>${esc(cat)}</h2>` + grupos[cat].map(i =>
      `<div class="l"><span>${esc(i.qtd)}× ${esc(i.nome)}</span><span>${esc(i.sub)}</span></div>` + i.extras.map(x => `<div class="x">${esc(x)}</div>`).join("")).join("")).join("")}
    ${p.obs ? `<h2>Observações</h2><div class="m">${esc(p.obs)}</div>` : ""}
    <div class="t"><div class="l"><span>Total</span><span>${esc(p.total)}</span></div>
    ${p.pago ? `<div class="l"><span>Pago</span><span>${esc(p.pago)}</span></div>` : ""}
    ${p.falta ? `<div class="l"><span>Falta</span><span>${esc(p.falta)}</span></div>` : ""}</div>
    <script>onload=()=>{print();setTimeout(close,300)}<\/script>
  </body></html>`;
  const w = window.open("", "_blank", "width=420,height=640");
  if (!w) return false;
  w.document.write(html); w.document.close();
  return true;
}

Object.assign(window, { reduzirImagem, ListaProdutos, acharProduto, imprimirPedido });
