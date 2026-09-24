const { SearchInput, IconButton, UserChip, Icon, Modal, FilterPill, Button, ListRow, EmptyState } = window.DLuhFestasDesignSystem_c861a2;

const NAV = [
  { id: "visao", label: "Visão geral", icon: "layout-dashboard" },
  { id: "pedidos", label: "Pedidos", icon: "receipt-text", count: 7 },
  { id: "agenda", label: "Agenda", icon: "calendar-days", count: 3 },
  { id: "cozinha", label: "Cozinha", icon: "chef-hat", count: 4 },
  { id: "financeiro", label: "Financeiro", icon: "wallet" }
];

function RailItem({ icon, label, count, active, badge, open, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <button type="button" onClick={onClick} title={open ? undefined : label} aria-current={active ? "page" : undefined}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: "var(--icon-tile)",
        padding: "0 13px", borderRadius: "var(--radius-md)", cursor: "pointer", position: "relative",
        border: "var(--border-hairline) solid " + (active ? "transparent" : "var(--color-border-soft)"),
        background: active ? "var(--color-accent)" : h ? "var(--color-accent-soft)" : "transparent",
        color: active ? "var(--color-accent-contrast)" : "var(--text-body)",
        fontFamily: "var(--font-ui)", fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-medium)",
        transition: "var(--transition-control)", overflow: "hidden", whiteSpace: "nowrap"
      }}>
      <span style={{ flex: "0 0 22px", display: "flex", justifyContent: "center" }}><Icon name={icon} size={21} /></span>
      <span style={{ flex: 1, textAlign: "left", opacity: open ? 1 : 0, transition: "opacity var(--dur-base) var(--ease-standard)" }}>{label}</span>
      {count ? <span style={{
        position: open ? "static" : "absolute", top: 6, right: 6, minWidth: 18, height: 18, padding: "0 5px",
        borderRadius: "var(--radius-pill)", background: active ? "rgba(255,255,255,.28)" : "var(--color-accent)",
        color: "var(--color-accent-contrast)", fontSize: "var(--fs-micro)", fontWeight: "var(--fw-bold)",
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
  return (
    <div style={{ width: "var(--rail-w)", flex: "0 0 auto", position: "relative", zIndex: 20 }}>
      <nav onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} style={{
        position: "absolute", top: 0, left: 0, bottom: 0,
        width: open ? "var(--sidebar-w)" : "var(--rail-w)", boxSizing: "border-box",
        display: "flex", flexDirection: "column", gap: "var(--space-2)", padding: "var(--space-6)",
        background: "var(--color-surface)", borderRight: "var(--border-hairline) solid var(--color-border)",
        boxShadow: open ? "0 12px 40px rgba(40,24,16,.16)" : "none", overflow: "hidden",
        transition: "width var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)"
      }}>
        <div style={{ display: "flex", alignItems: "center", padding: "var(--space-2) 0 var(--space-8)" }}>
          <img src="../../assets/logo-dluh-festas.png" alt="D'Luh Festas" style={{ width: 44, height: 44, objectFit: "contain", marginLeft: 2 }} />
        </div>
        {NAV.map(it => <RailItem key={it.id} {...it} open={open} active={it.id === view} onClick={() => onView(it.id)} />)}
        <div style={{ flex: 1 }} />
        <RailItem icon="bell" label="Notificações" badge={hasNotif} open={open} onClick={onNotif} />
        <RailItem icon="settings" label="Configurações" open={open} onClick={onSettings} />
        <div style={{ borderTop: "var(--border-hairline) solid var(--color-border)", margin: "var(--space-2) 0 0", paddingTop: "var(--space-4)", paddingLeft: 3, whiteSpace: "nowrap" }}>
          <UserChip name="Luciana" role="Gerente" compact={!open} />
        </div>
      </nav>
    </div>
  );
}

function BottomNav({ value, onChange }) {
  return (
    <nav style={{
      display: "flex", borderTop: "1px solid var(--color-border)", background: "var(--color-surface)",
      padding: "6px 4px calc(8px + env(safe-area-inset-bottom))", gap: 2, flex: "0 0 auto"
    }}>
      {NAV.map(it => {
        const active = it.id === value;
        return (
          <button key={it.id} type="button" onClick={() => onChange(it.id)} style={{
            flex: 1, minHeight: "var(--tap-min)", display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 3, border: "none", background: "transparent", cursor: "pointer",
            color: active ? "var(--color-accent)" : "var(--text-muted)", fontFamily: "var(--font-ui)",
            fontSize: "var(--fs-micro)", fontWeight: "var(--fw-semibold)", position: "relative"
          }}>
            <Icon name={it.icon} size={21} />
            {it.label}
            {it.count ? <span style={{
              position: "absolute", top: 2, right: "50%", marginRight: -22, minWidth: 16, height: 16,
              padding: "0 4px", borderRadius: "var(--radius-pill)", background: "var(--color-accent)",
              color: "var(--color-accent-contrast)", fontSize: 9.5, fontWeight: "var(--fw-bold)",
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
      display: "flex", height: "100%", position: "relative", background: "var(--color-bg)",
      fontFamily: "var(--font-ui)", color: "var(--text-strong)", overflow: "hidden"
    }}>
      {compact ? null : <Sidebar view={view} onView={onView} onSettings={() => setCfg(true)} onNotif={() => setNotif(true)} hasNotif={notifs.length > 0} />}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: compact ? "12px" : "var(--pad-page)", paddingBottom: 0 }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex" }}>{search}</div>
          {compact ? <><IconButton icon="bell" label="Notificações" badge={notifs.length > 0} onClick={() => setNotif(true)} /><UserChip name="Luciana" compact /></> : null}
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

Object.assign(window, { Shell, BottomNav, NAV });
