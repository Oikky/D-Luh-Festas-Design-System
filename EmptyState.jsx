import React from "react";

export function Card({ children, header, footer, padded = true, tone = "surface", style, bodyStyle, ...rest }) {
  return (
    <div style={{
      background: tone === "raised" ? "var(--color-surface)" : "var(--color-surface)",
      border: "var(--border-hairline) solid var(--color-border)",
      borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)",
      overflow: "hidden", fontFamily: "var(--font-ui)", ...style
    }} {...rest}>
      {header ? <div style={{
        padding: "var(--pad-card-header)", borderBottom: "var(--border-hairline) solid var(--color-border)",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-6)"
      }}>{header}</div> : null}
      <div style={{ padding: padded ? "var(--pad-card)" : 0, ...bodyStyle }}>{children}</div>
      {footer ? <div style={{
        padding: "var(--pad-card)", borderTop: "var(--border-hairline) solid var(--color-border)",
        background: "var(--color-surface-2)", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "var(--space-6)", flexWrap: "wrap"
      }}>{footer}</div> : null}
    </div>
  );
}
