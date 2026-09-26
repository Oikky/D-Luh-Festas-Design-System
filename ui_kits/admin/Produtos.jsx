const PD = window.DLuhFestasDesignSystem_c861a2;

/* The catalog the site sells from: products grouped by category, plus the filling list the cake
   and package pickers offer. Hidden products stay here and vanish from the site. */

const REAL_P = () => window.DLUH_API.modo === "firebase";
const centavosDe = s => Math.round((parseFloat(String(s).replace(",", ".")) || 0) * 100);
const paraCampo = c => c ? (c / 100).toFixed(2) : "";

function Marcar({ checked, onChange, children, hint }) {
  return <label data-target style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: "var(--fs-body-s)", color: "var(--text-strong)", minHeight: 32 }}>
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
      style={{ width: 18, height: 18, margin: "1px 0 0", accentColor: "var(--color-accent-strong)", flex: "0 0 auto" }} />
    <span>{children}{hint ? <span style={{ display: "block", fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>{hint}</span> : null}</span>
  </label>;
}

function Foto({ url, size = 36 }) {
  return url
    ? <img src={url} alt="" style={{ width: size, height: size, borderRadius: "var(--radius-sm)", objectFit: "cover", display: "block" }} />
    : <span style={{ width: size, height: size, borderRadius: "var(--radius-sm)", background: "var(--color-surface-3)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}><PD.Icon name="image" size={Math.round(size / 2.2)} /></span>;
}

const vazio = () => ({ nome: "", categoria: "", preco: "", qtdMin: "1", ingredientes: "", imagem: "", ativo: true, destaque: false, tiposPacote: [] });
const dePedido = p => p ? { ...vazio(), ...p, preco: paraCampo(p.valorUnit), qtdMin: String(p.qtdMin || 1), tiposPacote: p.tiposPacote || [] } : vazio();

function ProdutoModal({ produto, categorias, onClose, onToast, acao, pendente, aplicar }) {
  const [f, setF] = React.useState(() => dePedido(produto));
  const [tentou, setTentou] = React.useState(false);
  const [apagar, setApagar] = React.useState(false);
  const [subindo, setSubindo] = React.useState(false);
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const ctl = k => ({ value: f[k], onChange: e => set(k, e.target.value) });
  const pacote = /pacote/i.test(f.categoria);
  const erros = !tentou ? {} : {
    nome: f.nome.trim() ? null : "Preencha o nome",
    categoria: f.categoria.trim() ? null : "Escolha ou digite uma categoria",
    preco: centavosDe(f.preco) > 0 ? null : "Digite um preço maior que zero",
    qtdMin: parseInt(f.qtdMin, 10) >= 1 ? null : "Mínimo 1"
  };
  const dados = () => ({
    ...(produto ? { id: produto.id } : {}),
    nome: f.nome.trim(), categoria: f.categoria.trim(), valorUnit: centavosDe(f.preco), qtdMin: parseInt(f.qtdMin, 10) || 1,
    ingredientes: f.ingredientes.trim(), imagem: f.imagem, ativo: f.ativo, destaque: f.destaque, tiposPacote: pacote ? f.tiposPacote : []
  });

  const salvar = async () => {
    setTentou(true);
    const d = dados();
    if (!d.nome || !d.categoria || d.valorUnit <= 0) return;
    const ok = await acao("salvar-produto", { ok: produto ? "Produto atualizado" : "Produto criado", falhou: "Não deu pra salvar o produto" },
      () => aplicar(l => produto ? l.map(x => x.id === produto.id ? { ...x, ...d, preco: window.brl(d.valorUnit / 100) } : x)
        : [...l, { ...d, id: "demo-" + Date.now(), preco: window.brl(d.valorUnit / 100) }]),
      { acao: "salvarProduto", dados: d });
    if (ok) onClose();
  };

  const escolherFoto = async e => {
    const arq = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!arq) return;
    setSubindo(true);
    try {
      const dataUrl = await window.reduzirImagem(arq);
      if (!REAL_P()) { set("imagem", dataUrl); return; }
      const r = await acao("foto", { falhou: "Não deu pra enviar a foto" }, null, { acao: "enviarImagem", dados: { dataUrl } });
      if (r && r.url) set("imagem", r.url);
    } catch (err) {
      onToast(err.message, "danger");
    } finally { setSubindo(false); }
  };

  return (<>
    <PD.Modal width={620} title={produto ? "Editar produto" : "Novo produto"} onClose={onClose}
      subtitle="O que aparece no site: nome, preço, foto e a quantidade mínima que o cliente pode pedir."
      footer={<>
        {produto ? <PD.Button variant="ghost" tone="danger" icon="trash-2" block onClick={() => setApagar(true)}>Apagar</PD.Button> : null}
        <PD.Button variant="ghost" block onClick={onClose}>Cancelar</PD.Button>
        <PD.Button block icon="check" loading={pendente === "salvar-produto"} disabled={subindo} onClick={salvar}>Salvar</PD.Button>
      </>}>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
        <Foto url={f.imagem} size={72} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
          <label data-target style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 32, cursor: subindo ? "wait" : "pointer", fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)", color: "var(--text-accent)" }}>
            <PD.Icon name={subindo ? "loader" : "upload"} size={15} />{subindo ? "Enviando…" : f.imagem ? "Trocar foto" : "Escolher foto"}
            <input type="file" accept="image/*" hidden disabled={subindo} onChange={escolherFoto} />
          </label>
          {f.imagem ? <button type="button" onClick={() => set("imagem", "")} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>Tirar foto</button> : null}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "10px 12px" }}>
        <PD.Field label="Nome" required error={erros.nome}><PD.Input placeholder="Ex.: Coxinha de frango" invalid={!!erros.nome} {...ctl("nome")} /></PD.Field>
        <PD.Field label="Categoria" required error={erros.categoria} hint="Agrupa no site e na impressão">
          <PD.Input list="dluh-categorias" placeholder="Ex.: Salgado Frito" invalid={!!erros.categoria} {...ctl("categoria")} />
          <datalist id="dluh-categorias">{categorias.map(c => <option key={c} value={c} />)}</datalist>
        </PD.Field>
        <PD.Field label="Preço por unidade" required error={erros.preco}><PD.Input type="number" prefix="R$" step="0.01" min="0" placeholder="0,00" invalid={!!erros.preco} {...ctl("preco")} /></PD.Field>
        <PD.Field label="Quantidade mínima" error={erros.qtdMin} hint="Ex.: salgados a partir de 25"><PD.Input type="number" min="1" step="1" invalid={!!erros.qtdMin} {...ctl("qtdMin")} /></PD.Field>
      </div>
      <PD.Field label="Ingredientes / descrição" style={{ marginTop: 10 }}><PD.Input placeholder="Opcional — aparece no cardápio" {...ctl("ingredientes")} /></PD.Field>
      {pacote ? <PD.Field label="O pacote deixa escolher entre" hint="Categorias que o cliente escolhe ao montar o pacote" style={{ marginTop: 10 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {categorias.filter(c => !/pacote/i.test(c)).map(c => {
            const on = f.tiposPacote.includes(c);
            return <PD.FilterPill key={c} active={on} trailingIcon={null} onClick={() => set("tiposPacote", on ? f.tiposPacote.filter(x => x !== c) : [...f.tiposPacote, c])}>{c}</PD.FilterPill>;
          })}
        </div>
      </PD.Field> : null}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
        <Marcar checked={f.ativo} onChange={v => set("ativo", v)} hint="Desmarcado, o produto some do site mas continua aqui.">Mostrar no site</Marcar>
        <Marcar checked={f.destaque} onChange={v => set("destaque", v)} hint="Aparece em Mais pedidos no topo do cardápio.">Destaque</Marcar>
      </div>
    </PD.Modal>
    {apagar ? <PD.ConfirmDialog tone="danger" icon="trash-2" title="Apagar produto?"
      message={`${produto.nome} sai do catálogo e do site. Pedidos antigos continuam com o nome e o preço que tinham. Para só esconder, desmarque Mostrar no site.`}
      confirmLabel="Sim, apagar" cancelLabel="Voltar" pending={pendente === "apagar-produto"} onCancel={() => setApagar(false)}
      onConfirm={async () => {
        const ok = await acao("apagar-produto", { ok: "Produto apagado", falhou: "Não deu pra apagar o produto" },
          () => aplicar(l => l.filter(x => x.id !== produto.id)), { acao: "apagarProduto", dados: { id: produto.id } });
        setApagar(false);
        if (ok) onClose();
      }} /> : null}
  </>);
}

function Recheios({ acao, pendente }) {
  const carga = useAoVivo("recheios");
  const [lista, setLista] = React.useState(null);
  const [novo, setNovo] = React.useState("");
  const atual = lista || carga.dados || [];
  const mudou = lista && JSON.stringify(lista) !== JSON.stringify(carga.dados || []);
  const adicionar = () => {
    const r = novo.trim();
    if (!r || atual.some(x => x.toLowerCase() === r.toLowerCase())) { setNovo(""); return; }
    setLista([...atual, r]); setNovo("");
  };
  const salvar = async () => {
    const ok = await acao("salvar-recheios", { ok: "Recheios salvos", falhou: "Não deu pra salvar os recheios" },
      () => carga.setDados(lista), { acao: "salvarRecheios", dados: { lista } });
    if (ok) setLista(null);
  };
  return (
    <PD.Card header={<div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>Recheios</div>
        <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>O cliente escolhe entre estes ao pedir bolo ou pacote.</div>
      </div>
      {mudou ? <PD.Button size="sm" icon="check" loading={pendente === "salvar-recheios"} onClick={salvar}>Salvar recheios</PD.Button> : null}
    </div>}>
      {carga.estado === "erro" && !carga.dados ? <div style={{ fontSize: "var(--fs-body-s)", color: "var(--text-muted)" }}>Não deu pra carregar: {motivo(carga.erro)}.</div> : <>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {atual.length ? atual.map(r => (
            <span key={r} style={{ display: "inline-flex", alignItems: "center", gap: 2, padding: "3px 4px 3px 10px", borderRadius: "var(--radius-pill)", background: "var(--color-surface-2)", border: "var(--border-hairline) solid var(--color-border)", fontSize: "var(--fs-body-s)" }}>
              {r}
              <button type="button" aria-label={`Tirar ${r}`} onClick={() => setLista(atual.filter(x => x !== r))} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", borderRadius: "var(--radius-pill)" }}><PD.Icon name="x" size={13} /></button>
            </span>
          )) : <span style={{ fontSize: "var(--fs-body-s)", color: "var(--text-muted)" }}>Nenhum recheio cadastrado.</span>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <PD.Input size="sm" placeholder="Novo recheio, ex.: Ninho com Nutella" value={novo} onChange={e => setNovo(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); adicionar(); } }} style={{ flex: 1 }} />
          <PD.Button size="sm" variant="outline" icon="plus" onClick={adicionar}>Adicionar</PD.Button>
        </div>
      </>}
    </PD.Card>
  );
}

function Produtos({ compact, q }) {
  const carga = useAoVivo("produtos");
  const [toastNode, showToast] = useToast();
  const [acao, pendente] = useAcao(showToast);
  const [cat, setCat] = React.useState("todas");
  const [busca, setBusca] = React.useState("");
  const [editar, setEditar] = React.useState(null); // null | "novo" | produto

  if (carga.estado === "erro" && !carga.dados) return <ErroCarga erro={carga.erro} oque="os produtos" onTentar={carga.tentar} />;
  if (!carga.dados) return <Carregando oque="produtos" />;

  const todos = carga.dados;
  const categorias = [...new Set(todos.map(p => p.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const termo = (busca || q || "").toLowerCase();
  const lista = todos.filter(p => (cat === "todas" || p.categoria === cat) && (!termo || [p.nome, p.categoria, p.ingredientes].some(v => String(v || "").toLowerCase().includes(termo))));
  const grupos = categorias.filter(c => lista.some(p => p.categoria === c));
  const aplicar = fn => { if (!REAL_P()) carga.setDados(fn); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
      <div style={{ display: "flex", gap: "var(--gap-inline)", flexWrap: "wrap", alignItems: "center" }}>
        <PD.FilterPill active={cat === "todas"} trailingIcon={null} onClick={() => setCat("todas")}>Todas · {todos.length}</PD.FilterPill>
        {categorias.map(c => <PD.FilterPill key={c} active={cat === c} trailingIcon={null} onClick={() => setCat(c)}>{c} · {todos.filter(p => p.categoria === c).length}</PD.FilterPill>)}
        <div style={{ flex: 1 }} />
        <div style={{ width: compact ? "100%" : 240 }}><PD.SearchInput placeholder="Buscar produto" value={busca} onChange={e => setBusca(e.target.value)} onClear={() => setBusca("")} /></div>
        <PD.Button size="sm" icon="plus" onClick={() => setEditar("novo")}>Novo produto</PD.Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "1.6fr 1fr", gap: 12, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {grupos.length ? grupos.map(c => (
            <PD.Card key={c} header={<div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>{c}</div>}
              bodyStyle={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {lista.filter(p => p.categoria === c).map(p => (
                <PD.ListRow key={p.id} avatar={<Foto url={p.imagem} />} title={<span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ opacity: p.ativo === false ? 0.6 : 1 }}>{p.nome}</span>
                    {p.destaque ? <PD.Badge tone="accent" icon="star">Destaque</PD.Badge> : null}
                    {p.ativo === false ? <PD.Badge icon="eye-off">Fora do site</PD.Badge> : null}
                  </span>}
                  subtitle={[p.qtdMin > 1 ? `mínimo ${p.qtdMin}` : null, p.ingredientes].filter(Boolean).join(" · ") || null}
                  value={p.preco} valueSub={p.qtdMin > 1 ? "por unidade" : null} onClick={() => setEditar(p)} />
              ))}
            </PD.Card>
          )) : <PD.Card padded={false}><PD.EmptyState icon={termo ? "search-x" : "package"}
              title={termo ? `Nenhum produto encontrado para “${busca || q}”` : "Nenhum produto cadastrado"}
              description={termo ? "A busca procura no nome, na categoria e nos ingredientes." : "Cadastre os produtos que o site vende: nome, categoria, preço e foto."} /></PD.Card>}
        </div>
        <Recheios acao={acao} pendente={pendente} />
      </div>

      {editar ? <ProdutoModal produto={editar === "novo" ? null : editar} categorias={categorias} onClose={() => setEditar(null)}
        onToast={showToast} acao={acao} pendente={pendente} aplicar={aplicar} /> : null}
      {toastNode}
    </div>
  );
}

Object.assign(window, { Produtos });
