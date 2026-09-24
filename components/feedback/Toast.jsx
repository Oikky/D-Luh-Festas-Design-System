import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Toast({ children, tone = "neutral", icon, visible = true, style }) {
  const fg = tone === "success" ? "var(--action-paid-line)" : tone === "danger" ? "var(--action-danger)" : "#fff";
  return (
    <div role="status" style={{
      position: "absolute", bottom: "var(--space-11)", left: "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      opacity: visible ? 1 : 0, transition: `all var(--dur-base) var(--ease-standard)`,
      display: "inline-flex", alignItems: "center", gap: 9, padding: "12px 20px",
      background: "#222", color: "#fff", borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-ui)", fontSize: "var(--fs-body-l)", whiteSpace: "nowrap",
      pointerEvents: "none", zIndex: 999, ...style
    }}>
      {icon ? <Icon name={icon} size={17} style={{ color: fg }} /> : null}{children}
    </div>
  );
}
