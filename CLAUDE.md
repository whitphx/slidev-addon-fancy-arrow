# CLAUDE.md

This file provides guidance to coding agents working with code in this repository. `AGENTS.md` is a symlink to it.

## Project Overview

This is a Slidev addon that provides a `<FancyArrow>` Vue component for adding hand-drawn style arrows to Slidev presentations, powered by Rough.js.

## Slidev Integration

The addon integrates with Slidev via **deep** `@slidev/client/*` imports (not the package barrel) for:
- `useSlideContext()` from `@slidev/client/context.ts` — `$scale`, `$page`, `$nav` (active-slide checks)
- `slideWidth`/`slideHeight` from `@slidev/client/env.ts` — Convert percentage positions to pixels

Local wrappers in `components/use-slidev-context.ts` use slide context for active-slide checks and Vue Router for print-mode detection, because Slidev's fixed navigation omits `isPrintMode`. Do **not** import `useNav` or `useIsSlideActive` from `@slidev/client`: those pull `#slidev/slides` into the module graph and create an HMR circular import that forces a full page reload on every `slides.md` edit (see issue #449).

## Documentation

When modifying the `<FancyArrow>` component interface (props, slots, usage patterns), update:
- `README.md` - User-facing documentation with usage examples
- `slides.md` - Live demo slides that also serve as documentation

## Deployment

The demo deploys to Cloudflare Pages from the `build-demo` job in `.github/workflows/ci.yml`, which runs `wrangler pages deploy` against the `slidev-addon-fancy-arrow` project through Cloudflare's own `wrangler-action`. A push to `main` updates production at <https://slidev-addon-fancy-arrow.pages.dev/>; every other branch gets a preview of its own, whose URL the job posts as a single comment on the pull request and rewrites on each push.

That needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repository secrets. A pull request from a fork cannot read them, so it builds as a check and skips the deploy.

The build takes no `--base`, since Cloudflare serves the demo from the root of its domain rather than a subdirectory.

## Cloud sessions

To look at a slide or export a PDF in a session with no browser, follow `.claude/skills/cloud-session-rendering/SKILL.md`.
