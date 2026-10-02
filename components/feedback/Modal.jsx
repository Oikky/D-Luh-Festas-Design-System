import React from "react";
import { Icon } from "../core/Icon.jsx";

const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/* Phone back button. Every open layer (dialog, menu, sheet, a screen other than home) holds one
   history entry, so "back" closes the top layer instead of leaving the app. Opt-in: the app sets
   window.DLUH_VOLTAR = true, so design-system previews never touch history.
   Entries are reconciled after the current task, so closing a menu and opening the dialog it
   launched in the same click nets out to no history change. A layer that refuses to close on back
   (unsaved changes, a request in flight) gets its entry back. */
const camadas = [];
let noHistorico = 0, acertando = false, ignorar = 0;
function acertar() {
  if (acertando) return;
  acertando = true;
  setTimeout(() => {
    acertando = false;
    const alvo = camadas.length;
    while (noHistorico < alvo) history.pushState({ dluh: ++noHistorico }, "");
    if (noHistorico > alvo) { ignorar++; history.go(alvo - noHistorico); noHistorico = alvo; }
  }, 0);
}
if (typeof window !== "undefined") window.addEventListener("popstate", () => {
  if (ignorar) { ignorar--; return; }
  if (!window.DLUH_VOLTAR) return;
  noHistorico = Math.max(0, noHistorico - 1);
  const c = camadas.pop();
  if (!c) return;
  const lugar = camadas.length;
  c.fechar.current && c.fechar.current();
  /* Still open (e.g. it asked "Descartar alterações?" instead): back in its old place, under
     whatever it opened, with its entry restored. */
  setTimeout(() => { if (c.vivo && !camadas.includes(c)) { camadas.splice(Math.min(lugar, camadas.length), 0, c); acertar(); } }, 50);
});

export function useVoltar(ativo, fechar) {
  const ref = React.useRef(fechar);
  ref.current = fechar;
  React.useEffect(() => {
    if (!ativo || typeof window === "undefined" || !window.DLUH_VOLTAR) return;
    const c = { fechar: ref, vivo: true };
    camadas.push(c);
    acertar();
    return () => {
      c.vivo = false;
      const i = camadas.indexOf(c);
      if (i >= 0) { camadas.splice(i, 1); acertar(); }
    };
  }, [ativo]);
}

/* Shared by Modal and ConfirmDialog: moves focus into the dialog, keeps Tab inside it, maps
   Escape (and the phone's back button) to the dialog's own exit and hands focus back to whatever
   opened it. */
export function useDialogFocus(ref, onEscape) {
  const esc = React.useRef(onEscape);
  esc.current = onEscape;
  useVoltar(true, () => esc.current && esc.current());
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
        {footer ? <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-5)", marginTop: "var(--space-8)" }}>{footer}</div> : null}
      </div>
    </div>
  );
}
