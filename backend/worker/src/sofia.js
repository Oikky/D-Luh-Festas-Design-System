/* Pedido que a Sofia (agente de atendimento no GPTMaker) fecha pelo WhatsApp da loja:
     POST /sofia/pedido/<SOFIA_TOKEN>
   A "Intenção" do GPTMaker manda campos soltos em texto; aqui eles viram o mesmo pedido do site
   (pedidoDoSite: preço, nome e mínimo do catálogo; nasce "Aguardando confirmação"). A equipe confere
   e, ao confirmar, o sistema manda o link de pagamento como já faz. A Sofia não decide nada: só
   entrega o pedido. Erro volta em texto simples para ela explicar ao cliente ou corrigir. */
import { ErroDominio } from "./dominio.js";
import { pedidoDoSite } from "./site.js";
import { PRODUTOS, CATALOGO_SITE } from "./produtos.js";
import { PEDIDOS } from "./pedidos.js";

const texto = (v, max) => String(v ?? "").trim().slice(0, max);
/* O GPTMaker obriga todo campo da Intenção: "nenhuma", "-", "não tem"... valem como vazio. */
const VAZIO = /^(nenhum[a]?|nada|sem|sem obs\.?|sem observa[çc][aã]o|n[aã]o|n[aã]o tem|n\/?a|-+|\.+|vazio|null|undefined)$/i;
const opcional = (v, max) => { const t = texto(v, max); return VAZIO.test(t) ? "" : t; };

/* "Bolo aro 18" e "bolo de aro 18" batem: sem emoji, acento, caixa e palavras de ligação. */
const PALAVRAS_VAZIAS = new Set(["de", "da", "do", "com", "e", "o", "a", "os", "as", "un", "und", "unid", "unidade", "unidades"]);
function normalizar(s) {
  return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter(p => p && !PALAVRAS_VAZIAS.has(p))
    .map(p => p.length > 3 ? p.replace(/s$/, "") : p).join(" ");
}

/* Acha o produto pelo nome que a Sofia escreveu: igual; senão o único que contém (ou está contido);
   senão o de mais palavras em comum, se não houver empate. */
function acharProduto(nome, produtos) {
  const n = normalizar(nome);
  if (!n) return { erro: "item sem nome" };
  const iguais = produtos.filter(p => p._n === n);
  if (iguais.length === 1) return { produto: iguais[0] };
  const contem = produtos.filter(p => p._n.includes(n) || n.includes(p._n));
  if (contem.length === 1) return { produto: contem[0] };
  // "pastel" com vários pastéis no cardápio: a Sofia pergunta qual.
  if (contem.length > 1) return { erro: `"${texto(nome, 60)}" pode ser mais de um produto`, parecidos: contem.slice(0, 5).map(p => p.nome) };
  const pal = new Set(n.split(" "));
  const notas = (contem.length ? contem : produtos).map(p => {
    const pp = p._n.split(" ");
    const comum = pp.filter(x => pal.has(x)).length;
    return { p, nota: comum / Math.max(pp.length, pal.size) };
  }).filter(x => x.nota > 0).sort((a, b) => b.nota - a.nota);
  if (notas.length && notas[0].nota >= 0.5 && (notas.length === 1 || notas[1].nota < notas[0].nota)) return { produto: notas[0].p };
  return { erro: `não achei "${texto(nome, 60)}" no cardápio`, parecidos: notas.slice(0, 3).map(x => x.p.nome) };
}

/* Uma linha por item: "50 coxinha", "1 bolo aro 18 (recheios: Creme Ninho, Brigadeiro; tema: Frozen)".
   Linhas separadas por quebra de linha ou ";" fora dos parênteses. */
function lerItens(textoItens) {
  const linhas = [];
  let atual = "", nivel = 0;
  for (const ch of String(textoItens || "")) {
    if (ch === "(") nivel++;
    if (ch === ")") nivel = Math.max(0, nivel - 1);
    if ((ch === "\n" || ch === ";") && nivel === 0) { linhas.push(atual); atual = ""; } else atual += ch;
  }
  linhas.push(atual);
  return linhas.map(l => l.trim().replace(/^[-•*]\s*/, "")).filter(Boolean).map(l => {
    const m = /^(\d+)\s*(?:x|un\.?|unidades?)?\s*(.+?)\s*(?:\((.*)\))?$/i.exec(l);
    if (!m) return { erro: `não entendi o item "${texto(l, 60)}" (use: quantidade + nome)` };
    const extras = {};
    for (const parte of String(m[3] || "").split(";")) {
      const [k, ...v] = parte.split(":");
      if (v.length) extras[normalizar(k)] = v.join(":").trim();
    }
    const recheios = (extras.recheio || extras.recheios || extras.sabor || extras.sabores || "").split(/,| e /).map(s => s.trim()).filter(Boolean);
    return { qtd: Number(m[1]), nome: m[2], recheios, tema: extras.tema || extras.topo || "" };
  });
}

/* "15/10/2026", "15/10" ou "2026-10-15" → AAAA-MM-DD (sem ano: o próximo 15/10 a partir de hoje). */
function lerData(s, hoje) {
  const v = String(s || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const m = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/.exec(v);
  if (!m) return "";
  const dois = n => String(n).padStart(2, "0");
  let ano = m[3] ? Number(m[3].length === 2 ? `20${m[3]}` : m[3]) : Number(hoje.slice(0, 4));
  let data = `${ano}-${dois(m[2])}-${dois(m[1])}`;
  if (!m[3] && data < hoje) data = `${ano + 1}-${dois(m[2])}-${dois(m[1])}`;
  return data;
}

/* "15h", "15:30", "9h15" → HH:MM. */
function lerHora(s) {
  const m = /^(\d{1,2})\s*(?:h|:)\s*(\d{2})?\s*(?:h|min)?$/i.exec(String(s || "").trim());
  return m ? `${String(m[1]).padStart(2, "0")}:${m[2] || "00"}` : "";
}

/* dados: { nome, telefone, itens, data, hora, modo, endereco, bairro, obs } — tudo texto. */
async function pedidoDaSofia(db, dados, { agora = new Date(), frete = null } = {}) {
  const hoje = new Date(agora.getTime() - 3 * 3600e3).toISOString().slice(0, 10);
  const nome = texto(dados?.nome, 80);
  const telefone = String(dados?.telefone || "").replace(/\D/g, "");
  if (!nome) throw new ErroDominio("invalid-argument", "Falta o nome do cliente");
  if (telefone.length < 10) throw new ErroDominio("invalid-argument", "Falta o telefone do cliente");

  const data = lerData(dados?.data, hoje);
  if (!data) throw new ErroDominio("invalid-argument", "Data inválida: use DD/MM/AAAA");
  const hora = lerHora(dados?.hora);
  if (!hora) throw new ErroDominio("invalid-argument", "Horário inválido: use HH:MM, entre 8h e 19h");

  const modoTxt = normalizar(dados?.modo);
  const modo = /entreg/.test(modoTxt) ? "entrega" : /retir|busca|loja/.test(modoTxt) ? "retirada" : "";
  if (!modo) throw new ErroDominio("invalid-argument", "Diga se é entrega ou retirada na loja");
  const endereco = opcional(dados?.endereco, 300);
  const bairro = opcional(dados?.bairro, 80);
  if (modo === "entrega" && !endereco) throw new ErroDominio("invalid-argument", "Para entrega, falta o endereço");

  const lidos = lerItens(dados?.itens);
  if (!lidos.length) throw new ErroDominio("invalid-argument", "O pedido precisa de pelo menos um item");
  // O catálogo publicado (1 leitura); sem ele, produto a produto.
  const cat = await db.doc(CATALOGO_SITE).get();
  const lista = cat.exists && (cat.get("produtos") || []).length ? cat.get("produtos") : await db.collection(PRODUTOS).listar();
  const produtos = lista
    .filter(p => p.ativo !== false && p.nome && p.valorUnit > 0)
    .map(p => ({ ...p, _n: normalizar(p.nome) }));
  const problemas = [];
  let sug = null; // sugestões só são lidas se algum item for "à escolha da casa"
  const itens = [];
  for (const it of lidos) {
    if (it.erro) { problemas.push(it.erro); continue; }
    const cats = escolhaDaCasa(it.nome);
    if (cats) {
      sug = sug || await sugestoes(db, telefone, { agora });
      const r = dividirEscolha(it.qtd, cats, sug.itens, produtos);
      if (r.erro) problemas.push(r.erro); else itens.push(...r.itens);
      continue;
    }
    itens.push(itemDoCardapio(it, produtos, problemas));
  }
  if (problemas.length) throw new ErroDominio("invalid-argument", `Itens com problema: ${problemas.join("; ")}`);
  const escolhidos = sug ? `Sabores escolhidos pela loja (${sug.base}).` : "";

  return pedidoDoSite(db, {
    cliente: { nome, telefone },
    entrega: {
      modo, data, hora,
      ...(modo === "entrega" ? { endereco: [endereco, bairro].filter(Boolean).join(" — "), local: { rua: endereco, bairro } } : {})
    },
    itens: itens.filter(Boolean),
    obs: [opcional(dados?.obs, 1000), escolhidos].filter(Boolean).join(" ")
  }, { agora, frete, origem: "whatsapp" });
}

function itemDoCardapio(it, produtos, problemas) {
  const achado = acharProduto(it.nome, produtos);
  if (achado.erro) { problemas.push(achado.erro + (achado.parecidos?.length ? ` (parecidos: ${achado.parecidos.join(", ")})` : "")); return null; }
  return {
    produtoId: achado.produto.id, qtd: it.qtd,
    ...(it.recheios.length ? { recheios: it.recheios } : {}),
    ...(it.tema ? { topo: { tema: it.tema } } : {})
  };
}

/* "salgado assado à escolha da casa", "1 cento de salgado variado", "doces mais pedidos": devolve as
   categorias do cardápio a usar, ou null se o item tem sabor dito. */
const CATEGORIAS = [
  [/assad/, ["Assado"]], [/frit/, ["Salgado Frito"]], [/especia/, ["Salgado Especial"]],
  [/gourmet|goumert/, ["Doce Goumert", "Doce Gourmet"]], [/salgad/, ["Salgado Frito", "Assado", "Salgado Especial"]],
  [/doc|brigadeir/, ["Doce"]]
];
function escolhaDaCasa(nome) {
  const n = normalizar(nome);
  // Palavras inteiras: "casadinho" é sabor, não "escolha da casa".
  if (!/\b(escolha|casa|variado|sortido|mais pedido|sugestao|qualquer|misto|mix)\b/.test(n)) return null;
  const achada = CATEGORIAS.find(([re]) => re.test(n));
  return achada ? achada[1] : ["Salgado Frito", "Assado", "Salgado Especial"];
}

/* Divide a quantidade entre os sabores sugeridos daquelas categorias: até 4 sabores, cada um com
   pelo menos o mínimo do produto; o que sobra vai para o primeiro (o mais pedido). */
function dividirEscolha(qtd, cats, sugeridos, produtos) {
  const porId = new Map(produtos.map(p => [p.id, p]));
  let opcoes = sugeridos.map(s => porId.get(s.id)).filter(p => p && cats.includes(p.categoria));
  if (!opcoes.length) opcoes = produtos.filter(p => cats.includes(p.categoria));
  if (!opcoes.length) return { erro: "não há produtos dessa categoria no cardápio" };
  const minimo = Math.max(...opcoes.slice(0, 4).map(p => p.qtdMin || 1));
  const n = Math.max(1, Math.min(4, opcoes.length, Math.floor(qtd / minimo)));
  if (qtd < (opcoes[0].qtdMin || 1)) return { erro: `o mínimo de ${opcoes[0].nome} é ${opcoes[0].qtdMin}` };
  const base = Math.floor(qtd / n / minimo) * minimo || Math.floor(qtd / n);
  const itens = opcoes.slice(0, n).map(p => ({ produtoId: p.id, qtd: base }));
  itens[0].qtd += qtd - base * n;
  return { itens };
}

export { pedidoDaSofia, acharProduto, lerItens, lerData, lerHora, normalizar };

/* Telefone em todas as formas que podem estar gravadas: com/sem 55 e com/sem o 9 extra. */
function variantesTelefone(tel) {
  let d = String(tel || "").replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  if (d.length < 10) return [];
  const ddd = d.slice(0, 2), resto = d.slice(2);
  const com9 = resto.length === 8 ? `9${resto}` : resto, sem9 = resto.length === 9 ? resto.slice(1) : resto;
  return [...new Set([`${ddd}${com9}`, `${ddd}${sem9}`, `55${ddd}${com9}`, `55${ddd}${sem9}`])];
}

/* Os pedidos de quem está falando com a Sofia (o telefone vem do GPTMaker, não do que o cliente
   digita): os 8 mais recentes, com o que já foi pago e o que falta. */
async function pedidosDoCliente(db, telefone) {
  const variantes = variantesTelefone(telefone);
  if (!variantes.length) throw new ErroDominio("invalid-argument", "Telefone do cliente inválido");
  const listas = await Promise.all(variantes.map(v => db.collection(PEDIDOS).consultar([["cliente.telefone", "==", v]])));
  const vistos = new Map();
  for (const p of listas.flat()) vistos.set(p.id, p);
  const pedidos = [...vistos.values()]
    .sort((a, b) => String(b.entrega?.data || "").localeCompare(String(a.entrega?.data || "")))
    .slice(0, 8)
    .map(p => ({
      pedido: p.id, status: p.status, pagamento: p.pagamento,
      entrega: `${p.entrega?.modo === "entrega" ? "entrega" : "retirada"} em ${p.entrega?.data || "?"}${p.entrega?.hora ? ` às ${p.entrega.hora}` : ""}`,
      itens: (p.itens || []).map(it => `${it.qtd} ${it.nome}`).join(", "),
      total: reais(p.total), pago: reais(p.pago || 0), falta: reais(Math.max(0, (p.total || 0) - (p.pago || 0)))
    }));
  return { pedidos, ...(pedidos.length ? {} : { aviso: "Nenhum pedido com esse telefone" }) };
}

const reais = c => `R$ ${(Number(c || 0) / 100).toFixed(2).replace(".", ",")}`;

/* Só gera link de pedido que é desse telefone, já confirmado pela equipe e com valor em aberto. */
async function conferirParaPagar(db, { telefone, pedido }) {
  const n = String(pedido || "").toUpperCase().replace(/[^\d]/g, "");
  const snap = n ? await db.collection(PEDIDOS).doc(`PED-${Number(n)}`).get() : null;
  const tel = String(snap?.get?.("cliente")?.telefone || "");
  if (!snap?.exists || !variantesTelefone(telefone).includes(tel.replace(/\D/g, "")) && !variantesTelefone(tel).includes(String(telefone).replace(/\D/g, ""))) {
    throw new ErroDominio("not-found", "Não achei esse pedido no telefone deste cliente");
  }
  const p = snap.data();
  if (["Aguardando confirmação", "Verificando Estoque"].includes(p.status)) throw new ErroDominio("failed-precondition", "O pedido ainda não foi confirmado pela equipe; o link vem na confirmação");
  if (p.status === "Cancelado") throw new ErroDominio("failed-precondition", "Esse pedido foi cancelado");
  if ((p.total || 0) - (p.pago || 0) <= 0) throw new ErroDominio("failed-precondition", "Esse pedido já está pago");
  return snap.id;
}

export { pedidosDoCliente, conferirParaPagar, variantesTelefone, reais };

/* Para quem pede "1 cento de salgado" sem dizer quais: o que essa pessoa costuma pedir (soma dos
   pedidos dela, só itens que ainda estão no cardápio) e, sem histórico, os mais pedidos dos últimos
   7 dias. A Sofia sugere a partir disso e confirma com o cliente antes de fazer o pedido. */
async function sugestoes(db, telefone, { agora = new Date() } = {}) {
  const cat = await db.doc(CATALOGO_SITE).get();
  const lista = cat.exists && (cat.get("produtos") || []).length ? cat.get("produtos") : await db.collection(PRODUTOS).listar();
  const produtos = lista.filter(p => p.ativo !== false && p.nome && p.valorUnit > 0).map(p => ({ ...p, _n: normalizar(p.nome) }));
  const doCardapio = it => produtos.find(p => p.id === it.produtoId) || produtos.find(p => p._n === normalizar(it.nome));

  // Soma por produto do cardápio: [{ produto, categoria, quantidade, pedidos }]
  const somar = pedidos => {
    const soma = new Map();
    for (const p of pedidos) {
      if (p.status === "Cancelado") continue;
      for (const it of p.itens || []) {
        const prod = doCardapio(it);
        if (!prod) continue;
        const s = soma.get(prod.id) || { id: prod.id, produto: prod.nome.replace(/^[^\p{L}\p{N}]+/u, "").trim(), categoria: prod.categoria || "", quantidade: 0, pedidos: 0 };
        s.quantidade += Number(it.qtd) || 0;
        s.pedidos += 1;
        soma.set(prod.id, s);
      }
    }
    return [...soma.values()].sort((a, b) => b.pedidos - a.pedidos || b.quantidade - a.quantidade);
  };

  const variantes = variantesTelefone(telefone);
  const listas = variantes.length ? await Promise.all(variantes.map(v => db.collection(PEDIDOS).consultar([["cliente.telefone", "==", v]]))) : [];
  const meus = [...new Map(listas.flat().map(p => [p.id, p])).values()];
  const doCliente = somar(meus).slice(0, 12);
  if (doCliente.length) return { base: "pedidos anteriores do cliente", itens: doCliente };

  const dia = ms => new Date(ms - 3 * 3600e3).toISOString().slice(0, 10);
  const semana = await db.collection(PEDIDOS).consultar([["entrega.data", ">=", dia(agora.getTime() - 7 * 864e5)], ["entrega.data", "<=", dia(agora.getTime())]]);
  return { base: "mais pedidos da semana", itens: somar(semana).slice(0, 12) };
}

export { sugestoes };

/* Cancelamento pedido pelo próprio cliente: qualquer pedido dele que ainda não entrou em produção,
   sem prazo (decisão da loja, 09/10). Se já tinha algo pago, a equipe é avisada para devolver. */
const CANCELAVEIS = ["Aguardando confirmação", "Verificando Estoque", "Confirmado — Esperando pagamento"];
async function conferirParaCancelar(db, { telefone, pedido }) {
  const n = String(pedido || "").toUpperCase().replace(/[^\d]/g, "");
  const snap = n ? await db.collection(PEDIDOS).doc(`PED-${Number(n)}`).get() : null;
  const tel = String(snap?.get?.("cliente")?.telefone || "").replace(/\D/g, "");
  if (!snap?.exists || !variantesTelefone(telefone).includes(tel) && !variantesTelefone(tel).includes(String(telefone).replace(/\D/g, ""))) {
    throw new ErroDominio("not-found", "Não achei esse pedido no telefone deste cliente");
  }
  const status = snap.get("status");
  if (status === "Cancelado") throw new ErroDominio("failed-precondition", "Esse pedido já está cancelado");
  if (!CANCELAVEIS.includes(status)) throw new ErroDominio("failed-precondition", `O pedido já está "${status}" e não dá mais para cancelar por aqui; passe para a equipe`);
  return { pedidoId: snap.id, pago: snap.get("pago") || 0 };
}

export { conferirParaCancelar, CANCELAVEIS, opcional };
