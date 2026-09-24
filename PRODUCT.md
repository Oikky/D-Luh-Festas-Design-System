# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Four roles share one internal admin for **D'Luh Festas**, a bakery and party business in Montes
Claros (MG), Brazil — *doces e salgados pra festas*, plus buffet and hall rental.

- **Luciana (dona).** Full access: pedidos, agenda, financeiro, contratos. The decision-maker.
  She is the person the interface is designed around.
- **Equipe de cozinha.** Production panel only — the queue, "Fazer agora", confirming delivery.
  Used on a shared tablet, early morning, hands often busy or floured.
- **Atendimento / vendas.** Enters manual orders, talks to the customer, sends charges. Does not
  touch financeiro.
- **Contador / financeiro.** Boletos, card statements, DAS, month-end close. May be external to
  the shop.

Role separation is confirmed as a real operating fact; **permission enforcement is undecided** —
no access-control model exists in the code today.

## Product Purpose

Run the whole shop from one internal panel: take an order, get it paid, get it made, get it
delivered, and keep the money and the paperwork straight. It replaces WhatsApp threads,
spreadsheets and the owner's memory as the place where the state of a party order lives.

The brief the team gave: *"Admin moderno para a D'Luh, clean, agradável visualmente e com as
melhores práticas de UI/UX, com acesso também mobile completo, mas sem perder recursos
importantes no desktop."*

Success is that the person on shift knows, without asking anyone, what is due today, what is
paid, and what has to go in the oven next.

## Positioning

A single panel built around the actual lifecycle of a *festa* order — where one order can be
partially paid, split between delivery and pickup, carry a customer-written cake topper, and
belong to a recurring B2B contract at the same time. Generic order/POS software models a
transaction; this models a commitment with a date, a kitchen, and a remaining balance.

## Operating Context

- **Two scenes, one product.** Desktop/laptop for the owner and atendimento (dense, full
  capability). Tablet and phone for the kitchen and for the owner away from the shop. Mobile is
  full-capability, not a reduced view.
- **Real usage moment:** 7am, flour on hands, tablet on a counter. Legibility and large hit
  targets outrank visual flourish.
- **Order lifecycle** (the six Status values, mirrored from a Coda single-select):
  `Aguardando confirmação` · `Verificando Estoque` · `Confirmado — Esperando pagamento` ·
  `Pago — Em produção` · `Entregue — Esperando restante` · `Finalizado` · `Cancelado`.
- **Payment state** is its own axis: `Não pago` / `Só entrada` / `Totalmente pago`.
- **Systems the product already talks to:** Coda (the record of truth for orders), Telegram
  (the "Confirmar Estoque" round-trip), InfinitePay (payment links), WhatsApp (customer
  notifications), Firebase (auth), a thermal receipt printer.
- **Adjacent customer-facing surfaces** in the same product family, out of scope for this repo's
  admin work: `cardapio.html` (ordering), `empresas.html` (B2B), `index.html` (landing), and
  **Bia**, a separate customer-facing WhatsApp assistant persona.

## Capabilities and Constraints

- **This repository is the new admin.** `ui_kits/admin/` is not a reference mock — it is becoming
  the shipped panel and will replace the live `admin.html`. Screens here are the product.
- **Upstream product of record:** `github.com/sitedluh/site` (branch `main`), whose `CLAUDE.md`
  holds the architecture, order lifecycle and business rules. `github.com/Oikky/New` was attached
  as a design-system repo but is empty; nothing came from it.
- **Stack constraint (existing, not chosen here):** framework-free. Plain CSS with custom
  properties (`styles.css` → `tokens/*.css`), React 18 + Babel standalone from CDN, Lucide from
  CDN, no build step, no package.json, no bundler. Any future work must keep working when opened
  as a file.
- **Confirmed built today:** 24 component primitives (core, forms, navigation, feedback, data),
  a full token layer, a `data-theme="dark"` theme, and 20 foundation specimen cards in
  `guidelines/`.
- **Proposals, not shipped product:** Visão geral, Agenda, Financeiro and Contratos. The live
  admin today has only **pedidos** and **cozinha**. Their data shapes are invented (`data.js`,
  `contratos-data.js`) — future work must not describe them as existing features or cite their
  numbers as real.
- **Contract clause text** in `uploads/Gerador de Contratos*.html` is transcribed from real
  generators; the clauses are real even though the Contratos screen is a proposal.
- **Never invent a Status or Pago? string.** A value that does not exist in the Coda single-select
  is written silently wrong.
- **Not implemented anywhere in this repo:** Firebase auth, the Telegram round-trip, InfinitePay
  links, the thermal print sheet, and Coda writes. Everything touching money is a mock.
- **Undecided:** the permission/role-access model, how this repo deploys over the live admin, and
  whether the dark theme ships to customers of the panel.

## Brand Commitments

- **Name:** D'Luh Festas. Mark at `assets/logo-dluh-festas.png` (transparent) and `logo.png` (as
  shipped live).
- **Language: Brazilian Portuguese, always.** Not pt-PT phrasing, never English labels.
  *Pedido, Cliente, Entrega, Retirada no local, Cobrar entrada, Marcar entregue, Apagar.*
- **Voice:** the shop talking to its own team. Plain, warm, unbureaucratic; names the consequence
  rather than the feature. Addresses the operator as *você*, mostly through imperatives. The
  admin has no personality of its own — no "eu"/"nós".
- **Casing:** sentence case everywhere; UPPERCASE reserved for 11px field labels and the order-id
  line.
- **Destructive actions ask a question** and the confirm button repeats the verb
  (*"Finalizar pedido?" → "Sim, finalizar"*). Never "OK".
- **Toasts:** past tense, one line, no full stop (*"Pedido confirmado"*).
- **Formats:** `R$ 1.480,00` · dates `12/06` · times `15h` / `15:00` · phones `(38) 99812-4410`.
- **Emoji are content, not UI.** They survive only in the customer-written 🎀 topper note and in
  WhatsApp/Telegram message bodies.
- **Binding visual constraints the owner set:** terracotta `#C0725A` and Playfair Display are
  D'Luh's own fonts-and-palette of record and were deliberately kept over the dark-violet
  concept board supplied in `uploads/FINANCIA_*.png`. No third-party brand identity is reproduced.

## Evidence on Hand

- Real: the upstream product code and business rules in `sitedluh/site`; the brand mark; the
  contract clause text in `uploads/`; the six Coda Status values and three payment states.
- Supplied reference: `uploads/FINANCIA_01…15.png`, a 2026 fintech-dashboard concept board used
  for layout and type language only — **not** for brand identity.
- **Absent, and not to be fabricated:** customer testimonials, revenue figures, order volumes,
  headcount, pricing tables, delivery-area data, any metric in Visão geral or Financeiro, and any
  claim about what the panel currently automates. `data.js` is fake.
- No photography inside the admin by design. `hero.jpg` belongs to the marketing site.

## Product Principles

1. **The kitchen shift wins the tie.** When density and legibility conflict, the 7am tablet
   decides. Big targets, high contrast, no hover-only affordances.
2. **Mobile loses nothing.** Small screens change the layout, never the capability set.
3. **Colour is semantic, never decorative.** A hue means a lifecycle state or a money action; if
   something is violet it is about charging the full amount.
4. **Coda's vocabulary is law.** Status, payment state and field names come from the record of
   truth, not from what reads better in a mockup.
5. **Say the consequence.** Labels and confirmations name what will happen to the order, the
   customer, or the money — not what the control is.

## Accessibility & Inclusion

Confirmed product requirements, not a generic standard: minimum 44px hit targets on touch,
focus always visible (never removed), no information carried by colour alone (status pills pair
hue with text), and full keyboard operability for the desktop roles. Legibility at arm's length
on a shared kitchen tablet is a functional requirement, not a preference.
