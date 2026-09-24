repo: sitedluh/site
branch: main

## Last sync

date: 2026-09-21T19:50:48Z

### Updated in this project
- Derived the token set (terracotta accent, warm neutrals, status and action hues, radii, shadows, motion) from `admin.css`.
- Built 24 React primitives from the admin's real CSS classes and the order lifecycle in `CLAUDE.md`.
- Recreated the admin as a navigable UI kit: visão geral, pedidos, cozinha, desktop + mobile.
- Copied `logo.png` and `hero.jpg` into `assets/`.

## Screen map

| Screen / artifact | Built from |
| --- | --- |
| `tokens/*.css` | `admin.css` (`:root`, badges, action buttons, shadows, media queries) |
| `components/core`, `components/forms`, `components/feedback` | `admin.css` + `admin.html` (cards, badges, confirm/edit modals, manual-grid form) |
| `components/navigation` | `admin.html` tabs + the uploaded concept board's rail/topbar |
| `components/data` | `admin.html` order cards, `painel-pedidos.html` queue rows |
| `ui_kits/admin/Pedidos.jsx` | `admin.html`, `admin.js` (status tabs, pedido manual, detalhes, apagar) |
| `ui_kits/admin/Cozinha.jsx` | `painel-pedidos.html` ("Fazer agora", fila, confirmar entrega) |
| `ui_kits/admin/VisaoGeral.jsx` | New screen — data shapes from `CLAUDE.md` (`/ranking-produtos`, `/status-pedido`) |
| `assets/logo.png`, `assets/hero.jpg` | repo root |

## Notes

`Oikky/New` was attached as the design-system repo but is empty (409 from the GitHub tree API on
both `main` and `master`). Nothing was imported from it.
