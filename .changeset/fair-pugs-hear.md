---
"slidev-addon-fancy-arrow": minor
---

Accept plain CSS color values such as `var(--my-color)`, `#ff8800`, and `rgb(255 136 0)` in the `color` prop. Previously the prop only became a `text-*` UnoCSS class, which took effect only for the tokens UnoCSS happened to generate a utility for. UnoCSS tokens keep rendering exactly as before.
