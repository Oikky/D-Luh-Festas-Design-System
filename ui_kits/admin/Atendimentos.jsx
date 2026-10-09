const AT = window.DLuhFestasDesignSystem_c861a2;

/* Pedidos que a Sofia passou para a equipe pelo WhatsApp (por enquanto: quem quer visitar o salão
   ou fazer evento lá). O aviso também chega no Telegram e no WhatsApp da dona; aqui fica a lista
   para ninguém esquecer de responder. "Resolvido" só tira da fila de novos. */
const TIPO_AT = {
  visita: { label: "Visita ao salão", icon: "map-pin" },
  evento: { label: "Evento no salão", icon: "party-popper" },
  outro: { label: "Falar com a equipe", icon: "message-circle" }
};
const FILTROS_AT = [
  { id: "novo", label: "Novos" },
  { id: "resolvido", label: "Resolvidos" },
  { id: "todos", label: "Todos" }
];
const quandoAt = iso => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", " ·");
};

function AtendimentoModal({ a, onClose, onMarcar, pendente }) {
  const t = TIPO_AT[a.tipo] || TIPO_AT.outro;
  const novo = a.status === "novo";
  const linha = (icon, titulo, valor) => valor ? <AT.ListRow icon={icon} title={valor} subtitle={titulo} /> : null;
  return (
    <AT.Modal width={520} title={a.nome || "Cliente sem nome"} subtitle={`${t.label} · recebido ${quandoAt(a.criadoEm)}`} onClose={onClose}
      footer={<>
        <AT.Button variant="ghost" block icon={novo ? "check" : "rotate-ccw"} loading={pendente === "at:" + a.id} onClick={() => onMarcar(a, novo)}>
          {novo ? "Resolvido" : "Reabrir"}
        </AT.Button>
        <AT.Button block icon="message-circle" onClick={() => window.open(`https://wa.me/${window.telDigitos(a.tel).length <= 11 ? "55" : ""}${window.telDigitos(a.tel)}`, "_blank", "noopener")}>WhatsApp</AT.Button>
      </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {linha("phone", "Telefone", a.tel ? window.fmtTel(window.telDigitos(a.tel)) : "")}
        {linha("calendar-days", "Quando quer", a.data)}
        {linha("users", "Pessoas", a.pessoas)}
        {linha("notebook-pen", "Observação", a.obs)}
        {!novo && a.resolvidoPor ? <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 6 }}>Resolvido por {a.resolvidoPor}</span> : null}
        <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 6 }}>
          A conversa fica em espera no GPTMaker. Depois de responder pelo WhatsApp da loja, mande #sofia para a Sofia voltar.
        </span>
      </div>
    </AT.Modal>
  );
}

function Atendimentos({ compact }) {
  const carga = useAoVivo("atendimentos");
  const [filtro, setFiltro] = React.useState("novo");
  const [aberto, setAberto] = React.useState(null);
  const [toastNode, showToast] = useToast();
  const [acao, pendente] = useAcao(showToast);

  if (carga.estado === "erro" && !carga.dados) return <ErroCarga erro={carga.erro} oque="os atendimentos" onTentar={carga.tentar} />;
  if (!carga.dados) return <Carregando oque="os atendimentos" />;

  const todos = carga.dados;
  const novos = todos.filter(a => a.status === "novo").length;
  const lista = filtro === "todos" ? todos : todos.filter(a => a.status === filtro);
  const atual = aberto && todos.find(a => a.id === aberto);

  const marcar = (a, resolvido) => acao("at:" + a.id,
    { ok: resolvido ? "Marcado como resolvido" : "Voltou para novos", falhou: "Não deu para marcar" },
    () => { carga.setDados(l => l.map(x => x.id === a.id ? { ...x, status: resolvido ? "resolvido" : "novo" } : x)); setAberto(null); },
    { acao: "marcarAtendimento", dados: { id: a.id, resolvido } });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {FILTROS_AT.map(f => <AT.FilterPill key={f.id} trailingIcon={null} active={filtro === f.id} onClick={() => setFiltro(f.id)}>
          {f.id === "novo" && novos ? `${f.label} (${novos})` : f.label}
        </AT.FilterPill>)}
      </div>

      <AT.Card padded={false} header={<div>
        <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>Atendimentos</div>
        <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>
          {novos ? `${novos} esperando resposta` : "Nada esperando resposta"} · a Sofia passa para a equipe pelo WhatsApp
        </div>
      </div>}>
        {!lista.length ? <AT.EmptyState icon="headset" title={filtro === "novo" ? "Ninguém esperando" : "Nenhum atendimento aqui"}
          description="Quando alguém pedir para visitar o salão, a Sofia avisa aqui, no Telegram e no WhatsApp." /> :
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: compact ? 8 : 12 }}>
          {lista.map(a => {
            const t = TIPO_AT[a.tipo] || TIPO_AT.outro;
            return <AT.ListRow key={a.id} icon={t.icon} title={a.nome || "Cliente sem nome"}
              subtitle={[t.label, a.data || null, a.pessoas ? `${a.pessoas} pessoas` : null].filter(Boolean).join(" · ")}
              value={a.status === "novo" ? <AT.Badge tone="warn">Novo</AT.Badge> : <AT.Badge tone="success">Resolvido</AT.Badge>}
              valueSub={quandoAt(a.criadoEm)}
              onClick={() => setAberto(a.id)} />;
          })}
        </div>}
      </AT.Card>

      {atual ? <AtendimentoModal a={atual} onClose={() => setAberto(null)} onMarcar={marcar} pendente={pendente} /> : null}
      {toastNode}
    </div>
  );
}

Object.assign(window, { Atendimentos });
