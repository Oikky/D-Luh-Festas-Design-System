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
    <button type="button" role="switch" aria-checked={cheio} aria-label="Cobrar 100% agora" onClick={() => onChange(cheio ? 50 : 100)} style={{
      position: "relative", display: "flex", alignItems: "center", width: "100%", height: 40, padding: 3,
      borderRadius: "var(--radius-pill)", border: "var(--border-hairline) solid var(--color-border-strong)",
      background: "var(--color-surface-sunken, var(--color-bg))", cursor: "pointer",
      fontFamily: "var(--font-ui)", fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)"
    }}>
      <span style={{
        position: "absolute", top: 3, bottom: 3, left: 3, width: "calc(50% - 3px)",
        borderRadius: "var(--radius-pill)", background: "var(--color-accent-strong)", boxShadow: "0 1px 3px rgba(40,24,16,.18)",
        transform: cheio ? "translateX(100%)" : "none", transition: "transform var(--dur-move) var(--ease-standard)"
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
  return <label data-target style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 32, cursor: "pointer", fontSize: "var(--fs-tiny)", fontWeight: "var(--fw-semibold)", color: "var(--text-accent)" }}>
    <PM.Icon name="upload" size={14} />Anexar comprovante
    <input type="file" accept="image/*,.pdf" hidden onChange={e => e.target.files[0] && onFile(e.target.files[0].name)} />
  </label>;
}

const PG_COLS = "minmax(0,1fr) minmax(0,.8fr) minmax(0,1.4fr) 40px";
const MODO_REAL = () => window.DLUH_API.modo === "firebase";
const MEIO_API = { "Pix": "pix", "Dinheiro": "dinheiro", "Cartão": "cartao" };
const novaChave = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));

function PagamentosModal({ lista, onChange, pedido, onClose, onToast, acao, pendente }) {
  const real = MODO_REAL();
  const [valor, setValor] = React.useState("");
  const [meio, setMeio] = React.useState(pedido && MEIO_API[pedido.pgto] ? pedido.pgto : "Pix");
  const [arquivo, setArquivo] = React.useState(null);
  const [remover, setRemover] = React.useState(null);
  const [erroValor, setErroValor] = React.useState(null);
  const total = lista.reduce((s, p) => s + p.valor, 0);
  const cab = { fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)" };
  /* The amount is checked here; the record only joins the list once the server accepted it. */
  const registrar = async () => {
    const v = parseFloat(String(valor).replace(",", "."));
    if (!(v > 0)) { setErroValor("Digite um valor maior que zero"); return; }
    setErroValor(null);
    const ok = await acao("registrar-pagamento", { ok: "Pagamento registrado", falhou: "Não deu pra registrar o pagamento" },
      () => onChange([...lista, { quando: agora(), valor: v, arquivo, origem: "manual" }]),
      pedido ? { acao: "registrarPagamentoManual", dados: { pedidoId: pedido.id, valor: Math.round(v * 100), meio: MEIO_API[meio], chave: novaChave() } } : undefined);
    if (ok) { setValor(""); setArquivo(null); }
  };
  return (<>
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
              <span style={{ color: "var(--text-body)", whiteSpace: "nowrap" }}>{p.quando || (p.origem === "site" ? "Pelo site" : "Manual")}</span>
              <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>{p.origem === "site" ? (p.quando ? "Pelo site · " : "") + (p.meio || "Pix") : "Manual" + (p.meio ? " · " + p.meio : "")}</span>
            </span>
            <span style={{ textAlign: "right", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)", whiteSpace: "nowrap" }}>{brl(p.valor)}</span>
            {p.origem === "site"
              ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}><PM.Icon name="check" size={14} />Confirmado automaticamente</span>
              : real ? <span /> : <Anexo arquivo={p.arquivo} onFile={n => onChange(lista.map((x, j) => j === i ? { ...x, arquivo: n } : x))} />}
            {p.origem === "site" || real ? <span /> : <PM.IconButton icon="trash-2" label="Remover pagamento" size={36} onClick={() => setRemover(i)} />}
          </div>
        )) : <div style={{ padding: "14px", borderTop: "var(--border-hairline) solid var(--color-border)", fontSize: "var(--fs-body-s)", color: "var(--text-muted)" }}>Nenhum pagamento registrado.</div>}
        <div style={{ display: "grid", gridTemplateColumns: PG_COLS, gap: 12, alignItems: "center", padding: "12px 14px", borderTop: "var(--border-hairline) solid var(--color-border-strong)", background: "var(--color-accent-soft)" }}>
          <span style={{ fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-bold)" }}>Total recebido</span>
          <span style={{ textAlign: "right", fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-bold)", whiteSpace: "nowrap" }}>{brl(total)}</span>
          <span /><span />
        </div>
      </div>
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "minmax(0,1fr) auto auto", gap: 12, alignItems: "start" }}>
        <PM.Field label="Novo pagamento" error={erroValor}><PM.Input type="number" prefix="R$" step="0.01" min="0" placeholder="0,00" invalid={!!erroValor} value={valor} onChange={e => { setValor(e.target.value); setErroValor(null); }} /></PM.Field>
        {real
          ? <PM.Field label="Como pagou"><PM.Select options={Object.keys(MEIO_API)} value={meio} onChange={e => setMeio(e.target.value)} /></PM.Field>
          : <div style={{ height: 40, marginTop: 21, display: "flex", alignItems: "center" }}><Anexo arquivo={arquivo} onFile={setArquivo} /></div>}
        <PM.Button tone="success" icon="plus" loading={pendente === "registrar-pagamento"} onClick={registrar} style={{ marginTop: 21 }}>Registrar</PM.Button>
      </div>
    </PM.Modal>
    {remover != null ? <PM.ConfirmDialog tone="danger" icon="trash-2" title="Remover pagamento?"
      message={`O registro de ${brl(lista[remover].valor)} sai da lista. Não dá pra desfazer.`}
      confirmLabel="Sim, remover" cancelLabel="Voltar" pending={pendente === "remover-pagamento"} onCancel={() => setRemover(null)}
      onConfirm={async () => {
        const i = remover;
        await acao("remover-pagamento", { ok: "Pagamento removido", falhou: "Não deu pra remover o pagamento" }, () => onChange(lista.filter((_, j) => j !== i)));
        setRemover(null);
      }} /> : null}
  </>);
}


/* ── The order form: shared by Pedido manual (new) and Detalhes (edit) ── */

const PGTOS = ["Pix", "Cartão", "Dinheiro", "Não definido"];
const reaisDe = s => parseFloat(String(s).replace(",", ".")) || 0;
const itemVazio = () => ({ nome: "", qtd: 1, preco: "", obs: "", recheios: "", topo: null });
const novoRascunho = n => ({ uid: Date.now() + n, cliente: "", tel: "", data: "", hora: "", entrega: "Retirada no local", endereco: "", taxa: "", pgto: "Pix", entrada: 50, tipo: "Pessoa física", obs: "", itens: [itemVazio()] });
const totalRascunho = r => r.itens.reduce((s, it) => s + (Number(it.qtd) || 0) * reaisDe(it.preco), 0) + (r.entrega === "Entrega em endereço" ? reaisDe(r.taxa) : 0);

/* An existing order as a draft. Real orders carry the raw record in _c; demo rows only have the
   formatted strings, so prices are read back from them. */
const MEIO_ROTULO = { pix: "Pix", cartao: "Cartão", dinheiro: "Dinheiro" };
function rascunhoDe(p) {
  const c = p._c;
  const itens = c
    ? c.itens.map(i => ({ nome: i.nome, qtd: i.qtd, preco: (i.valorUnit / 100).toFixed(2), produtoId: i.produtoId, categoria: i.categoria,
        obs: i.obs || "", recheios: (i.recheios || []).join(", "), topo: i.topo || null }))
    : (p.itens || []).map(i => ({ nome: i.name, qtd: i.qty, preco: (reaisDe(String(i.price).replace(/[^\d,]/g, "")) / (i.qty || 1)).toFixed(2), obs: i.note || "", recheios: "", topo: i.topper || null }));
  return {
    uid: p.id, cliente: p.cliente || "", tel: p.tel || "", data: p.data || "", hora: p.hora || "",
    entrega: p.modo === "Entrega em endereço" ? "Entrega em endereço" : "Retirada no local", endereco: p.endereco || "",
    taxa: c && c.taxaEntrega ? (c.taxaEntrega / 100).toFixed(2) : "",
    pgto: c ? MEIO_ROTULO[c.formaPagamento] || "Não definido" : p.pgto || "Não definido",
    entrada: c ? c.entradaPct : 50, tipo: (c ? c.tipo === "empresa" : p.tipo === "Empresa") ? "Empresa" : "Pessoa física",
    obs: c ? c.obs : p.obs || "", itens: itens.length ? itens : [itemVazio()]
  };
}

/* What saving needs before it can write: the required fields plus one priced item. */
const faltas = r => {
  const f = {};
  if (!r.cliente.trim()) f.cliente = "Preencha o nome do cliente";
  if (r.tel.replace(/\D/g, "").length < 10) f.tel = r.tel.trim() ? "WhatsApp com DDD, ex.: (38) 99999-9999" : "Preencha o WhatsApp";
  if (!r.data) f.data = "Escolha a data de entrega";
  if (r.entrega === "Entrega em endereço" && !r.endereco.trim()) f.endereco = "Preencha o endereço de entrega";
  if (!r.itens.some(it => it.nome.trim() && reaisDe(it.preco) > 0)) f.itens = "Adicione pelo menos um produto com preço";
  if (r.itens.some(it => it.topo && typeof it.topo === "object" && !String(it.topo.tema || "").trim())) f.itens = "Preencha o tema do topo, ou tire o topo do item";
  return f;
};
const preenchido = r => !!(r.cliente || r.tel || r.data || r.hora || r.obs || r.endereco || r.itens.some(it => it.nome || it.preco));

/* The draft as the Worker expects it: money in centavos, only priced items. */
const paraApi = r => ({
  cliente: { nome: r.cliente.trim(), telefone: r.tel },
  tipo: r.tipo === "Empresa" ? "empresa" : "pessoa",
  entrega: { modo: r.entrega === "Entrega em endereço" ? "entrega" : "retirada", data: r.data, hora: r.hora, endereco: r.endereco.trim() },
  taxaEntrega: r.entrega === "Entrega em endereço" ? Math.round(reaisDe(r.taxa) * 100) : 0,
  itens: r.itens.filter(it => it.nome.trim() && reaisDe(it.preco) > 0).map(it => ({
    nome: it.nome.trim(), qtd: Math.max(1, parseInt(it.qtd, 10) || 1), valorUnit: Math.round(reaisDe(it.preco) * 100),
    ...(it.produtoId ? { produtoId: it.produtoId } : {}), ...(it.categoria ? { categoria: it.categoria } : {}),
    ...(it.obs && it.obs.trim() ? { obs: it.obs.trim() } : {}),
    ...(String(it.recheios || "").trim() ? { recheios: String(it.recheios).split(",").map(x => x.trim()).filter(Boolean) } : {}),
    ...(it.topo ? { topo: typeof it.topo === "string" ? it.topo : { tema: it.topo.tema.trim(), ...(it.topo.detalhes ? { detalhes: it.topo.detalhes.trim() } : {}), ...(it.topo.imagem ? { imagem: it.topo.imagem } : {}) } } : {})
  })),
  obs: r.obs, entradaPct: r.entrada, formaPagamento: MEIO_API[r.pgto], origem: "admin"
});

/* Cake topper: theme, details and a reference picture. The picture goes up when chosen; only
   its link travels with the order. */
function TopoItem({ topo, onChange, acao, onToast }) {
  const t = typeof topo === "string" ? { tema: topo } : topo || { tema: "" };
  const [subindo, setSubindo] = React.useState(false);
  const set = (k, v) => onChange({ ...t, [k]: v });
  const escolher = async e => {
    const arq = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!arq) return;
    setSubindo(true);
    try {
      const dataUrl = await window.reduzirImagem(arq);
      if (!MODO_REAL()) { set("imagem", dataUrl); return; }
      const r = await acao("topo-imagem", { falhou: "Não deu pra enviar a imagem do topo" }, null, { acao: "enviarImagem", dados: { dataUrl } });
      if (r && r.url) set("imagem", r.url);
    } catch (err) { onToast(err.message, "danger"); } finally { setSubindo(false); }
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8, alignItems: "end" }}>
      <PM.Field label="Tema do topo"><PM.Input size="sm" placeholder="Ex.: Frozen, “Ana 5 anos”" value={t.tema || ""} onChange={e => set("tema", e.target.value)} /></PM.Field>
      <PM.Field label="Detalhes"><PM.Input size="sm" placeholder="Cores, nome, idade…" value={t.detalhes || ""} onChange={e => set("detalhes", e.target.value)} /></PM.Field>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 32 }}>
        {t.imagem ? <a href={t.imagem} target="_blank" rel="noopener"><img src={t.imagem} alt="Referência do topo" style={{ width: 32, height: 32, objectFit: "cover", borderRadius: "var(--radius-xs)", display: "block" }} /></a> : null}
        <label data-target style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: subindo ? "wait" : "pointer", fontSize: "var(--fs-tiny)", fontWeight: "var(--fw-semibold)", color: "var(--text-accent)" }}>
          <PM.Icon name={subindo ? "loader" : "image-plus"} size={14} />{subindo ? "Enviando…" : t.imagem ? "Trocar imagem" : "Imagem de referência"}
          <input type="file" accept="image/*" hidden disabled={subindo} onChange={escolher} />
        </label>
      </div>
    </div>
  );
}

const ITEM_COLS = "minmax(0,1fr) 72px 120px 40px 40px";

function ItensPedido({ r, set, compact, produtos, erro, acao, onToast, listaId }) {
  const [aberto, setAberto] = React.useState(() => r.itens.map(it => !!(it.topo || it.obs || it.recheios)));
  const setItem = (j, patch) => set("itens", r.itens.map((it, i) => i === j ? { ...it, ...patch } : it));
  /* Typing a catalog name fills price and category; editing the price afterwards is allowed. */
  const nome = (j, v) => {
    const p = window.acharProduto(produtos, v);
    const it = r.itens[j];
    setItem(j, p ? { nome: p.nome, produtoId: p.id, categoria: p.categoria, preco: (p.valorUnit / 100).toFixed(2), qtd: Math.max(Number(it.qtd) || 1, p.qtdMin || 1) }
      : { nome: v, produtoId: undefined, categoria: undefined });
  };
  const linha = (it, j) => {
    const bolo = /bolo/i.test(it.categoria || it.nome);
    const campos = [
      <PM.Input key="n" size="sm" aria-label="Produto" list={listaId} placeholder="Ex.: Bolo de chocolate 2kg" value={it.nome} onChange={e => nome(j, e.target.value)} />,
      <PM.Input key="q" size="sm" aria-label="Quantidade" type="number" min="1" value={it.qtd} onChange={e => setItem(j, { qtd: e.target.value })} />,
      <PM.Input key="p" size="sm" aria-label="Preço unitário" type="number" prefix="R$" step="0.01" placeholder="0,00" value={it.preco} onChange={e => setItem(j, { preco: e.target.value })} />,
      <PM.IconButton key="d" icon={aberto[j] ? "chevron-up" : "chevron-down"} label={aberto[j] ? "Esconder detalhes do item" : "Recheio, topo e observação"} size={36}
        onClick={() => setAberto(a => { const b = [...a]; b[j] = !b[j]; return b; })} />,
      <PM.IconButton key="x" icon="trash-2" label="Remover item" size={36} disabled={r.itens.length === 1} style={r.itens.length === 1 ? { opacity: "var(--disabled-opacity)", cursor: "not-allowed" } : undefined}
        onClick={() => { if (r.itens.length > 1) { set("itens", r.itens.filter((_, i) => i !== j)); setAberto(a => a.filter((_, i) => i !== j)); } }} />
    ];
    return (
      <div key={j} style={{ padding: compact ? "10px 12px" : "8px 12px", borderTop: j || !compact ? "var(--border-hairline) solid var(--color-border)" : "none" }}>
        {compact
          ? <div style={{ display: "grid", gridTemplateColumns: "64px minmax(0,1fr) 40px 40px", gap: 8, alignItems: "center" }}>
              <div style={{ gridColumn: "1 / -1" }}>{campos[0]}</div>{campos[1]}{campos[2]}{campos[3]}{campos[4]}
            </div>
          : <div style={{ display: "grid", gridTemplateColumns: ITEM_COLS, gap: 8, alignItems: "center" }}>{campos}</div>}
        {aberto[j] ? <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "10px 0 4px", padding: "10px 12px", borderRadius: "var(--radius-sm)", background: "var(--color-surface-2)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
            <PM.Field label="Recheio" hint="Separe por vírgula"><PM.Input size="sm" placeholder="Ex.: Ninho com Nutella" value={it.recheios || ""} onChange={e => setItem(j, { recheios: e.target.value })} /></PM.Field>
            <PM.Field label="Observação do item"><PM.Input size="sm" placeholder="Opcional" value={it.obs || ""} onChange={e => setItem(j, { obs: e.target.value })} /></PM.Field>
          </div>
          {it.topo
            ? <>
                <TopoItem topo={it.topo} onChange={v => setItem(j, { topo: v })} acao={acao} onToast={onToast} />
                <div><PM.Button size="sm" variant="quiet" icon="x" onClick={() => setItem(j, { topo: null })}>Tirar topo</PM.Button></div>
              </>
            : <div><PM.Button size="sm" variant="quiet" icon="plus" onClick={() => setItem(j, { topo: { tema: "" } })}>{bolo ? "Adicionar topo do bolo" : "Adicionar topo"}</PM.Button></div>}
        </div> : null}
      </div>
    );
  };
  return (<>
    <div style={{ marginTop: 18, border: "var(--border-hairline) solid " + (erro ? "var(--action-danger)" : "var(--color-border)"), borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
      {compact ? null : <div style={{ display: "grid", gridTemplateColumns: ITEM_COLS, gap: 8, padding: "10px 12px", fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)" }}>
        <span>Produto</span><span>Qtd</span><span>Preço un.</span><span /><span />
      </div>}
      {r.itens.map(linha)}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: "10px 12px", borderTop: "var(--border-hairline) solid var(--color-border)" }}>
        <PM.Button size="sm" variant="quiet" icon="plus" onClick={() => { set("itens", [...r.itens, itemVazio()]); setAberto(a => [...a, false]); }}>Adicionar item</PM.Button>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>Entrada {r.entrada}% · {brl(totalRascunho(r) * r.entrada / 100)}</span>
          <b style={{ fontSize: "var(--fs-subhead)" }}>{brl(totalRascunho(r))}</b>
        </div>
      </div>
    </div>
    {erro ? <div style={{ marginTop: 6, fontSize: "var(--fs-tiny)", color: "var(--action-danger)" }}>{erro}</div> : null}
  </>);
}

function CamposPedido({ r, set, erros }) {
  const ctl = k => ({ value: r[k], onChange: e => set(k, e.target.value) });
  const entrega = r.entrega === "Entrega em endereço";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "10px 12px" }}>
      <PM.Field label="Cliente" required error={erros.cliente}><PM.Input placeholder="Nome do cliente" invalid={!!erros.cliente} {...ctl("cliente")} /></PM.Field>
      <PM.Field label="WhatsApp" required error={erros.tel}><PM.Input type="tel" placeholder="(38) 99999-9999" invalid={!!erros.tel} {...ctl("tel")} /></PM.Field>
      <PM.Field label="Tipo de cliente"><PM.Select options={["Pessoa física", "Empresa"]} {...ctl("tipo")} /></PM.Field>
      <PM.Field label="Data de entrega" required error={erros.data}><PM.Input type="date" invalid={!!erros.data} {...ctl("data")} /></PM.Field>
      <PM.Field label="Hora"><PM.Input type="time" {...ctl("hora")} /></PM.Field>
      <PM.Field label="Entrega"><PM.Select options={["Retirada no local", "Entrega em endereço"]} {...ctl("entrega")} /></PM.Field>
      {entrega ? <PM.Field label="Endereço" required error={erros.endereco}><PM.Input placeholder="Rua, número, bairro" invalid={!!erros.endereco} {...ctl("endereco")} /></PM.Field> : null}
      {entrega ? <PM.Field label="Taxa de entrega"><PM.Input type="number" prefix="R$" step="0.01" min="0" placeholder="0,00" {...ctl("taxa")} /></PM.Field> : null}
      <PM.Field label="Pagamento"><PM.Select options={PGTOS} {...ctl("pgto")} /></PM.Field>
      <PM.Field label="Entrada" hint="Percentual cobrado agora"><EntradaToggle value={r.entrada} onChange={v => set("entrada", v)} /></PM.Field>
      <PM.Field label="Observações"><PM.Input placeholder="Opcional" {...ctl("obs")} /></PM.Field>
    </div>
  );
}

function ManualModal({ compact, onClose, onToast, acao, pendente, produtos }) {
  const [lista, setLista] = React.useState([novoRascunho(0)]);
  const [ativo, setAtivo] = React.useState(0);
  const [tentou, setTentou] = React.useState(false);
  const [sair, setSair] = React.useState(false);
  const r = lista[ativo];
  const set = (k, v) => setLista(l => l.map((x, i) => i === ativo ? { ...x, [k]: v } : x));
  const novo = () => { setLista(l => [...l, novoRascunho(l.length)]); setAtivo(lista.length); };
  const remover = i => { if (lista.length === 1) return; setLista(l => l.filter((_, j) => j !== i)); setAtivo(a => Math.max(0, a >= i ? a - 1 : a)); };
  const n = lista.length;
  const geral = lista.reduce((s, x) => s + totalRascunho(x), 0);
  const erros = tentou ? faltas(r) : {};
  const fechar = () => pendente === "criar-pedido" ? null : lista.some(preenchido) ? setSair(true) : onClose();
  /* Drafts stay on screen until the server confirms; a failed write keeps everything typed. */
  const criar = async () => {
    const i = lista.findIndex(x => Object.keys(faltas(x)).length);
    if (i >= 0) { setTentou(true); setAtivo(i); return; }
    /* One call per draft; each one that is created leaves the list, so a failure halfway never
       creates the same order twice when the atendente tries again. */
    const ok = await acao("criar-pedido", { ok: n > 1 ? `${n} pedidos criados` : "Pedido criado", falhou: n > 1 ? "Não deu pra criar os pedidos" : "Não deu pra criar o pedido" }, null,
      async chamar => {
        for (const x of lista) {
          await chamar("criarPedido", paraApi(x));
          setLista(l => l.length > 1 ? l.filter(y => y.uid !== x.uid) : l);
          setAtivo(0);
        }
        return { ok: true };
      });
    if (ok) onClose();
  };

  return (<>
    <PM.Modal width={860} title={n > 1 ? "Pedidos manuais" : "Pedido manual"} onClose={fechar}
      subtitle="Mesmo fluxo do site: o pedido entra em Estoque pendente e segue o ciclo normal — confirmar estoque, cobrança, fila da cozinha."
      footer={<>
        <PM.Button variant="ghost" block onClick={fechar}>Cancelar</PM.Button>
        <PM.Button block icon="check" loading={pendente === "criar-pedido"} onClick={criar}>{n > 1 ? `Criar ${n} pedidos · ${brl(geral)}` : "Criar pedido"}</PM.Button>
      </>}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", paddingBottom: 14, marginBottom: 16, borderBottom: "var(--border-hairline) solid var(--color-border)" }}>
        {lista.map((x, i) => {
          const on = i === ativo;
          const comErro = tentou && Object.keys(faltas(x)).length > 0;
          return (
            <div key={x.uid} style={{
              display: "flex", alignItems: "center", borderRadius: "var(--radius-md)",
              border: "var(--border-hairline) solid " + (comErro ? "var(--action-danger)" : on ? "var(--color-accent)" : "var(--color-border)"),
              background: on ? "var(--color-accent-soft)" : "var(--color-surface)"
            }}>
              <button type="button" aria-pressed={on} onClick={() => setAtivo(i)} style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.25, padding: "6px 8px 6px 12px",
                border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-ui)", borderRadius: "var(--radius-md)"
              }}>
                <span style={{ fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{x.cliente || `Pedido ${i + 1}`}</span>
                <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-body)" }}>{brl(totalRascunho(x))}</span>
              </button>
              {n > 1 ? <button type="button" aria-label={`Remover ${x.cliente || `pedido ${i + 1}`}`} onClick={() => remover(i)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, marginRight: 4, padding: 0, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", borderRadius: "var(--radius-xs)" }}><PM.Icon name="x" size={14} /></button> : null}
            </div>
          );
        })}
        <PM.Button size="sm" variant="quiet" icon="plus" onClick={novo}>Novo pedido</PM.Button>
      </div>

      <CamposPedido r={r} set={set} erros={erros} />
      <window.ListaProdutos id="dluh-produtos-manual" produtos={produtos} />
      <ItensPedido key={r.uid} r={r} set={set} compact={compact} produtos={produtos} erro={erros.itens} acao={acao} onToast={onToast} listaId="dluh-produtos-manual" />
    </PM.Modal>
    {sair ? <PM.ConfirmDialog tone="danger" icon="trash-2" title={n > 1 ? "Descartar pedidos?" : "Descartar pedido?"}
      message="O que foi preenchido aqui se perde." confirmLabel="Sim, descartar" cancelLabel="Voltar"
      onCancel={() => setSair(false)} onConfirm={() => { setSair(false); onClose(); }} /> : null}
  </>);
}

Object.assign(window, { ManualModal, PagamentosModal, EntradaToggle, brl, CamposPedido, ItensPedido, rascunhoDe, faltas, preenchido, paraApi, totalRascunho });
