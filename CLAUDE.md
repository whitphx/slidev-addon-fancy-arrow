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

A cloud session has no browser, so the only way to look at a slide is to render it to a PNG and read the image back.

```bash
pnpm dev:headless --port 3030 &
node scripts/screenshot.js 1           # writes screenshots/slide-1.png
node scripts/screenshot.js 1 --clicks 3
```

`pnpm dev` is the wrong command here because it passes `--open` and a VM has no browser to open, which is what `dev:headless` exists for. The screenshot script waits for the drawing animations to finish, so a capture shows an arrow in its final state.

`scripts/screenshot.js` finds a browser on its own. The images at claude.ai/code ship Playwright's Chromium at `/opt/pw-browsers/chromium`, which is one of the paths it looks in, so a session there captures slides with no environment setup at all.

The setup script in `.claude/cloud-setup.sh` is a fallback for an image that ships no browser: paste it into the environment's Setup script field, and it installs Chrome. Nothing in the repository runs it. Network access can stay on Trusted either way, since the script pins a Chrome for Testing build rather than looking a channel name up on a host Trusted blocks.

### Exporting a PDF

`pnpm export` needs `playwright-chromium`, which this repository deliberately does not depend on. The version matters: Playwright pins an exact Chromium revision, and the images at claude.ai/code ship revision 1194, which only 1.56.x asks for. Any other version looks for a revision that is not there and fails with `Executable doesn't exist at /opt/pw-browsers/chromium_headless_shell-<revision>`.

```bash
pnpm add -D playwright-chromium@1.56.1                    # the revision the image has
pnpm export                                               # times out on a cold cache
pnpm export                                               # writes slides-export.pdf
git checkout package.json pnpm-lock.yaml && pnpm install  # put the tree back
```

Name the patch version rather than a range. `@1.56` saves `~1.56.1`, which floats across 1.56 patches, and nothing promises they keep the same Chromium revision. Naming it in full saves it in full; `--save-exact` changes nothing, since it is the version spec that decides.

Pinned that way nothing is downloaded, so Trusted access is enough. Any other version fetches its own browser from `cdn.playwright.dev`, which needs a Custom allowlist.

Put the tree back with git rather than `pnpm remove`, which restores `package.json` but leaves the lockfile carrying both the package and the `(playwright-chromium@1.56.1)` peer suffix it added to `@slidev/cli`.

Install it for the session that needs a PDF and leave it out of a commit. The pin only matches whichever image is current, so carrying it in `package.json` would break on the next image bump and hold every other checkout to an old Playwright. The first run failing is Slidev's own export timing out while Vite still compiles, in `@slidev/cli` rather than in anything here.
