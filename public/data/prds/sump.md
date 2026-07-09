## Overview
A cooperative blind-navigation game for 3-5 players. One player is the **Surveyor**, whose phone is the board — the full cave map. Everyone else is a **Caver** who can feel only their immediate surroundings. It's for groups who like tense, talky puzzle co-op (Keep Talking / Nyctophobia energy) without a physical board.

## Problem
Map-and-guide games collapse into one person barking turn-by-turn directions while everyone else is a mute cursor. The itch: give the blind pieces *private information the guide lacks*, so the map-holder can't just narrate a solution — they have to interrogate people who each know something they don't.

## How it works
A virtual cave is a grid of cells. **Complementary blindness is the whole game:**
- The **Surveyor's phone (the board)** shows the full maze — passages, the flooded exit, timed sump cells — but NOT the cavers' exact positions, only a fuzzy zone blob per caver.
- Each **Caver's phone** privately shows a first-person cell view: which of the four sides are wall vs. passage, plus any local feature (a draft icon, the sound of water). Every caver sees a *different* view simultaneously.

Cavers announce their private view aloud ("walls north and east, I hear water"); the Surveyor matches that fingerprint to the map and calls a direction. To move, a Caver taps a direction on their own phone; the server validates against the real walls and pushes back a fresh private cell view. Some passages are **sumps** that flood on a timer — a rising-water bar appears only on the phone of whoever stands in that cell. Win: get every caver to the exit before the air timer runs out.

The **host TV** shows atmosphere only — air-remaining timer, a foggy silhouette, ambient drips. Never the map, never a cell view.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `cells[]{walls, feature, floodPhase}`, `players[]{id, role, cell}`, `game{airLeft}`. Sync: server is authoritative; on each move it validates and emits **per-recipient filtered state** — each caver receives only their own cell view; the Surveyor receives the map with caver positions *fuzzed to a zone*. The genuinely hard part is that filtering: computing a distinct private payload per socket every tick, keeping flood timers consistent across clients, and tuning the fuzz radius so the Surveyor truly can't see who's where (or the asymmetry evaporates).

## v1 scope
- 3 players: 1 Surveyor + 2 Cavers
- One hand-authored 5×5 maze, one exit
- One flooding sump passage, single 3-minute air timer
- One round, no reconnect

## Out of scope
- Multiple levels, monsters/hazards beyond flooding
- Reconnect, spectators, matchmaking, art polish

## Risks & unknowns
- Is verbal cell-fingerprint reporting *fun* or just tedious bookkeeping? Needs playtest.
- Fuzz radius tuning — too tight and the Surveyor sees everything; too loose and guidance is impossible.
- Players might just crowd around the Surveyor's screen (mitigated: private taps + no positions on host).

## Done means
3 phones join; each caver sees only their own cell's walls/feature; the Surveyor sees the map with fuzzed zones (never exact cells); cavers report aloud and move via private taps; the flood bar rises only on the flooded caver's phone; both cavers reach the exit before air runs out and the host shows a success state.
