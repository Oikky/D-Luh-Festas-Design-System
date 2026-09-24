One-line: a square icon-only control — header utilities (notificações, mensagens), card overflow menus, and the nav rail.

```jsx
<IconButton icon="bell" label="Notificações" badge />
<IconButton icon="menu" label="Mais ações" />
<IconButton icon="layout-dashboard" label="Visão geral" tile active />
```

`tile` gives the 48px rounded square from the nav rail; the default 38px square matches the card footer buttons.
Always pass `label` — these have no visible text.
