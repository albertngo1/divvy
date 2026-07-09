## Overview
Detune is a social-reading party game for 3–5 players, riffing on Wavelength but flipping its one-psychic structure: EVERYONE is a psychic at once. The TV shows a single spectrum; each phone privately holds a different secret target on it. You give one clue for your own point, then privately guess where each other player is aimed. It rewards reading people, not just the room.

## Problem
Wavelength has one guesser and a table that anchors on the first thing said — the crowd converges, and quiet players coast. It also can't meaningfully use per-phone privacy: pass one phone around and it plays identically. Detune makes hidden, simultaneous, per-player state the whole game: your target must be secret from everyone, and every guess must be locked without seeing anyone else's, or the reads are worthless.

## How it works
Host TV shows one labeled spectrum, e.g. "Overrated ←→ Underrated", as a continuous bar. Each phone PRIVATELY shows that same bar with a single glowing target only that player can see (server-assigned, well-spaced). Round phase 1: each player types one short CLUE word aimed at their own private target and submits. Phase 2: the TV reveals all clues attributed to their authors, but NOT their targets. Now each phone shows the bar with the other players' names as draggable pins; you privately place where you think each person's real target sits, and lock in — no one sees your pins, no anchoring. Phase 3: the TV animates every true target and every guess sliding into place. You score for how close your guesses land AND for how findable your own clue made you. A shared phone breaks it instantly — targets would leak and guesses couldn't be simultaneous or hidden.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Model: `Room{code, spectrum, phase, round}`, `Player{id, name, targetPos, clue, guesses:{targetPlayerId->pos}}`. Server assigns spaced `targetPos` values and never sends a player's target to anyone else until reveal. Sync is phase-gated: server barriers on all-submitted before advancing, so no client can peek ahead. The genuinely hard part is trust — the server must be the sole holder of targets and guesses until the reveal barrier, and must handle a dropped player mid-phase without stalling the barrier (timeout → auto-lock at bar center).

## v1 scope (humiliatingly small)
- 3 players, one room, no accounts
- One hardcoded spectrum, one round
- Fixed target assignment, single clue field, drag-to-guess
- Simple proximity scoring, one TV reveal animation

## Out of scope (for now)
- Multiple rounds / spectrum deck / team play
- Clue validation or profanity filtering
- Reconnect polish, cosmetics, tie-breaks

## Risks & unknowns
- Guessing 4+ others at once may overwhelm; 3 players is the safe proof.
- Proximity scoring curve needs tuning so near-misses still feel rewarded.
- One-word clues might be too thin to read anyone; may need a short phrase.

## Done means
Three phones join a TV code; each privately sees a distinct hidden target on the same spectrum; each submits one clue; each then privately places guesses for the others without seeing anyone else's; the TV reveals all targets and guesses together and shows proximity scores — with no target or guess ever visible before the barrier.
