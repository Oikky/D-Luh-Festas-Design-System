const BX = window.DLuhFestasDesignSystem_c861a2;

const norm = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const dataBR = iso => iso.slice(8, 10) + "/" + iso.slice(5, 7);

function indiceBusca() {
  const d = window.DLUH, ag = d.agenda;
  return [
    { id: "pedidos", label: "Pedidos", icon: "receipt-text", view: "pedidos",
      itens: d.pedidos.map(p => ({ title: p.cliente, sub: p.id + " · " + p.status, value: p.total, busca: [p.cliente, p.id, p.tel, p.status, ...p.itens.map(i => i.name)], q: p.id })) },
    { id: "eventos", label: "Eventos", icon: "party-popper", view: "agenda",
      itens: ag.filter(e => e.tipo === "buffet" || e.tipo === "festa").map(e => ({ title: e.titulo, sub: e.cliente + " · " + dataBR(e.data) + " " + e.hora + (e.local ? " · " + e.local : ""), value: e.valor, busca: [e.titulo, e.cliente, e.local] })) },
    { id: "pagamentos", label: "Pagamentos", icon: "wallet", view: "visao",
      itens: d.pagamentos.map(p => ({ title: p.title, sub: p.sub, value: p.value, tone: p.tone, busca: [p.title, p.sub] })) },
    { id: "boletos", label: "Boletos", icon: "file-text", view: "agenda",
      itens: ag.filter(e => e.tipo === "boleto").map(e => ({ title: e.cliente, sub: e.titulo + " · vence " + dataBR(e.data) + " · " + e.situacao, value: e.valor, busca: [e.cliente, e.titulo, e.situacao] })) },
    { id: "cartoes", label: "Cartões", icon: "credit-card", view: "agenda",
      itens: ag.filter(e => e.tipo === "cartao").map(e => ({ title: e.cliente, sub: e.titulo + " · " + dataBR(e.data) + " · " + e.situacao, value: e.valor, busca: [e.cliente, e.titulo, e.situacao] })) }
  ];
}

function ResultadoRow({ grupo, it, onPick, id, ativo, onHover }) {
  return (
    <button type="button" id={id} role="option" aria-selected={ativo} tabIndex={-1}
      onMouseDown={e => e.preventDefault()} onClick={() => onPick(grupo, it)} onMouseEnter={onHover} style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "8px 10px", border: "none",
        borderRadius: "var(--radius-sm)", background: ativo ? "var(--color-accent-soft)" : "transparent", cursor: "pointer",
        textAlign: "left", fontFamily: "var(--font-ui)", color: "var(--text-strong)"
      }}>
      <span style={{ flex: "0 0 32px", height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-sm)", border: "var(--border-hairline) solid var(--color-border)", color: "var(--text-muted)" }}><BX.Icon name={grupo.icon} size={16} /></span>
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title}</span>
        <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.sub}</span>
      </span>
      {it.value ? <span style={{ fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)", whiteSpace: "nowrap", color: it.tone === "in" ? "var(--action-paid)" : "var(--text-strong)" }}>{it.value}</span> : null}
    </button>
  );
}

function GlobalSearch({ q, onQ, onView }) {
  const [open, setOpen] = React.useState(false);
  const [ativo, setAtivo] = React.useState(-1);
  const indice = React.useMemo(indiceBusca, []);
  const t = norm(q).trim();
  const grupos = t ? indice.map(g => ({ ...g, achados: g.itens.filter(it => it.busca.some(s => norm(s).includes(t))) })).filter(g => g.achados.length) : [];
  const total = grupos.reduce((s, g) => s + g.achados.length, 0);
  /* Flat list of what is on screen (five per group), so arrows walk the results in order. */
  const visiveis = grupos.flatMap(g => g.achados.slice(0, 5).map(it => ({ g, it })));
  const pick = (g, it) => { onView(g.view); onQ(it.q || ""); setOpen(false); setAtivo(-1); };
  const aberto = open && !!t;
  const onKey = e => {
    if (e.key === "Escape") { if (aberto) { e.preventDefault(); setOpen(false); } else if (q) onQ(""); return; }
    if (!visiveis.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault(); setOpen(true);
      const d = e.key === "ArrowDown" ? 1 : -1;
      setAtivo(a => (a + d + visiveis.length) % visiveis.length);
    } else if (e.key === "Enter" && aberto && ativo >= 0 && visiveis[ativo]) {
      e.preventDefault(); pick(visiveis[ativo].g, visiveis[ativo].it);
    }
  };
  React.useEffect(() => { setAtivo(-1); }, [t]);
  React.useEffect(() => {
    const el = ativo >= 0 && document.getElementById("busca-op-" + ativo);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [ativo]);
  let n = -1;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <BX.SearchInput value={q} onChange={e => { onQ(e.target.value); setOpen(true); }} onClear={() => onQ("")}
        onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onKeyDown={onKey}
        role="combobox" aria-label="Buscar pedidos, eventos e pagamentos" aria-expanded={aberto} aria-controls="busca-resultados"
        aria-autocomplete="list" aria-activedescendant={aberto && ativo >= 0 ? "busca-op-" + ativo : undefined}
        placeholder="Pesquise aqui qualquer coisa" style={{ width: "100%", maxWidth: "none" }} />
      {aberto ? (
        <div id="busca-resultados" role="listbox" aria-label="Resultados da busca" style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 50, maxHeight: "min(70vh, 560px)", overflowY: "auto",
          padding: 8, borderRadius: "var(--radius-md)", border: "var(--border-hairline) solid var(--color-border)",
          background: "var(--color-surface)", boxShadow: "0 16px 48px rgba(0,0,0,.28)"
        }}>
          {total ? grupos.map(g => (
            <div key={g.id} role="group" aria-label={g.label} style={{ display: "flex", flexDirection: "column", gap: 2, paddingBottom: 6 }}>
              <div aria-hidden="true" style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px 4px", fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)" }}>
                <span>{g.label}</span><span>{g.achados.length}</span>
              </div>
              {g.achados.slice(0, 5).map((it, i) => { n++; const k = n; return <ResultadoRow key={i} id={"busca-op-" + k} ativo={k === ativo} onHover={() => setAtivo(k)} grupo={g} it={it} onPick={pick} />; })}
            </div>
          )) : (
            <div style={{ padding: "18px 10px", fontSize: "var(--fs-body-s)", color: "var(--text-muted)", textAlign: "center" }}>Nada encontrado para “{q}”.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

Object.assign(window, { GlobalSearch });
