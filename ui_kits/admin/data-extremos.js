/* Stress fixture for the hardening pass. Loaded always, active only with ?dados=extremos.
   It adds rows real data will eventually produce: a 60-character name, 7-digit totals, money
   fields that are null, an order with no items, the two Status values with no sample row, one
   Status string that is NOT in the Coda single-select (to prove the UI flags it instead of
   hiding it), and an empty Financeiro tab. Every value is fake, like the rest of data.js. */
(() => {
  if (!/[?&]dados=extremos\b/.test(window.location.search)) return;
  const d = window.DLUH;
  const longo = "Associação Beneficente dos Amigos do Bairro Major Prates Ltda.";
  d.pedidos.unshift(
    { id: "PED-2299", data: "2026-06-15", hora: "09:00", modo: "Entrega em endereço", cliente: longo, status: "Aguardando confirmação",
      tel: "(38) 3212-0000", entrega: "15/06 · 09h", pgto: "Pix", tipo: "Empresa", total: "R$ 1.284.600,00", pago: "R$ 0,00", falta: "R$ 642.300,00",
      itens: [{ qty: 12000, name: "Kit festa completo para evento corporativo com decoração temática e mesa de doces finos", note: "Montagem no local, três dias de evento, equipe inclusa", topper: "Topo: “🎀 Parabéns, turma de 2026! 🎀”", price: "R$ 1.284.600,00" }] },
    { id: "PED-2298", data: null, hora: null, modo: null, cliente: "Cliente sem dados", status: "Verificando Estoque",
      tel: null, entrega: null, pgto: null, tipo: null, total: null, pago: null, falta: null, itens: [] },
    { id: "PED-2297", data: "2026-06-11", hora: "10:00", modo: "Retirada no local", cliente: "Pedro Henrique", status: "Cancelado",
      tel: "(38) 99100-2020", entrega: "11/06 · 10h", pgto: "Pix", tipo: null, total: "R$ 90,00", pago: "R$ 0,00", falta: null,
      itens: [{ qty: 30, name: "Brigadeiros", note: null, price: "R$ 90,00" }] },
    { id: "PED-2296", data: "2026-06-12", hora: "13:00", modo: "Entrega em endereço", cliente: "Lorena Dias", status: "Em rota",
      tel: "(38) 99877-6655", entrega: "12/06 · 13h", pgto: "Cartão", tipo: null, total: "R$ 260,00", pago: "R$ 260,00", falta: null,
      itens: [{ qty: 1, name: "Bolo prestígio 1,5kg", note: null, price: "R$ 260,00" }] }
  );
  d.fila.unshift(
    { id: "PED-2299", cliente: longo, hora: "09:00", itens: "12000 Kit festa completo para evento corporativo com decoração temática e mesa de doces finos", pago: "Não pago", entrega: "Entrega" },
    { id: "PED-2298", cliente: "Cliente sem dados", hora: "—", itens: "", pago: "Não pago", entrega: "Retirada" }
  );
  d.financeiro.transacoes.unshift({ desc: longo + " · entrada PED-2299", tipo: "Entrada", meio: "Transferência", data: "12/06", valor: 1284600 });
  d.financeiro.cartoes = [];
  d.recentes.unshift({ id: 99, nome: longo, cat: "Empresa", status: "Em rota", total: "R$ 1.284.600,00", data: "15/06", hora: "09:00" });
})();
