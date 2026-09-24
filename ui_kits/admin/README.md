# D'Luh Admin

The internal panel the D'Luh Festas team runs the shop from, built on this design system. It is
the product, not a mock of it — it replaces `admin.html` in `sitedluh/site`.

Source of truth for the two screens that already exist: `sitedluh/site` → `admin.html`,
`admin.css`, `admin.js`, `painel-pedidos.html`, plus the product rules in that repo's `CLAUDE.md`.
For everything else, read [`../../PRODUCT.md`](../../PRODUCT.md) first — it is the only place that
records which screens are live and which are proposals.

## Screens

Five in the nav rail; four more open over them. **Only Pedidos and Cozinha exist in the live
product today.**

| Screen | File | Reached from | What it is |
| --- | --- | --- | --- |
| Visão geral | `VisaoGeral.jsx` | rail | KPI row, weekly revenue, recent payments, last orders. Proposal — the live admin has no dashboard. |
| Pedidos | `Pedidos.jsx`, `PedidosModais.jsx` | rail | **Live.** "Estoque pendente" + one tab per Status, order cards, the ☰ overflow menu, the "Detalhes do pedido" and "Pedido manual" modals, confirm dialogs and toasts. |
| Agenda | `Agenda.jsx` | rail | Month grid + day detail. Five event types in one calendar — `encomenda`, `buffet`, `festa`, `boleto`, `cartão` — told apart by Lucide glyph and label. Colour marks only two families: terracotta for what the shop delivers, neutral ink for what it pays (`boleto` and `cartão`, flagged `fin: true`); blue, violet and teal stay reserved for money actions. Filter pills narrow by type. Proposal. |
| Cozinha | `Cozinha.jsx` | rail | **Live.** `painel-pedidos.html` — the "Fazer agora" feature block with arrows, the queue grid, and the three-way delivery confirmation. |
| Financeiro | `Financeiro.jsx` | rail | Four tabs — transações, boletos, cartões, contratos — with a per-tab entry form. Proposal. |
| Contratos | `Contratos.jsx` | Financeiro → Contratos tab | Fills the buffet and salão models from form fields and renders a preview. Not in the rail. |
| Busca | `Busca.jsx` | top bar | Accent-insensitive (`NFD` strip) search across pedidos, eventos and pagamentos; a hit routes to its screen. |
| Notificações | `Notificacoes.jsx` | rail bell | Panel plus transient cards that stay 6s (paused while hovered or focused) and route on click. The transient cards replay demo events only with `?demo` in the URL. |
| Clientes | — | — | Deliberately absent: the product has no per-customer view. |

## Frame

`Shell.jsx` holds the app frame: 72px icon rail (248px expanded) + top bar on desktop, bottom tab
bar + compact top bar on mobile. `App.jsx` routes the five rail screens and owns the theme.

**Responsive is real, not a toggle.** `useCompact()` in `App.jsx` watches
`(max-width: 760px)` and the layout follows the actual viewport — resize the window to see the
mobile frame. (An earlier version of this kit had a Desktop/Mobile switch in a bar at the top;
it is gone.)

**The theme defaults to `dark`.** `App.jsx` starts at `dark` and the top bar toggles to light.
Worth knowing when you screenshot: the light theme is the one D'Luh actually ships, so capture
both.

## Data

`data.js` and `contratos-data.js` are **fake**. They are shaped like real Coda rows, which makes
them useful for building against, and every value in them is invented — clientes, totals, dates,
revenue, boletos. Do not quote them as real numbers or use them as evidence of volume.

The one exception: `contratos-data.js` carries the **real clause text** for the two contract
models, transcribed from the generators in `../../uploads/`. The fields around it are mock; the
clauses are not.

## Interactions that work

Switch rail screens, search from the top bar, open Detalhes and Pedido manual, confirm estoque,
apagar (with the destructive dialog), advance the kitchen queue, filter the Agenda by event type
and pick a day, move through the Financeiro tabs, fill and preview a contract, open and dismiss
notificações, and toggle light/dark.

## Not implemented

Firebase auth, the Telegram "Confirmar Estoque" round-trip, InfinitePay links, the thermal
receipt print sheet, and the Coda writes. **Anything that touches money is a mock.** There is also
no permission model — the four roles (dona, cozinha, atendimento, contador) all see everything.
