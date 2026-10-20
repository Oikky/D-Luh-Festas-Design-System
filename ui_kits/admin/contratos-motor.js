/* Motor dos contratos: o texto, o preenchimento, a quebra de páginas e o PDF dos dois geradores que a
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
const CHAVE = "droma.contratos.v1";
const MM = 96 / 25.4;                 // 1 mm em px
const LIMITE_PX = 238.5 * MM;         // altura útil da folha (área de texto)
const PT = 0.75;                      // 1 px CSS = 0,75 pt

const MODELO_PADRAO = "<h1>CONTRATO DE LOCAÇÃO DO SALÃO DE FESTAS<br>{{salao_nome}}</h1>\n<p>Por este instrumento particular de contrato, de um lado como;</p>\n<p><b>LOCADORA: {{locadora_nome}},</b> {{locadora_nacionalidade}}, {{locadora_estado_civil_frase}}{{locadora_portador}} do CPF: {{locadora_cpf}}, residente e {{locadora_domiciliado}} a {{locadora_endereco}}, na cidade de {{locadora_cidade}} – {{locadora_uf}}, e de outro lado como<b>:</b></p>\n<p><b>LOCATÁRIO: {{nome}},</b> {{nacionalidade}}, {{estado_civil_frase}}{{profissao_frase}}{{portador}} do CPF: {{cpf}}, {{rg_frase}}residente e {{domiciliado}} a {{endereco}}, {{bairro}}, {{cidade}} – {{uf}}, Telefone {{telefone}}. Doravante denominado simplesmente <b>LOCATÁRIO,</b> resolvem pactuar o presente contrato, de acordo com as condições e cláusulas seguintes;</p>\n<p class=\"clausula\">1ª Cláusula</p>\n<p>É objeto do presente contrato do salão de festas <b>{{salao_nome}}</b> de propriedade da <b>LOCADORA</b> para realização de Festa {{tipo_festa}}<b>,</b> no dia {{data_evento}} às {{hora_inicio}}. A entrega da chave será às {{hora_chave}} do mesmo dia.</p>\n<p class=\"clausula\">2ª Cláusula</p>\n<p>São obrigações da <b>LOCADORA</b>:</p>\n<p>2.1 Colocar a disposição do <b>LOCATÁRIO</b> a área ora locada em perfeitas condições de uso.</p>\n<p>2.2 Fornecer {{itens_fornecidos}}.</p>\n<p>2.3 Informar todos os requisitos de segurança que salão oferece.</p>\n<p>2.4 Caso a <b>LOCADORA</b> desista de alugar o espaço, deverá comunicar ao <b>LOCATÁRIO</b> com antecedência de {{prazo_desistencia_dias}} dias, ficando obrigada a devolver assim o sinal já pago.</p>\n<p class=\"clausula\">3ª Cláusula</p>\n<p>São obrigações do <b>LOCATÁRIO</b>:</p>\n<p>3.1 <b>Efetuar o pagamento do valor da locação de {{valor_total}} ({{valor_total_extenso}}) ao LOCADOR, sendo {{entrada}} ({{entrada_extenso}}) já pago via {{forma_entrada}} e o restante {{saldo}} ({{saldo_extenso}}) ATÉ {{prazo_saldo_dias}} dias antes do dia da festa.</b></p>\n<p>3.2 Caso o <b>LOCATÁRIO</b> desista de realizar o evento, o valor da entrada, só será devolvido se avisar com antecedência de no mínimo {{prazo_desistencia_dias}} dias.</p>\n<p>3.3 Usar com zelo as dependências bem como todos os equipamentos e outros materiais colocados à sua disposição, sem qualquer dano.</p>\n<p>3.4 Responder por quaisquer danos causados ao patrimônio da <b>LOCADORA</b>, indenizando pela totalidade dos prejuízos que por ventura venha a ocorrer, quer por terceiros ou por elementos sob a subordinação direta ou indireta do <b>LOCATÁRIO</b>;</p>\n<p>3.5 É vedado ao <b>LOCATÁRIO</b> colocar mesas e cadeiras fora do salão de festas de qualquer forma, podendo causar transtornos entre vizinhança e <b>LOCADORA.</b></p>\n<p>3.6 <b>Fica estabelecida ainda que o LOCATÁRIO seguirá rigorosamente as leis municipais do meio ambiente ({{leis_municipais}}), comprometendo em manter a intensidade do volume/ volume do som em {{decibeis}} decibéis (som ambiente).</b></p>\n<p>3.7 Incidentes de qualquer natureza decorrente da festa (atividade), dentro ou fora do recinto, será única e exclusiva de responsabilidade do <b>LOCATÁRIO</b>.</p>\n<p>3.8 Na devolução do ambiente é de responsabilidade do <b>LOCATÁRIO</b> entregar o ambiente na mais perfeita ordem e limpeza possível.</p>\n<p>3.9 O <b>LOCATÁRIO</b> se compromete a retirar tudo que foi levado para dentro do salão pertencente ao mesmo até as {{hora_saida}} do dia seguinte.</p>\n<p class=\"clausula\">5ª Cláusula</p>\n<p>A <b>LOCADORA</b> não se responsabiliza por objeto de quaisquer naturezas, esquecido dentro do salão de festas.</p>\n<p class=\"clausula\">6ª Cláusula</p>\n<p>A <b>LOCADORA</b> não tem nenhuma responsabilidade se por qualquer eventualidade climática o <b>LOCATÁRIO</b> não puder usufruir de algum espaço no salão de festa bem como os brinquedos.</p>\n<p class=\"clausula\">7ª Cláusula</p>\n<p>As partes elegem o foro da comarca de {{foro}} para solucionar as dúvidas oriundas deste contrato. E por acharem justos e contratados, assinam o presente em duas vias de igual teor, que o assinam.</p>\n<p class=\"data-local\">{{cidade_contrato}}, {{data_contrato}}</p>\n<div class=\"assinaturas nao-quebrar\">\n<div class=\"col\"><div class=\"traco\">_______________________________</div><div>LOCADORA</div><div class=\"nome\">{{locadora_nome_assinatura}}</div></div>\n<div class=\"col\"><div class=\"traco\">_______________________________</div><div>LOCATÁRIO</div><div class=\"nome\">{{nome_assinatura}}</div></div>\n</div>";
const PADRAO_LOJA = {"salao_nome":"D´ROMA FESTAS","locadora_nome":"LUCIANA DE AGUILAR FREITAS","locadora_sexo":"feminino","locadora_nacionalidade":"Brasileira","locadora_estado_civil":"Casada","locadora_cpf":"074.407.816-43","locadora_cidade":"Montes Claros","locadora_uf":"MG","locadora_endereco":"Rua Visconde de Taunay 278, Maria Cândida","locadora_nome_assinatura":"LUCIANA DE AGUILAR FREITAS"};

const GRUPOS = [
 {id:"locatario", titulo:"Locatário (cliente)", campos:[
   {id:"nome", rot:"Nome completo", tipo:"texto", cls:"c12", maiusc:true, req:true},
   {id:"sexo", rot:"Sexo", tipo:"opcao", cls:"c4", opcoes:["feminino","masculino"], padrao:"feminino"},
   {id:"nacionalidade", rot:"Nacionalidade", tipo:"texto", cls:"c4", padrao:"brasileira"},
   {id:"estado_civil", rot:"Estado civil", tipo:"texto", cls:"c4", dica:"opcional"},
   {id:"profissao", rot:"Profissão", tipo:"texto", cls:"c6", dica:"opcional"},
   {id:"cpf", rot:"CPF", tipo:"cpf", cls:"c6", req:true},
   {id:"rg", rot:"RG", tipo:"texto", cls:"c6", dica:"opcional"},
   {id:"telefone", rot:"Telefone", tipo:"telefone", cls:"c6", req:true},
   {id:"rua", rot:"Rua / Avenida", tipo:"texto", cls:"c8", maiusc:true, req:true},
   {id:"numero", rot:"Número", tipo:"texto", cls:"c4", req:true},
   {id:"complemento", rot:"Complemento", tipo:"texto", cls:"c4", dica:"apto, bloco..."},
   {id:"bairro", rot:"Bairro", tipo:"texto", cls:"c4", maiusc:true, req:true},
   {id:"cidade", rot:"Cidade", tipo:"texto", cls:"c3", maiusc:true, padrao:"MONTES CLAROS"},
   {id:"uf", rot:"UF", tipo:"texto", cls:"c3", maiusc:true, padrao:"MG"},
   {id:"nome_assinatura", rot:"Nome na linha de assinatura", tipo:"texto", cls:"c12", maiusc:true,
    auto:true, dica:"preenchido sozinho a partir do nome completo"},
 ]},
 {id:"evento", titulo:"Evento", campos:[
   {id:"tipo_festa", rot:"Tipo de festa", tipo:"texto", cls:"c6", maiusc:true, padrao:"INFANTIL", req:true,
    dica:"INFANTIL, ADULTO, 15 ANOS..."},
   {id:"data_evento", rot:"Data do evento", tipo:"data", cls:"c6", req:true},
   {id:"hora_inicio", rot:"Início da festa", tipo:"hora", cls:"c4", padrao:"18:00", req:true},
   {id:"hora_chave", rot:"Entrega da chave", tipo:"hora", cls:"c4", padrao:"09:00"},
   {id:"hora_saida", rot:"Retirar tudo até (dia seguinte)", tipo:"hora", cls:"c4", padrao:"07:00"},
 ]},
 {id:"valores", titulo:"Valores", campos:[
   {id:"valor_total", rot:"Valor total da locação", tipo:"dinheiro", cls:"c4", req:true},
   {id:"entrada", rot:"Entrada já paga", tipo:"dinheiro", cls:"c4"},
   {id:"saldo", rot:"Saldo (calculado)", tipo:"dinheiro", cls:"c4", auto:true},
   {id:"forma_entrada", rot:"Forma da entrada", tipo:"texto", cls:"c4", padrao:"pix"},
   {id:"prazo_saldo_dias", rot:"Pagar o saldo até (dias antes)", tipo:"numero", cls:"c4", padrao:"5"},
   {id:"prazo_desistencia_dias", rot:"Prazo de desistência (dias)", tipo:"numero", cls:"c4", padrao:"30"},
 ]},
 {id:"salao", titulo:"O que o salão fornece e regras", campos:[
   {id:"itens_fornecidos", rot:"Itens fornecidos (cláusula 2.2)", tipo:"area", cls:"c12", req:true,
    padrao:"7 mesas com tampões redondos, 40 cadeiras, 1 freezer 540 lts, 1 fogão industrial de 4 bocas, aparador, cama elástica, piscina bolinha, gangorras, escorregador, playground, monitor, som, salão limpo e com papel higiênico, sabonete líquido e papel toalha nos banheiros"},
   {id:"decibeis", rot:"Limite de som (decibéis)", tipo:"numero", cls:"c4", padrao:"50"},
   {id:"leis_municipais", rot:"Leis municipais citadas", tipo:"texto", cls:"c8",
    padrao:"Lei 3754 de 2007 e Lei 9865 de 2008"},
 ]},
 {id:"assinatura", titulo:"Assinatura", campos:[
   {id:"cidade_contrato", rot:"Cidade da assinatura", tipo:"texto", cls:"c6", padrao:"Montes Claros"},
   {id:"data_contrato", rot:"Data da assinatura", tipo:"data", cls:"c6", auto:true},
   {id:"foro", rot:"Foro da comarca", tipo:"texto", cls:"c12", padrao:"Montes Claros"},
 ]},
 {id:"locadora", titulo:"Locadora (dona do salão)", fechado:true, campos:[
   {id:"salao_nome", rot:"Nome do salão", tipo:"texto", cls:"c12", padrao:"D´ROMA FESTAS", req:true},
   {id:"locadora_nome", rot:"Nome completo", tipo:"texto", cls:"c12", maiusc:true,
    padrao:"WANDERLANE DE SOUZA GUIMARÃES CARVALHO", req:true},
   {id:"locadora_sexo", rot:"Sexo", tipo:"opcao", cls:"c4", opcoes:["feminino","masculino"], padrao:"feminino"},
   {id:"locadora_nacionalidade", rot:"Nacionalidade", tipo:"texto", cls:"c4", padrao:"brasileira"},
   {id:"locadora_estado_civil", rot:"Estado civil", tipo:"texto", cls:"c4", padrao:"casada"},
   {id:"locadora_cpf", rot:"CPF", tipo:"cpf", cls:"c6", padrao:"849.826.596-72", req:true},
   {id:"locadora_cidade", rot:"Cidade", tipo:"texto", cls:"c3", padrao:"Montes Claros"},
   {id:"locadora_uf", rot:"UF", tipo:"texto", cls:"c3", maiusc:true, padrao:"MG"},
   {id:"locadora_endereco", rot:"Endereço", tipo:"texto", cls:"c12",
    padrao:"Avenida das Américas, n° 561, Apt 102, Bairro: Dr. João Alves"},
   {id:"locadora_nome_assinatura", rot:"Nome na linha de assinatura", tipo:"texto", cls:"c12", maiusc:true,
    padrao:"WANDERLANE DE S. G. CARVALHO"},
 ]},
];
const DEF_CAMPO = {};
GRUPOS.forEach(g => g.campos.forEach(c => { c.grupo = g.id; DEF_CAMPO[c.id] = c; }));
const CAMPOS_LOCADORA = GRUPOS.find(g => g.id === "locadora").campos.map(c => c.id);

const esc = s => String(s == null ? "" : s)
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const soDigitos = s => String(s || "").replace(/\D+/g,"");

const UNI = ["","um","dois","três","quatro","cinco","seis","sete","oito","nove","dez","onze","doze",
  "treze","quatorze","quinze","dezesseis","dezessete","dezoito","dezenove"];
const DEZ = ["","","vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa"];
const CEN = ["","cento","duzentos","trezentos","quatrocentos","quinhentos","seiscentos","setecentos",
  "oitocentos","novecentos"];

/* estado civil acompanha o campo Sexo (casada <-> casado, viúva <-> viúvo...) */
const CIVIL_FEM = ["solteira","casada","divorciada","viúva","separada","desquitada"];
const CIVIL_MAS = ["solteiro","casado","divorciado","viúvo","separado","desquitado"];
function flexionarCivil(txt, fem){
  const t = (txt || "").trim();
  if(!t) return "";
  const chave = t.toLowerCase();
  const iF = CIVIL_FEM.indexOf(chave), iM = CIVIL_MAS.indexOf(chave);
  if(iF < 0 && iM < 0) return t;              // "união estável" e afins ficam como estão
  return fem ? CIVIL_FEM[iF < 0 ? iM : iF] : CIVIL_MAS[iM < 0 ? iF : iM];
}

function ate999(n){
  if(n === 0) return "";
  if(n === 100) return "cem";
  const c = Math.floor(n/100), r = n%100, p = [];
  if(c) p.push(CEN[c]);
  if(r){
    if(r < 20) p.push(UNI[r]);
    else { const d = Math.floor(r/10), u = r%10; p.push(DEZ[d] + (u ? " e " + UNI[u] : "")); }
  }
  return p.join(" e ");
}
function juntaGrupos(partes){
  // liga com "e" só antes do último grupo, e só se ele for < 100 ou centena redonda
  let s = partes[0].txt;
  for(let i = 1; i < partes.length; i++){
    const ultimo = i === partes.length - 1, b = partes[i].bruto;
    s += (ultimo && (b < 100 || b % 100 === 0) ? " e " : " ") + partes[i].txt;
  }
  return s;
}
function extensoReais(valor){
  const cent = Math.round(Math.abs(Number(valor) || 0) * 100);
  const reais = Math.floor(cent/100), cs = cent%100;
  const trechos = [];
  if(reais >= 1e9) return "valor alto demais — escreva o extenso à mão";
  if(reais > 0){
    const mi = Math.floor(reais/1e6), mil = Math.floor((reais%1e6)/1000), un = reais%1000;
    const partes = [];
    if(mi)  partes.push({bruto: mi,  txt: ate999(mi) + (mi === 1 ? " milhão" : " milhões")});
    if(mil) partes.push({bruto: mil, txt: (mil === 1 ? "mil" : ate999(mil) + " mil")});
    if(un)  partes.push({bruto: un,  txt: ate999(un)});
    // "um milhão DE reais" quando não sobra nada depois do milhão
    const soMilhoes = mi > 0 && mil === 0 && un === 0;
    trechos.push(juntaGrupos(partes) +
      (soMilhoes ? " de reais" : (reais === 1 ? " real" : " reais")));
  }
  if(cs > 0) trechos.push(ate999(cs) + (cs === 1 ? " centavo" : " centavos"));
  if(!trechos.length) return "zero reais";
  return trechos.join(" e ");
}

/* --------------------------------------------------------- formatação */
function fmtDinheiro(v){
  const n = Number(v);
  if(!isFinite(n)) return "";
  return "R$ " + n.toLocaleString("pt-BR", {minimumFractionDigits:2, maximumFractionDigits:2});
}
function lerDinheiro(txt){
  const d = soDigitos(txt);
  return d ? Number(d)/100 : null;
}
function fmtCPF(v){
  const d = soDigitos(v).slice(0,11);
  return d.replace(/^(\d{3})(\d)/,"$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/,"$1.$2.$3")
          .replace(/\.(\d{3})(\d)/,".$1-$2");
}
function cpfValido(v){
  const d = soDigitos(v);
  if(d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let s = 0;
  for(let i=0;i<9;i++) s += +d[i]*(10-i);
  let r = (s*10)%11; if(r === 10) r = 0;
  if(r !== +d[9]) return false;
  s = 0;
  for(let i=0;i<10;i++) s += +d[i]*(11-i);
  r = (s*10)%11; if(r === 10) r = 0;
  return r === +d[10];
}
function fmtTelefone(v){
  const d = soDigitos(v).slice(0,11);
  if(d.length <= 2) return d.length ? "(" + d : "";
  if(d.length <= 6) return "(" + d.slice(0,2) + ") " + d.slice(2);
  if(d.length <= 10) return "(" + d.slice(0,2) + ") " + d.slice(2,6) + "-" + d.slice(6);
  return "(" + d.slice(0,2) + ") " + d.slice(2,7) + "-" + d.slice(7);
}
function fmtDataBR(iso){
  if(!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [a,m,d] = iso.split("-");
  return d + "/" + m + "/" + a;
}
function hojeISO(){
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}
function abreviarNome(nome){
  const p = String(nome || "").trim().split(/\s+/).filter(Boolean);
  if(p.length <= 2) return p.join(" ").toUpperCase();
  const ligas = ["de","da","do","das","dos","e"];
  const meio = p.slice(1, -1).map(w => ligas.includes(w.toLowerCase()) ? w.toUpperCase() : w[0].toUpperCase() + ".");
  return [p[0], ...meio, p[p.length-1]].join(" ").toUpperCase();
}

/* O gerador original guardava tudo num banco local (D) e desenhava em #paginas; aqui as folhas vão
   para o elemento que a tela passar. */
let PAGINAS = null;
const $ = s => s === "#paginas" ? PAGINAS : s === "#timbradoFonte" ? { src: window.TIMBRADO_SALAO } : null;
const D = { config: { timbrado: null, numerarPaginas: false, nomeArquivoCompleto: false, padrao: PADRAO_LOJA, padraoArquivo: "CONTRATO {NOME} {DATA}" } };
const modeloDe = () => ({ html: MODELO_PADRAO });

function placeholdersDe(html){
  const s = new Set(); let m;
  const re = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  while((m = re.exec(html))) s.add(m[1]);
  return Array.from(s);
}
function resolver(c){
  const d = c.dados, v = {};
  GRUPOS.forEach(g => g.campos.forEach(cp => { v[cp.id] = (d[cp.id] || "").toString().trim(); }));
  Object.keys(d).forEach(k => { if(!(k in v)) v[k] = (d[k] || "").toString().trim(); });

  const fem = (v.sexo || "feminino") === "feminino";
  const femL = (v.locadora_sexo || "feminino") === "feminino";
  v.portador = fem ? "portadora" : "portador";
  v.domiciliado = fem ? "domiciliada" : "domiciliado";
  v.locadora_portador = femL ? "portadora" : "portador";
  v.locadora_domiciliado = femL ? "domiciliada" : "domiciliado";

  v.estado_civil = flexionarCivil(v.estado_civil, fem);
  v.locadora_estado_civil = flexionarCivil(v.locadora_estado_civil, femL);
  v.estado_civil_frase = v.estado_civil ? v.estado_civil + ", " : "";
  v.locadora_estado_civil_frase = v.locadora_estado_civil ? v.locadora_estado_civil + ", " : "";
  v.profissao_frase = v.profissao ? v.profissao + ", " : "";
  v.rg_frase = v.rg ? "RG: " + v.rg + ", " : "";

  v.endereco = [v.rua, v.numero, v.complemento].filter(Boolean).join(", ");

  const tot = lerDinheiro(d.valor_total), ent = lerDinheiro(d.entrada);
  const sal = (tot != null) ? Math.max(0, tot - (ent || 0)) : null;
  v.valor_total = tot != null ? fmtDinheiro(tot) : "";
  v.entrada = ent != null ? fmtDinheiro(ent) : "";
  v.saldo = sal != null ? fmtDinheiro(sal) : "";
  v.valor_total_extenso = tot != null ? extensoReais(tot).toUpperCase() : "";
  v.entrada_extenso = ent != null ? extensoReais(ent).toUpperCase() : "";
  v.saldo_extenso = sal != null ? extensoReais(sal).toUpperCase() : "";

  v.data_evento = fmtDataBR(d.data_evento);
  v.data_contrato = fmtDataBR(d.data_contrato);
  v.cpf = fmtCPF(d.cpf);
  v.locadora_cpf = fmtCPF(d.locadora_cpf);
  v.telefone = fmtTelefone(d.telefone);
  v.nome_assinatura = (d.nome_assinatura || "").trim() || (d.nome || "").trim().toUpperCase();
  return v;
}
/* campos que podem ficar vazios sem virar aviso amarelo */
const PODE_VAZIO = ["estado_civil_frase","locadora_estado_civil_frase","profissao_frase",
  "rg_frase","complemento","estado_civil","locadora_estado_civil","profissao","rg"];

function montarHTML(c){
  if(c.htmlProprio) return c.htmlProprio;
  const v = resolver(c);
  return modeloDe(c).html.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (m, k) => {
    const val = v[k];
    if((val === undefined || val === "") && PODE_VAZIO.includes(k)) return "";
    if(val === undefined || val === "") {
      const rot = (DEF_CAMPO[k] && DEF_CAMPO[k].rot) || k.replace(/_/g," ");
      return '<span class="vazio">«' + esc(rot) + "»</span>";
    }
    return esc(val);
  });
}

/* ------------------------------------------------------- paginação */
function atomos(el){
  const out = [];
  (function anda(no, pilha){
    no.childNodes.forEach(f => {
      if(f.nodeType === 3){
        (f.nodeValue.match(/\S+/g) || []).forEach(p => out.push({p, pilha}));
      }else if(f.nodeType === 1){
        if(f.tagName === "BR") out.push({br:true, pilha});
        else anda(f, pilha.concat([f]));
      }
    });
  })(el, []);
  return out;
}
function montarDe(molde, lista){
  const novo = molde.cloneNode(false);
  let chaveAtual = null, alvo = novo, primeiro = true;
  lista.forEach(a => {
    const chave = a.pilha.map(e => e.tagName + "|" + e.className + "|" + (e.getAttribute("style")||"")).join(">");
    if(chave !== chaveAtual){
      chaveAtual = chave; alvo = novo;
      a.pilha.forEach(p => { const cl = p.cloneNode(false); alvo.appendChild(cl); alvo = cl; });
    }
    if(a.br){ alvo.appendChild(document.createElement("br")); primeiro = true; return; }
    alvo.appendChild(document.createTextNode((primeiro ? "" : " ") + a.p));
    primeiro = false;
  });
  return novo;
}
function transbordou(area){
  const u = area.lastElementChild;
  if(!u) return false;
  return u.offsetTop + u.offsetHeight > LIMITE_PX + 0.5;
}
function dividir(area, bloco){
  if(bloco.classList && bloco.classList.contains("nao-quebrar")) return null;
  const molde = bloco.cloneNode(false);
  const todos = atomos(bloco);
  if(todos.length < 2) return null;
  const topo = bloco.offsetTop;
  let lo = 1, hi = todos.length - 1, melhor = 0, atual = bloco;
  while(lo <= hi){
    const meio = (lo + hi) >> 1;
    const teste = montarDe(molde, todos.slice(0, meio));
    area.replaceChild(teste, atual); atual = teste;
    if(topo + atual.offsetHeight <= LIMITE_PX + 0.5){ melhor = meio; lo = meio + 1; }
    else hi = meio - 1;
  }
  if(melhor === 0){ area.replaceChild(montarDe(molde, todos), atual); return null; }
  area.replaceChild(montarDe(molde, todos.slice(0, melhor)), atual);
  return montarDe(molde, todos.slice(melhor));
}
function novaFolha(cont){
  const f = document.createElement("div");
  f.className = "folha";
  const img = document.createElement("img");
  img.className = "timbrado"; img.src = timbradoAtual(); img.alt = "";
  const ct = document.createElement("div");
  ct.className = "conteudo";
  f.appendChild(img); f.appendChild(ct); cont.appendChild(f);
  return ct;
}
function timbradoAtual(){
  return (D.config && D.config.timbrado) || $("#timbradoFonte").src;
}
function paginar(html){
  const cont = $("#paginas");
  cont.innerHTML = "";
  const molde = document.createElement("div");
  molde.innerHTML = html;
  // texto solto na raiz (o editor livre produz isso) vira parágrafo em vez de sumir
  Array.from(molde.childNodes).forEach(n => {
    if(n.nodeType === 3 && n.nodeValue.trim()){
      const p = document.createElement("p");
      p.textContent = n.nodeValue;
      molde.replaceChild(p, n);
    }
  });
  const fila = Array.from(molde.children);
  let area = novaFolha(cont);
  let guarda = 0;
  while(fila.length && guarda++ < 4000){
    const b = fila.shift();
    if(b.classList && b.classList.contains("quebra")){
      if(area.children.length) area = novaFolha(cont);
      continue;
    }
    area.appendChild(b);
    if(!transbordou(area)) continue;
    if(area.children.length > 1){
      area.removeChild(b); fila.unshift(b); area = novaFolha(cont); continue;
    }
    const resto = dividir(area, b);
    if(resto) fila.unshift(resto);
  }
  // quebra de página no fim do texto deixaria uma folha em branco
  while(cont.children.length > 1 && !cont.lastElementChild.querySelector(".conteudo").children.length)
    cont.removeChild(cont.lastElementChild);
  if(D.config.numerarPaginas){
    const folhas = Array.from(cont.children);
    folhas.forEach((f, i) => {
      const n = document.createElement("div");
      n.className = "numero"; n.textContent = (i+1) + " / " + folhas.length;
      f.appendChild(n);
    });
  }
  return cont.children.length;
}

function nomeArquivo(c){
  if(c.nomeArquivo) return c.nomeArquivo;
  const d = c.dados;
  const completo = D.config.nomeArquivoCompleto;
  const nome = (d.nome || "").trim().toUpperCase();
  const usar = !nome ? "SEM NOME" : (completo ? nome : nome.split(/\s+/)[0]);
  const data = (d.data_evento && /^\d{4}-\d{2}-\d{2}$/.test(d.data_evento))
    ? d.data_evento.split("-").reverse().join("_") : "SEM_DATA";
  return (D.config.padraoArquivo || "CONTRATO {NOME} {DATA}")
    .replace(/\{NOME\}/g, usar).replace(/\{DATA\}/g, data)
    .replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g," ").trim();
}

/* CP1252: só os códigos de 0x80–0x9F que não batem com Unicode */
const WIN1252 = {0x20AC:0x80,0x201A:0x82,0x0192:0x83,0x201E:0x84,0x2026:0x85,0x2020:0x86,
  0x2021:0x87,0x02C6:0x88,0x2030:0x89,0x0160:0x8A,0x2039:0x8B,0x0152:0x8C,0x017D:0x8E,
  0x2018:0x91,0x2019:0x92,0x201C:0x93,0x201D:0x94,0x2022:0x95,0x2013:0x96,0x2014:0x97,
  0x02DC:0x98,0x2122:0x99,0x0161:0x9A,0x203A:0x9B,0x0153:0x9C,0x017E:0x9E,0x0178:0x9F};

function bytesLatin1(s){
  const b = new Uint8Array(s.length);
  for(let i=0;i<s.length;i++) b[i] = s.charCodeAt(i) & 0xff;
  return b;
}
function b64Bytes(b64){
  const bin = atob(b64), b = new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) b[i] = bin.charCodeAt(i);
  return b;
}
function textoPDF(s){
  let out = "";
  for(const ch of String(s)){
    let cod = ch.codePointAt(0);
    if(cod > 0xFF) cod = WIN1252[cod] !== undefined ? WIN1252[cod] : 0x3F;
    if(cod === 0x28 || cod === 0x29 || cod === 0x5C) out += "\\" + String.fromCharCode(cod);
    else if(cod < 32 || cod > 126) out += "\\" + cod.toString(8).padStart(3,"0");
    else out += String.fromCharCode(cod);
  }
  return out;
}
const n3 = v => (Math.round(v*1000)/1000).toString();

/* --------------------------------------------- métricas da fonte (Arial) */
const _mcache = {};
function razoes(negrito, italico){
  const k = (negrito?"b":"") + (italico?"i":"");
  if(_mcache[k]) return _mcache[k];
  const cx = razoes._cx || (razoes._cx = document.createElement("canvas").getContext("2d"));
  cx.font = (italico?"italic ":"") + (negrito?"bold ":"") + "100px Arial";
  const m = cx.measureText("Hxjgq");
  let asc = m.fontBoundingBoxAscent, desc = m.fontBoundingBoxDescent;
  if(!isFinite(asc) || !asc){ asc = 90.5; desc = 21.2; }
  return (_mcache[k] = {asc: asc/100, desc: desc/100});
}
function corRGB(txt){
  const m = String(txt||"").match(/rgba?\(([^)]+)\)/);
  if(!m) return null;
  const p = m[1].split(",").map(x => parseFloat(x));
  return {r:p[0]/255, g:p[1]/255, b:p[2]/255, a: p.length > 3 ? p[3] : 1};
}

/* ------------------------------------ lê uma folha e devolve os desenhos */
function lerFolha(folha){
  const r0 = folha.getBoundingClientRect();
  const escala = r0.width / (210 * MM) || 1;   // 210 mm é a largura real da folha
  const px = v => v / escala * PT;
  const X = v => (v - r0.left) / escala * PT;
  const Y = v => (v - r0.top)  / escala * PT;
  const itens = [];

  const cam = document.createTreeWalker(folha, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let no = folha;
  do{
    if(no.nodeType === 1){
      const cs = getComputedStyle(no);
      if(cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0){
        // pula a subárvore inteira
        let prox = no.nextSibling, sobe = no;
        while(!prox && sobe.parentNode && sobe !== folha){ sobe = sobe.parentNode; prox = sobe.nextSibling; }
        if(!prox || !folha.contains(prox)) break;
        cam.currentNode = prox; no = prox; continue;
      }
      const r = no.getBoundingClientRect();
      const bg = corRGB(cs.backgroundColor);
      if(bg && bg.a > 0.02 && r.width > 0 && r.height > 0)
        itens.push({t:"ret", x:X(r.left), y:Y(r.top), w:px(r.width), h:px(r.height), cor:bg});
      [["Top",0],["Right",1],["Bottom",2],["Left",3]].forEach(([lado, i]) => {
        const larg = parseFloat(cs["border" + lado + "Width"]) || 0;
        if(larg <= 0 || cs["border" + lado + "Style"] === "none") return;
        const c = corRGB(cs["border" + lado + "Color"]);
        if(!c || c.a < 0.02) return;
        const L = px(larg);
        const cx = {0:{x:X(r.left), y:Y(r.top), w:px(r.width), h:L},
                    1:{x:X(r.right)-L, y:Y(r.top), w:L, h:px(r.height)},
                    2:{x:X(r.left), y:Y(r.bottom)-L, w:px(r.width), h:L},
                    3:{x:X(r.left), y:Y(r.top), w:L, h:px(r.height)}}[i];
        itens.push({t:"ret", cor:c, ...cx});
      });
      if(no.tagName === "IMG" && no.complete && no.naturalWidth)
        itens.push({t:"img", el:no, x:X(r.left), y:Y(r.top), w:px(r.width), h:px(r.height)});
    }else if(no.nodeType === 3 && /\S/.test(no.nodeValue)){
      const pai = no.parentElement;
      const cs = getComputedStyle(pai);
      const fsPx = parseFloat(cs.fontSize);
      const peso = parseInt(cs.fontWeight, 10);
      const negrito = (isNaN(peso) ? cs.fontWeight === "bold" : peso >= 600);
      const italico = cs.fontStyle === "italic" || cs.fontStyle === "oblique";
      const cor = corRGB(cs.color) || {r:0,g:0,b:0,a:1};
      const sub = /underline/.test(cs.textDecorationLine || cs.textDecoration || "");
      const raz = razoes(negrito, italico);
      const re = /\S+/g; let m;
      while((m = re.exec(no.nodeValue))){
        const rg = document.createRange();
        rg.setStart(no, m.index); rg.setEnd(no, m.index + m[0].length);
        const r = rg.getBoundingClientRect();
        if(!r.width || !r.height) continue;
        const fs = fsPx * PT, alt = px(r.height);
        const base = Y(r.top) + (alt - (raz.asc + raz.desc) * fs) / 2 + raz.asc * fs;
        itens.push({t:"txt", s:m[0], x:X(r.left), base, fs, negrito, italico, cor,
                    sub, larg: px(r.width)});
      }
    }
    no = cam.nextNode();
  }while(no);
  return itens;
}

/* -------------------------------------------------- imagens para o PDF */
function imagemBytes(img){
  const src = img.currentSrc || img.src;
  const mj = /^data:image\/jpe?g;base64,(.+)$/i.exec(src);
  if(mj) return {bytes: b64Bytes(mj[1]), w: img.naturalWidth, h: img.naturalHeight};
  const cv = document.createElement("canvas");
  cv.width = img.naturalWidth; cv.height = img.naturalHeight;
  const cx = cv.getContext("2d");
  cx.fillStyle = "#fff"; cx.fillRect(0, 0, cv.width, cv.height);
  cx.drawImage(img, 0, 0);
  const url = cv.toDataURL("image/jpeg", 0.94);
  return {bytes: b64Bytes(url.split(",")[1]), w: cv.width, h: cv.height};
}

/* ------------------------------------------------------ monta o arquivo */
function gerarPDF(){
  const folhas = Array.from($("#paginas").children);
  if(!folhas.length) return null;
  const W = 595.276, H = 841.89;

  const objs = [];
  const novo = c => { objs.push(c); return objs.length; };
  const reservar = () => { objs.push(null); return objs.length; };

  const idCat = reservar(), idPgs = reservar();
  const fontes = {
    F1: novo("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"),
    F2: novo("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"),
    F3: novo("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>"),
    F4: novo("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-BoldOblique /Encoding /WinAnsiEncoding >>")
  };
  const recFontes = Object.keys(fontes).map(k => "/" + k + " " + fontes[k] + " 0 R").join(" ");

  const cacheImg = new Map();
  function refImagem(el){
    const chave = el.currentSrc || el.src;
    if(cacheImg.has(chave)) return cacheImg.get(chave);
    const im = imagemBytes(el);
    const id = novo(["<< /Type /XObject /Subtype /Image /Width " + im.w + " /Height " + im.h +
      " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + im.bytes.length +
      " >>\nstream\n", im.bytes, "\nendstream"]);
    const r = {id, nome: "Im" + cacheImg.size};
    cacheImg.set(chave, r);
    return r;
  }

  const idsPagina = [];
  folhas.forEach(folha => {
    const itens = lerFolha(folha);
    const usadas = new Map();
    let s = "";
    let corAtual = null;
    const setCor = c => {
      const k = n3(c.r) + " " + n3(c.g) + " " + n3(c.b);
      if(k !== corAtual){ s += k + " rg\n"; corAtual = k; }
    };
    itens.forEach(it => {
      if(it.t === "ret"){
        setCor(it.cor);
        s += n3(it.x) + " " + n3(H - it.y - it.h) + " " + n3(it.w) + " " + n3(it.h) + " re f\n";
      }else if(it.t === "img"){
        const r = refImagem(it.el);
        usadas.set(r.nome, r.id);
        s += "q " + n3(it.w) + " 0 0 " + n3(it.h) + " " + n3(it.x) + " " +
             n3(H - it.y - it.h) + " cm /" + r.nome + " Do Q\n";
      }else{
        const f = it.negrito ? (it.italico ? "F4" : "F2") : (it.italico ? "F3" : "F1");
        setCor(it.cor);
        s += "BT /" + f + " " + n3(it.fs) + " Tf 1 0 0 1 " + n3(it.x) + " " +
             n3(H - it.base) + " Tm (" + textoPDF(it.s) + ") Tj ET\n";
        if(it.sub){
          const esp = Math.max(0.4, it.fs * 0.06);
          s += n3(it.x) + " " + n3(H - it.base - it.fs * 0.13) + " " + n3(it.larg) + " " +
               n3(esp) + " re f\n";
        }
      }
    });
    const idCont = novo(["<< /Length " + bytesLatin1(s).length + " >>\nstream\n", s, "\nendstream"]);
    const rec = "<< /Font << " + recFontes + " >>" +
      (usadas.size ? " /XObject << " + Array.from(usadas, ([n, i]) => "/" + n + " " + i + " 0 R").join(" ") + " >>" : "") +
      " >>";
    idsPagina.push(novo("<< /Type /Page /Parent " + idPgs + " 0 R /MediaBox [0 0 " + n3(W) + " " + n3(H) +
      "] /Resources " + rec + " /Contents " + idCont + " 0 R >>"));
  });

  objs[idCat-1] = "<< /Type /Catalog /Pages " + idPgs + " 0 R >>";
  objs[idPgs-1] = "<< /Type /Pages /Kids [" + idsPagina.map(i => i + " 0 R").join(" ") +
                  "] /Count " + idsPagina.length + " >>";

  const pedacos = []; let pos = 0;
  const w = x => { const b = (typeof x === "string") ? bytesLatin1(x) : x; pedacos.push(b); pos += b.length; };
  w("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  const offs = [];
  objs.forEach((o, i) => {
    offs[i] = pos;
    w((i+1) + " 0 obj\n");
    (Array.isArray(o) ? o : [o]).forEach(w);
    w("\nendobj\n");
  });
  const xref = pos;
  w("xref\n0 " + (objs.length+1) + "\n0000000000 65535 f \n");
  objs.forEach((_, i) => w(String(offs[i]).padStart(10,"0") + " 00000 n \n"));
  w("trailer\n<< /Size " + (objs.length+1) + " /Root " + idCat + " 0 R >>\nstartxref\n" + xref + "\n%%EOF\n");
  return new Blob(pedacos, {type:"application/pdf"});
}

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
// ============================================================
//  MODELO — Contrato de Prestação de Serviços de Buffet
//  D'Luh Festas (CONTRATADA fixa)
// ============================================================
// Como funciona:
//  - "campos": as lacunas que aparecem no formulário.
//  - "clausulas": o texto do contrato. Use {{id_do_campo}} para
//    inserir o valor de um campo dentro do texto.
//  - Na tela de edição dá pra alterar o texto de qualquer cláusula.

window_.MODELO_PADRAO = {
  titulo: "Contrato de Prestação de Serviços de Buffet",

  campos: [
    // --- Contratante ---
    { id: "contratante_nome", label: "Contratante — Nome",        tipo: "text", obrigatorio: true },
    { id: "contratante_end",  label: "Contratante — Endereço",    tipo: "text", obrigatorio: true },
    { id: "contratante_cpf",  label: "Contratante — CPF/CNPJ",    tipo: "doc",  obrigatorio: true },
    // --- Evento ---
    { id: "evento_tipo",   label: "Tipo de evento",               tipo: "text", obrigatorio: true },
    { id: "data_evento",   label: "Data do evento",               tipo: "date", obrigatorio: true },
    { id: "local_evento",  label: "Local/espaço do evento",       tipo: "text", obrigatorio: true },
    { id: "inicio",        label: "Horário de início",            tipo: "hora", obrigatorio: true },
    { id: "fim",           label: "Horário de término",           tipo: "hora", obrigatorio: true },
    { id: "duracao",       label: "Duração do evento",            tipo: "text", obrigatorio: true },
    { id: "tolerancia",    label: "Tolerância",                   tipo: "text", obrigatorio: false },
    { id: "convidados",    label: "Nº estimado de convidados",    tipo: "text", obrigatorio: true },
    { id: "chegada",       label: "Horário de chegada da equipe", tipo: "hora", obrigatorio: true },
    { id: "antecedencia",  label: "Antecedência de preparação",   tipo: "text", obrigatorio: false },
    { id: "garcons",       label: "Qtd. de garçons",              tipo: "text", obrigatorio: false, placeholder: "vazio se não houver" },
    { id: "cozinheiras",   label: "Qtd. de cozinheiras",          tipo: "text", obrigatorio: false, placeholder: "vazio se não houver" },
    { id: "organizadores", label: "Qtd. de organizadores",        tipo: "text", obrigatorio: false, placeholder: "vazio se não houver" },
    { id: "auxiliares",    label: "Qtd. de auxiliares",           tipo: "text", obrigatorio: false, placeholder: "vazio se não houver" },
    // --- Pagamento ---
    { id: "valor_total",   label: "Valor total (R$)",             tipo: "money", obrigatorio: true },
    { id: "valor_extenso", label: "Valor total por extenso",      tipo: "text",  obrigatorio: true },
    { id: "entrada",       label: "Valor da entrada (R$)",        tipo: "money", obrigatorio: true },
    { id: "data_entrada",  label: "Data da entrada",              tipo: "date",  obrigatorio: true },
    // --- Foro / assinatura ---
    { id: "cidade",        label: "Cidade (foro/assinatura)",     tipo: "text",  obrigatorio: true },
  ],

  clausulas: [
    {
      id: "partes",
      titulo: "IDENTIFICAÇÃO DAS PARTES CONTRATANTES",
      texto:
        "CONTRATANTE: {{contratante_nome}}\n" +
        "Endereço: {{contratante_end}}\n" +
        "CPF/CNPJ: {{contratante_cpf}}\n\n" +
        "CONTRATADA: LUCIANA DE AGUILAR FREITAS, proprietária da empresa D'Luh Festas, " +
        "com sede em Montes Claros, na Rua Visconde de Taunay, 278, Bairro Vila Maria Cândida, " +
        "CEP 39402-394, Estado de Minas Gerais. Nacionalidade: Brasileira. Estado civil: Casada. " +
        "Empresária, inscrita no CNPJ sob o nº 47.271.021/0001-05, residente e domiciliada no mesmo endereço.\n\n" +
        "As partes acima identificadas têm, entre si, justo e contratado o presente Contrato de Prestação " +
        "de Serviços de Buffet, oferecido pela D'Luh Festas, que se regerá pelas cláusulas seguintes e pelas " +
        "condições de preço, forma e termo de pagamento descritas neste instrumento."
    },
    {
      id: "c1",
      titulo: "CLÁUSULA 1ª – DO OBJETO DO CONTRATO",
      texto:
        "A presente contratação tem como objeto a prestação de serviços de buffet, pela CONTRATADA, para " +
        "{{evento_tipo}} da CONTRATANTE, a realizar-se no dia {{data_evento}}, no espaço {{local_evento}}, " +
        "com início às {{inicio}}."
    },
    {
      id: "c2",
      titulo: "CLÁUSULA 2ª – DO EVENTO",
      texto:
        "O evento terá duração de {{duracao}}, com tolerância de {{tolerancia}}, e contará com a presença " +
        "estimada de {{convidados}} convidados. O local e horário do evento são os descritos na cláusula anterior."
    },
    {
      id: "c3",
      titulo: "CLÁUSULA 3ª – DAS OBRIGAÇÕES DA CONTRATANTE",
      texto:
        "A CONTRATANTE compromete-se a fornecer todas as informações necessárias para a adequada realização " +
        "do serviço, especificando detalhes do evento e a forma de execução dos serviços contratados."
    },
    {
      id: "c4",
      titulo: "CLÁUSULA 4ª",
      texto: "A CONTRATANTE deverá realizar o pagamento conforme estipulado na Cláusula 11 deste contrato."
    },
    {
      id: "c5",
      titulo: "CLÁUSULA 5ª – DAS OBRIGAÇÕES DA CONTRATADA",
      texto:
        "A CONTRATADA deverá prestar os serviços conforme especificações da CONTRATANTE, iniciando-se às " +
        "{{inicio}} e finalizando às {{fim}}. Os produtos servidos deverão ser de alta qualidade, preparados " +
        "e apresentados dentro das normas de higiene e limpeza."
    },
    {
      id: "c6",
      titulo: "CLÁUSULA 6ª",
      texto:
        "A CONTRATADA se responsabiliza por fornecer utensílios como pratos, copos, taças, talheres, bandejas, " +
        "réchauds, baldes de gelo, entre outras especificações em anexo, para execução dos serviços."
    },
    {
      id: "c7",
      titulo: "CLÁUSULA 7ª",
      texto:
        "A CONTRATADA deverá estar presente no local do evento às {{chegada}}, a fim de realizar a preparação " +
        "do espaço com antecedência mínima de {{antecedencia}}."
    },
    {
      id: "c8",
      titulo: "CLÁUSULA 8ª",
      texto:
        "Serão disponibilizados para a execução do serviço: {{equipe}}."
    },
    {
      id: "c9",
      titulo: "CLÁUSULA 9ª",
      texto:
        "A CONTRATADA será exclusivamente responsável por seus colaboradores, incluindo cumprimento de " +
        "obrigações trabalhistas, previdenciárias, fiscais e sociais."
    },
    {
      id: "c10",
      titulo: "CLÁUSULA 10ª",
      texto:
        "Todos os colaboradores da CONTRATADA deverão estar devidamente uniformizados, apresentando conduta " +
        "adequada e profissional."
    },
    {
      id: "c11",
      titulo: "CLÁUSULA 11ª – DO PREÇO E CONDIÇÕES DE PAGAMENTO",
      texto:
        "O serviço será remunerado no valor de R$ {{valor_total}} ({{valor_extenso}}), com entrada de " +
        "R$ {{entrada}} em {{data_entrada}}."
    },
    {
      id: "c12",
      titulo: "CLÁUSULA 12ª – DO INADIMPLEMENTO",
      texto:
        "Em caso de inadimplemento da CONTRATANTE, incidirão multa de 2%, juros de mora de 1% ao mês e correção " +
        "monetária. Em caso de cobrança judicial, serão acrescidos honorários advocatícios de 20% e custas processuais."
    },
    {
      id: "c13",
      titulo: "CLÁUSULA 13ª – DA DEVOLUÇÃO",
      texto:
        "Todos os utensílios fornecidos deverão ser devolvidos em perfeito estado. Em caso de danos ou extravios, " +
        "a CONTRATANTE deverá arcar com o valor de reposição conforme anexo, no prazo máximo de 24 horas após o " +
        "evento, sob pena de aplicação de multa, juros e correção conforme cláusula anterior."
    },
    {
      id: "c14",
      titulo: "CLÁUSULA 14ª – DA RESCISÃO",
      texto:
        "O contrato poderá ser rescindido unilateralmente por qualquer das partes, mediante comunicação escrita " +
        "com justificativa, respeitado o prazo mínimo de 60 (sessenta) dias antes da data do evento."
    },
    {
      id: "c15",
      titulo: "CLÁUSULA 15ª – DAS MULTAS CONTRATUAIS",
      texto:
        "Salvo rescisão conforme cláusula anterior, a parte que descumprir o contrato deverá pagar multa de 50% " +
        "(cinquenta por cento) do valor total, sem prejuízo de eventuais perdas e danos."
    },
    {
      id: "c16",
      titulo: "CLÁUSULA 16ª – CONDIÇÕES GERAIS",
      texto:
        "Caso necessário, e havendo possibilidade, a CONTRATADA poderá complementar os serviços de buffet durante o evento."
    },
    {
      id: "c17",
      titulo: "CLÁUSULA 17ª",
      texto:
        "O cardápio será preparado de acordo com o número de convidados informado. A CONTRATADA não será " +
        "responsável por eventuais insuficiências caso haja número superior ao estipulado."
    },
    {
      id: "c18",
      titulo: "CLÁUSULA 18ª",
      texto:
        "Qualquer alteração neste contrato deverá ser feita por meio de Termo Aditivo, assinado por ambas as partes."
    },
    {
      id: "c19",
      titulo: "CLÁUSULA 19ª – DO FORO",
      texto:
        "Fica eleito o foro da Comarca de {{cidade}}/MG para dirimir quaisquer dúvidas ou litígios decorrentes deste contrato."
    },
  ],
};

const MODEL = window_.MODELO_PADRAO;

function fill(text, vals){
  return text.replace(/\{\{\s*([\w]+)\s*\}\}/g, (_,k)=>{
    const f = MODEL.campos.find(x=>x.id===k);
    let val = vals[k];
    if (val==null || val===''){
      // obrigatório vazio: traço (dica na tela). opcional/derivado vazio: some, sem barras
      return (f && f.obrigatorio) ? '__________' : '';
    }
    if (f && f.tipo==='money') val = fmtMoney(val);
    if (f && f.tipo==='date')  val = fmtDate(val);
    return val;
  });
}
// monta a lista de equipe só com os cargos que têm quantidade
function buildEquipe(v){
  const roles = [
    {q:v.garcons,      s:'garçom',      p:'garçons'},
    {q:v.cozinheiras,  s:'cozinheira',  p:'cozinheiras'},
    {q:v.organizadores,s:'organizador', p:'organizadores'},
    {q:v.auxiliares,   s:'auxiliar',    p:'auxiliares'},
  ];
  const parts = [];
  roles.forEach(r=>{
    const n = parseInt(String(r.q||'').replace(/\D/g,''),10);
    if(n>0) parts.push(`${n} ${n===1?r.s:r.p}`);
  });
  if(parts.length===0) return 'a definir';
  if(parts.length===1) return parts[0];
  return parts.slice(0,-1).join(', ') + ' e ' + parts[parts.length-1];
}
function renderPreview(){
  const vals = getValues();
  vals.equipe = buildEquipe(vals);   // valor calculado p/ a cláusula 8
  const p = document.getElementById('preview');
  let html = '';
  if (window.LOGO_CONTRATO) html += `<div class="logo"><img src="${window.LOGO_CONTRATO}" alt="logo"></div>`;
  html += `<h2>${escapeHtml(MODEL.titulo)}</h2>`;
  clausesState.forEach(cl=>{
    html += `<div class="cl"><h3>${escapeHtml(cl.titulo)}</h3>
      <p>${escapeHtml(fill(cl.texto, vals))}</p></div>`;
  });
  html += `<div class="sig">
    <div class="place"><span class="line"></span>${escapeHtml(vals.cidade||'')}</div>
    <div class="srow"><span>Nome e assinatura do Contratado:</span><span class="fill"></span></div>
    <div class="srow"><span>Assinatura do Contratante:</span><span class="fill"></span></div>
  </div>`;
  p.innerHTML = html;
}

// ============================================================
//  VALIDAÇÃO
// ============================================================
function validate(){
  let ok = true; let first=null;
  const vals = getValues();
  MODEL.campos.forEach(f=>{
    const val = vals[f.id];
    let msg = '';
    if (f.obrigatorio && !val) msg = 'Campo obrigatório.';
    else if (val && f.tipo==='doc' && !validaDoc(val)) msg = 'CPF/CNPJ inválido.';
    else if (val && f.tipo==='money' && isNaN(parseMoney(val))) msg = 'Valor inválido.';
    if (msg){ ok=false; showErr(f.id,msg); if(!first) first=f.id; }
    else clearErr(f.id);
  });
  if (first) document.getElementById('in-'+first).focus();
  return ok;
}
function showErr(id,msg){
  document.getElementById('field-'+id)?.classList.add('invalid');
  const e=document.getElementById('err-'+id); if(e) e.textContent=msg;
}
function clearErr(id){ document.getElementById('field-'+id)?.classList.remove('invalid'); }

// ---- CPF/CNPJ ----
function validaDoc(v){
  const n = v.replace(/\D/g,'');
  return n.length===11 ? validaCPF(n) : n.length===14 ? validaCNPJ(n) : false;
}
function validaCPF(c){
  if(/^(\d)\1{10}$/.test(c)) return false;
  let s=0; for(let i=0;i<9;i++) s+=+c[i]*(10-i);
  let d=(s*10)%11; if(d===10)d=0; if(d!==+c[9]) return false;
  s=0; for(let i=0;i<10;i++) s+=+c[i]*(11-i);
  d=(s*10)%11; if(d===10)d=0; return d===+c[10];
}
function validaCNPJ(c){
  if(/^(\d)\1{13}$/.test(c)) return false;
  const calc=(len)=>{let s=0,p=len-7;for(let i=len;i>=1;i--){s+=+c[len-i]*p--;if(p<2)p=9;}let r=s%11;return r<2?0:11-r;};
  return calc(12)===+c[12] && calc(13)===+c[13];
}

// ---- formatação ----
function parseMoney(v){
  let s = String(v).replace(/[^\d.,]/g,'');
  if(s==='') return NaN;
  if(s.includes(',')){                    // pt-BR: vírgula decimal, ponto milhar
    s = s.replace(/\./g,'').replace(',','.');
  } else if(s.includes('.')){             // só ponto: decidir milhar x decimal
    const parts = s.split('.');
    const last = parts[parts.length-1];
    if(parts.length>2 || last.length===3) s = parts.join(''); // milhar (1.234 / 1.234.567)
    // senão trata ponto como decimal (1234.5 / 1234.56)
  }
  return parseFloat(s);
}
function fmtMoney(v){ const n=parseMoney(v); return isNaN(n)?v:n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); }
function fmtDate(v){ if(!/^\d{4}-\d{2}-\d{2}$/.test(v)) return v; const[a,m,d]=v.split('-'); return `${d}/${m}/${a}`; }
function escapeHtml(s){ return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

// ---- máscara CPF/CNPJ ----
function maskDoc(v){
  const d = v.replace(/\D/g,'').slice(0,14);
  if(d.length<=11){ // CPF
    if(d.length>9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
    if(d.length>6) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
    if(d.length>3) return `${d.slice(0,3)}.${d.slice(3)}`;
    return d;
  } // CNPJ
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`.replace(/[-/.]+$/,'');
}
// ---- hora (normaliza "2100" -> "21:00"; preserva AM/PM) ----
function fmtHora(v){
  const t = String(v).trim();
  if(!t) return t;
  const ampm = /(am|pm)/i.exec(t);
  const d = t.replace(/\D/g,'');
  let core = t;
  if(/^\d{3,4}$/.test(d)){
    const hh = d.slice(0, d.length-2), mm = d.slice(-2);
    core = hh.padStart(2,'0')+':'+mm;
  } else if(/^\d{1,2}$/.test(d)){
    core = d.padStart(2,'0')+':00';
  }
  return ampm ? core+' '+ampm[1].toUpperCase() : core;
}
// ---- número por extenso (pt-BR) ----
function extensoReais(v){
  let n = parseMoney(v);
  if(isNaN(n)) return '';
  n = Math.round(n*100);
  const reais = Math.floor(n/100), cent = n%100;
  let out = '';
  if(reais>0) out = numeroExtenso(reais) + (reais===1?' real':' reais');
  if(cent>0) out += (out?' e ':'') + numeroExtenso(cent) + (cent===1?' centavo':' centavos');
  return out || 'zero reais';
}
const _U=['','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
const _D=['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
const _C=['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
function ate999(n){
  if(n===0) return '';
  if(n===100) return 'cem';
  let s=''; const c=Math.floor(n/100), r=n%100;
  if(c>0) s=_C[c];
  if(r>0){ if(s) s+=' e ';
    if(r<20) s+=_U[r];
    else { const d=Math.floor(r/10), u=r%10; s+=_D[d]; if(u>0) s+=' e '+_U[u]; }
  }
  return s;
}
function numeroExtenso(n){
  if(n===0) return 'zero';
  const bil=Math.floor(n/1e9), mi=Math.floor(n/1e6)%1000, mil=Math.floor(n/1000)%1000, resto=n%1000;
  const parts=[];
  if(bil>0)  parts.push(ate999(bil)+(bil===1?' bilhão':' bilhões'));
  if(mi>0)   parts.push(ate999(mi)+(mi===1?' milhão':' milhões'));
  if(mil>0)  parts.push(mil===1?'mil':ate999(mil)+' mil');
  if(resto>0)parts.push(ate999(resto));
  let out='';
  for(let i=0;i<parts.length;i++){
    if(i>0) out += (i===parts.length-1 && (resto<100 || resto%100===0)) ? ' e ' : ', ';
    out += parts[i];
  }
  return out;
}
// ---- nome padrão do contrato ----
function defaultName(v){
  const nome = (v.contratante_nome||'').trim().split(/\s+/).slice(0,2).join(' ');
  const evento = (v.evento_tipo||'').trim();
  if(nome && evento) return `${nome} - ${evento}`;
  if(nome) return nome;
  return MODEL.titulo;
}

// ============================================================
//  PDF

/* gerarPDF do original, com os valores e as cláusulas vindos da tela (lá eram getValues()/clausesState). */
function gerarPDFCom(valores, clausesState, nomeContrato){
  const vals = { ...valores };
  vals.equipe = buildEquipe(vals);
  const nome = (nomeContrato || defaultName(valores));
  const CW = 531;   // largura útil (A4 595pt - margens 32+32)

  const content = [];
  if(window.LOGO_CONTRATO) content.push({ image: window.LOGO_CONTRATO, width: CW, margin:[0,0,0,10] });
  content.push({ text: MODEL.titulo.toUpperCase(), bold:true, alignment:'center', fontSize:12, margin:[0,0,0,10] });
  clausesState.forEach(cl=>{
    content.push({
      unbreakable:true,   // não corta a cláusula entre páginas
      stack:[
        { text: cl.titulo, bold:true, fontSize:9.5, margin:[0,0,0,2] },
        { text: fill(cl.texto, vals), fontSize:9.5, alignment:'justify', margin:[0,0,0,7] }
      ]
    });
  });

  // ---- bloco de assinaturas ----
  const sigRow = (label)=>({
    table:{ widths:['auto','*'], body:[[
      { text: label, border:[false,false,false,false], fontSize:9.5, margin:[0,12,6,0] },
      { text: ' ',   border:[false,false,false,true],  margin:[0,12,0,2] }
    ]]},
    margin:[0,0,0,6]
  });
  content.push({
    unbreakable:true,
    margin:[0,16,0,0],
    stack:[
      { canvas:[{ type:'line', x1:150, y1:12, x2:381, y2:12, lineWidth:0.8 }] },
      { text: vals.cidade||'', alignment:'center', fontSize:9.5, margin:[0,3,0,22] },
      sigRow('Nome e assinatura do Contratado:'),
      sigRow('Assinatura do Contratante:')
    ]
  });

  const doc = {
    pageSize:'A4',
    pageMargins:[32,24,32,28],
    content,
    defaultStyle:{ fontSize:9.5, lineHeight:1.18 }
  };
  const arquivo = nome.replace(/[^\w\s-]/g,'').replace(/\s+/g,'_') + '.pdf';
  pdfMake.createPdf(doc).download(arquivo);
  return arquivo;
}

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
  if (window.LOGO_CONTRATO) html += `<div class="logo"><img src="${window.LOGO_CONTRATO}" alt="logo"></div>`;
  html += `<h2>${escapeHtml(MODEL.titulo)}</h2>`;
  clausesState.forEach(cl=>{
    html += `<div class="cl"><h3>${escapeHtml(cl.titulo)}</h3>
      <p>${escapeHtml(fill(cl.texto, vals))}</p></div>`;
  });
  html += `<div class="sig">
    <div class="place"><span class="line"></span>${escapeHtml(vals.cidade||'')}</div>
    <div class="srow"><span>Nome e assinatura do Contratado:</span><span class="fill"></span></div>
    <div class="srow"><span>Assinatura do Contratante:</span><span class="fill"></span></div>
  </div>`;
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
const CSS = ".ctm-salao .folha{position:relative;width:210mm;height:297mm;background:#fff;overflow:hidden;box-shadow:0 3px 16px rgba(0,0,0,.22);margin:0 0 8mm}\n.ctm-salao .folha .timbrado{position:absolute;left:0;top:0;width:210mm;height:297mm;z-index:0;display:block;max-width:none}\n.ctm-salao .folha .numero{position:absolute;right:6mm;bottom:2.5mm;z-index:2;font:7pt Arial,sans-serif;color:#8a8078}\n.ctm-salao .conteudo{position:absolute;left:16.7mm;top:32.4mm;width:168mm;z-index:1;font:9pt/1.74 Arial,Helvetica,sans-serif;color:#000;text-align:justify;letter-spacing:normal;word-spacing:normal;text-transform:none}\n.ctm-salao .conteudo p{margin:0 0 10pt}\n.ctm-salao .conteudo h1{font:bold 12pt/1.72 Arial,Helvetica,sans-serif;text-align:center;margin:0 0 28pt;letter-spacing:normal;color:#000}\n.ctm-salao .conteudo .clausula{margin:0 0 10pt}\n.ctm-salao .conteudo .assinaturas{display:flex;margin-top:40pt}\n.ctm-salao .conteudo .assinaturas .col{width:50%;text-align:center;font-size:11pt;line-height:1.15}\n.ctm-salao .conteudo .assinaturas .traco{white-space:nowrap}\n.ctm-salao .conteudo .assinaturas .nome{font-size:9pt;font-weight:bold;margin-top:9pt}\n.ctm-salao .conteudo .data-local{margin:0 0 10pt}\n.ctm-salao .conteudo .vazio{background:#ffe9a8;border-radius:2px;padding:0 2px;color:#7a5b00}\n.ctm-salao .conteudo .quebra{display:block;height:0;overflow:hidden;font-size:0;line-height:0}\n.ctm-editando{font:9pt/1.74 Arial,Helvetica,sans-serif;color:#000;text-align:justify;background:#fff;width:210mm;max-width:100%;box-sizing:border-box;padding:32.4mm 25.4mm 26mm 16.7mm;min-height:150mm;box-shadow:0 3px 16px rgba(0,0,0,.22);margin:0 auto;outline:none}\n.ctm-editando:focus{outline:2px solid #C0725A;outline-offset:2px}\n.ctm-editando p{margin:0 0 10pt}\n.ctm-editando h1{font:bold 12pt/1.72 Arial,Helvetica,sans-serif;text-align:center;margin:0 0 28pt;color:#000}\n.ctm-editando .assinaturas{display:flex;margin-top:40pt}\n.ctm-editando .assinaturas .col{width:50%;text-align:center;font-size:11pt;line-height:1.15}\n.ctm-editando .assinaturas .nome{font-size:9pt;font-weight:bold;margin-top:9pt}\n.ctm-editando .quebra{display:block;border-top:1px dashed #c9b9a6;margin:14pt 0;height:0;position:relative}\n.ctm-editando .vazio{background:#ffe9a8;border-radius:2px;padding:0 2px;color:#7a5b00}\n.ctm-buffet{background:#fff;padding:40px 44px;max-width:800px;margin:0 auto;font-family:Georgia,\"Times New Roman\",serif;color:#111;font-size:12px;line-height:1.34;text-align:left}\n.ctm-buffet .logo{margin:0 -44px 12px;overflow:hidden}\n.ctm-buffet .logo img{display:block;width:100%;max-width:none;height:auto}\n.ctm-buffet h2{text-align:center;font-size:15px;margin:0 0 14px;text-transform:uppercase;font-family:inherit;font-weight:bold;color:#111;letter-spacing:normal;line-height:inherit}\n.ctm-buffet .cl{margin:0 0 8px}\n.ctm-buffet .cl h3{font-size:12px;margin:0 0 2px;font-family:inherit;font-weight:bold;color:#111;letter-spacing:normal;line-height:inherit}\n.ctm-buffet .cl p{margin:0;white-space:pre-wrap;text-align:justify}\n.ctm-buffet .sig{margin-top:22px}\n.ctm-buffet .sig .place{text-align:center;margin-bottom:24px}\n.ctm-buffet .sig .place .line{display:block;width:55%;margin:0 auto 4px;border-top:1px solid #111}\n.ctm-buffet .sig .srow{display:flex;align-items:flex-end;gap:8px;margin-bottom:16px}\n.ctm-buffet .sig .srow .fill{flex:1;border-bottom:1px solid #111;height:1px}\n@media(max-width:640px){.ctm-buffet{padding:24px}.ctm-buffet .logo{margin:0 -24px 14px}}\n";
const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

window.DLUH_MOTOR = { salao: SALAO, buffet: BUFFET, CSS };
})();
