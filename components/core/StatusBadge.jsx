import React from "react";
import { Icon } from "./Icon.jsx";

/* The six live Status values (plus the legacy intermediate) from the Coda "Status" column. */
export const STATUS = {
  "Aguardando confirmação":        { key: "aguardando", short: "Aguardando" },
  "Verificando Estoque":           { key: "aguardando", short: "Verificando estoque" },
  "Confirmado — Esperando pagamento": { key: "confirmado", short: "Esperando pagamento" },
  "Em produção":            { key: "preparo", short: "Em produção" },
  "Pronto":                        { key: "pronto", short: "Pronto" },
  "Entregue — Esperando restante": { key: "saiu", short: "Esperando restante" },
  "Finalizado":                    { key: "entregue", short: "Finalizado" },
  "Cancelado":                     { key: "cancelado", short: "Cancelado" }
};

/* A value Coda holds that is not in this list is shown as-is, never restyled as a known state: a
   neutral pill with a dashed outline and an alert glyph, so a typo in the single-select is visible
   instead of passing for "Finalizado". An empty value reads "Sem status". */
export function StatusBadge({ status, short = false, dot = true, style }) {
  const meta = STATUS[status];
  if (!meta) return (
    <span data-status="desconhecido" title="Status fora da lista do Coda" style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 11px", maxWidth: "100%",
      borderRadius: "var(--radius-pill)", border: "var(--border-hairline) dashed var(--color-border-strong)",
      background: "var(--color-surface-3)", color: "var(--text-body)",
      fontFamily: "var(--font-ui)", fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)",
      lineHeight: 1.6, whiteSpace: "nowrap", ...style
    }}><Icon name="circle-alert" size={12} style={{ flex: "0 0 auto" }} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{status ? status : "Sem status"}</span></span>
  );
  return (
    <span data-status={meta.key} style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px",
      borderRadius: "var(--radius-pill)",
      background: `var(--status-${meta.key}-bg)`, color: `var(--status-${meta.key}-fg)`,
      fontFamily: "var(--font-ui)", fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)",
      lineHeight: 1.6, whiteSpace: "nowrap", ...style
    }}>
      {dot ? <span style={{ width: 6, height: 6, borderRadius: "var(--radius-pill)", background: "currentColor", opacity: .75 }} /> : null}
      {short ? meta.short : status}
    </span>
  );
}
