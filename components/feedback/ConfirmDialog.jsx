import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Button } from "../core/Button.jsx";
import { useDialogFocus, useEntrada } from "./Modal.jsx";

/* Icon hue follows the confirm button's tone, so a money confirmation reads in the same
   semantic colour as the action that opened it. */
const HUE = {
  accent: "var(--color-accent)", danger: "var(--action-danger)", warn: "var(--action-warn)",
  success: "var(--action-success)", chargeAll: "var(--action-charge-total)",
  chargeEntry: "var(--action-charge-entry)", delivered: "var(--action-delivered)"
};

let seq = 0;

export function ConfirmDialog({ open = true, ...props }) {
  return open ? <ConfirmPanel {...props} /> : null;
}

/* While `pending` the confirm button spins and nothing can close the dialog, so a write in flight
   is never abandoned half-way or sent twice. */
function ConfirmPanel({ icon = "circle-check", tone = "accent", title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar", pending = false, onConfirm, onCancel }) {
  const panel = React.useRef(null);
  const [ids] = React.useState(() => { const n = ++seq; return { t: "dluh-confirm-t" + n, m: "dluh-confirm-m" + n }; });
  useDialogFocus(panel, pending ? null : onCancel);
  const entrada = useEntrada();
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center",
      justifyContent: "center", padding: "var(--space-10)", background: "var(--overlay-scrim)", ...entrada.scrim
    }}>
      <div ref={panel} role="alertdialog" aria-modal="true" aria-labelledby={ids.t} aria-describedby={message ? ids.m : undefined} tabIndex={-1} style={{
        background: "var(--color-surface)", borderRadius: "var(--radius-lg)", maxWidth: 360, width: "100%", outline: "none",
        padding: "22px 20px", textAlign: "center", boxShadow: "var(--shadow-modal)", fontFamily: "var(--font-ui)", ...entrada.panel
      }}>
        <div style={{
          width: 52, height: 52, margin: "0 auto var(--space-5)", borderRadius: "var(--radius-pill)",
          background: "var(--color-surface-3)", color: HUE[tone] || HUE.accent, display: "flex", alignItems: "center", justifyContent: "center"
        }}><Icon name={icon} size={25} /></div>
        <div id={ids.t} style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-title)", fontWeight: "var(--fw-bold)", color: "var(--text-strong)", marginBottom: 6 }}>{title}</div>
        {message ? <div id={ids.m} style={{ fontSize: "var(--fs-body-s)", color: "var(--text-body)", lineHeight: "var(--lh-normal)", marginBottom: "var(--space-9)" }}>{message}</div> : null}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-5)" }}>
          <Button variant="ghost" block onClick={onCancel} disabled={pending} data-autofocus>{cancelLabel}</Button>
          <Button block tone={HUE[tone] ? tone : "accent"} onClick={onConfirm} loading={pending}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
