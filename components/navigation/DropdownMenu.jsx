import React from "react";
import { Icon } from "../core/Icon.jsx";

/* The menu is position: fixed against the trigger's rect, so a parent with overflow: hidden
   (every Card) can no longer clip it. It flips above the trigger when there is no room below. */
export function DropdownMenu({ trigger, items = [], open: openProp, onOpenChange, align = "right", style }) {
  const [openState, setOpenState] = React.useState(false);
  const open = openProp != null ? openProp : openState;
  const setOpen = v => { onOpenChange ? onOpenChange(v) : setOpenState(v); };
  const ref = React.useRef(null);
  const menu = React.useRef(null);
  const [pos, setPos] = React.useState(null);

  const place = () => {
    const t = ref.current.getBoundingClientRect();
    const h = menu.current ? menu.current.offsetHeight : 0;
    const below = t.bottom + 6 + h <= window.innerHeight - 8;
    setPos({
      top: below ? t.bottom + 6 : Math.max(8, t.top - 6 - h),
      [align]: align === "right" ? window.innerWidth - t.right : t.left
    });
  };
  const close = (refocus) => {
    setOpen(false);
    if (refocus) { const b = ref.current && ref.current.querySelector("button"); if (b) b.focus(); }
  };

  React.useLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    place();
    const away = e => { if (ref.current && !ref.current.contains(e.target) && menu.current && !menu.current.contains(e.target)) close(false); };
    const drop = () => close(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("touchstart", away);
    window.addEventListener("resize", drop);
    document.addEventListener("scroll", drop, true);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("touchstart", away);
      window.removeEventListener("resize", drop);
      document.removeEventListener("scroll", drop, true);
    };
  }, [open]);

  /* Focus moves in only once the menu is placed; a visibility: hidden element cannot take focus. */
  React.useEffect(() => {
    if (!open || !pos) return;
    const first = menu.current && menu.current.querySelector('[role="menuitem"]');
    if (first && !menu.current.contains(document.activeElement)) first.focus({ preventScroll: true });
  }, [open, !!pos]);

  const onMenuKey = e => {
    const list = [...menu.current.querySelectorAll('[role="menuitem"]')];
    const i = list.indexOf(document.activeElement);
    const go = n => { e.preventDefault(); list[(n + list.length) % list.length].focus(); };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(list.length - 1);
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(true); }
    else if (e.key === "Tab") close(false);
  };

  const trig = React.isValidElement(trigger) ? React.cloneElement(trigger, {
    "aria-haspopup": "menu", "aria-expanded": open,
    onClick: e => { trigger.props.onClick && trigger.props.onClick(e); setOpen(!open); },
    onKeyDown: e => { if (e.key === "ArrowDown" && !open) { e.preventDefault(); setOpen(true); } }
  }) : <span onClick={() => setOpen(!open)}>{trigger}</span>;

  return (
    <span ref={ref} style={{ position: "relative", display: "inline-flex", ...style }}>
      {trig}
      {open ? <div ref={menu} role="menu" onKeyDown={onMenuKey} style={{
        position: "fixed", zIndex: 950, visibility: pos ? "visible" : "hidden", ...(pos || { top: 0, [align]: 0 }),
        display: "flex", flexDirection: "column", gap: 2, minWidth: 220, maxWidth: "calc(100vw - 16px)", padding: 6,
        background: "var(--color-surface)", border: "var(--border-hairline) solid var(--color-border)",
        borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-pop)", fontFamily: "var(--font-ui)"
      }}>
        {items.map((it, i) => it.divider ? <span key={i} role="separator" style={{ height: 1, background: "var(--color-border)", margin: "4px 0" }} /> : (
          <button key={i} type="button" role="menuitem" tabIndex={-1}
            onClick={() => { close(true); it.onClick && it.onClick(); }}
            style={{
              display: "flex", alignItems: "center", gap: 9, width: "100%", minHeight: 40, textAlign: "left",
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
