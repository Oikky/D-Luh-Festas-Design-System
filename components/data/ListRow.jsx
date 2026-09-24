import React from "react";
import { Icon } from "../core/Icon.jsx";

export function ListRow({ avatar, icon, title, subtitle, value, valueSub, tone = "neutral", trailing, onClick, style }) {
  const money = tone === "in" ? "var(--action-paid)" : tone === "out" ? "var(--action-danger)" : "var(--text-strong)";
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: "var(--space-6)", padding: "11px 12px",
      borderRadius: "var(--radius-sm)", cursor: onClick ? "pointer" : "default",
      background: "var(--color-surface)", fontFamily: "var(--font-ui)",
      border: "var(--border-hairline) solid var(--color-border-soft)", ...style
    }}>
      {avatar ? <span style={{
        width: 36, height: 36, flex: "0 0 auto", borderRadius: "var(--radius-sm)",
        background: "var(--color-surface-3)", color: "var(--text-body)", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)"
      }}>{avatar}</span> : icon ? <span style={{
        width: 36, height: 36, flex: "0 0 auto", borderRadius: "var(--radius-sm)",
        background: "var(--color-surface-3)", color: "var(--text-body)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}><Icon name={icon} size={18} /></span> : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
        {subtitle ? <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>{subtitle}</div> : null}
      </div>
      {value != null ? <div style={{ textAlign: "right", flex: "0 0 auto" }}>
        <div style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-semibold)", color: money, whiteSpace: "nowrap" }}>{value}</div>
        {valueSub ? <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 2 }}>{valueSub}</div> : null}
      </div> : null}
      {trailing}
    </div>
  );
}
