import React from "react";

/* Lucide is loaded from CDN by the page (see readme ICONOGRAPHY). This wrapper reads the
   icon data off window.lucide and renders a real <svg> so React keeps ownership of the node. */
/* Lucide names can end in digits ("trash-2" → Trash2), so the segment after a dash may be a number. */
const pascal = n => String(n).replace(/(^|[-_])([a-z0-9])/g, (_, __, c) => c.toUpperCase());
const missing = new Set();
const reactAttrs = a => {
  const o = {};
  for (const k in a) o[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = a[k];
  return o;
};

export function Icon({ name, size = 20, strokeWidth = 1.75, color = "currentColor", style, ...rest }) {
  const [, force] = React.useState(0);
  React.useEffect(() => {
    if (window.lucide) return;
    const t = setInterval(() => { if (window.lucide) { clearInterval(t); force(n => n + 1); } }, 120);
    return () => clearInterval(t);
  }, []);
  /* window.lucide.icons.Bell is a single 3-tuple ["svg", attrs, [children]] — we want [2]. */
  const node = window.lucide && window.lucide.icons && window.lucide.icons[pascal(name)];
  const nodes = Array.isArray(node) && Array.isArray(node[2])
    ? node[2].filter(c => Array.isArray(c) && typeof c[0] === "string")
    : [];
  const base = { width: size, height: size, flex: "0 0 auto", display: "block", ...style };
  if (!nodes.length) {
    if (window.lucide && !missing.has(name)) { missing.add(name); console.warn(`[Icon] Lucide has no icon "${name}"`); }
    return <span aria-hidden="true" style={base} {...rest} />;
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={base} {...rest}>
      {nodes.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...reactAttrs(attrs) }))}
    </svg>
  );
}
