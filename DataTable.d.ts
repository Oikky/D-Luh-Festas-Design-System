import React from "react";

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

export function StatusBadge({ status, short = false, dot = true, style }) {
  const meta = STATUS[status] || { key: "entregue", short: status };
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
