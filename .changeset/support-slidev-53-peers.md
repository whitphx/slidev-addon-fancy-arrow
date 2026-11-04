---
"slidev-addon-fancy-arrow": patch
---

Support Slidev 53 and Vue Router 5 in the peer dependency ranges. With the older ranges, a Slidev 53 deck could install a second copy of Vue Router just for this addon, which Slidev does not merge with its own. FancyArrow then could not see Slidev's router and fell back to the `?print` query alone, so it missed the `/export` page and did not follow navigation. With one shared router, print mode is detected in full again.
