---
---

Replace ESLint and Prettier with the Oxc toolchain (oxlint + oxfmt) for linting and formatting, and enable oxlint's type-aware rules. A few internal refactors were made to clear the new type-aware warnings (safer cast removals, a runtime instanceof check in splitPath, consistent early returns), none of which change runtime behavior. No impact on consumers.
