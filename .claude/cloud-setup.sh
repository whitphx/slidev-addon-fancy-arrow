#!/bin/bash
# Setup script for Claude Code cloud environments, kept here so that it is
# versioned and reviewable. Paste it into the Setup script field of the
# environment at claude.ai/code. Nothing in the repository runs it.
#
# Project dependencies are installed by the SessionStart hook in settings.json
# instead, because that one runs in the repository directory.
#
# A non-zero exit stops the session from starting, so nothing here is fatal. A
# session without Chrome still works for everything but screenshots, and
# scripts/screenshot.js says what is missing.
set -uxo pipefail

if ! command -v google-chrome > /dev/null && ! command -v chromium > /dev/null; then
  # The download comes from storage.googleapis.com, which the Trusted network
  # access level allows, but resolving `stable` to a version reads
  # googlechromelabs.github.io, which it does not. The environment needs that
  # host in its allowed domains. The installer prints "chrome@<version> <path>".
  chrome="$(npx --yes @puppeteer/browsers install chrome@stable --path /opt/chrome | tail -1 | cut -d " " -f 2-)"

  # A session does not inherit this script's environment, so CHROME_PATH cannot
  # be handed over that way. scripts/screenshot.js looks for this symlink.
  if [ -n "$chrome" ] && [ -x "$chrome" ]; then
    ln -sf "$chrome" /usr/local/bin/google-chrome
  fi
fi

exit 0
