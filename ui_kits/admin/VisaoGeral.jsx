const { Card, ListRow, StatusBadge, Button, IconButton, Badge, Icon, EmptyState } = window.DLuhFestasDesignSystem_c861a2;

const MESES_V = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const isoDe = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const somaDias = (iso, n) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return isoDe(d); };
const curtoK = c => { const r = c / 100; return r >= 1000 ? (r / 1000).toFixed(1).replace(".", ",") + "k" : String(Math.round(r)); };

/* Everything on this screen is computed from the orders and the payments received; nothing is
   typed in. `pags` are payments in centavos with a local date (api.js → todosPagamentos). */
const A_RECEBER = ["Confirmado — Esperando pagamento", "Em produção", "Pronto", "Entregue — Esperando restante"];
function resumoDe(pedidos, pags, hoje) {
  const vivos = pedidos.filter(p => p.status !== "Cancelado");
  const cent = window.clCentavos;
  const deHoje = vivos.filter(p => p.data === hoje);
  const receber = vivos.filter(p => A_RECEBER.includes(p.status) && cent(p, "falta") > 0);
  const fila = vivos.filter(p => p.status === "Em produção" && !p.feitoNaCozinha && p.data && p.data <= hoje);
  const desde = somaDias(hoje, -29);
  const mes = vivos.filter(p => p.data >= desde && p.data <= hoje);
  const dow = (new Date(hoje + "T12:00:00").getDay() + 6) % 7;
  const seg = somaDias(hoje, -dow), dom = somaDias(seg, 6);
  const dias = Array.from({ length: 7 }, (_, i) => somaDias(seg, i));
  const serie = dias.map(d => pags.filter(p => p.data === d).reduce((s, p) => s + p.valor, 0));
  const [a, b] = [seg, dom].map(d => ({ dia: Number(d.slice(8, 10)), mes: MESES_V[Number(d.slice(5, 7)) - 1] }));
  const porId = new Map(pedidos.map(p => [p.id, p]));
  return {
    hoje: deHoje.length, hojeValor: deHoje.reduce((s, p) => s + cent(p, "total"), 0),
    receber: receber.reduce((s, p) => s + cent(p, "falta"), 0), receberN: receber.length, receberLista: receber,
    fila: fila.length, atrasados: fila.filter(p => p.data < hoje).length,
    ticket: mes.length ? Math.round(mes.reduce((s, p) => s + cent(p, "total"), 0) / mes.length) : 0, ticketN: mes.length,
    serie, dias, hojeIdx: dow, semana: serie.reduce((s, v) => s + v, 0),
    rotuloSemana: a.mes === b.mes ? `${a.dia} – ${b.dia} de ${b.mes}` : `${a.dia} de ${a.mes} – ${b.dia} de ${b.mes}`,
    pagamentos: pags.slice().sort((a, b) => `${b.data} ${b.hora}`.localeCompare(`${a.data} ${a.hora}`)).slice(0, 6).map(p => ({ ...p, cliente: (porId.get(p.pedidoId) || {}).cliente })),
    recentes: pedidos.slice(0, 6)
  };
}

function ChartCard({ compact, r }) {
  const nomes = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const max = Math.max(1, ...r.serie);
  return (
    <Card header={<>
      <div>
        <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>Recebido na semana</div>
        <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>{r.rotuloSemana}</div>
      </div>
      <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)", whiteSpace: "nowrap" }}>{window.brl(r.semana / 100)}</div>
    </>}>
      {!r.serie.some(v => v > 0) ? <EmptyState icon="chart-no-axes-column" title="Nenhum pagamento recebido nesta semana" /> :
      <div style={{ display: "flex", alignItems: "flex-end", gap: compact ? 6 : 12, height: 150 }}>
        {r.serie.map((v, i) => (
          <div key={i} title={window.brl(v / 100)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, minWidth: 0 }}>
            <span style={{ fontSize: "var(--fs-micro)", color: "var(--text-muted)", fontWeight: "var(--fw-semibold)" }}>{v ? curtoK(v) : ""}</span>
            <div style={{
              width: "100%", height: Math.max(v ? 3 : 1, (v / max) * 104), borderRadius: "var(--radius-xs)",
              background: v ? "var(--color-accent-soft)" : "var(--color-border)", border: v ? "1px solid var(--color-accent)" : "none"
            }} />
            <span style={{ fontSize: "var(--fs-micro)", color: i === r.hojeIdx ? "var(--text-accent)" : "var(--text-muted)", fontWeight: i === r.hojeIdx ? "var(--fw-bold)" : undefined }}>{nomes[i]}</span>
          </div>
        ))}
      </div>}
    </Card>
  );
}

function Indicador({ icon, label, value, sub, tone, onClick }) {
  const card = <window.DLuhFestasDesignSystem_c861a2.StatCard icon={icon} label={label} value={value} tone={tone} style={{ height: "100%", boxSizing: "border-box" }}
    chart={<div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: -4 }}>{sub}</div>} />;
  return onClick ? <div role="button" tabIndex={0} data-indicador="" onClick={onClick} onKeyDown={e => e.key === "Enter" && onClick()}
    style={{ cursor: "pointer", minWidth: 0, borderRadius: "var(--radius-lg)" }}>{card}</div> : <div style={{ minWidth: 0 }}>{card}</div>;
}

const RECENT_COLS = "minmax(0,1.4fr) minmax(0,1.3fr) minmax(0,1fr) minmax(0,.8fr)";

/* What "A receber" adds up, order by order: how much is missing, grouped by status, so an odd
   total can be traced (an old order that was paid outside the system, for instance). */
const ORDEM_RECEBER = [
  { id: "valor", label: "Maior valor", fn: (a, b) => window.clCentavos(b, "falta") - window.clCentavos(a, "falta") },
  { id: "antigos", label: "Mais antigos", fn: (a, b) => (a.data || "").localeCompare(b.data || "") }
];
function AReceberModal({ lista, hoje, onClose, onPedido }) {
  const [status, setStatus] = React.useState(null);
  const [ordem, setOrdem] = React.useState("valor");
  const cent = window.clCentavos, soma = l => l.reduce((s, p) => s + cent(p, "falta"), 0);
  const grupos = A_RECEBER.map(st => ({ st, l: lista.filter(p => p.status === st) })).filter(g => g.l.length);
  const velhos = lista.filter(p => p.data && p.data < somaDias(hoje, -60));
  const vis = lista.filter(p => !status || (status === "velhos" ? velhos.includes(p) : p.status === status)).slice().sort(ORDEM_RECEBER.find(o => o.id === ordem).fn);
  const pill = (id, rotulo, l) => <window.DLuhFestasDesignSystem_c861a2.FilterPill key={id || "todos"} trailingIcon={null} active={status === id}
    onClick={() => setStatus(id)}>{rotulo} · {l.length} · {window.brl(soma(l) / 100)}</window.DLuhFestasDesignSystem_c861a2.FilterPill>;
  return (
    <window.DLuhFestasDesignSystem_c861a2.Modal width={640} title="A receber" onClose={onClose}
      subtitle={`${window.brl(soma(lista) / 100)} em ${lista.length} ${lista.length === 1 ? "pedido" : "pedidos"} confirmados que ainda não foram pagos por inteiro. Toque num pedido para abrir.`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {pill(null, "Todos", lista)}
          {grupos.map(g => pill(g.st, window.DLuhFestasDesignSystem_c861a2.STATUS?.[g.st]?.short || g.st, g.l))}
          {velhos.length ? pill("velhos", "Entrega há mais de 60 dias", velhos) : null}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>Ordenar:</span>
          {ORDEM_RECEBER.map(o => <window.DLuhFestasDesignSystem_c861a2.FilterPill key={o.id} trailingIcon={null} active={ordem === o.id} onClick={() => setOrdem(o.id)}>{o.label}</window.DLuhFestasDesignSystem_c861a2.FilterPill>)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {vis.map(p => (
            <ListRow key={p.id} icon="receipt-text" title={p.cliente || "Cliente sem nome"}
              subtitle={<span style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                {p.id} · entrega {p.data ? p.data.slice(8, 10) + "/" + p.data.slice(5, 7) + "/" + p.data.slice(2, 4) : "sem data"}
                <StatusBadge status={p.status} short /></span>}
              value={window.brl(cent(p, "falta") / 100)} valueSub={`de ${p.total || "—"}${p.pago ? " · pago " + p.pago : ""}`}
              onClick={() => onPedido(p.id)} />
          ))}
        </div>
      </div>
    </window.DLuhFestasDesignSystem_c861a2.Modal>
  );
}

const MEIO_ICONE = { Pix: "qr-code", Dinheiro: "banknote", "Cartão": "credit-card" };
const ddmm = iso => iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) : "";

function VisaoGeral({ compact, onView, onQ }) {
  const ped = useAoVivo("pedidos");
  const pag = useAoVivo("pagamentosRecentes");
  const bol = useAoVivo("boletosAbertos");
  const [verReceber, setVerReceber] = React.useState(false);
  const erro = ped.estado === "erro" && !ped.dados ? ped : pag.estado === "erro" && !pag.dados ? pag : null;
  const r = React.useMemo(() => ped.dados && pag.dados ? resumoDe(ped.dados, pag.dados, window.DLUH_API.hoje()) : null, [ped.dados, pag.dados]);
  if (erro) return <ErroCarga erro={erro.erro} oque="a visão geral" onTentar={erro.tentar} />;
  if (!r) return <Carregando oque="a visão geral" />;
  const abrirPedido = id => { onQ && onQ(id); onView("pedidos"); };
  const d = {
    pagamentos: r.pagamentos.map(p => ({ icon: MEIO_ICONE[p.meio] || "wallet", title: p.cliente || p.pedidoId,
      sub: [p.pedidoId, p.meio, [ddmm(p.data), p.hora].filter(Boolean).join(" ")].filter(Boolean).join(" · "), value: "+ " + window.brl(p.valor / 100), tone: "in", id: p.pedidoId })),
    recentes: r.recentes.map(p => ({ id: p.id, nome: p.cliente, status: p.status, total: p.total || "—", data: ddmm(p.data) || "sem data", hora: p.hora || "",
      cat: p.tipo === "Empresa" ? "Empresa" : ((p._c && p._c.itens[0] && (p._c.itens[0].categoria || p._c.itens[0].nome)) || (p.itens && p.itens[0] && p.itens[0].name) || p.id) }))
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap-section)" }}>
      <div style={{ display: "grid", gridTemplateColumns: compact ? "repeat(2, minmax(0,1fr))" : "repeat(4, minmax(0,1fr))", gap: 12 }}>
        <Indicador icon="calendar-days" label="Pedidos para hoje" value={String(r.hoje)} tone="accent"
          sub={r.hoje ? window.brl(r.hojeValor / 100) + " no total" : "Nenhuma entrega hoje"} onClick={() => onView("agenda")} />
        <Indicador icon="hourglass" label="A receber" value={window.brl(r.receber / 100)}
          sub={r.receberN ? `${r.receberN} ${r.receberN === 1 ? "pedido confirmado" : "pedidos confirmados"}` : "Nada pendente"} onClick={() => setVerReceber(true)} />
        <Indicador icon="chef-hat" label="Fila da cozinha" value={String(r.fila)}
          sub={r.atrasados ? `${r.atrasados} ${r.atrasados === 1 ? "atrasado" : "atrasados"}` : "Nenhum atrasado"} onClick={() => onView("cozinha")} />
        <Indicador icon="receipt-text" label="Ticket médio" value={window.brl(r.ticket / 100)}
          sub={`${r.ticketN} ${r.ticketN === 1 ? "pedido" : "pedidos"} nos últimos 30 dias`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0,1fr)" : "1.6fr 1fr", gap: 12, alignItems: "start" }}>
        <ChartCard compact={compact} r={r} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
        {/* Se os boletos não carregarem, o resto da visão geral segue sem o card. */}
        {bol.dados ? <window.BoletosAPagar docs={bol.dados} hoje={window.DLUH_API.hoje()}
          onAbrir={(boleto, n) => onView("financeiro", { boleto, n })} onVerTodos={() => onView("financeiro", { aba: "boletos" })} /> : null}
        <Card header={<>
          <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>Pagamentos recentes</div>
          <IconButton icon="arrow-up-right" label="Abrir financeiro" size={32} onClick={() => onView("financeiro")} />
        </>} bodyStyle={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {d.pagamentos.length ? d.pagamentos.map((p, i) => <ListRow key={i} icon={p.icon} title={p.title} subtitle={p.sub} value={p.value} tone={p.tone} onClick={() => abrirPedido(p.id)} />)
            : <EmptyState icon="wallet" title="Nenhum pagamento recente" />}
        </Card>
        </div>
      </div>

      <Card padded={false} header={<>
        <div>
          <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>Últimos pedidos</div>
          <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>{d.recentes.length === 1 ? "O mais recente" : `Os ${d.recentes.length} mais recentes`}</div>
        </div>
        <Button size="sm" variant="ghost" iconRight="arrow-right" onClick={() => onView("pedidos")}>Ver todos</Button>
      </>}>
        <div style={{ padding: compact ? "4px 0" : "8px 0" }}>
          {compact ? null : <div style={{ display: "grid", gridTemplateColumns: RECENT_COLS, gap: 12, padding: "4px 18px 8px", fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)" }}>
            <span>Cliente</span><span>Status</span><span>Entrega</span><span style={{ textAlign: "right" }}>Total</span>
          </div>}
          {!d.recentes.length ? <EmptyState icon="receipt-text" title="Nenhum pedido ainda" /> : d.recentes.map(r => compact ? (
            <div key={r.id} data-row-action="" role="button" tabIndex={0} onClick={() => abrirPedido(r.id)} onKeyDown={e => e.key === "Enter" && abrirPedido(r.id)} style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 6, padding: "12px 16px", borderTop: "var(--border-hairline) solid var(--color-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)", minWidth: 0, overflowWrap: "anywhere" }}>{r.nome || "Cliente sem nome"}</span>
                <span style={{ fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)", whiteSpace: "nowrap" }}>{r.total}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                <StatusBadge status={r.status} short /><Badge>{r.cat}</Badge>
                <span style={{ marginLeft: "auto", fontSize: "var(--fs-tiny)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}><Icon name="clock" size={13} />{r.data} · {r.hora}</span>
              </div>
            </div>
          ) : (
            <div key={r.id} data-row-action="" role="button" tabIndex={0} onClick={() => abrirPedido(r.id)} onKeyDown={e => e.key === "Enter" && abrirPedido(r.id)} style={{ cursor: "pointer", display: "grid", gridTemplateColumns: RECENT_COLS, gap: 12, alignItems: "center", padding: "11px 18px", borderTop: "var(--border-hairline) solid var(--color-border)", fontSize: "var(--fs-body-s)" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: "var(--fw-semibold)", color: "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.nome}>{r.nome || "Cliente sem nome"}</div>
                <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>{r.cat}</div>
              </div>
              <div style={{ minWidth: 0 }}><StatusBadge status={r.status} short /></div>
              <div style={{ color: "var(--text-body)", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}><Icon name="clock" size={14} style={{ color: "var(--text-muted)" }} />{r.data} · {r.hora}</div>
              <div style={{ textAlign: "right", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)", whiteSpace: "nowrap" }}>{r.total}</div>
            </div>
          ))}
        </div>
      </Card>
      {verReceber ? <AReceberModal lista={r.receberLista} hoje={window.DLUH_API.hoje()} onClose={() => setVerReceber(false)}
        onPedido={id => { setVerReceber(false); abrirPedido(id); }} /> : null}
    </div>
  );
}

Object.assign(window, { VisaoGeral, ChartCard });
