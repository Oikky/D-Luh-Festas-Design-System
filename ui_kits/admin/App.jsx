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
  // In the real system Visão geral isn't wired yet, so it opens on the kitchen.
  const [view, setView] = React.useState(window.DLUH_API.modo === "firebase" ? "cozinha" : "visao");
  const compact = useCompact();
  const [theme, setTheme] = React.useState("dark");
  const [q, setQ] = React.useState("");
  const Screen = { visao: window.VisaoGeral, pedidos: window.Pedidos, agenda: window.Agenda, cozinha: window.Cozinha, produtos: window.Produtos, financeiro: window.Financeiro }[view];
  return (
    <div style={{ height: "100dvh" }}>
      <window.Shell view={view} onView={setView} compact={compact} theme={theme}
        onTheme={() => setTheme(theme === "dark" ? "light" : "dark")} q={q} onQ={setQ}>
        {Screen ? <Screen compact={compact} q={q} onView={setView} /> : null}
      </window.Shell>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<window.Portao><App /></window.Portao>);
