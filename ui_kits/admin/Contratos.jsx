const DS = window.DLuhFestasDesignSystem_c861a2;
const { Card, Button, IconButton, Badge, Field, Input, Select, Icon, Toast, ListRow, FilterPill } = DS;

const fmtData = v => {
  if (!v) return "";
  const p = String(v).split("-");
  return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : v;
};
const fmtMoeda = v => {
  const n = Number(String(v).replace(",", "."));
  return isNaN(n) || !String(v).length ? "" : n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

function preencher(texto, vals, modelo) {
  return String(texto).replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (k === "equipe") {
      const e = [["garcons", "garçom", "garçons"], ["cozinheiras", "cozinheira", "cozinheiras"],
                 ["organizadores", "organizador", "organizadores"], ["auxiliares", "auxiliar", "auxiliares"]]
        .filter(([id]) => Number(vals[id]) > 0)
        .map(([id, s, p]) => vals[id] + " " + (Number(vals[id]) === 1 ? s : p));
      return e.length ? e.join(", ") : "__________";
    }
    const campo = modelo.grupos.flatMap(g => g.campos).find(c => c.id === k);
    let v = vals[k];
    if (v == null || v === "") return "__________";
    if (campo && campo.tipo === "date") v = fmtData(v);
    if (campo && campo.tipo === "dinheiro") v = "R$ " + fmtMoeda(v);
    return v;
  });
}

function EscolhaTipo({ modelos, valor, onChange, travado }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
      {modelos.map(m => {
        const on = m.id === valor;
        return (
          <button key={m.id} type="button" aria-pressed={on} disabled={travado && !on} onClick={() => onChange(m.id)} style={{
            display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left", cursor: travado ? "default" : "pointer",
            opacity: travado && !on ? "var(--disabled-opacity)" : undefined,
            padding: "14px 16px", borderRadius: "var(--radius-lg)",
            background: on ? "var(--color-accent-soft)" : "var(--color-surface)",
            border: (on ? "var(--border-control)" : "var(--border-hairline)") + " solid " + (on ? "var(--color-accent)" : "var(--color-border)"),
            boxShadow: on ? "none" : "var(--shadow-card)", fontFamily: "var(--font-ui)",
            transition: "var(--transition-control)"
          }}>
            <span style={{
              width: "var(--icon-tile)", height: "var(--icon-tile)", flex: "0 0 auto", borderRadius: "var(--radius-md)",
              background: on ? "var(--color-accent-strong)" : "var(--color-surface-3)",
              color: on ? "var(--color-accent-contrast)" : "var(--text-body)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}><Icon name={m.icone} size={24} /></span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-semibold)", color: on ? "var(--text-accent)" : "var(--text-strong)" }}>{m.nome}</span>
                {on ? <Icon name="check" size={16} color="var(--text-accent)" /> : null}
              </span>
              <span style={{ display: "block", fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 4, lineHeight: "var(--lh-snug)" }}>{m.descricao}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Previa({ modelo, vals }) {
  return (
    <div style={{
      background: "#fff", color: "#1a1a1a", padding: "34px 38px", borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-ui)", fontSize: 11.5, lineHeight: 1.65, boxShadow: "var(--shadow-soft)"
    }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <img src="../../assets/logo-dluh-festas.png" alt="D'Luh Festas" style={{ height: 62, objectFit: "contain" }} />
      </div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, textAlign: "center", margin: "0 0 18px", lineHeight: 1.3 }}>
        {modelo.titulo}{vals.salao_nome ? <><br />{vals.salao_nome}</> : null}
      </h1>
      {preencher(modelo.abertura, vals, modelo).split("\n\n").map((p, i) => (
        <p key={i} style={{ margin: "0 0 10px", whiteSpace: "pre-line", textAlign: "justify" }}>{p}</p>
      ))}
      {modelo.clausulas.map((c, i) => (
        <div key={i} style={{ marginTop: 14 }}>
          <h3 style={{ fontSize: 11.5, fontWeight: 700, margin: "0 0 4px" }}>{c.t}</h3>
          <p style={{ margin: 0, textAlign: "justify" }}>{preencher(c.c, vals, modelo)}</p>
          {(c.sub || []).map((s, k) => (
            <p key={k} style={{ margin: "5px 0 0", textAlign: "justify" }}>{preencher(s, vals, modelo)}</p>
          ))}
        </div>
      ))}
      <p style={{ margin: "22px 0 0" }}>{(vals.cidade || "Montes Claros") + ", ____ de __________ de ______"}</p>
      <div style={{ display: "grid", gridTemplateColumns: modelo.assinaturas.length > 2 ? "1fr 1fr" : "1fr 1fr", gap: "26px 34px", marginTop: 26 }}>
        {modelo.assinaturas.map((a, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 5, fontSize: 10.5 }}>{a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CT_KEY = "dluh-admin-contratos";
const ctAgora = () => { const d = new Date(), p = x => String(x).padStart(2, "0"); return p(d.getDate()) + "/" + p(d.getMonth() + 1) + " · " + p(d.getHours()) + ":" + p(d.getMinutes()); };
const ctPadrao = modelos => { const d = {}; modelos.forEach(m => { d[m.id] = {}; m.grupos.flatMap(g => g.campos).forEach(c => { if (c.def) d[m.id][c.id] = c.def; }); }); return d; };
const ctCliente = c => (c.dados[c.tipo] || {}).contratante_nome || (c.dados[c.tipo] || {}).nome || "Sem nome";
const ctValor = c => { const v = (c.dados[c.tipo] || {}).valor_total; return v ? "R$ " + fmtMoeda(v) : "—"; };

function ContratoEditor({ contrato, modelos, compact, onChange, onBack, onToast }) {
  const tipo = contrato.tipo;
  const modelo = modelos.find(m => m.id === tipo);
  const [verPrevia, setVerPrevia] = React.useState(!compact);
  const [finalizar, setFinalizar] = React.useState(false);
  const set = (id, v) => onChange({ dados: { ...contrato.dados, [tipo]: { ...contrato.dados[tipo], [id]: v } } });

  /* The hall contract's saldo is derived from total minus entrada on every render. Storing it
     used to rewrite the contract, and its "salvo" time, the moment it was opened. */
  const base = contrato.dados[tipo];
  const vals = tipo !== "salao" ? base : (() => {
    const t = Number(String(base.valor_total || "").replace(",", "."));
    const e = Number(String(base.entrada || "").replace(",", "."));
    const s = (isNaN(t) ? 0 : t) - (isNaN(e) ? 0 : e);
    return { ...base, saldo: s > 0 ? String(s) : "" };
  })();

  const campos = modelo.grupos.flatMap(g => g.campos);
  const faltando = campos.filter(c => c.req && !vals[c.id]).length;
  const final = contrato.status === "Finalizado";

  return (<>
    <div style={{ display: "flex", gap: "var(--gap-inline)", alignItems: "center", flexWrap: "wrap" }}>
      <Button size="sm" variant="ghost" icon="arrow-left" onClick={onBack}>Contratos</Button>
      <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)" }}>{ctCliente(contrato)}</div>
      <Badge tone={final ? "success" : "neutral"} icon={final ? "circle-check" : "pencil"}>{final ? "Finalizado" : "Rascunho"}</Badge>
      <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>Salvo automaticamente · {contrato.atualizado}</span>
    </div>

    <EscolhaTipo modelos={modelos} valor={tipo} travado={final} onChange={t => !final && onChange({ tipo: t })} />

    <div style={{ display: "flex", gap: "var(--gap-inline)", alignItems: "center", flexWrap: "wrap" }}>
      {final ? null : <Badge tone={faltando ? "warn" : "success"} icon={faltando ? "circle-alert" : "circle-check"}>
        {faltando ? (faltando === 1 ? "Falta 1 campo obrigatório" : "Faltam " + faltando + " campos obrigatórios") : "Pronto para gerar"}
      </Badge>}
      <div style={{ flex: 1 }} />
      {compact ? <FilterPill trailingIcon={null} icon={verPrevia ? "pencil" : "eye"} active onClick={() => setVerPrevia(!verPrevia)}>
        {verPrevia ? "Editar dados" : "Ver prévia"}
      </FilterPill> : null}
      <Button size="sm" variant="ghost" icon="printer" onClick={() => onToast("Contrato enviado para impressão")}>Imprimir</Button>
      <Button size="sm" variant="ghost" icon="download" onClick={() => onToast("PDF gerado")}>PDF</Button>
      {final ? null : <Button size="sm" icon="check" disabled={faltando > 0} title={faltando ? "Preencha os campos obrigatórios para finalizar" : undefined} onClick={() => setFinalizar(true)}>Finalizar</Button>}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0,1fr)" : "minmax(0,1fr) minmax(0,1.05fr)", gap: 12, alignItems: "start" }}>
      {(!compact || !verPrevia) ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {modelo.grupos.map(g => (
            <Card key={g.titulo} header={<div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>{g.titulo}</div>}>
              <div style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0,1fr)" : "repeat(2, minmax(0,1fr))", gap: "10px 12px" }}>
                {g.campos.map(c => (
                  <Field key={c.id} label={c.rot} required={c.req} span={c.span}
                    style={{ gridColumn: c.span && !compact ? "span " + Math.min(c.span, 2) : undefined }}>
                    {c.tipo === "opcao"
                      ? <Select options={c.opcoes} value={vals[c.id] || ""} disabled={final} onChange={e => set(c.id, e.target.value)} />
                      : <Input type={c.tipo === "date" ? "date" : c.tipo === "time" ? "time" : c.tipo === "number" || c.tipo === "dinheiro" ? "number" : "text"}
                          step={c.tipo === "dinheiro" ? "0.01" : undefined}
                          prefix={c.tipo === "dinheiro" ? "R$" : undefined}
                          placeholder={c.ph} readOnly={c.auto || final}
                          value={vals[c.id] || ""} onChange={e => set(c.id, e.target.value)} />}
                  </Field>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : null}
      {(!compact || verPrevia) ? (
        <div style={{ position: compact ? "static" : "sticky", top: 0 }}>
          <Card padded={false} header={<>
            <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>Prévia</div>
            <Badge>{modelo.clausulas.length} cláusulas</Badge>
          </>} bodyStyle={{ background: "var(--color-surface-3)", padding: 14, maxHeight: compact ? "none" : 620, overflowY: "auto" }}>
            <Previa modelo={modelo} vals={vals} />
          </Card>
        </div>
      ) : null}
    </div>
    {finalizar ? <DS.ConfirmDialog icon="file-check" title="Finalizar contrato?"
      message="O contrato sai de rascunho e fica só para leitura. Imprimir e gerar PDF continuam disponíveis."
      confirmLabel="Sim, finalizar" cancelLabel="Voltar" onCancel={() => setFinalizar(false)}
      onConfirm={() => { setFinalizar(false); onChange({ status: "Finalizado" }); onToast("Contrato finalizado"); }} /> : null}
  </>);
}

function Contratos({ compact }) {
  const MODELOS = [window.DLUH_CONTRATOS.buffet, window.DLUH_CONTRATOS.salao];
  const [salvos, setSalvos] = React.useState(() => {
    try { const r = JSON.parse(localStorage.getItem(CT_KEY)); if (Array.isArray(r)) return r; } catch (e) {}
    return window.DLUH.contratos.map((c, i) => {
      const d = ctPadrao(MODELOS), v = String(c.valor).replace(/[^\d,]/g, "").replace(",", ".");
      d[c.tipo] = { ...d[c.tipo], [c.tipo === "buffet" ? "contratante_nome" : "nome"]: c.cliente, valor_total: v };
      return { uid: "seed-" + i, tipo: c.tipo, dados: d, status: i === 1 ? "Rascunho" : "Finalizado", atualizado: c.data.slice(0, 5) };
    });
  });
  const [aberto, setAberto] = React.useState(null);
  const [apagar, setApagar] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const showToast = m => { setToast(m); setTimeout(() => setToast(null), 2400); };
  React.useEffect(() => { try { localStorage.setItem(CT_KEY, JSON.stringify(salvos)); } catch (e) {} }, [salvos]);

  const atual = salvos.find(c => c.uid === aberto);
  const upd = patch => setSalvos(l => l.map(c => c.uid === aberto ? { ...c, ...patch, atualizado: ctAgora() } : c));
  const criar = () => {
    const c = { uid: "c" + Date.now(), tipo: "buffet", dados: ctPadrao(MODELOS), status: "Rascunho", atualizado: ctAgora() };
    setSalvos(l => [c, ...l]); setAberto(c.uid);
  };
  const rascunhos = salvos.filter(c => c.status !== "Finalizado").length;

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "var(--space-8)", minHeight: "100%" }}>
      {atual ? <ContratoEditor contrato={atual} modelos={MODELOS} compact={compact} onChange={upd} onBack={() => setAberto(null)} onToast={showToast} /> : <>
        <div style={{ display: "flex", gap: "var(--gap-inline)", alignItems: "center", flexWrap: "wrap" }}>
          {rascunhos ? <Badge tone="warn" icon="pencil">{rascunhos === 1 ? "1 rascunho em andamento" : rascunhos + " rascunhos em andamento"}</Badge> : null}
          <div style={{ flex: 1 }} />
          <Button size="sm" icon="plus" onClick={criar}>Novo contrato</Button>
        </div>
        <Card header={<div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>Histórico de contratos</div>}
          bodyStyle={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {salvos.length ? salvos.map(c => (
            <ListRow key={c.uid} icon={c.tipo === "buffet" ? "chef-hat" : "party-popper"} title={ctCliente(c)}
              subtitle={(c.tipo === "buffet" ? "Buffet" : "Locação do salão") + " · " + (c.status === "Finalizado" ? "Finalizado" : "Rascunho") + " · " + c.atualizado}
              value={ctValor(c)}
              trailing={<div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 10 }}>
                <Button size="sm" variant={c.status === "Finalizado" ? "ghost" : "outline"} icon={c.status === "Finalizado" ? "eye" : "pencil"} onClick={() => setAberto(c.uid)}>{c.status === "Finalizado" ? "Abrir" : "Continuar"}</Button>
                <IconButton icon="download" label="Baixar PDF" size={36} onClick={() => showToast("PDF gerado")} />
                <IconButton icon="trash-2" label="Apagar" size={36} onClick={() => setApagar(c)} />
              </div>} />
          )) : <DS.EmptyState icon="file-text" title="Nenhum contrato ainda" description="Crie o primeiro pelo botão Novo contrato." />}
        </Card>
      </>}
      {apagar ? <DS.ConfirmDialog tone="danger" icon="trash-2" title="Apagar contrato?" cancelLabel="Voltar" message={"O contrato de " + ctCliente(apagar) + " sai do histórico. Não dá pra desfazer."}
        confirmLabel="Sim, apagar" onCancel={() => setApagar(null)}
        onConfirm={() => { setSalvos(l => l.filter(x => x.uid !== apagar.uid)); setApagar(null); showToast("Contrato apagado"); }} /> : null}
      {toast ? <Toast tone="success" icon="check">{toast}</Toast> : null}
    </div>
  );
}

Object.assign(window, { Contratos, PreviaContrato: Previa });
