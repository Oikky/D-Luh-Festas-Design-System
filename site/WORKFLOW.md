# Site para clientes — workflow

v1: **Landing** · **Cardápio + pedido** · **Acompanhar pedido**. Mora em `site/`, mesmo stack sem build
do admin (HTML + CSS com os tokens de `tokens/*.css`), lendo o catálogo do Firestore e gravando pelo
Worker `dluh-api`.

## Referências (em `site/_refs/`, fora do git)

| Ref | O que levar | O que não levar |
|---|---|---|
| Cake Shop Web Design (Behance 190894471) | Hero com foto grande do produto; cards de produto com botão redondo de adicionar; filtro por categoria em abas; página de produto com escolha de recheio/tamanho e preço que muda; rodapé cheio em cor sólida | Display "fofo" (Dream to Berich), fotos geradas por IA, blog, login |
| Seja Doce (Behance 174724083) | Mais próxima do negócio: pt-BR, **pedido fecha no WhatsApp**, carrinho lateral sempre visível no cardápio, "Peça sob encomenda", endereço + horário no hero, sem cadastro | Ondas decorativas, coral chapado como fundo de seção inteira |
| Sweets Ordering App (Behance 164853991) | Mobile-first (81% compra pelo celular), "Pedido como convidado", grade de categorias com foto, navegação inferior | Login obrigatório, favoritos, app nativo |

Identidade continua a da D'Luh (terracota `#C0725A` + Playfair Display, `PRODUCT.md`), salvo decisão em contrário.

## Etapas e ferramentas

| # | Etapa | Skills / plugins | Sai com |
|---|---|---|---|
| 0 | Referências | Playwright, Firecrawl | `site/_refs/` ✅ |
| 1 | Contexto do site | `impeccable` (shape) | seção "Site público" no `PRODUCT.md`: público, jornada, tom com o cliente (não com a equipe) |
| 2 | Direção visual | `design-taste-frontend`, `high-end-visual-design`, `brandkit` | 2 direções em HTML estático (hero + card + cardápio), você escolhe uma |
| 3 | Comp aprovado | Figma (`figma-generate-design`) — opcional | telas no Figma para aprovar/compartilhar com a Luciana |
| 4 | Backend | `workers-best-practices`, `tdd`, `wrangler` | `/api/criarPedido` aberto ao cliente (login anônimo + Turnstile anti-robô), rota nova `/api/consultarPedido` (nº do pedido + telefone) |
| 5 | Construção | `impeccable` (craft), `emil-design-eng`, `mobile-native` | as 3 páginas ligadas ao Firestore/Worker (mock no Playwright) |
| 6 | Movimento | `animate`, `apple-design`, `find-animation-opportunities` | adicionar ao carrinho, abrir carrinho, trocar etapa do pedido; `prefers-reduced-motion` |
| 7 | Revisão | `impeccable` (audit, critique, harden, adapt), `web-perf`, `review-animations`, agente `impeccable-finish-reviewer`, `code-review` | lista de correções aplicada; Lighthouse mobile ≥ 90 |
| 8 | Publicar | `wrangler` / GitHub Pages | site no ar ao lado do atual; troca de domínio só com o seu ok |
| 9 | Documentar | agente `impeccable-documenter` | `site/DESIGN.md` |

Etapa 7 pode rodar como Workflow multiagente (auditoria, performance, acessibilidade e movimento em paralelo, ~4 agentes).

## Decisões (28/09/2026)

- **Identidade:** D'Luh (terracota + Playfair). Das referências só layout e fluxo.
- **Fotos:** as do catálogo do admin (`sis_produtos`, no Drive).
- **Checkout:** o pedido grava no sistema e aparece no admin como "Aguardando confirmação"; o cliente recebe o resumo no WhatsApp.
- ~~**Direção visual (etapa 2):** "Letreiro pintado" — parede terracota, letra pintada com contorno café, placas de preço amarelas, preço por cento em destaque. Contrato em `.impeccable/surfaces/site-index-html.md`. Sem geração de imagem na máquina: construção guiada por código (sem comp).~~ Rejeitada pela dona.
- **Direção atual:** seguir as referências do Behance (fundo claro, foto e vídeo na frente, cards com botão redondo, carrinho ao lado). Terracota + Playfair seguem. Fotos e vídeo do salão D' Roma Festas (instagram.com/dromafestas) em `site/midia/`, só mesas/doces/salão, sem rosto de criança.

## Para depois

- [ ] **Reel "antes e depois" para divulgar o site no Instagram** (D'Luh e D' Roma). Ferramenta escolhida: plugin Remotion (vídeo em código, 1080×1920).
  - Antes: gravação da tela do site atual (www.dluhfestas.com). Depois: gravação do site novo, as duas feitas com o Playwright no celular (390px).
  - Roteiro curto (15–25 s): gancho → antes/depois lado a lado ou em corte → montar um pedido em 3 toques → "Peça pelo site" + endereço.
  - Fontes e cores da marca (Playfair + Urbanist, terracota); legendas grandes, porque a maioria assiste sem som.
  - Música: pôr a música do momento no próprio app do Instagram ao publicar (licença), não no arquivo.
  - Esperar a etapa 4 (site no ar) para gravar o "depois" com o endereço real.
- [ ] Foto recortada (produto ou mesa sem fundo) saindo da borda de uma seção da landing: precisa de foto sem fundo ou de uma ferramenta de recorte.
