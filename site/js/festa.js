/* Monte sua festa: o cliente conta a festa e escolhe os pratos do buffet. O cardápio (sem preços)
   vem de sis_catalogo/buffet, que o admin publica pela tela Custos; o Worker (/site/festa) confere
   tudo de novo — pratos e limites — e põe a festa no funil de Atendimentos. */
(function () {
  "use strict";
  const D = window.DLuh;
  const API = window.DLuhAPI;
  if (!D || !API) return;

  const URL_CARDAPIO = "https://firestore.googleapis.com/v1/projects/dluh-festas/databases/(default)/documents/sis_catalogo/buffet";
  const ORDEM = ["Entrada", "Arroz", "Massa", "Proteína", "Guarnição", "Salada"];
  const PLURAL = { Entrada: "entradas", Arroz: "arroz", Massa: "massas", Proteína: "carnes", Guarnição: "acompanhamentos", Salada: "saladas", Regional: "pratos mineiros" };
  const NOME_TIPO = { Entrada: "Entradas", Arroz: "Arroz", Massa: "Massas", Proteína: "Carnes", Guarnição: "Acompanhamentos", Salada: "Saladas" };
  const AVULSO = "mineiro"; // pacote que soma a qualquer linha

  const $ = id => document.getElementById(id);
  const form = $("form-festa");
  const caixa = $("cardapio");
  let cardapio = null;

  /* REST do Firestore → objeto simples. */
  const valor = v => !v ? undefined : "stringValue" in v ? v.stringValue : "integerValue" in v ? Number(v.integerValue)
    : "doubleValue" in v ? v.doubleValue : "nullValue" in v ? null : "arrayValue" in v ? (v.arrayValue.values || []).map(valor)
    : "mapValue" in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, valor(x)])) : undefined;

  async function carregar() {
    try {
      const r = await fetch(URL_CARDAPIO);
      if (!r.ok) throw new Error(String(r.status));
      const doc = await r.json();
      cardapio = Object.fromEntries(Object.entries(doc.fields || {}).map(([k, v]) => [k, valor(v)]));
      if (!(cardapio.pacotes || []).length) throw new Error("vazio");
      desenhar();
    } catch (e) {
      caixa.innerHTML = `<p class="aviso aviso--erro">${D.icone("alerta")} Não deu pra carregar o cardápio.
        <a class="link" href="${D.linkWhats("Oi! Quero um orçamento de buffet para a minha festa.")}" target="_blank" rel="noopener">Fale com a gente no WhatsApp</a>.</p>`;
    }
  }

  const linhas = () => cardapio.pacotes.filter(p => p.id !== AVULSO && p.pratos.length);
  const avulso = () => cardapio.pacotes.find(p => p.id === AVULSO && p.pratos.length);
  const limite = tipo => (cardapio.limites || {})[tipo] ?? null;

  function grupo(tipo, pratos, titulo) {
    const max = limite(tipo);
    return `<fieldset class="escolha" data-tipo="${D.esc(tipo)}">
      <legend>${D.esc(titulo || NOME_TIPO[tipo] || tipo)}${max ? ` <small>· escolha até ${max}</small>` : ""}</legend>
      <div class="chips">${pratos.map(p => `<label class="chip"><input type="checkbox" name="pratos" value="${D.esc(p.id)}" data-tipo="${D.esc(tipo)}">${D.esc(p.nome)}</label>`).join("")}</div>
    </fieldset>`;
  }

  function desenhar() {
    const ls = linhas(), av = avulso();
    caixa.innerHTML = `
      <fieldset class="opcoes-modo opcoes-linha">
        <legend class="sr-only">Linha do cardápio</legend>
        ${ls.map((p, i) => `<label class="opcao-modo"><input type="radio" name="pacote" value="${D.esc(p.id)}" ${i === 0 ? "checked" : ""}>
          <strong>${D.esc(p.nome)}</strong><span>${p.pratos.length} opções</span></label>`).join("")}
      </fieldset>
      <div class="festa__pratos" id="pratos-linha"></div>
      ${av ? `<div class="festa__avulso">${grupo("Regional", av.pratos, av.nome)}</div>` : ""}`;
    desenharLinha();
  }

  function desenharLinha() {
    const p = cardapio.pacotes.find(x => x.id === form.pacote.value);
    const tipos = [...new Set(p.pratos.map(x => x.tipo))].sort((a, b) => (ORDEM.indexOf(a) + 1 || 99) - (ORDEM.indexOf(b) + 1 || 99));
    $("pratos-linha").innerHTML = tipos.map(t => grupo(t, p.pratos.filter(x => x.tipo === t))).join("");
    travarLimites();
  }

  /* Chegou no limite do tipo: os outros pratos daquele tipo ficam apagados até desmarcar um. */
  function travarLimites() {
    caixa.querySelectorAll("fieldset.escolha").forEach(fs => {
      const max = limite(fs.dataset.tipo);
      const caixas = [...fs.querySelectorAll("input")];
      const n = caixas.filter(c => c.checked).length;
      caixas.forEach(c => { c.disabled = !!max && n >= max && !c.checked; });
    });
  }

  caixa.addEventListener("change", e => {
    if (e.target.name === "pacote") desenharLinha();
    if (e.target.name === "pratos") { travarLimites(); erro("f-pratos", ""); }
  });

  form.addEventListener("change", e => {
    if (e.target.name === "local") $("campo-endereco").hidden = form.local.value !== "outro";
    if (e.target.id === "f-tipo") $("campo-outra").hidden = e.target.value !== "outra";
  });
  $("f-tel").addEventListener("input", e => { e.target.value = D.mascaraTelefone(e.target.value); });

  // Amanhã em diante (mesma regra do Worker).
  const amanha = new Date(Date.now() - 3 * 3600e3 + 864e5).toISOString().slice(0, 10);
  $("f-data").min = amanha;

  function erro(id, msg) {
    const el = $(id + "-erro"), campo = $(id);
    if (el) { el.textContent = msg; el.hidden = !msg; }
    if (campo) campo.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  function coletar() {
    const tipo = $("f-tipo").value === "outra" ? $("f-outra").value.trim() : $("f-tipo").value;
    return {
      tipoEvento: tipo, data: $("f-data").value, inicio: $("f-hora").value, convidados: Number($("f-conv").value),
      local: form.local.value, endereco: $("f-end").value.trim(), formato: form.formato.value,
      pacote: form.pacote ? form.pacote.value : "",
      pratos: [...caixa.querySelectorAll('input[name="pratos"]:checked')].map(c => c.value),
      extras: [...form.querySelectorAll('input[name="extras"]:checked')].map(c => c.value),
      restricoes: $("f-restr").value.trim(), obs: $("f-obs").value.trim(),
      nome: $("f-nome").value.trim(), telefone: D.soDigitos($("f-tel").value)
    };
  }

  function validar(d) {
    const ok = [
      erro("f-tipo", d.tipoEvento ? "" : "Escolha o tipo de festa"),
      erro("f-data", !d.data ? "Escolha o dia" : d.data < amanha ? "A partir de amanhã" : ""),
      erro("f-conv", Number.isInteger(d.convidados) && d.convidados >= 10 && d.convidados <= 1000 ? "" : "De 10 a 1000 convidados"),
      erro("f-end", d.local === "outro" && !d.endereco ? "Diga onde vai ser a festa" : ""),
      erro("f-pratos", !cardapio ? "" : d.pratos.length ? "" : "Marque os pratos que você quer"),
      erro("f-nome", d.nome ? "" : "Diga seu nome"),
      erro("f-tel", d.telefone.length >= 10 ? "" : "WhatsApp com DDD")
    ];
    return ok.every(Boolean);
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    $("f-erro-geral").innerHTML = "";
    const d = coletar();
    if (!cardapio) { $("f-erro-geral").innerHTML = `<p class="aviso aviso--erro">${D.icone("alerta")} O cardápio não carregou. Recarregue a página.</p>`; return; }
    if (!validar(d)) { const primeiro = form.querySelector('[aria-invalid="true"], .campo__erro:not([hidden])'); if (primeiro) primeiro.scrollIntoView({ block: "center", behavior: "smooth" }); return; }
    const botao = $("f-enviar");
    botao.disabled = true; botao.textContent = "Mandando…";
    try {
      await API.pedirFesta(d);
      form.hidden = true;
      $("r-tel").textContent = D.mascaraTelefone(d.telefone);
      const ok = $("recebido");
      ok.hidden = false; ok.focus(); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      $("f-erro-geral").innerHTML = `<p class="aviso aviso--erro" role="alert">${D.icone("alerta")} ${D.esc(err.codigo === "rede" ? "Sem conexão. Confira a internet e tente de novo." : err.message)}</p>`;
      botao.disabled = false; botao.innerHTML = `Mandar para a D'Luh ${D.icone("seta")}`;
    }
  });

  carregar();
})();
