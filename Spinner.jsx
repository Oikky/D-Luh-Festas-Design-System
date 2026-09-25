import React from "react";
import { Icon } from "./Icon.jsx";

export function IconButton({ icon, label, size = 38, active = false, tile = false, badge = false, style, ...rest }) {
  return (
    <button type="button" aria-label={label} title={label}
      style={{
        position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: tile ? "var(--icon-tile)" : size, height: tile ? "var(--icon-tile)" : size,
        borderRadius: tile ? "var(--radius-md)" : "var(--radius-sm)",
        background: active ? "var(--color-accent)" : "var(--color-surface)",
        color: active ? "var(--color-accent-contrast)" : "var(--text-body)",
        border: `var(--border-control) solid ${active ? "transparent" : "var(--color-border)"}`,
        cursor: "pointer", transition: "var(--transition-control)", flex: "0 0 auto", ...style
      }} {...rest}>
      <Icon name={icon} size={tile ? 22 : 17} />
      {badge ? <span style={{
        position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "var(--radius-pill)",
        background: "var(--action-danger)", boxShadow: "0 0 0 2px var(--color-surface)"
      }} /> : null}
    </button>
  );
}
