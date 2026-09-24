# Project instructions

## Skills instaladas
As skills vivem em `.agents/skills/` (fonte, formato universal) e são expostas ao Claude Code via symlink em `.claude/skills/`. Elas aparecem automaticamente na lista de skills disponíveis — invoque pelo nome, não leia os arquivos manualmente.

Gerenciamento:
- Emil Kowalski (`github.com/emilkowalski/skills`) — `npx skills@latest add emilkowalski/skills`, versões travadas em `skills-lock.json`
- Impeccable (`github.com/pbakaus/impeccable`) — `npx impeccable install`

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
