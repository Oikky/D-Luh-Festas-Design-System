---
name: D'Luh Festas · Site público
description: Vitrine e pedido de doces, salgados e bolos pra festa em Montes Claros; foto e vídeo reais na frente, pedido por quantidade ao lado.
colors:
  terracota-forte: "#a45b45"
  terracota-funda: "#8c4d3a"
  terracota: "#c0725a"
  salmao: "#eecabd"
  rosa: "#f7e3dc"
  blush: "#fdf3f0"
  branco: "#ffffff"
  cafe: "#2a1810"
  cafe-2: "#6b4a3e"
  linha: "#ecd9d1"
  verde: "#1e6b4f"
  verde-fundo: "#e3f1ea"
  erro: "#b3261e"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.625rem, 6vw, 4.75rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2rem, 4.2vw, 3.125rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  headline-m:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(1.625rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  title-serif:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 700
  title:
    fontFamily: "Urbanist, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Urbanist, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  body-lead:
    fontFamily: "Urbanist, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  price:
    fontFamily: "Urbanist, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
    fontFeature: "\"tnum\", \"lnum\""
  label:
    fontFamily: "Urbanist, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
  label-s:
    fontFamily: "Urbanist, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
rounded:
  s: "10px"
  campo: "14px"
  m: "16px"
  l: "24px"
  xl: "32px"
  pilula: "999px"
  circulo: "50%"
spacing:
  gutter: "clamp(16px, 4vw, 40px)"
  secao: "clamp(56px, 8vw, 104px)"
  cabeca-secao: "clamp(24px, 3.4vw, 40px)"
  grade: "clamp(14px, 2vw, 24px)"
  largura: "1240px"
  topo: "76px"
  topo-celular: "64px"
components:
  button-primary:
    backgroundColor: "{colors.terracota-forte}"
    textColor: "{colors.branco}"
    typography: "{typography.label}"
    rounded: "{rounded.pilula}"
    padding: "12px 26px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.terracota-funda}"
    textColor: "{colors.branco}"
  button-branco:
    backgroundColor: "{colors.branco}"
    textColor: "{colors.cafe}"
    rounded: "{rounded.pilula}"
    padding: "12px 26px"
    height: "52px"
  button-branco-hover:
    backgroundColor: "{colors.rosa}"
  button-contorno:
    backgroundColor: "transparent"
    textColor: "{colors.terracota-forte}"
    rounded: "{rounded.pilula}"
    padding: "12px 26px"
    height: "52px"
  button-contorno-hover:
    backgroundColor: "{colors.terracota-forte}"
    textColor: "{colors.branco}"
  button-disabled:
    backgroundColor: "{colors.rosa}"
    textColor: "{colors.cafe-2}"
  button-mais:
    backgroundColor: "{colors.terracota-forte}"
    textColor: "{colors.branco}"
    rounded: "{rounded.circulo}"
    size: "48px"
  card-produto:
    backgroundColor: "{colors.branco}"
    textColor: "{colors.cafe}"
    rounded: "{rounded.l}"
    padding: "16px 18px 18px"
  contador:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.cafe}"
    rounded: "{rounded.pilula}"
    padding: "4px"
    height: "48px"
  chip:
    backgroundColor: "{colors.branco}"
    textColor: "{colors.cafe}"
    rounded: "{rounded.pilula}"
    padding: "4px 12px"
    height: "36px"
  chip-selected:
    backgroundColor: "{colors.terracota-forte}"
    textColor: "{colors.branco}"
  aba:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.cafe-2}"
    rounded: "{rounded.pilula}"
    padding: "8px 18px"
    height: "44px"
  aba-active:
    backgroundColor: "{colors.terracota-forte}"
    textColor: "{colors.branco}"
  entrada:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.cafe}"
    rounded: "{rounded.campo}"
    padding: "12px 16px"
    height: "52px"
  entrada-focus:
    backgroundColor: "{colors.branco}"
  comanda:
    backgroundColor: "{colors.branco}"
    rounded: "{rounded.l}"
    width: "370px"
  barra-pedido:
    backgroundColor: "{colors.cafe}"
    textColor: "{colors.branco}"
    rounded: "{rounded.pilula}"
    padding: "10px 10px 10px 20px"
  selo:
    backgroundColor: "{colors.branco}"
    textColor: "{colors.cafe}"
    typography: "{typography.label-s}"
    rounded: "{rounded.pilula}"
    padding: "4px 12px"
---

# Design System: D'Luh Festas · Site público

Escopo: o site do cliente em `site/` (landing, cardápio com pedido, acompanhar pedido). O admin em `ui_kits/admin` é outro mundo (tema escuro) e não segue este arquivo.

## Overview

**Creative North Star: "A vitrine da doceria, com a festa de verdade"**

O site é a vitrine clara de uma doceria de festa: fundo branco alternando com faixas blush, a foto e o vídeo reais do salão e dos produtos sempre na frente, e o pedido montado por quantidade com o total à vista. A linguagem é a das docerias de referência da categoria (cards com foto em cima e botão redondo de "+", carrinho ao lado do cardápio), feita com acabamento: cantos generosos, sombra macia e deslocada para baixo, títulos em Playfair Display com destaque em itálico e texto em Urbanist.

A densidade é de loja, não de revista: grades de cards, preço forte em terracota, rótulos curtos. O terracota escuro carrega toda ação e todo preço; o café é a cor do texto e só vira superfície como véu sobre foto ou como pílula flutuante. Tudo que se toca é pílula ou círculo.

No celular o mundo não encolhe, se reorganiza: carrosséis horizontais sem barra de rolagem, o carrinho vira uma barra café fixa no rodapé que abre uma folha de baixo para cima, e o botão "+" dos cards vira uma pílula de largura toda.

**Key Characteristics:**
- Fundo branco com faixas blush alternadas; seções terracota cheias só no salão e no rodapé.
- Foto real em cima do card, fundo rosa-chá quando falta foto (com a marca esmaecida no lugar).
- Ação e preço em terracota escuro; texto em café; apoio em café claro.
- Cantos de 16 a 32px nas superfícies, pílula em botões, abas, chips e contador; círculo no "+", na sacola e nos números de passo.
- Sombra macia com deslocamento vertical, em dois níveis; foco sempre visível em terracota.
- Movimento curto e com mola de saída; pressão com leve encolhimento; respeita redução de movimento.

## Colors

Paleta quente e clara: branco e rosados de fundo, um terracota escurecido para agir, café para ler, verde e vermelho só para estado.

### Primary
- **Terracota escuro** (terracota-forte): a cor de toda ação e todo preço. Fundo dos botões principais, do "+" redondo, da aba e do chip selecionados, do número do passo e da etapa atual; texto de preço, de link e do itálico dos títulos; faixa cheia do salão e do rodapé; anel de foco. Escolhido no lugar do terracota da marca porque dá 5:1 com branco e 4.6:1 sobre blush.
- **Terracota queimado** (terracota-funda): só o hover dos botões terracota e o fundo das células da galeria enquanto a mídia carrega.
- **Terracota da marca** (terracota): a cor do logo. No site aparece apenas como o halo translúcido de foco dos campos (a 18%); não serve para texto nem fundo de botão com texto branco.

### Secondary
- **Salmão** (salmao): o acento claro sobre fundo escuro e o traço decorativo. Itálico do título sobre o vídeo, link dentro do recado café, pontilhado que liga os passos, ícone do carrinho vazio, hover da borda dos campos, cor da seleção de texto e da barra de rolagem.

### Neutral
- **Branco** (branco): fundo da página, dos cards, da comanda, dos painéis e do topo (a 94% com desfoque).
- **Blush** (blush): faixas alternadas de seção, fundo dos campos, do contador, das abas em repouso, da sacola, dos grupos de escolha, do rodapé da comanda e dos blocos de aviso e de trilha.
- **Rosa-chá** (rosa): fundo das fotos antes de carregar ou ausentes, hover das abas e do botão branco, botão desabilitado.
- **Linha** (linha): toda borda e divisória de 1 a 1.5px (topo, abas, itens da comanda, campos, chips, conectores de etapa).
- **Café** (cafe): texto principal. Como superfície, só no véu do banner, na barra de pedido e no recado flutuante, e no véu da folha (a 50%).
- **Café claro** (cafe-2): texto de apoio: descrições, "o cento", regras de categoria, menu em repouso, rótulos de contas.

### Estado
- **Verde** (verde) sobre **verde-fundo** (verde-fundo): o que já está feito ou já está no pedido: selo "no pedido", prévia de total, etapa concluída, trilha feita, selo de pedido recebido.
- **Erro** (erro): aviso de quantidade mínima, campo inválido, aviso de falha.

### Named Rules
**The Terracota Escuro Rule.** Botão, preço e texto em terracota usam sempre o terracota escuro, nunca o terracota da marca; o terracota da marca não passa contraste com branco.

**The Fundo Claro Rule.** Nenhuma página ou seção tem fundo escuro. O café só vira superfície como véu sobre foto ou vídeo, ou como pílula e folha flutuantes (barra de pedido, recado, véu da folha).

**The Verde É Estado Rule.** Verde nunca decora; aparece só quando algo já foi feito ou já está no pedido.

## Typography

**Display Font:** Playfair Display (com Georgia, serif), pesos 600 a 800, itálico 600 a 700
**Body Font:** Urbanist (com system-ui, -apple-system, Segoe UI, sans-serif), pesos 400 a 800

**Character:** Serifa de alto contraste para dar festa e cuidado aos títulos, com o itálico pintando em terracota a palavra que importa; uma geométrica arredondada e legível para tudo que se lê e se toca.

### Hierarchy
- **Display** (Playfair 700, clamp 42 a 76px, 1.02): só o título do banner, em branco, com o itálico em salmão.
- **Headline** (Playfair 700, clamp 32 a 50px, 1.08): títulos de seção e de página; itálico em terracota escuro para o destaque. Variante média (clamp 26 a 36px) nos títulos de categoria e de etapa.
- **Title serif** (Playfair 700, 20 a 24px): cabeça da comanda, nome do aro do bolo, número dos passos.
- **Title** (Urbanist 700, 18px, 1.25; 16px no celular): nome do produto, título do passo.
- **Body** (Urbanist 400, 17px, 1.55; 16px abaixo de 640px): texto corrido. Parágrafos de apoio em 18px café claro, limitados a 44 a 56ch.
- **Price** (Urbanist 800, 20px, algarismos tabulares e alinhados): preço do card em terracota escuro, com "o cento" pequeno em café claro embaixo; total da comanda a 26px em café.
- **Label** (Urbanist 700, 15px): botões (17px), abas, rótulos de campo, regras de categoria. Rótulos pequenos a 13 a 14px 600 a 700 em selos, chips e legendas.

### Named Rules
**The Itálico Destaque Rule.** Em cada título, no máximo uma expressão em itálico, e é ela que leva a cor (terracota escuro no claro, salmão sobre vídeo, branco sobre terracota).

**The Número Tabular Rule.** Todo preço, quantidade, total e número de pedido usa algarismos tabulares, para a coluna não dançar ao mudar a quantidade.

## Layout

Moldura centralizada de até 1240px com respiro lateral fluido (16 a 40px). Seções verticais com respiro de 56 a 104px, alternando branco e blush; a cabeça da seção põe título e apoio à esquerda e a ação em contorno à direita, quebrando linha quando falta espaço.

- **Topo:** fixo, 76px (64px abaixo de 900px), branco translúcido com desfoque e linha embaixo; logo à esquerda, menu em pílulas, sacola redonda com contador.
- **Grades:** produtos em colunas automáticas de no mínimo 260px (210px dentro do cardápio, com foto 4:3); categorias com foto em 5 colunas; aros de bolo em 6 (3 abaixo de 1080px); passos em 3; salão em 5:7 texto e galeria densa de 3 colunas.
- **Balcão (cardápio):** cardápio à esquerda e comanda fixa de 370px à direita (320px abaixo de 1080px), abas de categoria fixas logo abaixo do topo.
- **Formulários:** grade de 6 colunas; campos inteiros, metade, terço ou dois terços, todos inteiros abaixo de 640px. Painel de finalizar limitado a 860px; acompanhar pedido a 980px.

**Responsivo.** Abaixo de 900px: menu some (fica logo e sacola), banner troca o véu lateral por um de baixo para cima, categorias e aros viram carrosséis horizontais sem barra que sangram até a borda, passos empilham com o pontilhado vertical, a comanda some e dá lugar à barra de pedido café fixa no rodapé que abre a folha, etapas mostram só o nome da atual, trilha passa a 2 colunas. Abaixo de 640px: produtos sempre em 2 colunas com espaço de 12px, descrição do card some, preço e botão empilham, "+" vira pílula de largura toda, ações do painel empilham com o principal por cima.

## Elevation & Depth

Profundidade por sombra macia, quente (tingida de café) e deslocada para baixo, em dois níveis; o resto é tonal (branco sobre blush). Nada tem contorno duro nem sombra chapada.

### Shadow Vocabulary
- **Sombra** (`0 1px 2px rgb(42 24 16 / 0.06), 0 12px 32px -14px rgb(42 24 16 / 0.28)`): repouso de cards, aros, selos, bloco de detalhe e opção de entrega selecionada; hover das fotos de categoria.
- **Sombra alta** (`0 2px 4px rgb(42 24 16 / 0.08), 0 24px 48px -18px rgb(42 24 16 / 0.35)`): superfícies de trabalho (comanda, painel de finalizar, ficha do pedido, consulta), hover dos cards, barra de pedido e recado flutuantes.
- **Botão do contador** (`0 1px 2px rgb(42 24 16 / 0.12)`): só os botões brancos de menos e mais dentro do contador.
- **Halo de foco do campo** (`0 0 0 4px rgb(192 114 90 / 0.18)`): campo em foco.

### Named Rules
**The Sobe No Hover Rule.** Card que responde a hover sobe 3 a 4px e passa para a sombra alta; só em dispositivos com hover e ponteiro fino.

## Shapes

Tudo arredondado e macio. Superfícies grandes a 24px (cards, comanda, painéis, fotos de categoria), banner a 32px (24px no celular), blocos internos e galeria a 16px, campos a 14px, miniaturas a 12px, botão de pular a 10px. Todo controle que se toca é pílula (botões, abas, chips, contador, selos, barra de pedido, recado) ou círculo (o "+", sacola, pausa do vídeo, números de passo e etapa, fechar). A folha do celular arredonda só os cantos de cima. Fotos sempre recortadas com cobrir, quadradas nos cards da landing e 4:3 no cardápio. Ícones são SVG de traço 2px com pontas redondas (2.5px nos botões pequenos).

## Components

### Buttons
Pílulas firmes, com peso e alvo grande.
- **Shape:** pílula (999px), borda de 2px, altura mínima 52px (44px pequeno, 58px grande no banner).
- **Primary:** terracota escuro com texto branco, Urbanist 700 17px, 12px 26px; ícone de seta ou WhatsApp a 10px do texto.
- **Hover / Pressão:** hover em terracota queimado (só com ponteiro fino); pressão encolhe para 0.97 em 160ms com a curva de saída.
- **Branco:** fundo branco e texto café, para ficar sobre vídeo ou terracota; hover rosa-chá.
- **Contorno:** transparente com borda e texto terracota escuro; hover preenche. Sobre a faixa terracota, borda e texto brancos e hover branco.
- **Desabilitado:** rosa-chá com texto café claro, sem pressão.
- **Link:** texto terracota escuro 700 sublinhado de 2px, alvo de 44px.

### Botão de adicionar (o "+")
Círculo terracota escuro de 48px com "+" em SVG de 22px traço 2.5, no canto inferior direito do card, alinhado ao preço. Hover terracota queimado, pressão 0.92. Quando o produto leva escolhas, o ícone vira seta e leva ao cardápio. Abaixo de 640px vira pílula de largura toda com 44px.

### Contador
Pílula blush com botões circulares brancos de menos e mais (40px, 36px no card) e o número no meio em 800 tabular. Substitui o "+" no card depois do primeiro toque. Pressão 0.9. A prévia do novo total aparece embaixo em verde 700 antes de confirmar.

### Cards / Containers
- **Card de produto:** branco, 24px, sombra; foto em cima (rosa-chá como fundo; sem foto, a marca esmaecida a 55%), corpo 16px 18px 18px com nome, descrição curta e o pé com preço e "+". Selo em pílula no canto de cima (branco "mín. 25", verde "N no pedido"). Bolos e pacotes abrem na largura toda com foto à esquerda e grupos de escolha.
- **Aro de bolo:** branco, 24px, sombra, desenho do aro em SVG, nome em Playfair, "serve" e valor em terracota.
- **Painel / ficha / consulta:** branco, 24px, sombra alta, respiro de 20 a 40px.
- **Blocos internos:** blush a 16px sem borda (grupos de escolha, avisos, trilha, opção de entrega).

### Chips
- **Style:** pílula branca de 36px com borda de 1.5px linha, 600 14px.
- **State:** marcado em terracota escuro com texto branco; esgotado a 45% de opacidade; foco com anel terracota. Servem para escolher recheios, com aviso em vermelho ou confirmação em verde embaixo.

### Inputs / Fields
- **Style:** blush com borda de 1.5px linha, 14px de raio, 52px de altura, 17px 500; cursor terracota; rótulo 700 15px em cima.
- **Focus:** fundo passa a branco, borda terracota escuro e halo translúcido de 4px; hover da borda em salmão.
- **Error:** borda vermelha, fundo rosado e mensagem 600 em vermelho embaixo.
- **Opção de entrega:** cartão blush com ícone terracota; marcado fica branco, com borda de 2px terracota e sombra.

### Navigation
- **Topo:** menu em pílulas café claro 600, hover café sobre blush, página atual em terracota escuro. Sacola: círculo blush de 48px com contador em pílula terracota contornada de branco.
- **Abas do cardápio:** fila horizontal rolável de pílulas blush 700 de 44px; a categoria atual em terracota escuro com texto branco.
- **Rodapé:** faixa cheia terracota escuro, texto branco, logo sobre uma plaquinha branca de 14px, colunas com cabeça 700 13px em caixa alta espaçada, links de 40px.

### Banner com vídeo (assinatura)
Bloco de ponta a ponta da moldura, 32px de raio, altura de até 78% da tela (720px), fundo café enquanto o vídeo carrega. Vídeo do salão mudo e em loop com pôster (versão vertical no celular), véu café em degradê da esquerda (82% para 5%) e de baixo; no celular o véu vem só de baixo. Título display branco com itálico salmão, apoio a 92% de branco, linha de infos com ícones (local, horário, entrega), botões primário e branco grandes. Botão de pausa circular de vidro fosco (branco 18%, desfoque 8px) no canto.

### Comanda e folha (carrinho)
Comanda branca de 24px com sombra alta, fixa ao lado do cardápio: cabeça com título em Playfair 24px, itens com miniatura de 48px a 12px, nome, valor e detalhe, divididos por linha; pé blush com total 800 26px e o botão largo. No celular vira **barra de pedido** (pílula café fixa a 12px das bordas, com quantidade, total e botão pequeno, entra de baixo em 360ms) que abre a **folha**: a mesma comanda subindo de baixo até 88% da tela em 400ms com a curva de gaveta, sobre véu café a 50%.

### Etapas (finalizar)
Fila numerada Itens · Data · Entrega · Revisão: círculos de 34px blush com número, ligados por traço de 2px linha. Etapa atual em terracota escuro com texto branco; concluída em verde com traço verde. No celular só a atual mostra o nome.

### Trilha (acompanhar pedido)
Quatro blocos blush de 16px com ícone SVG de 26px, nome 700 e rótulo pequeno: feito em verde sobre verde-fundo (ícone de check), atual em terracota escuro com texto branco, futuro em café claro; cancelado a 50%. Embaixo, as contas (total, pago, falta) em três colunas com número 800 22px e "falta" em terracota.

### Passos (como pedir)
Três colunas com número em círculo terracota de 52px (Playfair 22px) ligados por pontilhado salmão de 2px; no celular empilham com o pontilhado na vertical.

### Recado
Pílula café flutuante centrada a 24px do rodapé, sombra alta, link em salmão; entra subindo 16px em 280ms.

## Do's and Don'ts

### Do:
- **Do** usar terracota escuro (#a45b45) em todo botão principal, "+", preço, link e seleção; terracota queimado só no hover.
- **Do** pôr a foto ou o vídeo real na frente: foto em cima do card, rosa-chá com a marca esmaecida quando faltar.
- **Do** fazer todo controle tocável em pílula ou círculo, com alvo mínimo de 44px.
- **Do** usar as duas sombras macias tingidas de café; subir o card 3px com a sombra alta no hover, só com ponteiro fino.
- **Do** mostrar preço, quantidade e total com algarismos tabulares, e a prévia do novo total antes de confirmar.
- **Do** manter o anel de foco de 3px em terracota escuro em tudo que recebe foco.
- **Do** usar a curva de saída cubic-bezier(0.23, 1, 0.32, 1) em 140 a 300ms para estados e a de gaveta cubic-bezier(0.32, 0.72, 0, 1) em 360 a 400ms para barra e folha; respeitar redução de movimento.
- **Do** usar ícones SVG de traço com pontas redondas, nunca caracteres como ícone.

### Don't:
- **Don't** usar o terracota da marca (#c0725a) como fundo de botão com texto branco ou como texto; ele não passa contraste.
- **Don't** dar fundo escuro a página ou seção; café como superfície só em véu sobre mídia, barra de pedido, recado e véu da folha.
- **Don't** usar verde fora de estado concluído ou "no pedido".
- **Don't** usar sombra dura, chapada ou deslocada sem desfoque, nem borda grossa como contorno de card.
- **Don't** usar cantos retos ou pequenos em superfícies: nada abaixo de 12px fora de miniaturas e do botão de pular.
- **Don't** voltar ao letreiro pintado (letras com contorno e sombra chapada, placas de preço), rejeitado pela dona.
