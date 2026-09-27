/* Ferramentas da assistente. As de consulta só leem. As de mudança NÃO gravam: montam a
   proposta (com preço sempre do catálogo, nunca do modelo), guardam como pendente e a pessoa
   confirma no botão — só aí a ação roda, pelo mesmo caminho das telas. */
import { PEDIDOS, normalizar } from "../pedidos.js";
import { PRODUTOS, RECHEIOS } from "../produtos.js";
import { STATUS, MEIOS, ErroDominio } from "../dominio.js";
import { brl, dataBR, linhasItens } from "../efeitos.js";

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

async function catalogo(db) {
  const [produtos, recheios] = await Promise.all([db.collection(PRODUTOS).listar(), db.doc(RECHEIOS).get()]);
  return { produtos: produtos.filter(p => p.ativo !== false), recheios: recheios.exists ? recheios.get("lista") || [] : [] };
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
    description: "Produtos ativos com id, preço, categoria e quantidade mínima, e a lista de recheios. Consulte antes de propor um pedido.",
    input_schema: { type: "object", properties: {} }
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
  }
];

// ── Execução ──
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

  async catalogo({ db }) {
    const { produtos, recheios } = await catalogo(db);
    return {
      produtos: produtos.map(p => ({ id: p.id, nome: p.nome, categoria: p.categoria, preco: brl(p.valorUnit), qtd_minima: p.qtdMin || 1, ...(p.tiposPacote?.length ? { pacotes: p.tiposPacote } : {}) })),
      recheios
    };
  },

  async propor_pedido({ db, propor }, e) {
    const { produtos, recheios } = await catalogo(db);
    const porId = new Map(produtos.map(p => [p.id, p]));
    const porNome = new Map(produtos.map(p => [p.nome.toLowerCase(), p]));
    const conhecidos = new Set(recheios.map(r => r.toLowerCase()));

    const itens = (e.itens || []).map((it, i) => {
      const prod = porId.get(String(it.produto_id)) || porNome.get(String(it.produto_id || "").toLowerCase());
      if (!prod) throw new ErroDominio("invalid-argument", `Item ${i + 1}: produto "${it.produto_id}" não está no catálogo ativo`);
      if (it.qtd < (prod.qtdMin || 1)) throw new ErroDominio("invalid-argument", `${prod.nome}: mínimo de ${prod.qtdMin} unidades`);
      const desconhecidos = (it.recheios || []).filter(r => conhecidos.size && !conhecidos.has(String(r).toLowerCase()));
      if (desconhecidos.length) throw new ErroDominio("invalid-argument", `Recheio fora da lista: ${desconhecidos.join(", ")}`);
      return {
        nome: prod.nome, qtd: it.qtd, valorUnit: prod.valorUnit, produtoId: prod.id, categoria: prod.categoria,
        ...(it.recheios?.length ? { recheios: it.recheios } : {}), ...(it.topo?.tema ? { topo: it.topo } : {}), ...(it.obs ? { obs: it.obs } : {})
      };
    });
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
      `${p.entrega.modo === "entrega" ? "Entrega" : "Retirada"} ${quando(p.entrega)}${p.entrega.endereco ? ` — ${p.entrega.endereco}` : ""}`,
      "",
      ...p.itens.map(i => {
        const [primeira, ...detalhes] = linhasItens({ itens: [i] })[0].split("\n");
        return [`${primeira} — ${brl(i.qtd * i.valorUnit)}`, ...detalhes].join("\n");
      }),
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
  }
};

async function executarFerramenta(nome, entrada, contexto) {
  const fn = EXECUTAR[nome];
  if (!fn) throw new ErroDominio("invalid-argument", `Ferramenta desconhecida: ${nome}`);
  return fn(contexto, entrada || {});
}

export { DEFINICOES, executarFerramenta, hojeSP, somarDias, idPedido };
