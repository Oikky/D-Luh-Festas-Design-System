import React from "react";

export function Sparkline({ data = [], width = 160, height = 40, color = "var(--color-accent)", fill = true, strokeWidth = 2 }) {
  if (!data.length) return null;
  const max = Math.max(...data), min = Math.min(...data), span = max - min || 1;
  const step = width / (data.length - 1 || 1);
  const pts = data.map((v, i) => [i * step, height - ((v - min) / span) * (height - strokeWidth * 2) - strokeWidth]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const id = React.useId ? React.useId().replace(/:/g, "") : "sp";
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity=".22" /><stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient></defs>
      {fill ? <path d={`${d} L ${width} ${height} L 0 ${height} Z`} fill={`url(#${id})`} stroke="none" /> : null}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
