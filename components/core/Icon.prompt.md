One-line: renders a Lucide glyph as an inline SVG that inherits `currentColor` — the only icon primitive in the system.

```jsx
<Icon name="shopping-bag" size={20} />
<Icon name="bell" size={24} strokeWidth={1.75} color="var(--color-accent)" />
```

The page must load Lucide first: `<script src="https://unpkg.com/lucide@0.454.0/dist/umd/lucide.js"></script>`.
Sizes: 20px inline with text, 24px inside a 48px tile (`--icon-size` / `--icon-tile`), 16px in dense table rows.
Never hard-code a colour — let it inherit from the button or row it sits in.
