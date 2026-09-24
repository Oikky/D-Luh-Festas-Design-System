function App() {
  const [view, setView] = React.useState("visao");
  const [compact, setCompact] = React.useState(false);
  const [theme, setTheme] = React.useState("light");
  const [q, setQ] = React.useState("");
  const Screen = { visao: window.VisaoGeral, pedidos: window.Pedidos, agenda: window.Agenda, cozinha: window.Cozinha, contratos: window.Contratos }[view];
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#e9e4de" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", flex: "0 0 auto",
        background: "#1a1a1a", color: "#fff", fontFamily: "system-ui, sans-serif", fontSize: 12
      }}>
        <b style={{ fontWeight: 600, letterSpacing: .2 }}>D'Luh Admin — UI kit</b>
        <span style={{ opacity: .5 }}>protótipo navegável</span>
        <div style={{ flex: 1 }} />
        {[["Desktop", false], ["Mobile", true]].map(([l, v]) => (
          <button key={l} onClick={() => setCompact(v)} style={{
            padding: "5px 12px", borderRadius: 999, cursor: "pointer", fontSize: 12, fontWeight: 600,
            border: "1px solid " + (compact === v ? "transparent" : "rgba(255,255,255,.22)"),
            background: compact === v ? "#c0725a" : "transparent", color: "#fff"
          }}>{l}</button>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", justifyContent: "center", padding: compact ? 14 : 0 }}>
        <div style={{
          width: compact ? 390 : "100%", height: "100%",
          borderRadius: compact ? 28 : 0, overflow: "hidden",
          boxShadow: compact ? "0 18px 50px rgba(0,0,0,.28)" : "none",
          border: compact ? "1px solid rgba(0,0,0,.18)" : "none"
        }}>
          <window.Shell view={view} onView={setView} compact={compact} theme={theme}
            onTheme={() => setTheme(theme === "dark" ? "light" : "dark")} q={q} onQ={setQ}>
            {Screen ? <Screen compact={compact} q={q} /> : null}
          </window.Shell>
        </div>
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
