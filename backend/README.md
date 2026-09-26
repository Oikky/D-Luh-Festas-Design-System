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
| `/api/marcarFeito` | cozinha | Tira o pedido da fila (`cozinha: "feito"`); não mexe em status nem pagamento |
| `/api/gerarCobranca` | admin | Link InfinitePay de `entrada` (`entradaPct` do pedido: 50% ou 100%), `restante` ou `total` |
| `/api/registrarPagamentoManual` | admin | Pix por fora, dinheiro, maquininha ou `outro` |
| `/api/editarPedido` | admin (Detalhes) | Troca cliente, entrega, itens e valores; refaz total e `pagamento`; evento guarda o "antes" |
| `/api/avisarCliente` | admin ("Notificar alterações") | Manda ao cliente, pelo WhatsApp, o resumo atual do pedido |
| `/api/salvarProduto`, `/api/apagarProduto` | admin (Produtos) | Catálogo em `sis_produtos` |
| `/api/salvarRecheios` | admin (Produtos) | Lista de recheios em `sis_catalogo/recheios` |
| `/api/enviarImagem` | admin | Foto de produto ou imagem do topo → Google Drive; devolve o link |
| `/api/enviarTopo` | **cliente** (qualquer login do Firebase, até anônimo) | Imagem de referência do topo do bolo → Drive; vai em `itens[].topo.imagem` |
| `/webhook/infinitepay` | InfinitePay | Confere no `payment_check` e registra; aviso repetido conta uma vez |
| cron 03:00 | Cloudflare | Backup em JSON das coleções `sis_*` na pasta do Drive |

`/api/*` exige `Authorization: Bearer <ID token>` de um e-mail da equipe. Erros voltam como
`{ erro, codigo }` com status HTTP (400/401/403/404/409/500).

Quando o primeiro pagamento chega num pedido em "Confirmado — Esperando pagamento", ele vai para
"Em produção" — igual ao fluxo de hoje. Produção não exige pagamento: o status pode ser mudado à mão.

## Coleções

- `sis_pedidos/{PED-n}` — `cliente{nome,telefone}`, `clienteUid?`, `tipo`, `entrega{modo,data,hora,endereco?}`,
  `itens[{nome,qtd,valorUnit,produtoId?,obs?,topo?}]`, `taxaEntrega`, `total`, `entradaPct`, `formaPagamento?`, `pago`, `pagamento`,
  `status`, `cozinha` (`pendente`/`feito`), `obs`, `origem`, `criadoEm`, `atualizadoEm` — `entrega.hora` pode ser vazia
- `sis_pedidos/{id}/eventos` — histórico
- `sis_pagamentos/{chave}` — um documento por pagamento; a chave impede contar duas vezes
- `sis_config/contador` — último número de pedido
- `sis_produtos/{id}` — `nome`, `categoria`, `valorUnit`, `qtdMin`, `ingredientes`, `imagem`, `ativo`, `destaque`, `tiposPacote` — **leitura pública** (o site)
- `sis_catalogo/recheios` — `{ lista: [...] }` — leitura pública

Item do pedido: `{ nome, qtd, valorUnit, produtoId?, categoria?, obs?, recheios?: [..], topo?: { tema, detalhes?, imagem? } }`.

## Depois de gravar (Agenda, WhatsApp)

Depois que uma ação dá certo, o Worker (em segundo plano, sem atrasar a tela):
- **Google Agenda**: um evento por pedido (criar, editar, mudar status, pagamento); cancelado sai da agenda.
- **WhatsApp** (Evolution): pedido novo → mensagem para `WHATSAPP_LOJA`; pagamento confirmado pela InfinitePay → mensagem ao cliente.

Se o Google ou a Evolution falharem, o pedido continua certo no Firestore; o erro aparece em `npx wrangler tail`.
Cada integração fica **desligada** enquanto os segredos dela não existem.

### Ligar Google Drive e Agenda (uma vez)
1. Google Cloud → APIs e serviços: ativar **Google Drive API** e **Google Calendar API**.
2. Tela de consentimento OAuth: tipo Externo, adicionar a conta da loja; depois **Publicar app** (em "Teste" o
   refresh token vence em 7 dias). O aviso "app não verificado" é normal — só a loja usa.
3. Credenciais → Criar → ID do cliente OAuth → **App para computador**.
4. `node scripts/google-autorizar.js <CLIENT_ID> <CLIENT_SECRET>` — entrar com a conta da loja. O script cria a pasta
   "D'Luh Sistema" no Drive e imprime os comandos `wrangler secret put` e o `GOOGLE_DRIVE_PASTA`.
5. `npm run deploy:worker`.

### Ligar o WhatsApp (Evolution API no Docker)
O Worker roda na nuvem, então a Evolution precisa de um endereço público: um **Cloudflare Tunnel**
(`cloudflared tunnel --url http://localhost:8080`, ou um túnel nomeado para o endereço não mudar).
Em `wrangler.jsonc`: `EVOLUTION_URL` (endereço do túnel), `EVOLUTION_INSTANCE`, `WHATSAPP_LOJA`; e
`npx wrangler secret put EVOLUTION_KEY` (a apikey da Evolution). Se o computador desligar, os avisos param —
o resto do sistema não.

O prefixo `sis_` existe porque a coleção `pedidos` já é usada pelo site atual ("Meus pedidos").

## Equipe

Lista de e-mails em `worker/src/equipe.js` **e** em `firestore.rules` (hoje só `ikkysousa5@gmail.com`).
Mudar nos dois e publicar os dois.

## Comandos

```sh
npm install && npm --prefix worker install
npm test               # emulador do Firestore + 26 testes (Java 21 necessário)
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

Limites de horário, bot de status do cliente, o site novo dos clientes gravando em `criarPedido`,
e ligar Financeiro/Visão geral. O Coda não é mais usado nem migrado.
Ligados no admin (`?fonte=firebase`): Pedidos (com edição e impressão), Agenda, Cozinha e Produtos.
