# Admin — golden de regressão visual

Capturas de `ui_kits/admin/index.html` depois da passada de qualidade (Fases 3 e 4, 2026-09-24).
A linha de base de **antes** das correções está no histórico do git (commit `d6b666e` e anteriores).
Recapture com o mesmo roteiro e compare.

## Nome dos arquivos

`{desktop|mobile}-{light|dark}-{NN}-{tela-ou-estado}.png`

| Breakpoint | Viewport | Frame |
| --- | --- | --- |
| desktop | 1280×820 | rail de ícones + top bar |
| mobile | 390×844 | bottom tab bar (`useCompact()` vira em `max-width: 760px`) |

| NN | Tela / estado |
| --- | --- |
| 01–05 | Visão geral, Pedidos, Agenda, Cozinha, Financeiro |
| 06 / 06b | Contratos (lista) / editor com prévia |
| 07 / 07b | Busca com resultado ("maria") / busca sem resultado |
| 08 | Painel de notificações |
| 09 | Configurações (no mobile, pelo avatar da barra do topo) |
| 10–13 | Pedidos: menu ☰, confirm "Apagar pedido?", Detalhes do pedido, Pagamentos |
| 14 | Pedido manual |
| 15 | Cozinha: confirm "Marcar como feito?" |
| 16 | Erro de carga com Tentar de novo (`?falha=carregar`, na Cozinha) |
| 17 | Pedidos com dados extremos (`?dados=extremos`) |

## Como regenerar

1. Sirva a raiz do repositório: `python -m http.server 8765 --bind 127.0.0.1`
   (`file://` quebra o carregamento dos `.jsx`).
2. Rode `capture.playwright.js` com a ferramenta `browser_run_code` do plugin do Playwright.

O roteiro desliga o cache do navegador (o servidor estático não manda cabeçalhos de cache e um
`_ds_bundle.js` regenerado vinha velho) e neutraliza os timers de demonstração de `Notificacoes.jsx`,
que hoje só rodam com `?demo`. O tema claro é ligado por Configurações no desktop e só depois o
viewport é reduzido, para todas as capturas partirem do mesmo caminho.
