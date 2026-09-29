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

/* ── Printed tickets, for the 80 mm thermal printer (Tomate MDK-08260) ──
   One ticket per order, each sent as its OWN print job: the printer's driver cuts the paper at the
   end of every job, so "Imprimir fila" comes out as separate slips, one per customer. With Chrome
   opened with --kiosk-printing the jobs go straight to the default printer, no dialog. */
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/* Any order shape the screens hold → the ticket's shape. Real orders carry it ready in `imp`
   (api.js); the demo rows are rebuilt from what they show. */
function paraTicket(p, produtos) {
  const cat = i => i.cat || (acharProduto(produtos, i.nome) || {}).categoria || "Outros";
  if (p.imp) return { ...p.imp, itens: p.imp.itens.map(i => ({ ...i, cat: cat(i) })) };
  const itens = Array.isArray(p.itens)
    ? p.itens.map(i => ({ qtd: i.qty, nome: i.name, extras: [i.note, i.topper].filter(Boolean) }))
    : String(p.itens || "").split(" · ").filter(Boolean).map(t => { const m = t.match(/^(\d+)\s+(.+)$/); return { qtd: m ? m[1] : "", nome: m ? m[2] : t, extras: [] }; });
  const quando = String(p.hora || p.entrega || "").split(" · ");
  const temDia = /\d{2}\/\d{2}/.test(quando[0]);
  return {
    id: p.id, cliente: p.cliente || "", tel: p.tel || "", status: p.status || "",
    dia: temDia ? quando[0] : "Hoje", hora: temDia ? quando[1] || "" : quando[0] || "",
    modo: /entrega/i.test(p.modo || p.entrega || "") ? "Entrega" : "Retirada", endereco: p.endereco || "",
    itens: itens.map(i => ({ ...i, cat: cat(i) })), obs: p.obs || "",
    pagamento: p.pagamento || (["Não pago", "Só entrada", "Totalmente pago"].includes(p.pago) ? p.pago : ""),
    total: p.total && String(p.total).startsWith("R$") ? p.total : "", falta: p.falta || null
  };
}

function htmlTicket(t) {
  const grupos = {};
  t.itens.forEach(i => (grupos[i.cat] = grupos[i.cat] || []).push(i));
  const agora = new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const pago = t.pagamento === "Totalmente pago" ? "PAGO" : t.falta ? `${t.pagamento || "A pagar"} · falta ${t.falta}` : t.pagamento;
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(t.id)}</title><style>
    @page{margin:0}
    *{box-sizing:border-box}
    body{margin:0;padding:3mm 3mm 6mm;width:80mm;color:#000;font:14px/1.3 system-ui,"Segoe UI",Arial,sans-serif}
    .id{display:flex;justify-content:space-between;font-size:12px}
    .nome{font-size:22px;font-weight:800;line-height:1.1;margin:4px 0 2px;overflow-wrap:anywhere}
    .quando{font-size:18px;font-weight:800;margin-top:6px}
    .modo{font-size:14px;font-weight:700;margin-top:2px;overflow-wrap:anywhere}
    h2{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;border-bottom:1.5px dashed #000;margin:10px 0 4px;padding-bottom:2px}
    .i{display:flex;gap:6px;font-size:15px;margin:3px 0}.q{font-weight:800;min-width:34px;text-align:right}
    .x{font-size:12.5px;margin:0 0 3px 40px}
    .obs{font-size:13.5px;white-space:pre-wrap;overflow-wrap:anywhere}
    .pago{border:2px solid #000;font-weight:800;font-size:15px;text-align:center;padding:4px;margin-top:10px}
    .rod{font-size:11px;text-align:center;margin-top:8px}
  </style></head><body>
    <div class="id"><b>${esc(t.id)}</b><span>D'Luh Festas</span></div>
    <div class="nome">${esc(t.cliente || "Cliente sem nome")}</div>
    ${t.tel ? `<div>${esc(t.tel)}</div>` : ""}
    <div class="quando">${esc([t.dia, t.hora].filter(Boolean).join(" · "))}</div>
    <div class="modo">${esc(t.modo)}${t.endereco ? ": " + esc(t.endereco) : ""}</div>
    ${Object.keys(grupos).map(cat => `<h2>${esc(cat)}</h2>` + grupos[cat].map(i =>
      `<div class="i"><span class="q">${esc(i.qtd)}</span><span>${esc(i.nome)}</span></div>` + i.extras.map(x => `<div class="x">${esc(x)}</div>`).join("")).join("")).join("")}
    ${t.itens.length ? "" : `<h2>Itens</h2><div class="obs">Itens não informados. Confira o pedido.</div>`}
    ${t.obs ? `<h2>Observações</h2><div class="obs">${esc(t.obs)}</div>` : ""}
    ${pago ? `<div class="pago">${esc(pago)}</div>` : ""}
    <div class="rod">${t.total ? `Total ${esc(t.total)} · ` : ""}impresso ${esc(agora)}</div>
  </body></html>`;
}

/* Prints each order as its own job, one after the other, from a hidden frame (no pop-up to be
   blocked). Resolves when the last one was handed to the printer. */
function imprimirPedidos(lista, produtos) {
  const docs = (lista || []).map(p => htmlTicket(paraTicket(p, produtos)));
  return new Promise(fim => {
    let n = 0;
    const proximo = () => {
      if (n >= docs.length) return fim(docs.length);
      const f = document.createElement("iframe");
      f.setAttribute("aria-hidden", "true");
      f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
      f.onload = () => {
        // print() in a frame blocks until the dialog closes (or, in kiosk mode, the job is queued).
        try { f.contentWindow.focus(); f.contentWindow.print(); } finally { setTimeout(() => { f.remove(); proximo(); }, 300); }
      };
      f.srcdoc = docs[n++];
      document.body.appendChild(f);
    };
    proximo();
  });
}
const imprimirPedido = (p, produtos) => { imprimirPedidos([p], produtos); return true; };

Object.assign(window, { reduzirImagem, ListaProdutos, acharProduto, imprimirPedido, imprimirPedidos });
