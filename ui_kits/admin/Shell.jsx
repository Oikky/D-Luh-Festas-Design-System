const { SidebarNav, Topbar, SearchInput, Button, IconButton, UserChip, Icon } = window.DLuhFestasDesignSystem_c861a2;

const NAV = [
  { id: "visao", label: "Visão geral", icon: "layout-dashboard" },
  { id: "pedidos", label: "Pedidos", icon: "receipt-text", count: 7 },
  { id: "agenda", label: "Agenda", icon: "calendar-days", count: 3 },
  { id: "cozinha", label: "Cozinha", icon: "chef-hat", count: 4 },
  { id: "contratos", label: "Contratos", icon: "file-signature" }
];
const TITLES = {
  visao: ["Visão geral", "Como está o dia na D'Luh Festas"],
  pedidos: ["Pedidos", "Gestão de pedidos D'Luh Festas"],
  agenda: ["Agenda", "Encomendas, eventos, boletos e cartões no mesmo calendário"],
  cozinha: ["Cozinha", "Fila de produção e entrega"],
  contratos: ["Contratos", "Buffet e locação do salão"]
};

function BottomNav({ value, onChange }) {
  return (
    <nav style={{
      display: "flex", borderTop: "1px solid var(--color-border)", background: "var(--color-surface)",
      padding: "6px 4px 8px", gap: 2, flex: "0 0 auto"
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
  const [t, sub] = TITLES[view] || TITLES.visao;
  const themeBtn = <IconButton icon={theme === "dark" ? "sun" : "moon"} label="Alternar tema" onClick={onTheme} />;
  return (
    <div data-theme={theme} style={{
      display: "flex", height: "100%", background: "var(--color-bg)",
      fontFamily: "var(--font-ui)", color: "var(--text-strong)", overflow: "hidden"
    }}>
      {compact ? null : (
        <SidebarNav items={NAV} value={view} onChange={onView} expanded={false}
          logo={<img src="../../assets/logo-dluh-festas.png" alt="D'Luh Festas" style={{ width: 44, height: 44, objectFit: "contain" }} />}
          footer={<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <IconButton icon="settings" label="Configurações" tile />
            <IconButton icon="log-out" label="Sair" tile />
          </div>} />
      )}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Topbar title={t} subtitle={compact ? null : sub}
          search={compact ? null : <SearchInput value={q} onChange={e => onQ(e.target.value)} onClear={() => onQ("")} />}
          actions={compact
            ? <>{themeBtn}<IconButton icon="bell" label="Notificações" badge /></>
            : <>
                <Button variant="ghost" size="sm" icon="plus">Pedido manual</Button>
                <Button variant="ghost" size="sm" icon="refresh-cw">Atualizar</Button>
                {themeBtn}
                <IconButton icon="message-square-more" label="Mensagens" />
                <IconButton icon="bell" label="Notificações" badge />
              </>}
          user={compact ? <UserChip name="Luciana" compact /> : <UserChip name="Luciana" role="Gerente" />} />
        {compact ? <div style={{ padding: "10px 12px 0" }}>
          <SearchInput value={q} onChange={e => onQ(e.target.value)} onClear={() => onQ("")} placeholder="Buscar pedido…" />
        </div> : null}
        <main style={{ flex: 1, overflowY: "auto", padding: compact ? "12px" : "var(--pad-page)" }}>{children}</main>
        {compact ? <BottomNav value={view} onChange={onView} /> : null}
      </div>
    </div>
  );
}

Object.assign(window, { Shell, BottomNav, NAV });
