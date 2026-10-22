/* O webhook da InfinitePay não vem assinado, então ninguém é acreditado pela palavra: cada aviso é
   conferido no payment_check antes de virar pagamento.
   Docs: ajuda.infinitepay.io → "Como usar o Checkout Integrado da InfinitePay?" */
const API = "https://api.checkout.infinitepay.io";

async function conferirPagamento({ handle, order_nsu, transaction_nsu, slug }, fetchFn = fetch) {
  const res = await fetchFn(`${API}/payment_check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handle, order_nsu, transaction_nsu, slug })
  });
  if (!res.ok) throw new Error(`payment_check respondeu ${res.status}`);
  const r = await res.json();
  // `amount` é o valor do pedido; `paid_amount` inclui os juros do parcelamento pagos pelo cliente.
  return { pago: r.success === true && r.paid === true, valor: Number(r.amount) || 0, meio: r.capture_method || "" };
}

/* Os dados do cliente que o pedido tiver (nome, e-mail do login Google, WhatsApp) vão já
   preenchidos: o checkout pede menos coisa para quem só quer pagar o Pix.
   Telefone fora do formato brasileiro (DDD + 8 ou 9 dígitos, com ou sem 55) fica de fora: a
   InfinitePay recusa o link inteiro (422) por causa dele, e o checkout pede o número ao cliente. */
function telefoneDoCheckout(telefone) {
  const d = String(telefone || "").replace(/\D/g, "");
  const nacional = /^55\d{10,11}$/.test(d) ? d.slice(2) : d;
  return /^[1-9]{2}(9\d{8}|[2-5]\d{7})$/.test(nacional) ? `+55${nacional}` : null;
}

function clienteDoCheckout(c) {
  if (!c) return null;
  const tel = telefoneDoCheckout(c.telefone);
  const customer = {
    ...(c.nome ? { name: String(c.nome) } : {}),
    ...(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email || "") ? { email: c.email } : {}),
    ...(tel ? { phone_number: tel } : {})
  };
  return Object.keys(customer).length ? customer : null;
}

async function criarLink({ handle, pedidoId, descricao, valor, webhookUrl, redirectUrl, cliente }, fetchFn = fetch) {
  const customer = clienteDoCheckout(cliente);
  const res = await fetchFn(`${API}/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      handle,
      order_nsu: pedidoId,
      webhook_url: webhookUrl,
      ...(redirectUrl ? { redirect_url: redirectUrl } : {}),
      ...(customer ? { customer } : {}),
      items: [{ quantity: 1, price: valor, description: descricao }]
    })
  });
  if (!res.ok) throw new Error(`InfinitePay /links respondeu ${res.status}`);
  const r = await res.json();
  if (!r.url) throw new Error("InfinitePay não devolveu a URL do link");
  return r.url;
}

export { conferirPagamento, criarLink, clienteDoCheckout };
