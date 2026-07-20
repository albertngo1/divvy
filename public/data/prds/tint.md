## Overview
Tint is a 4-player hidden-role party game built on a cruel perceptual trick: color-vision test plates. Each player's phone privately renders an Ishihara-style plate — a field of colored dots in which a numeral is legible. One player is the Off One, whose plate is generated from a shifted palette so a *different* numeral emerges. Everyone must agree on "the number," and the group hunts the person who can't actually see it.

## Problem
Most hidden-role imposters are given a swapped *fact* and told to lie. That's a memory bluff. Tint makes the altered view genuinely perceptual and un-fakeable: the Off One is looking at real dots that really form a different digit. They can't reason their way to the truth — they can only bluff a plausible number and read the room. It exploits something no passed-around phone can do: render two different color realities at once.

## How it works
**Private (each phone):** A full-screen Ishihara plate plus a numeric keypad. Innocents' plates all encode the same target digit (say **7**). The Off One's plate uses a palette rotated in LCh space so a decoy digit (say **4**) reads clearly instead. Every phone privately submits the number it sees. The Off One is told only "you are the Off One — your plate may be lying to you; you do not know the real number."
**Shared host screen (TV):** After submissions lock, an anonymized histogram of submitted digits — three votes on 7, one lonely 4. Then 60 seconds of open table talk ("what number, obviously?" — the Off One must commit out loud), then a simultaneous private vote for who's the imposter.
**The squeeze:** submit honestly (4) and the histogram exposes you; or bluff toward a number you literally cannot see and hope you guessed the majority.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: `Room{ plateSeed, targetDigit, decoyDigit, offOneId, phase }`, `Player{ id, submittedDigit, vote }`. Plates render **client-side** from `plateSeed` + a per-player `paletteShift` (0 for innocents, a fixed LCh rotation for the Off One) so the server never ships an image, only a seed and a shift scalar — cheap and tamper-resistant enough for a party. Sync is trivial (submit → lock → reveal → vote); no real-time frame sync needed. The genuinely hard part is **palette calibration**: the decoy palette must read *unambiguously* as the decoy on a phone screen across brightness/auto-tone settings while staying subtle enough that the Off One doesn't instantly suspect. That's an offline generation/QA problem, not a runtime one.

## v1 scope
- Exactly 4 players, one plate, one round.
- One hand-tuned innocent palette + one decoy palette (single digit pair, e.g. 7/4).
- Histogram reveal, 60s talk, one vote, win/lose banner.
- No accounts; 4-letter room code.

## Out of scope
- Multiple rounds / rotating roles / scoring across rounds.
- Auto-generated palette pairs; colorblind-accessibility modes (ironic, deferred).
- More than one Off One; variable player counts.

## Risks & unknowns
- Real red-green colorblind players scramble the signal — needs a pre-game single-plate calibration check to bench anyone who fails.
- Phone auto-brightness / night-shift could flip perception; may need a "turn off True Tone" nudge screen.
- Decoy might be *too* obvious or too invisible — the whole game lives or dies on one palette pair.

## Done means
Four phones on one room code each render a plate; three players independently type 7 and one types 4 without seeing each other's screens; the host histogram shows the 3–1 split; the table votes and correctly (or wrongly) fingers the Off One; a win/lose screen names the imposter.
