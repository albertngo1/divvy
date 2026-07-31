## Overview
A silent co-op typing game for 3–5 people in a room with a TV. Everyone is shown the same ambiguous prompt (a photo, a phrase) and must type the *same word* — with no talking, no gestures, and no view of anyone else's screen. The only feedback is the longest common prefix of everyone's live typing, rendered huge on the host screen.

## Problem
"Match the group" games (Family Feud, Psych) resolve in one blind simultaneous reveal: you guess, you find out, it's over. There's no *process* of converging — no moment of feeling the group pull away from you and having to back up. This game makes convergence continuous and mechanical: you watch consensus form in real time, letter by letter, and you can feel exactly where it broke.

## How it works
Host screen shows the prompt (e.g. a photo of a dog asleep on a couch) and one giant text line: the **longest common prefix (LCP)** of all connected players' current buffers, plus a small **branch meter** — how many distinct "next letters" currently exist across the room (2 = two factions, 4 = chaos). It never shows anyone's full word, nor who is typing what.

Each phone privately shows: your own text field, your own full string, a backspace, and nothing else. You cannot see other players' letters — only the shared prefix on the TV.

Play: everyone types simultaneously. If four players type S-O-F-A and one types S-L-E-E-P, the TV freezes at `S` with a branch meter of 2. Someone must yield. The delicious move is backspacing: you erase back to the fork and try the other branch, and the whole room watches `S` become `SO` become `SOF`. The round locks when every buffer is byte-identical and stable for 2 seconds. Score = time remaining on a 90s clock.

## Technical approach
PartyKit / Cloudflare Durable Object per room; phones are a PWA, host is a browser tab.

State: `{ prompt, players: {id, name, buffer, seq}, phase, deadline }`. `buffer` is private — never broadcast. Phones send `{seq, buffer}` deltas on input, coalesced to ~20Hz. The DO recomputes derived public state on every message: `lcp = commonPrefix(all buffers)`, `branch = |{ b[lcp.length] : b in buffers }|`, `allEqual`. It broadcasts derived state only when it changes.

The hard part is jitter and anchoring. Naively, the fastest typist's keystrokes define the LCP frame-by-frame and the display flickers between prefix lengths as slower players catch up. Fixes: (a) a 150ms settle window — derived state must hold steady before broadcast; (b) LCP is monotone-guarded within a settle window so it only shrinks on a *confirmed* divergence, not on a lagging keystroke; (c) empty buffers are excluded from the LCP until a player has typed ≥1 character, so latecomers don't zero the room.

## v1 scope
- One hardcoded prompt image, one 90s round, 3–5 players
- Join by room code on a LAN URL; no accounts, no avatars
- LCP + branch meter + countdown on host; text field + backspace on phone
- Win/lose screen with everyone's final string revealed

## Out of scope
Multiple rounds, scoring across rounds, prompt packs, spectators, reconnect-mid-round, mobile keyboards other than the OS default, anti-griefing.

## Risks & unknowns
One player may hold the room hostage by refusing to yield — probably funny, possibly not. Very short words end the round instantly; prompts need enough plausible synonyms. Autocorrect/predictive text on iOS may inject whole words; may need `autocomplete=off` plus a custom input.

## Done means
Five phones on a LAN can type into one room; the host's prefix line advances only on genuine agreement, stalls within 300ms of a real divergence, and never flickers backward from lag alone; a round of five strangers reaches a locked identical word without anyone speaking.
