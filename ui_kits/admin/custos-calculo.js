/* Contas da tela Custos (Custos.jsx), sem React, para poder testar com `node custos-calculo.js`.
   Dinheiro em centavos. Regra combinada com a dona: se falta qualquer dado, a conta NÃO sai —
   devolve `custo: null` e a lista `falta` dizendo o quê. Nada de custo parcial. */
(function () {
  const FATOR = { kg: 1000, g: 1, L: 1000, ml: 1, un: 1 };
  const FAMILIA = { kg: "peso", g: "peso", L: "volume", ml: "volume", un: "unidade" };
  const FAIXAS = [50, 80, 100, 120, 150];
  const FORMATOS = { servido: "Buffet servido", self: "Self-service" };

  /* Quanto custa a quantidade usada: preço da embalagem × (usado ÷ embalagem), na mesma família de unidade. */
  function custoItem(it, ing) {
    if (!ing) return { custo: null, falta: it.ing ? "Ingrediente apagado" : "Escolher o ingrediente" };
    if (ing.preco == null) return { custo: null, falta: `Preço de ${ing.nome}` };
    if (!ing.qtd) return { custo: null, falta: `Embalagem de ${ing.nome}` };
    if (it.qtd == null || it.qtd === 0) return { custo: null, falta: `Quantidade de ${ing.nome}` };
    if (FAMILIA[it.unidade] !== FAMILIA[ing.unidade]) return { custo: null, falta: `Unidade de ${ing.nome} (${it.unidade} × ${ing.unidade})` };
    return { custo: ing.preco * (it.qtd * FATOR[it.unidade]) / (ing.qtd * FATOR[ing.unidade]), falta: null };
  }

  /* Custo da receita, porções e custo por pessoa (porções = rendimento pronto ÷ porção por pessoa). */
  function calcularFicha(f, ingredientes) {
    const porId = new Map((ingredientes || []).map(i => [i.id, i]));
    const linhas = (f.itens || []).map(it => ({ ...it, ...custoItem(it, porId.get(it.ing)) }));
    const falta = [
      ...(linhas.length ? [] : ["Ingredientes da receita"]),
      ...linhas.map(l => l.falta).filter(Boolean),
      ...(f.rendimentoKg ? [] : ["Peso pronto (rendimento)"]),
      ...(f.porcaoG ? [] : ["Porção por convidado"]),
      ...(f.pendencias || [])
    ];
    const ok = !falta.length;
    const custo = ok ? linhas.reduce((s, l) => s + l.custo, 0) : null;
    const porcoes = f.rendimentoKg && f.porcaoG ? f.rendimentoKg * 1000 / f.porcaoG : null;
    return { linhas, falta, custo, porcoes, porPessoa: ok ? custo / porcoes : null };
  }

  /* Combustível = km ÷ km por litro × preço do litro. */
  function transporte(o) {
    return o.km != null && o.kmPorLitro && o.gasolinaLitro != null ? o.km / o.kmPorLitro * o.gasolinaLitro : null;
  }

  /* Um evento: pratos escolhidos × formato × convidados (uma das FAIXAS, que é como a equipe foi dimensionada). */
  function simular(base, { fichas: ids, formato, convidados }) {
    const falta = [];
    const fichas = (ids || []).map(id => (base.fichas || []).find(f => f.id === id)).filter(Boolean);
    if (!fichas.length) falta.push("Escolher os pratos");
    let comida = 0;
    fichas.forEach(f => {
      const c = calcularFicha(f, base.ingredientes);
      if (c.porPessoa == null) falta.push(`Ficha ${f.nome} incompleta`); else comida += c.porPessoa * convidados;
    });

    let equipe = 0;
    if (!(base.equipe || []).length) falta.push("Equipe");
    (base.equipe || []).forEach(e => {
      const n = (e[formato] || {})[String(convidados)];
      if (e.valor == null) falta.push(`Valor de ${e.funcao}`);
      if (n == null) falta.push(`Quantos ${e.funcao} (${FORMATOS[formato]}, ${convidados})`);
      if (e.valor != null && n != null) equipe += e.valor * n;
    });

    const o = base.operacao || {};
    const tr = transporte(o);
    if (o.gas == null) falta.push("Gás por evento");
    if (tr == null) falta.push("Transporte (gasolina, km/L e distância)");
    let outros = 0;
    (o.outros || []).forEach(x => {
      if (x.valor == null) falta.push(`Valor de ${x.nome}`);
      else outros += x.por === "pessoa" ? x.valor * convidados : x.valor;
    });
    falta.push(...(o.pendencias || []));

    if (falta.length) return { falta, total: null };
    const total = comida + equipe + (o.gas || 0) + tr + outros;
    return { falta, comida, equipe, gas: o.gas || 0, transporte: tr, outros, total, porPessoa: total / convidados, ...precoDeVenda(total, base.precos, convidados) };
  }

  /* Margem é sobre o PREÇO de venda (não acréscimo sobre o custo): preço = custo ÷ (1 − margem − taxas).
     Ex.: custo 70, margem 20%, taxas 10% → preço 100; sobram 20 de lucro e 10 de taxas. */
  function precoDeVenda(total, precos, convidados) {
    const m = precos && precos.margemPct, t = (precos && precos.taxasPct) || 0;
    if (m == null || m + t >= 100) return { preco: null };
    const preco = total / (1 - (m + t) / 100);
    return { preco, precoPessoa: preco / convidados, lucro: preco * m / 100, taxas: preco * t / 100 };
  }

  const api = { FATOR, FAMILIA, FAIXAS, FORMATOS, custoItem, calcularFicha, transporte, simular, precoDeVenda };
  if (typeof window !== "undefined") window.DLUH_CUSTOS = api;

  /* Autoteste: node ui_kits/admin/custos-calculo.js */
  if (typeof window === "undefined" && typeof require !== "undefined" && require.main === module) {
    const assert = require("assert");
    const ings = [{ id: "a", nome: "Arroz", preco: 2000, qtd: 5, unidade: "kg" }, { id: "c", nome: "Couve", preco: 550, qtd: 150, unidade: "g" },
      { id: "r", nome: "Massa rondelli", preco: 1100, qtd: 40, unidade: "un" }, { id: "m", nome: "Manteiga", preco: null, qtd: 1, unidade: "kg" }];
    assert.equal(custoItem({ qtd: 2, unidade: "kg" }, ings[0]).custo, 800);
    assert.equal(custoItem({ qtd: 50, unidade: "g" }, ings[0]).custo, 20);
    assert.equal(custoItem({ qtd: 150, unidade: "g" }, ings[1]).custo, 550);
    assert.equal(custoItem({ qtd: 40, unidade: "un" }, ings[2]).custo, 1100);
    assert.match(custoItem({ qtd: 1, unidade: "L" }, ings[0]).falta, /Unidade/);
    const f = { itens: [{ ing: "a", qtd: 2, unidade: "kg" }], rendimentoKg: 5, porcaoG: 100, pendencias: [] };
    const c = calcularFicha(f, ings);
    assert.equal(c.custo, 800); assert.equal(c.porcoes, 50); assert.equal(c.porPessoa, 16);
    assert.equal(calcularFicha({ ...f, itens: [...f.itens, { ing: "m", qtd: 80, unidade: "g" }] }, ings).custo, null);
    assert.equal(calcularFicha({ ...f, pendencias: ["Sal"] }, ings).porPessoa, null);
    const base = { ingredientes: ings, fichas: [{ id: "f", nome: "Arroz", ...f }], pacotes: [{ id: "p", nome: "T", fichas: ["f"] }],
      equipe: [{ funcao: "Garçom", valor: 18000, servido: { 50: 2 }, self: { 50: 1 } }],
      operacao: { gas: 3000, gasolinaLitro: 650, kmPorLitro: 11, km: 22, outros: [{ nome: "Lavagem", valor: 100, por: "pessoa" }], pendencias: [] },
      precos: { margemPct: 20, taxasPct: 10 } };
    const s = simular(base, { fichas: ["f"], formato: "servido", convidados: 50 });
    // 800 comida + 36000 equipe + 3000 gás + 1300 transporte + 5000 lavagem
    assert.deepEqual(s.falta, []); assert.equal(s.total, 46100); assert.equal(s.porPessoa, 922);
    assert.equal(Math.round(s.preco), 65857); assert.equal(Math.round(s.lucro), Math.round(s.preco * 0.2));
    assert.ok(simular(base, { fichas: ["f"], formato: "servido", convidados: 80 }).falta.some(x => /Garçom/.test(x)));
    assert.equal(precoDeVenda(70, { margemPct: 20, taxasPct: 10 }, 1).preco, 100);
    console.log("custos-calculo: ok");
  }
})();
