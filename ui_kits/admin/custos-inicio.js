/* Ponto de partida da tela Custos: tudo o que a dona levantou em Contexto_Completo_Dluh_Festas.md
   (02/11/2026) — preços, as 9 fichas com receita, o cardápio inteiro (pratos ainda sem receita
   entram sem ingredientes), equipe, despesas e pacotes. Preço nulo = ainda não informado.
   Quantidades das receitas são para cerca de 50 convidados.
   Usado pelo admin (window.CUSTOS_INICIO) e por backend/scripts/custos-gravar.mjs, que grava no Firestore. */
(function () {
  const ing = (id, nome, preco, qtd, unidade) => ({ id, nome, preco, qtd, unidade });
  const it = (ing, qtd, unidade) => ({ ing, qtd, unidade });
  const faixas = () => ({ 50: null, 80: null, 100: null, 120: null, 150: null });
  const SAL = "Sal e temperos";
  const ficha = (id, nome, categoria, itens = [], pendencias = []) => ({ id, nome, categoria, rendimentoKg: null, porcaoG: null, itens, pendencias });
  const slug = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  /* Prato do cardápio sem receita ainda: a ficha fica "incompleta" até ganhar ingredientes. */
  const prato = (nome, categoria) => ficha(slug(nome), nome, categoria);

  const ingredientes = [
    ing("arroz", "Arroz", 2000, 5, "kg"), ing("frango", "Peito de frango", 1700, 1, "kg"), ing("mucarela", "Muçarela", 3800, 1, "kg"),
    ing("presunto", "Presunto", 2100, 1, "kg"), ing("creme", "Creme de leite", 250, 200, "g"), ing("requeijao", "Requeijão", 1400, 400, "g"),
    ing("batata", "Batata", 1000, 1, "kg"), ing("acem", "Acém", 4000, 1, "kg"), ing("suina", "Carne suína sem osso", 2000, 1, "kg"),
    ing("milho", "Milho (lata 170 g)", 250, 1, "un"), ing("cenoura", "Cenoura", 300, 1, "kg"), ing("palha", "Batata palha", 2200, 800, "g"),
    ing("rondelli", "Massa de rondelli (pacote rende 40)", 1100, 40, "un"), ing("leite", "Leite", 490, 1, "L"), ing("parmesao", "Parmesão", 7800, 1, "kg"),
    ing("oleo", "Óleo", 750, 900, "ml"), ing("cebola", "Cebola", 890, 1, "kg"), ing("alho", "Alho", 1990, 1, "kg"),
    ing("farinha", "Farinha de mandioca", 450, 1, "kg"), ing("bacon", "Bacon", 2700, 1, "kg"), ing("linguica", "Linguiça", 2900, 1, "kg"),
    ing("feijao", "Feijão", 890, 1, "kg"), ing("ovos", "Ovos (bandeja com 30)", 1800, 30, "un"), ing("tomate", "Molho de tomate (sachê 240 g)", 200, 1, "un"),
    ing("madeira", "Molho madeira (sachê 240 g)", 500, 1, "un"), ing("couve", "Couve", 550, 150, "g"), ing("manteiga", "Manteiga", null, 1, "kg"),
    ing("folhas", "Folhas", null, 1, "kg"), ing("repolho", "Repolho", null, 1, "kg"), ing("frutas", "Frutas", null, 1, "kg")
  ];

  /* As 9 fichas com receita (seção 6 do documento). */
  const comReceita = [
    ficha("arroz-branco", "Arroz branco", "Arroz", [it("arroz", 2, "kg"), it("alho", 50, "g"), it("oleo", 100, "ml")], [SAL]),
    ficha("arroz-a-grega", "Arroz à grega", "Arroz", [it("arroz", 2, "kg"), it("cenoura", 400, "g"), it("milho", 1, "un"), it("alho", 50, "g"), it("oleo", 100, "ml")],
      [SAL, "Pimentão e passas (se usar) — sem ervilha"]),
    ficha("fricasse-de-frango", "Fricassê de frango", "Proteína", [it("frango", 2.5, "kg"), it("milho", 1, "un"), it("creme", 600, "g"), it("requeijao", 400, "g"),
      it("cebola", 250, "g"), it("alho", 40, "g"), it("palha", 300, "g")], [SAL, "Confirmar o uso da batata palha"]),
    ficha("rondelli", "Rondelli de presunto e queijo", "Massa", [it("rondelli", 40, "un"), it("presunto", 800, "g"), it("mucarela", 1, "kg"), it("tomate", 1, "un")],
      [SAL, "Confirmar quantidade de recheio", "Molho branco ou outro molho (se tiver)"]),
    // No cardápio: "carne ao molho madeira" (Especial). Receita 6.5, com acém.
    ficha("carne-ao-molho-madeira", "Carne ao molho madeira", "Proteína", [it("acem", 5.5, "kg"), it("cebola", 400, "g"), it("alho", 60, "g"), it("oleo", 100, "ml"), it("madeira", 1, "un")],
      [SAL, "Confirmar se 1 sachê de molho madeira basta"]),
    // No cardápio: "pernil assado" (Tradicional). Receita 6.6, carne suína assada sem osso.
    ficha("pernil-assado", "Pernil assado", "Proteína", [it("suina", 5.8, "kg"), it("alho", 100, "g"), it("cebola", 400, "g"), it("oleo", 100, "ml")],
      [SAL, "Marinada: ingredientes e quantidades"]),
    ficha("batata-gratinada", "Batata gratinada", "Guarnição", [it("batata", 2.5, "kg"), it("creme", 400, "g"), it("leite", 500, "ml"), it("mucarela", 350, "g"),
      it("parmesao", 100, "g"), it("manteiga", 80, "g")], [SAL]),
    ficha("feijao-tropeiro", "Feijão tropeiro", "Regional", [it("feijao", 800, "g"), it("farinha", 600, "g"), it("bacon", 350, "g"), it("linguica", 450, "g"),
      it("ovos", 8, "un"), it("couve", 150, "g"), it("cebola", 250, "g"), it("alho", 40, "g")], [SAL]),
    ficha("salada-tropical", "Salada tropical", "Salada", [it("folhas", 1, "kg"), it("repolho", 500, "g"), it("cenoura", 400, "g"), it("frutas", 900, "g")],
      ["Molho da salada (300 g): ingredientes e preços", "Quais frutas"])
  ];

  /* O cardápio (seção 3). Nome repetido entre faixas = o mesmo prato. */
  const CARDAPIO = {
    tradicional: {
      Arroz: ["Arroz branco", "Arroz à grega"],
      Massa: ["Lasanha", "Macarrão ao molho branco", "Rondelli de presunto e queijo"],
      Proteína: ["Fricassê de frango", "Frango ao molho branco", "Carne de panela", "Pernil assado"],
      Guarnição: ["Batata frita", "Purê", "Farofa", "Mandioca"],
      Salada: ["Salada tropical", "Maionese", "Salada de legumes", "Salpicão de frango"],
      Entrada: ["Salgados variados", "Quiches", "Mini pizza", "Mini hambúrguer"]
    },
    especial: {
      Arroz: ["Arroz com brócolis", "Arroz com alho-poró", "Arroz à grega especial", "Arroz com amêndoas"],
      Massa: ["Rondelli de presunto e queijo", "Penne quatro queijos", "Lasanha especial"],
      Proteína: ["Frango com ervas", "Lombo suíno", "Pernil com abacaxi", "Carne ao molho madeira"],
      Guarnição: ["Batata gratinada", "Batata sauté", "Legumes salteados", "Farofa especial", "Mandioca"],
      Entrada: ["Canapés", "Bruschettas", "Barquetes", "Mini escondidinho"]
    },
    premium: {
      Arroz: ["Arroz com amêndoas", "Arroz piamontese", "Arroz com castanhas", "Arroz com alho-poró"],
      Massa: ["Ravioli", "Rondelli especial", "Penne quatro queijos"],
      Proteína: ["Filé ao molho madeira", "Filé ao molho de mostarda", "Medalhão de frango", "Lombo suíno recheado"],
      Entrada: ["Mesa de frios", "Tábuas de queijos e frutas", "Finger foods"]
    },
    mineiro: {
      Regional: ["Feijão tropeiro", "Arroz com pequi", "Carne de sol com mandioca", "Costelinha ou pernil ao barbecue",
        "Isca de frango empanada", "Moela com torrada", "Dobradinha", "Linguiça acebolada"]
    }
  };
  const NOMES = { tradicional: "Tradicional", especial: "Especial", premium: "Premium", mineiro: "Opções mineiras" };

  const fichas = [...comReceita];
  const idDe = new Map(comReceita.map(f => [f.nome, f.id]));
  const pacotes = Object.entries(CARDAPIO).map(([id, cats]) => ({
    id, nome: NOMES[id],
    fichas: Object.entries(cats).flatMap(([cat, nomes]) => nomes.map(nome => {
      if (!idDe.has(nome)) { const f = prato(nome, cat); fichas.push(f); idDe.set(nome, f.id); }
      return idDe.get(nome);
    }))
  }));

  const CUSTOS_INICIO = {
    ingredientes,
    fichas,
    equipe: [
      { id: "garcom", funcao: "Garçom", valor: 18000, servido: faixas(), self: faixas() },
      { id: "cozinheira", funcao: "Cozinheira", valor: 20000, servido: faixas(), self: faixas() },
      { id: "auxiliar", funcao: "Auxiliar", valor: 15000, servido: faixas(), self: faixas() },
      { id: "coordenador", funcao: "Coordenador", valor: 20000, servido: faixas(), self: faixas() }
    ],
    operacao: {
      gas: null, gasolinaLitro: 650, kmPorLitro: 11, km: 25,
      outros: [
        { id: "lavagem", nome: "Lavagem e produtos de limpeza", valor: null, por: "evento" },
        { id: "agua-luz", nome: "Água e energia", valor: null, por: "evento" },
        { id: "quebra", nome: "Quebra e reposição de utensílios", valor: null, por: "evento" },
        { id: "montagem", nome: "Montagem, carga e recolhimento (se pagos à parte)", valor: null, por: "evento" }
      ],
      pendencias: ["Confirmar se os valores da equipe são por evento", "Confirmar gasolina, consumo do carro e distância",
        "Perdas de produção, taxas de pagamento e imprevistos"]
    },
    pacotes,
    /* Quantos pratos de cada tipo o cliente marca no formulário do site. Partida pela tabela de 50
       convidados do documento (1 arroz, 1 massa, 2 proteínas, 2 guarnições, 1 salada); nulo = livre. */
    limites: { Arroz: 1, Massa: 1, Proteína: 2, Guarnição: 2, Salada: 1, Entrada: null, Regional: null },
    precos: { margemPct: null, taxasPct: null }
  };

  if (typeof window !== "undefined") window.CUSTOS_INICIO = CUSTOS_INICIO;
  if (typeof module !== "undefined") module.exports = CUSTOS_INICIO;
})();
