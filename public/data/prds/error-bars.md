## Overview

A 5-player cooperative spectrum-guessing game for a TV plus phones, riffing on **Wavelength**. One hidden band on a 0–100 spectrum. Two **Setters** who each privately see one edge of that band and nothing else. Three **Guessers** who place private dials. The band's width is knowable to no single person — it exists only in the gap between the two Setters' clue words.

For Wavelength groups who've noticed the psychic role is the whole game and everyone else is a chorus.

## Problem

Wavelength is one person's job. The clue-giver knows the target exactly, and precision is entirely on them; the team just interpolates a word they were handed. There's no structural reason for the clue to carry an error bar, so "how confident should we be?" is pure vibes.

## How it works

1. Host screen shows a spectrum card — **UNDERRATED ← → OVERRATED** — with a 0–100 scale drawn to the same proportions phones use.
2. Server picks a hidden band, e.g. `[22, 64]`, with width randomized in 10–40.
3. **Private per phone:** Setter A's phone shows a single tick at 22, labelled "you hold the LEFT edge." Setter B's shows 64, "the RIGHT edge." Neither sees the other's number, so **neither knows the width**. Guessers' phones show nothing but the spectrum.
4. Both Setters simultaneously type one word. Host reveals both at once, labelled *left clue* / *right clue*: MOSS · FERN reads narrow, MOSS · LAVA reads enormous.
5. Guessers privately drag a dial and lock; host shows lock pips only. All three dials reveal simultaneously against the true band.
6. Score = dials inside the band. Setters share it.

The elegance: honest edge-clues from two blind Setters automatically encode the band's width in their disagreement, and the Guessers' correct play — aim at the midpoint, trust it more when the words are close — is exactly the statistical read. Nobody computed it; the structure did.

## Technical approach

PartyKit Durable Object per room; host tab plus phone PWAs over WebSocket. State: `{spectrum:{left,right}, band:{lo,hi}, roles: Map<pid,role>, clues:{left,right}, dials: Map<pid,number>, phase}`.

Authoritative server, per-role redaction: `band.lo` goes to exactly one socket, `band.hi` to exactly one, neither to the host until reveal. Never broadcast the room object. Reconnect replays the caller's private slice from a `localStorage` playerId.

The hard part isn't clock sync — nothing races — it's **simultaneous reveal without leakage**: clue text is withheld until both locks land (otherwise Setter B anchors on A's word and the width signal collapses), and dials until all three land. Also fiddly: the phone dial must be a pointer-events drag with scroll suppressed, rendering the identical 0–100 scale as the TV, or "60" means different things on different screens.

## v1 scope

- One round, one hardcoded spectrum card.
- Exactly 2 Setters + 3 Guessers, room code, no accounts.
- Server-enforced one-token clues.
- Reveal screen: true band, both edges, three dials, hits counted.

## Out of scope

Multiple rounds, role rotation, card decks, Wavelength's left/right blocking bet, scoring history, sound, animation.

## Risks & unknowns

Guessers may not read spread-as-width at all and just average blindly — the reveal must teach it explicitly. Extreme edges (lo=4) make a Setter's word look like a pole, faking a huge band. Five-player minimum is a real adoption cost. Unknown whether one round is enough for the inference to click.

## Done means

Five phones, one round, band never visible to any single player, both clue words appearing together, all dials revealing at once — and a playtest where the room lands inside a narrow band *because* the two words were near-synonyms.
