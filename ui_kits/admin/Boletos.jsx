const BL = window.DLuhFestasDesignSystem_c861a2;

/* Boleto = o pai (fornecedor, nota, CNPJ) com as parcelas dentro. Quem aparece na agenda e no caixa
   é a parcela; clicar nela em qualquer lugar abre o pai (Financeiro → Boletos), com a parcela marcada.
   Formato guardado em sis_financeiro (backend/worker/src/financeiro.js): centavos, datas AAAA-MM-DD. */

const PERIODOS_BOLETO = [{ value: "semanal", label: "Semanal", dias: 7 }, { value: "quinzenal", label: "Quinzenal", dias: 14 }, { value: "mensal", label: "Mensal", meses: 1 }];
const rotuloPeriodo = k => (PERIODOS_BOLETO.find(p => p.value === k) || {}).label || "";
const SIT_TOM = { "Pago": "success", "Vencido": "danger", "Vence hoje": "warn", "A vencer": "neutral" };

const pad2 = n => String(n).padStart(2, "0");
const isoDia = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const dataBR = iso => iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : "—";
const diaMes = iso => iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : "—";
const brlC = c => window.brl((c || 0) / 100);
const numReais = v => Number(String(v || "").replace(",", ".")) || 0;
const emCentavos = v => Math.round(numReais(v) * 100);
const emReais = c => c ? (c / 100).toFixed(2) : "";

/* Boleto lançado antes das parcelas existirem (um documento por parcela) vira um pai de uma parcela só. */
function parcelasDoBoleto(b) {
  if (Array.isArray(b.parcelas)) return b.parcelas;
  return [{ n: 1, venc: b.venc || "", valor: b.valor || 0, codigo: b.codigo || "", arquivos: [], pago: !!b.pago, pagoEm: b.pagoEm || null }];
}
const situacaoParcela = (p, hoje) => p.pago ? "Pago" : p.venc < hoje ? "Vencido" : p.venc === hoje ? "Vence hoje" : "A vencer";

/* Datas a partir do primeiro vencimento; o total dividido em centavos, com a sobra nas primeiras
   (R$ 308,77 em 3 → 102,93 + 102,92 + 102,92, como vem na nota). */
function gerarParcelas({ inicio, periodo, qtd, total }) {
  const p = PERIODOS_BOLETO.find(x => x.value === periodo) || PERIODOS_BOLETO[0];
  const [a, m, d] = inicio.split("-").map(Number);
  const base = Math.floor(total / qtd), sobra = total - base * qtd;
  return Array.from({ length: qtd }, (_, i) => {
    let venc;
    if (p.meses) {
      const ultimo = new Date(a, m - 1 + i * p.meses + 1, 0).getDate(); // 31/01 → 28/02, não 03/03
      venc = isoDia(new Date(a, m - 1 + i * p.meses, Math.min(d, ultimo)));
    } else venc = isoDia(new Date(a, m - 1, d + i * p.dias));
    return { venc, valor: total ? base + (i < sobra ? 1 : 0) : 0 };
  });
}

/* Cada parcela na agenda, no dia do vencimento. */
function boletosNaAgenda(docs, hoje) {
  return (docs || []).filter(b => b.tipo === "boleto").flatMap(b => {
    const ps = parcelasDoBoleto(b);
    return ps.filter(p => p.venc).map(p => ({
      tipo: "boleto", data: p.venc, cliente: b.desc || "Boleto", valor: brlC(p.valor),
      titulo: ps.length > 1 ? `Parcela ${p.n} de ${ps.length}` : "Parcela única",
      parcela: ps.length > 1 ? `${p.n}/${ps.length}` : null, situacao: situacaoParcela(p, hoje),
      boletoId: b.id, n: p.n
    }));
  });
}

/* Parcelas pagas no mês, como saídas do caixa (Financeiro → Transações). */
function parcelasPagasNoMes(docs, mes) {
  return (docs || []).filter(b => b.tipo === "boleto").flatMap(b => {
    const ps = parcelasDoBoleto(b);
    return ps.filter(p => p.pago && (p.pagoEm || "").startsWith(mes)).map(p => ({
      id: `${b.id}-${p.n}`, fonte: "boleto", boletoId: b.id, n: p.n, entrada: false, meio: "Boleto", data: p.pagoEm, valor: p.valor,
      desc: `Boleto · ${b.desc}${ps.length > 1 ? ` · ${p.n}/${ps.length}` : ""}`
    }));
  });
}

/* ── Fotos e PDFs ── */

/* Imagem sai do aparelho reduzida (lado maior 2000px: o código de barras continua legível); PDF vai
   como está, até 5 MB. */
async function lerArquivo(arq) {
  if (/^image\//.test(arq.type)) return { dataUrl: await window.reduzirImagem(arq, 2000), pdf: false };
  if (arq.type !== "application/pdf") throw new Error("Escolha uma foto ou um PDF");
  if (arq.size > 5 * 1024 * 1024) throw new Error("PDF maior que 5 MB");
  const dataUrl = await new Promise((ok, falha) => {
    const r = new FileReader();
    r.onload = () => ok(r.result); r.onerror = () => falha(new Error("Não deu pra ler o PDF"));
    r.readAsDataURL(arq);
  });
  return { dataUrl, pdf: true };
}

function Miniatura({ a, tamanho = 56, onTirar }) {
  return <span style={{ position: "relative", flex: "0 0 auto" }}>
    <a href={a.url} target="_blank" rel="noopener noreferrer" title={a.nome || (a.pdf ? "PDF" : "Foto")} onClick={e => e.stopPropagation()} style={{
      width: tamanho, height: tamanho, borderRadius: "var(--radius-sm)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--color-surface-3)", border: "var(--border-hairline) solid var(--color-border)", color: "var(--text-body)", textDecoration: "none"
    }}>
      {a.pdf ? <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: "var(--fs-micro)", fontWeight: "var(--fw-semibold)" }}><BL.Icon name="file-text" size={20} />PDF</span>
        : <img src={a.url} alt={a.nome || "Foto do boleto"} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
    </a>
    {onTirar ? <button type="button" aria-label="Tirar arquivo" onClick={onTirar} style={{
      position: "absolute", top: -7, right: -7, width: 24, height: 24, borderRadius: "var(--radius-pill)", border: "var(--border-hairline) solid var(--color-border)",
      background: "var(--color-surface)", color: "var(--text-body)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0
    }}><BL.Icon name="x" size={13} /></button> : null}
  </span>;
}

/* Lista de fotos/PDFs de um pai ou de uma parcela. Sem `onChange` só mostra. */
function Anexos({ arquivos, onChange, enviar, rotulo = "Foto", tamanho = 56 }) {
  const [subindo, setSubindo] = React.useState(false);
  const lista = arquivos || [];
  const escolher = async e => {
    const arqs = [...(e.target.files || [])];
    e.target.value = "";
    if (!arqs.length) return;
    setSubindo(true);
    let novos = [];
    try {
      for (const arq of arqs) {
        const r = await enviar(await lerArquivo(arq));
        if (!r) break; // o envio falhou e já avisou
        novos = [...novos, { url: r.url, nome: arq.name.slice(0, 120), pdf: !!r.pdf }];
      }
    } catch (err) { enviar.avisar && enviar.avisar(err.message); }
    finally { setSubindo(false); if (novos.length) onChange([...lista, ...novos].slice(0, 10)); }
  };
  if (!onChange && !lista.length) return null;
  return <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
    {lista.map((a, i) => <Miniatura key={a.url + i} a={a} tamanho={tamanho} onTirar={onChange ? () => onChange(lista.filter((_, k) => k !== i)) : null} />)}
    {onChange && lista.length < 10 ? <label style={{
      width: tamanho, height: tamanho, borderRadius: "var(--radius-sm)", border: "var(--border-hairline) dashed var(--color-border)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: subindo ? "wait" : "pointer",
      color: "var(--text-accent)", fontSize: "var(--fs-micro)", fontWeight: "var(--fw-semibold)", textAlign: "center"
    }}>
      <BL.Icon name={subindo ? "loader" : "image-plus"} size={18} />{subindo ? "Enviando" : rotulo}
      <input type="file" accept="image/*,application/pdf" multiple hidden disabled={subindo} onChange={escolher} />
    </label> : null}
  </div>;
}

const Secao = ({ titulo, extra, children }) => <div style={{ marginTop: 18 }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
    <span style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)" }}>{titulo}</span>
    <span style={{ flex: 1 }} />{extra}
  </div>
  {children}
</div>;

/* ── Formulário: escolhe fornecedor, primeiro vencimento, período, parcelas e total; as parcelas
   saem geradas, cada uma com espaço para o código e a foto. ── */
function BoletoForm({ item, fornecedores, hoje, onClose, onSave, salvando, enviar }) {
  const [v, setV] = React.useState(() => {
    if (!item) return { desc: "", cnpj: "Atual", inicio: hoje, periodo: "semanal", qtd: "1", total: "", arquivos: [], parcelas: [{ venc: hoje, valor: "", codigo: "", arquivos: [] }] };
    const ps = parcelasDoBoleto(item);
    return {
      desc: item.desc || "", cnpj: item.cnpjAntigo ? "Antigo" : "Atual", inicio: ps[0]?.venc || hoje, periodo: item.periodo || "semanal",
      qtd: String(ps.length), total: emReais(ps.reduce((s, p) => s + (p.valor || 0), 0)), arquivos: item.arquivos || [],
      parcelas: ps.map(p => ({ venc: p.venc, valor: emReais(p.valor), codigo: p.codigo || "", arquivos: p.arquivos || [], pago: p.pago, pagoEm: p.pagoEm }))
    };
  });
  const [tentou, setTentou] = React.useState(false);

  /* Mudou o cabeçalho → refaz datas e valores; código, foto e pagamento ficam com a mesma parcela. */
  const cabeca = (campo, valor) => setV(atual => {
    const nv = { ...atual, [campo]: valor };
    const qtd = Math.trunc(Number(nv.qtd));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nv.inicio) || !(qtd >= 1 && qtd <= 60)) return nv;
    const geradas = gerarParcelas({ inicio: nv.inicio, periodo: nv.periodo, qtd, total: emCentavos(nv.total) });
    return { ...nv, parcelas: geradas.map((g, i) => ({ codigo: "", arquivos: [], ...atual.parcelas[i], venc: g.venc, valor: emReais(g.valor) })) };
  });
  const parcela = (i, campo, valor) => setV(atual => ({ ...atual, parcelas: atual.parcelas.map((p, k) => k === i ? { ...p, [campo]: valor } : p) }));

  const soma = v.parcelas.reduce((s, p) => s + emCentavos(p.valor), 0);
  const qtdOk = Number(v.qtd) >= 1 && Number(v.qtd) <= 60 && Number.isInteger(Number(v.qtd));
  const erros = {
    desc: !v.desc.trim() && "Escolha o fornecedor",
    inicio: !v.inicio && "Escolha a data",
    qtd: !qtdOk && "De 1 a 60 parcelas",
    total: !(numReais(v.total) > 0) && "Digite o valor total"
  };
  const parcelaRuim = p => !p.venc || !(numReais(p.valor) > 0);
  const temErro = Object.values(erros).some(Boolean) || v.parcelas.some(parcelaRuim);
  const mostrar = tentou ? erros : {};

  const salvar = () => {
    setTentou(true);
    if (temErro) return;
    onSave({
      desc: v.desc.trim(), cnpjAntigo: v.cnpj === "Antigo", periodo: v.periodo, arquivos: v.arquivos,
      parcelas: v.parcelas.map(p => ({ venc: p.venc, valor: emCentavos(p.valor), codigo: String(p.codigo || "").trim(), arquivos: p.arquivos || [] }))
    });
  };

  return (
    <BL.Modal width={660} title={item ? "Editar boleto" : "Novo boleto"} onClose={salvando ? null : onClose} dismissible={false}
      subtitle="Cada parcela aparece na agenda no dia do vencimento."
      footer={<><BL.Button variant="ghost" block disabled={salvando} onClick={onClose}>Cancelar</BL.Button>
        <BL.Button block icon="check" loading={salvando} onClick={salvar}>{item ? "Salvar" : "Registrar"}</BL.Button></>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "10px 12px" }}>
        <BL.Field label="Fornecedor" required error={mostrar.desc}>
          <BL.Input list="dluh-fornecedores" placeholder="Ex.: Delly's" invalid={!!mostrar.desc} value={v.desc} onChange={e => setV({ ...v, desc: e.target.value })} />
          <datalist id="dluh-fornecedores">{fornecedores.map(f => <option key={f} value={f} />)}</datalist>
        </BL.Field>
        <BL.Field label="CNPJ"><BL.Select options={["Atual", "Antigo"]} value={v.cnpj} onChange={e => setV({ ...v, cnpj: e.target.value })} /></BL.Field>
        <BL.Field label="Primeiro vencimento" required error={mostrar.inicio}>
          <BL.Input type="date" invalid={!!mostrar.inicio} value={v.inicio} onChange={e => cabeca("inicio", e.target.value)} />
        </BL.Field>
        <BL.Field label="Período"><BL.Select options={PERIODOS_BOLETO} value={v.periodo} onChange={e => cabeca("periodo", e.target.value)} /></BL.Field>
        <BL.Field label="Parcelas" required error={mostrar.qtd}>
          <BL.Input type="number" inputMode="numeric" min="1" max="60" invalid={!!mostrar.qtd} value={v.qtd} onChange={e => cabeca("qtd", e.target.value)} />
        </BL.Field>
        <BL.Field label="Valor total" required error={mostrar.total}>
          <BL.Input type="number" step="0.01" min="0" prefix="R$" invalid={!!mostrar.total} value={v.total} onChange={e => cabeca("total", e.target.value)} />
        </BL.Field>
      </div>

      <Secao titulo="Nota e fotos do boleto">
        <Anexos arquivos={v.arquivos} onChange={a => setV(x => ({ ...x, arquivos: a }))} enviar={enviar} rotulo="Nota" />
      </Secao>

      <Secao titulo={`Parcelas · ${v.parcelas.length}`} extra={soma !== emCentavos(v.total) && numReais(v.total) > 0
        ? <span style={{ fontSize: "var(--fs-tiny)", color: "var(--action-warn)" }}>Somam {brlC(soma)}, o total salvo será esse</span> : null}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {v.parcelas.map((p, i) => {
            const ruim = tentou && parcelaRuim(p);
            return <div key={i} style={{ padding: "10px 12px", borderRadius: "var(--radius-sm)", background: "var(--color-surface-2)",
              border: "var(--border-hairline) solid " + (ruim ? "var(--action-danger)" : "var(--color-border-soft)") }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ minWidth: 28, fontWeight: "var(--fw-bold)", color: "var(--text-strong)", fontVariantNumeric: "tabular-nums" }}>{i + 1}ª</span>
                <BL.Input type="date" aria-label={`Vencimento da parcela ${i + 1}`} invalid={tentou && !p.venc} value={p.venc} onChange={e => parcela(i, "venc", e.target.value)} style={{ flex: "1 1 140px" }} />
                <BL.Input type="number" step="0.01" min="0" prefix="R$" aria-label={`Valor da parcela ${i + 1}`} invalid={tentou && !(numReais(p.valor) > 0)} value={p.valor} onChange={e => parcela(i, "valor", e.target.value)} style={{ flex: "1 1 120px" }} />
                {p.pago ? <BL.Badge tone="success" icon="check">Paga</BL.Badge> : null}
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                <BL.Input aria-label={`Código do boleto da parcela ${i + 1}`} placeholder="Código do boleto (linha digitável)" value={p.codigo} maxLength={80}
                  onChange={e => parcela(i, "codigo", e.target.value)} style={{ flex: "1 1 240px" }} />
                <Anexos arquivos={p.arquivos} onChange={a => parcela(i, "arquivos", a)} enviar={enviar} tamanho={42} />
              </div>
            </div>;
          })}
        </div>
      </Secao>
    </BL.Modal>
  );
}

/* ── O pai aberto: nota, CNPJ e as parcelas, cada uma com código, foto e pagamento. ── */
function BoletoDetalhe({ boleto, destaque, hoje, onClose, onEditar, onApagar, onPagar, pendente, onCopiar }) {
  const ps = parcelasDoBoleto(boleto);
  const pagas = ps.filter(p => p.pago).length;
  const marcada = React.useRef(null);
  React.useEffect(() => { marcada.current && marcada.current.scrollIntoView({ block: "center" }); }, []);
  return (
    <BL.Modal width={620} title={boleto.desc || "Boleto"} onClose={onClose}
      subtitle={[ps.length > 1 ? `${ps.length} parcelas` : "Parcela única", rotuloPeriodo(boleto.periodo), "total " + brlC(ps.reduce((s, p) => s + (p.valor || 0), 0))].filter(Boolean).join(" · ")}
      footer={<><BL.Button variant="ghost" tone="danger" icon="trash-2" block onClick={onApagar}>Apagar</BL.Button>
        <BL.Button icon="pencil" block onClick={onEditar}>Editar</BL.Button></>}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {pagas === ps.length ? <BL.Badge tone="success" icon="check">Pago</BL.Badge> : <BL.Badge tone="warn" icon="clock">{pagas} de {ps.length} {ps.length === 1 ? "paga" : "pagas"}</BL.Badge>}
        {boleto.cnpjAntigo ? <BL.Badge icon="building">CNPJ antigo</BL.Badge> : null}
      </div>
      {(boleto.arquivos || []).length ? <Secao titulo="Nota e fotos"><Anexos arquivos={boleto.arquivos} tamanho={72} /></Secao> : null}
      <Secao titulo="Parcelas">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ps.map(p => {
            const sit = situacaoParcela(p, hoje), eh = destaque === p.n;
            return <div key={p.n} ref={eh ? marcada : null} style={{ padding: "11px 12px", borderRadius: "var(--radius-sm)",
              background: eh ? "var(--color-accent-soft)" : "var(--color-surface-2)",
              border: "var(--border-hairline) solid " + (eh ? "var(--color-accent)" : "var(--color-border-soft)") }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 160px", minWidth: 0 }}>
                  <div style={{ fontWeight: "var(--fw-semibold)", color: "var(--text-strong)" }}>{ps.length > 1 ? `Parcela ${p.n} de ${ps.length}` : "Parcela única"}</div>
                  <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>
                    vence {dataBR(p.venc)}{p.pago && p.pagoEm ? ` · paga em ${dataBR(p.pagoEm)}` : ""}
                  </div>
                </div>
                <span style={{ fontWeight: "var(--fw-bold)", color: "var(--text-strong)", whiteSpace: "nowrap" }}>{brlC(p.valor)}</span>
                <BL.Badge tone={SIT_TOM[sit]}>{sit}</BL.Badge>
                {p.pago
                  ? <BL.Button size="sm" variant="ghost" loading={pendente === `pagar-${boleto.id}-${p.n}`} onClick={() => onPagar(p.n, false)}>Desfazer</BL.Button>
                  : <BL.Button size="sm" variant="outline" icon="check" loading={pendente === `pagar-${boleto.id}-${p.n}`} onClick={() => onPagar(p.n, true)}>Marcar paga</BL.Button>}
              </div>
              {p.codigo || (p.arquivos || []).length ? <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 9, flexWrap: "wrap" }}>
                {p.codigo ? <button type="button" onClick={() => onCopiar(p.codigo)} title="Copiar código" style={{
                  flex: "1 1 240px", minWidth: 0, display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: "var(--radius-xs)",
                  border: "var(--border-hairline) solid var(--color-border)", background: "var(--color-surface)", cursor: "pointer", color: "var(--text-body)",
                  fontFamily: "var(--font-mono, monospace)", fontSize: "var(--fs-tiny)", textAlign: "left"
                }}><span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{p.codigo}</span><BL.Icon name="copy" size={14} /></button> : null}
                <Anexos arquivos={p.arquivos} tamanho={42} />
              </div> : null}
            </div>;
          })}
        </div>
      </Secao>
    </BL.Modal>
  );
}

/* ── A aba Boletos: um pai por linha; em aberto primeiro (pelo próximo vencimento), depois os pagos. ── */
function ListaBoletos({ boletos, hoje, onAbrir, compact }) {
  const linhas = boletos.map(b => {
    const ps = parcelasDoBoleto(b);
    const abertas = ps.filter(p => !p.pago).sort((x, y) => x.venc.localeCompare(y.venc));
    return { b, ps, abertas, prox: abertas[0], ultima: ps.map(p => p.venc).sort().at(-1) || "" };
  }).sort((x, y) => (!x.prox - !y.prox) || (x.prox ? x.prox.venc.localeCompare(y.prox.venc) : y.ultima.localeCompare(x.ultima)));
  return linhas.map(({ b, ps, abertas, prox, ultima }) => {
    const sit = prox ? situacaoParcela(prox, hoje) : "Pago";
    const rotulo = sit === "A vencer" ? "Em aberto" : sit;
    const pagas = prox && ps.length > 1 ? `${ps.length - abertas.length}/${ps.length} pagas` : null;
    const sub = [ps.length > 1 ? `${ps.length} parcelas` : "parcela única", compact ? null : rotuloPeriodo(b.periodo).toLowerCase() || null,
      prox ? `${sit === "Vencido" ? "venceu" : "próxima"} ${diaMes(prox.venc)}` : `última ${diaMes(ultima)}`, b.cnpjAntigo ? "CNPJ antigo" : null].filter(Boolean).join(" · ");
    /* No celular o selo não cabe ao lado do valor: a situação desce para baixo dele. */
    return <BL.ListRow key={b.id} icon={compact ? null : "receipt"} title={b.desc || "Sem fornecedor"} subtitle={sub} onClick={() => onAbrir(b.id)}
      value={brlC(ps.reduce((s, p) => s + (p.valor || 0), 0))} valueSub={compact ? [rotulo, pagas].filter(Boolean).join(" · ") : pagas}
      trailing={compact ? null : <BL.Badge tone={SIT_TOM[sit]} style={{ marginLeft: 10 }}>{rotulo}</BL.Badge>} />;
  });
}

Object.assign(window, { BoletoForm, BoletoDetalhe, ListaBoletos, boletosNaAgenda, parcelasPagasNoMes, parcelasDoBoleto, gerarParcelas, situacaoParcela });
