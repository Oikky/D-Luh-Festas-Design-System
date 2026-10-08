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
import { enviarImagem, googleLigado } from "../google.js";

const MODELO = "claude-sonnet-5";
const CONVERSAS = "sis_ia";
const VISTAS = "sis_ia_msgs";
const ESQUECER_APOS = 3 * 3600e3;      // conversa parada há 3h recomeça do zero
const PRAZO_CONFIRMAR = 2 * 3600e3;    // botão de confirmar vale por 2h
const MAX_HISTORICO = 24;
const MAX_VOLTAS = 8;
const PRAZO_TOTAL = 24e3;              // o Worker tem ~30s depois de responder à Meta

const MIDIAS = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

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

Foto ou PDF (a mensagem começa com "(mandou uma foto" ou "(mandou um PDF"):
- Quase sempre é nota fiscal, cupom ou boleto de uma compra da loja. Leia e mostre o que entendeu, curto: fornecedor, data da compra, os itens principais resumidos (ex.: "farinha 25 kg, açúcar 10 kg e mais 6 itens") e o total; se for boleto, cada vencimento e valor.
- Se a nota não disser como foi pago, pergunte só isso, dando as opções: Pix, dinheiro, cartão da loja (cite os cartões cadastrados, de buscar_financeiro tipo cartao) ou boleto. Se disser (ex.: "cartão de crédito final 4821"), já proponha.
- Com a forma: Pix, dinheiro ou transferência → propor_transacao (saída, data da nota); cartão da loja → propor_compra_cartao (data da nota; parcelas se a nota mostrar); boleto → propor_boleto. Descrição: "Fornecedor · itens principais".
- A imagem não fica salva na conversa: deixe na sua resposta tudo que vai precisar depois (fornecedor, data, total, itens, parcelas).
- O sistema guarda sozinho cada foto/PDF e põe o link na mensagem ("arquivo: <link>"); a pessoa não vê nem manda esse link, então nunca peça link a ela nem fale em "arquivo:". Ao propor_boleto (novo ou corrigindo, com id), anexe em arquivos: a foto do boleto de uma parcela com o número dela em parcela; a nota ou a foto do boleto todo sem parcela. Junte todas as fotos que a pessoa mandou para o mesmo boleto. Se pedirem para anexar fotos a um boleto já lançado, use propor_boleto com o id e os links das fotos da conversa.
- Se uma foto veio sem "arquivo:", ela não ficou guardada: diga só que não deu para guardar aquela foto e peça para mandar de novo.
- Se não for nota (ex.: comprovante de Pix de cliente, foto de bolo), diga o que viu e pergunte o que fazer. Se não der para ler algum valor, diga qual e peça outra foto ou o número.

Mudanças (qualquer coisa que grave ou mande mensagem: pedido novo ou alterado, status, pagamento, cobrança, aviso ao cliente, nota, boleto, caixa, cartão, produto, recheio):
- Use as ferramentas propor_*. O sistema manda ao usuário o resumo e pede a confirmação; nada é gravado sem ela. Pode propor várias de uma vez.
- Antes de propor sobre algo que já existe, consulte para pegar o id certo (ver_pedido, buscar_pagamentos, buscar_financeiro, catalogo). Se houver mais de um candidato, pergunte qual.
- "Pagamento" pode ser de um pedido (propor_pagamento: Pix, dinheiro ou cartão do cliente), de um boleto da loja (propor_pagar_boleto) a fatura de um cartão da loja (propor_pagar_fatura) ou uma saída avulsa do caixa (propor_transacao). Gasto feito no cartão da loja é propor_compra_cartao (entra na fatura, não no caixa). Se não ficar claro qual, pergunte.
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
  return lerConversa(snap.exists ? snap.data() : {}, agora);
}

function lerConversa(d, agora) {
  const recente = d.atualizadoEm && agora - new Date(d.atualizadoEm).getTime() < ESQUECER_APOS;
  const pendentes = Object.fromEntries(Object.entries(d.pendentes || {})
    .filter(([, p]) => agora - new Date(p.criadoEm).getTime() < PRAZO_CONFIRMAR));
  return { historico: recente ? d.historico || [] : [], pendentes, ultimas: (d.ultimas || []).filter(id => pendentes[id]) };
}

const textoDe = resp => resp.content.filter(b => b.type === "text").map(b => b.text).join("\n").trim();

/* `anexo` = { base64, mime } de uma foto ou PDF: vai só nesta chamada; no histórico fica o texto. */
async function conversar({ env, db, numero, texto, anexo, agora = Date.now(), claude, enviar }) {
  const conv = await carregar(db, numero, agora);
  const entrada = `[${agoraTexto(agora)}]\n${texto}`;
  const bloco = !anexo ? null : anexo.mime === "application/pdf"
    ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: anexo.base64 } }
    : { type: "image", source: { type: "base64", media_type: anexo.mime, data: anexo.base64 } };
  const messages = [...conv.historico, { role: "user", content: bloco ? [bloco, { type: "text", text: entrada }] : entrada }];
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
  /* Relê na hora de gravar: duas fotos seguidas são respondidas ao mesmo tempo, e a que termina por
     último não pode apagar a conversa nem as propostas que a outra gravou no meio. */
  await db.runTransaction(async tx => {
    const ref = db.collection(CONVERSAS).doc(numero);
    const snap = await tx.get(ref);
    const atual = snap.exists ? lerConversa(snap.data(), Date.now()) : { historico: [], pendentes: {}, ultimas: [] };
    const doMeio = atual.ultimas.filter(id => new Date(atual.pendentes[id].criadoEm).getTime() >= agora);
    tx.set(ref, {
      historico: aparar([...atual.historico, { role: "user", content: entrada }, { role: "assistant", content: (resposta || "(sem texto)") + nota }]),
      pendentes: { ...atual.pendentes, ...Object.fromEntries(propostas.map(({ id, ...p }) => [id, p])) },
      ultimas: [...doMeio, ...propostas.map(p => p.id)],
      atualizadoEm: new Date(agora)
    }, { merge: true });
  });
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

/* Sobe a foto/PDF para o Drive na hora em que chega, para poder anexar ao boleto depois (a imagem em
   si não fica na conversa, o link fica). Não segura a resposta: se o Drive demorar ou falhar, segue sem link. */
async function guardarNoDrive(env, { base64, mime }) {
  if (!googleLigado(env) || mime === "image/gif") return null;
  const envio = enviarImagem(env, { dataUrl: `data:${mime};base64,${base64}`, prefixo: "whats", aceitaPdf: true }).then(r => r.url);
  const limite = new Promise(r => setTimeout(() => { console.error(JSON.stringify({ msg: "foto do Whats demorou para subir pro Drive" })); r(null); }, 10000));
  return Promise.race([envio, limite]).catch(e => { console.error(JSON.stringify({ msg: "foto do Whats não subiu pro Drive", erro: String(e) })); return null; });
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
    let anexo = null;
    if (msg.tipo === "imagem" && canal.baixarMidia) {
      const mime = MIDIAS.includes(msg.mime) ? msg.mime : "image/jpeg";
      const base64 = await canal.baixarMidia(msg);
      if (!base64) return await enviar.texto("Não consegui abrir esse arquivo. Pode mandar de novo?");
      if (base64.length > (mime === "application/pdf" ? 30e6 : 6.5e6)) return await enviar.texto("Esse arquivo é grande demais pra mim. Manda uma foto normal (não como documento) ou um PDF menor?");
      anexo = { base64, mime };
      const link = await guardarNoDrive(env, anexo);
      texto = `(mandou ${mime === "application/pdf" ? "um PDF" : "uma foto"}${link ? ` · arquivo: ${link}` : ""})${String(msg.texto || "").trim() ? ` ${String(msg.texto).trim()}` : ""}`;
    }
    if (!texto) return await enviar.texto("Por enquanto eu entendo texto, áudio, foto e PDF 🙂");

    const curta = texto.trim();
    if (SIM.test(curta) || NAO.test(curta)) {
      const { ultimas } = await carregar(db, numero, Date.now());
      if (ultimas.length) {
        for (const id of ultimas) await responderBotao({ env, db, numero, botao: `${SIM.test(curta) ? "ok" : "nao"}:${id}`, executar, enviar });
        return;
      }
    }
    claude ||= new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, timeout: anexo ? 25000 : 20000, maxRetries: 1 });
    await conversar({ env, db, numero, texto: deAudio ? `(áudio transcrito) ${texto}` : texto, anexo, claude, enviar });
  } catch (e) {
    console.error(JSON.stringify({ msg: "IA falhou", erro: String(e) }));
    await enviar.texto("Deu um erro aqui do meu lado. Tenta de novo daqui a pouco?").catch(() => {});
  }
}

export { iaPronta, iaNoTelegram, autorizado, conversar, responderBotao, tratarMensagem, agoraTexto, SISTEMA, MODELO };
