import React from "react";
import { Icon } from "../core/Icon.jsx";

export function SidebarNav({ items = [], value, onChange, expanded = false, logo, footer, style }) {
  return (
    <nav style={{
      display: "flex", flexDirection: "column", gap: "var(--space-2)",
      width: expanded ? "var(--sidebar-w)" : "var(--rail-w)", flex: "0 0 auto",
      padding: "var(--space-6)", background: "var(--color-surface)",
      borderRight: "var(--border-hairline) solid var(--color-border)",
      fontFamily: "var(--font-ui)", transition: "width var(--dur-base) var(--ease-standard)",
      height: "100%", boxSizing: "border-box", ...style
    }}>
      {logo ? <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "var(--space-2) var(--space-2) var(--space-8)" }}>{logo}</div> : null}
      {items.map(it => {
        const active = it.id === value;
        return (
          <button key={it.id} type="button" onClick={() => onChange && onChange(it.id)}
            title={it.label} aria-current={active ? "page" : undefined}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              justifyContent: expanded ? "flex-start" : "center",
              padding: expanded ? "10px 12px" : 0,
              minHeight: "var(--icon-tile)", width: "100%",
              borderRadius: "var(--radius-md)", cursor: "pointer",
              border: "var(--border-hairline) solid " + (active ? "transparent" : "var(--color-border-soft)"),
              background: active ? "var(--color-accent)" : "transparent",
              color: active ? "var(--color-accent-contrast)" : "var(--text-body)",
              fontFamily: "var(--font-ui)", fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-medium)",
              transition: "var(--transition-control)", position: "relative"
            }}>
            <span style={{ width: expanded ? "auto" : "100%", display: "flex", justifyContent: "center" }}><Icon name={it.icon} size={21} /></span>
            {expanded ? <span style={{ flex: 1, textAlign: "left" }}>{it.label}</span> : null}
            {it.count ? <span style={{
              position: expanded ? "static" : "absolute", top: 6, right: 6,
              minWidth: 18, height: 18, padding: "0 5px", borderRadius: "var(--radius-pill)",
              background: active ? "rgba(255,255,255,.28)" : "var(--color-accent)",
              color: active ? "var(--color-accent-contrast)" : "var(--color-accent-contrast)",
              fontSize: "var(--fs-micro)", fontWeight: "var(--fw-bold)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>{it.count}</span> : null}
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      {footer}
    </nav>
  );
}
