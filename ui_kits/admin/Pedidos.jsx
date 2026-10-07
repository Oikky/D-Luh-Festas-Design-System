const DS = window.DLuhFestasDesignSystem_c861a2;
const { Tabs, FilterPill, OrderCard, Button, IconButton, DropdownMenu, Badge, EmptyState,
        Modal, ConfirmDialog, Toast, Field, Input, Select, Card, StatusBadge, DataTable, ListRow, Icon } = DS;

/* One tab per Coda Status. "Verificando Estoque" is the Telegram round-trip in progress, so it
   lives with "Aguardando confirmação" under Estoque pendente instead of vanishing. */
const TABS = [
  { id: "estoque", label: "Estoque pendente", filtro: ["Aguardando confirmação", "Verificando Estoque"] },
  { id: "pagamento", label: "Esperando pagamento", filtro: ["Confirmado — Esperando pagamento"] },
  { id: "producao", label: "Em produção", filtro: ["Em produção"] },
  { id: "restante", label: "Esperando restante", filtro: ["Entregue — Esperando restante"] },
  { id: "final", label: "Finalizados", filtro: ["Finalizado"] },
  { id: "cancelado", label: "Cancelados", filtro: ["Cancelado"] }
];

/* Pedido só vai para a impressora a partir de "Em produção": antes disso ainda pode mudar ou não sair. */
const ANTES_DA_PRODUCAO = ["Aguardando confirmação", "Verificando Estoque", "Confirmado — Esperando pagamento"];
const podeImprimir = p => !ANTES_DA_PRODUCAO.includes(p.status);

const valor = s => Number(String(s || "").replace(/[^\d,]/g, "").replace(",", ".")) || 0;
const REAL = () => window.DLUH_API.modo === "firebase";
const reais = c => window.brl((c || 0) / 100);
/* What "Cobrar entrada" will ask for: the order's entry share (50% or 100%) minus what came in. */
const entradaDe = p => p._c ? reais(Math.max(0, Math.round(p._c.total * p._c.entradaPct / 100) - p._c.pago)) : p.falta;
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
const para = p => p.cliente || "o cliente";
const semAcento = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
/* Nome, número do pedido ou telefone; sem diferença de maiúscula e acento, e o telefone casa só pelos dígitos. */
const casa = (p, q) => {
  const t = semAcento(q), digitos = String(q || "").replace(/\D/g, "");
  return !t || [p.cliente, p.id].some(v => semAcento(v).includes(t)) || (digitos.length >= 4 && String(p.tel || "").replace(/\D/g, "").includes(digitos));
};
/* Com texto na busca aparece a aba "Resultados", com o que casou em todos os status. */
const BUSCA = { id: "busca", label: "Resultados", filtro: null };

/* Every confirmation the order card can open. Money actions name the amount in the question. */
const quem = p => p.cliente || "O cliente";
const CONFIRMA = {
  /* Confirming stock moves the order on and prepares the entry link in one go; the link opens
     in a dialog so the atendente sends it on WhatsApp. */
  estoque: p => ({ tone: "accent", icon: "circle-check", title: "Confirmar estoque?",
    message: "O pedido vai para Esperando pagamento e o cliente recebe no WhatsApp a confirmação com o link da entrada.",
    confirmLabel: "Sim, confirmar", ok: "Estoque confirmado", falhou: "Não deu pra confirmar o estoque",
    aplicar: l => l.map(x => x.id === p.id ? { ...x, status: "Confirmado — Esperando pagamento" } : x),
    pedido: async chamar => {
      await chamar("mudarStatus", { pedidoId: p.id, status: "Confirmado — Esperando pagamento" });
      return { ...(await chamar("gerarCobranca", { pedidoId: p.id, tipo: "entrada" })), rotulo: "Entrada" };
    } }),
  entrada: p => ({ tone: "chargeEntry", icon: "link", title: entradaDe(p) ? `Cobrar entrada de ${entradaDe(p)}?` : "Cobrar entrada?",
    message: `Gera o link de pagamento da entrada para enviar a ${para(p)}.` + (entradaDe(p) ? "" : " O valor da entrada não está preenchido neste pedido."),
    confirmLabel: "Sim, gerar link", ok: "Link de cobrança gerado", falhou: "Não deu pra gerar a cobrança",
    pedido: async chamar => ({ ...(await chamar("gerarCobranca", { pedidoId: p.id, tipo: "entrada" })), rotulo: "Entrada" }) }),
  restante: p => ({ tone: "chargeAll", icon: "banknote", title: p.falta ? `Cobrar restante de ${p.falta}?` : "Cobrar restante?",
    message: `Gera o link de pagamento do restante para enviar a ${para(p)}.` + (p.falta ? "" : " O valor do restante não está preenchido neste pedido."),
    confirmLabel: "Sim, gerar link", ok: "Link do restante gerado", falhou: "Não deu pra gerar a cobrança do restante",
    pedido: async chamar => ({ ...(await chamar("gerarCobranca", { pedidoId: p.id, tipo: "restante" })), rotulo: "Restante" }) }),
  pago: p => ({ tone: "success", icon: "badge-check", title: p.falta ? `Marcar como pago (${p.falta})?` : "Marcar como pago?",
    message: `Registra que ${para(p)} pagou o que faltava, fora do link. Nenhuma cobrança é enviada.`,
    confirmLabel: "Sim, marcar pago", ok: "Pagamento registrado", falhou: "Não deu pra registrar o pagamento",
    pedido: p._c ? { acao: "registrarPagamentoManual", dados: { pedidoId: p.id, valor: p._c.falta, meio: p._c.formaPagamento || "outro", chave: uuid() } } : undefined }),
  /* Libera a cozinha sem esperar a entrada: o que falta pagar continua em aberto no pedido. */
  producao: p => ({ tone: "accent", icon: "chef-hat", title: "Mandar para produção?",
    message: `O pedido vai para Em produção e entra na fila da cozinha, mesmo sem a entrada paga.` + (p.falta ? ` Continua faltando ${p.falta} de ${para(p)}.` : ""),
    confirmLabel: "Sim, mandar", ok: "Pedido em produção", falhou: "Não deu pra mandar para produção",
    aplicar: l => l.map(x => x.id === p.id ? { ...x, status: "Em produção" } : x),
    pedido: { acao: "mudarStatus", dados: { pedidoId: p.id, status: "Em produção", motivo: "liberado sem pagamento" } } }),
  cancelar: p => ({ tone: "danger", icon: "circle-x", title: "Cancelar pedido?",
    message: "O pedido vai para Cancelados e sai da fila da cozinha. O histórico continua guardado.", confirmLabel: "Sim, cancelar",
    ok: "Pedido cancelado", falhou: "Não deu pra cancelar o pedido",
    pedido: { acao: "mudarStatus", dados: { pedidoId: p.id, status: "Cancelado" } } })
};

/* A charge is a link the atendente sends; this is where it lands after it's generated. */
function LinkCobranca({ link, onClose, onToast }) {
  const fone = String(link.tel || "").replace(/\D/g, "");
  const msg = `Olá, ${link.cliente || ""}! 🩷\n\nSeu pedido ${link.pedidoId} na D'Luh Festas — ${link.rotulo.toLowerCase()} de ${reais(link.valor)}.\nPague pelo link: ${link.url}`;
  const copiar = () => navigator.clipboard.writeText(link.url).then(() => onToast("Link copiado"), () => onToast("Não deu pra copiar: selecione o link e copie", "danger"));
  return <Modal width={520} title="Link de pagamento pronto" onClose={onClose}
    subtitle={`${link.rotulo} de ${reais(link.valor)} · ${link.pedidoId} · ${link.cliente || "cliente"}`}
    footer={<>
      <Button variant="ghost" block icon="copy" onClick={copiar}>Copiar link</Button>
      <Button block icon="message-circle" disabled={fone.length < 10}
        onClick={() => window.open(`https://wa.me/${fone.length <= 11 ? "55" + fone : fone}?text=${encodeURIComponent(msg)}`, "_blank", "noopener")}>Enviar no WhatsApp</Button>
    </>}>
    <Field label="Link"><Input readOnly value={link.url} onFocus={e => e.target.select()} /></Field>
    <div style={{ marginTop: 10, fontSize: "var(--fs-body-s)", color: "var(--text-muted)", lineHeight: "var(--lh-normal)" }}>
      Quando o cliente pagar, o pagamento entra sozinho no pedido.
    </div>
  </Modal>;
}

const copiarPedido = (p, onToast) => navigator.clipboard.writeText([
  `${p.id} — ${p.cliente}`, p.tel, p.entrega, p.endereco || null,
  ...(p.itens || []).map(i => `${i.qty}× ${i.name}${i.note ? ` (${i.note})` : ""}`),
  `Total ${p.total}${p.falta ? ` · falta ${p.falta}` : ""}`
].filter(Boolean).join("\n")).then(() => onToast("Dados copiados"), () => onToast("Não deu pra copiar os dados", "danger"));

/* Nota fiscal. The ERP4ME (Alterdata) has no open API yet: the atendente copies the order's data,
   issues the note there, and records its number here. When the API arrives, "Registrar" becomes
   "Emitir" and the Worker does the ERP4ME part. */
const ERP4ME = "https://erpforme.alterdata.com.br/";
const docFmt = d => d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  : d.length === 14 ? d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5") : d;
const textoNota = (p, tipo, doc) => [
  `Nota: ${tipo}`,
  `Cliente: ${p.cliente}`,
  doc ? `${doc.length === 14 ? "CNPJ" : "CPF"}: ${docFmt(doc)}` : null,
  p.tel ? `Telefone: ${p.tel}` : null,
  p.email ? `E-mail: ${p.email}` : null,
  p.endereco ? `Endereço: ${p.endereco}` : null,
  "",
  ...(p._c ? p._c.itens.map(i => `${i.qtd}× ${i.nome} — ${reais(i.valorUnit)} cada = ${reais(i.qtd * i.valorUnit)}`)
    : (p.itens || []).map(i => `${i.qty}× ${i.name} — ${i.price}`)),
  p._c && p._c.taxaEntrega ? `Taxa de entrega: ${reais(p._c.taxaEntrega)}` : null,
  `Total: ${p.total}`,
  "",
  `Informações complementares: pedido ${p.id} — D'Luh Festas`
].filter(x => x !== null).join("\n");

function NotaModal({ p, onClose, onToast, acao, pendente, aoSalvar }) {
  const [tipo, setTipo] = React.useState(p.nota ? p.nota.tipo : p.tipo === "Empresa" ? "NFS-e" : "NFC-e");
  const [doc, setDoc] = React.useState(p.nota && p.nota.documento ? docFmt(p.nota.documento) : "");
  const [numero, setNumero] = React.useState(p.nota ? p.nota.numero : "");
  const [tentou, setTentou] = React.useState(false);
  const digitos = doc.replace(/\D/g, "");
  const erroDoc = digitos && digitos.length !== 11 && digitos.length !== 14 ? "CPF tem 11 dígitos e CNPJ, 14" : undefined;
  const texto = textoNota(p, tipo, digitos);
  const copiar = () => navigator.clipboard.writeText(texto).then(() => onToast("Dados da nota copiados"), () => onToast("Não deu pra copiar: selecione o texto e copie", "danger"));
  const salvar = async () => {
    setTentou(true);
    const n = numero.trim();
    if (!n || erroDoc) return;
    const nota = { tipo, numero: n, documento: digitos };
    const ok = await acao("nota", { ok: `${tipo} ${n} registrada no pedido`, falhou: "Não deu pra registrar a nota" },
      REAL() ? null : () => aoSalvar(nota), { acao: "registrarNota", dados: { pedidoId: p.id, ...nota } });
    if (ok) onClose();
  };
  return <Modal width={600} title={p.nota ? "Nota fiscal" : "Emitir nota fiscal"} onClose={pendente === "nota" ? null : onClose}
    subtitle={`${p.id} · ${p.cliente || "cliente"} · ${p.total}`}
    footer={<>
      <Button variant="ghost" block icon="external-link" onClick={() => window.open(ERP4ME, "_blank", "noopener")}>Abrir ERP4ME</Button>
      <Button block icon="save" loading={pendente === "nota"} onClick={salvar}>{p.nota ? "Salvar correção" : "Registrar nota"}</Button>
    </>}>
    <form onSubmit={e => { e.preventDefault(); salvar(); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <Field label="Tipo" hint={tipo === "NFS-e" ? "Serviço: festa, decoração, locação" : "Venda ao consumidor"}>
          <Select options={["NFS-e", "NFC-e"]} value={tipo} onChange={e => setTipo(e.target.value)} />
        </Field>
        <Field label="CPF ou CNPJ" error={erroDoc} hint={p.tipo === "Empresa" ? "Empresa: coloque o CNPJ" : "Opcional para pessoa"}>
          <Input inputMode="numeric" autoComplete="off" value={doc} invalid={!!erroDoc}
            onChange={e => setDoc(e.target.value)} onBlur={() => setDoc(docFmt(digitos))} />
        </Field>
      </div>
      <Field label="Dados para a nota" hint="Copie, emita no ERP4ME e confira os valores antes de transmitir.">
        <div style={{ position: "relative" }}>
          <pre style={{ margin: 0, padding: "12px 14px", paddingRight: 48, borderRadius: "var(--radius-sm)", border: "var(--border-hairline) solid var(--color-border)",
            background: "var(--color-surface-sunken, var(--color-bg))", fontFamily: "var(--font-ui)", fontSize: "var(--fs-body-s)",
            lineHeight: "var(--lh-normal)", whiteSpace: "pre-wrap", overflowWrap: "anywhere", maxHeight: 240, overflowY: "auto" }}>{texto}</pre>
          <div style={{ position: "absolute", top: 6, right: 6 }}><IconButton icon="copy" label="Copiar dados da nota" onClick={copiar} /></div>
        </div>
      </Field>
      <Field label="Número da nota" required error={tentou && !numero.trim() ? "Digite o número que o ERP4ME deu à nota" : undefined}
        hint="Depois de emitir, anote o número aqui para o pedido ficar com a nota.">
        <Input autoComplete="off" value={numero} invalid={tentou && !numero.trim()} onChange={e => setNumero(e.target.value)} />
      </Field>
    </form>
  </Modal>;
}

/* Details is the edit form: the same fields as Pedido manual, filled from the order. Status,
   payments and the kitchen don't change here; the total and payment state follow the items. */
function DetalhesModal({ pedido, onClose, onToast, acao, pendente, compact, produtos, onNota }) {
  /* Demo: what the order already received comes from the order itself. Real system: every
     payment is its own record, live. */
  const [pgtosDemo, setPgtos] = React.useState(() => pedido && valor(pedido.pago) > 0
    ? [{ quando: null, valor: valor(pedido.pago), origem: "site", meio: pedido.pgto }] : []);
  const aoVivo = useAoVivo(REAL() ? "pagamentos" : "nada", REAL() && pedido ? pedido.id : undefined);
  const pgtos = REAL() ? aoVivo.dados || [] : pgtosDemo;
  const [verPgtos, setVerPgtos] = React.useState(false);
  const inicial = React.useMemo(() => window.rascunhoDe(pedido), [pedido.id]);
  const [r, setR] = React.useState(inicial);
  const [tentou, setTentou] = React.useState(false);
  const [sair, setSair] = React.useState(false);
  const set = (k, v) => setR(x => ({ ...x, [k]: v }));
  const mudou = JSON.stringify(r) !== JSON.stringify(inicial);
  const erros = tentou ? window.faltas(r) : {};
  const cancelado = pedido.status === "Cancelado";
  const recebido = REAL() ? valor(pedido.pago) : pgtos.reduce((s, p) => s + p.valor, 0);
  const fechar = () => pendente === "salvar" ? null : mudou ? setSair(true) : onClose();
  const salvar = async () => {
    if (Object.keys(window.faltas(r)).length) { setTentou(true); return; }
    if (!mudou) { onClose(); return; }
    const ok = await acao("salvar", { ok: "Pedido atualizado", falhou: "Não deu pra salvar o pedido" }, null,
      { acao: "editarPedido", dados: { pedidoId: pedido.id, ...window.paraApi(r) } });
    if (ok) onClose();
  };
  return (<>
    <Modal width={860} title="Detalhes do pedido" onClose={fechar}
      subtitle={cancelado ? "Pedido cancelado: dá pra ver e imprimir, mas não editar." : "Edite cliente, entrega e itens. O total e o que falta pagar se ajustam sozinhos."}
      footer={<>
        <Button variant="ghost" block onClick={fechar}>{mudou ? "Descartar" : "Fechar"}</Button>
        {podeImprimir(pedido) ? <Button variant="ghost" block icon="printer" onClick={() => window.imprimirPedido(pedido, produtos) || onToast("O navegador bloqueou a janela de impressão", "danger")}>Imprimir</Button> : null}
        {cancelado ? null : <Button block icon="save" loading={pendente === "salvar"} onClick={salvar}>{mudou ? "Salvar alterações" : "Salvar"}</Button>}
      </>}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-accent)", letterSpacing: "var(--ls-caps)" }}>{pedido.id}</span>
        <StatusBadge status={pedido.status} />
        {pedido.pagamento ? <Badge tone={pedido.pagamento === "Totalmente pago" ? "success" : pedido.pagamento === "Só entrada" ? "warn" : "neutral"}>{pedido.pagamento}</Badge> : null}
        {pedido.tipo ? <Badge tone="accent" icon="building-2">{pedido.tipo}</Badge> : null}
      </div>
      <fieldset disabled={cancelado} style={{ border: "none", margin: 0, padding: 0, minWidth: 0 }}>
        <window.CamposPedido r={r} set={set} erros={erros} />
        <window.ListaProdutos id="dluh-produtos-detalhe" produtos={produtos} />
        <window.ItensPedido r={r} set={set} compact={compact} produtos={produtos} erro={erros.itens} acao={acao} onToast={onToast} listaId="dluh-produtos-detalhe" />
      </fieldset>
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "var(--border-hairline) solid var(--color-border)" }}>
        <Field label="Valor recebido"><div style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-bold)" }}>{window.brl(recebido)}</div></Field>
        {window.totalRascunho(r) - recebido > 0.004 ? <Field label="Falta"><div style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-bold)", color: "var(--text-accent)" }}>{window.brl(window.totalRascunho(r) - recebido)}</div></Field> : null}
        <div style={{ flex: 1 }} />
        <Button size="sm" variant="outline" icon="list" onClick={() => setVerPgtos(true)}>Pagamentos ({pgtos.length})</Button>
      </div>
      {onNota && !cancelado ? <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "var(--border-hairline) solid var(--color-border)" }}>
        <Field label="Nota fiscal"><div style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-bold)" }}>{pedido.nota ? `${pedido.nota.tipo} ${pedido.nota.numero}` : "Não emitida"}</div></Field>
        <div style={{ flex: 1 }} />
        <Button size="sm" variant="outline" icon="receipt-text" onClick={onNota}>{pedido.nota ? "Ver nota" : "Emitir nota"}</Button>
      </div> : null}
    </Modal>
    {verPgtos ? <PagamentosModal lista={pgtos} onChange={REAL() ? () => {} : setPgtos} pedido={pedido} onClose={() => setVerPgtos(false)} onToast={onToast} acao={acao} pendente={pendente} /> : null}
    {sair ? <ConfirmDialog tone="danger" icon="trash-2" title="Descartar alterações?" message="O que foi mudado neste pedido se perde. O pedido fica como estava."
      confirmLabel="Sim, descartar" cancelLabel="Voltar" onCancel={() => setSair(false)} onConfirm={() => { setSair(false); onClose(); }} /> : null}
  </>);
}

/* Apagar de vez: pede a senha da conta sistema do Firebase (a mesma de SISTEMA_SENHA no Worker).
   A senha vai só nessa chamada; nada fica guardado no aparelho. */
function ApagarComSenha({ p, pendente, onCancel, onConfirm }) {
  const [senha, setSenha] = React.useState("");
  const [tentou, setTentou] = React.useState(false);
  const ir = () => { setTentou(true); if (senha) onConfirm(senha); };
  return <Modal width={420} title={`Apagar ${p.id}?`} onClose={pendente ? null : onCancel} dismissible={false}
    subtitle={`${p.cliente || "Cliente sem nome"}${p.total ? " · " + p.total : ""}. O pedido, o histórico e os pagamentos dele saem do sistema. Não dá pra desfazer.`}
    footer={<><Button variant="ghost" block disabled={pendente} onClick={onCancel}>Voltar</Button>
      <Button tone="danger" block icon="trash-2" loading={pendente} onClick={ir}>Sim, apagar</Button></>}>
    <form onSubmit={e => { e.preventDefault(); ir(); }}>
      <Field label="Senha do sistema" required error={tentou && !senha ? "Digite a senha" : undefined}
        hint="A senha da conta sistema do Firebase.">
        <Input type="password" autoFocus autoComplete="off" value={senha} invalid={tentou && !senha}
          onChange={e => setSenha(e.target.value)} />
      </Field>
    </form>
  </Modal>;
}

function Pedidos({ compact, q }) {
  const [tab, setTab] = React.useState("estoque");
  const [detalhe, setDetalhe] = React.useState(null);
  const [manual, setManual] = React.useState(false);
  const [confirm, setConfirm] = React.useState(null);
  const [apagando, setApagando] = React.useState(null);
  const [nota, setNota] = React.useState(null);
  const [toastNode, showToast] = useToast();
  const [acao, pendente] = useAcao(showToast);
  /* Busca e as abas de pedidos encerrados leem o histórico inteiro; o resto só o recente (firebase.js). */
  const carga = useAoVivo(q || tab === "final" || tab === "cancelado" || tab === "busca" ? "pedidosTodos" : "pedidos");
  const catalogo = useAoVivo("produtos");
  const produtos = catalogo.dados || [];
  const [link, setLink] = React.useState(null);
  const imprimir = p => window.imprimirPedido(p, produtos) || showToast("O navegador bloqueou a janela de impressão", "danger");

  const todos = carga.dados || [];
  const abas = q ? [BUSCA, ...TABS] : TABS;
  const filtro = (abas.find(t => t.id === tab) || TABS[0]).filtro;
  const lista = todos.filter(p => !filtro || filtro.includes(p.status)).filter(p => casa(p, q));
  /* Orders whose Status is not in the Coda single-select would fall between the tabs. They are
     listed on their own, above the tabs, so a typo in Coda is visible instead of lost. */
  const fora = todos.filter(p => !TABS.some(t => t.filtro.includes(p.status)));
  const achouEmOutra = !!q && todos.some(p => casa(p, q));

  /* Digitar na busca abre "Resultados" (todos os status); limpar volta para a primeira aba. As
     contagens das abas passam a ser do que casou, para ver em que status estão. */
  React.useEffect(() => {
    if (q) setTab("busca");
    else setTab(t => t === "busca" ? "estoque" : t);
  }, [!!q]);

  const counts = {};
  abas.forEach(t => counts[t.id] = todos.filter(p => (!t.filtro || t.filtro.includes(p.status)) && casa(p, q)).length);
  const pede = (tipo, p) => setConfirm({ tipo, p, ...CONFIRMA[tipo](p) });

  if (carga.estado === "erro" && !carga.dados) return <ErroCarga erro={carga.erro} oque="os pedidos" onTentar={carga.tentar} />;
  if (!carga.dados) return <Carregando oque="pedidos" />;

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "var(--space-8)", minHeight: "100%" }}>
      {fora.length ? <Card header={<div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>
            <Icon name="circle-alert" size={18} style={{ color: "var(--action-warn)" }} />
            {fora.length === 1 ? "1 pedido com status fora do padrão" : fora.length + " pedidos com status fora do padrão"}
          </div>
          <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>O status não bate com nenhuma aba. Corrija o status para o pedido voltar ao fluxo.</div>
        </div>} bodyStyle={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {fora.map(p => <ListRow key={p.id} icon="receipt-text" title={p.cliente || "Cliente sem nome"}
          subtitle={p.id + " · status: " + (p.status || "vazio")} value={dinheiro(p.total)} onClick={() => setDetalhe(p)} />)}
      </Card> : null}

      <Tabs value={tab} onChange={setTab} items={abas.map(t => ({ id: t.id, label: t.label, count: counts[t.id] }))} />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
        {/* Lembrete da entrada para todos desta aba (o mesmo sai sozinho 3 dias antes de cada pedido). */}
        {tab === "pagamento" && lista.length ? <Button size="sm" variant="ghost" icon="bell-ring" onClick={() => setConfirm({
          tipo: "lembrete", p: {}, tone: "chargeEntry", icon: "bell-ring",
          title: lista.length === 1 ? "Mandar lembrete para 1 cliente?" : `Mandar lembrete para ${lista.length} clientes?`,
          message: "Cada cliente desta aba recebe no WhatsApp que a produção começa quando a entrada for paga, com o link da entrada. Quem já está sem valor a pagar ou sem telefone fica de fora.",
          confirmLabel: "Sim, mandar", ok: "Lembretes sendo enviados no WhatsApp", falhou: "Não deu pra mandar os lembretes",
          pedido: { acao: "lembrarEntrada", dados: { pedidoIds: lista.map(p => p.id) } }
        })}>Lembrar todos da entrada</Button> : null}
        <Button size="sm" icon="plus" onClick={() => setManual(true)}>Pedido manual</Button>
      </div>

      {lista.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
          {lista.map(p => {
            const menu = <DropdownMenu trigger={<IconButton icon="menu" label="Mais ações" />} items={[
              { label: "Copiar dados do pedido", icon: "copy", onClick: () => copiarPedido(p, showToast) },
              { label: "Marcar como pago", icon: "badge-check", onClick: () => pede("pago", p) },
              { label: "Notificar alterações", icon: "bell-ring", onClick: () => acao("notificar-" + p.id, { ok: "Cliente avisado no WhatsApp", falhou: "Não deu pra avisar o cliente" }, null, { acao: "avisarCliente", dados: { pedidoId: p.id } }) },
              ...(podeImprimir(p) ? [{ label: "Imprimir pedido", icon: "printer", onClick: () => imprimir(p) }]
                : [{ label: "Mandar para produção", icon: "chef-hat", onClick: () => pede("producao", p) }]),
              ...(p.status === "Cancelado" ? [] : [{ label: p.nota ? "Nota fiscal" : "Emitir nota fiscal", icon: "receipt-text", onClick: () => setNota(p) }]),
              { divider: true },
              { label: "Cancelar pedido", icon: "circle-x", tone: "danger", onClick: () => pede("cancelar", p) },
              { label: "Apagar pedido", icon: "trash-2", tone: "danger", onClick: () => setApagando(p) }
            ]} />;
            /* A ação principal cresce no celular para ser fácil de acertar com o polegar. */
            const cresce = compact ? { flex: "1 1 auto" } : undefined;
            return (
            <OrderCard key={p.id} id={p.id} customer={p.cliente} status={p.status}
              meta={[p.entrega, p.tel, p.pgto].filter(Boolean)}
              badges={<>
                {p.tipo ? <Badge tone="accent" icon="building-2">{p.tipo}</Badge> : null}
                {p.falta ? <Badge tone="warn">Falta {p.falta}</Badge> : null}
                {p.feitoNaCozinha && p.status === "Em produção" ? <Badge tone="success" icon="chef-hat">Feito na cozinha</Badge> : null}
                {p.nota ? <Badge tone="neutral" icon="receipt-text">{p.nota.tipo} {p.nota.numero}</Badge> : null}
              </>}
              items={p.itens || []} total={p.total} paid={p.pago} due={p.falta}
              actions={<>
                <Button size="sm" variant="ghost" icon={compact ? undefined : "file-text"} onClick={() => setDetalhe(p)}>Detalhes</Button>
                {/* No celular o ☰ vem antes da ação principal: se a linha não couber, quem desce é a ação principal, e ela ocupa a largura toda. */}
                {compact ? menu : null}
                {p.status === "Aguardando confirmação"
                  ? <Button size="sm" style={cresce} icon="check" onClick={() => pede("estoque", p)}>Confirmar estoque</Button>
                  : p.status === "Confirmado — Esperando pagamento"
                  ? <Button size="sm" style={cresce} tone="chargeEntry" icon="link" onClick={() => pede("entrada", p)}>Cobrar entrada</Button>
                  : p.status === "Em produção"
                  ? <Button size="sm" style={cresce} tone="delivered" icon="truck" loading={pendente === "entregue-" + p.id}
                      onClick={() => acao("entregue-" + p.id, { ok: p.pagamento === "Totalmente pago" ? "Pedido entregue e finalizado" : "Pedido marcado como entregue", falhou: "Não deu pra marcar como entregue" }, null,
                        { acao: "mudarStatus", dados: { pedidoId: p.id, status: p.pagamento === "Totalmente pago" ? "Finalizado" : "Entregue — Esperando restante" } })}>Marcar entregue</Button>
                  : p.status === "Entregue — Esperando restante" && p.pagamento === "Totalmente pago"
                  ? <Button size="sm" style={cresce} tone="delivered" icon="circle-check" loading={pendente === "finalizar-" + p.id}
                      onClick={() => acao("finalizar-" + p.id, { ok: "Pedido finalizado", falhou: "Não deu pra finalizar o pedido" }, null,
                        { acao: "mudarStatus", dados: { pedidoId: p.id, status: "Finalizado" } })}>Finalizar</Button>
                  : p.status === "Entregue — Esperando restante"
                  ? <Button size="sm" style={cresce} tone="chargeAll" icon="banknote" onClick={() => pede("restante", p)}>Cobrar restante</Button>
                  : p.status === "Finalizado"
                  ? <Button size="sm" style={cresce} variant="outline" icon="printer" onClick={() => imprimir(p)}>Recibo</Button>
                  : null}
                {/* No celular a lixeira sai da linha: "Apagar pedido" já está no menu, e com ela o ☰ caía sozinho numa segunda linha. */}
                {compact ? null : <IconButton icon="trash-2" label={`Apagar ${p.id}`} onClick={() => setApagando(p)} />}
                {compact ? null : menu}
              </>} />
          );
          })}
        </div>
      ) : q && (tab === "busca" || !achouEmOutra) ? (
        <Card padded={false}><EmptyState icon="search-x" title={`Nenhum pedido encontrado para “${q}”`}
          description="A busca procura pelo nome do cliente, pelo número do pedido (PED-…) e pelo telefone." /></Card>
      ) : (
        <Card padded={false}><EmptyState icon="party-popper" title="Nenhum pedido nesta aba"
          description="Assim que um pedido entrar nesse status ele aparece aqui automaticamente." /></Card>
      )}

      {detalhe ? <DetalhesModal key={detalhe.id} pedido={todos.find(x => x.id === detalhe.id) || detalhe} onClose={() => setDetalhe(null)} onToast={showToast} acao={acao} pendente={pendente} compact={compact} produtos={produtos}
        onNota={() => setNota(todos.find(x => x.id === detalhe.id) || detalhe)} /> : null}
      {manual ? <ManualModal compact={compact} onClose={() => setManual(false)} onToast={showToast} acao={acao} pendente={pendente} produtos={produtos} clientes={window.clientesDe(todos)} /> : null}
      {confirm ? <ConfirmDialog tone={confirm.tone} icon={confirm.icon} title={confirm.title} message={confirm.message}
        confirmLabel={confirm.confirmLabel} cancelLabel="Voltar" pending={pendente === confirm.tipo}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          const c = confirm;
          const r = await acao(c.tipo, { ok: c.ok, falhou: c.falhou }, c.aplicar ? () => carga.setDados(c.aplicar) : null, c.pedido);
          setConfirm(null);
          if (r && r.url) setLink({ ...r, pedidoId: c.p.id, cliente: c.p.cliente, tel: c.p.tel });
        }} /> : null}
      {apagando ? <ApagarComSenha p={apagando} pendente={pendente === "apagar"} onCancel={() => setApagando(null)}
        onConfirm={async senha => {
          const p = apagando;
          const ok = await acao("apagar", { ok: `${p.id} apagado`, falhou: `Não deu pra apagar ${p.id}` },
            REAL() ? null : () => carga.setDados(l => l.filter(x => x.id !== p.id)), { acao: "apagarPedido", dados: { pedidoId: p.id, senha } });
          if (ok) setApagando(null);
        }} /> : null}
      {nota ? <NotaModal key={"nota-" + nota.id} p={todos.find(x => x.id === nota.id) || nota} onClose={() => setNota(null)} onToast={showToast} acao={acao} pendente={pendente}
        aoSalvar={n => carga.setDados(l => l.map(x => x.id === nota.id ? { ...x, nota: n } : x))} /> : null}
      {link ? <LinkCobranca link={link} onClose={() => setLink(null)} onToast={showToast} /> : null}
      {toastNode}
    </div>
  );
}

Object.assign(window, { Pedidos, DetalhesModal });
