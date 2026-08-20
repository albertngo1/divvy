#!/bin/bash
# Divvy scanner runner: generate ideas from an arbitrary subset of trusted feeds, commit, push.
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

# Refresh the embedding index BEFORE generating so the novelty gate + retrieved avoid-list see
# every idea added since last run. Incremental (~1s) unless the index is missing. Non-fatal:
# if embeddings are unavailable the generators fall back to exact-title dedup and still run.
if ! node "$REPO/scanner/embed-corpus.mjs" >> "$LOG" 2>&1; then
  echo "embed-corpus.mjs failed — generators will run without the novelty gate" >> "$LOG"
fi

# Generate feed-sparked ideas + PRDs (writes public/data/ideas.json + public/data/prds/*.md).
if ! node "$REPO/scanner/scan.mjs" >> "$LOG" 2>&1; then
  echo "scan.mjs failed — see log" >> "$LOG"
fi

# Fan out a batch of concurrent-room party games via parallel agents. Independent of the
# feed scan above — a failure in either one still lets the other's ideas get committed.
if ! node "$REPO/scanner/party.mjs" >> "$LOG" 2>&1; then
  echo "party.mjs failed — see log" >> "$LOG"
fi

# Commit + push only if something changed.
if [[ -n "$(git status --porcelain public/data/)" ]]; then
  git add public/data/
  git commit -q -m "divvy: scan + party $(date +%F) — new ideas"
  git push -q
  echo "pushed" >> "$LOG"
else
  echo "no changes" >> "$LOG"
fi
