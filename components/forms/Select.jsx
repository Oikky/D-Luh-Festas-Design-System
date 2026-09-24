import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Select({ options = [], accent = false, size = "md", style, ...rest }) {
  return (
    <span style={{
      position: "relative", display: "inline-flex", alignItems: "center", width: "100%",
      background: "var(--color-surface)",
      border: `${accent ? "var(--border-control)" : "var(--border-hairline)"} solid ${accent ? "var(--color-accent)" : "var(--color-border)"}`,
      borderRadius: "var(--radius-xs)", ...style
    }}>
      <select {...rest} style={{
        appearance: "none", width: "100%", border: "none", outline: "none", background: "transparent",
        padding: size === "sm" ? "7px 30px 7px 9px" : "9px 32px 9px 11px", cursor: "pointer",
        fontFamily: "var(--font-ui)", fontSize: "var(--fs-body-s)",
        fontWeight: accent ? "var(--fw-semibold)" : "var(--fw-regular)",
        color: accent ? "var(--color-accent)" : "var(--text-strong)"
      }}>
        {options.map(o => typeof o === "string"
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <Icon name="chevron-down" size={15} style={{ position: "absolute", right: 9, pointerEvents: "none", color: accent ? "var(--color-accent)" : "var(--text-muted)" }} />
    </span>
  );
}
