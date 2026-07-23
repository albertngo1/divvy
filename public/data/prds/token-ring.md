## Overview
A 3–4 player cooperative defusal party game in the Keep-Talking lineage, but with the roles fused into a ring: every player is simultaneously a defuser AND the manual-holder for someone else. Built for a group that wants continuous, overlapping cross-talk under a shared clock.

## Problem
Keep Talking and Nobody Explodes splits the room into one defuser and idle experts flipping pages. Half the table watches. The itch: make *everyone* both hands-on and mouth-on at once, so there's no bystander and no single point of failure.

## How it works
Seat players in a ring. Each phone privately shows TWO things: (1) YOUR live module — a widget with a wrong state to fix (e.g. four colored wires, a keypad, a slider bank); and (2) the MANUAL for the player on your left — a lookup table that decodes *their* module, not yours. So to fix your module you must get the person on your RIGHT to read your manual aloud, describing your module to them first ("three wires: red, red, blue, and a lit star"). They read back the rule; you act. Meanwhile you're doing the same for your left neighbor. All modules run on one shared 90-second timer on the host TV, which shows only: the countdown, per-player GREEN/RED/UNSOLVED lamps, and a strike counter. The TV never shows module contents or manual text — those are strictly per-phone. Three strikes (wrong input) or timeout = boom. All-green = defused. The cycle guarantees you cannot help yourself and cannot stay silent.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { players[], timer, strikes, seed }`; each `Player { moduleState, targetState, manualFor: playerId }`. The server generates a ring assignment and, per module, a randomized state + the decode table it hands to the *previous* player. Sync: module inputs are authoritative server events (tap → validate against `targetState` → broadcast lamp change + strike on mismatch). The genuinely hard part is *generating solvable-but-not-trivial modules whose manual is compact enough to read aloud in one breath* — the lookup must fit voice bandwidth (a 4×4 table max) yet not be guessable without it. Timer is server-owned; clients render from server ticks to avoid drift.

## v1 scope
- Exactly 3 players, one ring, one 90s round.
- One module type only: 4-wire cut, decoded by a 6-row color/symbol table.
- Boom/defused end screen, then reset button.

## Out of scope
- Multiple module types, difficulty tiers, module rotation mid-round.
- Reconnect grace, spectators, scoring across rounds.
- Any audio effects beyond a tick and a boom.

## Risks & unknowns
- Ring cross-talk may collapse into chaos with 4 — cap v1 at 3.
- If a manual is too simple, players memorize it and stop talking; needs a per-round reshuffle so tables aren't reused.
- Latency on tap-validate must feel instant (<150ms) or strikes feel unfair.

## Done means
Three phones, three modules, three manuals-for-neighbors; a group that has never played defuses (or booms) within one 90s round using only voice, and no player can complete their own module by reading their own screen.
