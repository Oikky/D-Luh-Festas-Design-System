One-line: the order lifecycle pill — one colour per Status value, matching the live admin exactly.

```jsx
<StatusBadge status="Pago — Em produção" />
<StatusBadge status="Confirmado — Esperando pagamento" short />
```

Never invent a status string: the Coda single-select only accepts the values in `DluhStatus`, and a typo
fails silently. Use `short` in dense lists and mobile cards, the full string in detail views.
