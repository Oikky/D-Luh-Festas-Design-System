import React from "react";

export function Field({ label, hint, error, required, children, span, style }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: span ? `span ${span}` : undefined, fontFamily: "var(--font-ui)", ...style }}>
      {label ? <span style={{
        fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "var(--ls-label)"
      }}>{label}{required ? <span style={{ color: "var(--action-danger)" }}> *</span> : null}</span> : null}
      {children}
      {error ? <span style={{ fontSize: "var(--fs-tiny)", color: "var(--action-danger)" }}>{error}</span>
        : hint ? <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>{hint}</span> : null}
    </label>
  );
}
