const ES = window.DLuhFestasDesignSystem_c861a2;

/* What went wrong, in the shop's words. Short enough to follow a colon in a one-line toast. */
const MOTIVO = {
  offline: "sem internet",
  rede: "sem conexão com o servidor",
  timeout: "o servidor não respondeu",
  servidor: "o servidor recusou",
  sessao: "o login expirou, entre de novo",
  "sem-permissao": "este login não tem acesso",
  "nao-ligada": "esta ação ainda não foi ligada ao sistema novo"
};
/* A refusal from the server ("Pedido PED-3001 não está em produção") is already in the shop's words. */
const motivo = e => (e && e.mensagem) || MOTIVO[e && e.tipo] || "erro inesperado";

/* The long form, for a screen that could not load at all. */
const EXPLICA = {
  offline: "O aparelho está sem internet. Confira o Wi-Fi ou os dados móveis e tente de novo.",
  rede: "O servidor não respondeu à chamada. Pode ser a conexão ou uma instabilidade do lado dele.",
  timeout: "A resposta demorou demais e a espera foi interrompida. Tente de novo em instantes.",
  servidor: "O servidor recebeu o pedido mas não aceitou. Tente de novo; se continuar, avise quem cuida do sistema.",
  sessao: "O login expirou. Recarregue a página e entre de novo com o Google.",
  "sem-permissao": "Este login do Google não está na lista da equipe. Entre com a conta da D'Luh ou peça acesso a quem cuida do sistema.",
  "nao-ligada": "Esta tela ainda mostra só dados de exemplo e não foi ligada ao sistema novo. Por enquanto só a Cozinha está ligada."
};

/* One toast per screen. A newer toast replaces the older one and restarts its clock; errors stay
   longer and are announced assertively. */
function useToast() {
  const [toast, setToast] = React.useState(null);
  const timer = React.useRef(null);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const mostrar = (msg, tom = "success") => {
    clearTimeout(timer.current);
    setToast({ msg, tom, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), tom === "danger" ? 5000 : 2600);
  };
  const node = toast ? <ES.Toast key={toast.key} tone={toast.tom} icon={toast.tom === "danger" ? "circle-alert" : "check"}>{toast.msg}</ES.Toast> : null;
  return [node, mostrar];
}

/* Loads once on mount; `tentar` runs it again. `dados` stays null until the first success. */
function useCarga(carregar) {
  const [st, setSt] = React.useState({ estado: "carregando", dados: null, erro: null });
  const vivo = React.useRef(true);
  const rodar = React.useCallback(() => {
    setSt(s => ({ ...s, estado: "carregando", erro: null }));
    carregar().then(
      dados => vivo.current && setSt({ estado: "pronto", dados, erro: null }),
      erro => vivo.current && setSt(s => ({ ...s, estado: "erro", erro }))
    );
  }, []);
  React.useEffect(() => { vivo.current = true; rodar(); return () => { vivo.current = false; }; }, []);
  return { ...st, tentar: rodar, setDados: fn => setSt(s => ({ ...s, dados: typeof fn === "function" ? fn(s.dados) : fn })) };
}

/* Same shape as useCarga, but stays subscribed: every change on the server re-renders. `doCache`
   is true while what's on screen came from the device cache (no connection to the server). */
function useAoVivo(colecao) {
  const [st, setSt] = React.useState({ estado: "carregando", dados: null, erro: null, doCache: false });
  const [volta, setVolta] = React.useState(0);
  React.useEffect(() => {
    setSt(s => ({ ...s, estado: "carregando", erro: null }));
    return window.DLUH_API.assinar(colecao,
      (dados, meta) => setSt({ estado: "pronto", dados, erro: null, doCache: !!(meta && meta.doCache) }),
      erro => setSt(s => ({ ...s, estado: "erro", erro })));
  }, [colecao, volta]);
  return { ...st, tentar: () => setVolta(v => v + 1), setDados: fn => setSt(s => ({ ...s, dados: typeof fn === "function" ? fn(s.dados) : fn })) };
}

/* Every write goes through here: one at a time (a second tap while pending does nothing), the
   button that started it shows a spinner, success toasts in past tense, failure names the cause
   and leaves the data as it was. */
function useAcao(mostrar) {
  const [pendente, setPendente] = React.useState(null);
  const emCurso = React.useRef(false);
  /* `pedido` ({ acao, dados }) is what the real system needs; the demo ignores it. */
  const executar = async (chave, { ok, falhou }, aplicar, pedido) => {
    if (emCurso.current) return false;
    emCurso.current = true; setPendente(chave);
    try {
      await window.DLUH_API.escrever(chave, pedido);
      if (aplicar) aplicar();
      if (ok) mostrar(ok);
      return true;
    } catch (e) {
      mostrar(`${falhou}: ${motivo(e)}`, "danger");
      return false;
    } finally {
      emCurso.current = false; setPendente(null);
    }
  };
  return [executar, pendente];
}

/* The spinner waits 300ms before showing, so a fast answer never flashes a loading state. */
function Carregando({ oque }) {
  const [ver, setVer] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setVer(true), 300); return () => clearTimeout(t); }, []);
  return <div role="status" aria-live="polite" style={{ minHeight: 160 }}>
    {ver ? <ES.Spinner size={28} label={`Carregando ${oque}…`} /> : null}
  </div>;
}

function ErroCarga({ erro, oque, onTentar }) {
  return <ES.Card padded={false}>
    <div role="alert">
      <ES.EmptyState icon={erro && erro.tipo === "offline" ? "wifi-off" : "cloud-off"} title={`Não deu pra carregar ${oque}`}
        description={EXPLICA[erro && erro.tipo] || "Algo saiu do previsto ao buscar os dados. Tente de novo."}
        action={<ES.Button icon="rotate-ccw" onClick={onTentar}>Tentar de novo</ES.Button>} />
    </div>
  </ES.Card>;
}

/* In the real system nothing shows until someone from the team signs in with Google. */
function Portao({ children }) {
  const real = window.DLUH_API.modo === "firebase";
  const [st, setSt] = React.useState({ fb: null, usuario: undefined, erro: null });
  React.useEffect(() => {
    if (!real) return;
    let parar = () => {};
    window.DLUH_FB.then(fb => { setSt(s => ({ ...s, fb })); parar = fb.aoMudarUsuario(u => setSt(s => ({ ...s, usuario: u }))); },
      () => setSt(s => ({ ...s, erro: "Não deu pra conectar ao Firebase. Confira a internet e recarregue a página." })));
    return () => parar();
  }, []);
  if (!real || st.usuario) return children;
  const entrar = () => st.fb.entrar().catch(e => setSt(s => ({ ...s, erro: e.code === "auth/popup-closed-by-user" ? null : "Não deu pra entrar: " + (e.code || e.message) })));
  return <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 16, background: "var(--color-bg)" }}>
    <ES.Card style={{ maxWidth: 380, width: "100%" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-heading)", fontWeight: "var(--fw-semibold)" }}>D'Luh — painel</div>
      <div style={{ fontSize: "var(--fs-body-s)", color: "var(--text-muted)", margin: "8px 0 20px", lineHeight: "var(--lh-normal)" }}>
        Entre com a conta Google da equipe para ver os pedidos.
      </div>
      {st.erro ? <div role="alert" style={{ fontSize: "var(--fs-body-s)", color: "var(--action-danger)", marginBottom: 12 }}>{st.erro}</div> : null}
      {st.fb && st.usuario === undefined ? <ES.Spinner size={24} label="Verificando login…" />
        : <ES.Button size="lg" icon="log-in" disabled={!st.fb} onClick={entrar} style={{ width: "100%" }}>Entrar com Google</ES.Button>}
    </ES.Card>
  </div>;
}

/* Money that may be missing: a null or empty value reads as a dash, never as R$ 0,00. */
const dinheiro = v => v == null || v === "" ? "—" : v;

Object.assign(window, { useToast, useCarga, useAoVivo, useAcao, Carregando, ErroCarga, Portao, motivo, dinheiro });
