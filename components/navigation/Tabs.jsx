import React from "react";

/* Roving tabindex: Tab lands on the selected tab, arrows move between tabs (and select them),
   Home/End jump to the ends. The selected tab scrolls into view when the strip overflows on
   a phone, so "Em produção" is never selected off-screen. */
export function Tabs({ items = [], value, onChange, style }) {
  const list = React.useRef(null);
  React.useEffect(() => {
    const el = list.current && list.current.querySelector('[aria-selected="true"]');
    if (el && list.current.scrollWidth > list.current.clientWidth) el.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [value]);
  const onKey = e => {
    const i = items.findIndex(it => it.id === value);
    const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: items.length - 1 }[e.key];
    if (to == null || !onChange) return;
    e.preventDefault();
    const n = (to + items.length) % items.length;
    onChange(items[n].id);
    const btn = list.current.querySelectorAll('[role="tab"]')[n];
    if (btn) btn.focus();
  };
  return (
    <div role="tablist" ref={list} onKeyDown={onKey} style={{
      display: "flex", gap: 2, borderBottom: "var(--border-tab) solid var(--color-border)",
      overflowX: "auto", fontFamily: "var(--font-ui)", scrollbarWidth: "none", ...style
    }}>
      {items.map(it => {
        const active = it.id === value;
        return (
          <button key={it.id} role="tab" aria-selected={active} tabIndex={active ? 0 : -1} type="button"
            onClick={() => onChange && onChange(it.id)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
              padding: "12px 14px", marginBottom: "calc(var(--border-tab) * -1)",
              background: "none", border: "none", cursor: "pointer",
              borderBottom: `var(--border-tab) solid ${active ? "var(--color-accent)" : "transparent"}`,
              color: active ? "var(--text-accent)" : "var(--text-muted)",
              fontSize: "var(--fs-body)", fontWeight: active ? "var(--fw-semibold)" : "var(--fw-medium)",
              transition: "var(--transition-control)"
            }}>
            {it.label}
            {it.count != null ? <span style={{ fontWeight: "var(--fw-semibold)", color: active ? "var(--text-accent)" : "var(--text-muted)" }}>{it.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
