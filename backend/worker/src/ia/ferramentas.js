/* Ferramentas da assistente. As de consulta só leem. As de mudança NÃO gravam: montam a
   proposta (com preço sempre do catálogo, nunca do modelo), guardam como pendente e a pessoa
   confirma no botão — só aí a ação roda, pelo mesmo caminho das telas. */
import { PEDIDOS, PAGAMENTOS, normalizar } from "../pedidos.js";
import { PRODUTOS, RECHEIOS } from "../produtos.js";
import { STATUS, MEIOS, ErroDominio, validarItens } from "../dominio.js";
import { brl, dataBR, linhasItens } from "../efeitos.js";
import { paraLembrar } from "../lembretes.js";
import { TIPOS_NOTA } from "../notas.js";
import { DEFINICOES_LOJA, EXECUTAR_LOJA } from "./ferramentas-loja.js";

/* Brasil não tem mais horário de verão: UTC-3 o ano todo. */
const hojeSP = (agora = Date.now()) => new Date(agora - 3 * 3600e3).toISOString().slice(0, 10);
const somarDias = (iso, n) => new Date(Date.parse(iso + "T12:00:00Z") + n * 86400e3).toISOString().slice(0, 10);
const dataOk = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));
const idPedido = v => { const s = String(v || "").trim().toUpperCase(); return /^\d+$/.test(s) ? `PED-${s}` : s; };
const quando = e => `${dataBR(e?.data)}${e?.hora ? ` às ${e.hora}` : ""}`;

function linhaPedido(p) {
  const itens = (p.itens || []).map(i => `${i.qtd}× ${i.nome}`).join(", ");
  return `${p.id} · ${quando(p.entrega)} · ${p.entrega?.modo || ""} · ${p.cliente?.nome} · ${brl(p.total)} (pago ${brl(p.pago)}) · ${p.status} · ${p.pagamento} · ${itens}`;
}

async function pedidosNoPeriodo(db, de, ate) {
  return db.collection(PEDIDOS).consultar([["entrega.data", ">=", de], ["entrega.data", "<=", ate]], { ordem: "entrega.data", limite: 1000 });
}

async function catalogo(db, todos = false) {
  const [produtos, recheios] = await Promise.all([db.collection(PRODUTOS).listar(), db.doc(RECHEIOS).get()]);
  return { produtos: produtos.filter(p => todos || p.ativo !== false), recheios: recheios.exists ? recheios.get("lista") || [] : [] };
}

// ── Definições (o que o Claude vê) ──
const DATA = { type: "string", description: "AAAA-MM-DD" };
const DEFINICOES = [
  {
    name: "buscar_pedidos",
    description: "Lista pedidos pela DATA DE ENTREGA/RETIRADA num intervalo. Use para: pedidos de hoje/amanhã/da semana, quem falta pagar, pedidos de um cliente, pedidos num status.",
    input_schema: {
      type: "object",
      properties: {
        de: DATA, ate: DATA,
        status: { type: "string", enum: STATUS },
        pagamento: { type: "string", enum: ["Não pago", "Só entrada", "Totalmente pago", "Falta pagar"], description: "\"Falta pagar\" = Não pago ou Só entrada" },
        cliente: { type: "string", description: "Parte do nome ou do telefone" }
      },
      required: ["de", "ate"]
    }
  },
  {
    name: "ver_pedido",
    description: "Todos os detalhes de um pedido e o histórico de mudanças. Aceita \"PED-3012\" ou só \"3012\".",
    input_schema: { type: "object", properties: { pedido_id: { type: "string" } }, required: ["pedido_id"] }
  },
  {
    name: "resumo_vendas",
    description: "Números de um período pela data de entrega: quantidade de pedidos, faturamento, recebido, a receber, por status, produtos mais vendidos e total por dia. Cancelados ficam de fora das somas.",
    input_schema: { type: "object", properties: { de: DATA, ate: DATA }, required: ["de", "ate"] }
  },
  {
    name: "catalogo",
    description: "Produtos com id, preço, categoria e quantidade mínima, e a lista de recheios. Consulte antes de propor um pedido ou mexer num produto.",
    input_schema: { type: "object", properties: { incluir_inativos: { type: "boolean", description: "Também os que estão fora do site" } } }
  },
  {
    name: "propor_pedido",
    description: "Monta um pedido NOVO e manda ao usuário com botões Confirmar/Cancelar. Não grava nada: só grava se ele tocar em Confirmar. Preços vêm do catálogo. Pergunte o que faltar antes (nome, telefone, data, retirada ou entrega e endereço, itens).",
    input_schema: {
      type: "object",
      properties: {
        cliente: { type: "object", properties: { nome: { type: "string" }, telefone: { type: "string", description: "Com DDD" } }, required: ["nome", "telefone"] },
        entrega: {
          type: "object",
          properties: { modo: { type: "string", enum: ["retirada", "entrega"] }, data: DATA, hora: { type: "string", description: "HH:MM, opcional" }, endereco: { type: "string" } },
          required: ["modo", "data"]
        },
        itens: {
          type: "array",
          items: {
            type: "object",
            properties: {
              produto_id: { type: "string", description: "id do catálogo" },
              qtd: { type: "integer", minimum: 1 },
              recheios: { type: "array", items: { type: "string" } },
              topo: { type: "object", properties: { tema: { type: "string" }, detalhes: { type: "string" } }, required: ["tema"] },
              obs: { type: "string" }
            },
            required: ["produto_id", "qtd"]
          }
        },
        taxa_entrega_reais: { type: "number" },
        entrada_pct: { type: "integer", enum: [50, 100], description: "Quanto a cobrança de entrada pede. Padrão 50." },
        tipo: { type: "string", enum: ["pessoa", "empresa"] },
        obs: { type: "string" }
      },
      required: ["cliente", "entrega", "itens"]
    }
  },
  {
    name: "propor_status",
    description: "Propõe mudar o status de um pedido (com botões Confirmar/Cancelar). Mudar para \"Pronto\" avisa o cliente no WhatsApp.",
    input_schema: {
      type: "object",
      properties: { pedido_id: { type: "string" }, status: { type: "string", enum: STATUS }, motivo: { type: "string" } },
      required: ["pedido_id", "status"]
    }
  },
  {
    name: "propor_pagamento",
    description: "Propõe registrar um pagamento recebido (Pix direto, dinheiro, cartão) num pedido, com botões Confirmar/Cancelar. O cliente recebe aviso no WhatsApp.",
    input_schema: {
      type: "object",
      properties: { pedido_id: { type: "string" }, valor_reais: { type: "number", exclusiveMinimum: 0 }, meio: { type: "string", enum: MEIOS } },
      required: ["pedido_id", "valor_reais", "meio"]
    }
  },
  {
    name: "propor_editar_pedido",
    description: "Propõe mudar dados de um pedido existente: cliente, data/hora, retirada ou entrega, endereço, itens, taxa de entrega, entrada, observação. Mande só o que muda. Itens: se mandar, é a lista inteira nova — para manter um item como está (com o preço dele), use item_atual com o número dele em ver_pedido (1, 2…); item novo vem do catálogo.",
    input_schema: {
      type: "object",
      properties: {
        pedido_id: { type: "string" },
        cliente: { type: "object", properties: { nome: { type: "string" }, telefone: { type: "string" }, email: { type: "string" } } },
        entrega: { type: "object", properties: { modo: { type: "string", enum: ["retirada", "entrega"] }, data: DATA, hora: { type: "string" }, endereco: { type: "string" } } },
        itens: {
          type: "array",
          items: {
            type: "object",
            properties: {
              item_atual: { type: "integer", minimum: 1 }, produto_id: { type: "string" }, qtd: { type: "integer", minimum: 1 },
              recheios: { type: "array", items: { type: "string" } },
              topo: { type: "object", properties: { tema: { type: "string" }, detalhes: { type: "string" } }, required: ["tema"] },
              obs: { type: "string" }
            }
          }
        },
        taxa_entrega_reais: { type: "number", minimum: 0 },
        entrada_pct: { type: "integer", enum: [50, 100] },
        tipo: { type: "string", enum: ["pessoa", "empresa"] },
        obs: { type: "string" }
      },
      required: ["pedido_id"]
    }
  },
  {
    name: "propor_marcar_feito",
    description: "Marca que a cozinha terminou um pedido que está Em produção (sai da fila da cozinha; o status não muda).",
    input_schema: { type: "object", properties: { pedido_id: { type: "string" } }, required: ["pedido_id"] }
  },
  {
    name: "propor_apagar_pagamento",
    description: "Apaga um pagamento de pedido lançado errado (o valor sai do pago do pedido). Pegue o id em buscar_pagamentos.",
    input_schema: { type: "object", properties: { pagamento_id: { type: "string" } }, required: ["pagamento_id"] }
  },
  {
    name: "propor_cobranca",
    description: "Gera um link de pagamento da InfinitePay (Pix ou cartão) para um pedido: entrada, restante ou total. Não manda nada ao cliente; o link volta aqui.",
    input_schema: {
      type: "object",
      properties: { pedido_id: { type: "string" }, tipo: { type: "string", enum: ["entrada", "restante", "total"] } },
      required: ["pedido_id", "tipo"]
    }
  },
  {
    name: "propor_avisar_cliente",
    description: "Manda ao cliente, pelo WhatsApp da loja, o resumo atual do pedido (itens, data, valores).",
    input_schema: { type: "object", properties: { pedido_id: { type: "string" } }, required: ["pedido_id"] }
  },
  {
    name: "propor_lembrar_entrada",
    description: "Manda o lembrete da entrada, com o link de pagamento, pelo WhatsApp, aos clientes de pedidos em \"Confirmado — Esperando pagamento\". Sem pedido_ids, vai para todos.",
    input_schema: { type: "object", properties: { pedido_ids: { type: "array", items: { type: "string" } } } }
  },
  {
    name: "propor_nota",
    description: "Registra no pedido a nota fiscal já emitida no ERP4ME (tipo, número e CPF/CNPJ). Não emite a nota.",
    input_schema: {
      type: "object",
      properties: { pedido_id: { type: "string" }, tipo: { type: "string", enum: TIPOS_NOTA }, numero: { type: "string" }, documento: { type: "string", description: "CPF ou CNPJ, opcional" } },
      required: ["pedido_id", "tipo", "numero"]
    }
  },
  ...DEFINICOES_LOJA
];

// ── Execução ──
/* Itens com preço sempre do catálogo ativo. Na edição, `item_atual` mantém um item que já está no
   pedido (com o preço dele), mudando só quantidade, recheios, topo ou obs se vierem. */
async function montarItens(db, lista, atuais = []) {
  const { produtos, recheios } = await catalogo(db);
  const porId = new Map(produtos.map(p => [p.id, p]));
  const porNome = new Map(produtos.map(p => [p.nome.toLowerCase(), p]));
  const conhecidos = new Set(recheios.map(r => r.toLowerCase()));
  const extras = it => {
    const desconhecidos = (it.recheios || []).filter(r => conhecidos.size && !conhecidos.has(String(r).toLowerCase()));
    if (desconhecidos.length) throw new ErroDominio("invalid-argument", `Recheio fora da lista: ${desconhecidos.join(", ")}`);
    return { ...(it.recheios?.length ? { recheios: it.recheios } : {}), ...(it.topo?.tema ? { topo: it.topo } : {}), ...(it.obs ? { obs: it.obs } : {}) };
  };

  return (lista || []).map((it, i) => {
    if (it.item_atual) {
      const velho = atuais[it.item_atual - 1];
      if (!velho) throw new ErroDominio("invalid-argument", `O pedido não tem o item ${it.item_atual}`);
      return { ...velho, ...(it.qtd ? { qtd: it.qtd } : {}), ...extras(it) };
    }
    const prod = porId.get(String(it.produto_id)) || porNome.get(String(it.produto_id || "").toLowerCase());
    if (!prod) throw new ErroDominio("invalid-argument", `Item ${i + 1}: produto "${it.produto_id}" não está no catálogo ativo`);
    if (!it.qtd) throw new ErroDominio("invalid-argument", `Item ${i + 1}: falta a quantidade`);
    if (it.qtd < (prod.qtdMin || 1)) throw new ErroDominio("invalid-argument", `${prod.nome}: mínimo de ${prod.qtdMin} unidades`);
    return { nome: prod.nome, qtd: it.qtd, valorUnit: prod.valorUnit, produtoId: prod.id, categoria: prod.categoria, ...extras(it) };
  });
}

const linhaItem = i => {
  const [primeira, ...detalhes] = linhasItens({ itens: [i] })[0].split("\n");
  return [`${primeira} — ${brl(i.qtd * i.valorUnit)}`, ...detalhes].join("\n");
};
const entregaTexto = e => `${e.modo === "entrega" ? "Entrega" : "Retirada"} ${quando(e)}${e.endereco ? ` — ${e.endereco}` : ""}`;
async function lerPedido(db, id) {
  const snap = await db.collection(PEDIDOS).doc(idPedido(id)).get();
  if (!snap.exists) throw new ErroDominio("not-found", `Pedido ${idPedido(id)} não existe`);
  return snap.data();
}

const EXECUTAR = {
  async buscar_pedidos({ db }, { de, ate, status, pagamento, cliente }) {
    if (!dataOk(de) || !dataOk(ate)) throw new ErroDominio("invalid-argument", "de/ate no formato AAAA-MM-DD");
    let lista = await pedidosNoPeriodo(db, de, ate);
    if (status) lista = lista.filter(p => p.status === status);
    if (pagamento === "Falta pagar") lista = lista.filter(p => p.pagamento !== "Totalmente pago" && p.status !== "Cancelado");
    else if (pagamento) lista = lista.filter(p => p.pagamento === pagamento);
    if (cliente) {
      const q = String(cliente).toLowerCase(), dig = String(cliente).replace(/\D/g, "");
      lista = lista.filter(p => String(p.cliente?.nome || "").toLowerCase().includes(q) || (dig.length >= 4 && String(p.cliente?.telefone || "").includes(dig)));
    }
    return { quantidade: lista.length, pedidos: lista.slice(0, 80).map(linhaPedido), ...(lista.length > 80 ? { aviso: "Mostrando só os 80 primeiros" } : {}) };
  },

  async ver_pedido({ db }, { pedido_id }) {
    const p = await lerPedido(db, pedido_id);
    const eventos = await db.collection(PEDIDOS).doc(p.id).collection("eventos").listar();
    eventos.sort((a, b) => new Date(a.em) - new Date(b.em));
    const { clienteUid, ...resto } = p;
    return {
      ...resto,
      itens: (p.itens || []).map((i, n) => ({ item: n + 1, ...i, valor_unit_reais: brl(i.valorUnit) })),
      total_reais: brl(p.total), pago_reais: brl(p.pago), falta_reais: brl(Math.max(0, p.total - p.pago)),
      historico: eventos.slice(-12).map(e => `${new Date(e.em).toISOString().slice(0, 16)} ${e.tipo}${e.para ? ` → ${e.para}` : ""}${e.valor ? ` ${brl(e.valor)}` : ""} (${e.por})`)
    };
  },

  async resumo_vendas({ db }, { de, ate }) {
    if (!dataOk(de) || !dataOk(ate)) throw new ErroDominio("invalid-argument", "de/ate no formato AAAA-MM-DD");
    const todos = await pedidosNoPeriodo(db, de, ate);
    const validos = todos.filter(p => p.status !== "Cancelado");
    const soma = f => validos.reduce((s, p) => s + (f(p) || 0), 0);
    const porStatus = {}, produtos = {}, porDia = {};
    for (const p of validos) {
      porStatus[p.status] = (porStatus[p.status] || 0) + 1;
      porDia[p.entrega.data] = (porDia[p.entrega.data] || 0) + p.total;
      for (const i of p.itens || []) produtos[i.nome] = (produtos[i.nome] || 0) + i.qtd;
    }
    return {
      periodo: `${dataBR(de)} a ${dataBR(ate)}`,
      pedidos: validos.length, cancelados: todos.length - validos.length,
      faturamento: brl(soma(p => p.total)), recebido: brl(soma(p => p.pago)), a_receber: brl(soma(p => Math.max(0, p.total - p.pago))),
      por_status: porStatus,
      mais_vendidos: Object.entries(produtos).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([n, q]) => `${q}× ${n}`),
      por_dia: Object.fromEntries(Object.entries(porDia).sort().map(([d, v]) => [dataBR(d), brl(v)]))
    };
  },

  async catalogo({ db }, { incluir_inativos } = {}) {
    const { produtos, recheios } = await catalogo(db, incluir_inativos);
    return {
      produtos: produtos.map(p => ({
        id: p.id, nome: p.nome, categoria: p.categoria, preco: brl(p.valorUnit), qtd_minima: p.qtdMin || 1,
        ...(p.tiposPacote?.length ? { pacotes: p.tiposPacote } : {}), ...(p.ativo === false ? { fora_do_site: true } : {}), ...(p.destaque ? { destaque: true } : {})
      })),
      recheios
    };
  },

  async propor_pedido({ db, propor }, e) {
    const itens = await montarItens(db, e.itens);
    const dados = {
      cliente: e.cliente, tipo: e.tipo, entrega: e.entrega, itens,
      taxaEntrega: Math.round((Number(e.taxa_entrega_reais) || 0) * 100),
      entradaPct: e.entrada_pct === 100 ? 100 : 50,
      obs: e.obs || "", origem: "admin"
    };
    const p = normalizar(dados); // mesma validação da gravação: erro aqui volta para o modelo corrigir

    const resumo = [
      "*Novo pedido — confirma?*",
      `${p.cliente.nome} · ${p.cliente.telefone}`,
      entregaTexto(p.entrega),
      "",
      ...p.itens.map(linhaItem),
      ...(p.taxaEntrega ? [`Taxa de entrega — ${brl(p.taxaEntrega)}`] : []),
      "",
      `*Total ${brl(p.total)}* · entrada ${p.entradaPct}%: ${brl(Math.round(p.total * p.entradaPct / 100))}`,
      ...(p.obs ? [`Obs: ${p.obs}`] : [])
    ].join("\n");
    return propor("criarPedido", dados, resumo);
  },

  async propor_status({ db, propor }, { pedido_id, status, motivo }) {
    if (!STATUS.includes(status)) throw new ErroDominio("invalid-argument", `Status desconhecido: ${status}`);
    const p = await lerPedido(db, pedido_id);
    if (p.status === status) throw new ErroDominio("failed-precondition", `${p.id} já está em "${status}"`);
    const resumo = [
      `*${p.id} — ${p.cliente?.nome}*`, `Status: ${p.status} → *${status}*`,
      ...(motivo ? [`Motivo: ${motivo}`] : []),
      ...(status === "Pronto" ? ["O cliente vai receber aviso no WhatsApp."] : [])
    ].join("\n");
    return propor("mudarStatus", { pedidoId: p.id, status, ...(motivo ? { motivo } : {}) }, resumo);
  },

  async propor_pagamento({ db, propor }, { pedido_id, valor_reais, meio }) {
    const valor = Math.round(Number(valor_reais) * 100);
    if (!(valor > 0)) throw new ErroDominio("invalid-argument", "Valor deve ser maior que zero");
    if (!MEIOS.includes(meio)) throw new ErroDominio("invalid-argument", `Meio deve ser ${MEIOS.join(", ")}`);
    const p = await lerPedido(db, pedido_id);
    if (p.status === "Cancelado") throw new ErroDominio("failed-precondition", `${p.id} está cancelado`);
    const depois = p.pago + valor;
    const resumo = [
      `*Pagamento — ${p.id} (${p.cliente?.nome})*`,
      `${brl(valor)} no ${meio}`,
      `Pago: ${brl(p.pago)} → ${brl(depois)} de ${brl(p.total)}`,
      ...(depois > p.total ? [`⚠️ Passa do total em ${brl(depois - p.total)}`] : []),
      "O cliente vai receber aviso no WhatsApp."
    ].join("\n");
    // `chave` é preenchida na confirmação com o id da proposta: tocar duas vezes não paga duas.
    return propor("registrarPagamentoManual", { pedidoId: p.id, valor, meio }, resumo);
  },

  async propor_editar_pedido({ db, propor }, e) {
    const p = await lerPedido(db, e.pedido_id);
    if (p.status === "Cancelado") throw new ErroDominio("failed-precondition", `${p.id} está cancelado`);
    const vaiRetirar = e.entrega?.modo === "retirada";
    const dados = {
      cliente: { ...p.cliente, ...(e.cliente || {}) },
      tipo: e.tipo ?? p.tipo,
      entrega: { ...p.entrega, ...(e.entrega || {}), ...(vaiRetirar ? { endereco: "" } : {}) },
      itens: e.itens ? await montarItens(db, e.itens, p.itens) : p.itens,
      taxaEntrega: e.taxa_entrega_reais != null ? Math.round(Number(e.taxa_entrega_reais) * 100) : vaiRetirar ? 0 : p.taxaEntrega || 0,
      entradaPct: e.entrada_pct ?? p.entradaPct,
      formaPagamento: p.formaPagamento,
      obs: e.obs ?? p.obs ?? ""
    };
    const n = normalizar(dados); // mesma validação da gravação
    const linhas = [];
    const tel = t => String(t || "").replace(/\D/g, "");
    if (n.cliente.nome !== p.cliente?.nome || n.cliente.telefone !== tel(p.cliente?.telefone)) linhas.push(`Cliente: ${p.cliente?.nome} · ${p.cliente?.telefone} → *${n.cliente.nome} · ${n.cliente.telefone}*`);
    if (entregaTexto(n.entrega) !== entregaTexto(p.entrega)) linhas.push(`${entregaTexto(p.entrega)} → *${entregaTexto(n.entrega)}*`);
    if (JSON.stringify(n.itens) !== JSON.stringify(validarItens(p.itens))) linhas.push("Itens agora:", ...n.itens.map(linhaItem));
    if (n.taxaEntrega !== (p.taxaEntrega || 0)) linhas.push(`Taxa de entrega: ${brl(p.taxaEntrega)} → *${brl(n.taxaEntrega)}*`);
    if (n.entradaPct !== (p.entradaPct || 50)) linhas.push(`Entrada: ${p.entradaPct || 50}% → *${n.entradaPct}%*`);
    if (n.tipo !== (p.tipo || "pessoa")) linhas.push(`Tipo: ${p.tipo || "pessoa"} → *${n.tipo}*`);
    if (n.obs !== (p.obs || "")) linhas.push(`Obs: ${p.obs || "—"} → *${n.obs || "—"}*`);
    if (!linhas.length) throw new ErroDominio("failed-precondition", "Nada mudou nesse pedido");
    if (n.total !== p.total) linhas.push(`Total: ${brl(p.total)} → *${brl(n.total)}* (pago ${brl(p.pago)})`);
    return propor("editarPedido", { pedidoId: p.id, ...dados }, [`*Alterar ${p.id} — ${p.cliente?.nome}*`, ...linhas].join("\n"));
  },

  async propor_marcar_feito({ db, propor }, { pedido_id }) {
    const p = await lerPedido(db, pedido_id);
    if (p.status !== "Em produção") throw new ErroDominio("failed-precondition", `${p.id} não está em produção (está em "${p.status}")`);
    if (p.cozinha === "feito") throw new ErroDominio("failed-precondition", `${p.id} já está marcado como feito`);
    return propor("marcarFeito", { pedidoId: p.id }, `*${p.id} — ${p.cliente?.nome}*\nMarcar como feito na cozinha (sai da fila).`);
  },

  async propor_apagar_pagamento({ db, propor }, { pagamento_id }) {
    const snap = await db.collection(PAGAMENTOS).doc(String(pagamento_id || "")).get();
    if (!snap.exists) throw new ErroDominio("not-found", "Esse pagamento não existe");
    const pg = snap.data();
    const p = await lerPedido(db, pg.pedidoId);
    const resumo = [
      `*Apagar pagamento — ${p.id} (${p.cliente?.nome})*`,
      `${brl(pg.valor)}${pg.meio ? ` no ${pg.meio}` : ""} · lançado por ${pg.por}`,
      `Pago: ${brl(p.pago)} → ${brl(Math.max(0, p.pago - pg.valor))} de ${brl(p.total)}`
    ].join("\n");
    return propor("apagarPagamento", { pagamentoId: snap.id, pedidoId: p.id }, resumo);
  },

  async propor_cobranca({ db, propor }, { pedido_id, tipo }) {
    const p = await lerPedido(db, pedido_id);
    const valor = { entrada: Math.round(p.total * (p.entradaPct || 50) / 100) - p.pago, restante: p.total - p.pago, total: p.total }[tipo];
    if (valor === undefined) throw new ErroDominio("invalid-argument", "Tipo deve ser entrada, restante ou total");
    if (valor <= 0) throw new ErroDominio("failed-precondition", `Não há ${tipo} a cobrar em ${p.id}`);
    const nome = tipo[0].toUpperCase() + tipo.slice(1);
    return propor("gerarCobranca", { pedidoId: p.id, tipo }, `*Link de pagamento — ${p.id} (${p.cliente?.nome})*\n${nome}: ${brl(valor)}\nO link vem aqui; não vai ao cliente.`);
  },

  async propor_avisar_cliente({ db, propor }, { pedido_id }) {
    const p = await lerPedido(db, pedido_id);
    return propor("avisarCliente", { pedidoId: p.id }, `*Mandar resumo ao cliente — ${p.id}*\n${p.cliente?.nome} · ${p.cliente?.telefone}\nVai pelo WhatsApp da loja.`);
  },

  async propor_lembrar_entrada({ db, propor }, { pedido_ids }) {
    const ids = Array.isArray(pedido_ids) && pedido_ids.length ? pedido_ids.map(idPedido) : undefined;
    const lista = await paraLembrar(db, { pedidoIds: ids });
    if (!lista.length) throw new ErroDominio("failed-precondition", "Nenhum pedido esperando entrada (com telefone) para lembrar");
    const resumo = [
      `*Lembrar a entrada — ${lista.length} cliente${lista.length > 1 ? "s" : ""}*`,
      ...lista.slice(0, 20).map(p => `• ${p.id} ${p.cliente?.nome} · ${quando(p.entrega)}`),
      "Cada um recebe a mensagem com o link pelo WhatsApp da loja."
    ].join("\n");
    return propor("lembrarEntrada", { pedidoIds: lista.map(p => p.id) }, resumo);
  },

  async propor_nota({ db, propor }, { pedido_id, tipo, numero, documento }) {
    const p = await lerPedido(db, pedido_id);
    if (!TIPOS_NOTA.includes(tipo)) throw new ErroDominio("invalid-argument", `Tipo de nota deve ser ${TIPOS_NOTA.join(" ou ")}`);
    const num = String(numero || "").trim();
    if (!num) throw new ErroDominio("invalid-argument", "Falta o número da nota");
    const resumo = [
      `*Nota fiscal — ${p.id} (${p.cliente?.nome})*`, `${tipo} nº ${num}${documento ? ` · ${documento}` : ""}`,
      ...(p.nota ? [`Substitui: ${p.nota.tipo} nº ${p.nota.numero}`] : [])
    ].join("\n");
    return propor("registrarNota", { pedidoId: p.id, tipo, numero: num, ...(documento ? { documento } : {}) }, resumo);
  },

  ...EXECUTAR_LOJA
};

async function executarFerramenta(nome, entrada, contexto) {
  const fn = EXECUTAR[nome];
  if (!fn) throw new ErroDominio("invalid-argument", `Ferramenta desconhecida: ${nome}`);
  return fn(contexto, entrada || {});
}

export { DEFINICOES, executarFerramenta, hojeSP, somarDias, idPedido };
