const { SearchInput, IconButton, UserChip, Icon, Modal, FilterPill, Button, ListRow, EmptyState } = window.DLuhFestasDesignSystem_c861a2;

/* Rail counts are derived, never typed in: open orders (not Finalizado or Cancelado),
   commitments on the shop day, and the kitchen queue. */
const FECHADOS = ["Finalizado", "Cancelado"];
const navItems = () => {
  const d = window.DLUH;
  return [
    { id: "visao", label: "Visão geral", icon: "layout-dashboard" },
    { id: "pedidos", label: "Pedidos", icon: "receipt-text", count: d.pedidos.filter(p => !FECHADOS.includes(p.status)).length },
    { id: "agenda", label: "Agenda", icon: "calendar-days", count: d.agenda.filter(x => x.data === d.hoje).length },
    { id: "cozinha", label: "Cozinha", icon: "chef-hat", count: d.fila.length },
    { id: "financeiro", label: "Financeiro", icon: "wallet" }
  ];
};

function RailItem({ icon, label, count, active, badge, open, instant, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <button type="button" onClick={onClick} title={open ? undefined : label} aria-current={active ? "page" : undefined}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: "var(--icon-tile)",
        padding: "0 13px", borderRadius: "var(--radius-md)", cursor: "pointer", position: "relative",
        border: "var(--border-hairline) solid " + (active ? "transparent" : "var(--color-border-soft)"),
        background: active ? "var(--color-accent-strong)" : h ? "var(--color-accent-soft)" : "transparent",
        color: active ? "var(--color-accent-contrast)" : "var(--text-body)",
        fontFamily: "var(--font-ui)", fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-medium)",
        transition: "var(--transition-control)", overflow: "hidden", whiteSpace: "nowrap"
      }}>
      <span style={{ flex: "0 0 22px", display: "flex", justifyContent: "center" }}><Icon name={icon} size={21} /></span>
      <span style={{ flex: 1, textAlign: "left", opacity: open ? 1 : 0, transition: instant ? "none" : "opacity var(--dur-fast) var(--ease-out)" }}>{label}</span>
      {count ? <span style={{
        position: open ? "static" : "absolute", top: 6, right: 6, minWidth: 18, height: 18, padding: "0 5px",
        borderRadius: "var(--radius-pill)", background: active ? "var(--color-accent-contrast)" : "var(--color-accent-strong)",
        color: active ? "var(--color-accent-strong)" : "var(--color-accent-contrast)", fontSize: "var(--fs-micro)", fontWeight: "var(--fw-bold)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>{count}</span> : null}
      {badge ? <span style={{
        position: "absolute", top: 8, left: 30, width: 7, height: 7, borderRadius: "var(--radius-pill)",
        background: "var(--action-danger)", boxShadow: "0 0 0 2px var(--color-surface)"
      }} /> : null}
    </button>
  );
}

function Sidebar({ view, onView, onSettings, onNotif, hasNotif }) {
  const [open, setOpen] = React.useState(false);
  const [viaTeclado, setViaTeclado] = React.useState(false);
  /* The rail opens for keyboard focus as well as hover, so labels are never mouse-only. Opened
     from the keyboard it snaps open: Tab runs through it many times a day and should never wait
     on an animation. The hover expand keeps its documented 250ms. */
  const abrir = teclado => { setViaTeclado(teclado); setOpen(true); };
  return (
    <div style={{ width: "var(--rail-w)", flex: "0 0 auto", position: "relative", zIndex: 20 }}>
      <nav aria-label="Principal" onMouseEnter={() => abrir(false)} onMouseLeave={() => setOpen(false)}
        onFocus={e => { if (!open) abrir(e.target.matches(":focus-visible")); }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }} style={{
        position: "absolute", top: 0, left: 0, bottom: 0,
        width: open ? "var(--sidebar-w)" : "var(--rail-w)", boxSizing: "border-box",
        display: "flex", flexDirection: "column", gap: "var(--space-2)", padding: "var(--space-6)",
        background: "var(--color-surface)", borderRight: "var(--border-hairline) solid var(--color-border)",
        boxShadow: open ? "0 12px 40px rgba(40,24,16,.16)" : "none", overflow: "hidden",
        transition: viaTeclado ? "none" : "width var(--dur-move) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)"
      }}>
        <div style={{ display: "flex", alignItems: "center", padding: "var(--space-2) 0 var(--space-8)" }}>
          <img src="../../assets/logo-dluh-festas.png" alt="D'Luh Festas" style={{ width: 44, height: 44, objectFit: "contain", marginLeft: 2 }} />
        </div>
        {navItems().map(it => <RailItem key={it.id} {...it} open={open} instant={viaTeclado} active={it.id === view} onClick={() => onView(it.id)} />)}
        <div style={{ flex: 1 }} />
        <RailItem icon="bell" label="Notificações" badge={hasNotif} open={open} instant={viaTeclado} onClick={onNotif} />
        <RailItem icon="settings" label="Configurações" open={open} instant={viaTeclado} onClick={onSettings} />
        <div style={{ borderTop: "var(--border-hairline) solid var(--color-border)", margin: "var(--space-2) 0 0", paddingTop: "var(--space-4)", paddingLeft: 3, whiteSpace: "nowrap" }}>
          <UserChip name="Luciana" role="Dona" compact={!open} />
        </div>
      </nav>
    </div>
  );
}

function BottomNav({ value, onChange }) {
  return (
    <nav aria-label="Principal" style={{
      display: "flex", borderTop: "1px solid var(--color-border)", background: "var(--color-surface)",
      padding: "6px 4px calc(8px + env(safe-area-inset-bottom))", gap: 2, flex: "0 0 auto"
    }}>
      {navItems().map(it => {
        const active = it.id === value;
        return (
          <button key={it.id} type="button" onClick={() => onChange(it.id)} aria-current={active ? "page" : undefined} style={{
            flex: 1, minHeight: "var(--tap-min)", display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 3, border: "none", background: "transparent", cursor: "pointer",
            color: active ? "var(--text-accent)" : "var(--text-muted)", fontFamily: "var(--font-ui)",
            fontSize: "var(--fs-micro)", fontWeight: "var(--fw-semibold)", position: "relative"
          }}>
            <Icon name={it.icon} size={21} />
            {it.label}
            {it.count ? <span style={{
              position: "absolute", top: 2, right: "50%", marginRight: -22, minWidth: 16, height: 16,
              padding: "0 4px", borderRadius: "var(--radius-pill)", background: "var(--color-accent-strong)",
              color: "var(--color-accent-contrast)", fontSize: "var(--fs-micro)", fontWeight: "var(--fw-bold)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>{it.count}</span> : null}
          </button>
        );
      })}
    </nav>
  );
}

function Shell({ view, onView, compact, theme, onTheme, children, q, onQ }) {
  const [cfg, setCfg] = React.useState(false);
  const [notif, setNotif] = React.useState(false);
  const [notifs, setNotifs] = React.useState(() => [...(window.NOTIF_DEMO || [])]);
  const search = <window.GlobalSearch q={q} onQ={onQ} onView={onView} />;
  return (
    <div data-theme={theme} style={{
      "--toast-offset": compact ? "64px" : "0px",
      display: "flex", height: "100%", position: "relative", background: "var(--color-bg)",
      fontFamily: "var(--font-ui)", color: "var(--text-strong)", overflow: "hidden"
    }}>
      {compact ? null : <Sidebar view={view} onView={onView} onSettings={() => setCfg(true)} onNotif={() => setNotif(true)} hasNotif={notifs.length > 0} />}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: compact ? "12px 12px 0" : "var(--space-10) var(--space-11) 0" }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex" }}>{search}</div>
          {compact ? <>
            <IconButton icon="bell" label="Notificações" badge={notifs.length > 0} onClick={() => setNotif(true)} />
            <button type="button" aria-label="Configurações" onClick={() => setCfg(true)} style={{ padding: 0, border: "none", background: "transparent", cursor: "pointer", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserChip name="Luciana" compact />
            </button>
          </> : null}
        </div>
        <main style={{ flex: 1, overflowY: "auto", overscrollBehavior: "none", padding: compact ? "12px" : "var(--pad-page)" }}>{children}</main>
        {compact ? <BottomNav value={view} onChange={onView} /> : null}
      </div>
      <window.Notificacoes onView={onView} compact={compact} />
      <Modal open={notif} onClose={() => setNotif(false)} title="Notificações" width={440}>
        {notifs.length ? <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}><Button size="sm" variant="ghost" icon="check-check" onClick={() => setNotifs([])}>Limpar todas</Button></div>
          {notifs.map((n, i) => <ListRow key={n.title + n.sub} icon={n.icon} title={n.title} subtitle={n.sub} onClick={() => { setNotif(false); onView(n.view); }}
            trailing={<IconButton icon="x" label="Limpar notificação" size={32} style={{ marginLeft: 10 }} onClick={e => { e.stopPropagation(); setNotifs(l => l.filter((_, j) => j !== i)); }} />} />)}
        </div> : <EmptyState icon="bell-off" title="Nenhuma notificação" description="Novos pedidos, pagamentos e vencimentos aparecem aqui." />}
      </Modal>
      <Modal open={cfg} onClose={() => setCfg(false)} title="Configurações" width={420}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-medium)", color: "var(--text-strong)" }}>Tema</span>
          <div style={{ display: "flex", gap: 8 }}>
            <FilterPill icon="sun" trailingIcon={null} active={theme !== "dark"} onClick={() => theme === "dark" && onTheme()}>Claro</FilterPill>
            <FilterPill icon="moon" trailingIcon={null} active={theme === "dark"} onClick={() => theme !== "dark" && onTheme()}>Escuro</FilterPill>
          </div>
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "var(--border-hairline) solid var(--color-border)" }}>
          <Button variant="ghost" block icon="log-out" onClick={() => setCfg(false)}>Sair da conta</Button>
        </div>
      </Modal>
    </div>
  );
}

Object.assign(window, { Shell, BottomNav, navItems });
