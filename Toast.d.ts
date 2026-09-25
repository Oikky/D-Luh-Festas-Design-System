import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Button } from "../core/Button.jsx";

export function ConfirmDialog({ open = true, icon = "circle-check", tone = "accent", title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar", onConfirm, onCancel }) {
  if (!open) return null;
  const color = tone === "danger" ? "var(--action-danger)" : tone === "warn" ? "var(--action-warn)" : "var(--color-accent)";
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 1000, display: "flex", alignItems: "center",
      justifyContent: "center", padding: "var(--space-10)", background: "var(--overlay-scrim)"
    }}>
      <div style={{
        background: "var(--color-surface)", borderRadius: "var(--radius-lg)", maxWidth: 340, width: "100%",
        padding: "22px 20px", textAlign: "center", boxShadow: "var(--shadow-modal)", fontFamily: "var(--font-ui)"
      }}>
        <div style={{
          width: 52, height: 52, margin: "0 auto var(--space-5)", borderRadius: "var(--radius-pill)",
          background: "var(--color-surface-3)", color, display: "flex", alignItems: "center", justifyContent: "center"
        }}><Icon name={icon} size={25} /></div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-title)", fontWeight: "var(--fw-bold)", color: "var(--text-strong)", marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: "var(--fs-body-s)", color: "var(--text-body)", lineHeight: "var(--lh-normal)", marginBottom: "var(--space-9)" }}>{message}</div>
        <div style={{ display: "flex", gap: "var(--space-5)" }}>
          <Button variant="ghost" block onClick={onCancel}>{cancelLabel}</Button>
          <Button block tone={tone === "danger" ? "danger" : "accent"} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
