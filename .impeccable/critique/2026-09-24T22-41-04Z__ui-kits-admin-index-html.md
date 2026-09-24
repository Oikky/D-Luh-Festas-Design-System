---
target: ui_kits/admin
total_score: 19
max_score: 40
na_heuristics: 
p0_count: 4
p1_count: 12
target_identity: "file:C:\\Users\\ikkys\\Downloads\\D'Luh Festas Design System\\ui_kits\\admin\\index.html"
target_fingerprint: "sha256:46bfc62d3cfe0906cffc2a908c39331a51b116345624ad83e211720f831ef34c"
target_path: "C:\\Users\\ikkys\\Downloads\\D'Luh Festas Design System\\ui_kits\\admin\\index.html"
timestamp: 2026-09-24T22-41-04Z
slug: ui-kits-admin-index-html
---
Critique ui_kits/admin — 2026-09-24. Dual-agent (A design review, B detector). Nielsen 19/40 (Poor). Audit 9/20.
P0: dropdown ☰ clipped by Card overflow:hidden (Card.jsx:9 / OrderCard.jsx:8); Lucide names with digits don't render (Icon.jsx:5); Detalhes shows hardcoded R$240/date for every order (Pedidos.jsx:14,35-36); demo notifications on a timer (Notificacoes.jsx:38-44).
P1: Cozinha confirm has no neutral exit + offers Cobrar restante on fully paid (Cozinha.jsx:77-81); search pick lands on empty tab (Busca.jsx:47, Pedidos.jsx:64-67); Verificando Estoque/Cancelado have no tab (Pedidos.jsx:5-11); mobile loses Pedido manual + Configurações (Pedidos.jsx:76, Shell.jsx:108-112); Detalhes clips at 390 (Pedidos.jsx:31); Modal/Confirm not dialogs, no focus/Esc, scrim discards drafts (Modal.jsx:7-10); one-tap money/deletes (Pedidos.jsx:95,99,103; PedidosModais.jsx:72,111; Financeiro.jsx:55); contrast --text-muted #999 2.85:1; white-on-dark-action-hues (Button.jsx:9-13); Select no focus (Select.jsx:13); dropdown/search keyboard; 76 sub-44px targets on mobile.
