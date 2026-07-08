## Overview
Composite is a concurrent-room party game where 4–6 friends collaboratively author a single anonymous document — a passive-aggressive fridge note, a ransom letter, a breakup text from 'someone who has clearly snapped' — one line each, all in the same fake voice. There is no scoreboard. The win condition is staying anonymous: keep your line from being correctly attributed, and take home the finished note as the shared keepsake.

## Problem
Most 'who wrote it' party games (Drawful, Quiplash) reward being the funniest or loudest, and they produce nothing you keep. The itch here is inverted: comedy comes from *blending in*, the artifact is a keepsake, and hiding — not winning points — is the entire game. It only works if every player composes blind and simultaneously, which a single passed phone cannot do.

## How it works
The host screen shows a shared 'brief': the note's persona, occasion, and tone. Each phone privately receives (a) a slot number (line 1..N in the final note), (b) the shared brief, and (c) a secret 'spice word' it must smuggle into its line. Players write their one line at the same time; only their own phone shows the composer. When the timer ends, the server assembles the lines in slot order into one seamless note, displayed anonymously on the host TV (authorship shuffled server-side). Reveal phase: each phone privately shows a guess grid — attribute every *other* line to a player. You stay anonymous if fewer than half the room correctly pegs your line. The host then shows the finished note as a shareable keepsake image, stamps it 'Seamless' if few lines were unmasked, and marks the unmasked players with a tell-tale smudge — but never a point total.

Private (phone): your slot, your spice word, your line composer, your guess grid. Shared (host): the brief, the assembled note, the reveal animation.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room {id, phase, brief, players[{id, name, slot, line, spiceWord, guesses{}, unmaskedBy[]}], note[]}`. Sync is a simple phase machine: lobby → brief → compose → assemble → guess → reveal. The genuinely hard part is *anonymity integrity*, not real-time latency: the server must never ship authorship mapping to any client before reveal (the slot→player shuffle lives server-side only), and the unmask threshold must be tuned so hiding is achievable among friends who know each other's voice but not trivially so. Secondary hard part: generating briefs + spice words that force voice-matching.

## v1 scope
- 4 players, one brief, one round
- Text-only lines, one secret spice word each
- Fixed slot order, ~90s compose timer
- Simple private guess grid, majority-unmask threshold
- Host renders the note as a saveable keepsake image
- Join by 4-letter room code, no accounts

## Out of scope
- Multiple rounds / scoring across rounds
- Emoji or image lines, printing/export beyond screenshot
- Matchmaking, spectators, profanity filtering
- Voice or drawn contributions

## Risks & unknowns
- Reading load: everyone reads N lines before guessing
- Attribution too easy among close friends → tune spice words / threshold
- Slow typists stall the round; brief quality is make-or-break
- Unknown: the right unmask fraction that makes 'stayed anonymous' feel earned

## Done means
Four phones join via code; each privately composes one line unseen by the others; the host assembles a single anonymous note; each phone submits private author guesses; the host reveals who stayed anonymous and displays the finished note as a saveable keepsake — with no numeric scoreboard anywhere in the app.
