## Overview
A 4-player, one-round talking game for people who like games where the rule is simple and the consequence is horrible. The room has to say four private things out loud to open a lock on the TV. The catch: talking isn't billed to you, it's billed to the *line* between you and the person who spoke immediately before you — and each phone can only see its own three lines.

## Problem
"Silence games" usually price speech per-person: a meter, a budget, a tax. Everyone can reason about it alone, and the optimal play is just "shut up." That's a scoring rule, not a social one. Nobody has ever had to think about *speech order* as a routed graph — about waiting three beats so that someone cheaper is sitting in front of you.

## How it works
Four players, six unordered pairs, each pair seeded with a hidden budget of 3–12 talk-seconds. Every player's phone privately shows **only their own three lines** (e.g. "you↔Blue: 4.1s left, you↔Green: 11.0s, you↔Red: 2.2s"), draining live. Nobody knows Blue↔Green.

When you speak, the server charges your speaking duration to the line (you, previous speaker). Overdraw a line and *both* endpoints lose points — so blowing a line hurts a person who never consented and never saw it coming.

The forcing function: each phone privately holds one **Key Phrase** (a specific 5–7 word sentence) and the TV shows four empty slots. All four phrases must be spoken aloud to win. So everyone must talk at least once, and the puzzle is *sequencing*: if your line to Red is nearly dry, you cannot follow Red — you have to get someone else to take the floor first, and asking for that out loud costs a line too.

The host TV shows only: the four slots, the current "previous speaker" token (who you'd be billed against right now), and a red flash when any line overdraws — never whose.

## Technical approach
Host browser tab + phone PWA + PartyKit Durable Object as authority. Data model: `Room{phase, slots[4], lastSpeaker, players[]}`, `Line{a,b,remainingMs}` ×6, `Phone{keyPhrase, visibleLines[3]}`. Each phone runs an AudioWorklet computing 20ms A-weighted RMS plus a voicing gate (zero-crossing + spectral flatness), and streams only a scalar energy envelope — never audio — at 20Hz.

The hard part is attribution. Every phone hears every voice. The server keeps a 250ms sliding window, takes argmax energy across phones, and applies hysteresis (a new speaker must beat the incumbent by 6dB for 200ms) so a laugh doesn't flip the `lastSpeaker` token and silently reroute everyone's billing. Lobby calibration captures each phone's noise floor and a 3-second "say your name" reference level. Billing must be replayable: the DO logs `(tMs, speakerId, ms)` so a contested overdraw can be shown as a timeline.

## v1 scope
- Exactly 4 players, one 4-minute round, no lobby customization
- 6 hardcoded line budgets, one hardcoded set of 4 Key Phrases
- Phrase slots filled manually by the host clicking a slot (no ASR)
- TV shows slots, previous-speaker token, overdraw flash
- Win/lose screen with the full billing timeline revealed

## Out of scope
- ASR phrase matching, 5+ players, line trading or refinancing, rematch, spectators

## Risks & unknowns
- Attribution flips on overlapping speech may feel arbitrary; the replay timeline is the mitigation, but if it flips more than ~2×/minute the game is unplayable
- Players may not intuit "previous speaker" billing without one guided practice minute
- Cheap degenerate strategy: everyone whispers their phrase in the first 10 seconds. Fix by requiring slots to fill in an order the TV reveals one at a time

## Done means
Four phones and one TV in a real living room: all four Key Phrases land, at least two players visibly stall to avoid following a dry line, the post-round timeline correctly attributes ≥90% of utterances on human review, and no overdraw is disputed as misattributed.
