# Backend D'Luh — Firestore + Cloudflare Worker

Substitui o Coda e o Worker antigo `coda-proxy`. Dados no Firebase `dluh-festas` (plano grátis);
lógica no Worker **`dluh-api`** (Cloudflare, plano grátis). Plano e inventário em
[`../MIGRACAO-FIRESTORE.md`](../MIGRACAO-FIRESTORE.md).

> Começou em Cloud Functions; mudou para Worker em 25/09/2026 porque o Google fechou as contas de
> faturamento (pedido ao suporte em andamento). O Worker pode ficar de vez.

## Como funciona

- **As telas leem** direto do Firestore com `onSnapshot` — muda em um aparelho, aparece nos outros em ~1 s.
- **Toda escrita passa pelo Worker.** Ele confere o login de quem chama (ID token do Firebase) e grava
  no Firestore entrando como a conta **sistema** (e-mail/senha). As regras só deixam essa conta escrever.
- Cada mudança roda numa transação e grava um evento em `sis_pedidos/{id}/eventos` (quem, o quê, quando).
- **Dinheiro em centavos inteiros.** `pagamento` (Não pago / Só entrada / Totalmente pago) sai de `pago` × `total`,
  separado do `status`.

| Rota (`POST`) | Quem chama | Faz |
|---|---|---|
| `/api/criarPedido` | admin (pedido manual); depois o site | Cria `PED-3001`, `PED-3002`… (acima da numeração do Coda) |
| `/api/mudarStatus` | admin, cozinha | Troca o status (só os 8 valores do `StatusBadge`) |
| `/api/gerarCobranca` | admin | Link InfinitePay de `entrada` (50%), `restante` ou `total` |
| `/api/registrarPagamentoManual` | admin | Pix por fora, dinheiro, maquininha |
| `/webhook/infinitepay` | InfinitePay | Confere no `payment_check` e registra; aviso repetido conta uma vez |

`/api/*` exige `Authorization: Bearer <ID token>` de um e-mail da equipe. Erros voltam como
`{ erro, codigo }` com status HTTP (400/401/403/404/409/500).

Quando o primeiro pagamento chega num pedido em "Confirmado — Esperando pagamento", ele vai para
"Em produção" — igual ao fluxo de hoje. Produção não exige pagamento: o status pode ser mudado à mão.

## Coleções

- `sis_pedidos/{PED-n}` — `cliente{nome,telefone}`, `clienteUid?`, `tipo`, `entrega{modo,data,hora,endereco?}`,
  `itens[{nome,qtd,valorUnit,produtoId?,obs?,topo?}]`, `taxaEntrega`, `total`, `pago`, `pagamento`, `status`, `obs`, `origem`, `criadoEm`, `atualizadoEm`
- `sis_pedidos/{id}/eventos` — histórico
- `sis_pagamentos/{chave}` — um documento por pagamento; a chave impede contar duas vezes
- `sis_config/contador` — último número de pedido

O prefixo `sis_` existe porque a coleção `pedidos` já é usada pelo site atual ("Meus pedidos").

## Equipe

Lista de e-mails em `worker/src/equipe.js` **e** em `firestore.rules` (hoje só `ikkysousa5@gmail.com`).
Mudar nos dois e publicar os dois.

## Comandos

```sh
npm install && npm --prefix worker install
npm test               # emulador do Firestore + 19 testes (Java 21 necessário)
npm run emuladores     # Firestore/Auth locais com painel em localhost:4000
npm run deploy:regras  # publica firestore.rules
npm run deploy:worker  # publica o Worker dluh-api
```

## Publicar pela primeira vez

1. Firebase → Authentication → Método de login → ativar **E-mail/senha**.
2. Firebase → Authentication → Usuários → **Adicionar usuário**: `sistema@dluh-festas.firebaseapp.com`
   com uma senha forte (guardar num gerenciador de senhas).
3. `npm run deploy:regras`
4. Em `worker/`: `npx wrangler login` (conta Cloudflare onde está o `coda-proxy`), `npx wrangler deploy`,
   `npx wrangler secret put SISTEMA_SENHA` (colar a senha do passo 2).

## Ainda falta

Telegram, WhatsApp, Google Agenda, upload do topo do bolo, produtos/recheios/limites de horário,
bot de status do cliente, backup diário, e ligar o `api.js` do admin e o painel da cozinha.
