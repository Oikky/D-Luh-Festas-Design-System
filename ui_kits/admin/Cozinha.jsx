const DS = window.DLuhFestasDesignSystem_c861a2;
const { Card, Button, Badge, StatusBadge, IconButton, FilterPill, Icon, ConfirmDialog, Toast, EmptyState, Modal, Field, Input } = DS;

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
  /* One day at a time, any day of the calendar. "Hoje" is today plus anything late; the days
     that have orders in production are one tap away, so the kitchen can get ahead. */
  const todos = carga.dados || [];
  const hoje = window.DLUH_API.hoje();
  const diaDe = x => !x.data || x.data < hoje ? hoje : x.data;
  const diasComPedido = [...new Set(todos.map(diaDe))].sort();
  const [dia, setDia] = React.useState(hoje);
  const fila = todos.filter(x => diaDe(x) === dia);
  const [feature, setFeature] = React.useState(0);
  const trocarDia = d => { if (/^\d{4}-\d{2}-\d{2}$/.test(d || "")) { setDia(d); setFeature(0); } };
  const [imprimirVarios, setImprimirVarios] = React.useState(false);
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

  /* One slip per order, cut apart by the printer (Catalogo.jsx). The queue prints soonest first,
     the order the kitchen makes them in. */
  const imprimir = lista => {
    if (!lista.length) return showToast("A fila está vazia");
    window.imprimirPedidos(lista).then(n => showToast(n === 1 ? "Pedido enviado para a impressora" : `${n} pedidos enviados para a impressora`));
  };

  if (carga.estado === "erro" && !carga.dados) return <ErroCarga erro={carga.erro} oque="a fila da cozinha" onTentar={carga.tentar} />;
  if (!carga.dados) return <Carregando oque="a fila" />;

  const barra = <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
    <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-heading)", fontWeight: "var(--fw-semibold)" }}>Fila de produção</div>
    <Badge>{fila.length} {fila.length === 1 ? "pedido" : "pedidos"}</Badge>
    <div style={{ flex: 1 }} />
    <FilterPill icon={som ? "volume-2" : "volume-x"} trailingIcon={null} active={som} onClick={() => { setSom(!som); showToast(som ? "Alerta sonoro desligado" : "Alerta sonoro ligado"); }}>Alerta sonoro</FilterPill>
    <FilterPill icon="printer" trailingIcon={null} onClick={() => imprimir(fila)}>Imprimir dia</FilterPill>
    <FilterPill icon="calendar-range" trailingIcon={null} onClick={() => setImprimirVarios(true)}>Imprimir vários dias</FilterPill>
  </div>;
  const outros = todos.length - fila.length;
  const vazia = <Card padded={false}><EmptyState icon="chef-hat" title={`Nada para ${nomeDia(dia, hoje).toLowerCase()}`}
    description={outros
      ? `Não há pedido em produção para esse dia. ${outros === 1 ? "Há 1 pedido" : `Há ${outros} pedidos`} em outros dias, nos botões acima.`
      : "Tudo o que estava em produção já foi feito. Pedidos que entram em produção aparecem aqui sozinhos."} /></Card>;
  const seletorDias = <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
    <IconButton icon="chevron-left" label="Dia anterior" onClick={() => trocarDia(somarDias(dia, -1))} />
    <label style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 8, height: "var(--tap-min)", padding: "0 14px", borderRadius: "var(--radius-sm)",
      border: "var(--border-hairline) solid var(--color-border-strong)", background: "var(--color-surface)", cursor: "pointer",
      fontSize: "var(--fs-subhead)", fontWeight: "var(--fw-semibold)", minWidth: 150 }}>
      <Icon name="calendar-days" size={17} /> {nomeDia(dia, hoje)}
      {/* The native date picker opens over the whole label: the full calendar, any day. */}
      <input type="date" aria-label="Escolher o dia" value={dia} onChange={e => trocarDia(e.target.value)}
        onClick={e => e.currentTarget.showPicker?.()}
        style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", colorScheme: "dark light" }} />
    </label>
    <IconButton icon="chevron-right" label="Próximo dia" onClick={() => trocarDia(somarDias(dia, 1))} />
    {dia !== hoje ? <Button variant="ghost" icon="flame" onClick={() => trocarDia(hoje)}>Hoje</Button> : null}
    {diasComPedido.filter(d => d !== dia).length ? <div role="group" aria-label="Dias com pedido" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: 4 }}>
      {diasComPedido.filter(d => d !== dia).map(d =>
        <FilterPill key={d} trailingIcon={null} onClick={() => trocarDia(d)}>{nomeDia(d, hoje)} · {todos.filter(x => diaDe(x) === d).length}</FilterPill>)}
    </div> : null}
  </div>;

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "var(--gap-section)", minHeight: "100%" }}>
      {!online || carga.doCache ? <SemConexao /> : null}
      {seletorDias}
      <FilaTrilho hoje={dia === hoje} fila={fila} atual={atual} p={p} setFeature={setFeature} setConfirm={setConfirm} pendente={pendente} compact={compact} barra={barra} vazia={vazia}
        onImprimir={x => imprimir([x])} />
      {confirm ? <ConfirmDialog tone="delivered" icon="check" title="Marcar como feito?"
        message={[confirm.cliente || "Cliente sem nome", [confirm.entrega && confirm.entrega.toLowerCase(), confirm.hora && confirm.hora !== "—" ? "às " + confirm.hora : null].filter(Boolean).join(" ")].filter(Boolean).join(" — ") + ". O pedido sai da fila."}
        cancelLabel="Voltar" confirmLabel="Sim, marcar feito" pending={pendente === "feito-" + confirm.id}
        onCancel={() => setConfirm(null)} onConfirm={() => feito(confirm)} /> : null}
      {imprimirVarios ? <ImprimirPeriodo todos={todos} diaDe={diaDe} hoje={hoje} inicio={dia} onClose={() => setImprimirVarios(false)}
        onImprimir={lista => { setImprimirVarios(false); imprimir(lista); }} /> : null}
      {toastNode}
    </div>
  );
}

/* Pick a range of days and print every order in it, day by day and hour by hour, each on its
   own cut slip. Late orders count as today. */
function ImprimirPeriodo({ todos, diaDe, hoje, inicio, onClose, onImprimir }) {
  const [de, setDe] = React.useState(inicio);
  const [ate, setAte] = React.useState(somarDias(inicio, 6));
  const [a, b] = de <= ate ? [de, ate] : [ate, de];
  const lista = todos.filter(x => diaDe(x) >= a && diaDe(x) <= b)
    .sort((x, y) => `${diaDe(x)} ${x.imp?.hora || ""}`.localeCompare(`${diaDe(y)} ${y.imp?.hora || ""}`));
  const porDia = [...new Set(lista.map(diaDe))].map(d => [d, lista.filter(x => diaDe(x) === d).length]);
  return <Modal width={460} title="Imprimir vários dias" onClose={onClose}
    subtitle="Cada pedido sai num papel cortado, em ordem de dia e horário."
    footer={<>
      <Button variant="ghost" block onClick={onClose}>Voltar</Button>
      <Button block icon="printer" disabled={!lista.length} onClick={() => onImprimir(lista)}>
        {lista.length ? `Imprimir ${lista.length} ${lista.length === 1 ? "pedido" : "pedidos"}` : "Nada para imprimir"}</Button>
    </>}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <Field label="De"><Input type="date" value={de} onChange={e => e.target.value && setDe(e.target.value)} /></Field>
      <Field label="Até"><Input type="date" value={ate} onChange={e => e.target.value && setAte(e.target.value)} /></Field>
    </div>
    <div style={{ marginTop: 14, fontSize: "var(--fs-body-s)", color: "var(--text-body)", lineHeight: "var(--lh-normal)" }}>
      {porDia.length
        ? porDia.map(([d, n]) => <div key={d} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: "var(--border-hairline) solid var(--color-border)" }}>
            <span>{nomeDia(d, hoje)}</span><span style={{ fontWeight: "var(--fw-semibold)" }}>{n} {n === 1 ? "pedido" : "pedidos"}</span></div>)
        : "Nenhum pedido em produção nesses dias."}
    </div>
  </Modal>;
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
const somarDias = (iso, n) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
/* "2026-10-01" → "Hoje", "Amanhã", "Ontem" or "Qua 01/10". */
const SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
function nomeDia(iso, hoje) {
  if (iso === hoje) return "Hoje";
  const d = new Date(iso + "T12:00:00");
  if (iso === somarDias(hoje, 1)) return "Amanhã";
  if (iso === somarDias(hoje, -1)) return "Ontem";
  return `${SEMANA[d.getDay()]} ${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

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
function FilaTrilho({ hoje = true, fila, atual, p, setFeature, setConfirm, pendente, compact, barra, vazia, onImprimir }) {
  const q = quando(p && p.hora);
  return <div style={{ display: "grid", gridTemplateColumns: compact || !p ? "1fr" : "minmax(0, 5fr) minmax(0, 4fr)", gap: "var(--gap-section)", alignItems: "start" }}>
    {p ? <section aria-label="Fazer agora" style={{
      position: compact ? "static" : "sticky", top: 0, background: "var(--color-surface)", border: "var(--border-hairline) solid var(--color-border)",
      borderRadius: "var(--radius-xl)", padding: compact ? 18 : 28, display: "flex", flexDirection: "column", gap: 18, boxShadow: "var(--shadow-card)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-accent)", fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)" }}>
        <Icon name={hoje ? "flame" : "calendar-days"} size={16} /> {hoje ? "Fazer agora" : "Pedido"} · {atual + 1} de {fila.length}
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
      <div style={{ display: "flex", gap: 8 }}>
        <Button size="lg" variant="ghost" icon="printer" onClick={() => onImprimir(p)}>Imprimir</Button>
        <Button size="lg" tone="delivered" icon="check" block loading={pendente === "feito-" + p.id} onClick={() => setConfirm(p)} style={{ flex: 1 }}>Feito</Button>
      </div>
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
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <IconButton icon="printer" label={`Imprimir pedido de ${x.cliente || "cliente sem nome"}`} onClick={e => { e.stopPropagation(); onImprimir(x); }} />
              <Button tone="delivered" icon="check" loading={pendente === "feito-" + x.id} onClick={e => { e.stopPropagation(); setConfirm(x); }}>Feito</Button>
            </div>
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
