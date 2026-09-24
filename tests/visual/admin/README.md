# Admin — golden de regressão visual

Capturas de `ui_kits/admin/index.html` tiradas em 2026-09-24, **antes** de qualquer correção da
passada de qualidade. Servem de linha de base: recapture com o mesmo roteiro e compare.

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
| 09 | Configurações (só desktop — no mobile não há caminho até ela) |
| 10–13 | Pedidos: menu ☰, confirm "Apagar pedido?", Detalhes do pedido, Pagamentos |
| 14 | Pedido manual (só desktop — o botão não existe no mobile) |
| 15 | Cozinha: confirm "Pedido feito?" |

## Como regenerar

1. Sirva a raiz do repositório: `python -m http.server 8765 --bind 127.0.0.1`
   (`file://` quebra o carregamento dos `.jsx`).
2. Rode `capture.playwright.js` com a ferramenta `browser_run_code` do plugin do Playwright.

O roteiro é determinístico: neutraliza o `setTimeout(…, 2500)` e o `setInterval(…, 14000)` de
`Notificacoes.jsx`, que injetam cartões de notificação de demonstração em momentos aleatórios da
captura. O tema claro é ligado por Configurações no desktop e o viewport é reduzido depois,
porque no mobile não existe controle de tema.
