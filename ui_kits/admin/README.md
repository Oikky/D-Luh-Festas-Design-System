# UI kit — D'Luh Admin

A navigable recreation of the internal panel the D'Luh Festas team uses every day, rebuilt on this
design system. Source of truth: `sitedluh/site` → `admin.html`, `admin.css`, `admin.js`,
`painel-pedidos.html`, plus the product rules in that repo's `CLAUDE.md`.

## Screens

| Screen | File | What it recreates |
| --- | --- | --- |
| Visão geral | `VisaoGeral.jsx` | New composition — KPI row, weekly revenue, recent payments, last orders. The live admin has no dashboard; this is the one addition, built only from data the system already has. |
| Pedidos | `Pedidos.jsx` | The real admin: "Estoque pendente" + one tab per Status, order cards, the ☰ overflow menu, the "Detalhes do pedido" and "Pedido manual" modals, confirm dialogs and toasts. |
| Cozinha | `Cozinha.jsx` | `painel-pedidos.html` — the "Fazer agora" feature block with arrows, the queue grid, and the three-way delivery confirmation. |
| Clientes | `Cozinha.jsx` | Deliberately blank: the product has no per-customer view. |

`Shell.jsx` holds the app frame: 72px icon rail + top bar on desktop, bottom tab bar + compact
top bar on mobile. `data.js` is fake but shaped like the real Coda rows; `contratos-data.js` holds the two contract models — fields plus the real clause text transcribed from the current generators.

## Interactions that work

Switch tabs, search (filters by cliente/ID), open Detalhes and Pedido manual, confirm estoque,
apagar (with the destructive dialog), advance the kitchen queue, and toggle Desktop/Mobile and
light/dark from the bar at the top.

## Not recreated

Firebase auth, the Telegram "Confirmar Estoque" round-trip, InfinitePay links, the thermal
receipt print sheet, and the Coda writes. Anything that touches money is a mock.
