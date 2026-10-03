const FN = window.DLuhFestasDesignSystem_c861a2;

const FIN_TABS = [
  { id: "transacoes", label: "Transações", acao: "Nova transação" },
  { id: "boletos", label: "Boletos", acao: "Novo boleto" },
  { id: "cartoes", label: "Cartões", acao: "Novo cartão" },
  { id: "contratos", label: "Contratos" }
];
const TIPO_DA_ABA = { transacoes: "transacao", boletos: "boleto", cartoes: "cartao" };

const FIN_FORM = {
  transacoes: { titulo: "Nova transação", editar: "Editar transação", campos: [
    { id: "desc", rot: "Descrição", span: 2, req: true }, { id: "tipo", rot: "Tipo", opcoes: ["Saída", "Entrada"] },
    { id: "meio", rot: "Forma", opcoes: ["Pix", "Cartão", "Dinheiro", "Boleto", "Transferência"] },
    { id: "data", rot: "Data", tipo: "date", req: true }, { id: "valor", rot: "Valor", tipo: "dinheiro", req: true }] },
  // Boletos têm formulário próprio (Boletos.jsx): o pai com as parcelas geradas.
  cartoes: { titulo: "Novo cartão", editar: "Editar cartão", campos: [
    { id: "nome", rot: "Nome do cartão", span: 2, req: true }, { id: "final", rot: "Final", ph: "0000", req: true },
    { id: "bandeira", rot: "Bandeira", opcoes: ["Visa", "Mastercard", "Elo", "Outra"] },
    { id: "limite", rot: "Limite", tipo: "dinheiro" }, { id: "fatura", rot: "Fatura atual", tipo: "dinheiro" },
    { id: "venc", rot: "Dia do vencimento", tipo: "number" }] }
};

/* What each tab says when it has nothing yet, and the one action that fills it. */
const FIN_VAZIO = {
  transacoes: { icone: "arrow-left-right", titulo: "Nenhuma transação neste mês", texto: "Pagamentos dos pedidos entram aqui sozinhos. Lance à mão as outras entradas e saídas do caixa." },
  boletos: { icone: "receipt", titulo: "Nenhum boleto registrado", texto: "Cada boleto guarda o fornecedor, a nota e as parcelas, com código e foto de cada uma." },
  cartoes: { icone: "credit-card", titulo: "Nenhum cartão cadastrado", texto: "Cadastre os cartões da loja para acompanhar fatura, limite e vencimento." }
};

const MESES_FIN = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const dataCurta = iso => iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) : "—";
const finNum = v => Number(String(v || "").replace(",", ".")) || 0;
const paraCentavos = v => Math.round(finNum(v) * 100);
const reaisTexto = c => c ? (c / 100).toFixed(2) : "";
const reaisC = c => window.brl((c || 0) / 100);
const mesMais = (m, n) => { const d = new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)) - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };

const finErros = (f, v) => {
  const e = {};
  f.campos.filter(c => c.req).forEach(c => {
    if (c.tipo === "dinheiro" ? !(finNum(v[c.id]) > 0) : !String(v[c.id] || "").trim())
      e[c.id] = c.tipo === "dinheiro" ? "Digite um valor maior que zero" : c.tipo === "date" ? "Escolha a data" : "Preencha este campo";
  });
  if (v.final && !/^\d{4}$/.test(v.final)) e.final = "Os 4 últimos números do cartão";
  if (v.venc && f === FIN_FORM.cartoes && !(Number(v.venc) >= 1 && Number(v.venc) <= 31)) e.venc = "Um dia entre 1 e 31";
  return e;
};

/* A stored entry as form values, and form values as what the Worker stores (centavos, ISO dates). */
const formDe = x => x.tipo === "transacao" ? { desc: x.desc, tipo: x.entrada ? "Entrada" : "Saída", meio: x.meio, data: x.data, valor: reaisTexto(x.valor) }
  : { nome: x.nome, final: x.final, bandeira: x.bandeira, limite: reaisTexto(x.limite), fatura: reaisTexto(x.fatura), venc: x.venc ? String(x.venc) : "" };
const finParaApi = (tab, v) => tab === "transacoes" ? { desc: v.desc.trim(), entrada: v.tipo === "Entrada", meio: v.meio, data: v.data, valor: paraCentavos(v.valor) }
  : { nome: v.nome.trim(), final: v.final, bandeira: v.bandeira, limite: paraCentavos(v.limite), fatura: paraCentavos(v.fatura), venc: v.venc ? Number(v.venc) : null };

function FinRegistro({ tab, item, hoje, onClose, onSave, salvando }) {
  const f = FIN_FORM[tab];
  const [v, setV] = React.useState(() => item ? formDe(item)
    : { ...Object.fromEntries(f.campos.filter(c => c.opcoes).map(c => [c.id, c.opcoes[0]])), ...(tab === "transacoes" ? { data: hoje } : {}) });
  const [tentou, setTentou] = React.useState(false);
  const erros = tentou ? finErros(f, v) : {};
  const registrar = () => { setTentou(true); if (!Object.keys(finErros(f, v)).length) onSave(v); };
  return (
    <FN.Modal width={480} title={item ? f.editar : f.titulo} onClose={salvando ? null : onClose} dismissible={false}
      footer={<><FN.Button variant="ghost" block disabled={salvando} onClick={onClose}>Cancelar</FN.Button><FN.Button block icon="check" loading={salvando} onClick={registrar}>{item ? "Salvar" : "Registrar"}</FN.Button></>}>
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

/* The cash view of a month: manual entries, every payment received on an order, and every boleto
   parcela paid in that month. Only the manual ones can be edited or removed here. */
function transacoesDoMes(docs, pags, pedidos, mes) {
  const nome = new Map((pedidos || []).map(p => [p.id, p.cliente]));
  return [
    ...docs.filter(x => x.tipo === "transacao" && (x.data || "").startsWith(mes)).map(x => ({ ...x, fonte: "manual" })),
    ...pags.filter(p => (p.data || "").startsWith(mes)).map(p => ({ id: p.id, fonte: "pedido", pedidoId: p.pedidoId, entrada: true, meio: p.meio,
      data: p.data, valor: p.valor, desc: [nome.get(p.pedidoId), p.pedidoId].filter(Boolean).join(" · ") })),
    ...window.parcelasPagasNoMes(docs, mes)
  ].sort((a, b) => (b.data || "").localeCompare(a.data || ""));
}

/* Demo only: what the Worker does to a boleto on save and on paying a parcela (financeiro.js). */
const boletoLocal = (antigo, dados) => ({ ...antigo, ...dados,
  parcelas: dados.parcelas.map((p, i) => { const a = antigo && window.parcelasDoBoleto(antigo)[i]; return { ...p, n: i + 1, pago: !!(a && a.pago), pagoEm: a && a.pago ? a.pagoEm : null }; }) });
const pagarLocal = (b, n, pago, dia) => ({ ...b, parcelas: window.parcelasDoBoleto(b).map(p => p.n === n ? { ...p, pago, pagoEm: pago ? dia : null } : p) });

/* `alvo` = { boleto, n }: alguém clicou numa parcela fora daqui (Agenda, Visão geral); abre o pai com
   ela marcada. { aba: "boletos" } só abre a aba. */
function Financeiro({ compact, onQ, onView, alvo }) {
  const REAL = window.DLUH_API.modo === "firebase";
  const hoje = window.DLUH_API.hoje();
  const [tab, setTab] = React.useState(alvo && (alvo.boleto || alvo.aba === "boletos") ? "boletos" : "transacoes");
  const [mes, setMes] = React.useState(hoje.slice(0, 7));
  const [form, setForm] = React.useState(null); // { item, deDetalhe } — item null = novo
  const [aberto, setAberto] = React.useState(() => alvo && alvo.boleto ? { id: alvo.boleto, n: alvo.n } : null); // boleto aberto
  const [apagar, setApagar] = React.useState(null);
  const [toastNode, showToast] = useToast();
  const [acao, pendente] = useAcao(showToast);
  const fin = useAoVivo("financeiro");
  const pag = useAoVivo("todosPagamentos");
  const ped = useAoVivo("pedidosTodos");
  React.useEffect(() => {
    if (alvo && (alvo.boleto || alvo.aba === "boletos")) setTab("boletos");
    if (alvo && alvo.boleto) setAberto({ id: alvo.boleto, n: alvo.n });
  }, [alvo]);
  /* The demo has no server to echo a write back, so it edits its own copy; the real system
     waits for Firestore to send the change. */
  const local = fn => REAL ? null : () => fin.setDados(fn);

  const carga = fin.estado === "erro" && !fin.dados ? fin : pag.estado === "erro" && !pag.dados ? pag : null;
  if (carga) return <ErroCarga erro={carga.erro} oque="o financeiro" onTentar={carga.tentar} />;
  if (!fin.dados || !pag.dados) return <Carregando oque="o financeiro" />;

  const docs = fin.dados;
  const listas = {
    transacoes: transacoesDoMes(docs, pag.dados, ped.dados, mes),
    boletos: docs.filter(x => x.tipo === "boleto"),
    cartoes: docs.filter(x => x.tipo === "cartao").sort((a, b) => (a.nome || "").localeCompare(b.nome || ""))
  };
  const t = FIN_TABS.find(x => x.id === tab);
  const lista = listas[tab] || [];
  const nomeDe = x => x.desc || (x.nome ? x.nome + " · final " + x.final : "este registro");
  const boletoAberto = aberto && listas.boletos.find(x => x.id === aberto.id);
  const fornecedores = [...new Set(listas.boletos.map(x => x.desc).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  const salvar = async v => {
    const item = form.item, dados = finParaApi(tab, v);
    const ok = await acao("salvar", { ok: item ? "Alterações salvas" : "Registro salvo", falhou: "Não deu pra salvar o registro" },
      local(l => item ? l.map(x => x.id === item.id ? { ...x, ...dados } : x) : [{ id: "d" + Date.now(), tipo: TIPO_DA_ABA[tab], ...dados }, ...l]),
      { acao: "salvarFinanceiro", dados: item ? { id: item.id, ...dados } : { tipo: TIPO_DA_ABA[tab], ...dados } });
    if (ok) setForm(null);
  };
  const salvarBoleto = async dados => {
    const item = form.item, idLocal = "d" + Date.now();
    const r = await acao("salvar", { ok: item ? "Boleto salvo" : "Boleto registrado", falhou: "Não deu pra salvar o boleto" },
      local(l => item ? l.map(x => x.id === item.id ? boletoLocal(x, dados) : x) : [{ id: idLocal, tipo: "boleto", ...boletoLocal(null, dados) }, ...l]),
      { acao: "salvarFinanceiro", dados: item ? { id: item.id, ...dados } : { tipo: "boleto", ...dados } });
    if (!r) return;
    setForm(null);
    setAberto({ id: item ? item.id : REAL ? r.id : idLocal });
  };
  const fecharForm = () => { if (form.deDetalhe) setAberto({ id: form.item.id }); setForm(null); };
  const remover = async x => {
    const ok = await acao("remover", { ok: "Registro removido", falhou: "Não deu pra remover o registro" },
      local(l => l.filter(y => y.id !== x.id)), { acao: "apagarFinanceiro", dados: { id: x.id } });
    setApagar(null);
    if (ok && aberto && aberto.id === x.id) setAberto(null);
  };
  const pagarParcela = (b, n, pago) => acao(`pagar-${b.id}-${n}`,
    { ok: pago ? "Parcela marcada como paga" : "Pagamento desfeito", falhou: pago ? "Não deu pra marcar a parcela como paga" : "Não deu pra desfazer o pagamento" },
    local(l => l.map(y => y.id === b.id ? pagarLocal(y, n, pago, hoje) : y)), { acao: "pagarBoleto", dados: { id: b.id, n, pago, data: hoje } });
  /* Foto ou PDF de um boleto: no sistema vai pro Drive e volta o link; na demo fica no aparelho. */
  const enviar = Object.assign(arq => REAL
    ? acao("arquivo", { falhou: "Não deu pra enviar o arquivo" }, null, { acao: "enviarArquivoBoleto", dados: { dataUrl: arq.dataUrl } })
    : Promise.resolve({ url: arq.dataUrl, pdf: arq.pdf }), { avisar: msg => showToast(msg, "danger") });
  const copiar = codigo => navigator.clipboard.writeText(codigo).then(() => showToast("Código copiado"), () => showToast("Não deu pra copiar o código", "danger"));
  const abrirPedido = id => { onQ && onQ(id); onView && onView("pedidos"); };

  const lixo = x => <FN.IconButton icon="trash-2" label="Remover" size={36} style={{ marginLeft: 10 }} onClick={e => { e.stopPropagation(); setApagar(x); }} />;
  const editar = x => () => setForm({ item: x });
  const vz = FIN_VAZIO[tab];
  const vazio = vz ? <FN.EmptyState icon={vz.icone} title={vz.titulo} description={vz.texto}
    action={<FN.Button icon="plus" onClick={() => setForm({ item: null })}>{t.acao}</FN.Button>} /> : null;

  const entradas = listas.transacoes.filter(x => x.entrada).reduce((s, x) => s + (x.valor || 0), 0);
  const saidas = listas.transacoes.filter(x => !x.entrada).reduce((s, x) => s + (x.valor || 0), 0);
  const abertas = listas.boletos.flatMap(b => window.parcelasDoBoleto(b).filter(p => !p.pago));
  const nomeMes = `${MESES_FIN[Number(mes.slice(5, 7)) - 1]} ${mes.slice(0, 4)}`;

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "var(--space-8)", minHeight: "100%" }}>
      <FN.Tabs value={tab} onChange={setTab} items={FIN_TABS.map(x => ({ id: x.id, label: x.label,
        count: x.id === "contratos" ? undefined : x.id === "boletos" ? listas.boletos.length : (listas[x.id] || []).length }))} />

      {tab === "contratos" ? <window.Contratos compact={compact} /> : <>
        <div style={{ display: "flex", gap: "var(--gap-inline)", alignItems: "center", flexWrap: "wrap" }}>
          {tab === "transacoes" ? <>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <FN.IconButton icon="chevron-left" label="Mês anterior" size={36} onClick={() => setMes(m => mesMais(m, -1))} />
              <span style={{ minWidth: 128, textAlign: "center", fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)" }}>{nomeMes}</span>
              <FN.IconButton icon="chevron-right" label="Próximo mês" size={36} disabled={mes >= hoje.slice(0, 7)} onClick={() => setMes(m => mesMais(m, 1))} />
            </div>
            <FN.Badge tone="success" icon="arrow-down-left">Entradas {reaisC(entradas)}</FN.Badge>
            <FN.Badge icon="arrow-up-right">Saídas {reaisC(saidas)}</FN.Badge>
            <FN.Badge tone={entradas - saidas < 0 ? "warn" : "accent"} icon="scale">Saldo {entradas - saidas < 0 ? "− " : ""}{reaisC(Math.abs(entradas - saidas))}</FN.Badge>
          </> : tab === "boletos" && abertas.length ? <FN.Badge tone="warn" icon="clock">Em aberto {reaisC(abertas.reduce((s, p) => s + (p.valor || 0), 0))}</FN.Badge> : null}
          <div style={{ flex: 1 }} />
          {lista.length || tab === "transacoes" ? <FN.Button size="sm" icon="plus" onClick={() => setForm({ item: null })}>{t.acao}</FN.Button> : null}
        </div>
        <FN.Card padded={!!lista.length} bodyStyle={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {!lista.length ? vazio : tab === "transacoes" ? lista.map(x => (
            <FN.ListRow key={x.fonte + x.id} icon={x.fonte === "pedido" ? "receipt-text" : x.fonte === "boleto" ? "receipt" : x.entrada ? "arrow-down-left" : "arrow-up-right"}
              title={x.desc || "Sem descrição"}
              subtitle={[dataCurta(x.data), x.meio, x.fonte === "pedido" ? "pagamento de pedido" : x.fonte === "boleto" ? "parcela paga" : null].filter(Boolean).join(" · ")}
              value={x.valor == null ? "—" : (x.entrada ? "+ " : "− ") + reaisC(x.valor)} tone={x.entrada ? "in" : "out"}
              onClick={x.fonte === "manual" ? editar(x) : x.fonte === "pedido" ? () => abrirPedido(x.pedidoId) : () => { setTab("boletos"); setAberto({ id: x.boletoId, n: x.n }); }}
              trailing={x.fonte === "manual" ? lixo(x) : null} />
          )) : tab === "boletos" ? <window.ListaBoletos boletos={lista} hoje={hoje} compact={compact} onAbrir={id => setAberto({ id })} />
          : lista.map(x => (
            <FN.ListRow key={x.id} icon="credit-card" title={(x.nome || "Cartão") + " · final " + (x.final || "—")} onClick={editar(x)}
              subtitle={[x.bandeira, x.venc ? "vence dia " + x.venc : null, x.limite ? "limite " + reaisC(x.limite) : null].filter(Boolean).join(" · ")}
              value={x.fatura == null ? "—" : reaisC(x.fatura)} trailing={lixo(x)} />
          ))}
        </FN.Card>
      </>}

      {boletoAberto && !form && !apagar ? <window.BoletoDetalhe key={boletoAberto.id + ":" + (aberto.n || "")} boleto={boletoAberto} destaque={aberto.n} hoje={hoje}
        pendente={pendente} onClose={() => setAberto(null)} onCopiar={copiar}
        onPagar={(n, pago) => pagarParcela(boletoAberto, n, pago)}
        onEditar={() => { setForm({ item: boletoAberto, deDetalhe: true }); setAberto(null); }}
        onApagar={() => setApagar(boletoAberto)} /> : null}
      {form && tab === "boletos" ? <window.BoletoForm item={form.item} fornecedores={fornecedores} hoje={hoje} enviar={enviar}
        onClose={fecharForm} onSave={salvarBoleto} salvando={pendente === "salvar"} />
        : form ? <FinRegistro tab={tab} item={form.item} hoje={hoje} onClose={() => setForm(null)} onSave={salvar} salvando={pendente === "salvar"} /> : null}
      {apagar ? <FN.ConfirmDialog tone="danger" icon="trash-2" title={apagar.tipo === "boleto" ? "Apagar boleto?" : "Remover registro?"}
        message={apagar.tipo === "boleto" ? `O boleto de ${nomeDe(apagar)} sai do financeiro com todas as parcelas. Não dá pra desfazer.` : nomeDe(apagar) + " sai do financeiro. Não dá pra desfazer."}
        pending={pendente === "remover"}
        confirmLabel="Sim, remover" cancelLabel="Voltar" onCancel={() => setApagar(null)} onConfirm={() => remover(apagar)} /> : null}
      {toastNode}
    </div>
  );
}

Object.assign(window, { Financeiro });
