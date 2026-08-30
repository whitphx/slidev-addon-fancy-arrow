---
"slidev-addon-fancy-arrow": minor
---

Take `vue` and `@slidev/client` from the host deck as peer dependencies, requiring `vue` `^3.5.0` and `@slidev/client` `^51.0.0 || ^52.0.0`. `vue` was previously a direct dependency, which let the addon install a second copy of Vue whenever the deck's own version fell outside its range. A second copy breaks `provide`/`inject` between the arrow components and the deck, so the Slidev composables the components rely on stop seeing the slide context.
