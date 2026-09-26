window.DLUH = {
  /* The shop day the fake rows are built around. Agenda opens on it and the rail counts it. */
  hoje: "2026-06-12",
  pedidos: [
    { id: "PED-2291", data: "2026-06-12", hora: "15:00", modo: "Entrega em endereço", cliente: "Maria Helena", status: "Em produção", tel: "(38) 99812-4410",
      entrega: "12/06 · 15h", pgto: "Pix", tipo: null, total: "R$ 480,00", pago: "R$ 240,00", falta: "R$ 240,00",
      itens: [{ qty: 1, name: "Bolo Vulcão 2kg", note: "Recheio: ninho com nutella", topper: "Topo: “Ana faz 5”", price: "R$ 240,00" },
              { qty: 100, name: "Salgados sortidos", note: "Coxinha, risoles, quibe", price: "R$ 228,00" },
              { qty: 1, name: "Taxa de entrega", note: "Centro · 3,2 km", price: "R$ 12,00" }] },
    { id: "PED-2290", data: "2026-06-13", hora: "11:00", modo: "Retirada no local", cliente: "Willian Bicalho", status: "Confirmado — Esperando pagamento", tel: "(38) 99114-2087",
      entrega: "13/06 · 11h", pgto: "Cartão", tipo: null, total: "R$ 740,00", pago: "R$ 0,00", falta: "R$ 370,00",
      itens: [{ qty: 2, name: "Bolo Red Velvet 1,5kg", note: "Cobertura: cream cheese", price: "R$ 520,00" },
              { qty: 50, name: "Docinhos gourmet", note: "Brigadeiro belga e beijinho", price: "R$ 220,00" }] },
    { id: "PED-2289", data: "2026-06-14", hora: "07:00", modo: "Entrega em endereço", cliente: "Padaria Central", status: "Aguardando confirmação", tel: "(38) 3221-9080",
      entrega: "14/06 · 07h", pgto: "Pix", tipo: "Empresa", total: "R$ 1.240,00", pago: "R$ 0,00", falta: null,
      itens: [{ qty: 400, name: "Salgados para revenda", note: "Entrega semanal — contrato", price: "R$ 1.240,00" }] },
    { id: "PED-2288", data: "2026-06-10", hora: "18:00", modo: "Retirada no local", cliente: "Ana Cláudia", status: "Entregue — Esperando restante", tel: "(38) 99701-3322",
      entrega: "10/06 · 18h", pgto: "Dinheiro", tipo: null, total: "R$ 320,00", pago: "R$ 160,00", falta: "R$ 160,00",
      itens: [{ qty: 1, name: "Bolo de festa 3 andares", note: "Tema: jardim encantado", topper: "Topo: “Helena 1 ano”", price: "R$ 320,00" }] },
    { id: "PED-2287", data: "2026-06-09", hora: "16:00", modo: "Retirada no local", cliente: "João Vitor", status: "Finalizado", tel: "(38) 99455-1190",
      entrega: "09/06 · 16h", pgto: "Pix", tipo: null, total: "R$ 188,00", pago: "R$ 188,00", falta: null,
      itens: [{ qty: 1, name: "Torta salgada grande", note: "Frango com catupiry", price: "R$ 188,00" }] }
  ],
  fila: [
    { id: "PED-2291", cliente: "Maria Helena", hora: "15:00", itens: "1 Bolo Vulcão 2kg · 100 Salgados sortidos", pago: "Só entrada", entrega: "Entrega" },
    { id: "PED-2293", cliente: "Rafaela Prates", hora: "16:30", itens: "80 Docinhos gourmet", pago: "Totalmente pago", entrega: "Retirada" },
    { id: "PED-2294", cliente: "Colégio São José", hora: "17:00", itens: "300 Salgados sortidos · 2 Bolos 1kg", pago: "Não pago", entrega: "Entrega" },
    { id: "PED-2295", cliente: "Tiago Meireles", hora: "18:15", itens: "1 Bolo Red Velvet 1,5kg", pago: "Só entrada", entrega: "Retirada" }
  ],
  /* Catalog as the Produtos screen reads it (money in centavos, plus the formatted price). */
  produtos: [
    { id: "p1", nome: "Coxinha de frango", categoria: "Salgado Frito", valorUnit: 150, preco: "R$ 1,50", qtdMin: 25, ingredientes: "Frango desfiado com catupiry", imagem: "", ativo: true, destaque: true, tiposPacote: [] },
    { id: "p2", nome: "Risoles de presunto e queijo", categoria: "Salgado Frito", valorUnit: 150, preco: "R$ 1,50", qtdMin: 25, ingredientes: "", imagem: "", ativo: true, destaque: false, tiposPacote: [] },
    { id: "p3", nome: "Empada de frango", categoria: "Salgado Assado", valorUnit: 280, preco: "R$ 2,80", qtdMin: 20, ingredientes: "Massa podre, frango e azeitona", imagem: "", ativo: true, destaque: false, tiposPacote: [] },
    { id: "p4", nome: "Bolo Vulcão 2kg", categoria: "Bolo", valorUnit: 24000, preco: "R$ 240,00", qtdMin: 1, ingredientes: "Massa de chocolate com calda", imagem: "", ativo: true, destaque: true, tiposPacote: [] },
    { id: "p5", nome: "Bolo Red Velvet 1,5kg", categoria: "Bolo", valorUnit: 26000, preco: "R$ 260,00", qtdMin: 1, ingredientes: "Cream cheese", imagem: "", ativo: false, destaque: false, tiposPacote: [] },
    { id: "p6", nome: "Brigadeiro belga", categoria: "Doce", valorUnit: 440, preco: "R$ 4,40", qtdMin: 25, ingredientes: "", imagem: "", ativo: true, destaque: false, tiposPacote: [] },
    { id: "p7", nome: "Pacote Festa 50 pessoas", categoria: "Pacote", valorUnit: 89000, preco: "R$ 890,00", qtdMin: 1, ingredientes: "Bolo 3kg, 300 salgados e 150 doces", imagem: "", ativo: true, destaque: false, tiposPacote: ["Salgado Frito", "Doce"] }
  ],
  recheios: ["Ninho com Nutella", "Brigadeiro", "Doce de leite com ameixa", "Prestígio", "Morango com chantilly"],
  agenda: [
    { data: "2026-06-05", tipo: "boleto", cliente: "Cemig", titulo: "Energia elétrica — cozinha e salão", valor: "R$ 684,30", situacao: "Pago", forma: "Débito automático" },
    { data: "2026-06-10", tipo: "cartao", cliente: "Nubank PJ", titulo: "Fatura do cartão — insumos e embalagens", valor: "R$ 2.318,90", situacao: "Pago" },
    { data: "2026-06-12", tipo: "boleto", cliente: "Distribuidora Doce Minas", titulo: "Chocolate, leite condensado e farinha", valor: "R$ 1.146,00", situacao: "Vence hoje", parcela: "2/3" },
    { data: "2026-06-15", tipo: "boleto", cliente: "Copasa", titulo: "Água e esgoto", valor: "R$ 212,45", situacao: "A vencer" },
    { data: "2026-06-17", tipo: "cartao", cliente: "Itaú Empresas", titulo: "Fatura do cartão — gás e manutenção", valor: "R$ 976,20", situacao: "A vencer" },
    { data: "2026-06-20", tipo: "boleto", cliente: "Aluguel do salão", titulo: "Aluguel mensal", valor: "R$ 3.200,00", situacao: "A vencer" },
    { data: "2026-06-25", tipo: "boleto", cliente: "Simples Nacional", titulo: "DAS — competência maio", valor: "R$ 1.482,77", situacao: "A vencer" },
    { data: "2026-06-08", tipo: "boleto", cliente: "Embalagens Montes Claros", titulo: "Caixas para bolo e forminhas", valor: "R$ 438,00", situacao: "Vencido", parcela: "1/2" },
    { data: "2026-06-10", tipo: "encomenda", hora: "18:00", cliente: "Ana Cláudia", titulo: "Bolo de festa 3 andares — jardim encantado", valor: "R$ 320,00", status: "Entregue — Esperando restante" },
    { data: "2026-06-12", tipo: "encomenda", hora: "15:00", cliente: "Maria Helena", titulo: "Bolo Vulcão 2kg · 100 salgados sortidos", valor: "R$ 480,00", status: "Em produção" },
    { data: "2026-06-12", tipo: "buffet", hora: "19:30", cliente: "Família Prates", titulo: "Buffet completo — aniversário de 15 anos", local: "Espaço Villa Bella", convidados: 120, valor: "R$ 8.400,00", status: "Em produção" },
    { data: "2026-06-13", tipo: "encomenda", hora: "11:00", cliente: "Willian Bicalho", titulo: "2 bolos Red Velvet · 50 docinhos gourmet", valor: "R$ 740,00", status: "Confirmado — Esperando pagamento" },
    { data: "2026-06-14", tipo: "encomenda", hora: "07:00", cliente: "Padaria Central", titulo: "400 salgados para revenda — contrato semanal", valor: "R$ 1.240,00", status: "Aguardando confirmação" },
    { data: "2026-06-14", tipo: "festa", hora: "16:00", cliente: "Tiago Meireles", titulo: "Locação do salão — aniversário infantil", local: "Salão D'Luh", convidados: 60, valor: "R$ 1.800,00", status: "Confirmado — Esperando pagamento" },
    { data: "2026-06-18", tipo: "buffet", hora: "20:00", cliente: "Colégio São José", titulo: "Buffet de formatura", local: "Auditório do colégio", convidados: 250, valor: "R$ 14.200,00", status: "Aguardando confirmação" },
    { data: "2026-06-20", tipo: "festa", hora: "14:00", cliente: "Rafaela Prates", titulo: "Locação do salão — chá de bebê", local: "Salão D'Luh", convidados: 45, valor: "R$ 1.500,00", status: "Em produção" },
    { data: "2026-06-21", tipo: "encomenda", hora: "09:30", cliente: "João Vitor", titulo: "Torta salgada grande — frango com catupiry", valor: "R$ 188,00", status: "Finalizado" },
    { data: "2026-06-27", tipo: "buffet", hora: "12:00", cliente: "Empresa Minas Log", titulo: "Coffee break corporativo", local: "Sede da empresa", convidados: 80, valor: "R$ 3.900,00", status: "Confirmado — Esperando pagamento" }
  ],
  contratos: [
    { cliente: "Família Prates", tipo: "buffet", data: "02/06/2026", valor: "R$ 8.400,00" },
    { cliente: "Tiago Meireles", tipo: "salao", data: "28/05/2026", valor: "R$ 1.800,00" },
    { cliente: "Colégio São José", tipo: "buffet", data: "21/05/2026", valor: "R$ 14.200,00" }
  ],
  financeiro: {
    transacoes: [
      { desc: "Maria Helena · entrada PED-2291", tipo: "Entrada", meio: "Pix", data: "12/06", valor: 240 },
      { desc: "Atacadão · farinha e açúcar", tipo: "Saída", meio: "Cartão", data: "11/06", valor: 612.4 },
      { desc: "Rafaela Prates · PED-2293", tipo: "Entrada", meio: "Cartão", data: "11/06", valor: 352 },
      { desc: "Gás de cozinha", tipo: "Saída", meio: "Dinheiro", data: "10/06", valor: 130 }
    ],
    boletos: [
      { desc: "Cemig · energia", venc: "15/06", valor: 486.9, status: "Em aberto" },
      { desc: "Embalagens Norte", venc: "20/06", valor: 740, status: "Em aberto" },
      { desc: "Aluguel do salão", venc: "05/06", valor: 2200, status: "Pago" }
    ],
    cartoes: [
      { nome: "Nubank Empresa", final: "4821", bandeira: "Mastercard", limite: 8000, fatura: 1942.3, venc: "10" },
      { nome: "Sicoob", final: "0377", bandeira: "Visa", limite: 5000, fatura: 612.4, venc: "25" }
    ]
  },
  serieSemana: [8, 11, 9, 14, 12, 19, 14],
  serieReceita: [1200, 1680, 1440, 2100, 1980, 2740, 2320],
  recentes: [
    { id: 1, nome: "Maria Helena", cat: "Bolo", status: "Em produção", total: "R$ 480,00", data: "12/06", hora: "14:00" },
    { id: 2, nome: "Willian Bicalho", cat: "Docinhos", status: "Confirmado — Esperando pagamento", total: "R$ 740,00", data: "13/06", hora: "10:30" },
    { id: 3, nome: "Padaria Central", cat: "Empresa", status: "Aguardando confirmação", total: "R$ 1.240,00", data: "14/06", hora: "08:00" },
    { id: 4, nome: "Ana Cláudia", cat: "Bolo de festa", status: "Entregue — Esperando restante", total: "R$ 320,00", data: "10/06", hora: "16:00" },
    { id: 5, nome: "João Vitor", cat: "Torta", status: "Finalizado", total: "R$ 188,00", data: "09/06", hora: "11:00" }
  ],
  pagamentos: [
    { icon: "cake-slice", title: "Maria Helena", sub: "Entrada 50% · Pix", value: "+ R$ 240,00", tone: "in" },
    { icon: "credit-card", title: "Rafaela Prates", sub: "Pagamento total · Cartão", value: "+ R$ 352,00", tone: "in" },
    { icon: "truck", title: "Taxa de entrega", sub: "Centro · 3,2 km", value: "+ R$ 12,00", tone: "in" },
    { icon: "rotate-ccw", title: "João Vitor", sub: "Reembolso de cancelamento", value: "− R$ 88,00", tone: "out" }
  ]
};
