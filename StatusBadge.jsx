import React from "react";

export function Spinner({ size = 32, inline = false, label }) {
  const ring = (
    <span style={{
      width: size, height: size, flex: "0 0 auto", display: "inline-block",
      border: `${Math.max(2, Math.round(size / 11))}px solid var(--color-border)`,
      borderTopColor: "var(--color-accent)", borderRadius: "var(--radius-pill)",
      animation: "dluh-spin var(--dur-spin) linear infinite"
    }} />
  );
  if (inline) return <>{ring}<style>{"@keyframes dluh-spin{to{transform:rotate(360deg)}}"}</style></>;
  return (
    <div style={{ textAlign: "center", padding: "var(--space-14) var(--space-10)", color: "var(--text-muted)", fontFamily: "var(--font-ui)", fontSize: "var(--fs-body-l)" }}>
      <div style={{ margin: "0 auto var(--space-7)", width: size, height: size }}>{ring}</div>
      {label}
      <style>{"@keyframes dluh-spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}
