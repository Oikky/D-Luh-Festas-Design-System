---
version: 1
slug: "site-index-html"
primary_target: "site/index.html"
related_targets: ["site/cardapio.html","site/pedido.html"]
---

# Site público D'Luh — landing, cardápio + pedido, acompanhar pedido

**Modo:** Persuade na landing; Operate no cardápio/checkout e no acompanhamento.

**Quem chega:** quem está organizando um aniversário, batizado ou confraternização em Montes Claros, quase sempre pelo celular, vindo do Instagram ou do WhatsApp da loja. Quer ver se é bonito e gostoso, saber quanto custa por cento e se dá pra entregar na data.

**Trabalho:** montar o pedido por quantidade (salgados mín. 25, doces mín. 50, bolo por aro), escolher data/hora e entrega ou retirada, e mandar. O pedido grava no Firestore via Worker `dluh-api` (`/api/criarPedido`), aparece no admin como "Aguardando confirmação" e o cliente recebe o resumo no WhatsApp. Acompanhar pedido: nº do pedido + telefone → status em linguagem de cliente e link de pagamento quando houver.

**Conteúdo real:** catálogo `sis_produtos` (fotos pequenas, 225px, muitas faltando), recheios, WhatsApp (38) 99222-9178. Fotos e vídeos do salão D' Roma Festas (instagram.com/dromafestas) baixados em `site/midia/`. Não inventar depoimentos, números de festas, prazo nem área de entrega.

**Fora do escopo v1:** Empresas (B2B), login Google, bot de triagem, cancelamento pelo site.

## Direction contract

THESIS: O padrão das docerias de referência (Cake Shop, Seja Doce, Sweets App) feito com acabamento impecável e com as fotos reais da casa: foto e vídeo na frente, cards de produto com botão redondo de adicionar, carrinho ao lado do cardápio. Recusa o letreiro pintado (testado e rejeitado pela dona) e qualquer fundo escuro.

OWN-WORLD: Fundo branco e blush #FDF3F0 em faixas; terracota #C0725A nos botões, preços e rodapé cheio; café #2A1810 no texto; rosa-chá #F7E3DC nos fundos de card e chips. Títulos em Playfair Display (itálico nos destaques), texto em Urbanist. Cantos generosos (16–24px), cards com foto em cima, sombra macia com deslocamento; botão de adicionar redondo terracota com "+".

STORY: A pessoa vê a mesa e o salão de verdade, entende que é doce e salgado pra festa em Montes Claros, vê preço por cento e toca "Fazer pedido"; no cardápio escolhe por foto e quantidade com o total ao lado; manda e depois acompanha pelo número.

FIRST VIEWPORT: Banner arredondado de ponta a ponta com o vídeo do salão (mudo, em loop, com pôster) e véu escuro suave; à esquerda "Doces, salgados e bolos pra sua festa" em Playfair branco grande, uma linha de apoio, local e horário de atendimento, e dois botões: "Fazer pedido" (terracota) e "Falar no WhatsApp" (branco). Topo branco com logo, menu e sacola.

FORM: Padrão da categoria (saída canônica escolhida pela dona após rejeitar o sorteio; seed 8178111a), barra de qualidade = as três referências do Behance em `site/_refs/`.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
