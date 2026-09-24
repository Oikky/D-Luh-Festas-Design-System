import React from "react";
import { Icon } from "../core/Icon.jsx";

export function Toast({ children, tone = "neutral", icon, visible = true, style }) {
  /* Mounts one frame hidden so the documented 250ms rise plays instead of a pop-in. */
  const [montado, setMontado] = React.useState(false);
  React.useEffect(() => { const f = requestAnimationFrame(() => setMontado(true)); return () => cancelAnimationFrame(f); }, []);
  visible = visible && montado;
  const fg = tone === "success" ? "var(--action-paid-line)" : tone === "danger" ? "var(--action-danger)" : "#fff";
  return (
    <div role="status" style={{
      /* Fixed to the viewport, above the modal layer: a toast confirms the action that just
         happened, even when that action came from inside a dialog or a scrolled list. The shell
         sets --toast-offset to clear the mobile bottom bar. */
      position: "fixed", bottom: "calc(var(--space-11) + var(--toast-offset, 0px) + env(safe-area-inset-bottom))", left: "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      opacity: visible ? 1 : 0, transition: "opacity var(--dur-base) var(--ease-out), transform var(--dur-move) var(--ease-out)",
      display: "inline-flex", alignItems: "center", gap: 9, padding: "12px 20px",
      background: "#222", color: "#fff", borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-ui)", fontSize: "var(--fs-body-l)", whiteSpace: "nowrap",
      pointerEvents: "none", zIndex: 1100, ...style
    }}>
      {icon ? <Icon name={icon} size={17} style={{ color: fg }} /> : null}{children}
    </div>
  );
}
