## Overview

A silent three-player cooperative color-matching game for a living room with a TV. Every player privately drives one swatch on the shared screen, but nobody is told which swatch is theirs, and every player's controls mean something different. For groups who like the Concord/Tuning Fork end of Divvy — convergence you feel in your hands, not in your vocabulary.

## Problem

Most "match each other" games converge through a shared symbol space: you both type CAT, you both tap beat 3. Symbols make convergence a guessing game about taste. We want convergence as a physical *steering* problem, where the hard part isn't guessing what someone would pick but figuring out which part of the shared world you actually control.

## How it works

Host TV: three large color swatches side by side, positions shuffled once at start and never relabeled. That's it. No names, no scores, no cursors.

Each phone privately shows: three unlabeled sliders with nonsense axis names ("WARMTH / MUCK / LIFT"), and no color anywhere on the phone. Your sliders are weights over three *spectral primaries* drawn from a private, per-player set; another player's "WARMTH" pushes a different direction entirely. Moving your sliders moves exactly one swatch on the TV, instantly.

The game: nobody knows which swatch they own. The only way to find out is to move and watch — but if all three of you are flailing, all three swatches are moving and identification is impossible. The room has to discover stillness, nonverbally, as a resource: someone has to freeze so someone else can probe. Then steer. 90-second timer.

Win: all three swatches within ΔE2000 < 6 of each other, held 3 seconds.

Payoff: the host crossfades the rendering illuminant from D65 to tungsten. Because each player reached the color from a different spectral basis, the three matched swatches visibly split apart — they were metamers. Then it reveals who owned which swatch.

## Technical approach

Host tab + phone PWAs + one authoritative Durable Object (PartyKit) per room. Server state: `{players: {id, primarySet: [3 x 16-band spectra], weights: [w0,w1,w2], swatchSlot}}`. Phones send throttled `{slider, value}` at 20Hz; server clamps, recomputes each player's reflectance spectrum as a weighted sum, integrates against the current illuminant to XYZ, converts to sRGB with gamut clipping, and broadcasts three RGB triples plus a hidden ΔE matrix. Host renders; phones receive nothing back except a "locked" flag.

Hard part: not the sync (20Hz of nine floats is trivial) but the color pipeline. Primary sets must be chosen so every pair of players has a reachable common gamut, and so metamerism is dramatic under tungsten but the D65 match is genuinely achievable. That's an offline spectral search over candidate primaries, not something you tune live.

## v1 scope

- Exactly 3 players, one round, one hardcoded primary-set triple
- Fixed 90s timer, no scoring, no lobby (join by room code)
- Three sliders per phone, no haptics, no undo
- Win check + the tungsten crossfade reveal

## Out of scope

Multiple rounds, 4+ players, difficulty tiers, per-phone color preview, spectator view, sound.

## Risks & unknowns

Players may never discover the freeze-and-probe move and just thrash for 90s — needs one silent host-screen nudge (swatches dim while all three are moving). Gamut clipping can make two players' targets literally unreachable. TV color accuracy is irrelevant (relative match only), which is lucky.

## Done means

Three phones on a room code, three swatches on a laptop; a group that has never played converges within ΔE < 6 inside 90 seconds at least half the time, and the tungsten crossfade visibly splits the match on screen.
