#!/bin/bash
# Divvy scanner runner: generate ideas from Hacker News, commit, push.
# Wire to a LaunchAgent (StartInterval) once you're happy with it.
set -euo pipefail

# Auth for non-interactive `claude -p` (same pattern as com.weekend-ideas).
export HOME=/Users/mac-mini-server
export PATH=/Users/mac-mini-server/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin
# NOTE: the token file is line-wrapped; strip ALL whitespace or the Bearer header is invalid.
export CLAUDE_CODE_OAUTH_TOKEN="$(tr -d '[:space:]' < "$HOME/.happy/claude-token.txt")"

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

LOG="$REPO/scanner/scan.log"
echo "=== $(date) ===" >> "$LOG"

# Generate ideas + PRDs (writes public/data/ideas.json and public/data/prds/*.md).
if ! node "$REPO/scanner/scan.mjs" >> "$LOG" 2>&1; then
  echo "scan.mjs failed — see log" >> "$LOG"
  exit 1
fi

# Commit + push only if something changed.
if [[ -n "$(git status --porcelain public/data/)" ]]; then
  git add public/data/
  git commit -q -m "divvy: scan $(date +%F) — new ideas from HN"
  git push -q
  echo "pushed" >> "$LOG"
else
  echo "no changes" >> "$LOG"
fi
