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
  /* On a phone the menu is an action sheet pinned to the bottom: a 220px popover anchored to a
     trigger that wrapped to the left edge opened off-screen, past where a finger can reach. */
  const sheet = typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;

  /* Popover: kept 8px inside the viewport on every side, scrolling if it is taller than the room. */
  const place = () => {
    if (sheet) { setPos({}); return; }
    const t = ref.current.getBoundingClientRect();
    const w = menu.current ? menu.current.offsetWidth : 220;
    const h = menu.current ? menu.current.scrollHeight : 0;
    const vw = window.innerWidth, vh = window.innerHeight;
    const roomBelow = vh - 8 - (t.bottom + 6), roomAbove = t.top - 6 - 8;
    const below = h <= roomBelow || roomBelow >= roomAbove;
    const maxH = Math.max(120, below ? roomBelow : roomAbove);
    const left = Math.min(Math.max(8, align === "right" ? t.right - w : t.left), vw - 8 - w);
    setPos({ top: below ? t.bottom + 6 : Math.max(8, t.top - 6 - Math.min(h, maxH)), left: Math.max(8, left), maxHeight: maxH });
  };
  const close = (refocus) => {
    setOpen(false);
    if (refocus) { const b = ref.current && ref.current.querySelector("button"); if (b) b.focus(); }
  };

  React.useLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    place();
    /* The sheet has its own backdrop that closes it on click. Closing on touchstart there would
       unmount the backdrop and let the same tap's click land on the button underneath. */
    if (sheet) {
      const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (menu.current && menu.current.animate && !reduz) menu.current.animate(
        [{ transform: "translateY(24px)", opacity: 0 }, { transform: "none", opacity: 1 }],
        { duration: 220, easing: "cubic-bezier(.16,1,.3,1)" });
      return;
    }
    const away = e => { if (ref.current && !ref.current.contains(e.target) && menu.current && !menu.current.contains(e.target)) close(false); };
    const drop = () => close(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("touchstart", away);
    /* Scrolling the page closes the popover (it would drift off its trigger), except its own list. */
    const scrolled = e => { if (!(menu.current && menu.current.contains(e.target))) drop(); };
    window.addEventListener("resize", drop);
    document.addEventListener("scroll", scrolled, true);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("touchstart", away);
      window.removeEventListener("resize", drop);
      document.removeEventListener("scroll", scrolled, true);
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
      {open && sheet ? <div aria-hidden="true" onClick={() => close(true)}
        style={{ position: "fixed", inset: 0, zIndex: 949, background: "rgba(8,6,10,.55)" }} /> : null}
      {open ? <div ref={menu} role="menu" onKeyDown={onMenuKey} style={{
        position: "fixed", zIndex: 950, visibility: pos ? "visible" : "hidden",
        ...(sheet ? {
          left: 8, right: 8, bottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
          maxHeight: "calc(100dvh - 24px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))",
          padding: "8px 8px", borderRadius: "var(--radius-lg)"
        } : {
          ...(pos || { top: 0, left: 0 }), minWidth: 220, maxWidth: "calc(100vw - 16px)", padding: 6, borderRadius: "var(--radius-md)"
        }),
        display: "flex", flexDirection: "column", gap: 2, overflowY: "auto", overscrollBehavior: "contain",
        background: "var(--color-surface)", border: "var(--border-hairline) solid var(--color-border)",
        boxShadow: "var(--shadow-pop)", fontFamily: "var(--font-ui)"
      }}>
        {items.map((it, i) => it.divider ? <span key={i} role="separator" style={{ flex: "0 0 1px", height: 1, background: "var(--color-border)", margin: "4px 0" }} /> : (
          <button key={i} type="button" role="menuitem" tabIndex={-1}
            onClick={() => { close(true); it.onClick && it.onClick(); }}
            style={{
              display: "flex", alignItems: "center", gap: sheet ? 14 : 9, width: "100%", minHeight: sheet ? 52 : 40, flex: "0 0 auto", textAlign: "left",
              padding: sheet ? "0 14px" : "9px 10px", borderRadius: sheet ? "var(--radius-md)" : "var(--radius-xs)", border: "none", cursor: "pointer",
              background: "transparent", color: it.tone === "danger" ? "var(--action-danger)" : sheet ? "var(--text-strong)" : "var(--text-body)",
              fontFamily: "var(--font-ui)", fontSize: sheet ? "var(--fs-body)" : "var(--fs-small)", fontWeight: "var(--fw-semibold)",
              whiteSpace: sheet ? "normal" : "nowrap"
            }}>
            {it.icon ? <Icon name={it.icon} size={sheet ? 20 : 16} /> : null}{it.label}
          </button>
        ))}
      </div> : null}
    </span>
  );
}
