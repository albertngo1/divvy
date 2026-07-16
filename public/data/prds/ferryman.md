## Overview
Ferryman is a 4-player cooperative concurrent-room game (1 host screen + 4 phones). One player is the Ferryman, who alone can see the river map on their phone. The other three each pilot a blind boat, trying to reach the far bank without running aground. It's for game-night groups who like Keep Talking–style asymmetry but want the *guide* to be bandwidth-starved, not chatty.

## Problem
Most "one person has the map" games devolve into the map-holder narrating turn-by-turn instructions out loud — the phones are incidental. Ferryman removes the free voice channel and forces the guide to triage: you can see three boats drifting toward three different sandbars, and you can only help one of them this round.

## How it works
The host TV shows a fog grid (6 wide × 8 tall): once a round resolves, it reveals only anonymous boat dots and splash animations where a boat grounded. It never shows the safe channel.

**Ferryman's phone (private):** the full map — a winding safe channel from the near bank to the far bank, every sandbar, and all three boats' live labeled positions.

**Boat phones (private):** a big compass with N/E/S/W arrows, a Commit button, their own faint 3-move wake trail, and an inbox that is empty *unless* the Ferryman whispered them this round (then it shows a single glowing arrow). Boats never see their absolute position or the map.

Each round: (1) the Ferryman may send exactly **one** private arrow-whisper to **one** boat; (2) all boats get 10s to pick and lock a direction, seeing their whisper if they got one; (3) the server resolves all three moves simultaneously; (4) the host animates results. A boat on a sandbar is grounded (out). Reaching the top row = across. Win = all surviving boats across within 8 rounds.

Talking aloud is allowed but nearly useless — the Ferryman can't say "boat two go east" fast or reliably enough, and boats don't know their own coordinates, so the private targeted arrow is the real currency.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `Game{grid, safePath[], round}`, `Boat{id, pos, alive, committedDir}`, `Whisper{fromFerryman, toBoat, dir}`. Sync is lock-step round-based, sidestepping real-time collision: server opens a whisper window, then a commit window, then resolves atomically and broadcasts a per-recipient view (each boat gets only its own whisper/trail; the host gets only anonymized dots). The genuinely hard part is the fan-out of *private* per-boat state — one broadcast can't be shared, so the server must render a distinct payload per socket and guarantee no boat ever receives another boat's whisper.

## v1 scope
- 1 Ferryman + 3 boats, one 6×8 river, one game.
- 4 directions, one whisper/round, 8-round cap.
- Grounding = elimination; win if ≥1 boat crosses.

## Out of scope
- Currents, multi-whisper upgrades, boat-to-boat chat, scoring/leaderboards, reconnection polish.

## Risks & unknowns
- Is one whisper/round too stingy (frustrating) or the sweet spot (tense triage)? Tune the map length.
- Voice leakage: players may brute-force coordinates verbally; may need to hide even the host dots until game-end.

## Done means
Four phones join a room, the Ferryman sees a channel the boats can't, three boats lock simultaneous moves, exactly one private whisper reaches exactly one boat per round, and a game ends in a shared win/loss on the host screen.
