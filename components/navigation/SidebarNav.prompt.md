One-line: the admin's primary navigation — collapsed 72px rail on desktop, expanded on hover/toggle, hidden on mobile (use a bottom bar there).

```jsx
<SidebarNav value={tab} onChange={setTab} expanded
  items={[{id:"visao",label:"Visão geral",icon:"layout-dashboard"},
          {id:"pedidos",label:"Pedidos",icon:"receipt-text",count:7},
          {id:"cozinha",label:"Cozinha",icon:"chef-hat"}]}
  footer={<IconButton icon="settings" label="Configurações" tile />} />
```

Active item = solid terracotta tile. Counts sit as a pill (top-right dot-badge when collapsed).
