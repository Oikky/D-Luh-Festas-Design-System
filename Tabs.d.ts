One-line: the "mais ações" (☰) overflow menu on an order card — everything that is not Detalhes lives here.

```jsx
<DropdownMenu trigger={<IconButton icon="menu" label="Mais ações" />} items={[
  { label: "Cobrar entrada", icon: "link" },
  { label: "Marcar como pago", icon: "badge-check" },
  { divider: true },
  { label: "Apagar pedido", icon: "trash-2", tone: "danger" }
]} />
```

Keeps the card footer to two visible controls. Closes on outside click; order the items by frequency, destructive last.
