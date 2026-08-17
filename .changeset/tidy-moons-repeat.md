---
"slidev-addon-fancy-arrow": patch
---

Regenerate the arrow when `width`, `arc`, `head-type`, `head-size`, `roughness`, `seed`, or `two-way` changes. These props were read once while the component was set up, so a bound value such as `:width="big ? 10 : 2"` kept rendering whatever it resolved to first.
