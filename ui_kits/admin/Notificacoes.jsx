const NT = window.DLuhFestasDesignSystem_c861a2;

const NOTIF_DEMO = [
  { icon: "receipt-text", title: "Novo pedido no site", sub: "Luana Ferreira · 60 docinhos gourmet · R$ 210,00", view: "pedidos" },
  { icon: "wallet", title: "Entrada paga", sub: "Willian Bicalho pagou R$ 370,00 via Pix", view: "pedidos" },
  { icon: "file-text", title: "Boleto vence hoje", sub: "Distribuidora Doce Minas · R$ 1.146,00", view: "agenda" },
  { icon: "chef-hat", title: "Pedido pronto", sub: "PED-2293 · Rafaela Prates saiu da cozinha", view: "cozinha" }
];

/* The transient cards replay NOTIF_DEMO only when the page is opened with ?demo. Without a real
   event source the production panel must not invent orders arriving. */
const DEMO = /[?&]demo\b/.test(window.location.search);
const VISIVEL_MS = 6000;

function NotifCard({ n, onClose, onOpen, compact }) {
  const [on, setOn] = React.useState(false);
  const [pausa, setPausa] = React.useState(false);
  React.useEffect(() => {
    const a = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(a);
  }, []);
  /* The timer stops while the card is hovered or focused, so it can be read and acted on. */
  React.useEffect(() => {
    if (pausa) return;
    const b = setTimeout(() => setOn(false), VISIVEL_MS);
    const c = setTimeout(onClose, VISIVEL_MS + 300);
    return () => { clearTimeout(b); clearTimeout(c); };
  }, [pausa]);
  return (
    <div onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)}
      onFocus={() => setPausa(true)} onBlur={() => setPausa(false)} style={{
      display: "flex", alignItems: "center", gap: 4, width: compact ? "100%" : 360, boxSizing: "border-box", padding: 6,
      borderRadius: "var(--radius-md)", border: "var(--border-hairline) solid var(--color-border)",
      background: "var(--color-surface)", boxShadow: "var(--shadow-pop)", pointerEvents: "auto",
      opacity: on ? 1 : 0, transform: on ? "none" : compact ? "translateY(-16px)" : "translateX(24px)",
      /* Enters on ease-out (moves the moment it appears); leaves on the neutral curve. */
      transition: on ? "opacity var(--dur-base) var(--ease-out), transform var(--dur-move) var(--ease-out)"
        : "opacity var(--dur-base) var(--ease-standard), transform var(--dur-move) var(--ease-standard)"
    }}>
      <button type="button" onClick={onOpen} style={{
        flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12, padding: "6px 6px 6px 8px", textAlign: "left",
        border: "none", borderRadius: "var(--radius-sm)", background: "transparent", cursor: "pointer", fontFamily: "var(--font-ui)"
      }}>
        <span style={{ flex: "0 0 36px", height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-sm)", background: "var(--color-accent)", color: "var(--color-accent-contrast)" }}><NT.Icon name={n.icon} size={18} /></span>
        <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)" }}>{n.title}</span>
          <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", lineHeight: "var(--lh-normal)" }}>{n.sub}</span>
        </span>
      </button>
      <button type="button" aria-label="Fechar notificação" onClick={onClose} style={{ alignSelf: "flex-start", width: 36, height: 36, flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", borderRadius: "var(--radius-sm)" }}><NT.Icon name="x" size={14} /></button>
    </div>
  );
}

function Notificacoes({ onView, compact }) {
  const [lista, setLista] = React.useState([]);
  React.useEffect(() => {
    if (!DEMO) return;
    let i = 0;
    const push = () => { const n = NOTIF_DEMO[i++ % NOTIF_DEMO.length]; setLista(l => [...l, { ...n, key: Date.now() }]); };
    const first = setTimeout(push, 2500);
    const loop = setInterval(push, 14000);
    return () => { clearTimeout(first); clearInterval(loop); };
  }, []);
  const tirar = k => setLista(l => l.filter(x => x.key !== k));
  return (
    <div aria-live="polite" style={{
      position: "absolute", zIndex: 900, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none",
      ...(compact ? { top: "calc(8px + env(safe-area-inset-top))", left: 12, right: 12, alignItems: "stretch" } : { right: 24, bottom: 24, alignItems: "flex-end", maxWidth: "calc(100% - 24px)" })
    }}>
      {lista.map(n => <NotifCard key={n.key} n={n} compact={compact} onClose={() => tirar(n.key)} onOpen={() => { onView(n.view); tirar(n.key); }} />)}
    </div>
  );
}

Object.assign(window, { Notificacoes, NOTIF_DEMO });
