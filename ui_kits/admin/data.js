window.DLUH = {
  /* The shop day the fake rows are built around. Agenda opens on it and the rail counts it. */
  hoje: "2026-06-12",
  pedidos: [
    { id: "PED-2291", data: "2026-06-12", hora: "15:00", modo: "Entrega em endereço", endereco: "Rua Dom Pedro II, 410 — Centro", cliente: "Maria Helena", status: "Em produção", tel: "(38) 99812-4410",
      entrega: "12/06 · 15h", pgto: "Pix", tipo: null, total: "R$ 480,00", pago: "R$ 240,00", falta: "R$ 240,00",
      itens: [{ qty: 1, name: "Bolo Vulcão 2kg", note: "Recheio: ninho com nutella", topper: "Topo: “Ana faz 5”", price: "R$ 240,00" },
              { qty: 100, name: "Salgados sortidos", note: "Coxinha, risoles, quibe", price: "R$ 228,00" },
              { qty: 1, name: "Taxa de entrega", note: "Centro · 3,2 km", price: "R$ 12,00" }] },
    { id: "PED-2290", data: "2026-06-13", hora: "11:00", modo: "Retirada no local", cliente: "Willian Bicalho", status: "Confirmado — Esperando pagamento", tel: "(38) 99114-2087",
      entrega: "13/06 · 11h", pgto: "Cartão", tipo: null, total: "R$ 740,00", pago: "R$ 0,00", falta: "R$ 370,00",
      itens: [{ qty: 2, name: "Bolo Red Velvet 1,5kg", note: "Cobertura: cream cheese", price: "R$ 520,00" },
              { qty: 50, name: "Docinhos gourmet", note: "Brigadeiro belga e beijinho", price: "R$ 220,00" }] },
    { id: "PED-2289", data: "2026-06-14", hora: "07:00", modo: "Entrega em endereço", endereco: "Av. Cula Mangabeira, 1200 — Santo Expedito", cliente: "Padaria Central", status: "Aguardando confirmação", tel: "(38) 3221-9080",
      entrega: "14/06 · 07h", pgto: "Pix", tipo: "Empresa", total: "R$ 1.240,00", pago: "R$ 0,00", falta: null,
      itens: [{ qty: 400, name: "Salgados para revenda", note: "Entrega semanal — contrato", price: "R$ 1.240,00" }] },
    { id: "PED-2288", data: "2026-06-10", hora: "18:00", modo: "Retirada no local", cliente: "Ana Cláudia", status: "Entregue — Esperando restante", tel: "(38) 99701-3322",
      entrega: "10/06 · 18h", pgto: "Dinheiro", tipo: null, total: "R$ 320,00", pago: "R$ 160,00", falta: "R$ 160,00",
      itens: [{ qty: 1, name: "Bolo de festa 3 andares", note: "Tema: jardim encantado", topper: "Topo: “Helena 1 ano”", price: "R$ 320,00" }] },
    { id: "PED-2284", data: "2026-06-07", hora: "11:00", modo: "Retirada no local", cliente: "Dona Cida", status: "Fiado", tel: "(38) 99812-4410",
      entrega: "07/06 · 11h", pgto: null, tipo: null, total: "R$ 186,00", pago: "R$ 60,00", falta: "R$ 126,00", pagamento: "Só entrada",
      itens: [{ qty: 100, name: "Salgados sortidos", note: null, price: "R$ 150,00" }, { qty: 1, name: "Bolo de pote", note: null, price: "R$ 36,00" }] },
    { id: "PED-2287", data: "2026-06-09", hora: "16:00", modo: "Retirada no local", cliente: "João Vitor", status: "Finalizado", tel: "(38) 99455-1190",
      entrega: "09/06 · 16h", pgto: "Pix", tipo: null, total: "R$ 188,00", pago: "R$ 188,00", falta: null,
      itens: [{ qty: 1, name: "Torta salgada grande", note: "Frango com catupiry", price: "R$ 188,00" }] },
    { id: "PED-2270", data: "2026-05-24", hora: "10:00", modo: "Entrega em endereço", endereco: "Rua Belo Horizonte, 88 — Todos os Santos", cliente: "Maria Helena", status: "Finalizado", tel: "(38) 99812-4410",
      entrega: "24/05 · 10h", pgto: "Pix", tipo: null, total: "R$ 210,00", pago: "R$ 210,00", falta: null,
      itens: [{ qty: 70, name: "Docinhos gourmet", note: null, price: "R$ 210,00" }] },
    { id: "PED-2254", data: "2026-05-02", hora: "15:30", modo: "Retirada no local", cliente: "João Vitor", status: "Finalizado", tel: "(38) 99455-1190",
      entrega: "02/05 · 15h30", pgto: "Dinheiro", tipo: null, total: "R$ 96,00", pago: "R$ 96,00", falta: null,
      itens: [{ qty: 40, name: "Salgados sortidos", note: null, price: "R$ 96,00" }] }
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
  /* Financeiro as stored in sis_financeiro (centavos, AAAA-MM-DD). Money from orders is not here:
     it comes from todosPagamentos. */
  financeiro: [
    { id: "f1", tipo: "transacao", desc: "Atacadão · farinha e açúcar", entrada: false, meio: "Cartão", data: "2026-06-11", valor: 61240 },
    { id: "f2", tipo: "transacao", desc: "Gás de cozinha", entrada: false, meio: "Dinheiro", data: "2026-06-10", valor: 13000 },
    { id: "f3", tipo: "transacao", desc: "Venda no balcão", entrada: true, meio: "Pix", data: "2026-06-09", valor: 4500 },
    /* Boleto = o pai com as parcelas dentro (Boletos.jsx). */
    { id: "f4", tipo: "boleto", desc: "Delly's", periodo: "semanal", cnpjAntigo: false, arquivos: [], parcelas: [
      { n: 1, venc: "2026-06-05", valor: 10293, codigo: "90190.00009 01118.132008 02733.414177 5 1530000010293", arquivos: [], pago: true, pagoEm: "2026-06-05" },
      { n: 2, venc: "2026-06-12", valor: 10292, codigo: "", arquivos: [], pago: false, pagoEm: null },
      { n: 3, venc: "2026-06-19", valor: 10292, codigo: "", arquivos: [], pago: false, pagoEm: null }] },
    { id: "f5", tipo: "boleto", desc: "Fermontes", periodo: "semanal", cnpjAntigo: false, arquivos: [], parcelas: [
      { n: 1, venc: "2026-06-08", valor: 37146, codigo: "", arquivos: [], pago: false, pagoEm: null },
      { n: 2, venc: "2026-06-15", valor: 37146, codigo: "", arquivos: [], pago: false, pagoEm: null }] },
    { id: "f6", tipo: "boleto", desc: "Cemil", periodo: "semanal", cnpjAntigo: true, arquivos: [], parcelas: [
      { n: 1, venc: "2026-05-20", valor: 68445, codigo: "", arquivos: [], pago: true, pagoEm: "2026-05-20" },
      { n: 2, venc: "2026-05-27", valor: 68445, codigo: "", arquivos: [], pago: true, pagoEm: "2026-05-27" },
      { n: 3, venc: "2026-06-03", valor: 68445, codigo: "", arquivos: [], pago: true, pagoEm: "2026-06-03" }] },
    { id: "f7", tipo: "cartao", nome: "Nubank Empresa", final: "4821", bandeira: "Mastercard", limite: 800000, fatura: 0, venc: 10, fecha: 3,
      faturas: { "2026-05": { pagoEm: "2026-05-10", valor: 231890, outros: 0, meio: "Pix" } } },
    { id: "f8", tipo: "cartao", nome: "Sicoob", final: "0377", bandeira: "Visa", limite: 500000, fatura: 61240, venc: 25, fecha: 15 },
    { id: "f9", tipo: "compra", cartaoId: "f7", desc: "Atacadão · farinha, açúcar e ovos", data: "2026-06-01", valor: 61240, parcelas: 1 },
    { id: "f10", tipo: "compra", cartaoId: "f7", desc: "Batedeira planetária", data: "2026-05-20", valor: 189900, parcelas: 3 },
    { id: "f11", tipo: "compra", cartaoId: "f7", desc: "Embalagens Rei do Plástico", data: "2026-06-08", valor: 34570, parcelas: 1 },
    { id: "f12", tipo: "compra", cartaoId: "f7", desc: "Gás P13", data: "2026-04-28", valor: 13000, parcelas: 1 }
  ],
  /* Every payment received on an order, as sis_pagamentos arrives mapped by api.js (centavos). */
  todosPagamentos: [
    { id: "pg1", pedidoId: "PED-2254", valor: 9600, meio: "Dinheiro", origem: "manual", data: "2026-05-02", hora: "15:40" },
    { id: "pg2", pedidoId: "PED-2270", valor: 21000, meio: "Pix", origem: "site", data: "2026-05-20", hora: "09:12" },
    { id: "pg3", pedidoId: "PED-2288", valor: 16000, meio: "Pix", origem: "site", data: "2026-06-08", hora: "19:05" },
    { id: "pg4", pedidoId: "PED-2287", valor: 18800, meio: "Pix", origem: "site", data: "2026-06-09", hora: "16:10" },
    { id: "pg5", pedidoId: "PED-2291", valor: 24000, meio: "Pix", origem: "site", data: "2026-06-10", hora: "11:30" }
  ],
  /* The global search's demo "Pagamentos" group. */
  atendimentos: [
    { id: "at1", tipo: "visita", nome: "Camila Rocha", tel: "38999123456", data: "sábado de manhã", pessoas: "80", obs: "Aniversário de 15 anos em dezembro", status: "novo", criadoEm: "2026-06-12T10:42:00" },
    { id: "at2", tipo: "evento", nome: "Marcos Antunes", tel: "38998765432", data: "20/07", pessoas: "50", obs: "", status: "novo", criadoEm: "2026-06-11T18:05:00" },
    { id: "at3", tipo: "visita", nome: "Joana Lima", tel: "38991112233", data: "", pessoas: "", obs: "", status: "resolvido", criadoEm: "2026-06-08T09:15:00", resolvidoPor: "luguilar86@gmail.com" }
  ],
  pagamentos: [
    { icon: "cake-slice", title: "Maria Helena", sub: "Entrada 50% · Pix", value: "+ R$ 240,00", tone: "in" },
    { icon: "credit-card", title: "Rafaela Prates", sub: "Pagamento total · Cartão", value: "+ R$ 352,00", tone: "in" },
    { icon: "truck", title: "Taxa de entrega", sub: "Centro · 3,2 km", value: "+ R$ 12,00", tone: "in" },
    { icon: "rotate-ccw", title: "João Vitor", sub: "Reembolso de cancelamento", value: "− R$ 88,00", tone: "out" }
  ]
};
