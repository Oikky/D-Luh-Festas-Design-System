import React from "react";

export function UserChip({ name, role, src, initials, compact = false, style }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-ui)", ...style }}>
      <span style={{
        width: 38, height: 38, flex: "0 0 auto", borderRadius: "var(--radius-md)", overflow: "hidden",
        background: "var(--color-accent-soft)", color: "var(--color-accent)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-bold)"
      }}>{src ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (initials || String(name || "?").slice(0, 1))}</span>
      {compact ? null : <span style={{ lineHeight: 1.25, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "var(--fs-body-s)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)" }}>{name}</span>
        {role ? <span style={{ display: "block", fontSize: "var(--fs-tiny)", color: "var(--text-muted)" }}>{role}</span> : null}
      </span>}
    </div>
  );
}
