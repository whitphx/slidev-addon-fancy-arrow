---
name: cloud-session-rendering
description: Look at a slide or export a PDF in a session with no browser, such as a Claude Code cloud session. Use before rendering slides to PNG with scripts/screenshot.js or running pnpm export.
---

# Rendering slides without a browser

A cloud session has no browser, so the only way to look at a slide is to render it to a PNG and read the image back.

```bash
pnpm dev:headless --port 3030 &
node scripts/screenshot.js 1           # writes screenshots/slide-1.png
node scripts/screenshot.js 1 --clicks 3
```

`pnpm dev` is the wrong command here because it passes `--open` and a VM has no browser to open, which is what `dev:headless` exists for. The screenshot script waits for the drawing animations to finish, so a capture shows an arrow in its final state.

`scripts/screenshot.js` finds a browser on its own. The images at claude.ai/code ship Playwright's Chromium at `/opt/pw-browsers/chromium`, which is one of the paths it looks in, so a session there captures slides with no environment setup at all.

The setup script in `.claude/cloud-setup.sh` is a fallback for an image that ships no browser: paste it into the environment's Setup script field, and it installs Chrome. Nothing in the repository runs it. Network access can stay on Trusted either way, since the script pins a Chrome for Testing build rather than looking a channel name up on a host Trusted blocks.

## Exporting a PDF

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
