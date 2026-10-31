---
"slidev-addon-fancy-arrow": patch
---

Support Slidev 53 and Vue Router 5 in the peer dependency ranges. Before, a Slidev 53 project could install a second copy of `@slidev/client` and Vue Router 4 just for this addon. FancyArrow then could not see Slidev's router, and slides that use it went blank.
