const FN = window.DLuhFestasDesignSystem_c861a2;

const FIN_TABS = [
  { id: "transacoes", label: "Transações", acao: "Nova transação" },
  { id: "boletos", label: "Boletos", acao: "Novo boleto" },
  { id: "cartoes", label: "Cartões", acao: "Novo cartão" },
  { id: "contratos", label: "Contratos" }
];

const FIN_FORM = {
  transacoes: { titulo: "Nova transação", campos: [
    { id: "desc", rot: "Descrição", span: 2, req: true }, { id: "tipo", rot: "Tipo", opcoes: ["Entrada", "Saída"] },
    { id: "meio", rot: "Forma", opcoes: ["Pix", "Cartão", "Dinheiro", "Boleto", "Transferência"] },
    { id: "data", rot: "Data", tipo: "date" }, { id: "valor", rot: "Valor", tipo: "dinheiro", req: true }] },
  boletos: { titulo: "Novo boleto", campos: [
    { id: "desc", rot: "Fornecedor / descrição", span: 2, req: true }, { id: "venc", rot: "Vencimento", tipo: "date", req: true },
    { id: "valor", rot: "Valor", tipo: "dinheiro", req: true }, { id: "codigo", rot: "Linha digitável", span: 2 }] },
  cartoes: { titulo: "Novo cartão", campos: [
    { id: "nome", rot: "Nome do cartão", span: 2, req: true }, { id: "final", rot: "Final", ph: "0000", req: true },
    { id: "bandeira", rot: "Bandeira", opcoes: ["Visa", "Mastercard", "Elo", "Outra"] },
    { id: "limite", rot: "Limite", tipo: "dinheiro" }, { id: "venc", rot: "Dia do vencimento", tipo: "number" }] }
};

/* What each tab says when it has nothing yet, and the one action that fills it. */
const FIN_VAZIO = {
  transacoes: { icone: "arrow-left-right", titulo: "Nenhuma transação registrada", texto: "Entradas e saídas do caixa aparecem aqui." },
  boletos: { icone: "receipt", titulo: "Nenhum boleto registrado", texto: "Boletos a pagar aparecem aqui, com vencimento e valor." },
  cartoes: { icone: "credit-card", titulo: "Nenhum cartão cadastrado", texto: "Cadastre os cartões da loja para acompanhar fatura, limite e vencimento." }
};

const dataCurta = iso => iso ? iso.split("-").reverse().slice(0, 2).join("/") : "—";
const num = v => Number(String(v || "").replace(",", ".")) || 0;

const errosDe = (f, v) => {
  const e = {};
  f.campos.filter(c => c.req).forEach(c => {
    if (c.tipo === "dinheiro" ? !(num(v[c.id]) > 0) : !String(v[c.id] || "").trim())
      e[c.id] = c.tipo === "dinheiro" ? "Digite um valor maior que zero" : c.tipo === "date" ? "Escolha a data" : "Preencha este campo";
  });
  if (v.final && !/^\d{4}$/.test(v.final)) e.final = "Os 4 últimos números do cartão";
  if (v.venc && f === FIN_FORM.cartoes && !(Number(v.venc) >= 1 && Number(v.venc) <= 31)) e.venc = "Um dia entre 1 e 31";
  return e;
};

function FinRegistro({ tab, onClose, onSave, salvando }) {
  const f = FIN_FORM[tab];
  const [v, setV] = React.useState(() => Object.fromEntries(f.campos.filter(c => c.opcoes).map(c => [c.id, c.opcoes[0]])));
  const [tentou, setTentou] = React.useState(false);
  const erros = tentou ? errosDe(f, v) : {};
  const registrar = () => { setTentou(true); if (!Object.keys(errosDe(f, v)).length) onSave(v); };
  return (
    <FN.Modal width={480} title={f.titulo} onClose={salvando ? null : onClose} dismissible={false}
      footer={<><FN.Button variant="ghost" block disabled={salvando} onClick={onClose}>Cancelar</FN.Button><FN.Button block icon="check" loading={salvando} onClick={registrar}>Registrar</FN.Button></>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "10px 12px" }}>
        {f.campos.map(c => (
          <FN.Field key={c.id} label={c.rot} required={c.req} error={erros[c.id]} style={{ gridColumn: c.span ? "span 2" : undefined }}>
            {c.opcoes
              ? <FN.Select options={c.opcoes} value={v[c.id]} onChange={e => setV({ ...v, [c.id]: e.target.value })} />
              : <FN.Input type={c.tipo === "date" ? "date" : c.tipo === "dinheiro" || c.tipo === "number" ? "number" : "text"}
                  step={c.tipo === "dinheiro" ? "0.01" : undefined} min={c.tipo === "dinheiro" ? "0" : undefined}
                  inputMode={c.id === "final" ? "numeric" : undefined} maxLength={c.id === "final" ? 4 : undefined}
                  prefix={c.tipo === "dinheiro" ? "R$" : undefined} placeholder={c.ph} invalid={!!erros[c.id]}
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
  const [toastNode, showToast] = useToast();
  const [acao, pendente] = useAcao(showToast);
  const carga = useCarga(() => window.DLUH_API.carregar("financeiro"));
  const dados = carga.dados || {};
  const t = FIN_TABS.find(x => x.id === tab);
  const nomeDe = x => x.desc || (x.nome ? x.nome + " · final " + x.final : "este registro");
  const muda = fn => carga.setDados(d => ({ ...d, [tab]: fn(d[tab] || []) }));

  const remover = async i => {
    await acao("remover", { ok: "Registro removido", falhou: "Não deu pra remover o registro" }, () => muda(l => l.filter((_, j) => j !== i)));
    setApagar(null);
  };
  const salvar = async v => {
    const item = tab === "transacoes" ? { desc: v.desc.trim(), tipo: v.tipo, meio: v.meio, data: dataCurta(v.data), valor: num(v.valor) }
      : tab === "boletos" ? { desc: v.desc.trim(), venc: dataCurta(v.venc), valor: num(v.valor), status: "Em aberto" }
      : { nome: v.nome.trim(), final: v.final, bandeira: v.bandeira, limite: num(v.limite), fatura: 0, venc: v.venc || "—" };
    if (await acao("salvar", { ok: "Registro salvo", falhou: "Não deu pra salvar o registro" }, () => muda(l => [item, ...l]))) setNovo(false);
  };
  const pagar = i => acao("pagar-" + i, { ok: "Boleto marcado como pago", falhou: "Não deu pra marcar o boleto como pago" },
    () => muda(l => l.map((b, j) => j === i ? { ...b, status: "Pago" } : b)));

  if (carga.estado === "erro" && !carga.dados) return <ErroCarga erro={carga.erro} oque="o financeiro" onTentar={carga.tentar} />;
  if (!carga.dados) return <Carregando oque="o financeiro" />;

  const lixo = i => <FN.IconButton icon="trash-2" label="Remover" size={36} style={{ marginLeft: 10 }} onClick={() => setApagar(i)} />;
  const lista = dados[tab] || [];
  const vz = FIN_VAZIO[tab];
  const vazio = vz ? <FN.EmptyState icon={vz.icone} title={vz.titulo} description={vz.texto}
    action={<FN.Button icon="plus" onClick={() => setNovo(true)}>{t.acao}</FN.Button>} /> : null;

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "var(--space-8)", minHeight: "100%" }}>
      <FN.Tabs value={tab} onChange={setTab} items={FIN_TABS.map(x => ({ id: x.id, label: x.label, count: x.id === "contratos" ? undefined : (dados[x.id] || []).length }))} />

      {tab === "contratos" ? <window.Contratos compact={compact} /> : <>
        {lista.length ? <div style={{ display: "flex", gap: "var(--gap-inline)", alignItems: "center", flexWrap: "wrap" }}>
          {tab === "transacoes" ? <>
            <FN.Badge tone="success" icon="arrow-down-left">Entradas {window.brl(lista.filter(x => x.tipo === "Entrada").reduce((s, x) => s + (x.valor || 0), 0))}</FN.Badge>
            <FN.Badge icon="arrow-up-right">Saídas {window.brl(lista.filter(x => x.tipo === "Saída").reduce((s, x) => s + (x.valor || 0), 0))}</FN.Badge>
          </> : tab === "boletos" ? <FN.Badge tone="warn" icon="clock">Em aberto {window.brl(lista.filter(x => x.status !== "Pago").reduce((s, x) => s + (x.valor || 0), 0))}</FN.Badge> : null}
          <div style={{ flex: 1 }} />
          <FN.Button size="sm" icon="plus" onClick={() => setNovo(true)}>{t.acao}</FN.Button>
        </div> : null}
        <FN.Card padded={!!lista.length} bodyStyle={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {!lista.length ? vazio : tab === "transacoes" ? lista.map((x, i) => (
            <FN.ListRow key={i} icon={x.tipo === "Entrada" ? "arrow-down-left" : "arrow-up-right"} title={x.desc || "Sem descrição"} subtitle={[x.data, x.meio].filter(Boolean).join(" · ")}
              value={x.valor == null ? "—" : (x.tipo === "Entrada" ? "+ " : "− ") + window.brl(x.valor)} tone={x.tipo === "Entrada" ? "in" : "out"} trailing={lixo(i)} />
          )) : tab === "boletos" ? lista.map((x, i) => (
            <FN.ListRow key={i} icon="receipt" title={x.desc || "Sem descrição"} subtitle={"Vence " + (x.venc || "—")} value={x.valor == null ? "—" : window.brl(x.valor)}
              trailing={<div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 10 }}>
                {x.status === "Pago" ? <FN.Badge tone="success">Pago</FN.Badge>
                  : <FN.Button size="sm" variant="outline" icon="check" loading={pendente === "pagar-" + i} onClick={() => pagar(i)}>Marcar pago</FN.Button>}
                {lixo(i)}
              </div>} />
          )) : lista.map((x, i) => (
            <FN.ListRow key={i} icon="credit-card" title={(x.nome || "Cartão") + " · final " + (x.final || "—")}
              subtitle={[x.bandeira, x.venc ? "vence dia " + x.venc : null, x.limite ? "limite " + window.brl(x.limite) : null].filter(Boolean).join(" · ")}
              value={x.fatura == null ? "—" : window.brl(x.fatura)} trailing={lixo(i)} />
          ))}
        </FN.Card>
      </>}

      {novo ? <FinRegistro tab={tab} onClose={() => setNovo(false)} onSave={salvar} salvando={pendente === "salvar"} /> : null}
      {apagar != null && lista[apagar] ? <FN.ConfirmDialog tone="danger" icon="trash-2" title="Remover registro?"
        message={nomeDe(lista[apagar]) + " sai do financeiro. Não dá pra desfazer."} pending={pendente === "remover"}
        confirmLabel="Sim, remover" cancelLabel="Voltar" onCancel={() => setApagar(null)} onConfirm={() => remover(apagar)} /> : null}
      {toastNode}
    </div>
  );
}

Object.assign(window, { Financeiro });
