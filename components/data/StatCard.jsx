import React from "react";
import { Icon } from "../core/Icon.jsx";

export function StatCard({ label, value, unit, delta, deltaLabel, icon, tone = "neutral", chart, style }) {
  const up = typeof delta === "number" ? delta >= 0 : null;
  const accentBg = tone === "accent" ? "var(--color-accent-soft)" : "var(--color-surface)";
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: "var(--space-5)", padding: "var(--space-8)",
      background: accentBg, border: "var(--border-hairline) solid " + (tone === "accent" ? "var(--terracotta-200)" : "var(--color-border)"),
      borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", fontFamily: "var(--font-ui)", minWidth: 0, ...style
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        {icon ? <span style={{
          width: 34, height: 34, borderRadius: "var(--radius-sm)", flex: "0 0 auto",
          background: tone === "accent" ? "var(--color-accent)" : "var(--color-surface-3)",
          color: tone === "accent" ? "var(--color-accent-contrast)" : "var(--text-body)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}><Icon name={icon} size={18} /></span> : null}
        <span style={{ fontSize: "var(--fs-small)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)" }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
        <span style={{ fontSize: "var(--fs-display-s)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)", letterSpacing: "var(--ls-display)", lineHeight: "var(--lh-tight)" }}>{value}</span>
        {unit ? <span style={{ fontSize: "var(--fs-body-s)", color: "var(--text-muted)", fontWeight: "var(--fw-medium)" }}>{unit}</span> : null}
      </div>
      {chart}
      {delta != null ? <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: "var(--radius-pill)",
          background: up ? "var(--action-paid-bg)" : "var(--status-cancelado-bg)",
          color: up ? "var(--action-paid)" : "var(--status-cancelado-fg)", fontWeight: "var(--fw-semibold)"
        }}><Icon name={up ? "arrow-up-right" : "arrow-down-right"} size={12} />{Math.abs(delta)}%</span>
        {deltaLabel}
      </div> : null}
    </div>
  );
}
