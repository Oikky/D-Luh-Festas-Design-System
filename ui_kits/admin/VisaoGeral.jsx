const { Card, ListRow, StatusBadge, Button, IconButton, Badge, Icon, EmptyState } = window.DLuhFestasDesignSystem_c861a2;

function ChartCard({ compact }) {
  const serie = window.DLUH.serieReceita;
  const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const max = Math.max(...serie);
  return (
    <Card header={<>
      <div>
        <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>Receita da semana</div>
        <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>08 – 14 de junho</div>
      </div>
    </>}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: compact ? 6 : 12, height: 150 }}>
        {serie.map((v, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, minWidth: 0 }}>
            <span style={{ fontSize: "var(--fs-micro)", color: "var(--text-muted)", fontWeight: "var(--fw-semibold)" }}>
              {(v / 1000).toFixed(1).replace(".", ",")}k
            </span>
            <div style={{
              width: "100%", height: (v / max) * 104, borderRadius: "var(--radius-xs)",
              background: "var(--color-accent-soft)", border: "1px solid var(--color-accent)"
            }} />
            <span style={{ fontSize: "var(--fs-micro)", color: "var(--text-muted)" }}>{dias[i]}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

const RECENT_COLS = "minmax(0,1.4fr) minmax(0,1.3fr) minmax(0,1fr) minmax(0,.8fr)";

function VisaoGeral({ compact, onView }) {
  const d = window.DLUH;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-section)" }}>
      {/* The indicators have no data source yet. Until one exists they say so, instead of
          showing typed-in numbers that read as real. */}
      <Card padded={false} header={<div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>Indicadores</div>}>
        <EmptyState icon="chart-no-axes-column" title="Sem dados para os indicadores ainda"
          description="Pedidos do dia, valor a receber, fila da cozinha e ticket médio aparecem aqui quando houver uma fonte de dados ligada." />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "1.6fr 1fr", gap: 12, alignItems: "start" }}>
        <ChartCard compact={compact} />
        <Card header={<>
          <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>Pagamentos recentes</div>
          <IconButton icon="arrow-up-right" label="Abrir financeiro" size={32} onClick={() => onView("financeiro")} />
        </>} bodyStyle={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {d.pagamentos.map((p, i) => <ListRow key={i} icon={p.icon} title={p.title} subtitle={p.sub} value={p.value} tone={p.tone} />)}
        </Card>
      </div>

      <Card padded={false} header={<>
        <div>
          <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>Últimos pedidos</div>
          <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>Os {d.recentes.length} mais recentes</div>
        </div>
        <Button size="sm" variant="ghost" iconRight="arrow-right" onClick={() => onView("pedidos")}>Ver todos</Button>
      </>}>
        <div style={{ padding: compact ? "4px 0" : "8px 0" }}>
          {compact ? null : <div style={{ display: "grid", gridTemplateColumns: RECENT_COLS, gap: 12, padding: "4px 18px 8px", fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)" }}>
            <span>Cliente</span><span>Status</span><span>Entrega</span><span style={{ textAlign: "right" }}>Total</span>
          </div>}
          {d.recentes.map(r => compact ? (
            <div key={r.id} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "12px 16px", borderTop: "var(--border-hairline) solid var(--color-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)" }}>{r.nome}</span>
                <span style={{ fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)", whiteSpace: "nowrap" }}>{r.total}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                <StatusBadge status={r.status} short /><Badge>{r.cat}</Badge>
                <span style={{ marginLeft: "auto", fontSize: "var(--fs-tiny)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}><Icon name="clock" size={13} />{r.data} · {r.hora}</span>
              </div>
            </div>
          ) : (
            <div key={r.id} style={{ display: "grid", gridTemplateColumns: RECENT_COLS, gap: 12, alignItems: "center", padding: "11px 18px", borderTop: "var(--border-hairline) solid var(--color-border)", fontSize: "var(--fs-body-s)" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: "var(--fw-semibold)", color: "var(--text-strong)" }}>{r.nome}</div>
                <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>{r.cat}</div>
              </div>
              <div style={{ minWidth: 0 }}><StatusBadge status={r.status} short /></div>
              <div style={{ color: "var(--text-body)", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}><Icon name="clock" size={14} style={{ color: "var(--text-muted)" }} />{r.data} · {r.hora}</div>
              <div style={{ textAlign: "right", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)", whiteSpace: "nowrap" }}>{r.total}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { VisaoGeral, ChartCard });
