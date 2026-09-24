One-line: a borderless table for desktop lists (recent transactions, itens do pedido); it scrolls horizontally instead of squashing.

```jsx
<DataTable rows={pedidos} columns={[
  { key: "nome", label: "Cliente", strong: true },
  { key: "status", label: "Status", render: r => <StatusBadge status={r.status} short /> },
  { key: "total", label: "Total", align: "right" }
]} />
```

Only hairline row separators — no zebra striping, no vertical rules. Below 600px prefer `OrderCard` over a table.
