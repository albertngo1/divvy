## Overview
A five-minute music game for 3 non-musicians. The room builds a single eight-step loop together, live, everyone editing simultaneously. The keepsake is the loop. The win condition is that when the host solos each lane at the end, nobody can tell which one was yours.

## Problem
Collaborative music toys reward the loudest, busiest contributor — the person who fills every step wins the mix and everyone else's part disappears. Meanwhile "guess who made this" games reward showing off. Invert the incentive: make anonymity the goal, and suddenly the correct play is to write the part that *belongs* rather than the part that stands out. That's also, incidentally, how you get a loop worth keeping.

## How it works
The host TV plays one 8-step bar on a loop, continuously, from the first second. Each phone privately shows an 8-cell grid for one lane with a fixed sound (kick / rim / bell) — you never see anyone else's grid, and you can **never hear your own lane alone**. The only audio in the room is the whole mix from the TV.

Each phone also holds a secret constraint brief: *"never place a hit on step 1"*, *"place exactly five hits"*, *"leave steps 5–8 empty"*. These make the loop lopsided and interesting, and they're also the tells you're trying to hide.

The room shares a live **hit budget** — 16 total — decremented on the TV as anyone toggles a cell on. Being busy is audible *and* identifiable *and* it starves your friends. Three minutes of editing, then the loop seals.

**Reveal.** The host solos lane A, then B, then C, unlabelled and shuffled. Each phone privately assigns a name to each lane, blind and simultaneous. Anyone nobody correctly named is Uncredited. The TV renders the loop as a 15-second looping video card everyone downloads, lanes credited by name — and Uncredited lanes credited as "—", permanently, in the artifact.

## Technical approach
Host browser tab is the sole audio clock (Web Audio, ~100 ms scheduler lookahead). Phones are silent controllers; no phone ever plays audio, which conveniently deletes the whole cross-device audio-sync problem.

Data model: `Room{code, phase, bpm, budgetRemaining}`, `Lane{playerId, sound, steps: bool[8], brief}`, `Guess{playerId, laneId → playerId}`. Authoritative Durable Object; the server owns the budget so two simultaneous toggles at 15 remaining can't both succeed.

The genuinely hard part is landing edits musically. A tap must not glitch the currently-playing bar. Phone toggles are optimistically local (cell lights instantly, marked "shimmering"), the server validates against the budget, and the host applies accumulated pattern diffs **only at the top of the next bar** — so a rejected toggle un-shimmers within one bar and nothing ever changes mid-beat. Lane letters are shuffled server-side at seal and the mapping is withheld from the TV until guesses lock.

## v1 scope
- Exactly 3 players, 1 lane each, 8 steps, one fixed tempo (100 BPM)
- Three hardcoded sounds, three hardcoded briefs, one shared 16-hit budget
- One 3-minute build, one solo-and-guess pass, no rematch
- Export: WAV + a looping MP4 card with credits

## Out of scope
Pitch, melody, velocity, bar counts above one, custom samples, mic recording, undo, spectating, >3 players.

## Risks & unknowns
Eight steps and three sounds may be too small a space to sound like anything — needs sample choice done well or it's a metronome. Guessing may be trivially easy (there are only three lanes and one is obviously the kick) which collapses the win condition; the fixed-sound assignment might need to be secret too. Non-musicians may not know what "belongs" sounds like. Three minutes may be either far too long or nowhere near enough.

## Done means
Three phones toggle cells at once; the TV's loop never glitches mid-bar and the shared budget can't be overspent by simultaneous taps; no player can hear their own lane in isolation before seal; the solo-and-guess pass runs blind and simultaneous; and every phone downloads the same loop card with at least one lane credited "—".
