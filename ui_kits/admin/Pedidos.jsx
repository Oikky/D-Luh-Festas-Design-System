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
  /* Fiado: entregue, e a loja combinou de receber depois. Só a equipe vê: a Sofia não acha esses
     pedidos e o site mostra "Entregue, falta pagar o restante". Quitar finaliza sozinho. */
  { id: "fiado", label: "Fiados", filtro: ["Fiado"] },
  { id: "final", label: "Finalizados", filtro: ["Finalizado"] },
  /* Permuta: o pedido (ou parte dele) foi pago com propaganda, divulgação etc. Não é status: o
     pedido segue o fluxo normal e aparece aqui também, em qualquer status menos cancelado. */
  { id: "permuta", label: "Permutas", so: p => !!p.permuta && p.status !== "Cancelado" },
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
const para = p => p.cliente || "o cliente";
const semAcento = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
/* Nome, número do pedido ou telefone; sem diferença de maiúscula e acento, e o telefone casa só pelos dígitos. */
const casa = (p, q) => {
  const t = semAcento(q), digitos = String(q || "").replace(/\D/g, "");
  return !t || [p.cliente, p.id].some(v => semAcento(v).includes(t)) || (digitos.length >= 4 && String(p.tel || "").replace(/\D/g, "").includes(digitos));
};
/* Com texto na busca aparece a aba "Resultados", com o que casou em todos os status. */
const BUSCA = { id: "busca", label: "Resultados", filtro: null };
const naAba = (t, p) => t.so ? t.so(p) : !t.filtro || t.filtro.includes(p.status);

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
  /* Libera a cozinha sem esperar a entrada: o que falta pagar continua em aberto no pedido. */
  producao: p => ({ tone: "accent", icon: "chef-hat", title: "Mandar para produção?",
    message: `O pedido vai para Em produção e entra na fila da cozinha, mesmo sem a entrada paga.` + (p.falta ? ` Continua faltando ${p.falta} de ${para(p)}.` : ""),
    confirmLabel: "Sim, mandar", ok: "Pedido em produção", falhou: "Não deu pra mandar para produção",
    aplicar: l => l.map(x => x.id === p.id ? { ...x, status: "Em produção" } : x),
    pedido: { acao: "mudarStatus", dados: { pedidoId: p.id, status: "Em produção", motivo: "liberado sem pagamento" } } }),
  fiado: p => ({ tone: "accent", icon: "notebook-pen", title: "Marcar como fiado?",
    message: `O pedido vai para Fiados como entregue${p.falta ? `, com ${p.falta} para ${para(p)} pagar depois` : ""}. Quando quitar, ele finaliza sozinho. Clientes e a Sofia não veem a palavra fiado.`,
    confirmLabel: "Sim, é fiado", ok: "Pedido marcado como fiado", falhou: "Não deu pra marcar como fiado",
    aplicar: l => l.map(x => x.id === p.id ? { ...x, status: "Fiado" } : x),
    pedido: { acao: "mudarStatus", dados: { pedidoId: p.id, status: "Fiado" } } }),
  tirarFiado: p => ({ tone: "accent", icon: "undo-2", title: "Tirar do fiado?",
    message: "O pedido volta para Esperando restante. O que já foi pago continua no pedido.",
    confirmLabel: "Sim, tirar", ok: "Pedido voltou para Esperando restante", falhou: "Não deu pra tirar do fiado",
    aplicar: l => l.map(x => x.id === p.id ? { ...x, status: "Entregue — Esperando restante" } : x),
    pedido: { acao: "mudarStatus", dados: { pedidoId: p.id, status: "Entregue — Esperando restante" } } }),
  /* Um link só para tudo que o cliente deve nos fiados; quando ele paga, cada pedido recebe a sua parte. */
  tudo: p => ({ tone: "chargeAll", icon: "banknote", title: `Cobrar tudo de uma vez: ${reais(p.deve)}?`,
    message: `Gera um link só com o que falta nos ${p.ids.length} pedidos de ${para(p)} (${p.ids.join(", ")}). Quando pagar, cada pedido recebe a sua parte e os quitados finalizam sozinhos.`,
    confirmLabel: "Sim, gerar link", ok: "Link de tudo gerado", falhou: "Não deu pra gerar o link",
    pedido: async chamar => ({ ...(await chamar("cobrarJuntos", { pedidoIds: p.ids })), rotulo: "Total em aberto" }) }),
  cancelarRyd: p => ({ tone: "danger", icon: "truck", title: "Cancelar o entregador?",
    message: "A RYD cancela a corrida (só dá antes de o entregador chegar na loja). O pedido continua como está.", confirmLabel: "Sim, cancelar",
    ok: "Entregador cancelado", falhou: "Não deu pra cancelar o entregador",
    pedido: { acao: "cancelarEntrega", dados: { pedidoId: p.id } } }),
  cancelar: p => ({ tone: "danger", icon: "circle-x", title: "Cancelar pedido?",
    message: "O pedido vai para Cancelados e sai da fila da cozinha. O histórico continua guardado.", confirmLabel: "Sim, cancelar",
    ok: "Pedido cancelado", falhou: "Não deu pra cancelar o pedido",
    pedido: { acao: "mudarStatus", dados: { pedidoId: p.id, status: "Cancelado" } } })
};

/* Entregador da RYD: como cada status aparece no cartão. "Cancelar entregador" só vale antes de ele
   chegar na loja (a RYD recusa depois disso). */
const RYD = {
  pending: { rotulo: "Procurando entregador", tone: "warn" }, scheduled: { rotulo: "Entregador agendado", tone: "neutral" },
  accepted: { rotulo: "Entregador a caminho", tone: "accent" }, withdraw: { rotulo: "Entregador na loja", tone: "accent" },
  delivering: { rotulo: "Saiu para entrega", tone: "accent" }, finished: { rotulo: "Entrega concluída", tone: "success" },
  canceled: { rotulo: "Entregador cancelado", tone: "neutral" }
};
const rydAtiva = p => !!p.ryd && !["finished", "canceled"].includes(p.ryd.status);
const rydCancelavel = p => !!p.ryd && ["pending", "scheduled", "accepted"].includes(p.ryd.status);
const podeChamarRyd = p => p.modo === "Entrega em endereço" && !!p.endereco && !rydAtiva(p)
  && ["Em produção", "Entregue — Esperando restante"].includes(p.status) && !(p.status === "Entregue — Esperando restante" && p.ryd);
/* Fiado é para pedido entregue (ou saindo agora) que ainda tem valor em aberto. */
const podeFiado = p => ["Em produção", "Pronto", "Entregue — Esperando restante"].includes(p.status) && p.pagamento !== "Totalmente pago";
const textoRyd = p => {
  const r = RYD[p.ryd.status] || { rotulo: p.ryd.status };
  return p.ryd.entregador && ["accepted", "withdraw", "delivering"].includes(p.ryd.status) ? `${r.rotulo}: ${p.ryd.entregador}` : r.rotulo;
};

/* A charge is a link the atendente sends; this is where it lands after it's generated. */
function LinkCobranca({ link, onClose, onToast }) {
  const fone = String(link.tel || "").replace(/\D/g, "");
  const varios = String(link.pedidoId).includes(",");
  const msg = `Olá, ${link.cliente || ""}! 🩷\n\n${varios ? "Seus pedidos" : "Seu pedido"} ${link.pedidoId} na D'Luh Festas — ${link.rotulo.toLowerCase()} de ${reais(link.valor)}.\nPague pelo link: ${link.url}`;
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
        <Field label="Valor recebido"><div style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-bold)" }}>{window.brl(REAL() && pedido.permuta ? recebido - pedido.permuta.valor / 100 : recebido)}</div></Field>
        {pedido.permuta ? <Field label="Em permuta" hint={pedido.permuta.combinado || undefined}>
          <div style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-bold)" }}>{reais(pedido.permuta.valor)}</div></Field> : null}
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

/* Permuta: quanto do pedido sai em troca (tudo que falta, ou menos: o resto a pessoa paga normal)
   e o que ela ficou de fazer. Não entra no caixa nem no faturamento; o cliente vê "Permuta" no
   acompanhamento do pedido. */
function PermutaModal({ p, onClose, acao, pendente, aoSalvar }) {
  const atual = p.permuta ? p.permuta.valor : 0;
  const max = p._c ? p._c.falta + atual : Math.round(valor(p.falta) * 100) + atual;
  const [v, setV] = React.useState(((atual || max) / 100).toFixed(2));
  const [combinado, setCombinado] = React.useState(p.permuta ? p.permuta.combinado : "");
  const [tentou, setTentou] = React.useState(false);
  const cent = Math.round(parseFloat(String(v).replace(",", ".")) * 100) || 0;
  const erro = !tentou ? undefined : cent <= 0 ? "Digite um valor maior que zero" : cent > max ? `No máximo ${reais(max)} (o que falta pagar)` : undefined;
  const resto = Math.max(0, max - cent);
  const totalCent = p._c ? p._c.total : Math.round(valor(p.total) * 100);
  const salvar = async () => {
    setTentou(true);
    if (cent <= 0 || cent > max) return;
    const pm = { valor: cent, combinado: combinado.trim() };
    const ok = await acao("permuta", { ok: atual ? "Permuta atualizada" : "Pedido marcado como permuta", falhou: "Não deu pra salvar a permuta" },
      REAL() ? null : () => aoSalvar(pm), { acao: "marcarPermuta", dados: { pedidoId: p.id, ...pm } });
    if (ok) onClose();
  };
  const tirar = async () => {
    const ok = await acao("tirar-permuta", { ok: "Permuta tirada: o valor volta a ser cobrado", falhou: "Não deu pra tirar a permuta" },
      REAL() ? null : () => aoSalvar(null), { acao: "tirarPermuta", dados: { pedidoId: p.id } });
    if (ok) onClose();
  };
  const ocupado = pendente === "permuta" || pendente === "tirar-permuta";
  return <Modal width={520} title={atual ? "Permuta" : "Marcar como permuta"} onClose={ocupado ? null : onClose}
    subtitle={`${p.id} · ${p.cliente || "cliente"} · ${p.total}`}
    footer={<>
      {atual ? <Button variant="ghost" tone="danger" block icon="undo-2" loading={pendente === "tirar-permuta"} disabled={ocupado} onClick={tirar}>Tirar permuta</Button>
        : <Button variant="ghost" block disabled={ocupado} onClick={onClose}>Voltar</Button>}
      <Button block icon="handshake" loading={pendente === "permuta"} disabled={ocupado} onClick={salvar}>{atual ? "Salvar" : "Marcar permuta"}</Button>
    </>}>
    <form onSubmit={e => { e.preventDefault(); salvar(); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Valor em permuta" required error={erro}
        hint={cent > 0 && cent <= max ? (resto ? `Permuta parcial: ${reais(resto)} continua para ${para(p)} pagar.` : cent >= totalCent ? "O pedido todo sai em permuta e fica quitado." : "Com o que já foi pago, o pedido fica quitado.") : `Até ${reais(max)}.`}>
        <Input type="number" prefix="R$" step="0.01" min="0" inputMode="decimal" value={v} invalid={!!erro} onChange={e => setV(e.target.value)} />
      </Field>
      <Field label="O que foi combinado" hint="Ex.: 2 stories e 1 post no Instagram (@perfil). Só a equipe vê este texto.">
        <Input autoComplete="off" maxLength={500} value={combinado} onChange={e => setCombinado(e.target.value)} />
      </Field>
      <div style={{ fontSize: "var(--fs-body-s)", color: "var(--text-muted)", lineHeight: "var(--lh-normal)" }}>
        Não entra no caixa nem no faturamento. O cliente vê “Permuta” no acompanhamento do pedido.
      </div>
    </form>
  </Modal>;
}

/* Quanto já saiu em permuta e com quantas pessoas, para a aba Permutas. */
function ResumoPermuta({ lista }) {
  const total = lista.reduce((s, p) => s + p.permuta.valor, 0);
  const pessoas = new Set(lista.map(p => String(p.tel || "").replace(/\D/g, "") || p.cliente)).size;
  return <div style={{ marginRight: "auto", display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", fontSize: "var(--fs-body-s)", color: "var(--text-muted)" }}>
    <span>Em permuta:</span>
    <span style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-bold)", color: "var(--text-strong)", fontVariantNumeric: "tabular-nums" }}>{reais(total)}</span>
    <span>· {pessoas === 1 ? "1 pessoa" : `${pessoas} pessoas`}</span>
  </div>;
}

/* Quanto está na rua em fiado e com quantas pessoas, para a aba Fiados. */
function ResumoFiado({ lista, pessoas }) {
  const falta = lista.reduce((s, p) => s + (p._c ? p._c.falta / 100 : valor(p.falta)), 0);
  return <div style={{ marginRight: "auto", display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", fontSize: "var(--fs-body-s)", color: "var(--text-muted)" }}>
    <span>Em fiado:</span>
    <span style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-bold)", color: "var(--text-strong)", fontVariantNumeric: "tabular-nums" }}>{window.brl(falta)}</span>
    <span>· {pessoas === 1 ? "1 cliente" : `${pessoas} clientes`}</span>
  </div>;
}

/* ── Fiados por cliente: a aba lista quem deve (como os boletos), e cada cliente abre os pedidos
   dele com o relatório do que pegou, quando e quanto falta. Os pedidos da mesma pessoa se juntam
   como na tela Clientes (telefone, login ou e-mail). ── */
const centavos = (p, campo) => p._c ? p._c[campo] || 0 : Math.round(valor(p[campo]) * 100);
const dataBR = iso => iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : "sem data";
const diaMes = iso => iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : "sem data";
const itensDe = p => p._c ? p._c.itens.map(i => ({ qtd: i.qtd, nome: i.nome, valor: reais(i.qtd * i.valorUnit) }))
  : (p.itens || []).map(i => ({ qtd: i.qty, nome: i.name, valor: i.price }));

function fiadosPorCliente(lista) {
  return window.clientesDe(lista).map(c => {
    const pedidos = c.pedidos.slice().sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`));
    return { ...c, pedidos, deve: pedidos.reduce((s, p) => s + centavos(p, "falta"), 0), desde: pedidos[0].data || "" };
  }).sort((a, b) => (a.desde || "9").localeCompare(b.desde || "9") || b.deve - a.deve);
}

/* O texto vai para o cliente: nada da palavra fiado (a mesma regra da Sofia e do site). */
function textoRelatorio(c) {
  const linhas = [`Olá, ${c.nome}! 🩷`, "", "Segue o resumo do que está em aberto com a D'Luh Festas:", ""];
  c.pedidos.forEach(p => {
    linhas.push(`📅 ${dataBR(p.data)} · ${p.id}`);
    itensDe(p).forEach(i => linhas.push(`  ${i.qtd}× ${i.nome}${i.valor ? ` — ${i.valor}` : ""}`));
    const pago = centavos(p, "pago");
    linhas.push(`  Total ${reais(centavos(p, "total"))}${pago ? ` · pago ${reais(pago)}` : ""} · falta ${reais(centavos(p, "falta"))}`, "");
  });
  linhas.push(`*Total em aberto: ${reais(c.deve)}*`);
  return linhas.join("\n");
}

const escH = s => String(s == null ? "" : s).replace(/[&<>"]/g, x => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[x]);
/* Sai na mesma impressora dos pedidos (80 mm), de um frame escondido. */
function imprimirRelatorio(c) {
  const agora = new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Em aberto · ${escH(c.nome)}</title><style>
    @page{margin:0}*{box-sizing:border-box}
    body{margin:0;padding:3mm 3mm 6mm;width:80mm;color:#000;font:13.5px/1.3 system-ui,"Segoe UI",Arial,sans-serif}
    .topo{display:flex;justify-content:space-between;font-size:12px}
    .nome{font-size:20px;font-weight:800;line-height:1.1;margin:4px 0 2px;overflow-wrap:anywhere}
    h2{display:flex;justify-content:space-between;font-size:13px;font-weight:800;border-bottom:1.5px dashed #000;margin:10px 0 4px;padding-bottom:2px}
    .i{display:flex;gap:6px;margin:2px 0}.q{font-weight:800;min-width:30px;text-align:right}.v{margin-left:auto;white-space:nowrap}
    .s{font-size:12.5px;margin-top:3px;text-align:right}
    .tot{border:2px solid #000;font-weight:800;font-size:16px;text-align:center;padding:5px;margin-top:12px}
    .rod{font-size:11px;text-align:center;margin-top:8px}
  </style></head><body>
    <div class="topo"><b>Em aberto</b><span>D'Luh Festas</span></div>
    <div class="nome">${escH(c.nome)}</div>${c.tel ? `<div>${escH(window.fmtTel(c.tel))}</div>` : ""}
    ${c.pedidos.map(p => `<h2><span>${escH(dataBR(p.data))}</span><span>${escH(p.id)}</span></h2>`
      + itensDe(p).map(i => `<div class="i"><span class="q">${escH(i.qtd)}</span><span>${escH(i.nome)}</span><span class="v">${escH(i.valor || "")}</span></div>`).join("")
      + `<div class="s">Total ${escH(reais(centavos(p, "total")))}${centavos(p, "pago") ? ` · pago ${escH(reais(centavos(p, "pago")))}` : ""} · <b>falta ${escH(reais(centavos(p, "falta")))}</b></div>`).join("")}
    <div class="tot">Total em aberto: ${escH(reais(c.deve))}</div>
    <div class="rod">${c.pedidos.length === 1 ? "1 pedido" : c.pedidos.length + " pedidos"} · impresso ${escH(agora)}</div>
  </body></html>`;
  const f = document.createElement("iframe");
  f.setAttribute("aria-hidden", "true");
  f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  f.onload = () => { try { f.contentWindow.focus(); f.contentWindow.print(); } finally { setTimeout(() => f.remove(), 300); } };
  f.srcdoc = html;
  document.body.appendChild(f);
}

function ListaFiados({ clientes, compact, onAbrir }) {
  return <Card bodyStyle={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {clientes.map(c => {
      const n = c.pedidos.length;
      const sub = [`${n} ${n === 1 ? "pedido" : "pedidos"}`, `desde ${diaMes(c.desde)}`, compact ? null : c.tel ? window.fmtTel(c.tel) : null].filter(Boolean).join(" · ");
      return <ListRow key={c.id} avatar={compact ? null : (c.nome || "?").trim().charAt(0).toUpperCase()} title={c.nome} subtitle={sub}
        value={reais(c.deve)} valueSub="em aberto" onClick={() => onAbrir(c.id)} />;
    })}
  </Card>;
}

/* O cliente aberto: o relatório no topo (copiar, WhatsApp, imprimir) e cada pedido com as ações dele. */
function FiadoCliente({ c, compact, onClose, onToast, pede, pendente, acao, onDetalhes }) {
  const fone = window.telDigitos(c.tel);
  const texto = textoRelatorio(c);
  const copiar = () => navigator.clipboard.writeText(texto).then(() => onToast("Relatório copiado"), () => onToast("Não deu pra copiar o relatório", "danger"));
  const n = c.pedidos.length;
  const cresce = compact ? { flex: "1 1 auto" } : undefined;
  const abertos = c.pedidos.filter(p => centavos(p, "falta") > 0);
  return <Modal width={640} title={c.nome} onClose={onClose}
    subtitle={`${n} ${n === 1 ? "pedido" : "pedidos"} em aberto desde ${dataBR(c.desde)}${c.tel ? " · " + window.fmtTel(c.tel) : ""}`}
    footer={<>
      <Button variant="ghost" block icon="printer" onClick={() => imprimirRelatorio(c)}>Imprimir</Button>
      <Button variant="ghost" block icon="copy" onClick={copiar}>Copiar</Button>
      <Button block icon="message-circle" disabled={fone.length < 10}
        onClick={() => window.open(`https://wa.me/55${fone}?text=${encodeURIComponent(texto)}`, "_blank", "noopener")}>{compact ? "WhatsApp" : "Enviar no WhatsApp"}</Button>
    </>}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", padding: "12px 14px", borderRadius: "var(--radius-sm)", background: "var(--color-accent-soft)", border: "var(--border-hairline) solid var(--color-accent)" }}>
      <span style={{ fontSize: "var(--fs-body-s)", color: "var(--text-muted)" }}>Deve no total</span>
      <span style={{ fontSize: "var(--fs-h3, 22px)", fontWeight: "var(--fw-bold)", color: "var(--text-strong)", fontVariantNumeric: "tabular-nums" }}>{reais(c.deve)}</span>
      <span style={{ flex: 1 }} />
      {abertos.length > 1 ? <Button size="sm" style={{ ...cresce, alignSelf: "center" }} tone="chargeAll" icon="banknote"
        onClick={() => pede("tudo", { id: abertos.map(p => p.id).join(", "), ids: abertos.map(p => p.id), deve: c.deve, cliente: c.nome, tel: c.tel })}>Cobrar tudo</Button> : null}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
      {c.pedidos.map(p => {
        const quitado = p.pagamento === "Totalmente pago";
        const pago = centavos(p, "pago");
        return <div key={p.id} style={{ padding: "11px 12px", borderRadius: "var(--radius-sm)", background: "var(--color-surface-2)", border: "var(--border-hairline) solid var(--color-border-soft)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontWeight: "var(--fw-semibold)", color: "var(--text-strong)" }}>{dataBR(p.data)}</span>
            <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-accent)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-caps)" }}>{p.id}</span>
            <span style={{ flex: 1 }} />
            <span style={{ fontWeight: "var(--fw-bold)", color: "var(--text-strong)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{quitado ? "Quitado" : `falta ${reais(centavos(p, "falta"))}`}</span>
          </div>
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 2, fontSize: "var(--fs-body-s)", color: "var(--text-body)" }}>
            {itensDe(p).map((i, k) => <div key={k} style={{ display: "flex", gap: 8 }}>
              <span style={{ fontWeight: "var(--fw-semibold)", minWidth: 34, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{i.qtd}×</span>
              <span style={{ flex: 1, minWidth: 0 }}>{i.nome}</span>
              <span style={{ color: "var(--text-muted)", whiteSpace: "nowrap" }}>{i.valor}</span>
            </div>)}
          </div>
          <div style={{ marginTop: 6, fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>
            Total {reais(centavos(p, "total"))}{pago ? ` · pago ${reais(pago)}` : ""}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <Button size="sm" variant="ghost" icon="file-text" onClick={() => onDetalhes(p)}>Detalhes</Button>
            <Button size="sm" variant="ghost" icon="undo-2" onClick={() => pede("tirarFiado", p)}>Tirar do fiado</Button>
            <span style={{ flex: 1 }} />
            {quitado
              ? <Button size="sm" style={cresce} tone="delivered" icon="circle-check" loading={pendente === "finalizar-" + p.id}
                  onClick={() => acao("finalizar-" + p.id, { ok: "Pedido finalizado", falhou: "Não deu pra finalizar o pedido" }, null,
                    { acao: "mudarStatus", dados: { pedidoId: p.id, status: "Finalizado" } })}>Finalizar</Button>
              : <Button size="sm" style={cresce} tone="chargeAll" icon="banknote" onClick={() => pede("restante", p)}>Cobrar restante</Button>}
          </div>
        </div>;
      })}
    </div>
  </Modal>;
}

function Pedidos({ compact, q }) {
  const [tab, setTab] = React.useState("estoque");
  const [detalhe, setDetalhe] = React.useState(null);
  const [manual, setManual] = React.useState(false);
  const [confirm, setConfirm] = React.useState(null);
  const [apagando, setApagando] = React.useState(null);
  const [nota, setNota] = React.useState(null);
  const [permuta, setPermuta] = React.useState(null);
  const [fiadoDe, setFiadoDe] = React.useState(null);
  const [toastNode, showToast] = useToast();
  const [acao, pendente] = useAcao(showToast);
  /* Busca e as abas de pedidos encerrados leem o histórico inteiro; o resto só o recente (firebase.js). */
  const carga = useAoVivo(q || tab === "final" || tab === "cancelado" || tab === "busca" || tab === "permuta" ? "pedidosTodos" : "pedidos");
  const catalogo = useAoVivo("produtos");
  const produtos = catalogo.dados || [];
  const [link, setLink] = React.useState(null);
  const imprimir = p => window.imprimirPedido(p, produtos) || showToast("O navegador bloqueou a janela de impressão", "danger");

  const todos = carga.dados || [];
  const abas = q ? [BUSCA, ...TABS] : TABS;
  const aba = abas.find(t => t.id === tab) || TABS[0];
  const lista = todos.filter(p => naAba(aba, p)).filter(p => casa(p, q));
  /* Orders whose Status is not in the Coda single-select would fall between the tabs. They are
     listed on their own, above the tabs, so a typo in Coda is visible instead of lost. */
  const fora = todos.filter(p => !TABS.some(t => t.filtro && t.filtro.includes(p.status)));
  const achouEmOutra = !!q && todos.some(p => casa(p, q));

  /* Digitar na busca abre "Resultados" (todos os status); limpar volta para a primeira aba. As
     contagens das abas passam a ser do que casou, para ver em que status estão. */
  React.useEffect(() => {
    if (q) setTab("busca");
    else setTab(t => t === "busca" ? "estoque" : t);
  }, [!!q]);

  const fiados = tab === "fiado" ? fiadosPorCliente(lista) : [];
  const fiadoAberto = fiadoDe && fiados.find(c => c.id === fiadoDe);
  const counts = {};
  abas.forEach(t => counts[t.id] = todos.filter(p => naAba(t, p) && casa(p, q)).length);
  const pede = (tipo, p) => setConfirm({ tipo, p, ...CONFIRMA[tipo](p) });
  /* Primeiro a cotação (não cobra nada), e a pergunta já com o preço e o endereço que a RYD entendeu:
     o "sim" é que debita o saldo da RYD e chama o entregador. */
  const chamarEntregador = async p => {
    const r = await acao("cotar-" + p.id, { falhou: "Não deu pra cotar a entrega" }, null, { acao: "cotarEntrega", dados: { pedidoId: p.id } });
    if (!r) return;
    const c = REAL() ? r : { valor: 1140, previewId: "demo", metros: 3027, enderecos: [p.endereco] };
    const destino = (c.enderecos || []).slice(-1)[0] || p.endereco;
    setConfirm({ tipo: "entregador", p, tone: "delivered", icon: "truck", title: `Chamar entregador por ${reais(c.valor)}?`,
      message: `A RYD leva até ${destino}${c.metros ? ` (${(c.metros / 1000).toFixed(1).replace(".", ",")} km)` : ""}. Confira o endereço: o valor sai do saldo da RYD assim que confirmar.`,
      confirmLabel: "Sim, chamar", ok: "Entregador chamado: o status aparece no pedido", falhou: "Não deu pra chamar o entregador",
      aplicar: l => l.map(x => x.id === p.id ? { ...x, ryd: { status: "pending", entregador: "", valor: c.valor } } : x),
      pedido: { acao: "confirmarEntrega", dados: { pedidoId: p.id, previewId: c.previewId, valor: c.valor } } });
  };

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

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {tab === "fiado" && lista.length ? <ResumoFiado lista={lista} pessoas={fiados.length} /> : null}
        {tab === "permuta" && lista.length ? <ResumoPermuta lista={lista} /> : null}
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

      {tab === "fiado" && fiados.length ? <ListaFiados clientes={fiados} compact={compact} onAbrir={setFiadoDe} />
      : lista.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
          {lista.map(p => {
            const menu = <DropdownMenu trigger={<IconButton icon="menu" label="Mais ações" />} items={[
              { label: "Copiar dados do pedido", icon: "copy", onClick: () => copiarPedido(p, showToast) },
              { label: "Notificar alterações", icon: "bell-ring", onClick: () => acao("notificar-" + p.id, { ok: "Cliente avisado no WhatsApp", falhou: "Não deu pra avisar o cliente" }, null, { acao: "avisarCliente", dados: { pedidoId: p.id } }) },
              ...(podeImprimir(p) ? [{ label: "Imprimir pedido", icon: "printer", onClick: () => imprimir(p) }]
                : [{ label: "Mandar para produção", icon: "chef-hat", onClick: () => pede("producao", p) }]),
              ...(p.status === "Cancelado" ? [] : [{ label: p.nota ? "Nota fiscal" : "Emitir nota fiscal", icon: "receipt-text", onClick: () => setNota(p) }]),
              ...(p.status === "Cancelado" || (!p.permuta && p.pagamento === "Totalmente pago") ? []
                : [{ label: p.permuta ? "Permuta" : "Marcar como permuta", icon: "handshake", onClick: () => setPermuta(p) }]),
              ...(podeFiado(p) ? [{ label: "Marcar como fiado", icon: "notebook-pen", onClick: () => pede("fiado", p) }] : []),
              ...(p.status === "Fiado" ? [{ label: "Tirar do fiado", icon: "undo-2", onClick: () => pede("tirarFiado", p) }] : []),
              ...(podeChamarRyd(p) ? [{ label: "Chamar entregador (RYD)", icon: "truck", onClick: () => chamarEntregador(p) }] : []),
              ...(rydCancelavel(p) ? [{ label: "Cancelar entregador", icon: "circle-x", onClick: () => pede("cancelarRyd", p) }] : []),
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
                {p.permuta ? <Badge tone="accent" icon="handshake">Permuta {reais(p.permuta.valor)}</Badge> : null}
                {p.falta ? <Badge tone="warn">Falta {p.falta}</Badge> : null}
                {p.feitoNaCozinha && ["Em produção", "Fiado"].includes(p.status) ? <Badge tone="success" icon="chef-hat">Feito na cozinha</Badge> : null}
                {p.status === "Fiado" && p.feitoNaCozinha === false ? <Badge tone="neutral" icon="chef-hat">Na cozinha</Badge> : null}
                {p.nota ? <Badge tone="neutral" icon="receipt-text">{p.nota.tipo} {p.nota.numero}</Badge> : null}
                {p.ryd ? <Badge tone={(RYD[p.ryd.status] || {}).tone || "neutral"} icon="truck">{textoRyd(p)}</Badge> : null}
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
                  : ["Entregue — Esperando restante", "Fiado"].includes(p.status) && p.pagamento === "Totalmente pago"
                  ? <Button size="sm" style={cresce} tone="delivered" icon="circle-check" loading={pendente === "finalizar-" + p.id}
                      onClick={() => acao("finalizar-" + p.id, { ok: "Pedido finalizado", falhou: "Não deu pra finalizar o pedido" }, null,
                        { acao: "mudarStatus", dados: { pedidoId: p.id, status: "Finalizado" } })}>Finalizar</Button>
                  : ["Entregue — Esperando restante", "Fiado"].includes(p.status)
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
          description={tab === "permuta" ? "Para marcar uma permuta, abra o ☰ do pedido e escolha “Marcar como permuta”." : "Assim que um pedido entrar nesse status ele aparece aqui automaticamente."} /></Card>
      )}

      {fiadoAberto ? <FiadoCliente c={fiadoAberto} compact={compact} onClose={() => setFiadoDe(null)} onToast={showToast} pede={pede} pendente={pendente} acao={acao} onDetalhes={setDetalhe} /> : null}
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
      {permuta ? <PermutaModal key={"permuta-" + permuta.id} p={todos.find(x => x.id === permuta.id) || permuta} onClose={() => setPermuta(null)} acao={acao} pendente={pendente}
        aoSalvar={pm => carga.setDados(l => l.map(x => x.id === permuta.id ? { ...x, permuta: pm } : x))} /> : null}
      {nota ? <NotaModal key={"nota-" + nota.id} p={todos.find(x => x.id === nota.id) || nota} onClose={() => setNota(null)} onToast={showToast} acao={acao} pendente={pendente}
        aoSalvar={n => carga.setDados(l => l.map(x => x.id === nota.id ? { ...x, nota: n } : x))} /> : null}
      {link ? <LinkCobranca link={link} onClose={() => setLink(null)} onToast={showToast} /> : null}
      {toastNode}
    </div>
  );
}

Object.assign(window, { Pedidos, DetalhesModal });
