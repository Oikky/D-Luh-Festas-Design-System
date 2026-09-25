One-line: the rounded filter/segment control above a list — Filtro, Data, Valor, "Últimos 7 dias".

```jsx
<FilterPill icon="sliders-horizontal" trailingIcon={null}>Filtro</FilterPill>
<FilterPill active>Hoje, 04 de junho</FilterPill>
```

Group them in a flex row with `gap: var(--gap-inline)`. Active = terracotta tint + terracotta border.
