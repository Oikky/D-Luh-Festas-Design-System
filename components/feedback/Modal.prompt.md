One-line: the working dialog — "Pedido manual", "Detalhes do pedido", anything with a form inside.

```jsx
<Modal title="Pedido manual" onClose={close}
  subtitle="Mesmo fluxo do site: registra no Coda, notifica o Telegram e segue o ciclo normal."
  footer={<><Button variant="ghost" block>Cancelar</Button><Button block>Criar pedido</Button></>}>
  …
</Modal>
```

It positions against the nearest positioned ancestor, so a screen mock can host it without covering the whole page.
Subtitle is mandatory in practice — the live admin always explains the consequence of the dialog.
