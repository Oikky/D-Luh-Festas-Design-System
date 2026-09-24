import React from "react";
import { Icon } from "../core/Icon.jsx";

export function FilterPill({ children, icon, trailingIcon = "chevron-down", active = false, as = "button", style, ...rest }) {
  const Tag = as;
  return (
    <Tag type={as === "button" ? "button" : undefined}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px",
        borderRadius: "var(--radius-pill)", cursor: "pointer", whiteSpace: "nowrap",
        background: active ? "var(--color-accent-soft)" : "var(--color-surface)",
        border: `var(--border-hairline) solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
        color: active ? "var(--color-accent)" : "var(--text-body)",
        fontFamily: "var(--font-ui)", fontSize: "var(--fs-small)", fontWeight: "var(--fw-semibold)",
        transition: "var(--transition-control)", ...style
      }} {...rest}>
      {icon ? <Icon name={icon} size={15} /> : null}
      {children}
      {trailingIcon ? <Icon name={trailingIcon} size={14} style={{ opacity: .7 }} /> : null}
    </Tag>
  );
}
