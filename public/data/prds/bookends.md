## Overview

A 3-player cooperative spectrum-guessing game for people who love Wavelength but are tired of one clever person carrying every round. Bookends takes Wavelength's dial and splits its information three ways so that *nobody* can play psychic. One player knows **where** the target sits; the other two each privately own **one end** of a scale they may not name. The clue can only exist if all three thoughts stack.

## Problem

Wavelength's fun collapses onto the clue-giver. They hold the target and the axis, so the round is a solo performance the table watches. The failure mode is a table of spectators. We want the clue itself to be a three-person construction — where the interesting failure is a mis-*handoff*, not a bad guess.

## How it works

The server deals one spectrum card (`left: "Overrated"`, `right: "Underrated"`) and a hidden target band on a 0–1 arc.

**Private, per phone:**
- **Needle** sees the dial with the target band lit, and both poles rendered as `?????`. They know where, never what.
- **Left Pole** sees six words: `Your end: OVERRATED`. No dial, no target.
- **Right Pole** sees `Your end: UNDERRATED`. Same.

**Host screen:** a blank arc, both poles masked, phase and countdown only.

1. **Anchor (30s).** Each pole holder types ONE word that is a pure example of their own end — without naming the end. Both are locked, then revealed *simultaneously*, each pinned to the end it belongs to. Table is silent during this phase.
2. **Clue (30s).** The Needle now infers the axis from two example words and types one clue word they believe lands in a band only they can see.
3. **Guess (20s).** Both pole holders drag their own needle on their own phone, locked blind. The host shows two "committed" pips, never positions.
4. **Reveal.** True labels, target band, both guesses. 4 points in-band, 2 adjacent, +2 if the two guesses land within 8% of each other.

The per-phone split is the whole game: anchors must be composed blind or the second pole holder just echoes the first; guesses must be simultaneous or one guesser anchors the other; and the Needle must never see the labels. A single passed phone leaks all three secrets on the first handoff.

## Technical approach

Host browser tab + phone PWAs + one PartyKit Durable Object per room. Room state: `{code, players[{id,name,role}], card{leftLabel,rightLabel}, target{center,width}, phase, deadline, anchors{left,right}, clue, guesses{}}`.

Redaction is server-side: each socket receives a *role projection* computed on the server. Never ship full state and hide it with CSS — one curious player with devtools ends the round.

The hard part is the simultaneity barrier. Anchors and guesses are committed via `submit`, buffered server-side, and broadcast only when all participants in the phase have submitted or the deadline fires; post-barrier submits are rejected. Countdown uses a server `deadline` plus a per-client clock offset from a 5-ping handshake at join, so no phone's countdown drifts against the host's.

## v1 scope

- Exactly 3 players, exactly 1 round
- 6 hardcoded spectrum cards
- 4-letter room code, nickname only, no accounts
- Text entry for anchors and clue; thumb-drag for guesses
- One reveal screen, then "play again" reloads

## Out of scope

- 4+ players and the pure-guesser role
- Multi-round series, scoreboards, custom decks
- Mid-round reconnect, spectator view, animations, audio

## Risks & unknowns

- Two anchor words may fail to define any axis at all, making the round pure noise
- Verbal leakage during anchoring is socially enforced only
- Unknown whether the Needle's inference task is genuinely doable or merely frustrating — this is the single playtest question
- iOS Safari backgrounding breaks countdown fidelity

## Done means

Three phones and a laptop join by code on the same LAN. Inspecting WebSocket frames shows no phone but the Needle ever receives `target`, and no phone but each pole holder receives its label. One round runs end to end in under three minutes and the reveal shows labels, band, clue and both guesses. Across five test rounds, at least two land in-band.
