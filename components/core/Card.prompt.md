One-line: the surface every block of admin content sits on — hairline border, 16px radius, whisper shadow.

```jsx
<Card header={<div><b>Tarefas da semana</b></div>} footer={<Button size="sm">Ver tudo</Button>}>
  …
</Card>
```

Shadow is deliberately almost invisible (`0 2px 8px rgba(0,0,0,.04)`) — depth comes from the border, not the shadow.
Never stack a card inside a card; use a hairline divider instead.
