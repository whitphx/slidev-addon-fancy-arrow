#!/bin/bash
# Setup script for Claude Code cloud environments, kept here so that it is
# versioned and reviewable. Nothing in the repository runs it: paste it into the
# Setup script field of the environment at claude.ai/code.
#
# It is a fallback, not a requirement. Those images ship Playwright's Chromium at
# /opt/pw-browsers/chromium, which scripts/screenshot.js looks for by itself, so
# an environment only needs this script when its image ships no browser at all.
#
# Project dependencies are installed by the SessionStart hook in settings.json
# instead, because that one runs in the repository directory.
#
# A non-zero exit stops the session from being created, so nothing here is
# fatal. Without Chrome a session runs everything except screenshots.
set -uxo pipefail

# `@puppeteer/browsers` looks a channel name up through googlechromelabs.github.io,
# which the Trusted network access level does not allow, while it takes a
# four-part build id as given and downloads it from storage.googleapis.com, which
# Trusted does allow. Bumping this is manual; any Chrome for Testing build works.
CHROME_VERSION=152.0.7977.64

chrome="$(command -v google-chrome || command -v chromium || command -v chromium-browser)"
if [ -z "$chrome" ]; then
  # The installer prints "chrome@<version> <path>".
  if ! chrome="$(npx --yes @puppeteer/browsers install "chrome@$CHROME_VERSION" --path /opt/chrome | tail -1 | cut -d " " -f 2-)"; then
    echo "Chrome install failed, so scripts/screenshot.js has nothing to drive." >&2
  fi
fi

# A session does not inherit this script's environment, so CHROME_PATH cannot be
# handed over that way. scripts/screenshot.js looks for this symlink.
if [ -x "$chrome" ] && [ "$chrome" != /usr/local/bin/google-chrome ]; then
  ln -sf "$chrome" /usr/local/bin/google-chrome
fi

exit 0
