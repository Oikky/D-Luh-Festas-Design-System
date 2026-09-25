import React from "react";
import { Card } from "../core/Card.jsx";
import { StatusBadge } from "../core/StatusBadge.jsx";
import { Badge } from "../core/Badge.jsx";

/* "R$ 0,00" is a fact, not a payment: it stays neutral instead of taking the paid green. */
const isZero = v => /^R\$\s*0(,0+)?$/.test(String(v).trim());

export function OrderCard({ id, customer, status, meta = [], items = [], total, paid, due, badges, actions, highlight = false, style }) {
  return (
    <Card style={{ boxShadow: highlight ? "var(--glow-accent)" : "var(--shadow-card)", ...style }}
      header={<>
        <div style={{ minWidth: 0 }}>
          {id ? <div style={{ fontSize: "var(--fs-caption)", fontWeight: "var(--fw-semibold)", color: "var(--text-accent)", letterSpacing: "var(--ls-caps)", textTransform: "uppercase", marginBottom: 4 }}>{id}</div> : null}
          <div style={{ fontSize: "var(--fs-title)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)", overflowWrap: "anywhere" }}>{customer || "Cliente sem nome"}</div>
          {meta.length ? <div style={{ fontSize: "var(--fs-body-s)", color: "var(--text-body)", fontWeight: "var(--fw-medium)", marginTop: 3 }}>
            {meta.map((m, i) => <React.Fragment key={i}>{i ? <span style={{ opacity: .45, margin: "0 6px" }}>·</span> : null}{m}</React.Fragment>)}
          </div> : null}
          {badges ? <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>{badges}</div> : null}
        </div>
        {status ? <StatusBadge status={status} short /> : null}
      </>}
      footer={<>
        <div style={{ fontFamily: "var(--font-ui)" }}>
          <span style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginRight: 6 }}>Total</span>
          <span style={{ fontSize: "var(--fs-subhead)", fontWeight: "var(--fw-bold)", color: "var(--text-strong)" }}>{total == null || total === "" ? "—" : total}</span>
          {paid != null || due != null ? <div style={{ fontSize: "var(--fs-small)", fontWeight: "var(--fw-semibold)", color: "var(--text-body)", marginTop: 4 }}>
            {paid != null ? <>Pago <b style={{ color: isZero(paid) ? "var(--text-strong)" : "var(--action-paid)" }}>{paid}</b></> : null}
            {due != null ? <> · Falta <b style={{ color: "var(--action-warn)" }}>{due}</b></> : null}
          </div> : null}
        </div>
        <div style={{ display: "flex", gap: "var(--gap-inline)", alignItems: "center", flexWrap: "wrap" }}>{actions}</div>
      </>}>
      {!items.length ? <div style={{ fontFamily: "var(--font-ui)", fontSize: "var(--fs-body-s)", color: "var(--text-muted)" }}>Nenhum item registrado neste pedido.</div> : null}
      {items.length ? <div style={{ fontFamily: "var(--font-ui)" }}>
        <div style={{ fontSize: "var(--fs-tiny)", fontWeight: "var(--fw-semibold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)", marginBottom: 8 }}>Itens</div>
        {items.map((it, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", padding: "9px 0", borderTop: i ? "var(--border-hairline) solid var(--color-border)" : "none" }}>
            <div style={{ minWidth: 0, overflowWrap: "anywhere" }}>
              <div style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-medium)", color: "var(--text-strong)" }}>{it.qty ? <span style={{ color: "var(--text-muted)", marginRight: 6 }}>{it.qty}×</span> : null}{it.name}</div>
              {it.note ? <div style={{ fontSize: "var(--fs-tiny)", color: "var(--text-muted)", marginTop: 3, lineHeight: "var(--lh-snug)" }}>{it.note}</div> : null}
              {it.topper ? <div style={{ display: "inline-block", fontSize: "var(--fs-tiny)", color: "var(--text-accent)", background: "var(--color-accent-soft)", padding: "4px 8px", borderRadius: "var(--radius-xs)", marginTop: 5, lineHeight: "var(--lh-normal)" }}>{it.topper}</div> : null}
            </div>
            <div style={{ fontSize: "var(--fs-body-l)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)", whiteSpace: "nowrap" }}>{it.price}</div>
          </div>
        ))}
      </div> : null}
    </Card>
  );
}
