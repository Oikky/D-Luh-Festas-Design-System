# Migração Coda → Firestore — inventário

> **26/09/2026: o Coda foi abandonado.** Nada é migrado nem mexido lá; ele só vai ser esquecido. Este arquivo fica
> como histórico e como lista das funções que o sistema novo cobre. O que falta está em `backend/README.md`.

Decisão (conselho de 25/09/2026): **opção A — Firestore + Cloud Functions**, depois trocado para **Firestore + Cloudflare Worker `dluh-api`** no mesmo dia (contas de faturamento do Google fechadas; ver `backend/README.md`) no projeto Firebase `dluh-festas`, que já existe e já tem uma coleção `pedidos` (histórico "Meus pedidos" do cliente, gravada pelo site com `addDoc`).

Fontes lidas: `sitedluh/site@origin/main` (`arquitetura.mermaid`, `admin.js`, `painel-pedidos.js`, `cardapio-*.js`), a cópia local de `worker-completo-pronto.js` (desatualizada — não tem `/pagar`, `/novo-pedido`, `/webhook-telegram` etc.) e a página pública "NEW SIS" do doc Coda "Vendas 2".

## 🔴 Segurança — adiado pelo usuário até o sistema novo entrar no ar (25/09/2026)

1. **Token da API do Coda exposto em repositório público.** `painel-pedidos.js` linha 4 (`CFG.token`), no GitHub desde 17/07/2026. Quem tiver o token lê e escreve no doc inteiro. → Revogar em coda.io/account → API tokens, gerar outro e **não** colocá-lo em JS do navegador.
2. **O doc Coda "Vendas 2" está aberto para qualquer pessoa com o link**, e mostra nome, telefone e valor dos clientes. → Tirar o compartilhamento público (LGPD).
3. **Rotas do Worker sem autenticação** (na cópia local): `/pedidos-pendentes` devolve dados dos clientes para qualquer um; `/webhook-pagamento` aceita qualquer POST e marca pedido como pago; `/tabelas`, `/debug-colunas`, `/debug-produto` expõem a estrutura do doc. Conferir na versão publicada.
4. Segredos do Worker (token Coda, client secret e refresh token do Google) ficam no código. Não estão no Git (`.gitignore` ok). Na migração, passar tudo para `wrangler secret` / Secret Manager.

## Quem lê e quem escreve (hoje)

| Ator | Rota / acesso | Lê | Escreve (status resultante) |
|---|---|---|---|
| index / cardápio / empresas | `/produtos`, `/recheios`, `/horarios-disponiveis` | Produtos, Recheios, Limites, Pedidos (conta ocupação por horário) | — |
| cardápio / empresas | `/novo-pedido`, `/criar-pedido`, `/orcamentos` | — | Pedido → **Aguardando confirmação** + Telegram + Google Calendar |
| cardápio / empresas | `/upload-topper-imagem` | — | Google Drive |
| Bot de status (cliente) | `/status-pedido?tel=` | Pedidos | — |
| admin.html | `/pedidos-pendentes` | Orçamentos/Pedidos | — |
| admin.html | `/confirmar-estoque` | — | **Confirmado — Esperando pagamento** + link InfinitePay (50%) + Telegram + WhatsApp |
| admin.html | `/cobrar-entrada`, `/cobrar-restante`, `/cobrar-total`, `/gerar-cobranca`, `/pagar` | — | Link InfinitePay |
| admin.html | `/atualizar-status`, `/marcar-entregue`, `/apagar-pedido` + edição | — | Qualquer status (inclui **Finalizado**), apagar; grava nota `[EDITADO PELO ADMIN …]` / `[PIX POR FORA …]` / `[DINHEIRO …]` |
| InfinitePay | `/webhook-pagamento` | Orçamentos | **Pago — Em produção** (hoje), Valor Pago, Comprovante + Google Calendar |
| Telegram | `/webhook-telegram` (botão) | — | Status (Confirmar Estoque) |
| painel-pedidos (cozinha) | **Coda API direto do navegador**, a cada **2 min** | Fila Cozinha | — |
| painel-pedidos (cozinha) | `/pedido-feito`, `/entrega-confirmada` | — | **Entregue — Esperando restante** |
| Coda (botões/fórmulas) | botão "Open URL" → `/confirmar-estoque` | — | idem |

Tabelas Coda: Produtos (`grid-IFgZ…`), Pedidos (`grid-ZdWq…`), Orçamentos (`grid-N20q…`), Recheios (`grid-qaJy…`), Limites (`grid-tpPT…`), mais as views Pedidos Site / Fila Cozinha / Produtos Site / Recheios Site / Limites Site / Festas Site.

## Ainda falta levantar (só dá para ver dentro do Coda)

- [ ] Fórmulas e colunas calculadas (Total, Falta, Quantidade de Itens, Pago?).
- [ ] Automações do Coda (regras com gatilho/horário) e botões.
- [ ] Views que a Luciana ou o contador usam no dia a dia.
- [ ] Código atual do Worker publicado (a cópia local está velha).
- [ ] Onde a impressora térmica pega os dados.
- [ ] Se o webhook da InfinitePay tem assinatura/segredo e se repete envio.

## Decisões de 25/09/2026

- **Worker novo do zero.** O `coda-proxy` atual não é reaproveitado; a tabela acima serve só como lista de funções que o sistema novo precisa cobrir.
- **Status `Pago — Em produção` → `Em produção`.** Produção não depende de pagamento; quanto já foi pago fica só no eixo `pagamento` (Não pago / Só entrada / Totalmente pago). Já trocado no design system e no admin.

## Ordem proposta

1. (Segurança fica para depois do lançamento — ver acima.)
2. Modelo no Firestore: `pedidos/{id}` com `etapa` e `pagamento` separados, `itens`, `eventos` (log); `produtos`, `recheios`, `limites`. Regras de acesso mínimas.
3. Uma rota `mudarStatus` (Worker `dluh-api`) usada por admin, Telegram e webhook — com transação e idempotência.
4. Painel da cozinha lendo do Firestore com `onSnapshot` (sai do polling de 2 min) + aviso de sem conexão + Wake Lock.
5. `api.js` do admin novo apontando para o Firestore.
6. Mover as rotas do Worker, uma por vez, com data de corte; Coda vira somente leitura.
