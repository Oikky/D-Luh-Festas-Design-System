import React from "react";
import { Icon } from "./Icon.jsx";

const TONES = {
  neutral: { bg: "var(--color-surface-3)", fg: "var(--text-body)", line: "var(--color-border)" },
  accent:  { bg: "var(--color-accent-soft)", fg: "var(--text-accent)", line: "var(--terracotta-200)" },
  warn:    { bg: "var(--action-warn-bg)", fg: "var(--action-warn)", line: "var(--action-warn-line)" },
  success: { bg: "var(--action-paid-bg)", fg: "var(--action-paid)", line: "var(--action-paid-line)" },
  danger:  { bg: "var(--status-cancelado-bg)", fg: "var(--status-cancelado-fg)", line: "transparent" }
};

export function Badge({ children, tone = "neutral", icon, outline = true, style }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px",
      borderRadius: "var(--radius-pill)", background: t.bg, color: t.fg,
      border: outline ? `var(--border-hairline) solid ${t.line}` : "none",
      fontFamily: "var(--font-ui)", fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)",
      lineHeight: 1.6, whiteSpace: "nowrap", maxWidth: "100%", minWidth: 0, ...style
    }}>{icon ? <Icon name={icon} size={12} style={{ flex: "0 0 auto" }} /> : null}<span style={{ overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{children}</span></span>
  );
}
