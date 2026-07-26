## Overview
Declination is a four-player, ninety-second cooperative panic. One player — the **Cartographer** — holds the only map, rendered privately on their own phone, angled away from everyone. The other three are **Pieces**: their phones show a four-way pad and nothing else. It's for groups who've played every "one person reads directions aloud" game and want the director's job to actually be hard.

## Problem
Blind-maze party games are a compliance exercise: someone reads a route, everyone obeys, and the only comedy is a misheard word. Holding the map is no craft. We want the map-holder's job to be a real, escalating cognitive load — maintaining three different broken coordinate systems at once, out loud, while the water rises.

## How it works
An 8×8 walled grid, three start cells, one exit. Water floods one row from the south every 10s; 90s total.

- **Cartographer's phone (PRIVATE):** the full live map — walls, exit, flood line, three colored dots moving in real time. This is the board. Nobody else ever sees it during play.
- **Each Piece's phone (PRIVATE):** a giant d-pad, their color chip, nothing else. Each Piece's pad is secretly rotated by a multiple of 90°, and exactly one Piece is additionally mirrored east/west. **Nobody is told their own transform — not even the Piece.** A blocked move returns a 40ms buzz that says only "something is there," never which side.
- **Host TV (SHARED):** flood countdown, a per-color move counter, and an escaped/drowned ledger. It is deliberately not the board. At the end it replays the entire run with the map revealed and each Piece's secret rotation stamped on their trail — the payoff shot.

The only channel is the Cartographer's voice, restricted by house rule to a color plus NORTH/SOUTH/EAST/WEST. "Red, north." Red taps up. Red goes *west*. The Cartographer now has to speak the rest of the game inside Red's scrambled frame while simultaneously solving Blue's and Green's — and one of them is a mirror, so it flips sign as well as axis.

## Technical approach
PartyKit Durable Object (or Socket.IO over Tailscale Serve) per room, one room = one DO, authoritative 20Hz tick. State: `grid` (seeded walls), `pieces[{id,color,cell,rot:0-3,mirror:bool}]`, `floodRow`, `tick`. Three redaction levels by connection role: Cartographer receives full snapshots at 15Hz; a Piece receives only `{ackSeq, moved, bumped}`; the TV receives counters and the timer. Piece sends `{seq,dir}`; server applies rotation/mirror, tests collision and flood, acks. Same-cell contention resolves per tick, lowest seq wins, loser bumps.

The genuinely hard part is that **client-side prediction is impossible** — a Piece cannot predict its own movement because it doesn't know its transform — so every tap's feedback is a full round trip. Under ~120ms it feels caused; over ~200ms players stop trusting the buzz and the deduction loop dies. That budget, not the game logic, is the engineering problem.

## v1 scope
- Exactly 4 players, one round, one hand-authored 8×8 map
- Rotations from {0°,90°,180°,270°}; exactly one Piece also mirrored
- Flood one row / 10s, hard stop at 90s
- Piece UI: d-pad, color chip, bump haptic. No text at all.
- Cartographer UI: the map. No pings, no drawing, no tools.
- TV: timer, move counters, ledger, end-of-round revealed replay
- Vocabulary limit enforced socially, not by software
- 4-letter room code, QR on the TV, no accounts

## Out of scope
Map editor, >4 players, multi-round scoring, Piece-to-Piece comms, ASR policing the vocabulary, reconnect recovery beyond rejoin-by-seat, spectators, audio design past the flood tick.

## Risks & unknowns
- Too hard: three frames plus a mirror may produce pure flailing. Dial: a 10s "shakedown" where all rotations are 0°.
- Too easy: a sharp Cartographer solves all three offsets in 15s and it degrades into route-reading. Reserve counter: re-roll one Piece's rotation at the halfway flood line.
- iOS Safari haptics are unreliable; needs an audio-click fallback.
- A chatty Piece ("I pressed up!") short-circuits the intended information flow. The rule that Pieces are silent may be strictly better — test both.

## Done means
Four phones and a laptop on one Wi-Fi. The Cartographer sees a live map, Pieces see only a pad, and a tap produces either dot movement or a hand buzz within 120ms. A cold group of four, told nothing about rotations, discovers at least one Piece's offset by trial and error and lands at least one Piece on the exit before the flood. During the revealed replay, at least one person says "oh — *that's* why."
