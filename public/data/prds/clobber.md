## Overview
Clobber is a 3-player, 90-second concurrent-room game about a single shared clipboard. Everyone is filling out their own private form, nobody can type, and the only way to move text is copy-then-paste through one global buffer that all three players share. For groups of 3 who like a game where the failure is loud, personal, and instantly legible.

## Problem
Most "collision" party games make collisions abstract — a counter ticks, a klaxon sounds. Nobody feels robbed. Everyone alive has felt the specific fury of copying something, tabbing away, and finding the clipboard holds something else. Clobber turns that universal micro-trauma into the whole game, and makes another human the cause.

## How it works
The host screen shows a **Source Document**: a 24-cell grid of short strings (surnames, part numbers, nonsense words). It also shows one big monospace bar — the **CLIPBOARD** — displaying its current contents, and a clobber tally.

Each phone privately shows: (a) the same 24-cell grid, tappable, and (b) **your Form** — four empty slots, each labeled with the exact string it needs. No two forms are identical, but three strings are needed by two players each.

Your phone has no keyboard. Two verbs only:
- Tap a grid cell = **COPY**. Overwrites the one global clipboard for everybody, instantly.
- Tap a form slot = **PASTE**. Writes whatever the clipboard holds *at the moment the server processes it* into that slot. Slots are write-once and permanent.

Crucially, **your phone never shows the clipboard contents** — only the TV does. So the loop is: tap COPY, snap your head up to the TV to confirm your string is there, look back down, tap PASTE. That head-turn is the exposure window. If anyone copies during it, you paste their word into your form, forever. Correct slot +2, wrong slot −1, empty 0.

The social layer writes itself: players start narrating ("copying MARIGOLD, hands off, hands OFF"), and shared-need strings create the trap — piggybacking on someone else's copy is efficient right up until a third player clobbers it and takes two of you down at once.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit Durable Object, one per room).

State: `{ doc: string[24], clipboard: {value, seq, ownerId}, forms: {playerId: [slot|null ×4]}, log: Event[] }`.

Sync: every phone action is an event `{playerId, type: COPY|PASTE, target, clientTs}`. On join, each client runs a 5-sample RTT handshake to estimate clock offset. The server buffers incoming events for 200ms, sorts the buffer by offset-corrected client timestamp, then applies in that order — so a player on hotel wifi does not lose a race they won by 80ms. The TV renders from the same ordered, 200ms-delayed log, which keeps clipboard display and resolution perfectly consistent.

The genuinely hard part is that ordering fairness *is* the game. Every dispute is "I copied first," so the server must produce an order players accept, and the TV must be able to replay any collision in slow motion afterward from the log.

## v1 scope
- Exactly 3 players, one 90-second round, hardcoded 24-string document.
- 4 slots per form, 3 deliberately overlapping strings.
- TV: grid, clipboard bar, clobber tally, end-of-round per-player form reveal.
- Phone: grid + form. No lobby art, no avatars, no sound beyond a clipboard-changed tick.

## Out of scope
- More than 3 players, multi-round scoring, cut-vs-copy, clipboard history, undo, mobile keyboard entry, spectators.

## Risks & unknowns
- The head-up-to-TV loop may be too punishing on a small TV; may need a larger clipboard font or a 400ms clipboard-changed flash.
- If collisions are too frequent the round degenerates into noise — tune by document size and slot count, not by adding cooldowns.
- Players may discover a boring dominant strategy: strict verbal round-robin. Overlapping strings and a 90s clock should make pure turn-taking too slow to score well; needs playtest confirmation.

## Done means
Three phones join by room code; each player can complete a correct copy→paste; a copy issued between another player's copy and paste demonstrably lands the wrong string in that player's slot; the TV shows the clipboard changing in real time and, at round end, reveals all three forms with correct/wrong/empty marks and a replay of every clobber.
