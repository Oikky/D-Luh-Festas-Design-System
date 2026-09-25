One-line: label + hint/error wrapper around any form control; it is the `<label>`, so clicking the caption focuses the input.

```jsx
<Field label="Cliente" required><Input placeholder="Nome do cliente" /></Field>
<Field label="Observações" span={2}><Input placeholder="Opcional" /></Field>
```

Captions are uppercase 11px with .4px tracking — the admin's field-label convention. Keep them one or two words in pt-BR.
