import React from "react";
import { Icon } from "../core/Icon.jsx";

export function DropdownMenu({ trigger, items = [], open: openProp, onOpenChange, align = "right", style }) {
  const [openState, setOpenState] = React.useState(false);
  const open = openProp != null ? openProp : openState;
  const setOpen = v => { onOpenChange ? onOpenChange(v) : setOpenState(v); };
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const away = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open]);
  return (
    <span ref={ref} style={{ position: "relative", display: "inline-flex", ...style }}>
      <span onClick={() => setOpen(!open)}>{trigger}</span>
      {open ? <div role="menu" style={{
        position: "absolute", top: "calc(100% + 6px)", [align]: 0, zIndex: 40,
        display: "flex", flexDirection: "column", gap: 2, minWidth: 220, padding: 6,
        background: "var(--color-surface)", border: "var(--border-hairline) solid var(--color-border)",
        borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", fontFamily: "var(--font-ui)"
      }}>
        {items.map((it, i) => it.divider ? <span key={i} style={{ height: 1, background: "var(--color-border)", margin: "4px 0" }} /> : (
          <button key={i} type="button" role="menuitem"
            onClick={() => { setOpen(false); it.onClick && it.onClick(); }}
            style={{
              display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left",
              padding: "9px 10px", borderRadius: "var(--radius-xs)", border: "none", cursor: "pointer",
              background: "transparent", color: it.tone === "danger" ? "var(--action-danger)" : "var(--text-body)",
              fontFamily: "var(--font-ui)", fontSize: "var(--fs-small)", fontWeight: "var(--fw-semibold)", whiteSpace: "nowrap"
            }}>
            {it.icon ? <Icon name={it.icon} size={16} /> : null}{it.label}
          </button>
        ))}
      </div> : null}
    </span>
  );
}
