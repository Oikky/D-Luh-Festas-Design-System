/* Regras do negócio que não dependem de Firebase: os valores de status e pagamento que o sistema
   aceita, e como o estado do pagamento sai dos valores. Os textos são os mesmos do StatusBadge do
   design system — um texto fora desta lista seria gravado silenciosamente errado. */

const STATUS = [
  "Aguardando confirmação",
  "Verificando Estoque",
  "Confirmado — Esperando pagamento",
  "Em produção",
  "Pronto",
  "Entregue — Esperando restante",
  "Finalizado",
  "Cancelado"
];

const PAGAMENTO = ["Não pago", "Só entrada", "Totalmente pago"];

/* Como o dinheiro entrou. "outro" é para quando a tela não sabe (ex.: "Marcar como pago"). */
const MEIOS = ["pix", "dinheiro", "cartao", "outro"];

/* Dinheiro sempre em centavos inteiros (é também o que a InfinitePay usa). */
function pagamentoDe(totalCentavos, pagoCentavos) {
  if (pagoCentavos <= 0) return "Não pago";
  if (pagoCentavos >= totalCentavos) return "Totalmente pago";
  return "Só entrada";
}

function centavos(valor, campo) {
  if (!Number.isInteger(valor) || valor < 0) throw new ErroDominio("invalid-argument", `${campo} deve ser inteiro em centavos, ≥ 0`);
  return valor;
}

function validarItens(itens) {
  if (!Array.isArray(itens) || itens.length === 0) throw new ErroDominio("invalid-argument", "O pedido precisa de pelo menos um item");
  return itens.map((it, i) => {
    const nome = String(it?.nome || "").trim();
    const qtd = Number(it?.qtd);
    if (!nome) throw new ErroDominio("invalid-argument", `Item ${i + 1} sem nome`);
    if (!Number.isInteger(qtd) || qtd < 1) throw new ErroDominio("invalid-argument", `Item ${i + 1}: quantidade inválida`);
    const recheios = Array.isArray(it.recheios) ? it.recheios.map(r => String(r).trim()).filter(Boolean).slice(0, 30) : [];
    const topo = topoDe(it.topo, i);
    return {
      nome, qtd,
      valorUnit: centavos(it.valorUnit, `Item ${i + 1}: valorUnit`),
      ...(it.produtoId ? { produtoId: String(it.produtoId) } : {}),
      ...(it.categoria ? { categoria: String(it.categoria) } : {}),
      ...(it.obs ? { obs: String(it.obs) } : {}),
      ...(recheios.length ? { recheios } : {}),
      ...(topo ? { topo } : {})
    };
  });
}

/* Topo do bolo: texto livre (pedidos antigos) ou { tema, detalhes?, imagem? }, onde imagem é o
   link devolvido por /api/enviarTopo. */
function topoDe(topo, i) {
  if (!topo) return null;
  if (typeof topo === "string") return topo.trim() || null;
  const tema = String(topo.tema || "").trim();
  if (!tema) throw new ErroDominio("invalid-argument", `Item ${i + 1}: topo sem tema`);
  const imagem = String(topo.imagem || "");
  if (imagem && !/^https:\/\//.test(imagem)) throw new ErroDominio("invalid-argument", `Item ${i + 1}: imagem do topo inválida`);
  return { tema, ...(topo.detalhes ? { detalhes: String(topo.detalhes).trim() } : {}), ...(imagem ? { imagem } : {}) };
}

function totalDe(itens, taxaEntrega = 0) {
  return itens.reduce((s, it) => s + it.qtd * it.valorUnit, 0) + taxaEntrega;
}

/* Erro com código de HttpsError; quem chama converte na borda. */
class ErroDominio extends Error {
  constructor(codigo, mensagem) { super(mensagem); this.codigo = codigo; }
}

export { STATUS, PAGAMENTO, MEIOS, pagamentoDe, centavos, validarItens, totalDe, ErroDominio };
