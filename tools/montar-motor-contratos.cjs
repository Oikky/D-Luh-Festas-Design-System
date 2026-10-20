/* Monta ui_kits/admin/contratos-motor.js a partir dos dois geradores originais. Rodar de dentro de
   ~/Downloads, onde estão os .html dos geradores e o backup-contratos-2026-09-04.json (de onde vêm o
   modelo do salão e os dados da locadora que a loja usava):
   node "D'Luh Festas Design System/tools/montar-motor-contratos.cjs" */
const fs = require("fs");
const src = fs.readFileSync("Gerador-de-Contratos (1) (1).html", "utf8").split(/\r?\n/);
const L = (a, b) => src.slice(a - 1, b).join("\n");
const modeloJs = fs.readFileSync("Gerador de Contratos — D'Luh Festas_files/model.js.baixados", "utf8");
const buf = fs.readFileSync("Gerador de Contratos — D'Luh Festas.html", "utf8").split(/\r?\n/);
const B = (a, b) => buf.slice(a - 1, b).join("\n");
const ADM = "D'Luh Festas Design System/ui_kits/admin/contratos/";
const bk = JSON.parse(fs.readFileSync("backup-contratos-2026-09-04.json", "utf8"));
const ms = { html: bk.modelos[0].html.replace(/\r\n/g, "\n"), padrao: bk.config.padrao };

const must = (txt, s) => { if (!txt.includes(s)) throw new Error("faixa errada: " + s); return txt; };
const salaoConst = must(L(307, 310), "LIMITE_PX");
const grupos = must(must(L(349, 414), "const GRUPOS"), "CAMPOS_LOCADORA");
const util = must(L(419, 421), "soDigitos");
const extFmt = must(must(L(433, 541), "function extensoReais"), "function abreviarNome");
const resolucao = must(must(L(625, 795), "function placeholdersDe"), "return cont.children.length;");
const nomeArq = must(L(826, 837), "function nomeArquivo");
const pdf = must(must(L(847, 1065), "const WIN1252"), "return new Blob(pedacos");
const bufFns = must(must(B(609, 795), "function fill(text, vals)"), "function defaultName()");
const bufPdf = must(B(797, 846), "pdfMake.createPdf(doc).download(arquivo);");
const troca = (txt, de, para) => { if (!txt.includes(de)) throw new Error("não achei: " + de); return txt.replace(de, para); };

let pdfBuffet = bufPdf.split("\n").slice(1).join("\n");
pdfBuffet = troca(pdfBuffet, "  if(!validate()){ toast('Corrija os campos destacados.'); return; }\n", "");
pdfBuffet = troca(pdfBuffet, "  if(typeof pdfMake==='undefined'){ toast('Biblioteca do PDF ainda carregando, tente de novo.'); return; }\n", "");
pdfBuffet = troca(pdfBuffet, "const vals = getValues();", "const vals = { ...valores };");
pdfBuffet = troca(pdfBuffet, "const nome = (document.getElementById('contractName').value.trim() || defaultName());", "const nome = (nomeContrato || defaultName(valores));");
pdfBuffet = troca(pdfBuffet, "  toast('PDF baixado.');\n}", "  return arquivo;\n}");
const fnsBuffet = troca(bufFns, "function defaultName(){\n  const v = getValues();", "function defaultName(v){");

const CSS = fs.readFileSync(__dirname + "/motor-contratos.css", "utf8");

const out = `/* Motor dos contratos: o texto, o preenchimento, a quebra de páginas e o PDF dos dois geradores que a
   D'Luh já usava, copiados sem mudança para o resultado sair igual:
   - Salão: "Gerador de Contratos — D´ROMA Festas" (arquivo único; folhas A4 com papel timbrado e PDF
     escrito a partir do que está desenhado na tela). Modelo e dados da locadora = os do backup de
     04/09/2026 (o que a loja de fato usava).
   - Buffet: oikky.github.io/contratos-dluh (pdfmake 0.2.10 + logo).
   O admin (Contratos.jsx) só monta o formulário em volta. Este arquivo foi montado por script a partir
   dos originais: para mudar o texto do contrato, mude aqui com cuidado. */
(function () {
"use strict";
const carregados = {};
const carregarScript = src => carregados[src] || (carregados[src] = new Promise((ok, falha) => {
  const s = document.createElement("script"); s.src = src; s.onload = ok;
  s.onerror = () => { delete carregados[src]; falha(new Error("Não carregou " + src)); };
  document.head.appendChild(s);
}));
const BASE = (document.currentScript && document.currentScript.src || location.href).replace(/[^/]*$/, "") + "contratos/";

/* ═════════════════════════════════ SALÃO ═════════════════════════════════ */
const SALAO = (function () {
${salaoConst}

const MODELO_PADRAO = ${JSON.stringify(ms.html)};
const PADRAO_LOJA = ${JSON.stringify(ms.padrao)};

${grupos}

${util}

${extFmt}

/* O gerador original guardava tudo num banco local (D) e desenhava em #paginas; aqui as folhas vão
   para o elemento que a tela passar. */
let PAGINAS = null;
const $ = s => s === "#paginas" ? PAGINAS : s === "#timbradoFonte" ? { src: window.TIMBRADO_SALAO } : null;
const D = { config: { timbrado: null, numerarPaginas: false, nomeArquivoCompleto: false, padrao: PADRAO_LOJA, padraoArquivo: "CONTRATO {NOME} {DATA}" } };
const modeloDe = () => ({ html: MODELO_PADRAO });

${resolucao}

${nomeArq}

${pdf}

/* Contrato novo: o padrão de cada campo, com os dados da locadora que a loja usa. */
function dadosNovos(){
  const dados = {};
  GRUPOS.forEach(g => g.campos.forEach(cp => {
    const dp = D.config.padrao[cp.id];
    dados[cp.id] = (dp !== undefined && dp !== null && dp !== "") ? dp : (cp.padrao || "");
  }));
  dados.data_contrato = hojeISO();
  return dados;
}

return {
  GRUPOS, DEF_CAMPO, MODELO: MODELO_PADRAO, dadosNovos, resolver, montarHTML, PODE_VAZIO,
  paginar: (html, cont) => { PAGINAS = cont; return paginar(html); },
  gerarPDF: cont => { PAGINAS = cont; return gerarPDF(); },
  nomeArquivo: c => nomeArquivo(c),
  fmtCPF, cpfValido, fmtTelefone, fmtDinheiro, lerDinheiro, fmtDataBR, abreviarNome, soDigitos, hojeISO, extensoReais,
  pronto: () => carregarScript(BASE + "timbrado-salao.js")
};
})();

/* ═════════════════════════════════ BUFFET ════════════════════════════════ */
const BUFFET = (function () {
const window_ = {};
${modeloJs.replace(/window\.MODELO_PADRAO/g, "window_.MODELO_PADRAO")}
const MODEL = window_.MODELO_PADRAO;

${fnsBuffet}

/* gerarPDF do original, com os valores e as cláusulas vindos da tela (lá eram getValues()/clausesState). */
function gerarPDFCom(valores, clausesState, nomeContrato){
${pdfBuffet}

/* Validação do original (obrigatórios, CPF/CNPJ e valores), devolvendo { id: mensagem }. */
function validar(vals){
  const erros = {};
  MODEL.campos.forEach(f=>{
    const val = vals[f.id];
    let msg = '';
    if (f.obrigatorio && !val) msg = 'Campo obrigatório.';
    else if (val && f.tipo==='doc' && !validaDoc(val)) msg = 'CPF/CNPJ inválido.';
    else if (val && f.tipo==='money' && isNaN(parseMoney(val))) msg = 'Valor inválido.';
    if (msg) erros[f.id] = msg;
  });
  return erros;
}
/* O preview do original (#preview), como HTML. */
function previewHTML(valores, clausesState){
  const vals = { ...valores, equipe: buildEquipe(valores) };
  let html = '';
  if (window.LOGO_CONTRATO) html += \`<div class="logo"><img src="\${window.LOGO_CONTRATO}" alt="logo"></div>\`;
  html += \`<h2>\${escapeHtml(MODEL.titulo)}</h2>\`;
  clausesState.forEach(cl=>{
    html += \`<div class="cl"><h3>\${escapeHtml(cl.titulo)}</h3>
      <p>\${escapeHtml(fill(cl.texto, vals))}</p></div>\`;
  });
  html += \`<div class="sig">
    <div class="place"><span class="line"></span>\${escapeHtml(vals.cidade||'')}</div>
    <div class="srow"><span>Nome e assinatura do Contratado:</span><span class="fill"></span></div>
    <div class="srow"><span>Assinatura do Contratante:</span><span class="fill"></span></div>
  </div>\`;
  return html;
}

return {
  MODEL, CLAUSULAS: MODEL.clausulas, validar, previewHTML, buildEquipe, fill, defaultName,
  parseMoney, fmtMoney, fmtDate, maskDoc, fmtHora, extensoReais, validaDoc,
  pronto: () => Promise.all([carregarScript(BASE + "logo-buffet.js"),
    carregarScript(BASE + "pdfmake.min.js").then(() => carregarScript(BASE + "vfs_fonts.js"))]),
  gerarPDF: (vals, clausulas, nome) => gerarPDFCom(vals, clausulas, nome)
};
})();

/* CSS das folhas, copiado dos dois geradores (com o escopo .ctm-salao / .ctm-buffet na frente). */
const CSS = ${JSON.stringify(CSS)};
const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

window.DLUH_MOTOR = { salao: SALAO, buffet: BUFFET, CSS };
})();
`;
fs.writeFileSync(ADM + "../contratos-motor.js", out);
console.log("ok", out.length);
