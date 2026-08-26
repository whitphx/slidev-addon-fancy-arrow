#!/bin/bash
# Setup script for Claude Code cloud environments, kept here so that it is
# versioned and reviewable. Paste it into the Setup script field of the
# environment at claude.ai/code. Nothing in the repository runs it.
#
# Project dependencies are installed by the SessionStart hook in settings.json
# instead, because that one runs in the repository directory.
set -euxo pipefail

# Chrome for Testing comes from storage.googleapis.com, which the Trusted network
# access level already allows. The installer prints "chrome@<version> <path>".
chrome="$(npx --yes @puppeteer/browsers install chrome@stable --path /opt/chrome | tail -1 | cut -d " " -f 2-)"

# A session does not inherit this script's environment, so CHROME_PATH cannot be
# handed over that way. scripts/screenshot.js looks for this symlink instead.
ln -sf "$chrome" /usr/local/bin/google-chrome
