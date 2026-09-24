One-line: the pedido — customer, status, items, money and actions in one card; the admin is mostly a list of these.

```jsx
<OrderCard id="PED-2291" customer="Maria Helena" status="Pago — Em produção"
  meta={["Entrega 12/06 · 15h", "(38) 99812-4410", "Pix"]}
  items={[{ qty: 1, name: "Bolo Vulcão 2kg", note: "Recheio: ninho com nutella", topper: "🎀 Topo: 'Ana faz 5'", price: "R$ 240,00" }]}
  total="R$ 480,00" paid="R$ 240,00" due="R$ 240,00"
  actions={<><Button size="sm" variant="ghost" icon="file-text">Detalhes</Button><IconButton icon="menu" label="Mais ações" /></>} />
```

Footer shows Total / Pago / Falta — "Falta" is amber, "Pago" green, exactly as in production.
On mobile the footer wraps; keep at most two visible actions and push the rest into a `DropdownMenu`.
