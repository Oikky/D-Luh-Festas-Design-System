const DS = window.DLuhFestasDesignSystem_c861a2;
const { Card, Badge, Button, IconButton, FilterPill, StatusBadge, EmptyState, Icon, ListRow } = DS;

const TIPOS = {
  encomenda: { rot: "Encomenda", cor: "var(--color-accent)", tint: "var(--color-accent-soft)", icone: "cake-slice" },
  buffet:    { rot: "Buffet",    cor: "var(--action-charge-entry)", tint: "var(--status-confirmado-bg)", icone: "chef-hat" },
  festa:     { rot: "Festa",     cor: "var(--action-charge-total)", tint: "var(--status-preparo-bg)", icone: "party-popper" },
  boleto:    { rot: "Boleto",    cor: "var(--action-warn)", tint: "var(--action-warn-bg)", icone: "barcode", fin: true },
  cartao:    { rot: "Cartão",    cor: "var(--action-delivered)", tint: "rgba(15,118,110,.12)", icone: "credit-card", fin: true }
};
const SITUACAO = { "A vencer": "warn", "Vence hoje": "warn", "Vencido": "danger", "Pago": "success" };
const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function TipoDot({ tipo, size = 7 }) {
  return <span style={{ width: size, height: size, borderRadius: "var(--radius-pill)", background: TIPOS[tipo].cor, flex: "0 0 auto" }} />;
}

function Calendario({ ano, mes, sel, onSel, itens, compact }) {
  const primeiro = new Date(ano, mes, 1).getDay();
  const dias = new Date(ano, mes + 1, 0).getDate();
  const celulas = [];
  for (let i = 0; i < primeiro; i++) celulas.push(null);
  for (let d = 1; d <= dias; d++) celulas.push(d);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
        {DIAS.map(d => <div key={d} style={{
          textAlign: "center", fontSize: "var(--fs-micro)", fontWeight: "var(--fw-semibold)",
          color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)"
        }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {celulas.map((d, i) => {
          if (!d) return <div key={"e" + i} />;
          const chave = ano + "-" + String(mes + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
          const doDia = itens.filter(x => x.data === chave);
          const ativo = sel === chave;
          const hoje = chave === "2026-06-12";
          return (
            <button key={chave} type="button" onClick={() => onSel(chave)} style={{
              minHeight: compact ? 46 : 74, display: "flex", flexDirection: "column", alignItems: "stretch",
              gap: 4, padding: compact ? "5px 4px" : "7px 8px", cursor: "pointer", textAlign: "left",
              borderRadius: "var(--radius-sm)", fontFamily: "var(--font-ui)",
              background: ativo ? "var(--color-accent)" : doDia.length ? "var(--color-surface-2)" : "transparent",
              border: "var(--border-hairline) solid " + (ativo ? "transparent" : hoje ? "var(--color-accent)" : "var(--color-border-soft)"),
              color: ativo ? "var(--color-accent-contrast)" : "var(--text-strong)",
              transition: "var(--transition-control)"
            }}>
              <span style={{ fontSize: "var(--fs-tiny)", fontWeight: hoje || ativo ? "var(--fw-bold)" : "var(--fw-medium)" }}>{d}</span>
              {compact
                ? <span style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {doDia.slice(0, 3).map((x, k) => <TipoDot key={k} tipo={x.tipo} size={5} />)}
                  </span>
                : <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                    {doDia.slice(0, 2).map((x, k) => (
                      <span key={k} style={{
                        display: "flex", alignItems: "center", gap: 4, padding: "2px 5px",
                        borderRadius: 4, background: ativo ? "rgba(255,255,255,.22)" : TIPOS[x.tipo].tint,
                        color: ativo ? "inherit" : TIPOS[x.tipo].cor,
                        fontSize: 9.5, fontWeight: "var(--fw-semibold)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }}>{x.hora ? x.hora + " " : ""}{x.cliente.split(" ")[0]}</span>
                    ))}
                    {doDia.length > 2 ? <span style={{ fontSize: 9.5, color: ativo ? "inherit" : "var(--text-muted)", paddingLeft: 5 }}>+{doDia.length - 2}</span> : null}
                  </span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ItemAgenda({ x }) {
  const t = TIPOS[x.tipo];
  return (
    <div style={{
      display: "flex", gap: 12, padding: "12px 13px", borderRadius: "var(--radius-sm)",
      background: "var(--color-surface)", border: "var(--border-hairline) solid var(--color-border)",
      borderLeft: "3px solid " + t.cor, fontFamily: "var(--font-ui)"
    }}>
      <span style={{
        width: 38, height: 38, flex: "0 0 auto", borderRadius: "var(--radius-sm)",
        background: t.tint, color: t.cor, display: "flex", alignItems: "center", justifyContent: "center"
      }}><Icon name={t.icone} size={19} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-semibold)" }}>{x.cliente}</span>
          <span style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: t.cor }}>{t.rot}</span>
        </div>
        <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 3, lineHeight: "var(--lh-snug)" }}>{x.titulo}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 7, flexWrap: "wrap", fontSize: "var(--fs-tiny)", color: "var(--text-body)" }}>
          {x.hora ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="clock" size={13} />{x.hora}</span> : null}
          {x.forma ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="wallet" size={13} />{x.forma}</span> : null}
          {x.parcela ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="layers" size={13} />Parcela {x.parcela}</span> : null}
          {x.local ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="map-pin" size={13} />{x.local}</span> : null}
          {x.convidados ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon name="users" size={13} />{x.convidados} convidados</span> : null}
        </div>
      </div>
      <div style={{ textAlign: "right", flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <span style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-bold)", whiteSpace: "nowrap", color: t.fin ? "var(--action-danger)" : "var(--text-strong)" }}>{t.fin ? "− " + x.valor : x.valor}</span>
        {t.fin ? <Badge tone={SITUACAO[x.situacao] || "neutral"}>{x.situacao}</Badge> : <StatusBadge status={x.status} short />}
      </div>
    </div>
  );
}

function Agenda({ compact }) {
  const [filtro, setFiltro] = React.useState("tudo");
  const [sel, setSel] = React.useState("2026-06-12");
  const [mes, setMes] = React.useState(5);
  const ano = 2026;

  const todos = window.DLUH.agenda;
  const itens = filtro === "tudo" ? todos : todos.filter(x => x.tipo === filtro);
  const doDia = itens.filter(x => x.data === sel).sort((a, b) => (a.hora || "00:00").localeCompare(b.hora || "00:00"));
  const proximos = itens.filter(x => x.data > sel).sort((a, b) => (a.data + (a.hora || "")).localeCompare(b.data + (b.hora || ""))).slice(0, 4);

  const [aa, mm, dd] = sel.split("-");
  const dataLonga = Number(dd) + " de " + MESES[Number(mm) - 1];
  const mesChave = ano + "-" + String(mes + 1).padStart(2, "0");
  const aPagar = todos.filter(x => TIPOS[x.tipo].fin && x.situacao !== "Pago" && x.data.slice(0, 7) === mesChave)
    .reduce((s, x) => s + Number(x.valor.replace(/[^\d,]/g, "").replace(",", ".")), 0);
  const contagem = t => todos.filter(x => x.tipo === t && x.data.slice(0, 7) === ano + "-" + String(mes + 1).padStart(2, "0")).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      <div style={{ display: "flex", gap: "var(--gap-inline)", flexWrap: "wrap", alignItems: "center" }}>
        <FilterPill active={filtro === "tudo"} trailingIcon={null} onClick={() => setFiltro("tudo")}>Tudo</FilterPill>
        {Object.keys(TIPOS).map(k => (
          <FilterPill key={k} active={filtro === k} trailingIcon={null} icon={TIPOS[k].icone} onClick={() => setFiltro(k)}>
            {TIPOS[k].rot} · {contagem(k)}
          </FilterPill>
        ))}
        <div style={{ flex: 1 }} />
        <Badge tone="warn" icon="receipt">A pagar no mês: R$ {aPagar.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Badge>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "1.35fr 1fr", gap: 12, alignItems: "start" }}>
        <Card header={<>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconButton icon="chevron-left" label="Mês anterior" size={32} onClick={() => setMes((mes + 11) % 12)} />
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-heading)", fontWeight: "var(--fw-semibold)", minWidth: 150, textAlign: "center", textTransform: "capitalize" }}>
              {MESES[mes]} {ano}
            </div>
            <IconButton icon="chevron-right" label="Próximo mês" size={32} onClick={() => setMes((mes + 1) % 12)} />
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {Object.keys(TIPOS).map(k => (
              <span key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>
                <TipoDot tipo={k} />{TIPOS[k].rot}
              </span>
            ))}
          </div>
        </>}>
          <Calendario ano={ano} mes={mes} sel={sel} onSel={setSel} itens={itens} compact={compact} />
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card header={<>
            <div>
              <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>{dataLonga}</div>
              <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>
                {doDia.length ? doDia.length + (doDia.length === 1 ? " compromisso" : " compromissos") : "Dia livre"}
              </div>
            </div>
          </>} bodyStyle={{ display: "flex", flexDirection: "column", gap: 8 }} padded={doDia.length > 0}>
            {doDia.length
              ? doDia.map((x, i) => <ItemAgenda key={i} x={x} />)
              : <EmptyState icon="calendar-check" title="Nada marcado nesse dia"
                  description="Encomendas, eventos, boletos e faturas de cartão aparecem aqui automaticamente." />}
          </Card>

          {proximos.length ? (
            <Card header={<div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>Próximos</div>}
              bodyStyle={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {proximos.map((x, i) => (
                <ListRow key={i} icon={TIPOS[x.tipo].icone} title={x.cliente}
                  subtitle={TIPOS[x.tipo].rot + " · " + x.data.split("-").reverse().slice(0, 2).join("/") + (x.hora ? " · " + x.hora : "")}
                  value={TIPOS[x.tipo].fin ? "− " + x.valor : x.valor} tone={TIPOS[x.tipo].fin ? "out" : "neutral"} onClick={() => setSel(x.data)} />
              ))}
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Agenda, TIPOS_AGENDA: TIPOS });
