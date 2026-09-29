---
name: D'Luh Admin
description: Painel interno da D'Luh Festas — pedidos, agenda, cozinha, produtos e financeiro, usado pela equipe no balcão e na cozinha.
colors:
  terracotta: "#c0725a"
  terracotta-strong: "#a85f49"
  terracotta-ink: "#8c4d3a"
  terracotta-dark-accent: "#d98b6e"
  terracotta-dark-text: "#e2957a"
  sand-page: "#f9f7f5"
  sand-hairline: "#e8e0d8"
  sand-strong: "#d6cabe"
  white-surface: "#ffffff"
  ink-strong: "#1a1a1a"
  ink-body: "#555555"
  ink-muted: "#6f6a66"
  night-bg: "#080910"
  night-surface: "#101018"
  night-surface-2: "#161622"
  night-surface-3: "#1c1c2b"
  night-text-strong: "#f4f1ee"
  night-text-body: "#b9b4b0"
  night-text-muted: "#8a878e"
  action-charge-entry: "#2563a8"
  action-charge-total: "#6c4a9e"
  action-delivered: "#0f766e"
  action-paid: "#047857"
  action-warn: "#b45309"
  action-danger: "#c0392b"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.35
  title:
    fontFamily: "Urbanist, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Urbanist, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Urbanist, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0.4px"
  numeral:
    fontFamily: "Urbanist, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
rounded:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.terracotta-strong}"
    textColor: "{colors.white-surface}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  input:
    backgroundColor: "{colors.white-surface}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.xs}"
    padding: "10px 12px"
  card:
    backgroundColor: "{colors.white-surface}"
    rounded: "{rounded.lg}"
    padding: "14px 18px"
  status-pill:
    rounded: "{rounded.pill}"
    padding: "3px 10px"
    typography: "{typography.label}"
---

# Design System: D'Luh Admin

## Overview

**Creative North Star: "O caderno da cozinha"**

The admin is the shop's working notebook: warm, edible and quiet, read at 7am with flour on someone's hands. Legibility and large tap targets beat visual flourish every time. It runs in the dark theme by default (`data-theme="dark"` on the shell): near-black night surfaces with terracotta as the one warm voice; the light theme (sand paper, white cards) remains supported.

Colour is almost entirely semantic. Terracotta marks what you can act on and where you are; every other hue means one specific money or lifecycle thing. There is no imagery, gradient, texture or glass inside the product; the only picture is the logo.

**Key Characteristics:**
- One accent (terracotta), everything else semantic.
- Urbanist for the interface and numerals; Playfair Display only for brand moments at 16px and up.
- Flat surfaces separated by hairlines; shadows nearly theoretical.
- Fast, unshowy motion (150/250ms); press scales 2%, nothing moves on hover.
- 44px minimum hit targets on touch; order cards replace tables on small screens.

## Colors

A warm single-accent palette over either sand paper (light) or blue-black night (dark), with a strict semantic layer for status and money actions.

### Primary
- **Terracotta** (#c0725a): brand accent for surfaces, rules, dots, focus rings, chart bars. In dark it lifts to **Terracotta Glow** (#d98b6e), text in **#e2957a**.
- **Terracotta Strong** (#a85f49): fill under white labels (primary buttons), 4.8:1.
- **Terracotta Ink** (#8c4d3a): accent text on light surfaces, 5.9:1.

### Secondary (semantic actions)
- **Charge Entry Blue** (#2563a8): cobrar entrada.
- **Charge Total Violet** (#6c4a9e): cobrar total.
- **Delivered Teal** (#0f766e): marcar entregue.
- **Paid Green** (#047857): pago.
- **Warn Amber** (#b45309): atenção, falta, esperando pagamento.
- **Danger Red** (#c0392b): apagar, cancelar.
Dark theme swaps each for a light tint (e.g. paid #34d399, danger #f87171) with ink labels.

### Neutral
- **Night Bg / Surface / Surface 2 / Surface 3** (#080910 / #101018 / #161622 / #1c1c2b): dark-theme page and layered surfaces; borders are white at 7% / 14% alpha.
- **Night Text** (#f4f1ee strong, #b9b4b0 body, #8a878e muted).
- **Sand Page** (#f9f7f5), **White Surface** (#ffffff), **Sand Hairline** (#e8e0d8), **Sand Strong** (#d6cabe): light theme.
- **Ink** (#1a1a1a strong, #555555 body, #6f6a66 muted): light-theme text. #999 is for non-text marks only.

### Named Rules
**The One Accent Rule.** Terracotta is the only decorative-feeling colour; it marks action, selection and focus, never ornament.
**The Hue Means Money Rule.** A semantic hue never appears decoratively: if something is violet, it is about charging the full amount.
**The Status Is Data Rule.** The seven order-status pills mirror stored values; never invent a status string or colour.

## Typography

**Display Font:** Playfair Display (Georgia fallback)
**Body Font:** Urbanist (system-ui fallback)
**Label/Mono Font:** Courier New, thermal receipt only

**Character:** A geometric, numeral-strong workhorse carrying the whole interface, with a bookish serif reserved for the shop's own voice in titles.

### Hierarchy
- **Display** (600, 26–44px, 1.15, -0.02em): hero numbers on Visão geral.
- **Headline** (Playfair 600, 20px): page titles, modal titles, the kitchen "Fazer agora" name.
- **Title** (Urbanist 600, 16px): card and section titles.
- **Body** (400, 13–14px, 1.5): rows, descriptions, form text.
- **Label** (600, 11px, 0.4–0.5px tracking, UPPERCASE): field labels and the order-id line only.

### Named Rules
**The Serif Floor Rule.** Never Playfair below 16px; never Urbanist Light below 20px.
**The Sentence Case Rule.** Sentence case everywhere; uppercase only for 11px labels.

## Layout

72px icon rail (248px expanded) plus a sticky 64px top bar on desktop; content padding 20/24px, max width 1440px. Below ~760px the rail becomes a bottom tab bar, search drops to its own row, tabs scroll horizontally, and every control reaches 44px. Spacing runs on a 2/4px scale (4, 8, 12, 16, 24, 32); cards stack with 12px gaps, sections with 24px.

## Elevation & Depth

Depth comes from borders and tonal surface steps, not shadows. Four steps only.

### Shadow Vocabulary
- **Card** (`0 2px 8px rgba(0,0,0,.04)`; dark `.4`): resting cards.
- **Soft** (`0 4px 12px rgba(0,0,0,.08)`): autocomplete.
- **Pop** (`0 10px 30px rgba(0,0,0,.18)`): dropdowns.
- **Modal** (`0 10px 40px rgba(0,0,0,.25)`): dialogs, over a `rgba(0,0,0,.45)` scrim (dark `rgba(4,4,8,.66)`).

### Named Rules
**The No Glass Rule.** No backdrop blur or frosted surfaces; they cost frames on the kitchen tablet.

## Shapes

Gently rounded rectangles: 6px inputs and menu items, 8px buttons, 12px icon tiles and dropdowns, 16px cards and modals, 20px hero panels, pill for badges and filters. Circles are reserved for status dots and the spinner. Borders: 1px hairline for structure, 1.5px for interactive outlines, 2px for the active tab underline.

## Components

### Buttons
- **Shape:** gently rounded (8px).
- **Primary:** terracotta strong fill, white label (dark: terracotta glow fill, ink label).
- **Semantic:** the action hues above, one per money/operation action.
- **Ghost / Quiet:** 1.5px border; on hover border and text turn terracotta.
- **Hover / Press:** solid drops to 87% opacity; press scales to 0.98; nothing moves on hover.

### Chips
- **Status pills:** pill radius, tinted background with dark foreground (light) or low-alpha tint with light foreground (dark).
- **Filter pills:** pill radius, terracotta when selected.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** surface over page; header/footer strips split by hairlines.
- **Border:** 1px hairline; depth from border, not shadow.
- **Internal Padding:** 14px 18px. Cards never nest.

### Inputs / Fields
- **Style:** 1px border, 6px radius, surface background.
- **Focus:** accent border plus 3px terracotta glow (`--focus-ring`); never removed.

### Navigation
- Icon rail with Lucide icons in 48px tiles; active item terracotta. Mobile: bottom tab bar. Tabs underline 2px terracotta.

### Order card (signature)
- Order-id label line in accent, customer, date/time, status pill, and the next money action as a semantic button. A 4px terracotta glow pulses twice when the order just changed.

## Do's and Don'ts

### Do:
- **Do** keep terracotta for action, selection and focus only.
- **Do** keep every touch target at 44px or more.
- **Do** write pt-BR, sentence case, money as `R$ 1.480,00`.
- **Do** use Lucide icons instead of navigational emoji.

### Don't:
- **Don't** use gradients, photos, textures or backdrop blur inside the admin.
- **Don't** use a semantic action hue decoratively.
- **Don't** set Playfair below 16px or nest cards.
- **Don't** add entrance animations on lists or bounce/spring motion.
