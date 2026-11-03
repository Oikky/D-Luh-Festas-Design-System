const CU = window.DLuhFestasDesignSystem_c861a2;

/* Fichas técnicas e custos do buffet: ingredientes com preço, receitas, equipe e despesas da festa,
   e o simulador de orçamento (pacote × formato × convidados, com margem). Tudo num documento só
   (sis_custos/base); as contas estão em custos-calculo.js. Combinado com a dona: com dado
   faltando a conta não sai — a tela diz o que falta em vez de mostrar custo parcial. */

const K = () => window.DLUH_CUSTOS;
const reaisCu = c => c == null ? "—" : window.brl(Math.round(c) / 100);
const novoId = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const UNID = ["kg", "g", "L", "ml", "un"];
const CATS = ["Arroz", "Massa", "Proteína", "Guarnição", "Salada", "Entrada", "Regional"];
const CAT_PLURAL = { Arroz: "arrozes", Massa: "massas", Proteína: "proteínas", Guarnição: "guarnições", Salada: "saladas", Entrada: "entradas", Regional: "pratos mineiros" };
const faixasVazias = () => ({ 50: null, 80: null, 100: null, 120: null, 150: null });

/* Campo numérico que guarda o texto enquanto se digita ("4," não vira "4"); devolve número ou null.
   `escala` 100 = dinheiro: mostra reais, devolve centavos. */
// "1.234,5" e "4,5" (vírgula) ou "4.5" (ponto do teclado do celular) — sem vírgula, o ponto é a casa decimal.
const lerNum = s => { const t = String(s).trim(); return t === "" ? null : Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t); };
const mostrarNum = (v, escala) => v == null ? "" : String(+(v / escala).toFixed(4)).replace(".", ",");
function NumCampo({ value, onChange, escala = 1, label, ...rest }) {
  const [txt, setTxt] = React.useState(() => mostrarNum(value, escala));
  React.useEffect(() => {
    const n = lerNum(txt);
    if ((n == null ? null : Math.round(n * escala * 10000) / 10000) !== value) setTxt(mostrarNum(value, escala));
  }, [value]);
  const bad = txt !== "" && !(lerNum(txt) >= 0);
  return <CU.Input size="sm" inputMode="decimal" aria-label={label} value={txt} invalid={bad} {...rest}
    onChange={e => {
      setTxt(e.target.value);
      const n = lerNum(e.target.value);
      if (e.target.value.trim() === "") onChange(null);
      else if (n >= 0) onChange(escala === 100 ? Math.round(n * 100) : n);
    }} />;
}

function Pendencias({ lista, onChange, placeholder }) {
  const [novo, setNovo] = React.useState("");
  const add = () => { const p = novo.trim(); if (p && !lista.includes(p)) onChange([...lista, p]); setNovo(""); };
  return <div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: lista.length ? 10 : 0 }}>
      {lista.map(p => (
        <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 2, padding: "3px 4px 3px 10px", borderRadius: "var(--radius-pill)", background: "var(--color-surface-2)", border: "var(--border-hairline) solid var(--color-border)", fontSize: "var(--fs-body-s)" }}>
          {p}
          <button type="button" aria-label={`Resolvido: ${p}`} title="Resolvido" onClick={() => onChange(lista.filter(x => x !== p))} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", borderRadius: "var(--radius-pill)" }}><CU.Icon name="check" size={14} /></button>
        </span>
      ))}
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <CU.Input size="sm" placeholder={placeholder} value={novo} onChange={e => setNovo(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }} style={{ flex: 1 }} />
      <CU.Button size="sm" variant="outline" icon="plus" onClick={add}>Anotar</CU.Button>
    </div>
  </div>;
}

/* O que falta, sem repetir, curto o bastante para caber num cartão. */
function Faltando({ falta, max = 8 }) {
  const u = [...new Set(falta)];
  return <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--fs-body-s)", color: "var(--text-body)" }}>
    {u.slice(0, max).map(f => <li key={f}>{f}</li>)}
    {u.length > max ? <li style={{ color: "var(--text-muted)", listStyle: "none", marginLeft: -18 }}>e mais {u.length - max}</li> : null}
  </ul>;
}

const titulo = (t, sub, extra) => <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
  <div style={{ flex: 1, minWidth: 0 }}>
    <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>{t}</div>
    {sub ? <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>{sub}</div> : null}
  </div>
  {extra}
</div>;

/* ── Simulador ── */
function Simulador({ base, mudar, compact }) {
  const [pacoteId, setPacoteId] = React.useState(base.pacotes[0] ? base.pacotes[0].id : null);
  const [escolhidos, setEscolhidos] = React.useState([]); // pratos marcados, de qualquer pacote (dá pra somar os mineiros)
  const [formato, setFormato] = React.useState("servido");
  const [conv, setConv] = React.useState(50);
  const [editarPacotes, setEditarPacotes] = React.useState(false);
  const pacote = base.pacotes.find(p => p.id === pacoteId);
  const doPacote = pacote ? pacote.fichas.map(id => base.fichas.find(f => f.id === id)).filter(Boolean) : [];
  const porCat = [...new Set(doPacote.map(f => f.categoria || "Sem tipo"))].map(c => [c, doPacote.filter(f => (f.categoria || "Sem tipo") === c)]);
  const lim = base.limites || {};
  const sim = (formato, conv) => K().simular(base, { fichas: escolhidos, formato, convidados: conv });
  const r = sim(formato, conv);
  const pr = base.precos;
  const linha = (rotulo, valor, forte) => <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", fontSize: forte ? "var(--fs-body)" : "var(--fs-body-s)", fontWeight: forte ? "var(--fw-semibold)" : "var(--fw-regular)", color: forte ? "var(--text-strong)" : "var(--text-body)", borderTop: forte ? "var(--border-hairline) solid var(--color-border)" : "none" }}>
    <span>{rotulo}</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{valor}</span></div>;

  return <div style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0,1fr)" : "minmax(0,1fr) minmax(0,1fr)", gap: 12, alignItems: "start" }}>
    <CU.Card header={titulo("Festa", "Escolha o que o cliente quer; a conta muda na hora.", <CU.Button size="sm" variant="ghost" icon="pencil" onClick={() => setEditarPacotes(true)}>Pacotes</CU.Button>)}
      bodyStyle={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <CU.Field label="Pacote"><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {base.pacotes.map(p => <CU.FilterPill key={p.id} active={p.id === pacoteId} trailingIcon={null} onClick={() => setPacoteId(p.id)}>{p.nome}</CU.FilterPill>)}
      </div></CU.Field>
      {porCat.length ? porCat.map(([c, lista]) => { const n = lista.filter(f => escolhidos.includes(f.id)).length;
        return <CU.Field key={c} label={`${c}${lim[c] ? ` · até ${lim[c]}` : ""}`} hint={lim[c] && n > lim[c] ? `Marcou ${n}; o cliente pode escolher até ${lim[c]}` : null}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {lista.map(f => { const on = escolhidos.includes(f.id); return <CU.FilterPill key={f.id} active={on} trailingIcon={null}
              onClick={() => setEscolhidos(on ? escolhidos.filter(x => x !== f.id) : [...escolhidos, f.id])}>{f.nome}</CU.FilterPill>; })}
          </div>
        </CU.Field>; })
        : <span style={{ fontSize: "var(--fs-body-s)", color: "var(--text-muted)" }}>Nenhum prato neste pacote. Toque em Pacotes para escolher.</span>}
      {escolhidos.length ? <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: "var(--fs-body-s)", color: "var(--text-body)" }}>
        {escolhidos.length} prato{escolhidos.length === 1 ? "" : "s"} na festa
        <CU.Button size="sm" variant="ghost" onClick={() => setEscolhidos([])}>Limpar</CU.Button>
      </div> : null}
      <CU.Field label="Formato"><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {Object.entries(K().FORMATOS).map(([k, v]) => <CU.FilterPill key={k} active={formato === k} trailingIcon={null} onClick={() => setFormato(k)}>{v}</CU.FilterPill>)}
      </div></CU.Field>
      <CU.Field label="Convidados"><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {K().FAIXAS.map(n => <CU.FilterPill key={n} active={conv === n} trailingIcon={null} onClick={() => setConv(n)}>{n}</CU.FilterPill>)}
      </div></CU.Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <CU.Field label="Margem de lucro" hint="Sobre o preço de venda"><NumCampo label="Margem de lucro" suffix="%" value={pr.margemPct} onChange={v => mudar(b => ({ ...b, precos: { ...b.precos, margemPct: v } }))} /></CU.Field>
        <CU.Field label="Taxas e tributos" hint="Também sobre o preço"><NumCampo label="Taxas e tributos" suffix="%" value={pr.taxasPct} onChange={v => mudar(b => ({ ...b, precos: { ...b.precos, taxasPct: v } }))} /></CU.Field>
      </div>
      {(pr.margemPct || 0) + (pr.taxasPct || 0) >= 100 ? <CU.Badge tone="danger" icon="circle-alert">Margem + taxas precisam ficar abaixo de 100%</CU.Badge> : null}
    </CU.Card>

    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <CU.Card header={titulo(`${conv} convidados · ${K().FORMATOS[formato]}`, `${escolhidos.length} prato${escolhidos.length === 1 ? "" : "s"} escolhido${escolhidos.length === 1 ? "" : "s"}`)}>
        {r.total == null ? <div role="status">
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: "var(--fw-semibold)", color: "var(--text-strong)", marginBottom: 10 }}>
            <CU.Icon name="clipboard-list" size={18} style={{ color: "var(--text-accent)" }} />Ainda não dá pra calcular
          </div>
          <div style={{ fontSize: "var(--fs-body-s)", color: "var(--text-muted)", marginBottom: 10 }}>Falta preencher:</div>
          <Faltando falta={r.falta} />
        </div> : <div>
          {linha("Comida (fichas técnicas)", reaisCu(r.comida))}
          {linha("Equipe", reaisCu(r.equipe))}
          {linha("Gás", reaisCu(r.gas))}
          {linha("Transporte", reaisCu(r.transporte))}
          {linha("Outras despesas", reaisCu(r.outros))}
          {linha("Custo total do evento", reaisCu(r.total), true)}
          {linha("Custo por convidado", reaisCu(r.porPessoa))}
          {r.preco != null ? <>
            {linha("Preço de venda", reaisCu(r.preco), true)}
            {linha("Preço por convidado", reaisCu(r.precoPessoa))}
            {linha(`Lucro (${pr.margemPct}%)`, reaisCu(r.lucro))}
            {pr.taxasPct ? linha(`Taxas e tributos (${pr.taxasPct}%)`, reaisCu(r.taxas)) : null}
            <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 8 }}>Preço = custo ÷ (1 − margem − taxas). Margem é sobre o preço de venda, não acréscimo sobre o custo.</div>
          </> : <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 8 }}>Preencha a margem de lucro para ver o preço de venda.</div>}
        </div>}
      </CU.Card>

      <CU.Card header={titulo("Por convidado, em cada tamanho", r.preco != null || pr.margemPct != null ? "Preço de venda por convidado" : "Custo por convidado")} padded={false}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--fs-body-s)", fontVariantNumeric: "tabular-nums" }}>
            <thead><tr>{["Convidados", ...Object.values(K().FORMATOS)].map(h => <th key={h} scope="col" style={{ textAlign: h === "Convidados" ? "left" : "right", padding: "10px 16px", fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)", borderBottom: "var(--border-hairline) solid var(--color-border)" }}>{h}</th>)}</tr></thead>
            <tbody>{K().FAIXAS.map(n => <tr key={n} style={{ background: n === conv ? "var(--color-accent-soft)" : "transparent" }}>
              <th scope="row" style={{ textAlign: "left", padding: "9px 16px", fontWeight: "var(--fw-medium)" }}>{n}</th>
              {Object.keys(K().FORMATOS).map(fm => { const x = sim(fm, n); const v = x.total == null ? null : x.precoPessoa != null ? x.precoPessoa : x.porPessoa;
                return <td key={fm} style={{ textAlign: "right", padding: "9px 16px", color: v == null ? "var(--text-muted)" : "var(--text-strong)" }}>{v == null ? "falta dado" : reaisCu(v)}</td>; })}
            </tr>)}</tbody>
          </table>
        </div>
      </CU.Card>
    </div>

    {editarPacotes ? <CU.Modal width={620} title="Pacotes" subtitle="Os pratos que cada pacote oferece e quantos o cliente escolhe. Salve depois de mudar." onClose={() => setEditarPacotes(false)}
      footer={<CU.Button block icon="check" onClick={() => setEditarPacotes(false)}>Pronto</CU.Button>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <CU.Field label="Quantos o cliente escolhe de cada tipo" hint="Vale para o formulário do site. Em branco = sem limite.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(118px, 1fr))", gap: 8 }}>
            {CATS.map(c => <label key={c} style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "var(--fs-tiny)", color: "var(--text-body)" }}>{c}
              <NumCampo label={`Limite de ${CAT_PLURAL[c]}`} placeholder="livre" value={(base.limites || {})[c] ?? null}
                onChange={v => mudar(b => ({ ...b, limites: { ...(b.limites || {}), [c]: v == null ? null : Math.round(v) } }))} /></label>)}
          </div>
        </CU.Field>
        {base.pacotes.map(p => <CU.Field key={p.id} label={p.nome}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {base.fichas.map(f => { const on = p.fichas.includes(f.id); return <CU.FilterPill key={f.id} active={on} trailingIcon={null}
              onClick={() => mudar(b => ({ ...b, pacotes: b.pacotes.map(x => x.id !== p.id ? x : { ...x, fichas: on ? x.fichas.filter(y => y !== f.id) : [...x.fichas, f.id] }) }))}>{f.nome}</CU.FilterPill>; })}
          </div>
        </CU.Field>)}
      </div>
    </CU.Modal> : null}
  </div>;
}

/* ── Fichas ── */
function FichaModal({ ficha, base, onClose, onSalvar, onApagar, pendente }) {
  const [f, setF] = React.useState(() => ficha || { id: novoId("f-"), nome: "", categoria: "", rendimentoKg: null, porcaoG: null, itens: [], pendencias: [] });
  const [apagar, setApagar] = React.useState(false);
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const setItem = (i, mud) => set("itens", f.itens.map((x, j) => j === i ? { ...x, ...mud } : x));
  const c = K().calcularFicha(f, base.ingredientes);
  const porId = new Map(base.ingredientes.map(i => [i.id, i]));
  const opcoes = [{ value: "", label: "Escolha o ingrediente" }, ...base.ingredientes.slice().sort((a, b) => a.nome.localeCompare(b.nome)).map(i => ({ value: i.id, label: i.nome }))];
  const usadoEm = base.pacotes.filter(p => p.fichas.includes(f.id)).map(p => p.nome);
  return <>
    <CU.Modal width={720} title={ficha ? f.nome || "Ficha técnica" : "Nova ficha técnica"} onClose={onClose}
      subtitle="Quantidades de uma receita, o peso pronto e quanto vai por convidado."
      footer={<>
        {ficha ? <CU.Button variant="ghost" tone="danger" icon="trash-2" block onClick={() => setApagar(true)}>Apagar</CU.Button> : null}
        <CU.Button variant="ghost" block onClick={onClose}>Cancelar</CU.Button>
        <CU.Button block icon="check" disabled={!f.nome.trim()} loading={pendente === "salvar-custos"} onClick={() => onSalvar({ ...f, nome: f.nome.trim(), itens: f.itens.filter(x => x.ing) })}>Salvar</CU.Button>
      </>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px 12px" }}>
        <CU.Field label="Nome" required span={2}><CU.Input placeholder="Ex.: Arroz branco" value={f.nome} onChange={e => set("nome", e.target.value)} /></CU.Field>
        <CU.Field label="Tipo"><CU.Select value={f.categoria} onChange={e => set("categoria", e.target.value)} options={[{ value: "", label: "Escolha" }, ...CATS]} /></CU.Field>
        <CU.Field label="Peso pronto" hint="Pese depois de pronto"><NumCampo label="Peso pronto" suffix="kg" value={f.rendimentoKg} onChange={v => set("rendimentoKg", v)} /></CU.Field>
        <CU.Field label="Porção por convidado"><NumCampo label="Porção por convidado" suffix="g" value={f.porcaoG} onChange={v => set("porcaoG", v)} /></CU.Field>
      </div>

      <div style={{ marginTop: 18, fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)" }}>Ingredientes</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {f.itens.map((x, i) => { const l = c.linhas[i]; const ingr = porId.get(x.ing);
          return <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 84px 72px 92px 36px", gap: 6, alignItems: "center" }}>
            <CU.Select size="sm" aria-label="Ingrediente" value={x.ing} options={opcoes} onChange={e => { const n = porId.get(e.target.value); setItem(i, { ing: e.target.value, ...(n ? { unidade: n.unidade === "kg" ? "g" : n.unidade === "L" ? "ml" : n.unidade } : {}) }); }} />
            <NumCampo label="Quantidade" value={x.qtd} onChange={v => setItem(i, { qtd: v })} />
            <CU.Select size="sm" aria-label="Unidade" value={x.unidade} options={UNID} onChange={e => setItem(i, { unidade: e.target.value })} />
            <span title={l.falta || undefined} style={{ textAlign: "right", fontSize: "var(--fs-body-s)", fontVariantNumeric: "tabular-nums", color: l.custo == null ? "var(--text-muted)" : "var(--text-strong)" }}>
              {l.custo == null ? (ingr && ingr.preco == null ? "sem preço" : "—") : reaisCu(l.custo)}</span>
            <CU.IconButton icon="x" label="Tirar ingrediente" size={36} onClick={() => set("itens", f.itens.filter((_, j) => j !== i))} />
          </div>; })}
        <div><CU.Button size="sm" variant="outline" icon="plus" onClick={() => set("itens", [...f.itens, { ing: "", qtd: null, unidade: "g" }])}>Ingrediente</CU.Button></div>
      </div>

      <div style={{ marginTop: 18 }}>
        <CU.Field label="Ainda falta" hint="O que precisa confirmar. Toque no ✓ quando resolver.">
          <Pendencias lista={f.pendencias} onChange={v => set("pendencias", v)} placeholder="Ex.: Sal e temperos" />
        </CU.Field>
      </div>

      <div style={{ marginTop: 18, padding: 14, borderRadius: "var(--radius-md)", background: "var(--color-surface-2)" }}>
        {c.porPessoa != null ? <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", fontSize: "var(--fs-body-s)", fontVariantNumeric: "tabular-nums" }}>
          <span>Receita: <b>{reaisCu(c.custo)}</b></span>
          <span>Rende: <b>{Math.floor(c.porcoes)} porções</b></span>
          <span>Por convidado: <b>{reaisCu(c.porPessoa)}</b></span>
        </div> : <>
          <div style={{ fontWeight: "var(--fw-semibold)", fontSize: "var(--fs-body-s)", marginBottom: 8 }}>Sem custo até completar:</div>
          <Faltando falta={c.falta} />
        </>}
      </div>
    </CU.Modal>
    {apagar ? <CU.ConfirmDialog tone="danger" icon="trash-2" title="Apagar ficha?"
      message={`${f.nome} sai das fichas${usadoEm.length ? ` e dos pacotes ${usadoEm.join(", ")}` : ""}.`}
      confirmLabel="Sim, apagar" cancelLabel="Voltar" pending={pendente === "salvar-custos"} onCancel={() => setApagar(false)}
      onConfirm={() => onApagar(f.id)} /> : null}
  </>;
}

function Fichas({ base, salvarJa, pendente, compact }) {
  const [editar, setEditar] = React.useState(null); // null | "nova" | ficha
  const calc = new Map(base.fichas.map(f => [f.id, K().calcularFicha(f, base.ingredientes)]));
  const prontas = base.fichas.filter(f => calc.get(f.id).porPessoa != null).length;
  const grupos = [...new Set([...CATS, ...base.fichas.map(f => f.categoria || "Sem tipo")])].filter(c => base.fichas.some(f => (f.categoria || "Sem tipo") === c));
  const fechar = ok => { if (ok) setEditar(null); };
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <CU.Badge tone={prontas === base.fichas.length && prontas ? "success" : "warn"} icon={prontas === base.fichas.length && prontas ? "check" : "clock"}>{prontas} de {base.fichas.length} completas</CU.Badge>
      <div style={{ flex: 1 }} />
      <CU.Button size="sm" icon="plus" onClick={() => setEditar("nova")}>Nova ficha</CU.Button>
    </div>
    {grupos.length ? <div style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0,1fr)" : "repeat(2, minmax(0,1fr))", gap: 12, alignItems: "start" }}>
      {grupos.map(g => <CU.Card key={g} header={<div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>{g}</div>} bodyStyle={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {base.fichas.filter(f => (f.categoria || "Sem tipo") === g).map(f => { const c = calc.get(f.id); const n = [...new Set(c.falta)].length;
          return <CU.ListRow key={f.id} title={f.nome}
            subtitle={c.porPessoa != null ? `Receita ${reaisCu(c.custo)} · rende ${Math.floor(c.porcoes)} porções` : `Falta: ${[...new Set(c.falta)].slice(0, 2).join(", ")}${n > 2 ? ` e mais ${n - 2}` : ""}`}
            value={c.porPessoa != null ? reaisCu(c.porPessoa) : <CU.Badge tone="warn">Incompleta</CU.Badge>} valueSub={c.porPessoa != null ? "por convidado" : null}
            onClick={() => setEditar(f)} />; })}
      </CU.Card>)}
    </div> : <CU.Card padded={false}><CU.EmptyState icon="chef-hat" title="Nenhuma ficha técnica" description="Cadastre a receita com as quantidades, o peso pronto e a porção por convidado." /></CU.Card>}
    {editar ? <FichaModal ficha={editar === "nova" ? null : editar} base={base} pendente={pendente} onClose={() => setEditar(null)}
      onSalvar={async f => fechar(await salvarJa(b => ({ ...b, fichas: b.fichas.some(x => x.id === f.id) ? b.fichas.map(x => x.id === f.id ? f : x) : [...b.fichas, f] }), editar === "nova" ? "Ficha criada" : "Ficha salva"))}
      onApagar={async id => fechar(await salvarJa(b => ({ ...b, fichas: b.fichas.filter(x => x.id !== id), pacotes: b.pacotes.map(p => ({ ...p, fichas: p.fichas.filter(x => x !== id) })) }), "Ficha apagada"))} /> : null}
  </div>;
}

/* ── Ingredientes ── */
function Ingredientes({ base, mudar, compact }) {
  const [busca, setBusca] = React.useState("");
  const usos = id => base.fichas.filter(f => f.itens.some(x => x.ing === id)).map(f => f.nome);
  const setIng = (id, mud) => mudar(b => ({ ...b, ingredientes: b.ingredientes.map(x => x.id === id ? { ...x, ...mud } : x) }));
  const termo = busca.trim().toLowerCase();
  const lista = base.ingredientes.filter(i => !termo || i.nome.toLowerCase().includes(termo));
  const semPreco = base.ingredientes.filter(i => i.preco == null).length;
  const porBase = i => { if (i.preco == null || !i.qtd) return null;
    const u = { g: "kg", ml: "L" }[i.unidade] || i.unidade, f = i.unidade === "g" || i.unidade === "ml" ? 1000 : 1;
    return `${reaisCu(i.preco / i.qtd * f)}/${u}`; };
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      {semPreco ? <CU.Badge tone="warn" icon="clock">{semPreco} sem preço</CU.Badge> : <CU.Badge tone="success" icon="check">Todos com preço</CU.Badge>}
      <div style={{ flex: 1 }} />
      <div style={{ width: compact ? "100%" : 240 }}><CU.SearchInput placeholder="Buscar ingrediente" value={busca} onChange={e => setBusca(e.target.value)} onClear={() => setBusca("")} /></div>
      <CU.Button size="sm" icon="plus" onClick={() => { setBusca(""); mudar(b => ({ ...b, ingredientes: [{ id: novoId("i-"), nome: "", preco: null, qtd: 1, unidade: "kg" }, ...b.ingredientes] })); }}>Novo ingrediente</CU.Button>
    </div>
    <CU.Card header={titulo("Preço de compra", "Preço da embalagem e o que vem nela. Sachê, lata ou pacote usado inteiro: unidade “un”.")}>
      <div style={{ display: "flex", flexDirection: "column", gap: compact ? 14 : 6 }}>
        {!compact ? <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 110px 84px 76px 110px 36px", gap: 6, fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)" }}>
          <span>Ingrediente</span><span>Preço</span><span>Embalagem</span><span>Unidade</span><span style={{ textAlign: "right" }}>Custo</span><span />
        </div> : null}
        {lista.map(i => { const u = usos(i.id); const pb = porBase(i);
          return <div key={i.id} style={{ display: "grid", gridTemplateColumns: compact ? "repeat(3, minmax(0,1fr)) 36px" : "minmax(0,1fr) 110px 84px 76px 110px 36px", gap: 6, alignItems: "center" }}>
            <CU.Input size="sm" aria-label="Ingrediente" placeholder="Nome" value={i.nome} invalid={!i.nome.trim()} onChange={e => setIng(i.id, { nome: e.target.value })} style={compact ? { gridColumn: "1 / 4" } : null} />
            {compact ? <CU.IconButton icon="trash-2" label={u.length ? `Usado em ${u.join(", ")}` : `Apagar ${i.nome}`} size={36} disabled={!!u.length} onClick={() => mudar(b => ({ ...b, ingredientes: b.ingredientes.filter(x => x.id !== i.id) }))} /> : null}
            <NumCampo label={`Preço de ${i.nome}`} prefix="R$" escala={100} value={i.preco} placeholder="falta" onChange={v => setIng(i.id, { preco: v })} />
            <NumCampo label={`Embalagem de ${i.nome}`} value={i.qtd} onChange={v => setIng(i.id, { qtd: v })} />
            <CU.Select size="sm" aria-label={`Unidade de ${i.nome}`} value={i.unidade} options={UNID} onChange={e => setIng(i.id, { unidade: e.target.value })} />
            <span style={{ textAlign: compact ? "left" : "right", fontSize: "var(--fs-body-s)", fontVariantNumeric: "tabular-nums", color: pb ? "var(--text-body)" : "var(--text-muted)", gridColumn: compact ? "1 / 5" : undefined }}>
              {pb || "sem preço"}{u.length ? <span style={{ color: "var(--text-muted)" }}>{compact ? ` · em ${u.length} ficha${u.length > 1 ? "s" : ""}` : ""}</span> : null}</span>
            {!compact ? <CU.IconButton icon="trash-2" label={u.length ? `Usado em ${u.join(", ")}` : `Apagar ${i.nome}`} size={36} disabled={!!u.length} onClick={() => mudar(b => ({ ...b, ingredientes: b.ingredientes.filter(x => x.id !== i.id) }))} /> : null}
          </div>; })}
        {!lista.length ? <div style={{ fontSize: "var(--fs-body-s)", color: "var(--text-muted)" }}>Nenhum ingrediente com “{busca}”.</div> : null}
      </div>
    </CU.Card>
  </div>;
}

/* ── Despesas da festa ── */
function Despesas({ base, mudar, compact }) {
  const o = base.operacao;
  const setO = mud => mudar(b => ({ ...b, operacao: { ...b.operacao, ...mud } }));
  const setE = (id, mud) => mudar(b => ({ ...b, equipe: b.equipe.map(x => x.id === id ? { ...x, ...mud } : x) }));
  const setOutro = (id, mud) => setO({ outros: o.outros.map(x => x.id === id ? { ...x, ...mud } : x) });
  const tr = K().transporte(o);
  const rot = { fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)" };
  return <div style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0,1fr)" : "minmax(0,1.15fr) minmax(0,1fr)", gap: 12, alignItems: "start" }}>
    <CU.Card header={titulo("Equipe", "Valor de cada um no evento e quantos vão em cada tamanho de festa.",
      <CU.Button size="sm" variant="outline" icon="plus" onClick={() => mudar(b => ({ ...b, equipe: [...b.equipe, { id: novoId("e-"), funcao: "", valor: null, servido: faixasVazias(), self: faixasVazias() }] }))}>Função</CU.Button>)}
      bodyStyle={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {base.equipe.map(e => <div key={e.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 120px 36px", gap: 6, alignItems: "center" }}>
          <CU.Input size="sm" aria-label="Função" placeholder="Ex.: Garçom" value={e.funcao} invalid={!e.funcao.trim()} onChange={x => setE(e.id, { funcao: x.target.value })} />
          <NumCampo label={`Valor de ${e.funcao}`} prefix="R$" escala={100} placeholder="falta" value={e.valor} onChange={v => setE(e.id, { valor: v })} />
          <CU.IconButton icon="trash-2" label={`Tirar ${e.funcao || "função"}`} size={36} onClick={() => mudar(b => ({ ...b, equipe: b.equipe.filter(x => x.id !== e.id) }))} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "88px repeat(5, minmax(0,1fr))", gap: 4, alignItems: "center" }}>
          <span style={rot}>Pessoas</span>{K().FAIXAS.map(n => <span key={n} style={{ ...rot, textAlign: "center" }}>{n}</span>)}
          {Object.entries(K().FORMATOS).map(([fm, nome]) => <React.Fragment key={fm}>
            <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-body)" }}>{fm === "servido" ? "Servido" : "Self"}</span>
            {K().FAIXAS.map(n => <NumCampo key={n} label={`${e.funcao}: ${nome}, ${n} convidados`} value={e[fm][n]} style={{ minWidth: 0 }}
              onChange={v => setE(e.id, { [fm]: { ...e[fm], [n]: v } })} />)}
          </React.Fragment>)}
        </div>
      </div>)}
    </CU.Card>

    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <CU.Card header={titulo("Gás e transporte")} bodyStyle={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <CU.Field label="Gás por evento" hint="O botijão custou R$ 97,00; lance só o que um evento gasta"><NumCampo label="Gás por evento" prefix="R$" escala={100} placeholder="falta" value={o.gas} onChange={v => setO({ gas: v })} /></CU.Field>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}>
          <CU.Field label="Gasolina"><NumCampo label="Gasolina por litro" prefix="R$" escala={100} value={o.gasolinaLitro} onChange={v => setO({ gasolinaLitro: v })} /></CU.Field>
          <CU.Field label="Consumo"><NumCampo label="Km por litro" suffix="km/L" value={o.kmPorLitro} onChange={v => setO({ kmPorLitro: v })} /></CU.Field>
          <CU.Field label="Ida e volta"><NumCampo label="Distância total" suffix="km" value={o.km} onChange={v => setO({ km: v })} /></CU.Field>
        </div>
        <div style={{ fontSize: "var(--fs-body-s)", color: "var(--text-body)" }}>Combustível por evento: <b style={{ fontVariantNumeric: "tabular-nums" }}>{reaisCu(tr)}</b> <span style={{ color: "var(--text-muted)" }}>(km ÷ km/L × litro)</span></div>
      </CU.Card>

      <CU.Card header={titulo("Outras despesas", "Lavagem, limpeza, água, energia, quebra de utensílios…",
        <CU.Button size="sm" variant="outline" icon="plus" onClick={() => setO({ outros: [...o.outros, { id: novoId("o-"), nome: "", valor: null, por: "evento" }] })}>Despesa</CU.Button>)}
        bodyStyle={{ display: "flex", flexDirection: "column", gap: compact ? 12 : 6 }}>
        {o.outros.map(x => <div key={x.id} style={{ display: "grid", gridTemplateColumns: compact ? "repeat(2, minmax(0,1fr)) 36px" : "minmax(0,1fr) 104px 118px 36px", gap: 6, alignItems: "center" }}>
          <CU.Input size="sm" aria-label="Despesa" placeholder="Ex.: Lavagem" value={x.nome} invalid={!x.nome.trim()} onChange={e => setOutro(x.id, { nome: e.target.value })} style={compact ? { gridColumn: "1 / 3" } : null} />
          {compact ? <CU.IconButton icon="trash-2" label={`Tirar ${x.nome || "despesa"}`} size={36} onClick={() => setO({ outros: o.outros.filter(y => y.id !== x.id) })} /> : null}
          <NumCampo label={`Valor de ${x.nome}`} prefix="R$" escala={100} placeholder="falta" value={x.valor} onChange={v => setOutro(x.id, { valor: v })} />
          <CU.Select size="sm" aria-label="Cobrado por" value={x.por} options={[{ value: "evento", label: "por evento" }, { value: "pessoa", label: "por convidado" }]} onChange={e => setOutro(x.id, { por: e.target.value })} />
          {!compact ? <CU.IconButton icon="trash-2" label={`Tirar ${x.nome || "despesa"}`} size={36} onClick={() => setO({ outros: o.outros.filter(y => y.id !== x.id) })} /> : null}
        </div>)}
      </CU.Card>

      <CU.Card header={titulo("Ainda falta confirmar", "Enquanto tiver algo aqui, o simulador não fecha a conta.")}>
        <Pendencias lista={o.pendencias} onChange={v => setO({ pendencias: v })} placeholder="Ex.: Montagem e recolhimento são pagos à parte?" />
      </CU.Card>
    </div>
  </div>;
}

/* ── Tela ── */
const ABAS_CU = [{ id: "simulador", label: "Simulador" }, { id: "fichas", label: "Fichas técnicas" }, { id: "ingredientes", label: "Ingredientes" }, { id: "despesas", label: "Despesas da festa" }];

function Custos({ compact }) {
  const carga = useAoVivo("custos");
  const [toastNode, showToast] = useToast();
  const [acao, pendente] = useAcao(showToast);
  const [aba, setAba] = React.useState("simulador");
  const [rasc, setRasc] = React.useState(null); // mudanças ainda não salvas

  if (carga.estado === "erro" && carga.dados === null) return <ErroCarga erro={carga.erro} oque="os custos" onTentar={carga.tentar} />;
  if (carga.estado !== "pronto") return <Carregando oque="custos" />;

  const salvo = carga.dados || null;
  const base = rasc || salvo || window.CUSTOS_INICIO;
  const naoSalvo = !!rasc || !salvo;
  const mudar = fn => setRasc(fn(base));
  const nomesOk = b => b.ingredientes.every(i => i.nome.trim()) && b.equipe.every(e => e.funcao.trim()) && b.operacao.outros.every(x => x.nome.trim());
  /* Grava o documento inteiro (com o que mais estiver pendente na tela). */
  const salvarJa = async (fn, ok = "Custos salvos") => {
    const novo = fn ? fn(base) : base;
    if (!nomesOk(novo)) { showToast("Preencha o nome de todo ingrediente, função e despesa", "danger"); return false; }
    return acao("salvar-custos", { ok, falhou: "Não deu pra salvar" }, () => { carga.setDados(novo); setRasc(null); }, { acao: "salvarCustos", dados: novo });
  };

  return <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <div style={{ flex: compact ? "1 1 100%" : 1, minWidth: 0 }}><CU.Tabs value={aba} onChange={setAba} items={ABAS_CU.map(a => ({ ...a,
        count: a.id === "fichas" ? base.fichas.length : a.id === "ingredientes" ? base.ingredientes.length : undefined }))} /></div>
      {naoSalvo ? <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
        <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>{salvo ? "Alterações não salvas" : "Dados iniciais, ainda não salvos"}</span>
        {rasc && salvo ? <CU.Button size="sm" variant="ghost" onClick={() => setRasc(null)}>Desfazer</CU.Button> : null}
        <CU.Button size="sm" icon="check" loading={pendente === "salvar-custos"} onClick={() => salvarJa()}>Salvar</CU.Button>
      </div> : null}
    </div>

    {aba === "simulador" ? <Simulador base={base} mudar={mudar} compact={compact} />
      : aba === "fichas" ? <Fichas base={base} salvarJa={salvarJa} pendente={pendente} compact={compact} />
      : aba === "ingredientes" ? <Ingredientes base={base} mudar={mudar} compact={compact} />
      : <Despesas base={base} mudar={mudar} compact={compact} />}
    {toastNode}
  </div>;
}

Object.assign(window, { Custos });
