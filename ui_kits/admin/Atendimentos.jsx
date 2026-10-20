const AT = window.DLuhFestasDesignSystem_c861a2;

/* Funil das festas. Quem quer visitar o salão ou fazer uma festa chega pela Sofia (WhatsApp) ou é
   lançado pela equipe, e anda pelas etapas até a festa acontecer. A festa fechada tem data, valor,
   contrato e encomendas, e aparece na Agenda (e na Google Agenda, pelo Worker). O dinheiro da festa
   é lançado como entrada no Financeiro com festaId, e esta tela soma o que já entrou lendo de lá.
   Os nomes daqui levam "at" na frente: os .jsx do admin dividem o mesmo escopo global. */
const AT_ETAPAS = [
  { id: "novo", label: "Novos", um: "Novo", icon: "inbox", proxima: "Comecei a conversar" },
  { id: "conversando", label: "Em conversa", um: "Em conversa", icon: "message-circle", proxima: "Marcar visita" },
  { id: "visita", label: "Visita marcada", um: "Visita marcada", icon: "map-pin", proxima: "Orçamento enviado" },
  { id: "orcamento", label: "Orçamento", um: "Orçamento enviado", icon: "receipt-text", proxima: "Fechar a festa" },
  { id: "fechada", label: "Fechadas", um: "Festa fechada", icon: "party-popper", proxima: "Festa aconteceu" },
  { id: "realizada", label: "Realizadas", um: "Festa realizada", icon: "circle-check" }
];
const AT_PERDIDA = { id: "perdida", label: "Perdidas", um: "Perdida", icon: "circle-x" };
const atEtapa = id => AT_ETAPAS.find(e => e.id === id) || (id === "perdida" ? AT_PERDIDA : AT_ETAPAS[0]);
const AT_TOM = { novo: "warn", conversando: "neutral", visita: "accent", orcamento: "accent", fechada: "success", realizada: "neutral", perdida: "danger" };
const AT_ABERTAS = ["novo", "conversando", "visita", "orcamento"];
const AT_TIPO = {
  visita: { label: "Visita ao salão", icon: "map-pin" },
  evento: { label: "Festa no salão", icon: "party-popper" },
  outro: { label: "Falar com a equipe", icon: "message-circle" }
};
const AT_SERVICOS = [{ id: "salao", label: "Salão" }, { id: "buffet", label: "Buffet" }, { id: "doces", label: "Doces e salgados" }];
const AT_CANAIS = ["WhatsApp", "Instagram", "Telefone", "Na loja", "Indicação", "Outro"];
const AT_MEIOS = ["Pix", "Dinheiro", "Cartão", "Transferência", "Boleto"];
const AT_MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const AT_DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const atBrl = c => "R$ " + ((Number(c) || 0) / 100).toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
/* "1.500,00", "1500,00" e "1500.50" valem; com vírgula, o ponto é de milhar. */
const atNum = v => { const t = String(v || "").trim(); return Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t) || 0; };
const atReais = c => c ? (c / 100).toFixed(2).replace(".", ",") : "";
const atQuando = iso => !iso ? "" : new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", " ·");
const atDataCurta = d => d ? `${d.slice(8, 10)}/${d.slice(5, 7)}` : "";
const atDiaSemana = d => AT_DIAS[new Date(d + "T12:00:00").getDay()];
const atDiasAte = (d, hoje) => Math.round((new Date(d + "T12:00:00") - new Date(hoje + "T12:00:00")) / 864e5);
const atFalta = n => n === 0 ? "hoje" : n === 1 ? "amanhã" : n > 1 ? `em ${n} dias` : n === -1 ? "ontem" : `há ${-n} dias`;
const atWhats = tel => { const d = window.telDigitos(tel); return `https://wa.me/${d.length <= 11 ? "55" : ""}${d}`; };
const atPrimeiro = nome => String(nome || "").trim().split(/\s+/)[0] || "Sem nome";
const atNome = a => a.nome || (a.tel ? window.fmtTel(window.telDigitos(a.tel)) : "Cliente sem nome");
const atServicos = f => (f && f.servicos || []).map(s => (AT_SERVICOS.find(x => x.id === s) || {}).label).filter(Boolean);
/* Quanto já entrou de cada festa, a partir das entradas do Financeiro. */
const atPagamentos = (fin, id) => (fin || []).filter(x => x.tipo === "transacao" && x.entrada && x.festaId === id)
  .sort((a, b) => (a.data || "").localeCompare(b.data || ""));
const atPago = (fin, id) => atPagamentos(fin, id).reduce((s, x) => s + (x.valor || 0), 0);
/* Duas festas fechadas no mesmo dia: a tela avisa (o salão é um só), mas não impede. */
const atMesmoDia = (todos, a, data) => !data ? [] : todos.filter(x => x.id !== a.id && ["fechada", "realizada"].includes(x.etapa) && x.festa && x.festa.data === data);

const atRotulo = { fontSize: "var(--fs-micro)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)" };
const atTitulo = t => <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>{t}</div>;

function AtTexto({ value, onChange, placeholder, rows = 3, ...rest }) {
  const [foco, setFoco] = React.useState(false);
  return <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} {...rest}
    onFocus={() => setFoco(true)} onBlur={() => setFoco(false)}
    style={{ width: "100%", boxSizing: "border-box", resize: "vertical", padding: "9px 11px", borderRadius: "var(--radius-xs)",
      border: `var(--border-hairline) solid ${foco ? "var(--color-accent)" : "var(--color-border)"}`, boxShadow: foco ? "var(--focus-ring)" : "none",
      background: "var(--color-surface)", color: "var(--text-strong)", fontFamily: "var(--font-ui)", fontSize: "var(--fs-body-s)",
      lineHeight: "var(--lh-snug)", outline: "none", transition: "var(--transition-control)" }} />;
}

/* A faixa do funil: cada etapa com quantos estão nela. Clicar filtra a lista. */
function AtFunil({ todos, filtro, onFiltro, compact }) {
  const conta = id => todos.filter(a => a.etapa === id).length;
  const passo = (e, i) => {
    const on = filtro === e.id, n = conta(e.id);
    return (
      <button key={e.id} type="button" aria-pressed={on} onClick={() => onFiltro(on ? "abertas" : e.id)} style={{
        flex: compact ? "0 0 auto" : "1 1 0", minWidth: compact ? 118 : 0, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6,
        padding: "12px 14px", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-ui)", position: "relative",
        background: on ? "var(--color-accent-soft)" : "var(--color-surface)",
        border: `var(--border-hairline) solid ${on ? "var(--color-accent)" : "var(--color-border)"}`,
        borderRadius: "var(--radius-sm)", color: "var(--text-strong)", transition: "var(--transition-control)"
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--fs-tiny)", fontWeight: "var(--fw-semibold)", color: on ? "var(--text-accent)" : "var(--text-muted)", whiteSpace: "nowrap" }}>
          <AT.Icon name={e.icon} size={14} />{e.label}
        </span>
        <span style={{ fontSize: "var(--fs-heading)", fontWeight: "var(--fw-bold)", lineHeight: 1, fontVariantNumeric: "tabular-nums",
          color: n ? (on ? "var(--text-accent)" : "var(--text-strong)") : "var(--text-muted)" }}>{n}</span>
        {i < AT_ETAPAS.length - 1 && !compact ? <span aria-hidden="true" style={{ position: "absolute", right: -11, top: "50%", transform: "translateY(-50%)", zIndex: 1, color: "var(--text-muted)",
          background: "var(--color-bg, var(--color-surface-2))", borderRadius: "var(--radius-pill)", display: "flex" }}><AT.Icon name="chevron-right" size={14} /></span> : null}
      </button>
    );
  };
  return (
    <div style={{ display: "flex", gap: compact ? 6 : 10, overflowX: compact ? "auto" : "visible", scrollbarWidth: "none", paddingBottom: compact ? 2 : 0 }}>
      {AT_ETAPAS.map(passo)}
    </div>
  );
}

/* Cartão de uma festa fechada que vem aí: a data é o que mais importa, então ela manda. */
function AtProximaFesta({ a, fin, hoje, onAbrir }) {
  const f = a.festa, pago = atPago(fin, a.id), dias = atDiasAte(f.data, hoje);
  const pct = f.valor ? Math.min(100, Math.round(pago / f.valor * 100)) : 0;
  const contrato = !a.contrato ? { t: "Sem contrato", tom: "warn", i: "file-warning" }
    : a.contrato.status === "Finalizado" ? { t: "Contrato pronto", tom: "success", i: "file-check" } : { t: "Contrato em rascunho", tom: "neutral", i: "file-pen" };
  return (
    <button type="button" onClick={onAbrir} data-row-action="" style={{
      display: "flex", gap: 14, alignItems: "stretch", padding: 14, textAlign: "left", cursor: "pointer", width: "100%",
      background: "var(--color-surface)", border: "var(--border-hairline) solid var(--color-border)", borderRadius: "var(--radius-md)",
      fontFamily: "var(--font-ui)", color: "var(--text-strong)", transition: "var(--transition-control)", minWidth: 0
    }}>
      <span style={{ flex: "0 0 auto", width: 64, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
        borderRadius: "var(--radius-sm)", background: dias <= 7 ? "var(--color-accent-strong)" : "var(--color-surface-3)",
        color: dias <= 7 ? "var(--color-accent-contrast)" : "var(--text-strong)", padding: "8px 0" }}>
        <span style={{ fontSize: "var(--fs-micro)", fontWeight: "var(--fw-semibold)", textTransform: "uppercase", letterSpacing: "var(--ls-label)", opacity: .85 }}>{AT_MESES[Number(f.data.slice(5, 7)) - 1]}</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: "var(--fw-semibold)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{Number(f.data.slice(8, 10))}</span>
        <span style={{ fontSize: "var(--fs-micro)", opacity: .85 }}>{atDiaSemana(f.data).slice(0, 3)}</span>
      </span>
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 5 }}>
        <span style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-semibold)", overflowWrap: "anywhere" }}>{atNome(a)}</span>
          <span style={{ fontSize: "var(--fs-tiny)", fontWeight: "var(--fw-semibold)", color: dias <= 7 ? "var(--text-accent)" : "var(--text-muted)" }}>{atFalta(dias)}</span>
        </span>
        <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", lineHeight: "var(--lh-snug)" }}>
          {[f.tipoEvento, f.inicio ? f.inicio + (f.fim ? "–" + f.fim : "") : null, f.convidados ? f.convidados + " convidados" : null, atServicos(f).join(" + ")].filter(Boolean).join(" · ")}
        </span>
        <span style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 2 }}>
          <span style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: "var(--fs-tiny)", fontVariantNumeric: "tabular-nums" }}>
            <span style={{ color: "var(--text-body)", minWidth: 0 }}>{f.valor ? <>{atBrl(pago)} <span style={{ color: "var(--text-muted)" }}>de {atBrl(f.valor)}</span></> : "Valor não combinado"}</span>
            {f.valor ? <span style={{ fontWeight: "var(--fw-semibold)", whiteSpace: "nowrap", color: pago >= f.valor ? "var(--action-paid)" : "var(--text-strong)" }}>{pago >= f.valor ? "Pago" : "Falta " + atBrl(f.valor - pago)}</span> : null}
          </span>
          {f.valor ? <span aria-hidden="true" style={{ height: 4, borderRadius: 2, background: "var(--color-surface-3)", overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", width: pct + "%", background: pago >= f.valor ? "var(--action-paid)" : "var(--color-accent)", borderRadius: 2 }} />
          </span> : null}
        </span>
        <span style={{ marginTop: 2 }}><AT.Badge tone={contrato.tom} icon={contrato.i}>{contrato.t}</AT.Badge></span>
      </span>
    </button>
  );
}

function AtNovoModal({ onClose, onSalvar, pendente }) {
  const [v, setV] = React.useState({ nome: "", telefone: "", canal: "WhatsApp", tipo: "evento", data: "", pessoas: "", obs: "" });
  const [erro, setErro] = React.useState("");
  const set = k => e => setV({ ...v, [k]: e.target.value });
  const salvar = () => {
    const tel = String(v.telefone).replace(/\D/g, "");
    if (!v.nome.trim() && !tel) return setErro("Preencha o nome ou o telefone");
    if (tel && tel.length < 10) return setErro("Telefone com DDD");
    setErro(""); onSalvar({ ...v, nome: v.nome.trim(), telefone: tel });
  };
  return (
    <AT.Modal width={520} title="Novo atendimento" subtitle="Quem ligou, veio na loja ou chamou no Instagram" onClose={onClose}
      footer={<>
        <AT.Button variant="ghost" block onClick={onClose}>Voltar</AT.Button>
        <AT.Button block icon="plus" loading={pendente === "at:novo"} onClick={salvar}>Lançar atendimento</AT.Button>
      </>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px 12px" }}>
        <AT.Field label="Nome"><AT.Input value={v.nome} onChange={set("nome")} placeholder="Como a pessoa se chama" autoFocus /></AT.Field>
        <AT.Field label="Telefone" error={erro || null}><AT.Input value={v.telefone} onChange={set("telefone")} inputMode="tel" placeholder="(38) 99999-9999" /></AT.Field>
        <AT.Field label="Por onde chegou"><AT.Select options={AT_CANAIS} value={v.canal} onChange={set("canal")} /></AT.Field>
        <AT.Field label="O que quer"><AT.Select options={Object.keys(AT_TIPO).map(k => ({ value: k, label: AT_TIPO[k].label }))} value={v.tipo} onChange={set("tipo")} /></AT.Field>
        <AT.Field label="Quando"><AT.Input value={v.data} onChange={set("data")} placeholder="sábado, 20/12…" /></AT.Field>
        <AT.Field label="Pessoas"><AT.Input value={v.pessoas} onChange={set("pessoas")} inputMode="numeric" placeholder="80" /></AT.Field>
      </div>
      <div style={{ marginTop: 10 }}><AT.Field label="Observação"><AtTexto value={v.obs} onChange={set("obs")} rows={2} placeholder="Tema, se já conhece o salão…" /></AT.Field></div>
    </AT.Modal>
  );
}

function AtPagarModal({ falta, hoje, onClose, onSalvar, pendente }) {
  const [v, setV] = React.useState({ valor: atReais(falta), meio: "Pix", data: hoje });
  const [erro, setErro] = React.useState("");
  const salvar = () => {
    const c = Math.round(atNum(v.valor) * 100);
    if (c <= 0) return setErro("Informe o valor recebido");
    onSalvar({ valor: c, meio: v.meio, data: v.data });
  };
  return (
    <AT.Modal width={440} title="Registrar pagamento da festa" subtitle="Entra no Financeiro como entrada, ligado a esta festa" onClose={onClose}
      footer={<>
        <AT.Button variant="ghost" block onClick={onClose}>Voltar</AT.Button>
        <AT.Button block icon="check" loading={pendente === "at:pagar"} onClick={salvar}>Registrar</AT.Button>
      </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <AT.Field label="Valor recebido" error={erro || null}><AT.Input prefix="R$" inputMode="decimal" value={v.valor} onChange={e => setV({ ...v, valor: e.target.value })} autoFocus /></AT.Field>
        <AT.Field label="Como pagou"><AT.Select options={AT_MEIOS} value={v.meio} onChange={e => setV({ ...v, meio: e.target.value })} /></AT.Field>
        <AT.Field label="Data"><AT.Input type="date" value={v.data} onChange={e => setV({ ...v, data: e.target.value })} /></AT.Field>
      </div>
    </AT.Modal>
  );
}

function AtPerdidaModal({ onClose, onSalvar, pendente }) {
  const [motivo, setMotivo] = React.useState("");
  const atalhos = ["Achou mais barato", "Data ocupada", "Desistiu da festa", "Não respondeu mais"];
  return (
    <AT.Modal width={460} title="Marcar como perdida?" subtitle="Sai do funil. Dá para reabrir depois." onClose={onClose}
      footer={<>
        <AT.Button variant="ghost" block onClick={onClose}>Voltar</AT.Button>
        <AT.Button block tone="danger" icon="circle-x" loading={pendente === "at:etapa"} onClick={() => onSalvar(motivo.trim())}>Sim, marcar perdida</AT.Button>
      </>}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {atalhos.map(t => <AT.FilterPill key={t} trailingIcon={null} active={motivo === t} onClick={() => setMotivo(t)}>{t}</AT.FilterPill>)}
      </div>
      <AT.Field label="Motivo (opcional)"><AtTexto rows={2} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Por que não fechou" /></AT.Field>
    </AT.Modal>
  );
}

/* Etapas da ficha: onde está, por onde passou, e o próximo passo como botão principal. */
function AtEtapas({ a, onMover, onPerdida, pendente, compact }) {
  const i = AT_ETAPAS.findIndex(e => e.id === a.etapa);
  const perdida = a.etapa === "perdida";
  const prox = !perdida && i >= 0 && i < AT_ETAPAS.length - 1 ? AT_ETAPAS[i + 1] : null;
  /* No celular a faixa rola: a etapa atual fica sempre à vista. */
  const faixa = React.useRef(null);
  React.useEffect(() => {
    const el = faixa.current, b = el && el.querySelector('[aria-current="step"]');
    if (b && el.scrollWidth > el.clientWidth) el.scrollLeft = b.offsetLeft - (el.clientWidth - b.offsetWidth) / 2;
  }, [a.etapa]);
  return (
    <AT.Card>
      <div ref={faixa} style={{ display: "flex", gap: compact ? 4 : 6, overflowX: "auto", scrollbarWidth: "none", position: "relative" }} role="group" aria-label="Etapas do atendimento">
        {AT_ETAPAS.map((e, k) => {
          const atual = e.id === a.etapa, feito = !perdida && k < i;
          return (
            <button key={e.id} type="button" aria-current={atual ? "step" : undefined} title={atual ? undefined : "Mover para " + e.um}
              disabled={atual || pendente === "at:etapa"} onClick={() => onMover(e.id)} style={{
                flex: compact ? "0 0 auto" : "1 1 0", display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", minWidth: 0,
                borderRadius: "var(--radius-pill)", cursor: atual ? "default" : "pointer", fontFamily: "var(--font-ui)",
                fontSize: "var(--fs-tiny)", fontWeight: "var(--fw-semibold)", whiteSpace: "nowrap", justifyContent: "center",
                background: atual ? "var(--color-accent-strong)" : feito ? "var(--color-accent-soft)" : "transparent",
                color: atual ? "var(--color-accent-contrast)" : feito ? "var(--text-accent)" : "var(--text-muted)",
                border: `var(--border-hairline) solid ${atual || feito ? "transparent" : "var(--color-border)"}`,
                transition: "var(--transition-control)"
              }}>
              <AT.Icon name={feito ? "check" : e.icon} size={14} />{e.um}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
        {perdida ? <>
          <AT.Badge tone="danger" icon="circle-x">Perdida{a.motivoPerda ? " · " + a.motivoPerda : ""}</AT.Badge>
          <div style={{ flex: 1 }} />
          <AT.Button size="sm" icon="rotate-ccw" loading={pendente === "at:etapa"} onClick={() => onMover("conversando")}>Reabrir</AT.Button>
        </> : <>
          {prox ? <AT.Button size="sm" icon="arrow-right" loading={pendente === "at:etapa"} onClick={() => onMover(prox.id)}>{atEtapa(a.etapa).proxima}</AT.Button>
            : <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>Festa concluída.</span>}
          <div style={{ flex: 1 }} />
          {a.etapa !== "realizada" ? <AT.Button size="sm" variant="ghost" icon="circle-x" onClick={onPerdida}>Não fechou</AT.Button> : null}
        </>}
      </div>
    </AT.Card>
  );
}

/* Dados da festa: edita direto, e um botão salvar aparece quando algo mudou. */
function AtFestaForm({ a, todos, onSalvar, pendente, compact }) {
  const base = () => {
    const f = a.festa || {};
    return { data: f.data || "", inicio: f.inicio || "", fim: f.fim || "", tipoEvento: f.tipoEvento || "", convidados: f.convidados ? String(f.convidados) : (/^\d+$/.test(a.pessoas || "") ? a.pessoas : ""),
      servicos: f.servicos && f.servicos.length ? f.servicos : (a.tipo !== "outro" ? ["salao"] : []), local: f.local || "", valor: atReais(f.valor), visitaEm: a.visitaEm || "" };
  };
  const [v, setV] = React.useState(base);
  const chave = JSON.stringify([a.festa, a.visitaEm]);
  React.useEffect(() => setV(base()), [chave]);
  const mudou = JSON.stringify(v) !== JSON.stringify(base());
  const set = k => e => setV({ ...v, [k]: e.target.value });
  const choque = atMesmoDia(todos, a, v.data);
  const togg = s => setV({ ...v, servicos: v.servicos.includes(s) ? v.servicos.filter(x => x !== s) : [...v.servicos, s] });
  const salvar = () => onSalvar({
    festa: { data: v.data, inicio: v.inicio, fim: v.fim, tipoEvento: v.tipoEvento.trim(), convidados: v.convidados ? Number(v.convidados) : null,
      servicos: v.servicos, local: v.local.trim(), valor: Math.round(atNum(v.valor) * 100) },
    visitaEm: v.visitaEm
  });
  const g2 = { display: "grid", gridTemplateColumns: compact ? "minmax(0,1fr) minmax(0,1fr)" : "repeat(3, minmax(0,1fr))", gap: "10px 12px" };
  return (
    <AT.Card header={<>
      {atTitulo("A festa")}
      {mudou ? <AT.Button size="sm" icon="check" loading={pendente === "at:festa"} onClick={salvar}>Salvar</AT.Button>
        : <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>{a.festa && a.festa.data ? "Salvo" : "Preencha para fechar"}</span>}
    </>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={g2}>
          <AT.Field label="Data" style={{ gridColumn: compact ? "span 2" : undefined }}><AT.Input type="date" value={v.data} onChange={set("data")} invalid={choque.length > 0} /></AT.Field>
          <AT.Field label="Início"><AT.Input type="time" value={v.inicio} onChange={set("inicio")} /></AT.Field>
          <AT.Field label="Término"><AT.Input type="time" value={v.fim} onChange={set("fim")} /></AT.Field>
        </div>
        {choque.length ? <div role="status" style={{ display: "flex", gap: 8, alignItems: "center", padding: "9px 12px", borderRadius: "var(--radius-sm)",
          background: "var(--action-warn-bg)", color: "var(--action-warn)", fontSize: "var(--fs-tiny)", fontWeight: "var(--fw-semibold)" }}>
          <AT.Icon name="triangle-alert" size={15} />Já tem festa fechada nesse dia: {choque.map(atNome).join(", ")}
        </div> : null}
        <div style={g2}>
          <AT.Field label="Tipo de festa" style={{ gridColumn: compact ? "span 2" : undefined }}><AT.Input value={v.tipoEvento} onChange={set("tipoEvento")} placeholder="Aniversário de 15 anos" /></AT.Field>
          <AT.Field label="Convidados"><AT.Input inputMode="numeric" value={v.convidados} onChange={e => setV({ ...v, convidados: e.target.value.replace(/\D/g, "") })} placeholder="80" /></AT.Field>
          <AT.Field label="Valor combinado"><AT.Input prefix="R$" inputMode="decimal" value={v.valor} onChange={set("valor")} placeholder="0,00" /></AT.Field>
        </div>
        <div>
          <div style={{ ...atRotulo, marginBottom: 6 }}>O que a festa leva</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {AT_SERVICOS.map(s => <AT.FilterPill key={s.id} trailingIcon={null} icon={v.servicos.includes(s.id) ? "check" : undefined} active={v.servicos.includes(s.id)} onClick={() => togg(s.id)}>{s.label}</AT.FilterPill>)}
          </div>
        </div>
        <div style={g2}>
          {!v.servicos.includes("salao") ? <AT.Field label="Local" style={{ gridColumn: compact ? "span 2" : "span 2" }}><AT.Input value={v.local} onChange={set("local")} placeholder="Onde vai ser" /></AT.Field> : null}
          <AT.Field label="Visita ao salão" style={{ gridColumn: compact ? "span 2" : undefined }}><AT.Input type="datetime-local" value={v.visitaEm} onChange={set("visitaEm")} /></AT.Field>
        </div>
      </div>
    </AT.Card>
  );
}

function AtDinheiro({ a, fin, onPagar, onApagar, pendente }) {
  const f = a.festa || {}, lista = atPagamentos(fin, a.id), pago = lista.reduce((s, x) => s + (x.valor || 0), 0);
  const falta = Math.max(0, (f.valor || 0) - pago);
  return (
    <AT.Card header={<>{atTitulo("Dinheiro")}<AT.Button size="sm" variant="ghost" icon="plus" onClick={() => onPagar(falta)}>Registrar pagamento</AT.Button></>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}>
        {[["Combinado", f.valor ? atBrl(f.valor) : "—", "var(--text-strong)"], ["Recebido", atBrl(pago), "var(--action-paid)"],
          ["Falta", f.valor ? atBrl(falta) : "—", falta ? "var(--text-strong)" : "var(--text-muted)"]].map(([r, val, cor]) => (
          <div key={r} style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", background: "var(--color-surface-2)", minWidth: 0 }}>
            <div style={atRotulo}>{r}</div>
            <div style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-bold)", color: cor, marginTop: 4, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{val}</div>
          </div>
        ))}
      </div>
      {lista.length ? <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 10 }}>
        {lista.map(x => <AT.ListRow key={x.id} icon="arrow-down-left" title={atBrl(x.valor)} subtitle={`${x.meio || ""} · ${atDataCurta(x.data)}`} tone="in"
          trailing={<AT.IconButton icon="trash-2" label="Apagar pagamento" size={34} disabled={pendente === "at:apagar:" + x.id} onClick={() => onApagar(x)} />} />)}
      </div> : <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 10 }}>Nenhum pagamento ainda. O que entrar aqui aparece no Financeiro.</div>}
    </AT.Card>
  );
}

function AtContratoCard({ a, onAbrir }) {
  const c = a.contrato;
  const modelo = c ? (c.tipo === "buffet" ? "Buffet" : "Locação do salão") : null;
  return (
    <AT.Card header={atTitulo("Contrato")}>
      {c ? <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <AT.Icon name={c.status === "Finalizado" ? "file-check" : "file-pen"} size={20} color={c.status === "Finalizado" ? "var(--action-paid)" : "var(--text-muted)"} />
        <div style={{ flex: 1, minWidth: 140 }}>
          <div style={{ fontWeight: "var(--fw-semibold)" }}>{modelo}</div>
          <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>{c.status === "Finalizado" ? "Finalizado" : "Rascunho"}{c.atualizadoEm ? " · " + atQuando(c.atualizadoEm) : ""}</div>
        </div>
        <AT.Button size="sm" variant={c.status === "Finalizado" ? "ghost" : "solid"} icon={c.status === "Finalizado" ? "eye" : "pencil"} onClick={onAbrir}>{c.status === "Finalizado" ? "Abrir" : "Continuar"}</AT.Button>
      </div> : <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ flex: 1, minWidth: 160, fontSize: "var(--fs-tiny)", color: "var(--text-muted)", lineHeight: "var(--lh-snug)" }}>O contrato já sai com o nome, a data, o horário e o valor da festa.</span>
        <AT.Button size="sm" icon="file-plus" onClick={onAbrir}>Fazer contrato</AT.Button>
      </div>}
    </AT.Card>
  );
}

function AtEncomendas({ a, pedidos, onLigar, onAbrirPedido, pendente }) {
  const [num, setNum] = React.useState("");
  const porId = new Map((pedidos || []).map(p => [p.id, p]));
  const tel = window.telDigitos(a.tel);
  /* Sugere pedidos do mesmo telefone com entrega perto da data da festa. */
  const sugestoes = !tel || !a.festa || !a.festa.data ? [] : (pedidos || []).filter(p => !a.pedidos.includes(p.id) && p.status !== "Cancelado"
    && window.telDigitos(p.tel) === tel && p.data && Math.abs(atDiasAte(p.data, a.festa.data)) <= 3).slice(0, 3);
  const ligar = lista => onLigar(lista);
  const add = () => { const n = num.trim().toUpperCase(); if (!n) return; ligar([...a.pedidos, /^\d+$/.test(n) ? "PED-" + n : n]); setNum(""); };
  return (
    <AT.Card header={atTitulo("Encomendas da festa")}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {a.pedidos.map(id => {
          const p = porId.get(id);
          return <AT.ListRow key={id} icon="cake-slice" title={id} subtitle={p ? `${p.itens.map(i => i.qty + " " + i.name).join(" · ")}` : "Pedido fora da lista recente"}
            value={p ? <AT.StatusBadge status={p.status} short /> : null} valueSub={p ? p.total : null}
            onClick={() => onAbrirPedido(id)}
            trailing={<AT.IconButton icon="unlink" label={"Desligar " + id} size={34} disabled={pendente === "at:pedidos"} onClick={e => { e.stopPropagation(); ligar(a.pedidos.filter(x => x !== id)); }} />} />;
        })}
        {sugestoes.map(p => <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: "var(--radius-sm)", border: "var(--border-hairline) dashed var(--color-border)", fontSize: "var(--fs-tiny)" }}>
          <AT.Icon name="sparkles" size={15} color="var(--text-accent)" />
          <span style={{ flex: 1, minWidth: 0 }}><b>{p.id}</b> · {atDataCurta(p.data)} · {p.total} — mesmo telefone, perto da data</span>
          <AT.Button size="sm" variant="ghost" onClick={() => ligar([...a.pedidos, p.id])}>Ligar</AT.Button>
        </div>)}
        <div style={{ display: "flex", gap: 8 }}>
          <AT.Input size="sm" value={num} onChange={e => setNum(e.target.value)} placeholder="Número do pedido (PED-3001)" style={{ flex: 1 }}
            onKeyDown={e => { if (e.key === "Enter") add(); }} />
          <AT.Button size="sm" variant="ghost" icon="link" loading={pendente === "at:pedidos"} onClick={add}>Ligar</AT.Button>
        </div>
      </div>
    </AT.Card>
  );
}

/* Anotações e mudanças de etapa numa linha do tempo só, mais nova em cima. */
function AtHistorico({ a, onAnotar, pendente }) {
  const [t, setT] = React.useState("");
  const quem = p => p === "sofia" ? "Sofia" : String(p || "").split("@")[0];
  const linhas = [
    ...a.notas.map(n => ({ em: n.em, icon: "notebook-pen", texto: n.texto, quem: quem(n.por), nota: true })),
    ...a.historico.map(h => ({ em: h.em, icon: atEtapa(h.para).icon, texto: (h.de ? "Foi para " : "Entrou como ") + atEtapa(h.para).um.toLowerCase() + (h.motivo ? " — " + h.motivo : ""), quem: quem(h.por) }))
  ].sort((x, y) => (y.em || "").localeCompare(x.em || ""));
  const enviar = async () => { if (t.trim() && await onAnotar(t.trim())) setT(""); };
  return (
    <AT.Card header={atTitulo("Anotações")}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <AtTexto rows={2} value={t} onChange={e => setT(e.target.value)} placeholder="O que foi combinado, o que falta, gosto da cliente…" />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <AT.Button size="sm" variant="ghost" icon="plus" disabled={!t.trim()} loading={pendente === "at:nota"} onClick={enviar}>Anotar</AT.Button>
        </div>
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
          {linhas.map((l, i) => (
            <li key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderTop: i ? "var(--border-hairline) solid var(--color-border-soft)" : "none" }}>
              <AT.Icon name={l.icon} size={15} color={l.nota ? "var(--text-accent)" : "var(--text-muted)"} style={{ marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: l.nota ? "var(--fs-body-s)" : "var(--fs-tiny)", color: l.nota ? "var(--text-strong)" : "var(--text-body)", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{l.texto}</div>
                <div style={{ fontSize: "var(--fs-micro)", color: "var(--text-muted)", marginTop: 2 }}>{[l.quem, atQuando(l.em)].filter(Boolean).join(" · ")}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </AT.Card>
  );
}

/* O contrato da festa: o mesmo editor de Financeiro → Contratos, mas gravado no servidor junto
   com a festa. Ao criar, já vem preenchido com o que a ficha tem (ctDaFesta, em Contratos.jsx). */
function AtContratoFesta({ a, pago, compact, onBack, onToast, escrever }) {
  const [c, setC] = React.useState(() => a.contrato ? window.ctMesclar(a.contrato) : window.ctDaFesta(a, pago));
  const [estado, setEstado] = React.useState(a.contrato ? "salvo" : "novo");
  const [quando, setQuando] = React.useState(a.contrato && a.contrato.atualizadoEm ? atQuando(a.contrato.atualizadoEm) : "");
  const timer = React.useRef(null), ultimo = React.useRef(c);
  const gravar = async (dados) => {
    setEstado("salvando");
    try { await escrever(dados); setEstado("salvo"); setQuando(atQuando(new Date().toISOString())); }
    catch (e) { setEstado("erro"); }
  };
  React.useEffect(() => { if (!a.contrato) gravar(c); return () => clearTimeout(timer.current); }, []);
  const mudar = patch => {
    const novo = { ...ultimo.current, ...patch };
    ultimo.current = novo; setC(novo); setEstado("salvando");
    clearTimeout(timer.current);
    /* Finalizar grava na hora; digitação espera uma pausa. */
    timer.current = setTimeout(() => gravar(ultimo.current), patch.status ? 0 : 900);
  };
  const sair = () => { if (timer.current) { clearTimeout(timer.current); if (estado === "salvando") gravar(ultimo.current); } onBack(); };
  const salvoTexto = estado === "erro" ? null : estado === "salvando" || estado === "novo" ? "Salvando…" : "Salvo" + (quando ? " · " + quando : "");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      <window.ContratoEditor contrato={{ ...c, atualizado: quando }} compact={compact} onChange={mudar} onBack={sair} onToast={onToast}
        voltar={atPrimeiro(a.nome) === "Sem nome" ? "Ficha" : "Festa de " + atPrimeiro(a.nome)} salvoTexto={salvoTexto}
        erroSalvar={estado === "erro" ? "Não salvou. Confira a internet; a próxima mudança tenta de novo." : null} />
    </div>
  );
}

function AtFicha({ a, todos, fin, pedidos, hoje, compact, onBack, acao, pendente, showToast, carga, finCarga, onView, onQ }) {
  DS_VOLTAR(true, onBack);
  const [modal, setModal] = React.useState(null);
  const [contrato, setContrato] = React.useState(false);
  const atualizar = patch => carga.setDados(l => l.map(x => x.id === a.id ? { ...x, ...patch } : x));
  const agoraIso = () => new Date().toISOString();

  const mover = (etapa, motivo) => {
    if (["fechada", "realizada"].includes(etapa) && !(a.festa && a.festa.data)) { showToast("Preencha a data da festa antes de fechar", "danger"); return; }
    return acao("at:etapa", { ok: etapa === "perdida" ? "Marcada como perdida" : "Foi para " + atEtapa(etapa).um.toLowerCase(), falhou: "Não deu para mudar a etapa" },
      () => { atualizar({ etapa, motivoPerda: etapa === "perdida" ? motivo || "" : a.motivoPerda, historico: [...a.historico, { de: a.etapa, para: etapa, por: "você", em: agoraIso(), motivo: motivo || "" }] }); setModal(null); },
      { acao: "moverAtendimento", dados: { id: a.id, etapa, motivo: motivo || "" } });
  };
  const salvarFesta = dados => acao("at:festa", { ok: "Festa salva", falhou: "Não deu para salvar" },
    () => atualizar({ festa: dados.festa, visitaEm: dados.visitaEm }), { acao: "salvarAtendimento", dados: { id: a.id, ...dados } });
  const ligar = lista => acao("at:pedidos", { ok: "Encomendas atualizadas", falhou: "Não deu para ligar" },
    () => atualizar({ pedidos: lista }), { acao: "salvarAtendimento", dados: { id: a.id, pedidos: lista } });
  const anotar = texto => acao("at:nota", { ok: "Anotado", falhou: "Não deu para anotar" },
    () => atualizar({ notas: [...a.notas, { texto, por: "você", em: agoraIso() }] }), { acao: "anotarAtendimento", dados: { id: a.id, texto } });
  const pagar = d => acao("at:pagar", { ok: "Pagamento registrado", falhou: "Não deu para registrar" }, null,
    { acao: "pagarFesta", dados: { id: a.id, ...d } }).then(r => {
      if (!r) return;
      const novo = { id: (r && r.id) || "tmp" + Date.now(), tipo: "transacao", desc: "Festa — " + atNome(a), entrada: true, festaId: a.id, ...d };
      finCarga.setDados(l => (l || []).some(x => x.id === novo.id) ? l : [...(l || []), novo]);
      setModal(null);
    });
  const apagarPag = x => acao("at:apagar:" + x.id, { ok: "Pagamento apagado", falhou: "Não deu para apagar" },
    () => { finCarga.setDados(l => (l || []).filter(y => y.id !== x.id)); setModal(null); }, { acao: "apagarFinanceiro", dados: { id: x.id } });

  if (contrato) return <AtContratoFesta a={a} pago={atPago(fin, a.id)} compact={compact} onToast={showToast} onBack={() => setContrato(false)}
    escrever={async c => {
      const r = await window.DLUH_API.escrever("at:contrato", { acao: "salvarContratoFesta", dados: { id: a.id, contrato: c } });
      atualizar({ contrato: { ...c, atualizadoEm: agoraIso() } });
      return r;
    }} />;

  const t = AT_TIPO[a.tipo] || AT_TIPO.outro;
  const origem = a.origem === "equipe" ? "Lançado pela equipe" + (a.canal ? " · " + a.canal : "") : "Pela Sofia no WhatsApp";
  const lado = { display: "flex", flexDirection: "column", gap: 12, minWidth: 0 };
  const pediu = [["calendar-days", "Quando quer", a.data], ["users", "Pessoas", a.pessoas], ["notebook-pen", "Observação", a.obs]].filter(x => x[2]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      <div style={{ display: "flex", gap: "var(--gap-inline)", alignItems: "center", flexWrap: "wrap" }}>
        <AT.Button size="sm" variant="ghost" icon="arrow-left" onClick={onBack}>Atendimentos</AT.Button>
        <div style={{ flex: 1 }} />
        {a.tel ? <AT.Button size="sm" variant="ghost" icon="message-circle" onClick={() => window.open(atWhats(a.tel), "_blank", "noopener")}>WhatsApp</AT.Button> : null}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--fs-display, 28px)", fontWeight: "var(--fw-semibold)", lineHeight: 1.15, overflowWrap: "anywhere" }}>{atNome(a)}</h2>
          <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 6, lineHeight: "var(--lh-snug)" }}>
            <AT.Icon name={t.icon} size={13} style={{ display: "inline-block", verticalAlign: "-2px", marginRight: 5 }} />{t.label} · {origem} · {atQuando(a.criadoEm)}
            {a.tel ? <> · {window.fmtTel(window.telDigitos(a.tel))}</> : null}
          </div>
        </div>
        {a.festa && a.festa.data ? <AT.Badge tone={AT_TOM[a.etapa]} icon="calendar-heart">{atDiaSemana(a.festa.data)}, {atDataCurta(a.festa.data)} · {atFalta(atDiasAte(a.festa.data, hoje))}</AT.Badge> : null}
      </div>

      <AtEtapas a={a} compact={compact} pendente={pendente} onMover={e => mover(e)} onPerdida={() => setModal({ tipo: "perdida" })} />

      <div style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0,1fr)" : "minmax(0,1.25fr) minmax(0,1fr)", gap: 12, alignItems: "start" }}>
        <div style={lado}>
          <AtFestaForm a={a} todos={todos} compact={compact} pendente={pendente} onSalvar={salvarFesta} />
          <AtEncomendas a={a} pedidos={pedidos} pendente={pendente} onLigar={ligar} onAbrirPedido={id => { onQ && onQ(id); onView && onView("pedidos"); }} />
        </div>
        <div style={lado}>
          <AtDinheiro a={a} fin={fin} pendente={pendente} onPagar={falta => setModal({ tipo: "pagar", falta })} onApagar={x => setModal({ tipo: "apagar", x })} />
          <AtContratoCard a={a} onAbrir={() => setContrato(true)} />
          {pediu.length ? <AT.Card header={atTitulo(a.origem === "equipe" ? "O que a pessoa pediu" : "O que a Sofia anotou")}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {pediu.map(([i, r, val]) => <AT.ListRow key={r} icon={i} title={val} subtitle={r} />)}
            </div>
            {a.origem !== "equipe" && AT_ABERTAS.includes(a.etapa) ? <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 8, lineHeight: "var(--lh-snug)" }}>
              A conversa fica em espera no GPTMaker. Depois de responder pelo WhatsApp da loja, mande #sofia para a Sofia voltar.
            </div> : null}
          </AT.Card> : null}
          <AtHistorico a={a} pendente={pendente} onAnotar={anotar} />
        </div>
      </div>

      {modal && modal.tipo === "perdida" ? <AtPerdidaModal pendente={pendente} onClose={() => setModal(null)} onSalvar={m => mover("perdida", m)} /> : null}
      {modal && modal.tipo === "pagar" ? <AtPagarModal falta={modal.falta} hoje={hoje} pendente={pendente} onClose={() => setModal(null)} onSalvar={pagar} /> : null}
      {modal && modal.tipo === "apagar" ? <AT.ConfirmDialog tone="danger" icon="trash-2" title="Apagar pagamento?" cancelLabel="Voltar" confirmLabel="Sim, apagar"
        message={`O pagamento de ${atBrl(modal.x.valor)} sai da festa e do Financeiro.`} onCancel={() => setModal(null)} onConfirm={() => apagarPag(modal.x)} /> : null}
    </div>
  );
}
const DS_VOLTAR = (ativo, fn) => AT.useVoltar(ativo, fn);

function Atendimentos({ compact, alvo, onView, onQ }) {
  const carga = useAoVivo("atendimentos");
  const fin = useAoVivo("financeiro");
  const peds = useAoVivo("pedidos");
  const hoje = window.DLUH_API.hoje();
  const [filtro, setFiltro] = React.useState("abertas");
  const [aberto, setAberto] = React.useState(() => alvo && alvo.festa || null);
  React.useEffect(() => { if (alvo && alvo.festa) setAberto(alvo.festa); }, [alvo]);
  const [novo, setNovo] = React.useState(false);
  const [toastNode, showToast] = useToast();
  const [acao, pendente] = useAcao(showToast);

  if (carga.estado === "erro" && !carga.dados) return <ErroCarga erro={carga.erro} oque="os atendimentos" onTentar={carga.tentar} />;
  if (!carga.dados) return <Carregando oque="os atendimentos" />;

  const todos = carga.dados;
  const atual = aberto && todos.find(a => a.id === aberto);
  if (atual) return <>
    <AtFicha a={atual} todos={todos} fin={fin.dados} pedidos={peds.dados} hoje={hoje} compact={compact} onBack={() => setAberto(null)}
      acao={acao} pendente={pendente} showToast={showToast} carga={carga} finCarga={fin} onView={onView} onQ={onQ} />
    {toastNode}
  </>;

  const proximas = todos.filter(a => a.etapa === "fechada" && a.festa && a.festa.data >= hoje)
    .sort((x, y) => (x.festa.data + x.festa.inicio).localeCompare(y.festa.data + y.festa.inicio));
  const paraLista = filtro === "abertas" ? todos.filter(a => AT_ABERTAS.includes(a.etapa)) : todos.filter(a => a.etapa === filtro);
  /* Abertas: quem espera resposta primeiro, depois o resto pela data da festa (ou de chegada). */
  const lista = paraLista.slice().sort((x, y) => (x.etapa === "novo" ? 0 : 1) - (y.etapa === "novo" ? 0 : 1)
    || (filtro === "fechada" || filtro === "realizada" ? ((filtro === "realizada" ? -1 : 1) * ((x.festa && x.festa.data || "9") .localeCompare(y.festa && y.festa.data || "9"))) : 0)
    || y.criadoEm.localeCompare(x.criadoEm));
  const novos = todos.filter(a => a.etapa === "novo").length;
  const nomeFiltro = filtro === "abertas" ? "Em aberto" : atEtapa(filtro).label;

  const lancar = v => acao("at:novo", { ok: "Atendimento lançado", falhou: "Não deu para lançar" }, null,
    { acao: "salvarAtendimento", dados: v }).then(r => {
      if (!r) return;
      const id = (r && r.id) || "tmp" + Date.now();
      carga.setDados(l => l.some(x => x.id === id) ? l : [{ id, tipo: v.tipo, nome: v.nome, tel: v.telefone, data: v.data, pessoas: v.pessoas, obs: v.obs, canal: v.canal,
        origem: "equipe", etapa: "novo", criadoEm: new Date().toISOString(), festa: null, contrato: null, pedidos: [], notas: [], historico: [{ para: "novo", por: "você", em: new Date().toISOString() }] }, ...l]);
      setNovo(false); setAberto(id);
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0, fontSize: "var(--fs-body-s)", color: "var(--text-body)" }}>
          {novos ? <><b style={{ color: "var(--text-strong)" }}>{novos} {novos === 1 ? "pessoa esperando" : "pessoas esperando"}</b> resposta · </> : null}
          {proximas.length ? `${proximas.length} ${proximas.length === 1 ? "festa fechada" : "festas fechadas"} pela frente` : "Nenhuma festa fechada pela frente"}
        </div>
        <AT.Button size="sm" icon="plus" onClick={() => setNovo(true)}>Novo atendimento</AT.Button>
      </div>

      <AtFunil todos={todos} filtro={filtro} onFiltro={setFiltro} compact={compact} />

      {proximas.length && filtro === "abertas" ? <section aria-label="Próximas festas" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--fs-heading)", fontWeight: "var(--fw-semibold)" }}>Próximas festas</h3>
        <div style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0,1fr)" : "repeat(auto-fill, minmax(360px, 1fr))", gap: 10 }}>
          {proximas.slice(0, 6).map(a => <AtProximaFesta key={a.id} a={a} fin={fin.dados} hoje={hoje} onAbrir={() => setAberto(a.id)} />)}
        </div>
      </section> : null}

      <AT.Card padded={false} header={<>
        <div>
          {atTitulo(nomeFiltro)}
          <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>{paraLista.length} {paraLista.length === 1 ? "atendimento" : "atendimentos"}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {filtro !== "abertas" ? <AT.FilterPill trailingIcon={null} onClick={() => setFiltro("abertas")}>Em aberto</AT.FilterPill> : null}
          {filtro !== "perdida" ? <AT.FilterPill trailingIcon={null} icon="circle-x" onClick={() => setFiltro("perdida")}>Perdidas · {todos.filter(a => a.etapa === "perdida").length}</AT.FilterPill> : null}
        </div>
      </>}>
        {!lista.length ? <AT.EmptyState icon={filtro === "abertas" ? "headset" : atEtapa(filtro).icon}
          title={filtro === "abertas" ? "Ninguém esperando" : "Nenhum atendimento aqui"}
          description="Quem pedir para visitar o salão ou fazer festa pela Sofia aparece aqui. Quem ligou ou veio na loja, lance pelo Novo atendimento." /> :
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: compact ? 8 : 12 }}>
          {lista.map(a => {
            const t = AT_TIPO[a.tipo] || AT_TIPO.outro, f = a.festa;
            const sub = [f && f.data ? `${atDiaSemana(f.data)} ${atDataCurta(f.data)}` : a.data || t.label,
              f && f.convidados ? f.convidados + " convidados" : a.pessoas ? a.pessoas + " pessoas" : null,
              a.etapa === "visita" && a.visitaEm ? "visita " + atQuando(a.visitaEm + ":00") : null,
              a.etapa === "perdida" && a.motivoPerda ? a.motivoPerda : null,
              a.origem === "equipe" ? (a.canal || "equipe") : "Sofia"].filter(Boolean).join(" · ");
            return <AT.ListRow key={a.id} icon={atEtapa(a.etapa).icon} title={atNome(a)} subtitle={sub}
              value={<AT.Badge tone={AT_TOM[a.etapa]}>{atEtapa(a.etapa).um}</AT.Badge>}
              valueSub={f && f.valor ? atBrl(f.valor) : atQuando(a.criadoEm)}
              onClick={() => setAberto(a.id)} />;
          })}
        </div>}
      </AT.Card>

      {novo ? <AtNovoModal pendente={pendente} onClose={() => setNovo(false)} onSalvar={lancar} /> : null}
      {toastNode}
    </div>
  );
}

/* Festas fechadas/realizadas na Agenda (Agenda.jsx). */
window.festasNaAgenda = (lista, fin) => (lista || [])
  .filter(a => ["fechada", "realizada"].includes(a.etapa) && a.festa && a.festa.data)
  .map(a => {
    const f = a.festa, pago = atPago(fin, a.id);
    return { id: "festa-" + a.id, atendimentoId: a.id, data: f.data, hora: f.inicio || "", tipo: (f.servicos || []).includes("buffet") ? "buffet" : "festa",
      cliente: atNome(a), titulo: [f.tipoEvento, atServicos(f).join(" + ")].filter(Boolean).join(" — "), local: (f.servicos || []).includes("salao") ? "Salão" : f.local || null,
      convidados: f.convidados, valor: f.valor ? atBrl(f.valor) : "", etapa: a.etapa,
      situacaoFesta: a.etapa === "realizada" ? "Realizada" : f.valor && pago >= f.valor ? "Paga" : pago ? "Entrada paga" : "Fechada" };
  });

Object.assign(window, { Atendimentos });
