One-line: the pill-shaped global search that lives in the admin top bar.

```jsx
<SearchInput value={q} onChange={e => setQ(e.target.value)} onClear={() => setQ("")} />
```

One per screen, always in the top bar, always searching orders by nome/telefone/valor/ID. The clear ✕ only appears when there is text.
