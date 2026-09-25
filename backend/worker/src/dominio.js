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
    return {
      nome, qtd,
      valorUnit: centavos(it.valorUnit, `Item ${i + 1}: valorUnit`),
      ...(it.produtoId ? { produtoId: String(it.produtoId) } : {}),
      ...(it.obs ? { obs: String(it.obs) } : {}),
      ...(it.topo ? { topo: String(it.topo) } : {})
    };
  });
}

function totalDe(itens, taxaEntrega = 0) {
  return itens.reduce((s, it) => s + it.qtd * it.valorUnit, 0) + taxaEntrega;
}

/* Erro com código de HttpsError; quem chama converte na borda. */
class ErroDominio extends Error {
  constructor(codigo, mensagem) { super(mensagem); this.codigo = codigo; }
}

export { STATUS, PAGAMENTO, pagamentoDe, centavos, validarItens, totalDe, ErroDominio };
