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

    /* Cota grátis: 50 mil leituras por dia, e cada abertura do admin relê o que assina. O dia a dia
       (Visão geral, Pedidos, Agenda) acompanha só os pedidos em aberto e os com entrega nos últimos
       ${DIAS} dias; a coleção inteira (~1.400, quase tudo histórico do Coda) só quando precisa:
       busca, abas Finalizados/Cancelados, Clientes e Financeiro. */
    const DIAS = 60;
    const ABERTOS = ["Aguardando confirmação", "Verificando Estoque", "Confirmado — Esperando pagamento", "Em produção", "Pronto", "Entregue — Esperando restante"];
    const corte = () => new Date(Date.now() - DIAS * 864e5);
    const pedidosRecentes = () => [
      F.query(F.collection(db, "sis_pedidos"), F.where("status", "in", ABERTOS)),
      F.query(F.collection(db, "sis_pedidos"), F.where("entrega.data", ">=", corte().toISOString().slice(0, 10)))
    ];
    const CONSULTAS = {
      fila: () => F.query(F.collection(db, "sis_pedidos"), F.where("status", "==", "Em produção")),
      pedidos: pedidosRecentes,
      agenda: pedidosRecentes,
      pedidosTodos: () => F.collection(db, "sis_pedidos"),
      produtos: () => F.collection(db, "sis_produtos"),
      recheios: () => F.collection(db, "sis_catalogo"),
      todosPagamentos: () => F.collection(db, "sis_pagamentos"),
      pagamentosRecentes: () => F.query(F.collection(db, "sis_pagamentos"), F.where("em", ">=", corte())),
      financeiro: () => F.collection(db, "sis_financeiro"),
      atendimentos: () => F.collection(db, "sis_atendimentos"),
      // Visão geral: só os boletos com parcela em aberto (o pai guarda pago = todas pagas).
      boletosAbertos: () => F.query(F.collection(db, "sis_financeiro"), F.where("tipo", "==", "boleto"), F.where("pago", "==", false)),
      pagamentos: pedidoId => F.query(F.collection(db, "sis_pagamentos"), F.where("pedidoId", "==", pedidoId))
    };

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
        /* Várias consultas somadas numa lista só (sem repetir o pedido que casa com duas). Só
           entrega depois que todas responderam pela primeira vez. */
        const partes = c.map(() => null), cache = c.map(() => true);
        const juntar = () => {
          if (partes.some(p => !p)) return;
          const porId = new Map();
          partes.forEach(p => p.forEach(d => porId.set(d.id, d)));
          aoDados([...porId.values()], { doCache: cache.some(Boolean) });
        };
        const parar = c.map((q, i) => F.onSnapshot(q, { includeMetadataChanges: true }, snap => {
          partes[i] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          cache[i] = snap.metadata.fromCache;
          juntar();
        }, aoErro));
        return () => parar.forEach(p => p());
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
