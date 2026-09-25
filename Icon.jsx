import React from "react";
import { Icon } from "./Icon.jsx";

export function EmptyState({ icon = "inbox", title, description, action }) {
  return (
    <div style={{ textAlign: "center", padding: "var(--space-14) var(--space-10)", fontFamily: "var(--font-ui)" }}>
      <div style={{
        width: 56, height: 56, margin: "0 auto var(--space-7)", borderRadius: "var(--radius-lg)",
        background: "var(--color-surface-3)", color: "var(--text-muted)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}><Icon name={icon} size={26} /></div>
      <div style={{ fontSize: "var(--fs-subhead)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)" }}>{title}</div>
      {description ? <div style={{ marginTop: 6, fontSize: "var(--fs-body-s)", color: "var(--text-muted)", lineHeight: "var(--lh-normal)" }}>{description}</div> : null}
      {action ? <div style={{ marginTop: "var(--space-8)", display: "flex", justifyContent: "center" }}>{action}</div> : null}
    </div>
  );
}
