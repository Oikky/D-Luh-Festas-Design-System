/* Ferramentas da assistente para o resto da loja: financeiro (caixa, boletos, cartões) e catálogo
   (produtos e recheios). Mesma regra de ferramentas.js: consulta só lê; mudança vira PROPOSTA,
   validada aqui com as mesmas regras da gravação, e só roda quando a pessoa confirma. */
import { FINANCEIRO, validarFinanceiro, parcelasDaCompra, totalDaFatura, vencDaFatura, faturaDaData, comprasDoCartao } from "../financeiro.js";
import { PRODUTOS, RECHEIOS, validarProduto } from "../produtos.js";
import { PAGAMENTOS } from "../pedidos.js";
import { ErroDominio } from "../dominio.js";
import { brl, dataBR } from "../efeitos.js";

const dataOk = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));
const cent = v => Math.round(Number(v) * 100);
const dataLonga = d => d ? `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}` : "—";
const exigirPeriodo = (de, ate) => { if (!dataOk(de) || !dataOk(ate)) throw new ErroDominio("invalid-argument", "de/ate no formato AAAA-MM-DD"); };
const hojeSP = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);

async function lerLancamento(db, id) {
  const snap = await db.collection(FINANCEIRO).doc(String(id || "")).get();
  if (!snap.exists) throw new ErroDominio("not-found", `Lançamento ${id} não existe`);
  return { id: snap.id, ...snap.data() };
}

const mesBR = m => `${m.slice(5, 7)}/${m.slice(0, 4)}`;
/* As faturas de um cartão que têm algo: total, vencimento e se já foi paga (financeiro.js). */
function faturasDoCartao(cartao, compras) {
  const meses = new Set([...compras.flatMap(c => parcelasDaCompra(c, cartao.fecha).map(p => p.fatura)), ...Object.keys(cartao.faturas || {})]);
  return [...meses].sort().map(mes => {
    const paga = (cartao.faturas || {})[mes];
    return { mes, valor: paga ? paga.valor : totalDaFatura(compras, cartao, mes), venc: vencDaFatura(mes, cartao), paga };
  });
}

/* Boleto antigo (sem parcelas) visto como um pai de uma parcela só, como em financeiro.js. */
const parcelasDe = b => Array.isArray(b.parcelas) ? b.parcelas
  : [{ n: 1, venc: b.venc || "", valor: b.valor || 0, codigo: b.codigo || "", pago: !!b.pago, pagoEm: b.pagoEm || null }];

function linhaLancamento(x) {
  if (x.tipo === "transacao") return `${x.id} · ${dataBR(x.data)} · ${x.entrada ? "entrada" : "saída"} · ${x.desc} · ${brl(x.valor)} · ${x.meio}`;
  if (x.tipo === "cartao") return `${x.id} · cartão ${x.nome} final ${x.final} (${x.bandeira}) · limite ${brl(x.limite)} · fecha dia ${x.fecha ?? "—"} · vence dia ${x.venc ?? "—"}${x.fatura ? ` · ${brl(x.fatura)} lançado à parte na fatura aberta` : ""}`;
  if (x.tipo === "compra") return `${x.id} · compra no cartão ${x.cartaoId} · ${dataBR(x.data)} · ${x.desc} · ${brl(x.valor)}${x.parcelas > 1 ? ` em ${x.parcelas}x` : ""}`;
  const ps = parcelasDe(x), abertas = ps.filter(p => !p.pago);
  return `${x.id} · boleto ${x.desc}${x.cnpjAntigo ? " (CNPJ antigo)" : ""} · ${brl(x.valor)} em ${ps.length}x · `
    + (abertas.length ? `${abertas.length} em aberto, próxima ${dataBR(abertas[0].venc)} ${brl(abertas[0].valor)}` : "tudo pago");
}

// ── Definições ──
const DATA = { type: "string", description: "AAAA-MM-DD" };
const DEFINICOES_LOJA = [
  {
    name: "buscar_financeiro",
    description: "Lançamentos do financeiro da loja: transações avulsas do caixa (entradas e saídas), boletos a pagar (com parcelas) e cartões da loja. Boletos filtram pelo vencimento das parcelas, transações pela data. Devolve o id de cada um.",
    input_schema: {
      type: "object",
      properties: {
        tipo: { type: "string", enum: ["transacao", "boleto", "cartao", "compra"], description: "compra = gasto feito num cartão da loja" },
        de: DATA, ate: DATA,
        situacao: { type: "string", enum: ["aberto", "pago", "vencido"], description: "Só boletos: parcela em aberto, paga, ou vencida e não paga" },
        busca: { type: "string", description: "Parte do fornecedor, descrição ou nome do cartão" }
      }
    }
  },
  {
    name: "ver_lancamento",
    description: "Todos os detalhes de um lançamento do financeiro (boleto com cada parcela, transação, compra no cartão, ou cartão com as faturas: total, vencimento, paga ou não, e o limite usado).",
    input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] }
  },
  {
    name: "resumo_caixa",
    description: "Dinheiro que entrou e saiu num período (pela data em que aconteceu): pagamentos de pedidos por meio, entradas e saídas avulsas, parcelas de boleto pagas, faturas de cartão pagas, e boletos que vencem no período sem pagar.",
    input_schema: { type: "object", properties: { de: DATA, ate: DATA }, required: ["de", "ate"] }
  },
  {
    name: "buscar_pagamentos",
    description: "Pagamentos recebidos de pedidos (InfinitePay, Pix, dinheiro, cartão) pela data em que entraram, ou todos de um pedido. Devolve o id de cada pagamento (usado para apagar um lançado errado).",
    input_schema: { type: "object", properties: { de: DATA, ate: DATA, pedido_id: { type: "string" } } }
  },
  {
    name: "propor_transacao",
    description: "Lança (ou, com id, corrige) uma entrada ou saída avulsa no caixa da loja — ex.: compra no mercado paga em Pix ou dinheiro, gás. Compra feita no cartão da loja NÃO é transação: use propor_compra_cartao; pagar a fatura é propor_pagar_fatura. Com id, mande só o que muda.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        descricao: { type: "string" },
        entrada: { type: "boolean", description: "true = dinheiro entrando; false = saída (padrão)" },
        meio: { type: "string", enum: ["Pix", "Cartão", "Dinheiro", "Boleto", "Transferência"] },
        data: DATA,
        valor_reais: { type: "number", exclusiveMinimum: 0 }
      }
    }
  },
  {
    name: "propor_boleto",
    description: "Cadastra (ou, com id, corrige) um boleto a pagar: fornecedor e as parcelas (vencimento, valor, código de barras). Com id, mande só o que muda; se mandar parcelas, a lista inteira é trocada, mantendo pagas as que já estavam pagas pela posição.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        fornecedor: { type: "string" },
        parcelas: {
          type: "array",
          items: { type: "object", properties: { venc: DATA, valor_reais: { type: "number", exclusiveMinimum: 0 }, codigo: { type: "string" } }, required: ["venc", "valor_reais"] }
        },
        periodo: { type: "string", enum: ["semanal", "quinzenal", "mensal"] },
        cnpj_antigo: { type: "boolean" }
      }
    }
  },
  {
    name: "propor_pagar_boleto",
    description: "Marca uma parcela de boleto como paga (vira saída do caixa na data) ou desfaz.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" }, parcela: { type: "integer", minimum: 1, description: "Número da parcela; padrão 1" },
        data: { ...DATA, description: "Dia do pagamento (AAAA-MM-DD); padrão hoje" },
        desfazer: { type: "boolean" }
      },
      required: ["id"]
    }
  },
  {
    name: "propor_cartao",
    description: "Cadastra (ou, com id, atualiza) um cartão da loja: nome, 4 últimos números, bandeira, limite, dia de fechamento, dia de vencimento e o que já está na fatura aberta sem ter sido lançado compra por compra (fatura_reais). Com id, mande só o que muda.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" }, nome: { type: "string" }, final: { type: "string" },
        bandeira: { type: "string", enum: ["Visa", "Mastercard", "Elo", "Outra"] },
        limite_reais: { type: "number", minimum: 0 }, fatura_reais: { type: "number", minimum: 0 },
        dia_fechamento: { type: "integer", minimum: 1, maximum: 31 },
        dia_vencimento: { type: "integer", minimum: 1, maximum: 31 }
      }
    }
  },
  {
    name: "propor_compra_cartao",
    description: "Lança (ou, com id, corrige) um gasto feito num cartão da loja. Entra na fatura pelo dia de fechamento; parcelada, cada parcela cai numa fatura seguinte. Não sai do caixa agora: sai quando a fatura for paga. Com id, mande só o que muda.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" }, cartao_id: { type: "string", description: "id do cartão (buscar_financeiro tipo cartao)" },
        descricao: { type: "string" }, data: DATA,
        valor_reais: { type: "number", exclusiveMinimum: 0, description: "Valor total da compra" },
        parcelas: { type: "integer", minimum: 1, maximum: 24 }
      }
    }
  },
  {
    name: "propor_pagar_fatura",
    description: "Marca a fatura de um cartão da loja como paga (vira uma saída do caixa no dia, com o total da fatura) ou desfaz. A fatura é o mês em que fecha (AAAA-MM); ver_lancamento do cartão lista as faturas.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "id do cartão" }, mes: { type: "string", description: "AAAA-MM do fechamento" },
        data: { ...DATA, description: "Dia do pagamento; padrão hoje" },
        meio: { type: "string", enum: ["Pix", "Boleto", "Transferência", "Dinheiro"] },
        desfazer: { type: "boolean" }
      },
      required: ["id", "mes"]
    }
  },
  {
    name: "propor_apagar_lancamento",
    description: "Apaga de vez um lançamento do financeiro (transação, boleto inteiro, compra no cartão ou cartão sem compras).",
    input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] }
  },
  {
    name: "propor_produto",
    description: "Cadastra (ou, com id, altera) um produto do catálogo: nome, categoria, preço, quantidade mínima, ingredientes, ativo, destaque, tipos de pacote. Com id, mande só o que muda. Para tirar do site sem apagar, use ativo=false.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" }, nome: { type: "string" }, categoria: { type: "string" },
        preco_reais: { type: "number", exclusiveMinimum: 0 }, qtd_minima: { type: "integer", minimum: 1 },
        ingredientes: { type: "string" }, ativo: { type: "boolean" }, destaque: { type: "boolean" },
        pacotes: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    name: "propor_apagar_produto",
    description: "Apaga de vez um produto do catálogo. Prefira desativar (propor_produto com ativo=false).",
    input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] }
  },
  {
    name: "propor_recheios",
    description: "Acrescenta e/ou tira recheios da lista do catálogo.",
    input_schema: {
      type: "object",
      properties: { adicionar: { type: "array", items: { type: "string" } }, remover: { type: "array", items: { type: "string" } } }
    }
  }
];

// ── Execução ──
const EXECUTAR_LOJA = {
  async buscar_financeiro({ db }, { tipo, de, ate, situacao, busca }) {
    if ((de || ate) && !(dataOk(de) && dataOk(ate))) throw new ErroDominio("invalid-argument", "de e ate juntos, no formato AAAA-MM-DD");
    const hoje = hojeSP();
    let lista = await db.collection(FINANCEIRO).listar();
    if (tipo) lista = lista.filter(x => x.tipo === tipo);
    if (busca) { const q = String(busca).toLowerCase(); lista = lista.filter(x => String(x.desc || x.nome || "").toLowerCase().includes(q)); }
    const parcelaServe = p => (!de || (p.venc >= de && p.venc <= ate))
      && (!situacao || (situacao === "pago" ? p.pago : situacao === "aberto" ? !p.pago : !p.pago && p.venc < hoje));
    lista = lista.filter(x => {
      if (x.tipo === "boleto") return (!de && !situacao) || parcelasDe(x).some(parcelaServe);
      if (situacao) return false;
      if (x.tipo === "transacao") return !de || (x.data >= de && x.data <= ate);
      return true;
    });
    lista.sort((a, b) => String(a.venc || a.data || a.nome).localeCompare(String(b.venc || b.data || b.nome)));
    const linhas = lista.map(x => {
      const l = linhaLancamento(x);
      if (x.tipo !== "boleto" || (!de && !situacao)) return l;
      return `${l} · parcelas no filtro: ${parcelasDe(x).filter(parcelaServe).map(p => `${p.n}ª ${dataBR(p.venc)} ${brl(p.valor)}${p.pago ? " paga" : ""}`).join(", ")}`;
    });
    const somaAberta = lista.filter(x => x.tipo === "boleto").flatMap(x => parcelasDe(x).filter(p => parcelaServe(p) && !p.pago)).reduce((s, p) => s + p.valor, 0);
    return {
      quantidade: lista.length, ...(somaAberta ? { boletos_em_aberto_no_filtro: brl(somaAberta) } : {}),
      lancamentos: linhas.slice(0, 80), ...(linhas.length > 80 ? { aviso: "Mostrando só os 80 primeiros" } : {})
    };
  },

  async ver_lancamento({ db }, { id }) {
    const x = await lerLancamento(db, id);
    const { criadoEm, atualizadoEm, ...resto } = x;
    if (x.tipo === "boleto") resto.parcelas = parcelasDe(x).map(p => ({ ...p, valor: brl(p.valor) }));
    if (x.tipo === "cartao") {
      const compras = await comprasDoCartao(db, x.id);
      const faturas = faturasDoCartao(x, compras);
      const usado = faturas.filter(f => !f.paga).reduce((s, f) => s + f.valor, 0) + (x.fatura || 0);
      delete resto.faturas;
      resto.fatura_aberta_agora = mesBR(faturaDaData(hojeSP(), x.fecha));
      resto.faturas = faturas.map(f => `${mesBR(f.mes)} · ${brl(f.valor)} · vence ${dataBR(f.venc)} · ${f.paga ? `paga em ${dataBR(f.paga.pagoEm)}` : "em aberto"}`);
      resto.limite_usado = brl(usado);
      resto.limite_livre = brl((x.limite || 0) - usado);
      resto.compras = compras.sort((a, b) => b.data.localeCompare(a.data)).slice(0, 40).map(linhaLancamento);
    }
    if (x.tipo === "compra") resto.parcelas_nas_faturas = parcelasDaCompra(x, (await lerLancamento(db, x.cartaoId).catch(() => ({}))).fecha)
      .map(p => `${p.n}/${p.de} na fatura ${mesBR(p.fatura)} · ${brl(p.valor)}`);
    for (const k of ["valor", "limite", "fatura"]) if (typeof resto[k] === "number") resto[k] = brl(resto[k]);
    return resto;
  },

  async resumo_caixa({ db }, { de, ate }) {
    exigirPeriodo(de, ate);
    const ini = new Date(`${de}T03:00:00Z`), fim = new Date(Date.parse(`${ate}T03:00:00Z`) + 86400e3);
    const [pags, fin] = await Promise.all([
      db.collection(PAGAMENTOS).consultar([["em", ">=", ini], ["em", "<", fim]]),
      db.collection(FINANCEIRO).listar()
    ]);
    const porMeio = {};
    for (const p of pags) porMeio[p.meio || "outro"] = (porMeio[p.meio || "outro"] || 0) + p.valor;
    const trans = fin.filter(x => x.tipo === "transacao" && x.data >= de && x.data <= ate);
    const parcelas = fin.filter(x => x.tipo === "boleto").flatMap(b => parcelasDe(b).map(p => ({ ...p, desc: b.desc })));
    const pagas = parcelas.filter(p => p.pago && p.pagoEm >= de && p.pagoEm <= ate);
    const faturasPagas = fin.filter(x => x.tipo === "cartao").flatMap(c => Object.entries(c.faturas || {})
      .filter(([, f]) => f.pagoEm >= de && f.pagoEm <= ate).map(([mes, f]) => ({ ...f, desc: `${c.nome} final ${c.final} · fatura ${mesBR(mes)}` })));
    const aVencer = parcelas.filter(p => !p.pago && p.venc >= de && p.venc <= ate);
    const soma = l => l.reduce((s, x) => s + x.valor, 0);
    const entPed = soma(pags), entAv = soma(trans.filter(t => t.entrada)), saiAv = soma(trans.filter(t => !t.entrada)), saiBol = soma(pagas), saiCar = soma(faturasPagas);
    return {
      periodo: `${dataBR(de)} a ${dataBR(ate)}`,
      entrou_de_pedidos: brl(entPed), pedidos_por_meio: Object.fromEntries(Object.entries(porMeio).map(([m, v]) => [m, brl(v)])),
      entradas_avulsas: brl(entAv), saidas_avulsas: brl(saiAv), boletos_pagos: brl(saiBol), faturas_de_cartao_pagas: brl(saiCar),
      saldo: brl(entPed + entAv - saiAv - saiBol - saiCar),
      faturas_pagas_lista: faturasPagas.map(f => `${f.desc} ${brl(f.valor)} em ${dataBR(f.pagoEm)}`),
      transacoes: trans.map(linhaLancamento).slice(0, 40),
      boletos_pagos_lista: pagas.map(p => `${p.desc} ${p.n}ª ${brl(p.valor)} em ${dataBR(p.pagoEm)}`).slice(0, 40),
      boletos_a_vencer_sem_pagar: { total: brl(soma(aVencer)), lista: aVencer.sort((a, b) => a.venc.localeCompare(b.venc)).map(p => `${dataBR(p.venc)} ${p.desc} ${p.n}ª ${brl(p.valor)}`).slice(0, 40) }
    };
  },

  async buscar_pagamentos({ db }, { de, ate, pedido_id }) {
    let lista;
    if (pedido_id) {
      const s = String(pedido_id).trim().toUpperCase();
      lista = await db.collection(PAGAMENTOS).consultar([["pedidoId", "==", /^\d+$/.test(s) ? `PED-${s}` : s]]);
    } else {
      exigirPeriodo(de, ate);
      lista = await db.collection(PAGAMENTOS).consultar([["em", ">=", new Date(`${de}T03:00:00Z`)], ["em", "<", new Date(Date.parse(`${ate}T03:00:00Z`) + 86400e3)]]);
    }
    lista.sort((a, b) => new Date(a.em) - new Date(b.em));
    const quando = e => new Date(new Date(e).getTime() - 3 * 3600e3).toISOString().slice(0, 16).replace("T", " ");
    return {
      quantidade: lista.length, total: brl(lista.reduce((s, p) => s + p.valor, 0)),
      pagamentos: lista.slice(0, 80).map(p => `${p.id} · ${quando(p.em)} · ${p.pedidoId} · ${brl(p.valor)} · ${p.meio || "—"} · por ${p.por}`)
    };
  },

  async propor_transacao({ db, propor }, e) {
    const antes = e.id ? await lerLancamento(db, e.id) : null;
    if (antes && antes.tipo !== "transacao") throw new ErroDominio("invalid-argument", `${e.id} não é uma transação`);
    const dados = {
      desc: e.descricao ?? antes?.desc, entrada: e.entrada ?? antes?.entrada ?? false,
      meio: e.meio ?? antes?.meio ?? "Pix", data: e.data ?? antes?.data ?? hojeSP(),
      valor: e.valor_reais != null ? cent(e.valor_reais) : antes?.valor
    };
    const v = validarFinanceiro("transacao", dados);
    const resumo = [
      `*${antes ? "Corrigir lançamento" : v.entrada ? "Entrada no caixa" : "Saída do caixa"} — confirma?*`,
      `${v.desc} · ${brl(v.valor)} · ${v.meio} · ${dataLonga(v.data)}`,
      ...(antes ? [`Antes: ${linhaLancamento(antes)}`] : [])
    ].join("\n");
    return propor("salvarFinanceiro", { ...(antes ? { id: antes.id } : { tipo: "transacao" }), ...v }, resumo);
  },

  async propor_boleto({ db, propor }, e) {
    const antes = e.id ? await lerLancamento(db, e.id) : null;
    if (antes && antes.tipo !== "boleto") throw new ErroDominio("invalid-argument", `${e.id} não é um boleto`);
    const velhas = antes ? parcelasDe(antes) : [];
    const parcelas = e.parcelas
      ? e.parcelas.map((p, i) => ({ venc: p.venc, valor: cent(p.valor_reais), codigo: p.codigo ?? velhas[i]?.codigo ?? "", arquivos: velhas[i]?.arquivos || [] }))
      : velhas.map(({ venc, valor, codigo, arquivos }) => ({ venc, valor, codigo, arquivos: arquivos || [] }));
    const dados = {
      desc: e.fornecedor ?? antes?.desc, periodo: e.periodo ?? antes?.periodo,
      cnpjAntigo: e.cnpj_antigo ?? antes?.cnpjAntigo ?? false, arquivos: antes?.arquivos || [], parcelas
    };
    const v = validarFinanceiro("boleto", dados);
    const total = v.parcelas.reduce((s, p) => s + p.valor, 0);
    const resumo = [
      `*${antes ? "Corrigir boleto" : "Novo boleto"} — confirma?*`,
      `${v.desc}${v.cnpjAntigo ? " (CNPJ antigo)" : ""} · ${brl(total)} em ${v.parcelas.length}x`,
      ...v.parcelas.map(p => `${p.n}ª ${dataLonga(p.venc)} — ${brl(p.valor)}${p.codigo ? ` · ${p.codigo}` : ""}${velhas[p.n - 1]?.pago ? " (já paga)" : ""}`)
    ].join("\n");
    return propor("salvarFinanceiro", { ...(antes ? { id: antes.id } : { tipo: "boleto" }), ...v }, resumo);
  },

  async propor_pagar_boleto({ db, propor }, { id, parcela = 1, data, desfazer }) {
    const b = await lerLancamento(db, id);
    if (b.tipo !== "boleto") throw new ErroDominio("invalid-argument", `${id} não é um boleto`);
    const p = parcelasDe(b).find(x => x.n === Number(parcela));
    if (!p) throw new ErroDominio("not-found", `O boleto não tem a parcela ${parcela}`);
    if (data && !dataOk(data)) throw new ErroDominio("invalid-argument", "Data no formato AAAA-MM-DD");
    if (!desfazer && p.pago) throw new ErroDominio("failed-precondition", `A ${p.n}ª parcela já está paga (${dataBR(p.pagoEm)})`);
    if (desfazer && !p.pago) throw new ErroDominio("failed-precondition", `A ${p.n}ª parcela não está paga`);
    const dia = data || hojeSP();
    const resumo = desfazer
      ? `*Desfazer pagamento — confirma?*\n${b.desc} · ${p.n}ª parcela ${brl(p.valor)} volta a ficar em aberto`
      : `*Pagar boleto — confirma?*\n${b.desc} · ${p.n}ª parcela (vence ${dataLonga(p.venc)}) · ${brl(p.valor)}\nPago em ${dataLonga(dia)}`;
    return propor("pagarBoleto", { id: b.id, n: p.n, pago: !desfazer, ...(desfazer ? {} : { data: dia }) }, resumo);
  },

  async propor_cartao({ db, propor }, e) {
    const antes = e.id ? await lerLancamento(db, e.id) : null;
    if (antes && antes.tipo !== "cartao") throw new ErroDominio("invalid-argument", `${e.id} não é um cartão`);
    const dados = {
      nome: e.nome ?? antes?.nome, final: e.final ?? antes?.final, bandeira: e.bandeira ?? antes?.bandeira,
      limite: e.limite_reais != null ? cent(e.limite_reais) : antes?.limite ?? 0,
      fatura: e.fatura_reais != null ? cent(e.fatura_reais) : antes?.fatura ?? 0,
      venc: e.dia_vencimento ?? antes?.venc ?? null,
      fecha: e.dia_fechamento ?? antes?.fecha ?? null
    };
    const v = validarFinanceiro("cartao", dados);
    const resumo = [
      `*${antes ? "Atualizar cartão" : "Novo cartão"} — confirma?*`,
      `${v.nome} final ${v.final} (${v.bandeira}) · limite ${brl(v.limite)} · fecha dia ${v.fecha ?? "—"} · vence dia ${v.venc ?? "—"}${v.fatura ? ` · ${brl(v.fatura)} à parte na fatura` : ""}`,
      ...(antes ? [`Antes: limite ${brl(antes.limite)} · fecha dia ${antes.fecha ?? "—"} · vence dia ${antes.venc ?? "—"} · ${brl(antes.fatura)} à parte`] : [])
    ].join("\n");
    return propor("salvarFinanceiro", { ...(antes ? { id: antes.id } : { tipo: "cartao" }), ...v }, resumo);
  },

  async propor_compra_cartao({ db, propor }, e) {
    const antes = e.id ? await lerLancamento(db, e.id) : null;
    if (antes && antes.tipo !== "compra") throw new ErroDominio("invalid-argument", `${e.id} não é uma compra no cartão`);
    const dados = {
      cartaoId: e.cartao_id ?? antes?.cartaoId, desc: e.descricao ?? antes?.desc, data: e.data ?? antes?.data ?? hojeSP(),
      valor: e.valor_reais != null ? cent(e.valor_reais) : antes?.valor, parcelas: e.parcelas ?? antes?.parcelas ?? 1
    };
    const v = validarFinanceiro("compra", dados);
    const cartao = await lerLancamento(db, v.cartaoId);
    if (cartao.tipo !== "cartao") throw new ErroDominio("invalid-argument", `${v.cartaoId} não é um cartão`);
    const ps = parcelasDaCompra(v, cartao.fecha);
    const resumo = [
      `*${antes ? "Corrigir compra no cartão" : "Compra no cartão"} — confirma?*`,
      `${v.desc} · ${brl(v.valor)}${v.parcelas > 1 ? ` em ${v.parcelas}x de ${brl(ps[ps.length - 1].valor)}` : ""} · ${dataLonga(v.data)}`,
      `${cartao.nome} final ${cartao.final} · ${v.parcelas > 1 ? `faturas ${mesBR(ps[0].fatura)} a ${mesBR(ps[ps.length - 1].fatura)}` : `fatura ${mesBR(ps[0].fatura)}`}`
    ].join("\n");
    return propor("salvarFinanceiro", { ...(antes ? { id: antes.id } : { tipo: "compra" }), ...v }, resumo);
  },

  async propor_pagar_fatura({ db, propor }, { id, mes, data, meio, desfazer }) {
    const cartao = await lerLancamento(db, id);
    if (cartao.tipo !== "cartao") throw new ErroDominio("invalid-argument", `${id} não é um cartão`);
    if (!/^\d{4}-\d{2}$/.test(String(mes || ""))) throw new ErroDominio("invalid-argument", "mes no formato AAAA-MM");
    const f = faturasDoCartao(cartao, await comprasDoCartao(db, cartao.id)).find(x => x.mes === mes);
    const paga = (cartao.faturas || {})[mes];
    if (desfazer && !paga) throw new ErroDominio("failed-precondition", `A fatura ${mesBR(mes)} não está paga`);
    if (!desfazer && paga) throw new ErroDominio("failed-precondition", `A fatura ${mesBR(mes)} já foi paga em ${dataBR(paga.pagoEm)}`);
    const dia = data || hojeSP();
    const total = (f ? f.valor : 0) + (desfazer ? 0 : cartao.fatura || 0);
    if (!desfazer && !total) throw new ErroDominio("failed-precondition", `A fatura ${mesBR(mes)} está zerada`);
    const resumo = desfazer
      ? `*Desfazer pagamento da fatura — confirma?*\n${cartao.nome} final ${cartao.final} · fatura ${mesBR(mes)} (${brl(paga.valor)}) volta a ficar em aberto`
      : `*Pagar fatura — confirma?*\n${cartao.nome} final ${cartao.final} · fatura ${mesBR(mes)} · ${brl(total)}\nPago em ${dataLonga(dia)} (${meio || "Pix"}) · sai do caixa`;
    return propor("pagarFatura", { id: cartao.id, mes, pago: !desfazer, ...(desfazer ? {} : { data: dia, meio: meio || "Pix" }) }, resumo);
  },

  async propor_apagar_lancamento({ db, propor }, { id }) {
    const x = await lerLancamento(db, id);
    return propor("apagarFinanceiro", { id: x.id }, `*Apagar de vez — confirma?*\n${linhaLancamento(x)}`);
  },

  async propor_produto({ db, propor }, e) {
    let antes = null;
    if (e.id) {
      const snap = await db.collection(PRODUTOS).doc(String(e.id)).get();
      if (!snap.exists) throw new ErroDominio("not-found", `Produto ${e.id} não existe`);
      antes = { id: snap.id, ...snap.data() };
    }
    const dados = {
      nome: e.nome ?? antes?.nome, categoria: e.categoria ?? antes?.categoria,
      valorUnit: e.preco_reais != null ? cent(e.preco_reais) : antes?.valorUnit,
      qtdMin: e.qtd_minima ?? antes?.qtdMin, ingredientes: e.ingredientes ?? antes?.ingredientes,
      imagem: antes?.imagem, ativo: e.ativo ?? antes?.ativo, destaque: e.destaque ?? antes?.destaque,
      tiposPacote: e.pacotes ?? antes?.tiposPacote
    };
    const p = validarProduto(dados);
    const mudou = antes ? [
      ["nome", "Nome", x => x], ["categoria", "Categoria", x => x], ["valorUnit", "Preço", brl], ["qtdMin", "Mínimo", x => x],
      ["ingredientes", "Ingredientes", x => x || "—"], ["ativo", "No site", x => x !== false ? "sim" : "não"],
      ["destaque", "Destaque", x => x ? "sim" : "não"], ["tiposPacote", "Pacotes", x => (x || []).join(", ") || "—"]
    ].filter(([k, , f]) => String(f(antes[k])) !== String(f(p[k]))).map(([k, rot, f]) => `${rot}: ${f(antes[k])} → *${f(p[k])}*`) : [];
    if (antes && !mudou.length) throw new ErroDominio("failed-precondition", "Nada mudou nesse produto");
    const resumo = antes
      ? [`*Alterar produto — ${antes.nome}*`, ...mudou].join("\n")
      : [`*Novo produto — confirma?*`, `${p.nome} (${p.categoria}) · ${brl(p.valorUnit)} · mínimo ${p.qtdMin}${p.ativo ? "" : " · fora do site"}`].join("\n");
    return propor("salvarProduto", { ...(antes ? { id: antes.id } : {}), ...p }, resumo);
  },

  async propor_apagar_produto({ db, propor }, { id }) {
    const snap = await db.collection(PRODUTOS).doc(String(id || "")).get();
    if (!snap.exists) throw new ErroDominio("not-found", `Produto ${id} não existe`);
    return propor("apagarProduto", { id: snap.id }, `*Apagar produto de vez — confirma?*\n${snap.get("nome")} · ${brl(snap.get("valorUnit"))}\nPedidos antigos não mudam.`);
  },

  async propor_recheios({ db, propor }, { adicionar = [], remover = [] }) {
    const snap = await db.doc(RECHEIOS).get();
    const atual = snap.exists ? snap.get("lista") || [] : [];
    const tirar = new Set(remover.map(r => String(r).trim().toLowerCase()));
    const naoTem = remover.filter(r => !atual.some(a => a.toLowerCase() === String(r).trim().toLowerCase()));
    if (naoTem.length) throw new ErroDominio("invalid-argument", `Não estão na lista: ${naoTem.join(", ")}`);
    const novos = adicionar.map(r => String(r).trim()).filter(r => r && !atual.some(a => a.toLowerCase() === r.toLowerCase()));
    if (!novos.length && !tirar.size) throw new ErroDominio("failed-precondition", "Nada muda na lista de recheios");
    const lista = [...atual.filter(a => !tirar.has(a.toLowerCase())), ...novos];
    const resumo = ["*Recheios — confirma?*", ...(novos.length ? [`Entram: ${novos.join(", ")}`] : []), ...(tirar.size ? [`Saem: ${remover.join(", ")}`] : [])].join("\n");
    return propor("salvarRecheios", { lista }, resumo);
  }
};

const RESULTADO_LOJA = {
  salvarFinanceiro: (d, r) => `✅ ${r.criado ? "Lançado" : "Atualizado"} no financeiro.`,
  apagarFinanceiro: (d, r) => r.apagado ? "✅ Apagado do financeiro." : "Esse lançamento já não existia.",
  pagarBoleto: (d, r) => !r.mudou ? "Essa parcela já estava assim." : d.pago ? `✅ ${d.n}ª parcela marcada como paga.` : `✅ ${d.n}ª parcela voltou a ficar em aberto.`,
  pagarFatura: (d, r) => !r.mudou ? "Essa fatura já estava assim." : d.pago ? `✅ Fatura paga: ${brl(r.valor)} saiu do caixa.` : "✅ A fatura voltou a ficar em aberto.",
  salvarProduto: (d, r) => `✅ Produto ${r.criado ? "cadastrado" : "atualizado"}. O site atualiza em instantes.`,
  apagarProduto: (d, r) => r.apagado ? "✅ Produto apagado." : "Esse produto já não existia.",
  salvarRecheios: (d, r) => `✅ Recheios atualizados (${r.lista.length} na lista).`
};

export { DEFINICOES_LOJA, EXECUTAR_LOJA, RESULTADO_LOJA };
