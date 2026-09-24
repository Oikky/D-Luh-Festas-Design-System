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
  const compact = useCompact();
  const [theme, setTheme] = React.useState("light");
  const [q, setQ] = React.useState("");
  const Screen = { visao: window.VisaoGeral, pedidos: window.Pedidos, agenda: window.Agenda, cozinha: window.Cozinha, contratos: window.Contratos }[view];
  return (
    <div style={{ height: "100dvh" }}>
      <window.Shell view={view} onView={setView} compact={compact} theme={theme}
        onTheme={() => setTheme(theme === "dark" ? "light" : "dark")} q={q} onQ={setQ}>
        {Screen ? <Screen compact={compact} q={q} /> : null}
      </window.Shell>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);