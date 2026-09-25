const PM = window.DLuhFestasDesignSystem_c861a2;

const brl = n => "R$ " + (Number(n) || 0).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const agora = () => {
  const d = new Date(), p = x => String(x).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} · ${p(d.getHours())}:${p(d.getMinutes())}`;
};

function EntradaToggle({ value, onChange }) {
  const cheio = value === 100;
  const lado = { flex: 1, position: "relative", zIndex: 1, textAlign: "center", transition: "color var(--dur-base) var(--ease-standard)" };
  return (
    <button type="button" role="switch" aria-checked={cheio} onClick={() => onChange(cheio ? 50 : 100)} style={{
      position: "relative", display: "flex", alignItems: "center", width: "100%", height: 40, padding: 3,
      borderRadius: "var(--radius-pill)", border: "var(--border-hairline) solid var(--color-border-strong)",
      background: "var(--color-surface-sunken, var(--color-bg))", cursor: "pointer",
      fontFamily: "var(--font-ui)", fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)"
    }}>
      <span style={{
        position: "absolute", top: 3, bottom: 3, left: cheio ? "50%" : 3, width: "calc(50% - 3px)",
        borderRadius: "var(--radius-pill)", background: "var(--color-accent)", boxShadow: "0 1px 3px rgba(40,24,16,.18)",
        transition: "left var(--dur-base) var(--ease-standard)"
      }} />
      <span style={{ ...lado, color: cheio ? "var(--text-muted)" : "var(--color-accent-contrast)" }}>50%</span>
      <span style={{ ...lado, color: cheio ? "var(--color-accent-contrast)" : "var(--text-muted)" }}>100%</span>
    </button>
  );
}

function Anexo({ arquivo, onFile }) {
  if (arquivo) return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0, fontSize: "var(--fs-tiny)", color: "var(--text-body)" }}>
    <PM.Icon name="paperclip" size={14} style={{ color: "var(--text-muted)", flex: "0 0 auto" }} />
    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{arquivo}</span>
  </span>;
  return <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: "var(--fs-tiny)", fontWeight: "var(--fw-semibold)", color: "var(--color-accent)" }}>
    <PM.Icon name="upload" size={14} />Anexar comprovante
    <input type="file" accept="image/*,.pdf" hidden onChange={e => e.target.files[0] && onFile(e.target.files[0].name)} />
  </label>;
}

const PG_COLS = "minmax(0,1fr) minmax(0,.8fr) minmax(0,1.4fr) 32px";

function PagamentosModal({ lista, onChange, onClose, onToast }) {
  const [valor, setValor] = React.useState("");
  const [arquivo, setArquivo] = React.useState(null);
  const total = lista.reduce((s, p) => s + p.valor, 0);
  const cab = { fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)" };
  const registrar = () => {
    const v = parseFloat(String(valor).replace(",", "."));
    if (!v) return;
    onChange([...lista, { quando: agora(), valor: v, arquivo, origem: "manual" }]);
    setValor(""); setArquivo(null); onToast("Pagamento registrado");
  };
  return (
    <PM.Modal width={600} title="Pagamentos" onClose={onClose}
      subtitle="Tudo o que o cliente já pagou: pelo site e registrado manualmente. Registros manuais não geram cobrança nem avisam o cliente."
      footer={<PM.Button variant="ghost" block onClick={onClose}>Fechar</PM.Button>}>
      <div style={{ border: "var(--border-hairline) solid var(--color-border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: PG_COLS, gap: 12, padding: "10px 14px", ...cab }}>
          <span>Registro</span><span style={{ textAlign: "right" }}>Valor</span><span>Comprovante</span><span />
        </div>
        {lista.length ? lista.map((p, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: PG_COLS, gap: 12, alignItems: "center", padding: "10px 14px", borderTop: "var(--border-hairline) solid var(--color-border)", fontSize: "var(--fs-body-s)" }}>
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.3, minWidth: 0 }}>
              <span style={{ color: "var(--text-body)", whiteSpace: "nowrap" }}>{p.quando}</span>
              <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>{p.origem === "site" ? "Pelo site · " + (p.meio || "Pix") : "Manual"}</span>
            </span>
            <span style={{ textAlign: "right", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)", whiteSpace: "nowrap" }}>{brl(p.valor)}</span>
            {p.origem === "site"
              ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}><PM.Icon name="check" size={14} />Confirmado automaticamente</span>
              : <Anexo arquivo={p.arquivo} onFile={n => onChange(lista.map((x, j) => j === i ? { ...x, arquivo: n } : x))} />}
            {p.origem === "site" ? <span /> : <button type="button" aria-label="Remover pagamento" title="Remover pagamento" onClick={() => { onChange(lista.filter((_, j) => j !== i)); onToast("Pagamento removido"); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, padding: 0, border: "none", borderRadius: "var(--radius-sm)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}><PM.Icon name="trash" size={16} /></button>}
          </div>
        )) : <div style={{ padding: "14px", borderTop: "var(--border-hairline) solid var(--color-border)", fontSize: "var(--fs-body-s)", color: "var(--text-muted)" }}>Nenhum pagamento registrado.</div>}
        <div style={{ display: "grid", gridTemplateColumns: PG_COLS, gap: 12, alignItems: "center", padding: "12px 14px", borderTop: "var(--border-hairline) solid var(--color-border-strong)", background: "var(--color-accent-soft)" }}>
          <span style={{ fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-bold)" }}>Total recebido</span>
          <span style={{ textAlign: "right", fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-bold)", whiteSpace: "nowrap" }}>{brl(total)}</span>
          <span /><span />
        </div>
      </div>
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "minmax(0,1fr) auto auto", gap: 12, alignItems: "end" }}>
        <PM.Field label="Novo pagamento"><PM.Input type="number" prefix="R$" step="0.01" placeholder="0,00" value={valor} onChange={e => setValor(e.target.value)} /></PM.Field>
        <div style={{ height: 40, display: "flex", alignItems: "center" }}><Anexo arquivo={arquivo} onFile={setArquivo} /></div>
        <PM.Button tone="warn" icon="plus" onClick={registrar}>Registrar</PM.Button>
      </div>
    </PM.Modal>
  );
}

const novoRascunho = n => ({ uid: Date.now() + n, cliente: "", tel: "", data: "", hora: "", entrega: "Retirada no local", pgto: "Pix", entrada: 50, tipo: "Pessoa física", obs: "", itens: [{ nome: "", qtd: 1, preco: "" }] });
const totalRascunho = r => r.itens.reduce((s, it) => s + (Number(it.qtd) || 0) * (parseFloat(String(it.preco).replace(",", ".")) || 0), 0);
const ITEM_COLS = "minmax(0,1fr) 80px 130px 40px";

function ManualModal({ onClose, onToast }) {
  const [lista, setLista] = React.useState([novoRascunho(0)]);
  const [ativo, setAtivo] = React.useState(0);
  const r = lista[ativo];
  const set = (k, v) => setLista(l => l.map((x, i) => i === ativo ? { ...x, [k]: v } : x));
  const setItem = (j, k, v) => set("itens", r.itens.map((it, i) => i === j ? { ...it, [k]: v } : it));
  const novo = () => { setLista(l => [...l, novoRascunho(l.length)]); setAtivo(lista.length); };
  const remover = i => { if (lista.length === 1) return; setLista(l => l.filter((_, j) => j !== i)); setAtivo(a => Math.max(0, a >= i ? a - 1 : a)); };
  const ctl = k => ({ value: r[k], onChange: e => set(k, e.target.value) });
  const n = lista.length;
  const geral = lista.reduce((s, x) => s + totalRascunho(x), 0);

  return (
    <PM.Modal width={860} title="Pedidos manuais" onClose={onClose}
      subtitle="Mesmo fluxo do site: registra no Coda, notifica o Telegram (Confirmar Estoque) e segue o ciclo normal — cobrança, fila da cozinha, avisos no WhatsApp do cliente."
      footer={<>
        <PM.Button variant="ghost" block onClick={onClose}>Cancelar</PM.Button>
        <PM.Button block icon="check" onClick={() => { onClose(); onToast(n > 1 ? `${n} pedidos criados` : "Pedido criado"); }}>{n > 1 ? `Criar ${n} pedidos · ${brl(geral)}` : "Criar pedido"}</PM.Button>
      </>}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", paddingBottom: 14, marginBottom: 16, borderBottom: "var(--border-hairline) solid var(--color-border)" }}>
        {lista.map((x, i) => {
          const on = i === ativo;
          return (
            <div key={x.uid} onClick={() => setAtivo(i)} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 8px 6px 12px", cursor: "pointer",
              borderRadius: "var(--radius-md)", border: "var(--border-hairline) solid " + (on ? "var(--color-accent)" : "var(--color-border)"),
              background: on ? "var(--color-accent-soft)" : "var(--color-surface)"
            }}>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
                <span style={{ fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.cliente || `Pedido ${i + 1}`}</span>
                <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>{brl(totalRascunho(x))}</span>
              </div>
              {n > 1 ? <button type="button" aria-label="Remover pedido" onClick={e => { e.stopPropagation(); remover(i); }} style={{ display: "flex", padding: 4, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", borderRadius: "var(--radius-xs)" }}><PM.Icon name="x" size={14} /></button> : null}
            </div>
          );
        })}
        <PM.Button size="sm" variant="quiet" icon="plus" onClick={novo}>Novo pedido</PM.Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "10px 12px" }}>
        <PM.Field label="Cliente" required><PM.Input placeholder="Nome do cliente" {...ctl("cliente")} /></PM.Field>
        <PM.Field label="WhatsApp" required><PM.Input placeholder="(38) 99999-9999" {...ctl("tel")} /></PM.Field>
        <PM.Field label="Tipo de cliente"><PM.Select options={["Pessoa física", "Empresa", "Festa"]} {...ctl("tipo")} /></PM.Field>
        <PM.Field label="Data de entrega" required><PM.Input type="date" {...ctl("data")} /></PM.Field>
        <PM.Field label="Hora"><PM.Input type="time" {...ctl("hora")} /></PM.Field>
        <PM.Field label="Entrega"><PM.Select options={["Retirada no local", "Entrega em endereço"]} {...ctl("entrega")} /></PM.Field>
        <PM.Field label="Pagamento"><PM.Select options={["Pix", "Cartão", "Dinheiro"]} {...ctl("pgto")} /></PM.Field>
        <PM.Field label="Entrada" hint="Percentual cobrado agora"><EntradaToggle value={r.entrada} onChange={v => set("entrada", v)} /></PM.Field>
        <PM.Field label="Observações"><PM.Input placeholder="Opcional" {...ctl("obs")} /></PM.Field>
      </div>

      <div style={{ marginTop: 18, border: "var(--border-hairline) solid var(--color-border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: ITEM_COLS, gap: 10, padding: "10px 12px", fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)" }}>
          <span>Produto</span><span>Qtd</span><span>Preço un.</span><span />
        </div>
        {r.itens.map((it, j) => (
          <div key={j} style={{ display: "grid", gridTemplateColumns: ITEM_COLS, gap: 10, alignItems: "center", padding: "8px 12px", borderTop: "var(--border-hairline) solid var(--color-border)" }}>
            <PM.Input size="sm" placeholder="Ex.: Bolo de chocolate 2kg" value={it.nome} onChange={e => setItem(j, "nome", e.target.value)} />
            <PM.Input size="sm" type="number" min="1" value={it.qtd} onChange={e => setItem(j, "qtd", e.target.value)} />
            <PM.Input size="sm" type="number" prefix="R$" step="0.01" placeholder="0,00" value={it.preco} onChange={e => setItem(j, "preco", e.target.value)} />
            <PM.IconButton icon="trash-2" label="Remover item" onClick={() => r.itens.length > 1 && set("itens", r.itens.filter((_, i) => i !== j))} />
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 12px", borderTop: "var(--border-hairline) solid var(--color-border)" }}>
          <PM.Button size="sm" variant="quiet" icon="plus" onClick={() => set("itens", [...r.itens, { nome: "", qtd: 1, preco: "" }])}>Adicionar item</PM.Button>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>Entrada {r.entrada}% · {brl(totalRascunho(r) * r.entrada / 100)}</span>
            <b style={{ fontSize: "var(--fs-subhead)" }}>{brl(totalRascunho(r))}</b>
          </div>
        </div>
      </div>
    </PM.Modal>
  );
}

Object.assign(window, { ManualModal, PagamentosModal, EntradaToggle, brl });
