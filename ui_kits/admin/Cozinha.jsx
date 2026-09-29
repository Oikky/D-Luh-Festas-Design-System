const DS = window.DLuhFestasDesignSystem_c861a2;
const { Card, Button, Badge, StatusBadge, IconButton, FilterPill, Icon, ConfirmDialog, Toast, EmptyState } = DS;

const PAGO_TONE = { "Totalmente pago": "success", "Só entrada": "warn", "Não pago": "danger" };

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

  const barra = <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
    <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-heading)", fontWeight: "var(--fw-semibold)" }}>Fila de produção</div>
    <Badge>{fila.length} {fila.length === 1 ? "pedido" : "pedidos"}</Badge>
    <div style={{ flex: 1 }} />
    <FilterPill icon={som ? "volume-2" : "volume-x"} trailingIcon={null} active={som} onClick={() => { setSom(!som); showToast(som ? "Alerta sonoro desligado" : "Alerta sonoro ligado"); }}>Alerta sonoro</FilterPill>
    <FilterPill icon="printer" trailingIcon={null} onClick={() => showToast("Fila enviada para impressão")}>Imprimir fila</FilterPill>
  </div>;
  const vazia = <Card padded={false}><EmptyState icon="chef-hat" title="Fila vazia"
    description="Tudo o que estava em produção já foi feito. Pedidos que entram em produção aparecem aqui sozinhos." /></Card>;

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "var(--gap-section)", minHeight: "100%" }}>
      {!online || carga.doCache ? <SemConexao /> : null}
      <FilaTrilho fila={fila} atual={atual} p={p} setFeature={setFeature} setConfirm={setConfirm} pendente={pendente} compact={compact} barra={barra} vazia={vazia} />
      {confirm ? <ConfirmDialog tone="delivered" icon="check" title="Marcar como feito?"
        message={[confirm.cliente || "Cliente sem nome", [confirm.entrega && confirm.entrega.toLowerCase(), confirm.hora && confirm.hora !== "—" ? "às " + confirm.hora : null].filter(Boolean).join(" ")].filter(Boolean).join(" — ") + ". O pedido sai da fila."}
        cancelLabel="Voltar" confirmLabel="Sim, marcar feito" pending={pendente === "feito-" + confirm.id}
        onCancel={() => setConfirm(null)} onConfirm={() => feito(confirm)} /> : null}
      {toastNode}
    </div>
  );
}

/* "50 Kibe · 25 Coxinha" → one line per item, quantity split out so it can be read at a glance. */
const linhas = s => String(s || "").split(" · ").filter(Boolean).map(t => {
  const m = t.match(/^(\d+)\s+(.+)$/);
  return m ? { qtd: m[1], nome: m[2] } : { qtd: null, nome: t };
});
/* "28/09 · 19:00" → { dia, hora }; a bare "14:00" is today. */
const quando = h => {
  const s = String(h || "—"), i = s.indexOf(" · ");
  return i < 0 ? { dia: "Hoje", hora: s } : { dia: s.slice(0, i), hora: s.slice(i + 3) };
};
const num = { fontVariantNumeric: "tabular-nums" };

function Itens({ itens, grande }) {
  const l = linhas(itens);
  if (!l.length) return <div style={{ fontSize: "var(--fs-body-s)", color: "var(--text-muted)" }}>Itens não informados. Confira o pedido antes de produzir.</div>;
  return <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: grande ? 8 : 5 }}>
    {l.map((x, i) => <li key={i} style={{ display: "flex", gap: 10, alignItems: "baseline", fontSize: grande ? "var(--fs-title)" : "var(--fs-subhead)", lineHeight: "var(--lh-snug)", color: "var(--text-strong)" }}>
      <span style={{ ...num, minWidth: grande ? 40 : 30, textAlign: "right", flex: "0 0 auto", fontWeight: "var(--fw-bold)", color: "var(--text-accent)" }}>{x.qtd || "–"}</span>
      <span style={{ fontWeight: "var(--fw-medium)", overflowWrap: "anywhere" }}>{x.nome}</span>
    </li>)}
  </ul>;
}

function Setas({ fila, atual, setFeature }) {
  if (fila.length < 2) return null;
  return <div style={{ display: "flex", gap: 8 }}>
    <IconButton icon="chevron-left" label="Pedido anterior" onClick={() => setFeature((atual - 1 + fila.length) % fila.length)} />
    <IconButton icon="chevron-right" label="Próximo pedido" onClick={() => setFeature((atual + 1) % fila.length)} />
  </div>;
}

const Selos = ({ x }) => <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
  <Badge icon={x.entrega === "Entrega" ? "truck" : "shopping-bag"}>{x.entrega}</Badge>
  {x.pago ? <Badge tone={PAGO_TONE[x.pago] || "neutral"}>{x.pago}</Badge> : null}
</div>;

/* The order to make now stays pinned on the left, read at arm's length on the counter tablet;
   the rest of the queue is a rail of rows on the right, latest first. Tapping a row brings it
   to the left. On a phone the two stack. */
function FilaTrilho({ fila, atual, p, setFeature, setConfirm, pendente, compact, barra, vazia }) {
  const q = quando(p && p.hora);
  return <div style={{ display: "grid", gridTemplateColumns: compact || !p ? "1fr" : "minmax(0, 5fr) minmax(0, 4fr)", gap: "var(--gap-section)", alignItems: "start" }}>
    {p ? <section aria-label="Fazer agora" style={{
      position: compact ? "static" : "sticky", top: 0, background: "var(--color-surface)", border: "var(--border-hairline) solid var(--color-border)",
      borderRadius: "var(--radius-xl)", padding: compact ? 18 : 28, display: "flex", flexDirection: "column", gap: 18, boxShadow: "var(--shadow-card)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-accent)", fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)" }}>
        <Icon name="flame" size={16} /> Fazer agora · {atual + 1} de {fila.length}
        <div style={{ flex: 1 }} />
        <Setas fila={fila} atual={atual} setFeature={setFeature} />
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <span style={{ ...num, fontSize: compact ? "var(--fs-display)" : "var(--fs-display-l)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-display)", lineHeight: 1 }}>{q.hora}</span>
          <span style={{ fontSize: "var(--fs-subhead)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)" }}>{q.dia}</span>
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: compact ? "var(--fs-display-s)" : "var(--fs-display)", fontWeight: "var(--fw-bold)", lineHeight: "var(--lh-tight)", marginTop: 10, overflowWrap: "anywhere" }}>{p.cliente || "Cliente sem nome"}</div>
      </div>
      <Itens itens={p.itens} grande />
      <Selos x={p} />
      <Button size="lg" tone="delivered" icon="check" block loading={pendente === "feito-" + p.id} onClick={() => setConfirm(p)}>Feito</Button>
    </section> : null}
    <section>
      {barra}
      {fila.length ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {fila.map((x, i) => ({ x, i })).reverse().map(({ x, i }) => {
          const r = quando(x.hora), sel = i === atual;
          return <div key={x.id} data-row-action role="button" tabIndex={0} aria-pressed={sel}
            onClick={() => setFeature(i)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFeature(i); } }}
            style={{ display: "grid", gridTemplateColumns: "64px minmax(0, 1fr) auto", gap: 14, alignItems: "center", padding: "12px 14px",
              borderRadius: "var(--radius-lg)", cursor: "pointer", transition: "var(--transition-control)",
              background: sel ? "var(--color-accent-soft)" : "var(--color-surface)",
              border: `var(--border-hairline) solid ${sel ? "var(--color-accent)" : "var(--color-border)"}` }}>
            <div>
              <div style={{ ...num, fontSize: "var(--fs-heading)", fontWeight: "var(--fw-semibold)", lineHeight: 1.1, color: sel ? "var(--text-accent)" : "var(--text-strong)" }}>{r.hora}</div>
              <div style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)", marginTop: 2 }}>{r.dia}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "var(--fs-subhead)", fontWeight: "var(--fw-semibold)", overflowWrap: "anywhere" }}>{x.cliente || "Cliente sem nome"}</div>
              <div style={{ fontSize: "var(--fs-body-s)", color: "var(--text-body)", marginTop: 3, lineHeight: "var(--lh-snug)",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{x.itens || "Itens não informados"}</div>
            </div>
            <Button tone="delivered" icon="check" loading={pendente === "feito-" + x.id} onClick={e => { e.stopPropagation(); setConfirm(x); }}>Feito</Button>
          </div>;
        })}
      </div> : vazia}
    </section>
  </div>;
}

function Clientes() {
  return <Card padded={false}><EmptyState icon="users" title="Tela de clientes ainda não existe no produto"
    description="O sistema atual não tem uma visão por cliente — o histórico vive no Coda. Deixada em branco de propósito." /></Card>;
}

Object.assign(window, { Cozinha, Clientes });
