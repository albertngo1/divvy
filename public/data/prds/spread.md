## Overview
Spread is a concurrent-room party game for 3-6 players, riffing on *Wavelength*. One Psychic secretly sees where a target sits on a continuous spectrum and gives a single spoken clue. Instead of the group nudging one shared dial, every other player places their own guess privately and simultaneously; all needles reveal at once.

## Problem
The itch Spread fixes is *Wavelength*'s worst social bug: one shared dial means the loudest person drags it and everyone else just mumbles agreement. The delicious part — the honest spread of where people actually think the clue points — gets flattened by groupthink. Hidden simultaneous placement is impossible with a single passed phone; per-phone privacy IS the mechanic.

## How it works
Host TV shows a spectrum bar (e.g. 'ordinary ←→ mythical') with no marker. The Psychic's phone PRIVATELY shows the same bar with the hidden target zone highlighted; they say one clue aloud ('unicorn'). Each guesser's phone shows a draggable needle on the bar — you drag and lock, seeing only your own needle, no one else's, no anchoring. When all lock (or timer ends), the TV flips: every needle and the true target appear together as a scattered constellation. Score two ways — guessers earn points for accuracy; the Psychic earns points for *tightness* (a clue that clustered everyone), so the Psychic wants consensus while players just want to be right.

Privately per phone: the target (Psychic only), your own draggable needle and locked value. Shared TV: the blank bar, then the full reveal of every needle, the target, and both scores.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{code, psychicId, spectrum, targetValue, phase}`, `Guess{playerId, value 0-100, locked}`. Sync: server is truth; it sends the target ONLY to the Psychic, blank bar to everyone else, and withholds all guesses until reveal. The hard part is the reveal barrier — guesses must stay server-side and invisible until every needle is locked or the timer fires, so no client can peek at another's value early (all locking logic and gating lives on the server, clients get positions only at flip).

## v1 scope
- 3 players: 1 Psychic, 2 guessers, one spectrum, one round.
- 10 hand-written spectrum cards, random target zone.
- Drag-lock needle, simultaneous reveal, two-axis scoring.

## Out of scope
- Team play, multiple rounds, rotating Psychic, custom spectra.
- Reconnect handling, spectators, chat.

## Risks & unknowns
- With only 2 guessers the 'spread' is thin; may need 4+ to sing.
- Scoring balance between accuracy and tightness needs tuning.
- Spectrum-card quality is the fun ceiling, as in Wavelength.

## Done means
3 phones join; the Psychic's phone alone shows the target and they say a clue; both guessers drag-lock private needles seeing nothing else; the TV then reveals both needles plus the target simultaneously with an accuracy and a tightness score — no guess visible to anyone before the flip.
