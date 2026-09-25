import React from "react";

export function Input({ prefix, suffix, invalid, size = "md", style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const pad = size === "sm" ? "7px 9px" : "9px 11px";
  return (
    <span style={{
      display: "flex", alignItems: "center", gap: 6, background: "var(--color-surface)",
      border: `var(--border-hairline) solid ${invalid ? "var(--action-danger)" : focus ? "var(--color-accent)" : "var(--color-border)"}`,
      borderRadius: "var(--radius-xs)", padding: pad, transition: "var(--transition-control)",
      boxShadow: focus ? "var(--focus-ring)" : "none", ...style
    }}>
      {prefix ? <span style={{ color: "var(--text-muted)", display: "flex" }}>{prefix}</span> : null}
      <input onFocus={e => { setFocus(true); rest.onFocus && rest.onFocus(e); }}
        onBlur={e => { setFocus(false); rest.onBlur && rest.onBlur(e); }}
        {...rest}
        style={{
          flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent",
          fontFamily: "var(--font-ui)", fontSize: "var(--fs-body-s)", color: "var(--text-strong)"
        }} />
      {suffix ? <span style={{ color: "var(--text-muted)", display: "flex", fontSize: "var(--fs-tiny)" }}>{suffix}</span> : null}
    </span>
  );
}
