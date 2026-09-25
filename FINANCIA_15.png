const DS = window.DLuhFestasDesignSystem_c861a2;
const { Card, Button, Badge, StatusBadge, IconButton, FilterPill, Icon, ConfirmDialog, Toast, EmptyState } = DS;

const PAGO_TONE = { "Totalmente pago": "success", "Só entrada": "warn", "Não pago": "danger" };

function FilaCard({ p, onEntregar }) {
  return (
    <Card style={{ display: "flex", flexDirection: "column" }}
      header={<>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--color-accent)", letterSpacing: "var(--ls-caps)" }}>{p.hora}</div>
          <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)", marginTop: 3 }}>{p.cliente}</div>
        </div>
        <Badge tone={PAGO_TONE[p.pago]}>{p.pago}</Badge>
      </>}>
      <div style={{ fontSize: "var(--fs-body-s)", color: "var(--text-body)", lineHeight: "var(--lh-normal)" }}>{p.itens}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
        <Badge icon={p.entrega === "Entrega" ? "truck" : "shopping-bag"}>{p.entrega}</Badge>
        <div style={{ flex: 1 }} />
        <Button size="sm" tone="delivered" icon="check" onClick={() => onEntregar(p)}>Feito</Button>
      </div>
    </Card>
  );
}

function Cozinha({ compact }) {
  const fila = window.DLUH.fila;
  const [feature, setFeature] = React.useState(0);
  const [confirm, setConfirm] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const [som, setSom] = React.useState(true);
  const p = fila[feature];
  const showToast = m => { setToast(m); setTimeout(() => setToast(null), 2400); };

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "var(--gap-section)", minHeight: "100%" }}>
      <div style={{
        borderRadius: "var(--radius-xl)", padding: compact ? "18px" : "24px 28px",
        background: "var(--color-accent)", color: "var(--color-accent-contrast)",
        display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap"
      }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--fs-small)", fontWeight: "var(--fw-semibold)", opacity: .85 }}>
            <Icon name="flame" size={16} /> Fazer agora · {feature + 1} de {fila.length}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: compact ? "var(--fs-display-s)" : "var(--fs-display)", fontWeight: "var(--fw-bold)", lineHeight: "var(--lh-tight)", marginTop: 8 }}>
            {p.cliente}
          </div>
          <div style={{ fontSize: "var(--fs-subhead)", marginTop: 8, opacity: .92, lineHeight: "var(--lh-snug)" }}>{p.itens}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <span style={{ padding: "5px 12px", borderRadius: "var(--radius-pill)", background: "rgba(255,255,255,.22)", fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)" }}>{p.hora}</span>
            <span style={{ padding: "5px 12px", borderRadius: "var(--radius-pill)", background: "rgba(255,255,255,.22)", fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)" }}>{p.entrega}</span>
            <span style={{ padding: "5px 12px", borderRadius: "var(--radius-pill)", background: "rgba(255,255,255,.22)", fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)" }}>{p.pago}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: compact ? "row" : "column", gap: 8 }}>
          <IconButton icon="chevron-left" label="Anterior" onClick={() => setFeature((feature - 1 + fila.length) % fila.length)}
            style={{ background: "rgba(255,255,255,.16)", border: "1.5px solid rgba(255,255,255,.3)", color: "inherit" }} />
          <IconButton icon="chevron-right" label="Próximo" onClick={() => setFeature((feature + 1) % fila.length)}
            style={{ background: "rgba(255,255,255,.16)", border: "1.5px solid rgba(255,255,255,.3)", color: "inherit" }} />
        </div>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-heading)", fontWeight: "var(--fw-semibold)" }}>Fila de hoje</div>
          <Badge>{fila.length} pedidos</Badge>
          <div style={{ flex: 1 }} />
          <FilterPill icon={som ? "volume-2" : "volume-x"} trailingIcon={null} active={som} onClick={() => { setSom(!som); showToast(som ? "Alerta sonoro desligado" : "Alerta sonoro ligado"); }}>Alerta sonoro</FilterPill>
          <FilterPill icon="printer" trailingIcon={null} onClick={() => showToast("Fila enviada para impressão")}>Imprimir fila</FilterPill>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {fila.map(x => <FilaCard key={x.id} p={x} onEntregar={setConfirm} />)}
        </div>
      </div>

      {confirm ? <ConfirmDialog icon="truck" title="Pedido feito?"
        message={`${confirm.cliente} — ${confirm.entrega.toLowerCase()} às ${confirm.hora}. O que fazer com o pagamento?`}
        cancelLabel="Sem cobrar" confirmLabel="Cobrar restante"
        onCancel={() => { setConfirm(null); showToast("Pedido marcado como feito"); }}
        onConfirm={() => { setConfirm(null); showToast("Cobrança do restante enviada"); }} /> : null}
      {toast ? <Toast tone="success" icon="check">{toast}</Toast> : null}
    </div>
  );
}

function Clientes() {
  return <Card padded={false}><EmptyState icon="users" title="Tela de clientes ainda não existe no produto"
    description="O sistema atual não tem uma visão por cliente — o histórico vive no Coda. Deixada em branco de propósito." /></Card>;
}

Object.assign(window, { Cozinha, FilaCard, Clientes });
