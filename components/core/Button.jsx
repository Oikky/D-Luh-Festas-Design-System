import React from "react";
import { Icon } from "./Icon.jsx";
import { Spinner } from "./Spinner.jsx";

const TONES = {
  accent:    { bg: "var(--color-accent-strong)", fg: "var(--color-accent-contrast)", line: "transparent" },
  success:   { bg: "var(--action-success)",    fg: "var(--action-fg)", line: "transparent" },
  chargeAll: { bg: "var(--action-charge-total)", fg: "var(--action-fg)", line: "transparent" },
  chargeEntry:{ bg: "var(--action-charge-entry)", fg: "var(--action-fg)", line: "transparent" },
  delivered: { bg: "var(--action-delivered)",  fg: "var(--action-fg)", line: "transparent" },
  warn:      { bg: "var(--action-warn)",       fg: "var(--action-fg)", line: "transparent" },
  danger:    { bg: "var(--action-danger)",     fg: "var(--action-fg)", line: "transparent" }
};
const SIZES = {
  sm: { padding: "8px 14px", fontSize: "var(--fs-small)", gap: 6, minHeight: 36 },
  md: { padding: "10px 16px", fontSize: "var(--fs-body-s)", gap: 8, minHeight: 40 },
  lg: { padding: "12px 20px", fontSize: "var(--fs-body-l)", gap: 8, minHeight: 44 }
};

export function Button({
  children, variant = "solid", tone = "accent", size = "md", icon, iconRight,
  block = false, loading = false, disabled = false, style, ...rest
}) {
  const t = TONES[tone] || TONES.accent;
  const s = SIZES[size] || SIZES.md;
  const skin =
    variant === "outline" ? { background: "var(--color-surface)", color: t.bg, border: `var(--border-control) solid ${t.bg}` }
    : variant === "ghost" ? { background: "transparent", color: "var(--text-body)", border: "var(--border-hairline) solid var(--color-border)" }
    : variant === "quiet" ? { background: "var(--color-surface-3)", color: "var(--text-body)", border: "var(--border-hairline) solid transparent" }
    : { background: t.bg, color: t.fg, border: `var(--border-hairline) solid ${t.line}` };
  const off = disabled || loading;
  return (
    <button type="button" disabled={off} data-tone={tone} data-variant={variant}
      style={{
        display: block ? "flex" : "inline-flex", width: block ? "100%" : "auto",
        /* In a row of block buttons they share the width equally, and a button that no longer fits
           its words moves to the next line (the row wraps) instead of breaking a word in half. */
        flex: block ? "1 1 0%" : undefined,
        alignItems: "center", justifyContent: "center", gap: s.gap,
        padding: s.padding, minHeight: s.minHeight, fontSize: s.fontSize,
        fontFamily: "var(--font-ui)", fontWeight: "var(--fw-semibold)", lineHeight: 1.2, textAlign: "center",
        borderRadius: "var(--radius-sm)", cursor: off ? "not-allowed" : "pointer",
        /* Labels wrap rather than overflow: pt-BR runs long, and a value in a label ("Criar 3 pedidos
           · R$ 12.480,00") can outgrow a phone. */
        opacity: off ? "var(--disabled-opacity)" : undefined, maxWidth: "100%",
        transition: "var(--transition-control)", ...skin, ...style
      }} {...rest}>
      {loading ? <Spinner size={15} inline /> : icon ? <Icon name={icon} size={size === "sm" ? 15 : 17} /> : null}
      {children != null ? <span style={{ overflowWrap: "break-word" }}>{children}</span> : null}
      {iconRight && !loading ? <Icon name={iconRight} size={size === "sm" ? 15 : 17} /> : null}
    </button>
  );
}
