/* Ligação com o sistema de verdade, só quando a página abre com ?fonte=firebase.
   Lê direto do Firestore (tempo real, com cache offline) e escreve pelo Worker dluh-api.
   Sem o parâmetro, nada aqui roda e o admin segue com os dados de exemplo de data.js. */
if (new URLSearchParams(location.search).get("fonte") === "firebase") {
  const V = "10.12.0";
  const API = "https://api.dluhfestas.com";
  const CONFIG = {
    apiKey: "AIzaSyCV7LcTZmCE9MpezCvBah0hHQ245WYcixs",
    authDomain: "dluh-festas.firebaseapp.com",
    projectId: "dluh-festas",
    appId: "1:460615557884:web:5162c5aba8467ddb57ed79"
  };

  window.DLUH_FB = (async () => {
    const [{ initializeApp }, A, F] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
      import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`)
    ]);
    const app = initializeApp(CONFIG);
    const auth = A.getAuth(app);
    await A.setPersistence(auth, A.browserLocalPersistence);
    // Cache no aparelho: sem internet, a tela mostra a última lista recebida em vez de ficar em branco.
    const db = F.initializeFirestore(app, { localCache: F.persistentLocalCache() });

    /* Cada leitura conta (Blaze: R$ por leitura acima de 50 mil/dia), e cada abertura do admin relê
       o que assina. O dia a dia (Visão geral, Pedidos, Agenda) acompanha só os pedidos em aberto e
       os com entrega nos últimos ${DIAS} dias. A coleção inteira (~1.400, quase tudo histórico do
       Coda, que não muda) vem do servidor no máximo uma vez por dia por aparelho e fica no cache;
       por cima dela, ao vivo, só o que está em aberto, é recente ou mudou hoje. */
    const DIAS = 60;
    const ABERTOS = ["Aguardando confirmação", "Verificando Estoque", "Confirmado — Esperando pagamento", "Em produção", "Pronto", "Entregue — Esperando restante", "Fiado"];
    const corte = () => new Date(Date.now() - DIAS * 864e5);
    const pedidosRecentes = () => [
      F.query(F.collection(db, "sis_pedidos"), F.where("status", "in", ABERTOS)),
      F.query(F.collection(db, "sis_pedidos"), F.where("entrega.data", ">=", corte().toISOString().slice(0, 10)))
    ];
    const inicioDoDia = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
    /* Coleção inteira, do servidor uma vez por dia (por aparelho); no resto do dia, do cache. */
    const diario = colecao => ({ diario: colecao });
    const pedidosTodos = () => [
      diario("sis_pedidos"),
      ...pedidosRecentes(),
      F.query(F.collection(db, "sis_pedidos"), F.where("atualizadoEm", ">=", inicioDoDia()))
    ];
    const CONSULTAS = {
      fila: () => F.query(F.collection(db, "sis_pedidos"), F.where("status", "in", ["Em produção", "Fiado"])),
      pedidos: pedidosRecentes,
      agenda: pedidosRecentes,
      pedidosTodos,
      produtos: () => F.collection(db, "sis_produtos"),
      recheios: () => F.collection(db, "sis_catalogo"),
      todosPagamentos: () => [diario("sis_pagamentos"), F.query(F.collection(db, "sis_pagamentos"), F.where("em", ">=", corte()))],
      pagamentosRecentes: () => F.query(F.collection(db, "sis_pagamentos"), F.where("em", ">=", corte())),
      financeiro: () => F.collection(db, "sis_financeiro"),
      atendimentos: () => F.collection(db, "sis_atendimentos"),
      // Visão geral: só os boletos com parcela em aberto (o pai guarda pago = todas pagas).
      boletosAbertos: () => F.query(F.collection(db, "sis_financeiro"), F.where("tipo", "==", "boleto"), F.where("pago", "==", false)),
      pagamentos: pedidoId => F.query(F.collection(db, "sis_pagamentos"), F.where("pedidoId", "==", pedidoId))
    };

    /* A coleção inteira: do cache se já veio do servidor hoje neste aparelho; senão, do servidor.
       Duas telas pedindo ao mesmo tempo dividem a mesma leitura. */
    const emCurso = {};
    const lerDiario = colecao => emCurso[colecao] || (emCurso[colecao] = (async () => {
      const chave = "dluh-diario-" + colecao, hoje = inicioDoDia().toDateString();
      let marca = null;
      try { marca = localStorage.getItem(chave); } catch (e) {}
      const ref = F.collection(db, colecao);
      if (marca === hoje) {
        try {
          const snap = await F.getDocsFromCache(ref);
          if (snap.size) return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) { /* cache vazio ou apagado: vai ao servidor */ }
      }
      const snap = await F.getDocsFromServer(ref);
      try { localStorage.setItem(chave, hoje); } catch (e) {}
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    })().finally(() => { delete emCurso[colecao]; }));

    return {
      entrar: () => A.signInWithPopup(auth, new A.GoogleAuthProvider()),
      sair: () => A.signOut(auth),
      aoMudarUsuario: cb => A.onAuthStateChanged(auth, cb),

      /* Chama aoDados a cada mudança, com { doCache: true } quando o que chegou é do cache local
         (sem conexão com o servidor). Devolve a função que para de ouvir. */
      assinar(nome, aoDados, aoErro, param) {
        const c = CONSULTAS[nome](param);
        if (!Array.isArray(c)) return F.onSnapshot(c, { includeMetadataChanges: true },
          snap => aoDados(snap.docs.map(d => ({ id: d.id, ...d.data() })), { doCache: snap.metadata.fromCache }),
          aoErro);
        /* Várias consultas somadas numa lista só (sem repetir o pedido que casa com duas; a mais
           nova da lista ganha, então o "diário" vem primeiro e o ao vivo por cima). Só entrega
           depois que todas responderam pela primeira vez. */
        const partes = c.map(() => null), cache = c.map(() => true);
        /* Sumiu de uma escuta ao vivo (entre duas respostas do servidor, nesta sessão) e não está em
           nenhuma outra: foi apagado. O "diário" ainda tem a cópia de manhã, então ela sai também.
           Mudou de status continua aparecendo pela escuta "mudou hoje". */
        const removidos = new Set(), doServidor = c.map(() => null);
        const juntar = () => {
          if (partes.some(p => !p)) return;
          const porId = new Map(), ao = new Set();
          partes.forEach((p, i) => p.forEach(d => { porId.set(d.id, d); if (!c[i].diario) ao.add(d.id); }));
          removidos.forEach(id => { if (!ao.has(id)) porId.delete(id); else removidos.delete(id); });
          aoDados([...porId.values()], { doCache: cache.some(Boolean) });
        };
        let vivo = true;
        const parar = c.map((q, i) => q.diario ? (lerDiario(q.diario).then(docs => {
          if (!vivo) return;
          partes[i] = docs; cache[i] = false; juntar();
        }, e => vivo && aoErro(e)), () => {}) : F.onSnapshot(q, { includeMetadataChanges: true }, snap => {
          if (!snap.metadata.fromCache) {
            const agora = new Set(snap.docs.map(d => d.id));
            if (doServidor[i]) doServidor[i].forEach(id => { if (!agora.has(id)) removidos.add(id); });
            doServidor[i] = agora;
          }
          partes[i] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          cache[i] = snap.metadata.fromCache;
          juntar();
        }, aoErro));
        return () => { vivo = false; parar.forEach(p => p()); };
      },

      async chamar(acao, dados) {
        if (!auth.currentUser) throw Object.assign(new Error("sem login"), { status: 401 });
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${API}/api/${acao}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(dados)
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw Object.assign(new Error(json.erro || String(res.status)), { status: res.status, mensagem: json.erro });
        return json;
      }
    };
  })();
}
