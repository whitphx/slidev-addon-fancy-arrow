---
"slidev-addon-fancy-arrow": patch
---

Honor an explicit `0` for `head-size` and `roughness`. Both were read with a truthiness check, so a bound `:roughness="0"` fell back to the Rough.js default instead of drawing a straight line.
