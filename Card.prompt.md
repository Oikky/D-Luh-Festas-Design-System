One-line: the admin's action control — use it for every click target that carries a verb, and pick the tone that matches the money action.

```jsx
<Button tone="accent" icon="check">Confirmar estoque</Button>
<Button variant="outline" tone="danger" size="sm" icon="trash-2">Apagar</Button>
<Button tone="chargeEntry" icon="link">Cobrar entrada</Button>
```

Tones map 1:1 to the live admin: `chargeEntry` (blue) cobrar entrada, `chargeAll` (violet) cobrar total,
`delivered` (teal) marcar entregue, `success` pagar na retirada, `warn` notificar alterações, `danger` apagar.
Sizes: `sm` inside cards and dropdowns, `md` default, `lg` for the single primary action in a modal footer.
Use `variant="ghost"` for secondary header actions (Atualizar), `outline` for destructive-but-reversible.
