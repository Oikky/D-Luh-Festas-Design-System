const NT = window.DLuhFestasDesignSystem_c861a2;

const NOTIF_DEMO = [
  { icon: "receipt-text", title: "Novo pedido no site", sub: "Luana Ferreira · 60 docinhos gourmet · R$ 210,00", view: "pedidos" },
  { icon: "wallet", title: "Entrada paga", sub: "Willian Bicalho pagou R$ 370,00 via Pix", view: "pedidos" },
  { icon: "file-text", title: "Boleto vence hoje", sub: "Distribuidora Doce Minas · R$ 1.146,00", view: "agenda" },
  { icon: "chef-hat", title: "Pedido pronto", sub: "PED-2293 · Rafaela Prates saiu da cozinha", view: "cozinha" }
];

function NotifCard({ n, onClose, onOpen, compact }) {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    const a = requestAnimationFrame(() => setOn(true));
    const b = setTimeout(() => setOn(false), 3000);
    const c = setTimeout(onClose, 3300);
    return () => { cancelAnimationFrame(a); clearTimeout(b); clearTimeout(c); };
  }, []);
  return (
    <div role="status" onClick={onOpen} style={{
      display: "flex", alignItems: "center", gap: 12, width: compact ? "100%" : 340, boxSizing: "border-box", padding: "12px 12px 12px 14px", cursor: "pointer",
      borderRadius: "var(--radius-md)", border: "var(--border-hairline) solid var(--color-border)",
      background: "var(--color-surface)", boxShadow: "0 12px 36px rgba(0,0,0,.28)", pointerEvents: "auto",
      opacity: on ? 1 : 0, transform: on ? "none" : compact ? "translateY(-16px)" : "translateX(24px)",
      transition: "opacity var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)"
    }}>
      <span style={{ flex: "0 0 36px", height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-sm)", background: "var(--color-accent)", color: "var(--color-accent-contrast)" }}><NT.Icon name={n.icon} size={18} /></span>
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)" }}>{n.title}</span>
        <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", lineHeight: "var(--lh-normal)" }}>{n.sub}</span>
      </span>
      <button type="button" aria-label="Fechar" onClick={e => { e.stopPropagation(); onClose(); }} style={{ alignSelf: "flex-start", display: "flex", padding: 4, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", borderRadius: "var(--radius-xs)" }}><NT.Icon name="x" size={14} /></button>
    </div>
  );
}

function Notificacoes({ onView, compact }) {
  const [lista, setLista] = React.useState([]);
  React.useEffect(() => {
    let i = 0;
    const push = () => { const n = NOTIF_DEMO[i++ % NOTIF_DEMO.length]; setLista(l => [...l, { ...n, key: Date.now() }]); };
    const first = setTimeout(push, 2500);
    const loop = setInterval(push, 14000);
    return () => { clearTimeout(first); clearInterval(loop); };
  }, []);
  const tirar = k => setLista(l => l.filter(x => x.key !== k));
  return (
    <div style={{
      position: "absolute", zIndex: 900, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none",
      ...(compact ? { top: "calc(8px + env(safe-area-inset-top))", left: 12, right: 12, alignItems: "stretch" } : { right: 24, bottom: 24, alignItems: "flex-end", maxWidth: "calc(100% - 24px)" })
    }}>
      {lista.map(n => <NotifCard key={n.key} n={n} compact={compact} onClose={() => tirar(n.key)} onOpen={() => { onView(n.view); tirar(n.key); }} />)}
    </div>
  );
}

Object.assign(window, { Notificacoes, NOTIF_DEMO });
