# Project instructions

## Skills instaladas
As skills vivem em `.agents/skills/` (fonte, formato universal) e são expostas ao Claude Code via symlink em `.claude/skills/`. Elas aparecem automaticamente na lista de skills disponíveis — invoque pelo nome, não leia os arquivos manualmente.

Gerenciamento:
- Emil Kowalski (`github.com/emilkowalski/skills`) — `npx skills@latest add emilkowalski/skills`, versões travadas em `skills-lock.json`
- Impeccable (`github.com/pbakaus/impeccable`) — `npx impeccable install`
- taste-skill (`github.com/Leonxlnx/taste-skill`) — `npx skills@latest add Leonxlnx/taste-skill`, versões travadas em `skills-lock.json`. **É um pacote de 13 skills, não uma.**

### Emil Kowalski
Antes de trabalho de animação, motion, polish de interação ou UI engineering, use a skill correspondente:
- `emil-design-eng` — princípios de design engineering (para qualquer polish de UI)
- `animate` (+ `RECIPES.md`) — adicionar animações
- `animation-vocabulary` — terminologia de motion
- `find-animation-opportunities` — onde motion ajuda
- `improve-animations` — auditoria + plano para motion existente
- `review-animations` — review contra `STANDARDS.md`
- `apple-design` — design no estilo Apple
- `prototype` — fluxo de prototipagem
- `pick-ui-library`, `ask-sonner` — escolha de biblioteca, toasts Sonner
- `performance-cheatsheet.md` (na raiz) — performance de animação

Não aplicáveis a este projeto (web/HTML): `animate-expo`, `mobile-native`, `write-swift`.

### Impeccable
Para trabalho de qualidade de design, use a skill `impeccable`; ela roteia para `reference/<command>.md` (audit, critique, polish, typeset, colorize, layout, animate, distill, bolder, quieter, delight, harden, adapt, clarify, optimize, etc.). Esta instalação inclui a engine local (`scripts/bin/`), os hooks e os agents do Claude Code, então os passos que dependem de runtime funcionam.

Impeccable é a autoridade de design deste projeto. `PRODUCT.md` (raiz) guarda a verdade de produto — usuários, ciclo de vida do pedido, integrações, o que é real e o que é proposta. Leia antes de decidir qualquer coisa de UI. `.impeccable/config.json` registra `buildPath: code` (code-first): construir direto no código, sem gerar comp antes. Não repergunte isso.

### taste-skill (Leonxlnx)
Pacote de 13 skills de "taste" visual. **A maioria não deve ser usada em trabalho da D'Luh** — são skills prescritivas de estética, e a D'Luh já tem mundo visual fechado (terracota `#C0725A`, Playfair Display para momentos de marca, Urbanist na interface, superfícies creme, cor só semântica). Redirecionar um brief fechado para a estética de outra skill é erro, não melhoria.

**Nunca em tela da D'Luh — contradizem a marca:**
- `industrial-brutalist-ui` — terminal militar, degradação analógica, grids rígidos
- `minimalist-ui` — monocromático morno, pastéis dessaturados, sem sombra
- `gpt-taste` — estrutura AIDA, bento gapless, GSAP ScrollTrigger com pinning/scrubbing, espaçamento gigante entre seções. É vocabulário de landing page de marketing, não de admin; e scroll-pinning custa frames no tablet da cozinha, exatamente o que o sistema evita ao proibir backdrop blur.

**Competem com o roteamento do `impeccable`** — escolha uma autoridade por tarefa, não empilhe:
- `design-taste-frontend` (v2) e `design-taste-frontend-v1` — landing pages, portfólios, redesign
- `high-end-visual-design` — padrões de "agência premium"
- `redesign-existing-projects` — auditoria + upgrade de projeto existente
- `stitch-design-taste` — **gera o próprio `DESIGN.md`**, colide de frente com o do Impeccable

**Aditivas e úteis aqui** (geração de imagem, que o resto do toolset não cobre bem) — mas lembre que o projeto é code-first, então servem para board de referência e asset, não para o caminho de build:
- `imagegen-frontend-web`, `imagegen-frontend-mobile` — comps de referência por seção/tela
- `image-to-code` — gera a imagem e implementa a partir dela
- `brandkit` — boards de identidade e apresentação de marca

**Utilitária, neutra:** `full-output-enforcement` — proíbe truncamento e placeholder na saída de código.
