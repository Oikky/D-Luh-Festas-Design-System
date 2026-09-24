import React from "react";
import { Icon } from "../core/Icon.jsx";

const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/* Shared by Modal and ConfirmDialog: moves focus into the dialog, keeps Tab inside it, maps
   Escape to the dialog's own exit and hands focus back to whatever opened it. */
export function useDialogFocus(ref, onEscape) {
  const esc = React.useRef(onEscape);
  esc.current = onEscape;
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const opener = document.activeElement;
    const list = () => [...node.querySelectorAll(FOCUSABLE)].filter(el => el.getClientRects().length);
    (node.querySelector("[data-autofocus]") || node).focus({ preventScroll: true });
    const onKey = e => {
      if (e.key === "Escape") { e.stopPropagation(); if (esc.current) esc.current(); return; }
      if (e.key !== "Tab") return;
      const f = list();
      if (!f.length) { e.preventDefault(); return; }
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === node)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    node.addEventListener("keydown", onKey);
    return () => {
      node.removeEventListener("keydown", onKey);
      if (opener && opener.focus && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, []);
}

let seq = 0;

/* Dialogs rise in once, on open: the scrim fades and the panel settles from 97% on ease-out, so
   the page behind does not swap instantly. Centered, so no transform-origin. Closing is instant;
   the operator already decided. Reduced motion keeps the fade and drops the scale. */
export function useEntrada() {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => { const f = requestAnimationFrame(() => setOn(true)); return () => cancelAnimationFrame(f); }, []);
  return {
    scrim: { opacity: on ? 1 : 0, transition: "opacity var(--dur-base) var(--ease-out)" },
    panel: { opacity: on ? 1 : 0, transform: on ? "none" : "scale(.97)", transition: "opacity var(--dur-base) var(--ease-out), transform var(--dur-move) var(--ease-out)" }
  };
}

export function Modal({ open = true, ...props }) {
  return open ? <ModalPanel {...props} /> : null;
}

function ModalPanel({ title, subtitle, children, footer, onClose, dismissible = true, width = 580, style }) {
  const panel = React.useRef(null);
  const [titleId] = React.useState(() => "dluh-modal-" + ++seq);
  useDialogFocus(panel, onClose);
  const entrada = useEntrada();
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center",
      justifyContent: "center", padding: "var(--space-10)", background: "var(--overlay-scrim)", ...entrada.scrim
    }} onClick={e => { if (dismissible && onClose && e.target === e.currentTarget) onClose(); }}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} tabIndex={-1} style={{
        background: "var(--color-surface)", borderRadius: "var(--radius-lg)", width: "100%", outline: "none",
        maxWidth: width, maxHeight: "calc(100dvh - 2 * var(--space-10))", overflowY: "auto", padding: "22px 20px",
        boxShadow: "var(--shadow-modal)", fontFamily: "var(--font-ui)", ...entrada.panel, ...style
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-6)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {title ? <div id={titleId} style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-title)", fontWeight: "var(--fw-bold)", color: "var(--text-strong)" }}>{title}</div> : null}
            {subtitle ? <div style={{ marginTop: 4, fontSize: "var(--fs-body-s)", color: "var(--text-body)", lineHeight: "var(--lh-normal)" }}>{subtitle}</div> : null}
          </div>
          {onClose ? <button type="button" onClick={onClose} aria-label="Fechar"
            style={{ width: 40, height: 40, margin: "-10px -10px 0 0", flex: "0 0 auto", border: "none", borderRadius: "var(--radius-sm)", background: "transparent", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            <Icon name="x" size={19} /></button> : null}
        </div>
        <div style={{ marginTop: "var(--space-7)" }}>{children}</div>
        {footer ? <div style={{ display: "flex", gap: "var(--space-5)", marginTop: "var(--space-8)" }}>{footer}</div> : null}
      </div>
    </div>
  );
}
