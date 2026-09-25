import React from "react";
import { Icon } from "../core/Icon.jsx";

export function SearchInput({ value, onChange, onClear, placeholder = "Buscar por nome, telefone, valor, ID…", style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0,
      background: "var(--color-surface-2)",
      border: `var(--border-hairline) solid ${focus ? "var(--color-accent)" : "var(--color-border)"}`,
      borderRadius: "var(--radius-pill)", padding: "9px 14px",
      boxShadow: focus ? "var(--focus-ring)" : "none", transition: "var(--transition-control)", ...style
    }}>
      <Icon name="search" size={17} style={{ color: "var(--text-muted)" }} />
      <input value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} {...rest}
        style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-ui)", fontSize: "var(--fs-body-s)", color: "var(--text-strong)" }} />
      {value ? <button type="button" onClick={onClear} aria-label="Limpar busca"
        style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 0 }}>
        <Icon name="x" size={16} />
      </button> : null}
    </div>
  );
}
