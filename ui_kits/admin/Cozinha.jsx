const DS = window.DLuhFestasDesignSystem_c861a2;
const { Card, Button, Badge, StatusBadge, IconButton, FilterPill, Icon, ConfirmDialog, Toast, EmptyState } = DS;

const PAGO_TONE = { "Totalmente pago": "success", "Só entrada": "warn", "Não pago": "danger" };

/* Kitchen cards are read at arm's length on a shared tablet: what to make is the largest,
   darkest text on the card, and the one action is a full 44px target. */
function FilaCard({ p, onEntregar, pendente }) {
  return (
    <Card style={{ display: "flex", flexDirection: "column" }}
      header={<>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-accent)", letterSpacing: "var(--ls-caps)" }}>{p.hora}</div>
          <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)", marginTop: 3, overflowWrap: "anywhere" }}>{p.cliente || "Cliente sem nome"}</div>
        </div>
        {p.pago ? <Badge tone={PAGO_TONE[p.pago] || "neutral"} style={{ flex: "0 0 auto" }}>{p.pago}</Badge> : null}
      </>}>
      {p.itens
        ? <div style={{ fontSize: "var(--fs-subhead)", fontWeight: "var(--fw-medium)", color: "var(--text-strong)", lineHeight: "var(--lh-snug)", overflowWrap: "anywhere" }}>{p.itens}</div>
        : <div style={{ fontSize: "var(--fs-body-s)", color: "var(--text-muted)" }}>Itens não informados. Confira o pedido antes de produzir.</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
        <Badge icon={p.entrega === "Entrega" ? "truck" : "shopping-bag"}>{p.entrega}</Badge>
        <div style={{ flex: 1 }} />
        <Button size="lg" tone="delivered" icon="check" loading={pendente} onClick={() => onEntregar(p)}>Feito</Button>
      </div>
    </Card>
  );
}

/* The "Fazer agora" panel sits on the darker terracotta (white text 4.8:1), and its chips darken
   the panel rather than lighten it, so their white labels hold 6:1. */
const chip = { padding: "5px 12px", borderRadius: "var(--radius-pill)", background: "rgba(0,0,0,.15)", fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)" };
const seta = { width: 48, height: 48, background: "rgba(255,255,255,.16)", border: "1.5px solid rgba(255,255,255,.5)", color: "inherit" };

/* The tablet sits on the counter all shift: keep the screen awake while the queue is open.
   Browsers drop the lock when the tab hides, so it is asked for again on return. */
function useTelaAcesa() {
  React.useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let lock = null, vivo = true;
    const pedir = () => { if (document.visibilityState === "visible") navigator.wakeLock.request("screen").then(l => { if (vivo) lock = l; else l.release(); }, () => {}); };
    pedir();
    document.addEventListener("visibilitychange", pedir);
    return () => { vivo = false; document.removeEventListener("visibilitychange", pedir); if (lock) lock.release().catch(() => {}); };
  }, []);
}

function useOnline() {
  const [on, setOn] = React.useState(navigator.onLine);
  React.useEffect(() => {
    const sim = () => setOn(true), nao = () => setOn(false);
    window.addEventListener("online", sim); window.addEventListener("offline", nao);
    return () => { window.removeEventListener("online", sim); window.removeEventListener("offline", nao); };
  }, []);
  return on;
}

/* A queue that looks current but isn't is worse than a delay: say it loudly. */
function SemConexao() {
  return <div role="status" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: "var(--radius-lg)",
    background: "var(--action-warn-bg)", color: "var(--action-warn)", border: "1.5px solid var(--action-warn-line)",
    fontSize: "var(--fs-subhead)", fontWeight: "var(--fw-semibold)" }}>
    <Icon name="wifi-off" size={20} /> Sem conexão — a fila pode estar desatualizada. Ela volta a atualizar sozinha.
  </div>;
}

function Cozinha({ compact }) {
  const carga = useAoVivo("fila");
  const online = useOnline();
  useTelaAcesa();
  const fila = carga.dados || [];
  const [feature, setFeature] = React.useState(0);
  const [confirm, setConfirm] = React.useState(null);
  const [toastNode, showToast] = useToast();
  const [acao, pendente] = useAcao(showToast);
  const [som, setSom] = React.useState(true);
  const atual = Math.min(feature, Math.max(0, fila.length - 1));
  const p = fila[atual];
  /* The kitchen only confirms that an order is done; charging stays with atendimento in Pedidos.
     The card leaves the queue only after the server accepted it. */
  const feito = async x => {
    await acao("feito-" + x.id, { ok: "Pedido marcado como feito", falhou: "Não deu pra marcar como feito" },
      () => carga.setDados(l => l.filter(y => y.id !== x.id)),
      { acao: "marcarFeito", dados: { pedidoId: x.id } });
    setConfirm(null);
  };

  if (carga.estado === "erro" && !carga.dados) return <ErroCarga erro={carga.erro} oque="a fila da cozinha" onTentar={carga.tentar} />;
  if (!carga.dados) return <Carregando oque="a fila" />;

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "var(--gap-section)", minHeight: "100%" }}>
      {!online || carga.doCache ? <SemConexao /> : null}
      {p ? <div style={{
        borderRadius: "var(--radius-xl)", padding: compact ? "18px" : "24px 28px",
        background: "var(--color-accent-strong)", color: "var(--color-accent-contrast)",
        display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap"
      }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)" }}>
            <Icon name="flame" size={16} /> Fazer agora · {atual + 1} de {fila.length}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: compact ? "var(--fs-display-s)" : "var(--fs-display)", fontWeight: "var(--fw-bold)", lineHeight: "var(--lh-tight)", marginTop: 8, overflowWrap: "anywhere" }}>
            {p.cliente || "Cliente sem nome"}
          </div>
          <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)", marginTop: 8, lineHeight: "var(--lh-snug)", overflowWrap: "anywhere" }}>{p.itens || "Itens não informados"}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {[p.hora, p.entrega, p.pago].filter(Boolean).map(c => <span key={c} style={chip}>{c}</span>)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: compact ? "row" : "column", alignItems: compact ? "center" : "stretch", gap: 8, width: compact ? "100%" : "auto" }}>
          <Button size="lg" icon="check" loading={pendente === "feito-" + p.id} onClick={() => setConfirm(p)}
            style={{ background: "var(--color-accent-contrast)", color: "var(--color-accent-strong)", flex: compact ? 1 : "none" }}>Feito</Button>
          {fila.length > 1 ? <div style={{ display: "flex", gap: 8 }}>
            <IconButton icon="chevron-left" label="Pedido anterior" onClick={() => setFeature((atual - 1 + fila.length) % fila.length)} style={seta} />
            <IconButton icon="chevron-right" label="Próximo pedido" onClick={() => setFeature((atual + 1) % fila.length)} style={seta} />
          </div> : null}
        </div>
      </div> : null}

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-heading)", fontWeight: "var(--fw-semibold)" }}>Fila de produção</div>
          <Badge>{fila.length} {fila.length === 1 ? "pedido" : "pedidos"}</Badge>
          <div style={{ flex: 1 }} />
          <FilterPill icon={som ? "volume-2" : "volume-x"} trailingIcon={null} active={som} onClick={() => { setSom(!som); showToast(som ? "Alerta sonoro desligado" : "Alerta sonoro ligado"); }}>Alerta sonoro</FilterPill>
          <FilterPill icon="printer" trailingIcon={null} onClick={() => showToast("Fila enviada para impressão")}>Imprimir fila</FilterPill>
        </div>
        {fila.length
          ? <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {fila.map(x => <FilaCard key={x.id} p={x} onEntregar={setConfirm} pendente={pendente === "feito-" + x.id} />)}
            </div>
          : <Card padded={false}><EmptyState icon="chef-hat" title="Fila vazia"
              description="Tudo o que estava em produção já foi feito. Pedidos que entram em produção aparecem aqui sozinhos." /></Card>}
      </div>

      {confirm ? <ConfirmDialog tone="delivered" icon="check" title="Marcar como feito?"
        message={[confirm.cliente || "Cliente sem nome", [confirm.entrega && confirm.entrega.toLowerCase(), confirm.hora && confirm.hora !== "—" ? "às " + confirm.hora : null].filter(Boolean).join(" ")].filter(Boolean).join(" — ") + ". O pedido sai da fila."}
        cancelLabel="Voltar" confirmLabel="Sim, marcar feito" pending={pendente === "feito-" + confirm.id}
        onCancel={() => setConfirm(null)} onConfirm={() => feito(confirm)} /> : null}
      {toastNode}
    </div>
  );
}

function Clientes() {
  return <Card padded={false}><EmptyState icon="users" title="Tela de clientes ainda não existe no produto"
    description="O sistema atual não tem uma visão por cliente — o histórico vive no Coda. Deixada em branco de propósito." /></Card>;
}

Object.assign(window, { Cozinha, FilaCard, Clientes });
