import React from "react";

export function DataTable({ columns = [], rows = [], empty, style }) {
  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", ...style }}>
      <table style={{ width: "100%", minWidth: 520, borderCollapse: "collapse", fontFamily: "var(--font-ui)" }}>
        <thead><tr>
          {columns.map(c => <th key={c.key} style={{
            textAlign: c.align || "left", padding: "0 12px 8px", whiteSpace: "nowrap",
            fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: "var(--ls-label)", width: c.width
          }}>{c.label}</th>)}
        </tr></thead>
        <tbody>
          {rows.length ? rows.map((r, i) => (
            <tr key={r.id || i}>
              {columns.map(c => <td key={c.key} style={{
                textAlign: c.align || "left", padding: "12px", verticalAlign: "middle",
                borderTop: "var(--border-hairline) solid var(--color-border)",
                fontSize: "var(--fs-body-s)", color: c.strong ? "var(--text-strong)" : "var(--text-body)",
                fontWeight: c.strong ? "var(--fw-semibold)" : "var(--fw-regular)", whiteSpace: c.wrap ? "normal" : "nowrap"
              }}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          )) : <tr><td colSpan={columns.length} style={{ padding: 0 }}>{empty}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
