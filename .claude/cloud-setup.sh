#!/bin/bash
# Setup script for Claude Code cloud environments, kept here so it is versioned
# and reviewable. Paste it into the Setup script field of the environment at
# claude.ai/code; nothing runs it automatically from the repository.
#
# Project dependencies are installed by the SessionStart hook in settings.json
# instead, because that runs in the repository directory on every session.
set -eux

# Chrome for scripts/screenshot.mjs. Chrome for Testing is served from
# storage.googleapis.com, which the Trusted network level already allows.
npx --yes @puppeteer/browsers install chrome@stable --path /opt/chrome
ln -sf "$(find /opt/chrome -type f -name chrome -path '*chrome-linux64*' | head -1)" /usr/local/bin/google-chrome
