## Overview
A head-to-head fighting-game duel squeezed into simultaneous commit-and-reveal. Two players fight from their phones while the room watches the fight play out on the shared TV. It steals the *neutral game* and *combo theory* of a Street Fighter — startup frames, mixups, whiff punishes — and throws out the joystick execution that gatekeeps it.

## Problem
The deepest fun in fighting games is the mind-game: reading whether your opponent will go high, low, or grab, and punishing the guess. But that layer sits behind execution — motion inputs, frame-perfect links, a controller. Most party guests will never touch it. Keep the yomi, delete the barrier.

## How it works
Each round, both players privately assemble a **three-link combo** by tapping move buttons on their phone. Four move types form a clean triangle — **High beats Throw, Throw beats Block, Block beats Low, Low beats High** — and each move has a **startup value** (fast jab vs. slow sweep). You commit your hidden three-move string blind.

On reveal the host resolves link by link like frame data: at each link, compare the two moves — faster startup wins ties, otherwise apply the triangle. A *blocked* link ends your combo (whiff, you eat a punish); a *connecting* link chains damage and builds meter you can spend next round on one EX move. **Private on your phone:** your queued string, your meter, and a small readout of the opponent's last-round moves (their habits). **Shared on the TV:** the two fighters, both health bars, and a frame-by-frame animated clash on reveal.

The per-phone privacy is the whole game — the entire fight is a simultaneous hidden commit. See the opponent's phone and the yomi collapses instantly. A single passed phone cannot run this.

## Technical approach
PartyKit / Durable Object room, turn-gated (no frame sync needed). Data model: `room {players[2], round, seed}`; `player {hp, meter, committedString: Move[3], history[]}`. Sync: each phone POSTs its committed string; the server holds until both arrive, computes the resolution deterministically, and broadcasts a **timeline** the host animates. The genuinely hard part is not networking — it's tuning the move triangle plus startup values so the reveal is *legible* to non-FGC players yet still deep, and making the link-by-link animation *feel* like a real combo landing.

## v1 scope
- 2 players, spectators watch the TV
- 4 move types, exactly one triangle
- 3-link strings, best-of-3 rounds
- Meter that unlocks a single EX move
- Health bars + a KO screen

## Out of scope
- Winner-stays-on queue / more than 2 fighters
- Character roster, directional swipe inputs
- Spectator betting, rollback netcode

## Risks & unknowns
- Balancing the triangle so no single string dominates
- Making frame-startup readable to people who've never played a fighter
- 2-player-only may feel thin billed as a "party" game

## Done means
Two phones each commit a hidden 3-move string; the host animates a link-by-link resolution applying startup + the triangle; damage accrues across best-of-3; someone hits 0 HP and a KO screen fires — all without the designer narrating the match mid-fight.
