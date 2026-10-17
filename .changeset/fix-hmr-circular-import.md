---
"slidev-addon-fancy-arrow": patch
---

Avoid importing `@slidev/client` barrel APIs that pull `#slidev/slides`, which closed an HMR circular import and forced a full page reload on every `slides.md` edit.
