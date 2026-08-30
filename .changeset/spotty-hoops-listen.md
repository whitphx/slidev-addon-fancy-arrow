---
"slidev-addon-fancy-arrow": minor
---

Add a line specifier to the endpoint shorthand, so an arrow snaps to a line of a code block without a hand-written `:nth-child()` selector. `to="[data-id=code]{3}"` takes the third line of the matched code block, `{3-5}` takes the box covering a range, and `{1,3-5}` takes several lines or ranges at once. Lines are counted from `1`, the same way Slidev's own line highlighting counts them, and a line specifier on its own, as in `to="{3}"`, takes the first code block on the slide. The long form of the same thing is the new `line1` and `line2` props.
