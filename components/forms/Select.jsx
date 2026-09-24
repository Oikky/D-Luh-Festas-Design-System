import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Select({ options = [], accent = false, size = "md", style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <span style={{
      position: "relative", display: "inline-flex", alignItems: "center", width: "100%",
      background: "var(--color-surface)",
      border: `${accent ? "var(--border-control)" : "var(--border-hairline)"} solid ${accent || focus ? "var(--color-accent)" : "var(--color-border)"}`,
      borderRadius: "var(--radius-xs)", boxShadow: focus ? "var(--focus-ring)" : "none", transition: "var(--transition-control)", ...style
    }}>
      <select {...rest}
        onFocus={e => { setFocus(true); rest.onFocus && rest.onFocus(e); }}
        onBlur={e => { setFocus(false); rest.onBlur && rest.onBlur(e); }}
        style={{
        appearance: "none", width: "100%", border: "none", outline: "none", background: "transparent",
        padding: size === "sm" ? "7px 30px 7px 9px" : "9px 32px 9px 11px", cursor: "pointer",
        fontFamily: "var(--font-ui)", fontSize: "var(--fs-body-s)",
        fontWeight: accent ? "var(--fw-semibold)" : "var(--fw-regular)",
        color: accent ? "var(--text-accent)" : "var(--text-strong)"
      }}>
        {options.map(o => typeof o === "string"
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <Icon name="chevron-down" size={15} style={{ position: "absolute", right: 9, pointerEvents: "none", color: accent ? "var(--color-accent)" : "var(--text-muted)" }} />
    </span>
  );
}
