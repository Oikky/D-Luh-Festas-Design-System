function useCompact() {
  const mq = "(max-width: 760px)";
  const [c, setC] = React.useState(() => window.matchMedia(mq).matches);
  React.useEffect(() => {
    const m = window.matchMedia(mq), f = e => setC(e.matches);
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  return c;
}

function App() {
  const [view, setView] = React.useState("visao");
  /* O que abrir na tela de destino: onView("financeiro", { boleto, n }) abre o boleto com a parcela marcada. */
  const [alvo, setAlvo] = React.useState(null);
  const ir = (v, a = null) => { setView(v); setAlvo(a); };
  const compact = useCompact();
  const [theme, setTheme] = React.useState("dark");
  const [q, setQ] = React.useState("");
  /* Botão voltar do celular: fecha o que estiver aberto por cima; sem nada aberto, volta para a
     Visão geral; só da Visão geral ele sai do app. */
  window.DLuhFestasDesignSystem_c861a2.useVoltar(view !== "visao", () => ir("visao"));
  const Screen = { visao: window.VisaoGeral, pedidos: window.Pedidos, agenda: window.Agenda, cozinha: window.Cozinha, produtos: window.Produtos, clientes: window.TelaClientes, financeiro: window.Financeiro }[view];
  return (
    <div style={{ height: "100dvh" }}>
      <window.Shell view={view} onView={ir} compact={compact} theme={theme}
        onTheme={() => setTheme(theme === "dark" ? "light" : "dark")} q={q} onQ={setQ}>
        {Screen ? <Screen compact={compact} q={q} onQ={setQ} onView={ir} alvo={alvo} /> : null}
      </window.Shell>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<window.Portao><App /></window.Portao>);
