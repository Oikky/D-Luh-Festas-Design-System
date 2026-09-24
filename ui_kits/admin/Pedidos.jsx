const DS = window.DLuhFestasDesignSystem_c861a2;
const { Tabs, FilterPill, OrderCard, Button, IconButton, DropdownMenu, Badge, EmptyState,
        Modal, ConfirmDialog, Toast, Field, Input, Select, Card, StatusBadge, DataTable } = DS;

/* One tab per Coda Status. "Verificando Estoque" is the Telegram round-trip in progress, so it
   lives with "Aguardando confirmação" under Estoque pendente instead of vanishing. */
const TABS = [
  { id: "estoque", label: "Estoque pendente", filtro: ["Aguardando confirmação", "Verificando Estoque"] },
  { id: "pagamento", label: "Esperando pagamento", filtro: ["Confirmado — Esperando pagamento"] },
  { id: "producao", label: "Em produção", filtro: ["Pago — Em produção"] },
  { id: "restante", label: "Esperando restante", filtro: ["Entregue — Esperando restante"] },
  { id: "final", label: "Finalizados", filtro: ["Finalizado"] },
  { id: "cancelado", label: "Cancelados", filtro: ["Cancelado"] }
];

const valor = s => Number(String(s || "").replace(/[^\d,]/g, "").replace(",", ".")) || 0;
const casa = (p, q) => !q || [p.cliente, p.id, p.tel].some(v => String(v || "").toLowerCase().includes(q.toLowerCase()));

/* Every confirmation the order card can open. Money actions name the amount in the question. */
const CONFIRMA = {
  estoque: p => ({ tone: "accent", icon: "circle-check", title: "Confirmar estoque?",
    message: "O cliente recebe o link de pagamento da entrada e o pedido vai para Esperando pagamento.",
    confirmLabel: "Sim, confirmar", toast: "Estoque confirmado" }),
  entrada: p => ({ tone: "chargeEntry", icon: "link", title: `Cobrar entrada de ${p.falta}?`,
    message: `${p.cliente} recebe o link de pagamento da entrada.`, confirmLabel: "Sim, cobrar", toast: "Link de cobrança enviado" }),
  restante: p => ({ tone: "chargeAll", icon: "banknote", title: `Cobrar restante de ${p.falta}?`,
    message: `${p.cliente} recebe o link de pagamento do restante.`, confirmLabel: "Sim, cobrar", toast: "Cobrança do restante enviada" }),
  pago: p => ({ tone: "success", icon: "badge-check", title: "Marcar como pago?",
    message: `O pedido de ${p.cliente} fica como totalmente pago. Nenhuma cobrança é enviada.`, confirmLabel: "Sim, marcar pago", toast: "Pagamento registrado" }),
  apagar: p => ({ tone: "danger", icon: "trash-2", title: "Apagar pedido?",
    message: "O pedido sai da fila e do Coda. Não dá pra desfazer.", confirmLabel: "Sim, apagar", toast: "Pedido apagado" })
};

function DetalhesModal({ pedido, onClose, onToast }) {
  /* What the order already received comes from the order itself. The site does not report
     when it was paid, so that row carries no timestamp until Coda provides one. */
  const [pgtos, setPgtos] = React.useState(() => pedido && valor(pedido.pago) > 0
    ? [{ quando: null, valor: valor(pedido.pago), origem: "site", meio: pedido.pgto }] : []);
  const [verPgtos, setVerPgtos] = React.useState(false);
  if (!pedido) return null;
  const recebido = pgtos.reduce((s, p) => s + p.valor, 0);
  return (<>
    <Modal width={620} title="Detalhes do pedido" onClose={onClose}
      subtitle="Edite os dados do cliente, a entrega e o pagamento."
      footer={<>
        <Button variant="ghost" block onClick={onClose}>Fechar</Button>
        <Button variant="ghost" block icon="printer" onClick={() => onToast("Pedido enviado para impressão")}>Imprimir</Button>
        <Button block icon="save" onClick={() => { onClose(); onToast("Pedido atualizado"); }}>Salvar</Button>
      </>}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-accent)", letterSpacing: "var(--ls-caps)" }}>{pedido.id}</span>
        <StatusBadge status={pedido.status} />
        {pedido.tipo ? <Badge tone="accent" icon="building-2">{pedido.tipo}</Badge> : null}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px 12px" }}>
        <Field label="Cliente" required><Input defaultValue={pedido.cliente} /></Field>
        <Field label="WhatsApp" required><Input defaultValue={pedido.tel} /></Field>
        <Field label="Entrega"><Select options={["Retirada no local", "Entrega em endereço"]} defaultValue={pedido.modo} /></Field>
        <Field label="Data"><Input type="date" defaultValue={pedido.data} /></Field>
        <Field label="Hora"><Input type="time" defaultValue={pedido.hora} /></Field>
        <Field label="Pagamento"><Select options={["Pix", "Cartão", "Dinheiro"]} defaultValue={pedido.pgto} /></Field>
      </div>
      <div style={{ marginTop: 16 }}>
        <DataTable minWidth={0} rows={pedido.itens.map((it, i) => ({ id: i, ...it }))} columns={[
          { key: "name", label: "Produto", strong: true, wrap: true },
          { key: "qty", label: "Qtd", align: "center", width: 60 },
          { key: "price", label: "Subtotal", align: "right", width: 100, strong: true }
        ]} />
      </div>
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", padding: "12px 14px", borderRadius: "var(--radius-sm)", border: "var(--border-hairline) solid var(--color-border)" }}>
        <Field label="Valor recebido"><div style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-bold)" }}>{window.brl(recebido)}</div></Field>
        <div style={{ flex: 1 }} />
        <Button size="sm" variant="outline" icon="list" onClick={() => setVerPgtos(true)}>Pagamentos ({pgtos.length})</Button>
      </div>
    </Modal>
    {verPgtos ? <PagamentosModal lista={pgtos} onChange={setPgtos} onClose={() => setVerPgtos(false)} onToast={onToast} /> : null}
  </>);
}

function Pedidos({ compact, q }) {
  const [tab, setTab] = React.useState("estoque");
  const [detalhe, setDetalhe] = React.useState(null);
  const [manual, setManual] = React.useState(false);
  const [confirm, setConfirm] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const todos = window.DLUH.pedidos;
  const filtro = (TABS.find(t => t.id === tab) || TABS[0]).filtro;
  const lista = todos.filter(p => filtro.includes(p.status)).filter(p => casa(p, q));

  /* A search that only matches in another status moves to that tab, so picking a pedido in
     the global search never lands on an empty list. */
  React.useEffect(() => {
    if (!q || lista.length) return;
    const alvo = TABS.find(t => todos.some(p => t.filtro.includes(p.status) && casa(p, q)));
    if (alvo) setTab(alvo.id);
  }, [q]);

  const counts = {};
  TABS.forEach(t => counts[t.id] = todos.filter(p => t.filtro.includes(p.status)).length);
  const pede = (tipo, p) => setConfirm({ tipo, p, ...CONFIRMA[tipo](p) });

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "var(--space-8)", minHeight: "100%" }}>
      <Tabs value={tab} onChange={setTab} items={TABS.map(t => ({ id: t.id, label: t.label, count: counts[t.id] }))} />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button size="sm" icon="plus" onClick={() => setManual(true)}>Pedido manual</Button>
      </div>

      {lista.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
          {lista.map(p => (
            <OrderCard key={p.id} id={p.id} customer={p.cliente} status={p.status}
              meta={[p.entrega, p.tel, p.pgto].filter(Boolean)}
              badges={<>
                {p.tipo ? <Badge tone="accent" icon="building-2">{p.tipo}</Badge> : null}
                {p.falta ? <Badge tone="warn">Falta {p.falta}</Badge> : null}
              </>}
              items={p.itens} total={p.total} paid={p.pago} due={p.falta}
              actions={<>
                <Button size="sm" variant="ghost" icon="file-text" onClick={() => setDetalhe(p)}>Detalhes</Button>
                {p.status === "Aguardando confirmação"
                  ? <Button size="sm" icon="check" onClick={() => pede("estoque", p)}>Confirmar estoque</Button>
                  : p.status === "Confirmado — Esperando pagamento"
                  ? <Button size="sm" tone="chargeEntry" icon="link" onClick={() => pede("entrada", p)}>Cobrar entrada</Button>
                  : p.status === "Pago — Em produção"
                  ? <Button size="sm" tone="delivered" icon="truck" onClick={() => showToast("Pedido marcado como entregue")}>Marcar entregue</Button>
                  : p.status === "Entregue — Esperando restante"
                  ? <Button size="sm" tone="chargeAll" icon="banknote" onClick={() => pede("restante", p)}>Cobrar restante</Button>
                  : p.status === "Finalizado"
                  ? <Button size="sm" variant="outline" icon="printer" onClick={() => showToast("Recibo gerado")}>Recibo</Button>
                  : null}
                <DropdownMenu trigger={<IconButton icon="menu" label="Mais ações" />} items={[
                  { label: "Copiar dados do pedido", icon: "copy", onClick: () => showToast("Dados copiados") },
                  { label: "Marcar como pago", icon: "badge-check", onClick: () => pede("pago", p) },
                  { label: "Notificar alterações", icon: "bell-ring", onClick: () => showToast("Cliente avisado no WhatsApp") },
                  { label: "Imprimir recibo", icon: "printer", onClick: () => showToast("Recibo enviado para impressão") },
                  { divider: true },
                  { label: "Apagar pedido", icon: "trash-2", tone: "danger", onClick: () => pede("apagar", p) }
                ]} />
              </>} />
          ))}
        </div>
      ) : (
        <Card padded={false}><EmptyState icon="party-popper" title="Nenhum pedido nesta aba"
          description="Assim que um pedido entrar nesse status ele aparece aqui automaticamente." /></Card>
      )}

      {detalhe ? <DetalhesModal pedido={detalhe} onClose={() => setDetalhe(null)} onToast={showToast} /> : null}
      {manual ? <ManualModal compact={compact} onClose={() => setManual(false)} onToast={showToast} /> : null}
      {confirm ? <ConfirmDialog tone={confirm.tone} icon={confirm.icon} title={confirm.title} message={confirm.message}
        confirmLabel={confirm.confirmLabel} cancelLabel="Voltar"
        onCancel={() => setConfirm(null)}
        onConfirm={() => { const t = confirm.toast; setConfirm(null); showToast(t); }} /> : null}
      {toast ? <Toast tone="success" icon="check">{toast}</Toast> : null}
    </div>
  );
}

Object.assign(window, { Pedidos, DetalhesModal });
