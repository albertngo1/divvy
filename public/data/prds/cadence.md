## Overview

Everyone gets the same deck of ~30 cards on their phone — swipe through at your own pace, no communication. A shared countdown timer runs (60s). At the buzzer, every player is on some card. The group wins if everyone is on the *same* card. Coordination is by feel: how fast is a "normal" scroll, how many cards should we linger on, when do you commit and stop. Per-phone matters because each player scrolls their own deck privately; a shared deck means one leader and everyone else follows — kills the group-synchrony puzzle.

## Problem

Group synchrony games (Keep Talking and Nobody Explodes, Overcooked) rely on explicit voice comms. Cadence is the opposite: no comms, no cursor visibility, just each player privately grappling with pacing and having to converge. It's a meditation-adjacent party game about calibrating to a room's shared rhythm. Only possible when every player has their own private stream.

## How it works

Room code join, 3-6 players. Server picks a deck of 30 cards (images or short phrases — e.g. "cities of Europe", "types of clouds"). Timer starts (60s). Each phone shows a scrollable/swipeable stack; you tap or swipe to advance. No back button — one direction only. At 0s buzzer, each phone locks on its current card. Reveal: display everyone's landed card in a grid. Group score = size of largest cluster / total players. 100% = everyone converged. Play 3 rounds, average.

## Technical approach

PartyKit or Socket.IO. Room state = `{deck_id, timer_start_ts, positions: {player_id: card_index_at_lock}}`. Cards: hand-curated decks of 30 items each (images from public domain / hand-picked, or text-only). Client uses touch swipe / tap to advance; each advance is a local state change (no server round-trip during play). At timer expiry, client sends its final `card_index` to server. Server broadcasts full-position reveal payload.

## v1 scope

3 rounds, 3-6 players, 5 hand-curated 30-card decks (mix of image and text), 60s timer per round. Score = largest cluster / total players, averaged across 3 rounds. No comms during play. Reveal shows all players' landed cards + cluster count. No deck selection, no LLM decks, no back-scroll.

## Out of scope

LLM-generated decks, custom deck upload, communication channels during play, back-scroll or re-scroll, per-player unique decks, competitive mode, difficulty (deck size) tuning.

## Risks & unknowns

Whether "converge without comms" is fun or frustrating is the whole gamble — could be a beautiful shared-flow moment or a random-outcome slot machine. Need playtest signal: does average cluster size across many groups sit meaningfully above chance? If chance-level, the game is a coin flip. Second: 30 cards over 60s = 2s/card average pace; too fast and no one lingers, too slow and everyone skips too much — tune per deck. Third: image decks vs. text decks may play very differently — start with text.

## Done means

4 friends play 3 rounds. At least one round has 3+ players land on the same card (feels magical). Group discusses their strategy after ("I was going 2 seconds per card, were you?") — meta-discussion is the tell that the mechanic works.
