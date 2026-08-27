# CLAUDE.md

This file provides guidance to coding agents working with code in this repository. `AGENTS.md` is a symlink to it.

## Project Overview

This is a Slidev addon that provides a `<FancyArrow>` Vue component for adding hand-drawn style arrows to Slidev presentations, powered by Rough.js.

## Commands

```bash
# Development - starts Slidev dev server with live demo
pnpm dev

# Run tests (uses vitest)
pnpm test

# Run a single test file
pnpm test components/parse-option.test.ts

# Linting
pnpm lint

# Formatting
pnpm format

# Build the slides for production
pnpm build
```

## Architecture

### Component Structure (`components/`)

The addon exports a single main component `FancyArrow.vue` that renders hand-drawn arrows using SVG.

**Core modules:**
- `FancyArrow.vue` - Main component that orchestrates arrow rendering. Handles props parsing, endpoint resolution, and SVG rendering
- `use-rough-arrow.ts` - Vue composable that generates the actual Rough.js SVG paths for arrows and arrowheads, including animation logic
- `parse-option.ts` - Parses the various endpoint specification formats (CSS selectors, absolute positions, snap positions)
- `position.ts` - Resolves endpoint positions by tracking DOM elements and computing coordinates relative to the slide
- `closest-edge-point.ts` - Calculates snap points when auto-snapping arrows to element edges
- `split-path.ts` - Splits compound SVG paths for proper animation sequencing
- `ChildElementPicker.vue` - Helper component for slot-based endpoint definitions

### Endpoint Specification

Arrows support multiple ways to define endpoints:
1. Absolute positions: `from="(100, 200)"` or `x1="100" y1="200"`
2. CSS selector snapping: `from="[data-id=element]@bottom"`
3. Slot-based: `<template #tail>` and `<template #head>` slots

The `@` syntax specifies snap anchor points: `center`, `top`, `bottom`, `left`, `right`, `topleft`, `topright`, `bottomleft`, `bottomright`, or custom `(x%, y%)` positions.

### Animation System

Arrows animate using CSS stroke-dashoffset animation. The `use-rough-arrow.ts` composable:
1. Calculates total path length
2. Splits paths into segments (arc + arrowheads)
3. Applies sequential animation delays based on segment lengths
4. Uses CSS classes `animated-rough-arrow-stroke` and `animated-rough-arrow-fill`

Animation is disabled during Slidev transitions and when elements are hidden via `v-click`.

## Slidev Integration

The addon integrates with Slidev via `@slidev/client` imports for:
- `useIsSlideActive()` - Only resolve snap targets on active slides
- `useNav()` - Detect print mode to disable animations
- `$scale` - Account for slide scaling when calculating positions
- `slideWidth`/`slideHeight` - Convert percentage positions to pixels

## Documentation

When modifying the `<FancyArrow>` component interface (props, slots, usage patterns), update:
- `README.md` - User-facing documentation with usage examples
- `slides.md` - Live demo slides that also serve as documentation

## Cloud sessions

A cloud session has no browser, so the only way to look at a slide is to render it to a PNG and read the image back.

```bash
pnpm dev:headless --port 3030 &
node scripts/screenshot.js 1           # writes screenshots/slide-1.png
node scripts/screenshot.js 1 --clicks 3
```

`pnpm dev` is the wrong command here because it passes `--open` and a VM has no browser to open, which is what `dev:headless` exists for. The screenshot script waits for the drawing animations to finish, so a capture shows an arrow in its final state.

`scripts/screenshot.js` finds a browser on its own. The images at claude.ai/code ship Playwright's Chromium at `/opt/pw-browsers/chromium`, which is one of the paths it looks in, so a session there captures slides with no environment setup at all.

The setup script in `.claude/cloud-setup.sh` is a fallback for an image that ships no browser: paste it into the environment's Setup script field, and it installs Chrome. Nothing in the repository runs it. Network access can stay on Trusted either way, since the script pins a Chrome for Testing build rather than looking a channel name up on a host Trusted blocks. Add `cdn.playwright.dev` to a Custom allowlist if `pnpm export` should work there too, which also needs `playwright-chromium`, a package this repository does not depend on.
