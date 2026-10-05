/* Assistente da equipe no WhatsApp, com o Claude Sonnet 5. Funciona por dois canais: o número da
   Meta (com botões) ou o número da loja pela Evolution (confirma respondendo "sim"/"não").
   Também no tópico IA do grupo da equipe no Telegram (só os IDs de TELEGRAM_IA_IDS).
   Só números de IA_NUMEROS falam com ela. Consulta tudo (pedidos, vendas, pagamentos, financeiro,
   catálogo); qualquer mudança vira PROPOSTA — só gravam quando a pessoa confirma (botão ou "sim", tratados aqui no
   código, nunca pelo modelo), e aí passam pelo mesmo caminho das telas (evento, Agenda, avisos).
   A conversa fica em sis_ia/{número}. */
import Anthropic from "@anthropic-ai/sdk";
import { ErroDominio } from "../dominio.js";
import { DEFINICOES, executarFerramenta, hojeSP } from "./ferramentas.js";
import { RESULTADO_LOJA } from "./ferramentas-loja.js";
import { brl } from "../efeitos.js";
import { audioLigado, transcrever } from "./audio.js";

const MODELO = "claude-sonnet-5";
const CONVERSAS = "sis_ia";
const VISTAS = "sis_ia_msgs";
const ESQUECER_APOS = 3 * 3600e3;      // conversa parada há 3h recomeça do zero
const PRAZO_CONFIRMAR = 2 * 3600e3;    // botão de confirmar vale por 2h
const MAX_HISTORICO = 24;
const MAX_VOLTAS = 8;
const PRAZO_TOTAL = 24e3;              // o Worker tem ~30s depois de responder à Meta

const iaPronta = env => !!env.ANTHROPIC_API_KEY && !!env.IA_NUMEROS;
const iaNoTelegram = env => !!env.ANTHROPIC_API_KEY;

// Resposta curta que confirma ou cancela as propostas da última mensagem.
const SIM = /^(sim|s|confirm[ao]r?|confirmo|pode|pode sim|ok|1)[.!]*$/i;
const NAO = /^(n[aã]o|n|cancel[ao]r?|2)[.!]*$/i;

/* Compara pelos últimos 8 dígitos: o WhatsApp às vezes entrega o número sem o nono dígito. */
const ultimos8 = s => String(s || "").replace(/\D/g, "").slice(-8);
const autorizado = (env, numero) =>
  String(env.IA_NUMEROS || "").split(",").map(ultimos8).filter(Boolean).includes(ultimos8(numero));

const SISTEMA = `Você é a assistente interna da D'Luh Festas, confeitaria de festas (bolos, docinhos, salgados), no WhatsApp e no Telegram. Você conversa só com a dona e o filho dela, nunca com clientes, e tem acesso a todo o sistema: pedidos, pagamentos, financeiro (caixa, boletos, cartões da loja) e catálogo.

Como responder:
- Português do Brasil, curto e direto, no formato do WhatsApp: *negrito*, listas com "•", sem títulos, sem tabelas, sem markdown de links.
- Todo dado vem das ferramentas. Nunca invente pedido, cliente, valor, preço ou data; se não achar, diga que não achou.
- Cada mensagem do usuário começa com a data e hora atuais entre colchetes. Calcule "hoje", "amanhã", "sábado", "essa semana" (segunda a domingo) e "esse mês" a partir dela. Pedidos são sempre filtrados pela data de entrega/retirada.
- Os valores das ferramentas já vêm em reais formatados; use como vieram.
- Mensagem que começa com "(áudio transcrito)" veio de um áudio e pode ter erro de transcrição. Nome, telefone, número de pedido ou valor que pareça estranho: confirme antes de usar.

Mudanças (qualquer coisa que grave ou mande mensagem: pedido novo ou alterado, status, pagamento, cobrança, aviso ao cliente, nota, boleto, caixa, cartão, produto, recheio):
- Use as ferramentas propor_*. O sistema manda ao usuário o resumo e pede a confirmação; nada é gravado sem ela. Pode propor várias de uma vez.
- Antes de propor sobre algo que já existe, consulte para pegar o id certo (ver_pedido, buscar_pagamentos, buscar_financeiro, catalogo). Se houver mais de um candidato, pergunte qual.
- "Pagamento" pode ser de um pedido (propor_pagamento: Pix, dinheiro ou cartão do cliente), de um boleto da loja (propor_pagar_boleto) ou uma saída do caixa, como a fatura de um cartão da loja (propor_transacao; se quiser, também propor_cartao para zerar a fatura). Se não ficar claro qual, pergunte.
- Depois de propor, responda no máximo uma frase curta, sem repetir o resumo.
- A confirmação (botão ou "sim"/"não" logo depois do resumo) é tratada pelo sistema, não por você. Se o usuário disser "sim" e você não vir uma proposta recente, proponha de novo.
- Pedido novo: consulte o catálogo primeiro. Antes de propor, garanta nome e telefone do cliente, data (e hora, se houver), retirada ou entrega (com endereço e taxa), itens com quantidades e, quando fizer sentido, recheios. Pergunte só o que falta, tudo numa mensagem.
- Se uma ferramenta devolver erro, explique em palavras simples e peça o que falta para corrigir.`;

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
function agoraTexto(agora = Date.now()) {
  const d = new Date(agora - 3 * 3600e3);
  const hh = String(d.getUTCHours()).padStart(2, "0"), mm = String(d.getUTCMinutes()).padStart(2, "0");
  const iso = hojeSP(agora);
  return `${DIAS[d.getUTCDay()]}, ${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)} ${hh}:${mm} (hoje = ${iso})`;
}

/* Guarda só o texto de cada turno (as chamadas de ferramenta são refeitas quando preciso), sempre
   começando por uma mensagem do usuário. */
function aparar(historico) {
  let h = historico.slice(-MAX_HISTORICO);
  while (h.length && h[0].role !== "user") h = h.slice(1);
  return h;
}

async function carregar(db, numero, agora) {
  const snap = await db.collection(CONVERSAS).doc(numero).get();
  const d = snap.exists ? snap.data() : {};
  const recente = d.atualizadoEm && agora - new Date(d.atualizadoEm).getTime() < ESQUECER_APOS;
  const pendentes = Object.fromEntries(Object.entries(d.pendentes || {})
    .filter(([, p]) => agora - new Date(p.criadoEm).getTime() < PRAZO_CONFIRMAR));
  return { historico: recente ? d.historico || [] : [], pendentes, ultimas: (d.ultimas || []).filter(id => pendentes[id]) };
}

const textoDe = resp => resp.content.filter(b => b.type === "text").map(b => b.text).join("\n").trim();

async function conversar({ env, db, numero, texto, agora = Date.now(), claude, enviar }) {
  const conv = await carregar(db, numero, agora);
  const entrada = `[${agoraTexto(agora)}]\n${texto}`;
  const messages = [...conv.historico, { role: "user", content: entrada }];
  const propostas = [];
  const propor = (acao, dados, resumo) => {
    propostas.push({ id: crypto.randomUUID().replace(/-/g, "").slice(0, 12), acao, dados, resumo, criadoEm: new Date(agora) });
    return { ok: true, mensagem: "Resumo enviado ao usuário com os botões Confirmar e Cancelar. Não repita o resumo." };
  };

  let resp, resposta = "";
  for (let volta = 1; ; volta++) {
    resp = await claude.messages.create({
      model: MODELO,
      max_tokens: 8000,
      output_config: { effort: "low" },
      system: [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }],
      tools: DEFINICOES,
      messages
    });
    messages.push({ role: "assistant", content: resp.content });
    if (resp.stop_reason !== "tool_use") break;
    if (volta >= MAX_VOLTAS || Date.now() - agora > PRAZO_TOTAL) { resposta = "Isso ficou longo demais pra mim agora. Pode dividir em partes?"; break; }

    const chamadas = resp.content.filter(b => b.type === "tool_use");
    const resultados = await Promise.all(chamadas.map(async c => {
      try {
        const r = await executarFerramenta(c.name, c.input, { db, env, propor });
        return { type: "tool_result", tool_use_id: c.id, content: JSON.stringify(r) };
      } catch (e) {
        if (!(e instanceof ErroDominio)) console.error(JSON.stringify({ msg: "ferramenta da IA falhou", ferramenta: c.name, erro: String(e) }));
        return { type: "tool_result", tool_use_id: c.id, is_error: true, content: e instanceof ErroDominio ? e.message : "Erro interno ao consultar o sistema" };
      }
    }));
    messages.push({ role: "user", content: resultados });
  }

  if (!resposta) {
    if (resp.stop_reason === "refusal") resposta = "Não consigo ajudar com isso.";
    else resposta = textoDe(resp) + (resp.stop_reason === "max_tokens" ? "…" : "");
  }

  if (resposta) await enviar.texto(resposta);
  for (const p of propostas) {
    await enviar.botoes(p.resumo, [{ id: `ok:${p.id}`, titulo: "✅ Confirmar" }, { id: `nao:${p.id}`, titulo: "Cancelar" }]);
  }

  const nota = propostas.length ? `\n[propostas enviadas com botões: ${propostas.map(p => p.resumo.split("\n")[0]).join("; ")}]` : "";
  const pendentes = { ...conv.pendentes, ...Object.fromEntries(propostas.map(({ id, ...p }) => [id, p])) };
  await db.collection(CONVERSAS).doc(numero).set({
    historico: aparar([...conv.historico, { role: "user", content: entrada }, { role: "assistant", content: (resposta || "(sem texto)") + nota }]),
    pendentes,
    ultimas: propostas.map(p => p.id),
    atualizadoEm: new Date(agora)
  }, { merge: true });
  return { resposta, propostas };
}

const RESULTADO = {
  criarPedido: (d, r) => `✅ Pedido *${r.id}* criado, em "Aguardando confirmação".`,
  editarPedido: (d, r) => r.mudou ? `✅ ${d.pedidoId} alterado. Total ${brl(r.total)} · ${r.pagamento}.` : `${d.pedidoId} já estava assim.`,
  mudarStatus: (d, r) => r.mudou ? `✅ ${d.pedidoId} agora está em *${d.status}*.` : `${d.pedidoId} já estava em "${d.status}".`,
  marcarFeito: (d, r) => r.mudou ? `✅ ${d.pedidoId} marcado como feito.` : `${d.pedidoId} já estava feito.`,
  registrarPagamentoManual: (d, r) => r.duplicado ? "Esse pagamento já estava registrado." : `✅ Pagamento registrado. ${d.pedidoId}: ${r.pagamento}.`,
  apagarPagamento: (d, r) => `✅ Pagamento apagado.${r.pagamento ? ` ${r.pedidoId}: ${r.pagamento}.` : ""}`,
  gerarCobranca: (d, r) => `✅ Link de ${brl(r.valor)} para ${d.pedidoId}:
${r.url}`,
  avisarCliente: d => `✅ Resumo do ${d.pedidoId} enviado ao cliente.`,
  lembrarEntrada: (d, r) => `✅ Mandando o lembrete para ${r.total} cliente${r.total === 1 ? "" : "s"}, um de cada vez.`,
  registrarNota: (d, r) => `✅ Nota ${r.nota.tipo} nº ${r.nota.numero} registrada no ${d.pedidoId}.`,
  ...RESULTADO_LOJA
};

/* Toque em Confirmar/Cancelar. A proposta sai da lista na mesma transação que a lê: dois toques
   (ou a Meta reenviando o aviso) não gravam duas vezes. */
async function responderBotao({ env, db, numero, botao, agora = Date.now(), executar, enviar }) {
  const [escolha, id] = String(botao || "").split(":");
  const ref = db.collection(CONVERSAS).doc(numero);
  const proposta = await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const p = snap.exists ? (snap.get("pendentes") || {})[id] : null;
    if (!p) return null;
    const { [id]: _, ...resto } = snap.get("pendentes");
    tx.set(ref, { pendentes: resto }, { merge: true });
    return agora - new Date(p.criadoEm).getTime() < PRAZO_CONFIRMAR ? p : null;
  });

  let texto;
  if (!proposta) texto = "Essa confirmação já foi usada ou expirou. Se ainda quiser, me peça de novo.";
  else if (escolha !== "ok") texto = "Ok, cancelado. Nada foi gravado.";
  else {
    const dados = proposta.acao === "registrarPagamentoManual" ? { ...proposta.dados, chave: `ia-${id}` } : proposta.dados;
    try {
      const r = await executar(proposta.acao, dados, `ia:${numero}`);
      texto = RESULTADO[proposta.acao]?.(dados, r) || "✅ Feito.";
    } catch (e) {
      if (!(e instanceof ErroDominio)) console.error(JSON.stringify({ msg: "confirmação da IA falhou", acao: proposta.acao, erro: String(e) }));
      texto = `❌ Não gravei: ${e instanceof ErroDominio ? e.message : "deu um erro no sistema. Tente de novo."}`;
    }
  }
  await enviar.texto(texto);

  const conv = await carregar(db, numero, agora);
  await ref.set({
    historico: aparar([...conv.historico,
      { role: "user", content: `[${agoraTexto(agora)}]\n(${escolha === "ok" ? "confirmou" : "cancelou"}${proposta ? `: ${proposta.resumo.split("\n")[0]}` : ""})` },
      { role: "assistant", content: texto }]),
    atualizadoEm: new Date(agora)
  }, { merge: true });
}

/* Uma mensagem recebida (Meta ou Evolution): filtra, tira duplicata e responde. Roda depois do
   200 ao webhook. `canal` = { texto(numero, t), botoes(numero, t, botoes), lida(msg) }. */
async function tratarMensagem({ env, db, msg, executar, claude, canal }) {
  // O Telegram tem a lista dele (IDs de usuário); WhatsApp usa IA_NUMEROS.
  if (canal.autoriza ? !canal.autoriza(msg) : !autorizado(env, msg.de)) {
    console.log(JSON.stringify({ msg: "IA: não autorizado", quem: canal.autoriza ? `telegram:${msg.uid}` : ultimos8(msg.de) }));
    return;
  }
  const nova = await db.runTransaction(async tx => {
    const ref = db.collection(VISTAS).doc(msg.id);
    if ((await tx.get(ref)).exists) return false;
    tx.create(ref, { de: msg.de, em: new Date() });
    return true;
  });
  if (!nova) return;

  const numero = String(msg.de);
  const enviar = { texto: t => canal.texto(numero, t), botoes: (t, b) => canal.botoes(numero, t, b) };
  await canal.lida?.(msg);

  try {
    if (msg.botao) return await responderBotao({ env, db, numero, botao: msg.botao, executar, enviar });

    let texto = msg.tipo === "text" ? msg.texto : "", deAudio = false;
    if (msg.tipo === "audio" && audioLigado(env) && canal.baixarAudio) {
      texto = await transcrever(env, await canal.baixarAudio(msg));
      if (!texto) return await enviar.texto("Não consegui entender o áudio. Pode mandar de novo ou escrever?");
      deAudio = true;
    }
    if (!texto) return await enviar.texto("Por enquanto eu entendo texto e áudio 🙂");

    const curta = texto.trim();
    if (SIM.test(curta) || NAO.test(curta)) {
      const { ultimas } = await carregar(db, numero, Date.now());
      if (ultimas.length) {
        for (const id of ultimas) await responderBotao({ env, db, numero, botao: `${SIM.test(curta) ? "ok" : "nao"}:${id}`, executar, enviar });
        return;
      }
    }
    claude ||= new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, timeout: 20000, maxRetries: 1 });
    await conversar({ env, db, numero, texto: deAudio ? `(áudio transcrito) ${texto}` : texto, claude, enviar });
  } catch (e) {
    console.error(JSON.stringify({ msg: "IA falhou", erro: String(e) }));
    await enviar.texto("Deu um erro aqui do meu lado. Tenta de novo daqui a pouco?").catch(() => {});
  }
}

export { iaPronta, iaNoTelegram, autorizado, conversar, responderBotao, tratarMensagem, agoraTexto, SISTEMA, MODELO };
