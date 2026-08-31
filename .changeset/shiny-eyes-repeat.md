---
"slidev-addon-fancy-arrow": patch
---

Anchor an arrow to the slide it is on rather than to whatever the browser gives its SVG as a containing block, so positions stay right wherever the arrow sits in the markup. An arrow inside a positioned or transformed element, such as `<div class="relative">` or a `v-drag` container, used to draw `x1`/`y1`, `from="(x, y)"` and percentage positions offset by that element's own position, and to snap at the wrong scale when something between the slide and the arrow scaled it. The scale is now measured from the arrow's own SVG instead of taken from the slide's, which also fixes arrows on a slide with a `zoom` frontmatter.
