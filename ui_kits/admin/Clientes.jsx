const CL = window.DLuhFestasDesignSystem_c861a2;

/* Clientes are not typed in anywhere: they come out of the orders. Orders that share a phone,
   a site login (uid) or an e-mail are the same person, so one customer can carry several numbers
   and addresses. An order with none of those stands alone under its name. */
const clNorm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const telDigitos = t => { let d = String(t || "").replace(/\D/g, ""); if (d.length > 11 && d.startsWith("55")) d = d.slice(2); return d; };
const fmtTel = d => d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : d;
/* Money on a mapped order: real rows keep centavos in _c; demo rows only have "R$ 1.240,00". */
const clCentavos = (p, campo) => p._c ? p._c[campo] || 0 : Math.round((parseFloat(String(p[campo] || "").replace(/[^\d,]/g, "").replace(",", ".")) || 0) * 100);
const brlC = c => window.brl((c || 0) / 100);
const dataBRc = iso => iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}` : "sem data";

function clientesDe(pedidos) {
  const pai = new Map();
  const raiz = k => { while (pai.get(k) !== k) { pai.set(k, pai.get(pai.get(k))); k = pai.get(k); } return k; };
  const unir = (a, b) => { const x = raiz(a), y = raiz(b); if (x !== y) pai.set(y, x); };
  const chavesDe = p => {
    const t = telDigitos(p.tel), ks = [];
    if (t.length >= 10) ks.push("t:" + t);
    if (p.email) ks.push("e:" + String(p.email).toLowerCase());
    if (p.uid) ks.push("u:" + p.uid);
    return ks.length ? ks : ["n:" + (clNorm(p.cliente) || p.id)];
  };
  const chaves = pedidos.map(chavesDe);
  chaves.forEach(ks => { ks.forEach(k => pai.has(k) || pai.set(k, k)); ks.slice(1).forEach(k => unir(ks[0], k)); });

  const grupos = new Map();
  pedidos.forEach((p, i) => {
    const r = raiz(chaves[i][0]);
    if (!grupos.has(r)) grupos.set(r, []);
    grupos.get(r).push(p);
  });

  return [...grupos.entries()].map(([id, lista]) => {
    lista.sort((a, b) => `${b.data || ""} ${b.hora || ""}`.localeCompare(`${a.data || ""} ${a.hora || ""}`));
    const conta = (valor, chave) => {
      const m = new Map();
      lista.forEach(p => { const v = valor(p); if (!v) return; const k = chave(v); const e = m.get(k); if (e) e.n++; else m.set(k, { valor: v, n: 1, ultimo: p.data || "" }); });
      return [...m.values()];
    };
    const validos = lista.filter(p => p.status !== "Cancelado");
    const telefones = conta(p => telDigitos(p.tel), d => d).filter(t => t.valor.length >= 8);
    return {
      id, pedidos: lista,
      nome: (lista.find(p => p.cliente) || {}).cliente || "Cliente sem nome",
      nomes: conta(p => String(p.cliente || "").trim(), clNorm).map(x => x.valor),
      telefones, tel: telefones[0] ? telefones[0].valor : "",
      emails: conta(p => p.email, v => v.toLowerCase()).map(x => x.valor),
      enderecos: conta(p => p.modo === "Entrega em endereço" ? String(p.endereco || "").trim() : "", clNorm),
      empresa: lista.some(p => p.tipo === "Empresa"),
      gasto: validos.reduce((s, p) => s + clCentavos(p, "total"), 0),
      aberto: validos.reduce((s, p) => s + clCentavos(p, "falta"), 0),
      n: validos.length,
      ultimo: lista[0] ? lista[0].data || "" : "",
      primeiro: lista.length ? lista[lista.length - 1].data || "" : "",
      busca: clNorm([...lista.map(p => p.cliente), ...lista.map(p => p.email)].join(" ")),
      digitos: telefones.map(t => t.valor).join(" ")
    };
  });
}

/* What the Pedido manual form fills in from a known customer: name, number, type and, when the
   last order was delivered, that address. */
function rascunhoDoCliente(c) {
  const ult = c.pedidos.find(p => p.modo) || {};
  const entrega = ult.modo === "Entrega em endereço" && c.enderecos.length;
  return {
    cliente: c.nome, tel: fmtTel(c.tel), tipo: c.empresa ? "Empresa" : "Pessoa física",
    entrega: entrega ? "Entrega em endereço" : "Retirada no local",
    endereco: entrega ? (c.enderecos.find(e => clNorm(e.valor) === clNorm(ult.endereco)) || c.enderecos[0]).valor : ""
  };
}

/* Up to three customers matching what was typed in the order form (name or phone digits). */
function clientesParecidos(clientes, nome, tel) {
  const t = clNorm(nome), d = telDigitos(tel);
  if (t.length < 3 && d.length < 4) return [];
  return clientes
    .filter(c => (d.length >= 4 && c.digitos.includes(d)) || (t.length >= 3 && c.busca.includes(t)))
    .sort((a, b) => b.n - a.n)
    .slice(0, 3);
}

const ORDENS = [
  { id: "recentes", label: "Mais recentes", fn: (a, b) => b.ultimo.localeCompare(a.ultimo) },
  { id: "pedidos", label: "Mais pedidos", fn: (a, b) => b.n - a.n || b.ultimo.localeCompare(a.ultimo) },
  { id: "gasto", label: "Maior valor", fn: (a, b) => b.gasto - a.gasto }
];
const PAGINA = 50;

function Secao({ titulo, children }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <div style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)" }}>{titulo}</div>
    {children}
  </div>;
}

function ClienteModal({ c, onClose, onPedido, onNovo }) {
  const vezes = n => n === 1 ? "1 pedido" : `${n} pedidos`;
  return (
    <CL.Modal width={560} title={c.nome}
      subtitle={[c.empresa ? "Empresa" : null, vezes(c.n), c.primeiro ? "cliente desde " + dataBRc(c.primeiro) : null].filter(Boolean).join(" · ")}
      onClose={onClose}
      footer={<><CL.Button variant="ghost" block onClick={onClose}>Fechar</CL.Button><CL.Button block icon="plus" onClick={() => onNovo(c)}>Novo pedido</CL.Button></>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <CL.Badge icon="wallet">Total {brlC(c.gasto)}</CL.Badge>
          {c.aberto ? <CL.Badge tone="warn" icon="clock">Em aberto {brlC(c.aberto)}</CL.Badge> : null}
          {c.n ? <CL.Badge icon="receipt-text">Ticket médio {brlC(Math.round(c.gasto / c.n))}</CL.Badge> : null}
        </div>

        <Secao titulo={c.telefones.length > 1 ? "Números" : "Número"}>
          {c.telefones.length ? c.telefones.map(t => (
            <CL.ListRow key={t.valor} icon="phone" title={fmtTel(t.valor)} subtitle={`${vezes(t.n)} · último ${dataBRc(t.ultimo)}`}
              trailing={<a href={`https://wa.me/55${t.valor}`} target="_blank" rel="noopener" style={{ marginLeft: 10, fontSize: "var(--fs-body-s)", whiteSpace: "nowrap" }}>WhatsApp</a>} />
          )) : <span style={{ fontSize: "var(--fs-body-s)", color: "var(--text-muted)" }}>Nenhum número nos pedidos.</span>}
          {c.emails.map(e => <CL.ListRow key={e} icon="mail" title={e} subtitle="Login do site" />)}
          {c.nomes.length > 1 ? <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>Também aparece como: {c.nomes.filter(n => n !== c.nome).join(", ")}</span> : null}
        </Secao>

        <Secao titulo="Endereços">
          {c.enderecos.length ? c.enderecos.map(e => (
            <CL.ListRow key={e.valor} icon="map-pin" title={e.valor} subtitle={`${e.n === 1 ? "1 entrega" : e.n + " entregas"} · última ${dataBRc(e.ultimo)}`} />
          )) : <span style={{ fontSize: "var(--fs-body-s)", color: "var(--text-muted)" }}>Sempre retirou no local.</span>}
        </Secao>

        <Secao titulo="Pedidos">
          {c.pedidos.map(p => (
            <CL.ListRow key={p.id} icon="receipt-text" title={`${p.id} · ${dataBRc(p.data)}`}
              subtitle={<span style={{ display: "inline-flex", marginTop: 2 }}><CL.StatusBadge status={p.status} short /></span>}
              value={p.total || "—"} onClick={() => onPedido(p)} />
          ))}
        </Secao>
      </div>
    </CL.Modal>
  );
}

function TelaClientes({ compact, onView, onQ }) {
  const carga = useAoVivo("pedidosTodos");
  const catalogo = useAoVivo("produtos");
  const [busca, setBusca] = React.useState("");
  const [ordem, setOrdem] = React.useState("recentes");
  const [limite, setLimite] = React.useState(PAGINA);
  const [aberto, setAberto] = React.useState(null);
  const [novo, setNovo] = React.useState(null);
  const [toastNode, showToast] = useToast();
  const [acao, pendente] = useAcao(showToast);
  const clientes = React.useMemo(() => carga.dados ? clientesDe(carga.dados) : [], [carga.dados]);

  if (carga.estado === "erro" && !carga.dados) return <ErroCarga erro={carga.erro} oque="os clientes" onTentar={carga.tentar} />;
  if (!carga.dados) return <Carregando oque="os clientes" />;

  const t = clNorm(busca), d = telDigitos(busca);
  const lista = clientes
    .filter(c => !t || c.busca.includes(t) || (d.length >= 4 && c.digitos.includes(d)))
    .sort(ORDENS.find(o => o.id === ordem).fn);
  const atual = aberto && clientes.find(c => c.id === aberto);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      <div style={{ display: "flex", gap: "var(--gap-inline)", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 260px", display: "flex", minWidth: 0 }}>
          <CL.SearchInput value={busca} onChange={e => { setBusca(e.target.value); setLimite(PAGINA); }} onClear={() => setBusca("")}
            placeholder="Buscar cliente por nome ou telefone" aria-label="Buscar cliente" />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {ORDENS.map(o => <CL.FilterPill key={o.id} trailingIcon={null} active={ordem === o.id} onClick={() => setOrdem(o.id)}>{o.label}</CL.FilterPill>)}
        </div>
      </div>

      <CL.Card padded={false} header={<div>
        <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>Clientes</div>
        <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>
          {t || d ? `${lista.length} de ${clientes.length}` : `${clientes.length} ${clientes.length === 1 ? "cliente" : "clientes"}`} · montado a partir dos pedidos
        </div>
      </div>}>
        {!lista.length ? <CL.EmptyState icon="users" title={clientes.length ? "Nenhum cliente com esse nome ou número" : "Nenhum cliente ainda"}
          description={clientes.length ? "Confira a grafia ou busque pelos últimos dígitos do telefone." : "Cada pedido novo cria ou atualiza o cadastro do cliente."} /> :
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: compact ? 8 : 12 }}>
          {lista.slice(0, limite).map(c => (
            <CL.ListRow key={c.id} icon={c.empresa ? "building-2" : "user"} title={c.nome}
              subtitle={[c.tel ? fmtTel(c.tel) + (c.telefones.length > 1 ? ` +${c.telefones.length - 1}` : "") : null,
                c.n === 1 ? "1 pedido" : `${c.n} pedidos`, c.ultimo ? "último " + dataBRc(c.ultimo) : null].filter(Boolean).join(" · ")}
              value={brlC(c.gasto)} onClick={() => setAberto(c.id)} />
          ))}
          {lista.length > limite ? <div style={{ display: "flex", justifyContent: "center", paddingTop: 6 }}>
            <CL.Button size="sm" variant="ghost" icon="chevron-down" onClick={() => setLimite(l => l + PAGINA)}>Mostrar mais ({lista.length - limite})</CL.Button>
          </div> : null}
        </div>}
      </CL.Card>

      {atual ? <ClienteModal c={atual} onClose={() => setAberto(null)}
        onPedido={p => { setAberto(null); onQ && onQ(p.id); onView("pedidos"); }}
        onNovo={c => { setAberto(null); setNovo(rascunhoDoCliente(c)); }} /> : null}
      {novo ? <window.ManualModal compact={compact} inicial={novo} clientes={clientes} onClose={() => setNovo(null)} onToast={showToast}
        acao={acao} pendente={pendente} produtos={catalogo.dados || []} /> : null}
      {toastNode}
    </div>
  );
}

Object.assign(window, { TelaClientes, clientesDe, clientesParecidos, rascunhoDoCliente, clCentavos, fmtTel, telDigitos });
