One-line: the bottom-centre confirmation strip — dark charcoal, one line, no buttons.

```jsx
<Toast tone="success" icon="check">Pedido confirmado</Toast>
```

Always `#222` regardless of theme (that is the live behaviour). One line of pt-BR, past tense, no period.
Never put an action inside a toast — if the user must choose, use `ConfirmDialog`.
