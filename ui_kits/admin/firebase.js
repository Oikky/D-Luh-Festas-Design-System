/* Ligação com o sistema de verdade, só quando a página abre com ?fonte=firebase.
   Lê direto do Firestore (tempo real, com cache offline) e escreve pelo Worker dluh-api.
   Sem o parâmetro, nada aqui roda e o admin segue com os dados de exemplo de data.js. */
if (new URLSearchParams(location.search).get("fonte") === "firebase") {
  const V = "10.12.0";
  const API = "https://dluh-api.sitedluh.workers.dev";
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

    const CONSULTAS = {
      fila: () => F.query(F.collection(db, "sis_pedidos"), F.where("status", "==", "Em produção")),
      pedidos: () => F.collection(db, "sis_pedidos"),
      agenda: () => F.collection(db, "sis_pedidos"),
      produtos: () => F.collection(db, "sis_produtos"),
      recheios: () => F.collection(db, "sis_catalogo"),
      pagamentos: pedidoId => F.query(F.collection(db, "sis_pagamentos"), F.where("pedidoId", "==", pedidoId))
    };

    return {
      entrar: () => A.signInWithPopup(auth, new A.GoogleAuthProvider()),
      sair: () => A.signOut(auth),
      aoMudarUsuario: cb => A.onAuthStateChanged(auth, cb),

      /* Chama aoDados a cada mudança, com { doCache: true } quando o que chegou é do cache local
         (sem conexão com o servidor). Devolve a função que para de ouvir. */
      assinar(nome, aoDados, aoErro, param) {
        return F.onSnapshot(CONSULTAS[nome](param), { includeMetadataChanges: true },
          snap => aoDados(snap.docs.map(d => ({ id: d.id, ...d.data() })), { doCache: snap.metadata.fromCache }),
          aoErro);
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
