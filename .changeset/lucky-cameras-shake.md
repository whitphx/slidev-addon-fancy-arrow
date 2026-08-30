---
"slidev-addon-fancy-arrow": minor
---

Take `vue` and `@slidev/client` from the host deck as peer dependencies, requiring `vue` `^3.5.0` and `@slidev/client` `^51.0.0 || ^52.0.0`. The addon ships its components as source for the deck's own toolchain to compile, so both belong to the deck. `vue` was a direct dependency, so installing the addon pulled down a second copy of Vue that Slidev's bundler then aliased away, and `@slidev/client` was imported by the components without ever being declared. The `@slidev/client` peer is optional, since it already arrives with `@slidev/cli`, so there is nothing extra to install.
