# D'Luh Festas — Design System

D'Luh Festas is a bakery and party-catering business in Montes Claros (MG), Brazil — *doces e
salgados pra festas*: cakes, savouries, sweets, party orders for people and for companies. It
runs on a small, framework-free web stack the owner and Claude Code maintain together, and this
design system is the visual and component layer for **the modern admin** the team asked for:
*"Admin moderno para a D'Luh, clean, agradável visualmente e com as melhores práticas de UI/UX,
com acesso também mobile completo, mas sem perder recursos importantes no desktop."*

Everything here is in **pt-BR**, because the product is.

---

## Sources this system was built from

| Source | What it gave us | Access |
| --- | --- | --- |
| **github.com/sitedluh/site** (branch `main`) | The real product. `admin.html` + `admin.css` (tokens, order cards, status badges, modals), `painel-pedidos.html` (kitchen panel), `cardapio.html` / `empresas.html` (customer and B2B ordering), `index.html` (landing), `logo.png`, `hero.jpg`, and `CLAUDE.md` — the product bible: architecture, order lifecycle, business rules. | Read in full for tokens, components and the UI kit. |
| **github.com/Oikky/New** | Attached as the design-system repo, but it is an **empty repository** (GitHub returns 409 for both `main` and `master`). Nothing was imported from it. | ⚠️ Empty — see Caveats. |
| `uploads/FINANCIA_01…15.png` | A 2026 fintech-dashboard concept board supplied as the *visual target*: dark UI, 48px rounded icon tiles, big numerals, sidebar rail, pill filters, KPI + chart cards, and an explicit spec for typography (**Urbanist** 400/500/600/700) and iconography (24px glyph in a 48px box). | Used for structure, type and layout language — **not** for brand identity. |
| `uploads/Logo D'Luh.png` | The brand mark. Colours sampled from it feed the brand palette. | Copied to `assets/logo-dluh-festas.png`. |

Explore those repositories yourself if you have access — reading the real `admin.js` and
`cardapio.html` will always beat guessing at how the product behaves.

### The one deliberate judgement call

The concept board is dark violet; D'Luh is warm terracotta on cream. We kept **D'Luh's own
palette and fonts-of-record** (terracotta `#C0725A`, Playfair Display) and took from the board
what is genuinely transferable: the layout system, the icon-tile language, Urbanist as the UI
face, and a full **dark theme** (`data-theme="dark"`) that carries terracotta as the accent.
No third-party brand identity was reproduced.

---

## Index

| Path | What's in it |
| --- | --- |
| `styles.css` | The entry point consumers link. Imports only. |
| `tokens/` | `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `shape.css`, `motion.css`, `theme-dark.css` |
| `components/` | React primitives, grouped by concern (see below) |
| `ui_kits/admin/` | Navigable recreation of the admin — `index.html`, `Shell.jsx`, `VisaoGeral.jsx`, `Pedidos.jsx`, `Cozinha.jsx`, `App.jsx`, `data.js`, `README.md` |
| `guidelines/` | 20 foundation specimen cards (Colors, Type, Spacing, Shape, Motion, Brand) |
| `assets/` | `logo-dluh-festas.png` (transparent brand mark), `logo.png` (the mark as shipped on the live site — actually a JPEG), `hero.jpg` (landing cover) |
| `SKILL.md` | Agent-skill wrapper, for use in Claude Code |
| `github.md` | Upstream repo association and screen map |

### Components

**core/** — `Button`, `IconButton`, `Badge`, `StatusBadge`, `Card`, `Spinner`, `EmptyState`, `Icon`
**forms/** — `Field`, `Input`, `Select`, `SearchInput`
**navigation/** — `SidebarNav`, `Topbar`, `Tabs`, `FilterPill`, `DropdownMenu`
**feedback/** — `Modal`, `ConfirmDialog`, `Toast`
**data/** — `StatCard`, `Sparkline`, `ListRow`, `DataTable`, `OrderCard`, `UserChip`

Each has a `.d.ts` (props contract) and a `.prompt.md` (what it is, when to use it, a real example).

**Intentional additions.** The live product is plain HTML with no component library, so the
inventory above was reverse-engineered from its CSS classes (`.btn-confirmar`, `.sc-badge`,
`.card-menu-dropdown`, `.confirm-box`, `.manual-grid`…). Four components have no direct
counterpart in the source and were added on purpose:
`Icon` (a wrapper for the Lucide set — the source uses emoji), `StatCard` + `Sparkline`
(the "visão geral" screen the team asked for), and `UserChip` (the signed-in person, which the
current admin simply doesn't show).

---

## Content fundamentals

**Language: Brazilian Portuguese, always.** Not "pt-PT" phrasing, not English labels. `Pedido`,
`Cliente`, `Entrega`, `Retirada no local`, `Cobrar entrada`, `Marcar entregue`, `Apagar`.

**Voice: the shop talking to its own team.** Plain, warm, unbureaucratic. It names the
consequence instead of describing the feature:

> "Mesmo fluxo do site: registra no Coda, notifica o Telegram (Confirmar Estoque) e segue o
> ciclo normal — cobrança, fila da cozinha, avisos no WhatsApp do cliente."

> "Edite o que precisar — produtos, quantidades, valores, dados do cliente, entrega, pagamento,
> data/hora e observações."

**Person.** The interface addresses the operator as *você*, implicitly — mostly it just uses
imperatives (*Edite o que precisar*, *Adicionar item*). Never "eu"/"nós"; the system doesn't
have a personality in the admin. (The customer-facing WhatsApp assistant is a separate persona
called **Bia** and is out of scope here.)

**Casing.** Sentence case everywhere — buttons, titles, menu items. UPPERCASE only for the
11px field labels and the order-id line, always with `.4px`–`.5px` tracking.

**Questions for destructive things.** Confirm dialogs use a question title and a verb-repeating
confirm button: *"Finalizar pedido?" → "Sim, finalizar"*. Never "OK".

**Toasts** are past-tense, one line, no full stop: *"Pedido confirmado"*, *"Dados copiados"*.

**Money and dates.** `R$ 1.480,00` (non-breaking space after R$, comma decimals, dot thousands).
Dates `12/06`, times `15h` or `15:00`. Phones `(38) 99812-4410`.

**Emoji.** The live admin is full of them (🎂 📦 ➕ 🖨️ 🛵 🎀 🏢). This system **replaces
navigational and action emoji with Lucide icons** — they were standing in for an icon set the
project never had. Emoji survive in exactly two places, because they are content, not UI:
the 🎀 topper note written by the customer, and WhatsApp/Telegram message bodies.

**Never invent a Status string.** The six values in `StatusBadge` mirror a Coda single-select;
a value that doesn't exist there is written **silently wrong**. Same for `Pago?`
(`Não pago` / `Só entrada` / `Totalmente pago`).

---

## Visual foundations

**The feeling.** Warm, edible, quiet. Cream paper, terracotta ink, a lot of white space, and
almost no decoration. The admin is used at 7am with flour on someone's hands — legibility and
big tap targets beat visual flourish every time.

**Colour.** Terracotta `#C0725A` is the single accent: primary buttons, active nav, links, the
order-id line, focus rings, chart bars. Neutrals are warm, never grey-blue — sand `#F9F7F5`
page, white cards, `#E8E0D8` hairlines, `#1A1A1A` / `#555` / `#999` text. Two background
colours per screen at most (sand page + white surfaces).
Beyond the accent, colour is strictly **semantic**: seven status pills (one per lifecycle
value) and six action hues (blue *cobrar entrada*, violet *cobrar total*, teal *marcar
entregue*, green *pago*, amber *atenção/falta*, red *apagar*). A hue never appears
decoratively — if something is violet it is about charging the full amount.

**Type.** Two families. **Urbanist** (300–700) for the whole interface — geometric, neutral,
excellent numerals. **Playfair Display** (500/600/700) for brand moments only: page titles,
modal titles, the "Fazer agora" name in the kitchen. Body copy sits at 13–14px, labels at 11px
uppercase, page titles at 20px, hero numbers at 26–34px with `-.02em` tracking. Never Playfair
below 16px; never Urbanist Light below 20px.

**Backgrounds.** Flat colour. No gradients, no photography, no patterns, no texture inside the
product. The only image in the admin is the logo. (`hero.jpg` exists for the marketing site.)
The one exception is the kitchen "Fazer agora" block, a solid terracotta panel — a flat fill,
not a gradient.

**Cards.** White surface, 1px `#E8E0D8` border, 16px radius, and a shadow so faint it is almost
theoretical (`0 2px 8px rgba(0,0,0,.04)`). Depth comes from the border, not the shadow. Header
and footer strips are separated by hairlines; the footer sits on `#F9F7F5`. Cards never nest.

**Elevation.** Four steps only: card `.04` → autocomplete `.08` → dropdown `.18` → modal `.25`.
Modals also dim the page with `rgba(0,0,0,.45)`.

**Corner radii.** 6px inputs and menu items · 8px buttons · 12px icon tiles and dropdowns ·
16px cards and modals · 20px hero panels · pill for badges and filters. Rounded squares for
avatars and icon tiles; circles are reserved for status dots and the spinner.

**Borders.** 1px hairline for structure, 1.5px for interactive outlines (outline buttons, the
status select), 2px for the tab underline. A 1.5px terracotta border is the "you can act on
this" signal.

**Transparency and blur.** Essentially unused in the light theme — only the scrim behind modals
and `rgba(255,255,255,.22)` chips on the terracotta panel. In the dark theme, borders become
`rgba(255,255,255,.07)` and status pills become low-alpha tints. No frosted glass, no backdrop
blur; they cost frames on the kitchen tablet.

**Motion.** Fast and unshowy. 150ms for hover/border/colour, 250ms for the toast and the sidebar
expand, 800ms for the spinner sweep, all on `cubic-bezier(.4,0,.2,1)`. No bounce, no spring, no
entrance animation on lists. The single expressive moment is `--glow-accent`: a 4px terracotta
ring that pulses twice on an order card that just changed.

**Hover.** Solid buttons drop to 87% opacity. Outline and ghost controls swap their border and
text to terracotta (that is the live `btn-refresh`/`btn-detalhes` behaviour). Rows tint to
`--color-surface-2`. Nothing moves or scales on hover.

**Press.** A 2% scale-down (`--press-scale`) and nothing else — no colour change, no shadow.

**Focus.** 1px accent border plus a 3px terracotta glow (`--focus-ring`). Visible on keyboard
and on touch; never removed.

**Layout.** 72px icon rail (248px when expanded) + 64px top bar on desktop; content padding
20/24px, 16/10px on mobile, max width 1440px. Below ~600px the rail becomes a bottom tab bar,
the search drops to its own row, tabs scroll horizontally with the scrollbar hidden, and every
hit target is at least 44px. Order cards replace tables on small screens. The top bar is sticky;
nothing else is fixed.

**Imagery.** There isn't any, by design. Product photos live on the customer-facing
`cardapio.html`, never in the admin. When a photo is needed elsewhere it is warm-toned, natural
light, food-forward — see `assets/hero.jpg`. No grain, no duotone, no filters.

---

## Iconography

**Set: [Lucide](https://lucide.dev), loaded from CDN.** The product has **no icon system at all**
today — the live admin uses emoji (🎂 📦 ➕ 🖨️) and three hand-written inline SVGs. The concept
board specifies a thin-stroke outline set at 24px inside a 48px box, which Lucide matches
closely (it does not match the board's exact drawings — **this is a flagged substitution**, see
Caveats).

```html
<script src="https://unpkg.com/lucide@0.454.0/dist/umd/lucide.js"></script>
```

Then use the `Icon` component, which reads the glyph data off `window.lucide` and renders a real
`<svg>` inheriting `currentColor`:

```jsx
<Icon name="receipt-text" size={20} />
```

**Rules.** Outline only, never filled. Stroke `1.75`. Sizes: **24px** inside a 48px tile
(nav rail, toolbars), **20px** inline with text, **17px** inside buttons, **16px** in dense
rows, **12px** inside a badge. Icons are monochrome and inherit the colour of whatever they sit
in — never tint an icon for decoration. Every icon-only control needs a `label`.

**Vocabulary** (the ones the admin actually needs): `layout-dashboard` visão geral ·
`receipt-text` pedidos · `chef-hat` cozinha · `cake-slice` bolo · `users` clientes ·
`wallet` / `banknote` / `credit-card` dinheiro · `truck` entrega · `shopping-bag` retirada ·
`link` cobrança · `badge-check` pago · `bell-ring` notificar · `printer` recibo ·
`file-text` detalhes · `sliders-horizontal` filtro · `calendar-days` data · `search` busca ·
`menu` mais ações · `trash-2` apagar · `settings` / `log-out`.

**No emoji in UI, no unicode glyphs as icons** (the live `✕`, `➕` and `☰` become `x`, `plus`
and `menu`). **Never hand-draw an SVG icon** — if Lucide doesn't have it, pick the nearest
Lucide glyph and note it.

---

## Caveats & open questions

1. **`Oikky/New` is empty.** It was attached as the design-system repo but contains no commits.
   Everything here comes from `sitedluh/site` instead. If there is a different repo you meant,
   point us at it and we'll re-derive the tokens.
2. **Icon substitution.** Lucide stands in for the concept board's bespoke icon set. If you own
   that set (or an Iconsax/Solar licence), drop the SVGs into `assets/icons/` and we'll swap the
   `Icon` component over to them.
3. **Fonts are Google-hosted, not local.** Urbanist and Playfair Display load via
   `tokens/fonts.css`; no binaries ship with this system, so the compiler reports zero
   `@font-face` rules. Send us the licensed files if you need self-hosting.
4. **The dark theme is an addition, not a spec.** It exists because the concept board is dark
   and a kitchen screen at night benefits from it. Nothing in the live product is dark today.
5. **"Visão geral" is a new screen.** The live admin has no dashboard. It is built only from
   numbers the system already stores, but the metrics themselves are a proposal.
