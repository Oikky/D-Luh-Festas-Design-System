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

async function criarLink({ handle, pedidoId, descricao, valor, webhookUrl, redirectUrl }, fetchFn = fetch) {
  const res = await fetchFn(`${API}/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      handle,
      order_nsu: pedidoId,
      webhook_url: webhookUrl,
      ...(redirectUrl ? { redirect_url: redirectUrl } : {}),
      items: [{ quantity: 1, price: valor, description: descricao }]
    })
  });
  if (!res.ok) throw new Error(`InfinitePay /links respondeu ${res.status}`);
  const r = await res.json();
  if (!r.url) throw new Error("InfinitePay não devolveu a URL do link");
  return r.url;
}

export { conferirPagamento, criarLink };
