One-line: a 340px yes/no gate in front of anything irreversible — finalizar, apagar, cobrar.

```jsx
<ConfirmDialog tone="danger" icon="trash-2" title="Apagar pedido?"
  message="O pedido some da fila e do Coda. Não dá pra desfazer."
  confirmLabel="Sim, apagar" onConfirm={…} onCancel={…} />
```

The title is a question; the confirm label repeats the verb ("Sim, finalizar"), never "OK".
