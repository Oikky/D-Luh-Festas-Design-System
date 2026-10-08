const CT = window.DLuhFestasDesignSystem_c861a2;

/* Cartões da loja e as compras feitas neles. A compra cai na fatura pelo dia de fechamento;
   parcelada, cada parcela vai numa fatura seguinte. Nada disso sai do caixa até a fatura ser paga:
   pagar a fatura é uma saída só, no dia. Mesmas contas de backend/worker/src/financeiro.js. */

const MESES_CT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const pad2c = n => String(n).padStart(2, "0");
const mesSoma = (mes, n) => { const t = Number(mes.slice(0, 4)) * 12 + Number(mes.slice(5, 7)) - 1 + n; return `${Math.floor(t / 12)}-${pad2c(t % 12 + 1)}`; };
const diaDoMes = (mes, dia) => `${mes}-${pad2c(Math.min(dia, new Date(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)), 0).getDate()))}`;
const nomeFatura = mes => `${MESES_CT[Number(mes.slice(5, 7)) - 1]}/${mes.slice(0, 4)}`;
const brlCt = c => window.brl((c || 0) / 100);
const dataCt = iso => iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : "—";
const reaisCt = v => Number(String(v || "").replace(",", ".")) || 0;

function faturaDaData(dia, fecha) {
  const mes = dia.slice(0, 7);
  return fecha && dia >= diaDoMes(mes, fecha) ? mesSoma(mes, 1) : mes;
}
function parcelasDaCompra(c, fecha) {
  const n = c.parcelas || 1, base = Math.floor((c.valor || 0) / n), sobra = (c.valor || 0) - base * n;
  const primeira = faturaDaData(c.data, fecha);
  return Array.from({ length: n }, (_, i) => ({ n: i + 1, de: n, fatura: mesSoma(primeira, i), valor: base + (i < sobra ? 1 : 0) }));
}
const vencDaFatura = (mes, { fecha, venc }) => venc ? diaDoMes(fecha && venc <= fecha ? mesSoma(mes, 1) : mes, venc) : null;

/* Todas as faturas de um cartão que têm algo, mais a aberta de hoje. O lançado à parte (`fatura`,
   o que estava na fatura antes de lançar compra por compra) entra na fatura em aberto mais antiga. */
function faturasDoCartao(cartao, compras, hoje) {
  const atual = faturaDaData(hoje, cartao.fecha);
  const pagas = cartao.faturas || {};
  const linhas = compras.flatMap(c => parcelasDaCompra(c, cartao.fecha).map(p => ({ ...p, compra: c })));
  const meses = [...new Set([atual, ...linhas.map(l => l.fatura), ...Object.keys(pagas)])].sort();
  const comOutros = cartao.fatura ? meses.find(m => !pagas[m] && m <= atual) || atual : null;
  return meses.map(mes => {
    const itens = linhas.filter(l => l.fatura === mes).sort((a, b) => b.compra.data.localeCompare(a.compra.data));
    const paga = pagas[mes] || null;
    const outros = paga ? paga.outros || 0 : mes === comOutros ? cartao.fatura : 0;
    const total = paga ? paga.valor : itens.reduce((s, l) => s + l.valor, 0) + outros;
    const venc = vencDaFatura(mes, cartao);
    const situacao = paga ? "Paga" : mes > atual ? "Futura" : mes === atual ? "Aberta" : venc && venc < hoje ? "Vencida" : "Fechada";
    return { mes, itens, outros, total, venc, paga, situacao };
  });
}
const usadoDoCartao = fs => fs.filter(f => !f.paga).reduce((s, f) => s + f.total, 0);
const comprasDe = (docs, id) => (docs || []).filter(x => x.tipo === "compra" && x.cartaoId === id);
const SIT_FATURA = { Paga: "success", Vencida: "danger", Fechada: "warn", Aberta: "accent", Futura: "neutral" };

/* Faturas pagas no mês, como saídas do caixa (Financeiro → Transações). */
function faturasPagasNoMes(docs, mes) {
  return (docs || []).filter(x => x.tipo === "cartao").flatMap(c => Object.entries(c.faturas || {})
    .filter(([, f]) => (f.pagoEm || "").startsWith(mes)).map(([m, f]) => ({
      id: `${c.id}-${m}`, fonte: "fatura", cartaoId: c.id, mesFatura: m, entrada: false, meio: f.meio || "Pix", data: f.pagoEm, valor: f.valor,
      desc: `Fatura ${c.nome || "cartão"} final ${c.final || "—"} · ${nomeFatura(m)}`
    })));
}

/* Cada fatura com valor na agenda, no dia do vencimento. */
function faturasNaAgenda(docs, hoje) {
  return (docs || []).filter(x => x.tipo === "cartao").flatMap(c => faturasDoCartao(c, comprasDe(docs, c.id), hoje)
    .filter(f => f.venc && f.total > 0 && f.situacao !== "Futura").map(f => ({
      tipo: "cartao", data: f.venc, cliente: `${c.nome || "Cartão"} final ${c.final || "—"}`, valor: brlCt(f.total),
      titulo: `Fatura de ${nomeFatura(f.mes)}`, situacao: f.paga ? "Pago" : f.venc < hoje ? "Vencido" : f.venc === hoje ? "Vence hoje" : "A vencer",
      cartaoId: c.id, mesFatura: f.mes
    })));
}

/* ── A aba Cartões: um cartão por linha, com a fatura aberta e quanto do limite sobra. ── */
function ListaCartoes({ cartoes, docs, hoje, onAbrir, compact }) {
  return cartoes.map(c => {
    const fs = faturasDoCartao(c, comprasDe(docs, c.id), hoje);
    const aberta = fs.find(f => f.situacao === "Aberta");
    const pendente = fs.find(f => f.situacao === "Vencida" || f.situacao === "Fechada");
    const livre = (c.limite || 0) - usadoDoCartao(fs);
    const sub = [compact ? null : c.bandeira, c.fecha ? `fecha dia ${c.fecha}` : null, c.venc ? `vence dia ${c.venc}` : null,
      c.limite ? `livre ${brlCt(livre)}` : null].filter(Boolean).join(" · ");
    return <CT.ListRow key={c.id} icon={compact ? null : "credit-card"} title={(c.nome || "Cartão") + " · final " + (c.final || "—")} subtitle={sub}
      onClick={() => onAbrir(c.id)} value={brlCt(aberta ? aberta.total : 0)}
      valueSub={pendente ? `${pendente.situacao === "Vencida" ? "vencida" : "fechada"} ${nomeFatura(pendente.mes)}: ${brlCt(pendente.total)}` : "fatura aberta"} />;
  });
}

/* ── Detalhe: uma fatura por vez (‹ mês ›), com as compras dela, pagar/desfazer e nova compra. ── */
function CartaoDetalhe({ cartao, docs, hoje, mesInicial, pendente, onClose, onEditar, onApagar, onNovaCompra, onAbrirCompra, onPagar, onDesfazer }) {
  const fs = faturasDoCartao(cartao, comprasDe(docs, cartao.id), hoje);
  const inicial = fs.find(f => f.mes === mesInicial) || fs.find(f => f.situacao === "Vencida" || f.situacao === "Fechada") || fs.find(f => f.situacao === "Aberta");
  const [mes, setMes] = React.useState(inicial.mes);
  const i = Math.max(0, fs.findIndex(f => f.mes === mes)), f = fs[i];
  const usado = usadoDoCartao(fs);
  const acaoFatura = pendente === `fatura-${cartao.id}-${f.mes}`;
  return (
    <CT.Modal width={620} title={(cartao.nome || "Cartão") + " · final " + (cartao.final || "—")} onClose={onClose}
      subtitle={[cartao.bandeira, cartao.fecha ? `fecha dia ${cartao.fecha}` : "sem dia de fechamento", cartao.venc ? `vence dia ${cartao.venc}` : null].filter(Boolean).join(" · ")}
      footer={<><CT.Button variant="ghost" tone="danger" icon="trash-2" block onClick={onApagar}>Apagar</CT.Button>
        <CT.Button variant="outline" icon="pencil" block onClick={onEditar}>Editar</CT.Button>
        <CT.Button icon="plus" block onClick={onNovaCompra}>Nova compra</CT.Button></>}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {cartao.limite ? <CT.Badge icon="gauge">Usado {brlCt(usado)} de {brlCt(cartao.limite)}</CT.Badge> : null}
        {cartao.limite ? <CT.Badge tone={cartao.limite - usado < 0 ? "danger" : "success"} icon="wallet">Livre {cartao.limite - usado < 0 ? "− " : ""}{brlCt(Math.abs(cartao.limite - usado))}</CT.Badge> : null}
        {!cartao.fecha ? <CT.Badge tone="warn" icon="info">Sem fechamento: a compra cai no mês dela</CT.Badge> : null}
      </div>

      <div style={{ marginTop: 18, padding: "14px 14px 12px", borderRadius: "var(--radius-sm)", background: "var(--color-surface-2)", border: "var(--border-hairline) solid var(--color-border-soft)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CT.IconButton icon="chevron-left" label="Fatura anterior" size={34} disabled={i === 0} onClick={() => setMes(fs[i - 1].mes)} />
          <div style={{ flex: 1, textAlign: "center", minWidth: 0 }}>
            <div style={{ fontWeight: "var(--fw-semibold)", color: "var(--text-strong)" }}>Fatura de {nomeFatura(f.mes)}</div>
            <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>
              {f.paga ? `paga em ${dataCt(f.paga.pagoEm)} · ${f.paga.meio}` : f.venc ? `vence ${dataCt(f.venc)}` : "sem dia de vencimento"}
            </div>
          </div>
          <CT.IconButton icon="chevron-right" label="Próxima fatura" size={34} disabled={i === fs.length - 1} onClick={() => setMes(fs[i + 1].mes)} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-bold)", color: "var(--text-strong)", fontVariantNumeric: "tabular-nums" }}>{brlCt(f.total)}</span>
          <CT.Badge tone={SIT_FATURA[f.situacao]}>{f.situacao}</CT.Badge>
          <span style={{ flex: 1 }} />
          {f.paga
            ? <CT.Button size="sm" variant="ghost" loading={acaoFatura} onClick={() => onDesfazer(f.mes)}>Desfazer pagamento</CT.Button>
            : f.total > 0 ? <CT.Button size="sm" variant="outline" icon="check" loading={acaoFatura} onClick={() => onPagar(f)}>Pagar fatura</CT.Button> : null}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
        {f.outros ? <CT.ListRow icon="layers" title="Lançado à parte" subtitle="o que já estava na fatura antes das compras" value={brlCt(f.outros)} /> : null}
        {f.itens.map(l => <CT.ListRow key={l.compra.id + "-" + l.n} icon="shopping-bag" title={l.compra.desc || "Compra"}
          subtitle={[dataCt(l.compra.data), l.de > 1 ? `parcela ${l.n}/${l.de} de ${brlCt(l.compra.valor)}` : null].filter(Boolean).join(" · ")}
          value={brlCt(l.valor)} onClick={() => onAbrirCompra(l.compra)} />)}
        {!f.outros && !f.itens.length ? <CT.EmptyState icon="shopping-bag" title="Nada nesta fatura"
          description="Lance cada compra feita no cartão: ela cai na fatura certa pelo dia de fechamento." /> : null}
      </div>
    </CT.Modal>
  );
}

/* Pagar a fatura: dia e forma; o total vira uma saída do caixa. */
function PagarFatura({ cartao, fatura, hoje, salvando, onClose, onSave }) {
  const [v, setV] = React.useState({ data: hoje, meio: "Pix" });
  return (
    <CT.Modal width={420} title={`Pagar fatura de ${nomeFatura(fatura.mes)}`} subtitle={`${cartao.nome} final ${cartao.final} · ${brlCt(fatura.total)}`}
      onClose={salvando ? null : onClose} dismissible={false}
      footer={<><CT.Button variant="ghost" block disabled={salvando} onClick={onClose}>Cancelar</CT.Button>
        <CT.Button block icon="check" loading={salvando} disabled={!/^\d{4}-\d{2}-\d{2}$/.test(v.data)} onClick={() => onSave(v)}>Pagar {brlCt(fatura.total)}</CT.Button></>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "10px 12px" }}>
        <CT.Field label="Pago em" required><CT.Input type="date" value={v.data} onChange={e => setV({ ...v, data: e.target.value })} /></CT.Field>
        <CT.Field label="Forma"><CT.Select options={["Pix", "Boleto", "Transferência", "Dinheiro"]} value={v.meio} onChange={e => setV({ ...v, meio: e.target.value })} /></CT.Field>
      </div>
      <p style={{ margin: "12px 0 0", fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>Sai do caixa no dia do pagamento, como uma saída só.</p>
    </CT.Modal>
  );
}

/* Nova compra (ou corrigir): mostra em quais faturas ela vai cair antes de salvar. */
function CompraForm({ item, cartoes, cartaoId, hoje, salvando, onClose, onSave, onApagar }) {
  const [v, setV] = React.useState(() => item
    ? { cartaoId: item.cartaoId, desc: item.desc || "", data: item.data, valor: ((item.valor || 0) / 100).toFixed(2), parcelas: String(item.parcelas || 1) }
    : { cartaoId: cartaoId || (cartoes[0] && cartoes[0].id), desc: "", data: hoje, valor: "", parcelas: "1" });
  const [tentou, setTentou] = React.useState(false);
  const cartao = cartoes.find(c => c.id === v.cartaoId);
  const valor = Math.round(reaisCt(v.valor) * 100), n = Number(v.parcelas);
  const erros = {
    desc: !v.desc.trim() && "Diga o que foi comprado",
    data: !/^\d{4}-\d{2}-\d{2}$/.test(v.data) && "Escolha a data",
    valor: !(valor > 0) && "Digite um valor maior que zero"
  };
  const ok = !Object.values(erros).some(Boolean) && cartao;
  const ps = ok ? parcelasDaCompra({ data: v.data, valor, parcelas: n }, cartao.fecha) : [];
  const onde = !ps.length ? null : n > 1
    ? `${n}x de ${brlCt(ps[ps.length - 1].valor)} · faturas de ${nomeFatura(ps[0].fatura)} a ${nomeFatura(ps[ps.length - 1].fatura)}`
    : `Cai na fatura de ${nomeFatura(ps[0].fatura)}${cartao.venc ? `, que vence ${dataCt(vencDaFatura(ps[0].fatura, cartao))}` : ""}`;
  const mostra = tentou ? erros : {};
  const salvar = () => { setTentou(true); if (ok) onSave({ cartaoId: v.cartaoId, desc: v.desc.trim(), data: v.data, valor, parcelas: n }); };
  return (
    <CT.Modal width={480} title={item ? "Corrigir compra" : "Compra no cartão"} onClose={salvando ? null : onClose} dismissible={false}
      footer={<>{item ? <CT.Button variant="ghost" tone="danger" icon="trash-2" block disabled={salvando} onClick={onApagar}>Apagar</CT.Button>
        : <CT.Button variant="ghost" block disabled={salvando} onClick={onClose}>Cancelar</CT.Button>}
        <CT.Button block icon="check" loading={salvando} onClick={salvar}>{item ? "Salvar" : "Lançar"}</CT.Button></>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: "10px 12px" }}>
        {cartoes.length > 1 ? <CT.Field label="Cartão" style={{ gridColumn: "span 2" }}>
          <CT.Select options={cartoes.map(c => ({ value: c.id, label: `${c.nome} · final ${c.final}` }))} value={v.cartaoId} onChange={e => setV({ ...v, cartaoId: e.target.value })} />
        </CT.Field> : null}
        <CT.Field label="O que foi comprado" required error={mostra.desc} style={{ gridColumn: "span 2" }}>
          <CT.Input value={v.desc} placeholder="Atacadão · farinha e açúcar" invalid={!!mostra.desc} onChange={e => setV({ ...v, desc: e.target.value })} />
        </CT.Field>
        <CT.Field label="Data da compra" required error={mostra.data}><CT.Input type="date" value={v.data} invalid={!!mostra.data} onChange={e => setV({ ...v, data: e.target.value })} /></CT.Field>
        <CT.Field label="Valor total" required error={mostra.valor}>
          <CT.Input type="number" step="0.01" min="0" prefix="R$" value={v.valor} invalid={!!mostra.valor} onChange={e => setV({ ...v, valor: e.target.value })} />
        </CT.Field>
        <CT.Field label="Parcelas" style={{ gridColumn: "span 2" }}>
          <CT.Select options={Array.from({ length: 24 }, (_, k) => ({ value: String(k + 1), label: k ? `${k + 1}x` : "À vista" }))} value={v.parcelas} onChange={e => setV({ ...v, parcelas: e.target.value })} />
        </CT.Field>
      </div>
      {onde ? <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, fontSize: "var(--fs-body-s)", color: "var(--text-body)" }}>
        <CT.Icon name="calendar-check" size={16} style={{ color: "var(--text-muted)", flex: "0 0 auto" }} />{onde}
      </div> : null}
    </CT.Modal>
  );
}

Object.assign(window, { ListaCartoes, CartaoDetalhe, PagarFatura, CompraForm, faturasPagasNoMes, faturasNaAgenda, faturasDoCartao, parcelasDaCompraCartao: parcelasDaCompra });
