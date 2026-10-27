---
"slidev-addon-fancy-arrow": patch
---

Guard `useIsPrintMode()` when `useRoute()` is undefined so FancyArrow no longer blanks slides during Slidev preload/HMR.
