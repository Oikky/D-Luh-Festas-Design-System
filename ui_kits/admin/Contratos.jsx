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

function EscolhaTipo({ modelos, valor, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
      {modelos.map(m => {
        const on = m.id === valor;
        return (
          <button key={m.id} type="button" onClick={() => onChange(m.id)} style={{
            display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left", cursor: "pointer",
            padding: "14px 16px", borderRadius: "var(--radius-lg)",
            background: on ? "var(--color-accent-soft)" : "var(--color-surface)",
            border: (on ? "var(--border-control)" : "var(--border-hairline)") + " solid " + (on ? "var(--color-accent)" : "var(--color-border)"),
            boxShadow: on ? "none" : "var(--shadow-card)", fontFamily: "var(--font-ui)",
            transition: "var(--transition-control)"
          }}>
            <span style={{
              width: "var(--icon-tile)", height: "var(--icon-tile)", flex: "0 0 auto", borderRadius: "var(--radius-md)",
              background: on ? "var(--color-accent)" : "var(--color-surface-3)",
              color: on ? "var(--color-accent-contrast)" : "var(--text-body)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}><Icon name={m.icone} size={24} /></span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-semibold)", color: on ? "var(--color-accent)" : "var(--text-strong)" }}>{m.nome}</span>
                {on ? <Icon name="check" size={16} color="var(--color-accent)" /> : null}
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
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, textAlign: "center", margin: "0 0 18px", lineHeight: 1.3 }}>
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

function Contratos({ compact }) {
  const MODELOS = [window.DLUH_CONTRATOS.buffet, window.DLUH_CONTRATOS.salao];
  const [tipo, setTipo] = React.useState("buffet");
  const modelo = MODELOS.find(m => m.id === tipo);
  const [dados, setDados] = React.useState(() => {
    const d = { buffet: {}, salao: {} };
    MODELOS.forEach(m => m.grupos.flatMap(g => g.campos).forEach(c => { if (c.def) d[m.id][c.id] = c.def; }));
    return d;
  });
  const [verPrevia, setVerPrevia] = React.useState(!compact);
  const [toast, setToast] = React.useState(null);
  const vals = dados[tipo];
  const set = (id, v) => setDados(s => ({ ...s, [tipo]: { ...s[tipo], [id]: v } }));
  const showToast = m => { setToast(m); setTimeout(() => setToast(null), 2400); };

  React.useEffect(() => {
    if (tipo !== "salao") return;
    const t = Number(String(vals.valor_total || "").replace(",", "."));
    const e = Number(String(vals.entrada || "").replace(",", "."));
    const s = (isNaN(t) ? 0 : t) - (isNaN(e) ? 0 : e);
    const novo = s > 0 ? String(s) : "";
    if (novo !== (vals.saldo || "")) set("saldo", novo);
  }, [tipo, vals.valor_total, vals.entrada]);

  const campos = modelo.grupos.flatMap(g => g.campos);
  const faltando = campos.filter(c => c.req && !vals[c.id]).length;

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "var(--space-8)", maxWidth: "var(--content-max)", minHeight: "100%" }}>
      <EscolhaTipo modelos={MODELOS} valor={tipo} onChange={setTipo} />

      <div style={{ display: "flex", gap: "var(--gap-inline)", alignItems: "center", flexWrap: "wrap" }}>
        <Badge tone={faltando ? "warn" : "success"} icon={faltando ? "circle-alert" : "circle-check"}>
          {faltando ? faltando + " campo(s) obrigatório(s) em falta" : "Pronto para gerar"}
        </Badge>
        <div style={{ flex: 1 }} />
        {compact ? <FilterPill trailingIcon={null} icon={verPrevia ? "pencil" : "eye"} active onClick={() => setVerPrevia(!verPrevia)}>
          {verPrevia ? "Editar dados" : "Ver prévia"}
        </FilterPill> : null}
        <Button size="sm" variant="ghost" icon="printer" onClick={() => showToast("Contrato enviado para impressão")}>Imprimir</Button>
        <Button size="sm" variant="ghost" icon="download" onClick={() => showToast("PDF gerado")}>PDF</Button>
        <Button size="sm" icon="save" onClick={() => showToast("Contrato salvo no histórico")}>Salvar</Button>
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
                        ? <Select options={c.opcoes} value={vals[c.id] || ""} onChange={e => set(c.id, e.target.value)} />
                        : <Input type={c.tipo === "date" ? "date" : c.tipo === "time" ? "time" : c.tipo === "number" || c.tipo === "dinheiro" ? "number" : "text"}
                            step={c.tipo === "dinheiro" ? "0.01" : undefined}
                            prefix={c.tipo === "dinheiro" ? "R$" : undefined}
                            placeholder={c.ph} readOnly={c.auto}
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

      <Card header={<>
        <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>Contratos recentes</div>
        <Button size="sm" variant="ghost" iconRight="arrow-right">Ver histórico</Button>
      </>} bodyStyle={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {window.DLUH.contratos.map((c, i) => (
          <ListRow key={i} icon={c.tipo === "buffet" ? "chef-hat" : "party-popper"} title={c.cliente}
            subtitle={(c.tipo === "buffet" ? "Buffet" : "Locação do salão") + " · " + c.data}
            value={c.valor} trailing={<IconButton icon="download" label="Baixar" size={32} style={{ marginLeft: 10 }} />} />
        ))}
      </Card>

      {toast ? <Toast tone="success" icon="check">{toast}</Toast> : null}
    </div>
  );
}

Object.assign(window, { Contratos, PreviaContrato: Previa });
