const DS = window.DLuhFestasDesignSystem_c861a2;
const { Card, Button, IconButton, Badge, Field, Input, Select, Icon, ListRow, FilterPill } = DS;

/* Contratos. O texto, o preenchimento e o PDF vêm de contratos-motor.js, que é cópia fiel dos dois
   geradores que a loja usava (salão com papel timbrado; buffet com o logo). Aqui fica só a tela:
   o formulário, a prévia, editar o texto e baixar/imprimir.
   Um contrato é { tipo: "salao" | "buffet", dados: { salao: {…}, buffet: {…} }, status,
   htmlProprio (salão com texto escrito à mão), clausulas (buffet com texto mudado), extensoManual }. */
const ctMotor = () => window.DLUH_MOTOR;
const CT_MODELOS = [
  { id: "salao", nome: "Locação do salão", descricao: "D´ROMA Festas: chave, horários, regras de som e danos. Sai no papel timbrado.", icone: "party-popper" },
  { id: "buffet", nome: "Prestação de serviços de buffet", descricao: "D'Luh Festas: equipe, utensílios, horários e pagamento. Sai com o logo.", icone: "chef-hat" }
];
/* O buffet do original não tem grupos; aqui os campos ganham títulos para a tela ficar legível. */
const CT_GRUPOS_BUFFET = [
  { titulo: "Contratante", ids: ["contratante_nome", "contratante_end", "contratante_cpf"] },
  { titulo: "Evento", ids: ["evento_tipo", "data_evento", "local_evento", "inicio", "fim", "duracao", "tolerancia", "convidados", "chegada", "antecedencia"] },
  { titulo: "Equipe", ids: ["garcons", "cozinheiras", "organizadores", "auxiliares"] },
  { titulo: "Pagamento", ids: ["valor_total", "valor_extenso", "entrada", "data_entrada"] },
  { titulo: "Foro e assinatura", ids: ["cidade"] }
];
const CT_SPAN = { c3: 3, c4: 4, c6: 6, c8: 8, c9: 9, c12: 12 };

const ctAgora = () => { const d = new Date(), p = x => String(x).padStart(2, "0"); return p(d.getDate()) + "/" + p(d.getMonth() + 1) + " · " + p(d.getHours()) + ":" + p(d.getMinutes()); };
/* Dinheiro do salão é texto "R$ 700,00" (o original digita em centavos); valores antigos em reais
   ("900" ou "900.5") viram esse formato. */
const ctReaisSalao = v => {
  const s = String(v || "").trim();
  if (!s || /R\$/.test(s) || s.includes(",")) return s;
  const n = Number(s);
  return isNaN(n) ? s : ctMotor().salao.fmtDinheiro(n);
};
/* Contrato novo, ou um salvo (de qualquer versão) completado com o padrão de cada campo. */
function ctNovo(tipo = "salao") {
  const M = ctMotor();
  const buffet = {};
  M.buffet.MODEL.campos.forEach(f => { buffet[f.id] = ""; });
  buffet.cidade = "Montes Claros";
  return { tipo, dados: { salao: M.salao.dadosNovos(), buffet }, status: "Rascunho" };
}
function ctMesclar(c) {
  const base = ctNovo(c && c.tipo === "buffet" ? "buffet" : "salao");
  if (!c) return base;
  const salao = { ...base.dados.salao, ...((c.dados || {}).salao || {}) };
  ["valor_total", "entrada"].forEach(k => { salao[k] = ctReaisSalao(salao[k]); });
  return { ...c, tipo: base.tipo, dados: { salao, buffet: { ...base.dados.buffet, ...((c.dados || {}).buffet || {}) } } };
}
const ctCliente = c => { const d = (c.dados || {})[c.tipo] || {}; return d.contratante_nome || d.nome || "Sem nome"; };
const ctValor = c => {
  const d = (c.dados || {})[c.tipo] || {};
  if (!d.valor_total) return "—";
  return /R\$/.test(d.valor_total) ? d.valor_total : "R$ " + ctMotor().buffet.fmtMoney(d.valor_total);
};

/* Trocar de modelo: se o outro ainda está vazio, leva o que serve dos dois (nome, data, horário, valores). */
function ctTrocar(c, t) {
  const M = ctMotor(), s = c.dados.salao, b = c.dados.buffet;
  if (t === "buffet" && !b.contratante_nome && s.nome) {
    const tot = M.salao.lerDinheiro(s.valor_total), ent = M.salao.lerDinheiro(s.entrada);
    const br = n => n == null ? "" : n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return { tipo: t, dados: { ...c.dados, buffet: { ...b, contratante_nome: s.nome, contratante_end: [s.rua, s.numero, s.complemento, s.bairro].filter(Boolean).join(", "),
      contratante_cpf: s.cpf, evento_tipo: s.tipo_festa, data_evento: s.data_evento, inicio: s.hora_inicio,
      valor_total: br(tot), valor_extenso: tot != null ? M.buffet.extensoReais(br(tot)) : "", entrada: br(ent) } } };
  }
  if (t === "salao" && !s.nome && b.contratante_nome) {
    const tot = M.buffet.parseMoney(b.valor_total), ent = M.buffet.parseMoney(b.entrada);
    return { tipo: t, dados: { ...c.dados, salao: { ...s, nome: b.contratante_nome.toUpperCase(), cpf: M.buffet.validaDoc(b.contratante_cpf || "") && M.salao.soDigitos(b.contratante_cpf).length === 11 ? b.contratante_cpf : s.cpf,
      tipo_festa: (b.evento_tipo || s.tipo_festa).toUpperCase(), data_evento: b.data_evento, hora_inicio: b.inicio || s.hora_inicio,
      valor_total: isNaN(tot) ? "" : M.salao.fmtDinheiro(tot), entrada: isNaN(ent) ? "" : M.salao.fmtDinheiro(ent) } } };
  }
  return { tipo: t };
}

/* Contrato de uma festa do funil, já preenchido com o que a ficha tem (Atendimentos.jsx). */
function ctDaFesta(a, pago) {
  const M = ctMotor(), f = a.festa || {}, tel = window.telDigitos(a.tel);
  const c = ctNovo((f.servicos || []).includes("buffet") ? "buffet" : "salao");
  const reais = f.valor ? f.valor / 100 : null, entrada = pago ? pago / 100 : null;
  const horas = f.inicio && f.fim ? (() => { const [a1, b1] = f.inicio.split(":").map(Number), [a2, b2] = f.fim.split(":").map(Number);
    let m = (a2 * 60 + b2) - (a1 * 60 + b1); if (m <= 0) m += 1440; return m % 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}` : `${m / 60} horas`; })() : "";
  Object.assign(c.dados.salao, {
    nome: String(a.nome || "").toUpperCase(), telefone: tel ? M.salao.fmtTelefone(tel) : "",
    tipo_festa: String(f.tipoEvento || c.dados.salao.tipo_festa).toUpperCase(), data_evento: f.data || "",
    hora_inicio: f.inicio || c.dados.salao.hora_inicio,
    valor_total: reais != null ? M.salao.fmtDinheiro(reais) : "", entrada: entrada != null ? M.salao.fmtDinheiro(entrada) : ""
  });
  Object.assign(c.dados.buffet, {
    contratante_nome: a.nome || "", evento_tipo: f.tipoEvento || "", data_evento: f.data || "",
    local_evento: (f.servicos || []).includes("salao") ? "D´ROMA Festas" : f.local || "", inicio: f.inicio || "", fim: f.fim || "", duracao: horas,
    convidados: f.convidados ? String(f.convidados) : "",
    valor_total: reais != null ? M.buffet.fmtMoney(String(reais).replace(".", ",")) : "",
    valor_extenso: reais != null ? M.buffet.extensoReais(String(reais).replace(".", ",")) : "",
    entrada: entrada != null ? M.buffet.fmtMoney(String(entrada).replace(".", ",")) : ""
  });
  return c;
}

/* Janela só com o contrato, para a impressão do navegador (ou "Salvar como PDF"). */
function ctImprimir(html, tipo, titulo) {
  const w = window.open("", "_blank");
  if (!w) return false;
  const extra = tipo === "salao"
    ? "@page{size:A4;margin:0}html,body{margin:0;background:#fff}.ctm-salao .folha{margin:0;box-shadow:none;break-after:page;page-break-after:always}.ctm-salao .folha:last-child{break-after:auto;page-break-after:auto}"
    : "@page{size:A4;margin:12mm}html,body{margin:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.ctm-buffet{padding:0;max-width:none;font-size:12px}.ctm-buffet .logo{margin:0 0 10px}.ctm-buffet .cl{page-break-inside:avoid;break-inside:avoid}";
  w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${String(titulo).replace(/</g, "")}</title>
<style>${ctMotor().CSS}${extra}</style></head><body><div class="ctm-${tipo}">${html}</div>
<script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`);
  w.document.close();
  return true;
}

function EscolhaTipo({ valor, onChange, travado }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
      {CT_MODELOS.map(m => {
        const on = m.id === valor;
        return (
          <button key={m.id} type="button" aria-pressed={on} disabled={travado && !on} onClick={() => onChange(m.id)} style={{
            display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left", cursor: travado ? "default" : "pointer",
            opacity: travado && !on ? "var(--disabled-opacity)" : undefined,
            padding: "14px 16px", borderRadius: "var(--radius-lg)",
            background: on ? "var(--color-accent-soft)" : "var(--color-surface)",
            border: (on ? "var(--border-control)" : "var(--border-hairline)") + " solid " + (on ? "var(--color-accent)" : "var(--color-border)"),
            boxShadow: on ? "none" : "var(--shadow-card)", fontFamily: "var(--font-ui)", transition: "var(--transition-control)"
          }}>
            <span style={{
              width: "var(--icon-tile)", height: "var(--icon-tile)", flex: "0 0 auto", borderRadius: "var(--radius-md)",
              background: on ? "var(--color-accent-strong)" : "var(--color-surface-3)",
              color: on ? "var(--color-accent-contrast)" : "var(--text-body)", display: "flex", alignItems: "center", justifyContent: "center"
            }}><Icon name={m.icone} size={24} /></span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-semibold)", color: on ? "var(--text-accent)" : "var(--text-strong)" }}>{m.nome}</span>
                {on ? <Icon name="check" size={16} color="var(--text-accent)" /> : null}
              </span>
              <span style={{ display: "block", fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 4, lineHeight: "var(--lh-snug)" }}>{m.descricao}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CtArea({ value, onChange, disabled, rows = 3, mono }) {
  const [foco, setFoco] = React.useState(false);
  return <textarea value={value} onChange={onChange} disabled={disabled} rows={rows} onFocus={() => setFoco(true)} onBlur={() => setFoco(false)}
    style={{ width: "100%", boxSizing: "border-box", resize: "vertical", padding: "9px 11px", borderRadius: "var(--radius-xs)",
      border: `var(--border-hairline) solid ${foco ? "var(--color-accent)" : "var(--color-border)"}`, boxShadow: foco ? "var(--focus-ring)" : "none",
      background: "var(--color-surface)", color: "var(--text-strong)", fontFamily: mono ? "Georgia, serif" : "var(--font-ui)", fontSize: "var(--fs-body-s)",
      lineHeight: 1.45, outline: "none", opacity: disabled ? "var(--disabled-opacity)" : 1 }} />;
}

/* Formulário do salão: os grupos e campos do original, com as mesmas regras ao digitar. */
function FormSalao({ dados, set, travado, compact }) {
  const M = ctMotor().salao;
  const v = M.resolver({ dados });
  const [locadora, setLocadora] = React.useState(false);
  const digitar = (cp, bruto) => {
    let val = bruto;
    if (cp.tipo === "cpf") val = M.fmtCPF(bruto);
    if (cp.tipo === "telefone") val = M.fmtTelefone(bruto);
    if (cp.tipo === "dinheiro") { const n = M.lerDinheiro(bruto); val = n === null ? "" : M.fmtDinheiro(n); }
    if (cp.tipo === "numero") val = M.soDigitos(bruto);
    if (cp.maiusc) val = val.toUpperCase();
    const extra = {};
    /* Sexo puxa a nacionalidade (brasileira ↔ brasileiro), como no gerador. */
    if (cp.id === "sexo" || cp.id === "locadora_sexo") {
      const k = cp.id === "sexo" ? "nacionalidade" : "locadora_nacionalidade";
      const outro = val === "feminino" ? "brasileiro" : "brasileira";
      if ((dados[k] || "").toLowerCase() === outro) extra[k] = val === "feminino" ? "brasileira" : "brasileiro";
    }
    set({ [cp.id]: val, ...extra });
  };
  return M.GRUPOS.map(g => {
    const fechado = g.id === "locadora" && !locadora;
    return (
      <Card key={g.id} header={<>
        <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>{g.titulo}</div>
        {g.id === "locadora" ? <Button size="sm" variant="ghost" icon={fechado ? "chevron-down" : "chevron-up"} onClick={() => setLocadora(!locadora)}>{fechado ? "Mostrar" : "Esconder"}</Button> : null}
      </>}>
        {fechado ? <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>{dados.locadora_nome || "—"} · {dados.salao_nome}</div> :
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, minmax(0,1fr))", gap: "10px 10px" }}>
          {g.campos.map(cp => {
            const span = compact ? (CT_SPAN[cp.cls] <= 4 ? 6 : 12) : CT_SPAN[cp.cls] || 12;
            const auto = cp.id === "saldo";
            const valor = auto ? v.saldo : dados[cp.id] || "";
            let dica = cp.dica || null, erro = null;
            if (cp.id === "cpf" && dados.cpf) { if (M.cpfValido(dados.cpf)) dica = "CPF válido"; else erro = "CPF não confere — confira os números"; }
            const props = { value: valor, disabled: travado || auto, onChange: e => digitar(cp, e.target.value) };
            return (
              <Field key={cp.id} label={cp.rot} required={cp.req} hint={erro ? null : dica} error={erro} style={{ gridColumn: "span " + span }}>
                {cp.tipo === "area" ? <CtArea {...props} rows={4} />
                  : cp.tipo === "opcao" ? <Select options={cp.opcoes} {...props} />
                  : <Input {...props} type={cp.tipo === "data" ? "date" : cp.tipo === "hora" ? "time" : "text"}
                      inputMode={cp.tipo === "numero" || cp.tipo === "cpf" || cp.tipo === "telefone" ? "numeric" : cp.tipo === "dinheiro" ? "decimal" : undefined}
                      placeholder={cp.id === "nome_assinatura" ? (dados.nome || "").trim().toUpperCase() || "(usa o nome completo)" : undefined}
                      style={cp.maiusc ? { textTransform: "uppercase" } : undefined} />}
              </Field>
            );
          })}
          {g.id === "valores" ? <div style={{ gridColumn: "span 12", fontSize: "var(--fs-tiny)", color: "var(--text-muted)", lineHeight: "var(--lh-snug)" }}>
            Digite os valores com os centavos: teclar 70000 vira R$ 700,00. O saldo e os valores por extenso saem sozinhos.</div> : null}
        </div>}
      </Card>
    );
  });
}

/* Formulário do buffet: os campos do original, com máscara de CPF/CNPJ, valor e hora. */
function FormBuffet({ dados, set, travado, compact, erros, extensoManual, onExtensoManual }) {
  const M = ctMotor().buffet;
  const porId = Object.fromEntries(M.MODEL.campos.map(f => [f.id, f]));
  const digitar = (f, val) => {
    if (f.tipo === "doc") val = M.maskDoc(val);
    const patch = { [f.id]: val };
    if (f.id === "valor_extenso") onExtensoManual(true);
    if (f.id === "valor_total" && !extensoManual) patch.valor_extenso = M.extensoReais(val);
    set(patch);
  };
  const sair = f => {
    const val = dados[f.id] || "";
    if (f.tipo === "money" && !isNaN(M.parseMoney(val))) set({ [f.id]: M.fmtMoney(val) });
    if (f.tipo === "hora") set({ [f.id]: M.fmtHora(val) });
  };
  return CT_GRUPOS_BUFFET.map(g => (
    <Card key={g.titulo} header={<div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>{g.titulo}</div>}>
      <div style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0,1fr)" : "repeat(2, minmax(0,1fr))", gap: "10px 12px" }}>
        {g.ids.map(id => {
          const f = porId[id];
          const largo = ["contratante_nome", "contratante_end", "local_evento", "valor_extenso"].includes(id);
          return (
            <Field key={id} label={f.label.replace(/^Contratante — /, "")} required={f.obrigatorio} error={erros[id] || null} style={{ gridColumn: largo && !compact ? "span 2" : undefined }}>
              <Input value={dados[id] || ""} disabled={travado} invalid={!!erros[id]} type={f.tipo === "date" ? "date" : "text"}
                inputMode={f.tipo === "money" ? "decimal" : undefined}
                placeholder={f.placeholder || (f.tipo === "money" ? "Ex: 2.500,00" : f.tipo === "doc" ? "CPF ou CNPJ" : f.tipo === "hora" ? "21:00" : "")}
                onChange={e => digitar(f, e.target.value)} onBlur={() => sair(f)} />
            </Field>
          );
        })}
      </div>
    </Card>
  ));
}

/* Prévia: as folhas do salão (escaladas para caber) ou o papel do buffet, exatamente como saem. */
function Previa({ c, onFolhas, onVazios }) {
  const M = ctMotor();
  const caixa = React.useRef(null), paginas = React.useRef(null);
  const [pronto, setPronto] = React.useState(false);
  const [escala, setEscala] = React.useState(0.5);
  const [altura, setAltura] = React.useState(0);
  React.useEffect(() => { let vivo = true; setPronto(false); M[c.tipo].pronto().then(() => vivo && setPronto(true), () => vivo && setPronto("erro")); return () => { vivo = false; }; }, [c.tipo]);
  React.useEffect(() => {
    const el = caixa.current; if (!el) return;
    const medir = () => setEscala(Math.min(1, el.clientWidth / (210 * 96 / 25.4)));
    medir();
    const ro = new ResizeObserver(medir); ro.observe(el);
    return () => ro.disconnect();
  }, [c.tipo]);
  const chave = JSON.stringify([c.tipo, c.dados[c.tipo], c.htmlProprio || null, c.clausulas || null]);
  React.useEffect(() => {
    if (pronto !== true || c.tipo !== "salao" || !paginas.current) return;
    const t = setTimeout(() => {
      const n = M.salao.paginar(M.salao.montarHTML({ dados: c.dados.salao, htmlProprio: c.htmlProprio }), paginas.current);
      setAltura(paginas.current.offsetHeight);
      onFolhas && onFolhas(n, paginas.current);
      onVazios && onVazios(paginas.current.querySelectorAll(".vazio").length);
    }, 110);
    return () => clearTimeout(t);
  }, [chave, pronto]);
  if (pronto === "erro") return <div style={{ padding: 16, color: "var(--text-muted)", fontSize: "var(--fs-tiny)" }}>Não carregou o papel do contrato. Confira a internet e abra de novo.</div>;
  return (
    <div ref={caixa} style={{ width: "100%" }}>
      {c.tipo === "salao"
        ? <div className="ctm-salao" style={{ position: "relative", width: "100%", height: altura * escala }}>
            <div ref={paginas} style={{ position: "absolute", top: 0, left: 0, transformOrigin: "top left", transform: `scale(${escala})` }} />
          </div>
        : pronto ? <div className="ctm-buffet" style={{ boxShadow: "var(--shadow-soft)", borderRadius: "var(--radius-sm)" }}
            dangerouslySetInnerHTML={{ __html: M.buffet.previewHTML(c.dados.buffet, c.clausulas || M.buffet.CLAUSULAS) }} /> : null}
    </div>
  );
}

/* Editar o texto. Salão: escreve livre em cima do contrato (vira texto próprio deste contrato, como
   no gerador). Buffet: o texto de cada cláusula, com {{campos}}. */
function EditorTexto({ c, onSalvar, onFechar, onRestaurar }) {
  const M = ctMotor();
  const folha = React.useRef(null);
  const [clausulas, setClausulas] = React.useState(() => JSON.parse(JSON.stringify(c.clausulas || M.buffet.CLAUSULAS)));
  React.useEffect(() => {
    if (c.tipo === "salao" && folha.current) folha.current.innerHTML = M.salao.montarHTML({ dados: c.dados.salao, htmlProprio: c.htmlProprio });
  }, []);
  const cmd = n => e => { e.preventDefault(); document.execCommand(n, false, null); };
  return (
    <DS.Modal width={900} title={c.tipo === "salao" ? "Editar o texto deste contrato" : "Editar o texto das cláusulas"}
      subtitle={c.tipo === "salao" ? "Escreva direto no contrato. Depois disso o formulário para de mudar o texto." : "Use {{campo}} para puxar um dado do formulário."}
      onClose={onFechar}
      footer={<>
        <Button variant="ghost" icon="rotate-ccw" onClick={onRestaurar}>Voltar ao modelo</Button>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" onClick={onFechar}>Cancelar</Button>
        <Button icon="check" onClick={() => c.tipo === "salao" ? onSalvar({ htmlProprio: folha.current.innerHTML }) : onSalvar({ clausulas })}>Salvar texto</Button>
      </>}>
      {c.tipo === "salao" ? <>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <Button size="sm" variant="ghost" onMouseDown={cmd("bold")} title="Negrito (Ctrl+B)"><b>N</b></Button>
          <Button size="sm" variant="ghost" onMouseDown={cmd("italic")} title="Itálico (Ctrl+I)"><i>I</i></Button>
          <Button size="sm" variant="ghost" onMouseDown={cmd("underline")} title="Sublinhado (Ctrl+U)"><u>S</u></Button>
          <Button size="sm" variant="ghost" icon="remove-formatting" onMouseDown={cmd("removeFormat")}>Limpar formato</Button>
          <Button size="sm" variant="ghost" icon="separator-horizontal" onMouseDown={e => { e.preventDefault(); folha.current.focus(); document.execCommand("insertHTML", false, '<div class="quebra"></div><p><br></p>'); }}>Quebra de página</Button>
        </div>
        <div style={{ background: "var(--color-surface-3)", padding: 12, borderRadius: "var(--radius-sm)", overflowX: "auto" }}>
          <div ref={folha} className="ctm-editando" contentEditable suppressContentEditableWarning spellCheck />
        </div>
      </> : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {clausulas.map((cl, i) => (
          <Field key={cl.id || i} label={cl.titulo}>
            <CtArea rows={4} mono value={cl.texto} onChange={e => setClausulas(l => l.map((x, k) => k === i ? { ...x, texto: e.target.value } : x))} />
          </Field>
        ))}
      </div>}
    </DS.Modal>
  );
}

function ContratoEditor({ contrato, compact, onChange, onBack, onToast, naoSalvo, voltar = "Contratos", salvoTexto, erroSalvar }) {
  const M = ctMotor();
  const c = contrato, tipo = c.tipo;
  const [verPrevia, setVerPrevia] = React.useState(!compact);
  DS.useVoltar(true, onBack);
  DS.useVoltar(compact && verPrevia, () => setVerPrevia(false));
  const [finalizar, setFinalizar] = React.useState(false);
  const [editar, setEditar] = React.useState(false);
  const [confirmar, setConfirmar] = React.useState(null);
  const [erros, setErros] = React.useState({});
  const [vazios, setVazios] = React.useState(0);
  const folhas = React.useRef(null);
  const final = c.status === "Finalizado";
  const proprio = tipo === "salao" && !!c.htmlProprio;
  const set = patch => {
    setErros(e => { const n = { ...e }; Object.keys(patch).forEach(k => delete n[k]); return n; });
    onChange({ dados: { ...c.dados, [tipo]: { ...c.dados[tipo], ...patch } } });
  };
  const faltando = tipo === "buffet" ? Object.keys(M.buffet.validar(c.dados.buffet)).length : vazios;
  const titulo = tipo === "salao" ? M.salao.nomeArquivo({ dados: c.dados.salao, nomeArquivo: c.nomeArquivo }) : M.buffet.defaultName(c.dados.buffet);

  const baixar = async (forcar) => {
    try {
      await M[tipo].pronto();
      if (tipo === "buffet") {
        const e = M.buffet.validar(c.dados.buffet);
        if (Object.keys(e).length) { setErros(e); onToast("Corrija os campos destacados", "danger"); if (compact) setVerPrevia(false); return; }
        onToast("PDF baixado: " + M.buffet.gerarPDF(c.dados.buffet, c.clausulas || M.buffet.CLAUSULAS, titulo));
        return;
      }
      if (vazios && !forcar) { setConfirmar("pdf"); return; }
      const blob = M.salao.gerarPDF(folhas.current);
      if (!blob) { onToast("Nada para gerar", "danger"); return; }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = titulo + ".pdf";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      onToast("PDF gerado: " + a.download);
    } catch (e) { onToast("Não consegui gerar o PDF: " + (e.message || e), "danger"); }
  };
  const imprimir = async (forcar) => {
    await M[tipo].pronto();
    if (tipo === "salao" && vazios && !forcar) { setConfirmar("imprimir"); return; }
    const html = tipo === "salao" ? folhas.current.innerHTML : M.buffet.previewHTML(c.dados.buffet, c.clausulas || M.buffet.CLAUSULAS);
    if (!ctImprimir(html, tipo, titulo)) onToast("O navegador bloqueou a janela de impressão", "danger");
  };

  return (<>
    <div style={{ display: "flex", gap: "var(--gap-inline)", alignItems: "center", flexWrap: "wrap" }}>
      <Button size="sm" variant="ghost" icon="arrow-left" onClick={onBack}>{voltar}</Button>
      <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)" }}>{ctCliente(c)}</div>
      <Badge tone={final ? "success" : "neutral"} icon={final ? "circle-check" : "pencil"}>{final ? "Finalizado" : "Rascunho"}</Badge>
      {erroSalvar ? <Badge tone="danger" icon="circle-alert">{erroSalvar}</Badge>
        : salvoTexto ? <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>{salvoTexto}</span>
        : naoSalvo ? <span title="O armazenamento do navegador recusou a gravação (cheio ou em modo privado)."><Badge tone="danger" icon="circle-alert">Não salvo neste aparelho</Badge></span>
        : <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>Salvo automaticamente · {c.atualizado}</span>}
    </div>

    <EscolhaTipo valor={tipo} travado={final} onChange={t => !final && t !== tipo && onChange(ctTrocar(c, t))} />

    <div style={{ display: "flex", gap: "var(--gap-inline)", alignItems: "center", flexWrap: "wrap" }}>
      {final ? null : <Badge tone={faltando ? "warn" : "success"} icon={faltando ? "circle-alert" : "circle-check"}>
        {faltando ? (faltando === 1 ? "Falta 1 campo" : "Faltam " + faltando + " campos") : "Pronto para gerar"}
      </Badge>}
      <div style={{ flex: 1 }} />
      {compact ? <FilterPill trailingIcon={null} icon={verPrevia ? "pencil" : "eye"} active onClick={() => setVerPrevia(!verPrevia)}>{verPrevia ? "Editar dados" : "Ver prévia"}</FilterPill> : null}
      {final ? null : <Button size="sm" variant="ghost" icon="text-cursor-input" onClick={() => setEditar(true)}>Editar texto</Button>}
      <Button size="sm" variant="ghost" icon="printer" onClick={() => imprimir(false)}>Imprimir</Button>
      <Button size="sm" variant={final ? "solid" : "ghost"} icon="download" onClick={() => baixar(false)}>Baixar PDF</Button>
      {final ? null : <Button size="sm" icon="check" onClick={() => setFinalizar(true)}>Finalizar</Button>}
    </div>

    {proprio ? <div role="status" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "10px 14px", borderRadius: "var(--radius-sm)",
      background: "var(--action-warn-bg)", color: "var(--action-warn)", fontSize: "var(--fs-tiny)", fontWeight: "var(--fw-semibold)" }}>
      <Icon name="triangle-alert" size={16} />
      <span style={{ flex: 1, minWidth: 200 }}>Este contrato tem texto próprio: o formulário está travado porque não muda mais o que está escrito.</span>
      {final ? null : <><Button size="sm" variant="ghost" onClick={() => onChange({ htmlProprio: null })}>Voltar ao modelo</Button>
      <Button size="sm" variant="ghost" onClick={() => setEditar(true)}>Editar o texto</Button></>}
    </div> : null}

    <div style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0,1fr)" : "minmax(0,1fr) minmax(0,1.05fr)", gap: 12, alignItems: "start" }}>
      {(!compact || !verPrevia) ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: proprio ? .6 : 1 }}>
          {tipo === "salao"
            ? <FormSalao dados={c.dados.salao} set={set} travado={final || proprio} compact={compact} />
            : <FormBuffet dados={c.dados.buffet} set={set} travado={final} compact={compact} erros={erros}
                extensoManual={!!c.extensoManual} onExtensoManual={v => !c.extensoManual && onChange({ extensoManual: v })} />}
        </div>
      ) : null}
      {/* A prévia fica sempre montada (no celular, fora da tela enquanto edita): o PDF do salão é lido dela. */}
      <div style={compact && !verPrevia ? { position: "fixed", left: -10000, top: 0, width: 400 } : { position: compact ? "static" : "sticky", top: 0 }}>
        <Card padded={false} header={<>
          <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>Prévia</div>
          <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>{titulo}</span>
        </>} bodyStyle={{ background: "var(--color-surface-3)", padding: 14, maxHeight: compact ? "none" : "calc(100dvh - 180px)", overflowY: "auto" }}>
          <Previa c={c} onFolhas={(n, el) => { folhas.current = el; }} onVazios={setVazios} />
        </Card>
      </div>
    </div>

    {editar ? <EditorTexto c={c} onFechar={() => setEditar(false)}
      onSalvar={patch => { onChange(patch); setEditar(false); onToast("Texto deste contrato salvo"); }}
      onRestaurar={() => { onChange(tipo === "salao" ? { htmlProprio: null } : { clausulas: null }); setEditar(false); onToast("Voltou ao texto do modelo"); }} /> : null}
    {confirmar ? <DS.ConfirmDialog icon="circle-alert" title={`Faltam ${vazios} ${vazios === 1 ? "campo" : "campos"}`}
      message={confirmar === "pdf" ? "Eles vão sair marcados em amarelo no PDF. Gerar mesmo assim?" : "Eles vão sair marcados em amarelo. Imprimir mesmo assim?"}
      confirmLabel={confirmar === "pdf" ? "Sim, gerar" : "Sim, imprimir"} cancelLabel="Voltar" onCancel={() => setConfirmar(null)}
      onConfirm={() => { const o = confirmar; setConfirmar(null); o === "pdf" ? baixar(true) : imprimir(true); }} /> : null}
    {finalizar ? <DS.ConfirmDialog icon="file-check" title="Finalizar contrato?"
      message="O contrato sai de rascunho e fica só para leitura. Imprimir e baixar o PDF continuam disponíveis."
      confirmLabel="Sim, finalizar" cancelLabel="Voltar" onCancel={() => setFinalizar(false)}
      onConfirm={() => { setFinalizar(false); onChange({ status: "Finalizado" }); onToast("Contrato finalizado"); }} /> : null}
  </>);
}

/* Contratos avulsos (sem festa no funil): ficam neste navegador. Os da festa ficam no servidor. */
const CT_KEY = "dluh-admin-contratos-v2";
function Contratos({ compact, onView }) {
  const [salvos, setSalvos] = React.useState(() => {
    try { const r = JSON.parse(localStorage.getItem(CT_KEY)); if (Array.isArray(r)) return r; } catch (e) {}
    return [];
  });
  const [aberto, setAberto] = React.useState(null);
  const [apagar, setApagar] = React.useState(null);
  const [toastNode, showToast] = useToast();
  const [naoSalvo, setNaoSalvo] = React.useState(false);
  React.useEffect(() => {
    try { localStorage.setItem(CT_KEY, JSON.stringify(salvos)); setNaoSalvo(false); }
    catch (e) { setNaoSalvo(true); }
  }, [salvos]);
  /* Contratos das festas do funil, só para achar e abrir pela ficha. */
  const ats = useAoVivo("atendimentos");
  const daFesta = (ats.dados || []).filter(a => a.contrato);

  const atual = salvos.find(c => c.uid === aberto);
  const upd = patch => setSalvos(l => l.map(c => c.uid === aberto ? { ...c, ...patch, atualizado: ctAgora() } : c));
  const criar = () => {
    const c = { uid: "c" + Date.now(), ...ctNovo("salao"), atualizado: ctAgora() };
    setSalvos(l => [c, ...l]); setAberto(c.uid);
  };
  const rascunhos = salvos.filter(c => c.status !== "Finalizado").length;

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "var(--space-8)", minHeight: "100%" }}>
      {atual ? <ContratoEditor contrato={ctMesclar(atual)} compact={compact} onChange={upd} onBack={() => setAberto(null)} onToast={showToast} naoSalvo={naoSalvo} /> : <>
        <div style={{ display: "flex", gap: "var(--gap-inline)", alignItems: "center", flexWrap: "wrap" }}>
          {rascunhos ? <Badge tone="warn" icon="pencil">{rascunhos === 1 ? "1 rascunho em andamento" : rascunhos + " rascunhos em andamento"}</Badge> : null}
          <div style={{ flex: 1 }} />
          <Button size="sm" icon="plus" onClick={criar}>Novo contrato avulso</Button>
        </div>
        {daFesta.length ? <Card header={<div>
          <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>Contratos das festas</div>
          <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>Ficam salvos junto com a festa, em Atendimentos</div>
        </div>} bodyStyle={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {daFesta.map(a => (
            <ListRow key={a.id} icon={a.contrato.tipo === "buffet" ? "chef-hat" : "party-popper"} title={a.nome || "Sem nome"}
              subtitle={(a.contrato.tipo === "buffet" ? "Buffet" : "Locação do salão") + " · " + (a.contrato.status === "Finalizado" ? "Finalizado" : "Rascunho") + (a.festa && a.festa.data ? " · festa " + a.festa.data.split("-").reverse().slice(0, 2).join("/") : "")}
              value={ctValor(ctMesclar(a.contrato))} onClick={() => onView && onView("atendimentos", { festa: a.id })} />
          ))}
        </Card> : null}
        <Card header={<div>
          <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)" }}>Contratos avulsos</div>
          <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>Sem festa no funil · ficam salvos neste aparelho</div>
        </div>} bodyStyle={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {salvos.length ? salvos.map(c => (
            <ListRow key={c.uid} icon={c.tipo === "buffet" ? "chef-hat" : "party-popper"} title={ctCliente(ctMesclar(c))}
              subtitle={(c.tipo === "buffet" ? "Buffet" : "Locação do salão") + " · " + (c.status === "Finalizado" ? "Finalizado" : "Rascunho") + " · " + c.atualizado}
              value={ctValor(ctMesclar(c))}
              trailing={<div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 10 }}>
                <Button size="sm" variant={c.status === "Finalizado" ? "ghost" : "outline"} icon={c.status === "Finalizado" ? "eye" : "pencil"} onClick={() => setAberto(c.uid)}>{c.status === "Finalizado" ? "Abrir" : "Continuar"}</Button>
                <IconButton icon="trash-2" label="Apagar" size={36} onClick={() => setApagar(c)} />
              </div>} />
          )) : <DS.EmptyState icon="file-text" title="Nenhum contrato avulso" description="O contrato de uma festa se faz pela ficha dela, em Atendimentos. Use o avulso só para quem não está no funil." />}
        </Card>
      </>}
      {apagar ? <DS.ConfirmDialog tone="danger" icon="trash-2" title="Apagar contrato?" cancelLabel="Voltar" message={"O contrato de " + ctCliente(ctMesclar(apagar)) + " sai do histórico. Não dá pra desfazer."}
        confirmLabel="Sim, apagar" onCancel={() => setApagar(null)}
        onConfirm={() => { setSalvos(l => l.filter(x => x.uid !== apagar.uid)); setApagar(null); showToast("Contrato apagado"); }} /> : null}
      {toastNode}
    </div>
  );
}

Object.assign(window, { Contratos, ContratoEditor, ctNovo, ctMesclar, ctDaFesta });
