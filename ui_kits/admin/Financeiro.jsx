const FN = window.DLuhFestasDesignSystem_c861a2;

const FIN_TABS = [
  { id: "transacoes", label: "Transações", acao: "Nova transação" },
  { id: "boletos", label: "Boletos", acao: "Novo boleto" },
  { id: "cartoes", label: "Cartões", acao: "Novo cartão" },
  { id: "contratos", label: "Contratos" }
];

const FIN_FORM = {
  transacoes: { titulo: "Nova transação", campos: [
    { id: "desc", rot: "Descrição", span: 2 }, { id: "tipo", rot: "Tipo", opcoes: ["Entrada", "Saída"] },
    { id: "meio", rot: "Forma", opcoes: ["Pix", "Cartão", "Dinheiro", "Boleto", "Transferência"] },
    { id: "data", rot: "Data", tipo: "date" }, { id: "valor", rot: "Valor", tipo: "dinheiro" }] },
  boletos: { titulo: "Novo boleto", campos: [
    { id: "desc", rot: "Fornecedor / descrição", span: 2 }, { id: "venc", rot: "Vencimento", tipo: "date" },
    { id: "valor", rot: "Valor", tipo: "dinheiro" }, { id: "codigo", rot: "Linha digitável", span: 2 }] },
  cartoes: { titulo: "Novo cartão", campos: [
    { id: "nome", rot: "Nome do cartão", span: 2 }, { id: "final", rot: "Final", ph: "0000" },
    { id: "bandeira", rot: "Bandeira", opcoes: ["Visa", "Mastercard", "Elo", "Outra"] },
    { id: "limite", rot: "Limite", tipo: "dinheiro" }, { id: "venc", rot: "Dia do vencimento", tipo: "number" }] }
};

const dataCurta = iso => iso ? iso.split("-").reverse().slice(0, 2).join("/") : "—";

function FinRegistro({ tab, onClose, onSave }) {
  const f = FIN_FORM[tab];
  const [v, setV] = React.useState(() => Object.fromEntries(f.campos.filter(c => c.opcoes).map(c => [c.id, c.opcoes[0]])));
  return (
    <FN.Modal width={480} title={f.titulo} onClose={onClose} dismissible={false}
      footer={<><FN.Button variant="ghost" block onClick={onClose}>Cancelar</FN.Button><FN.Button block icon="check" onClick={() => onSave(v)}>Registrar</FN.Button></>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "10px 12px" }}>
        {f.campos.map(c => (
          <FN.Field key={c.id} label={c.rot} style={{ gridColumn: c.span ? "span 2" : undefined }}>
            {c.opcoes
              ? <FN.Select options={c.opcoes} value={v[c.id]} onChange={e => setV({ ...v, [c.id]: e.target.value })} />
              : <FN.Input type={c.tipo === "date" ? "date" : c.tipo === "dinheiro" || c.tipo === "number" ? "number" : "text"}
                  step={c.tipo === "dinheiro" ? "0.01" : undefined} prefix={c.tipo === "dinheiro" ? "R$" : undefined} placeholder={c.ph}
                  value={v[c.id] || ""} onChange={e => setV({ ...v, [c.id]: e.target.value })} />}
          </FN.Field>
        ))}
      </div>
    </FN.Modal>
  );
}

function Financeiro({ compact }) {
  const [tab, setTab] = React.useState("transacoes");
  const [novo, setNovo] = React.useState(false);
  const [apagar, setApagar] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const [dados, setDados] = React.useState(() => ({ ...window.DLUH.financeiro }));
  const showToast = m => { setToast(m); setTimeout(() => setToast(null), 2400); };
  const t = FIN_TABS.find(x => x.id === tab);
  const n = v => Number(String(v || "").replace(",", ".")) || 0;
  const remover = i => { setDados(d => ({ ...d, [tab]: d[tab].filter((_, j) => j !== i) })); setApagar(null); showToast("Registro removido"); };
  const nomeDe = x => x.desc || (x.nome ? x.nome + " · final " + x.final : "este registro");

  const salvar = v => {
    const item = tab === "transacoes" ? { desc: v.desc || "Transação", tipo: v.tipo, meio: v.meio, data: dataCurta(v.data), valor: n(v.valor) }
      : tab === "boletos" ? { desc: v.desc || "Boleto", venc: dataCurta(v.venc), valor: n(v.valor), status: "Em aberto" }
      : { nome: v.nome || "Cartão", final: v.final || "0000", bandeira: v.bandeira, limite: n(v.limite), fatura: 0, venc: v.venc || "—" };
    setDados(d => ({ ...d, [tab]: [item, ...d[tab]] }));
    setNovo(false); showToast("Registro salvo");
  };

  const lixo = i => <FN.IconButton icon="trash-2" label="Remover" size={36} style={{ marginLeft: 10 }} onClick={() => setApagar(i)} />;
  const vazio = <FN.EmptyState icon="wallet" title="Nada registrado ainda" description="Use o botão acima para adicionar o primeiro registro." />;
  const lista = dados[tab] || [];

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "var(--space-8)", minHeight: "100%" }}>
      <FN.Tabs value={tab} onChange={setTab} items={FIN_TABS.map(x => ({ id: x.id, label: x.label, count: x.id === "contratos" ? undefined : (dados[x.id] || []).length }))} />

      {tab === "contratos" ? <window.Contratos compact={compact} /> : <>
        <div style={{ display: "flex", gap: "var(--gap-inline)", alignItems: "center", flexWrap: "wrap" }}>
          {tab === "transacoes" ? <>
            <FN.Badge tone="success" icon="arrow-down-left">Entradas {window.brl(lista.filter(x => x.tipo === "Entrada").reduce((s, x) => s + x.valor, 0))}</FN.Badge>
            <FN.Badge icon="arrow-up-right">Saídas {window.brl(lista.filter(x => x.tipo === "Saída").reduce((s, x) => s + x.valor, 0))}</FN.Badge>
          </> : tab === "boletos" ? <FN.Badge tone="warn" icon="clock">Em aberto {window.brl(lista.filter(x => x.status !== "Pago").reduce((s, x) => s + x.valor, 0))}</FN.Badge> : null}
          <div style={{ flex: 1 }} />
          <FN.Button size="sm" icon="plus" onClick={() => setNovo(true)}>{t.acao}</FN.Button>
        </div>
        <FN.Card padded={!!lista.length} bodyStyle={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {!lista.length ? vazio : tab === "transacoes" ? lista.map((x, i) => (
            <FN.ListRow key={i} icon={x.tipo === "Entrada" ? "arrow-down-left" : "arrow-up-right"} title={x.desc} subtitle={x.data + " · " + x.meio}
              value={(x.tipo === "Entrada" ? "+ " : "− ") + window.brl(x.valor)} tone={x.tipo === "Entrada" ? "in" : "out"} trailing={lixo(i)} />
          )) : tab === "boletos" ? lista.map((x, i) => (
            <FN.ListRow key={i} icon="receipt" title={x.desc} subtitle={"Vence " + x.venc} value={window.brl(x.valor)}
              trailing={<div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 10 }}>
                {x.status === "Pago" ? <FN.Badge tone="success">Pago</FN.Badge>
                  : <FN.Button size="sm" variant="outline" icon="check" onClick={() => { setDados(d => ({ ...d, boletos: d.boletos.map((b, j) => j === i ? { ...b, status: "Pago" } : b) })); showToast("Boleto marcado como pago"); }}>Marcar pago</FN.Button>}
                {lixo(i)}
              </div>} />
          )) : lista.map((x, i) => (
            <FN.ListRow key={i} icon="credit-card" title={x.nome + " · final " + x.final} subtitle={x.bandeira + " · vence dia " + x.venc + " · limite " + window.brl(x.limite)}
              value={window.brl(x.fatura)} trailing={lixo(i)} />
          ))}
        </FN.Card>
      </>}

      {novo ? <FinRegistro tab={tab} onClose={() => setNovo(false)} onSave={salvar} /> : null}
      {apagar != null && lista[apagar] ? <FN.ConfirmDialog tone="danger" icon="trash-2" title="Remover registro?"
        message={nomeDe(lista[apagar]) + " sai do financeiro. Não dá pra desfazer."}
        confirmLabel="Sim, remover" cancelLabel="Voltar" onCancel={() => setApagar(null)} onConfirm={() => remover(apagar)} /> : null}
      {toast ? <FN.Toast tone="success" icon="check">{toast}</FN.Toast> : null}
    </div>
  );
}

Object.assign(window, { Financeiro });
