#!/bin/bash
# One-off DETACHED overnight burst: scan in small batches, spaced out, until the
# cloud reaches TARGET ideas, then re-enable the normal scheduled scanner and exit.
# Launched via nohup so it survives the session ending. Sole writer while running
# (the 3h com.divvy-scanner is booted out at start, restored at end).
set -uo pipefail

export HOME=/Users/mac-mini-server
export PATH=/Users/mac-mini-server/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin

REPO="$HOME/public-src/divvy"
cd "$REPO" || exit 1
LOG="$REPO/scanner/overnight-burst.log"
TARGET=150
GAP=720          # ~12 min between runs
MAX_FAILS=8      # bail if this many consecutive runs fail (e.g. token expired)

count() { node -e "console.log(require('$REPO/public/data/ideas.json').ideas.length)" 2>/dev/null || echo 0; }
tok()   { tr -d '[:space:]' < "$HOME/.happy/claude-token.txt"; }

echo "=== overnight burst START $(date) | current=$(count) target=$TARGET ===" >> "$LOG"

# single writer: pause the scheduled scanner for the night
launchctl bootout gui/501/com.divvy-scanner 2>/dev/null && echo "paused com.divvy-scanner" >> "$LOG"

fails=0
while :; do
  cur=$(count)
  [ "$cur" -ge "$TARGET" ] && break
  [ "$fails" -ge "$MAX_FAILS" ] && { echo "!! $MAX_FAILS consecutive fails — bailing $(date)" >> "$LOG"; break; }

  need=$(( TARGET - cur )); n=$need; [ "$n" -gt 4 ] && n=4
  echo "--- $(date) run: have $cur, need $need, N=$n ---" >> "$LOG"

  export CLAUDE_CODE_OAUTH_TOKEN="$(tok)"   # re-read each run in case it rotates
  if DIVVY_N=$n node "$REPO/scanner/scan.mjs" < /dev/null >> "$LOG" 2>&1; then
    if ! git diff --quiet public/data/; then
      git add public/data/
      git commit -q -m "divvy: overnight burst -> $(count) ideas" >> "$LOG" 2>&1
      if git push -q >> "$LOG" 2>&1; then echo "pushed ($(count))" >> "$LOG"; else echo "push failed" >> "$LOG"; fi
    else
      echo "no new ideas this run" >> "$LOG"
    fi
    fails=0
  else
    fails=$(( fails + 1 )); echo "scan failed (streak=$fails)" >> "$LOG"
  fi

  [ "$(count)" -ge "$TARGET" ] && break
  sleep "$GAP"
done

# restore the normal scheduled scanner
launchctl bootstrap gui/501 "$HOME/Library/LaunchAgents/com.divvy-scanner.plist" 2>/dev/null && echo "restored com.divvy-scanner" >> "$LOG"
echo "=== overnight burst DONE $(date) | final=$(count) ===" >> "$LOG"
