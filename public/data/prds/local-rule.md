## Overview

**Local Rule** is a 4–6 player hidden-role game for a living room with a TV and phones. The group builds a small tile pattern on a shared board. Every player's phone privately shows which squares are *legal* for them right now, computed from a private rules card. Five cards are identical. One has a single-word erratum. That player is not lying and not trolling — their validator is wrong, and so are they.

## Problem

Hidden-role games make the imposter *perform*. You get a different prompt, you bluff, you sweat, you're bad at improv and everyone reads it off your face. The performance is the whole skill, which locks out anyone who doesn't like performing. **Local Rule** removes the acting entirely: the imposter plays sincerely, follows their rules, and gets caught by the *shape of their moves*. Deduction becomes forensic instead of theatrical — "whose plays are only explicable under a different rule?" — and the imposter's real job is the far more interesting one of inferring the majority rule from other people's moves.

## How it works

Host screen (TV), fully public: a 5×5 grid, a palette of tiles (each tile has a shape and a color), whose turn it is, and the placements so far. **No highlights, no rules text, ever.** Anyone can point at the TV and argue.

Each phone, private:
- Your rules card, one line: *"A tile must touch an already-placed tile of the SAME COLOR."*
- Your tile hand (3 tiles, drawn from a shared bag).
- A live overlay of the 5×5 grid with your legal squares glowing green — computed from **your** card.

The imposter's card reads *"...of the SAME SHAPE."* Their overlay glows on a different, overlapping set of squares. They will make several moves that are perfectly legal to everyone (the intersection is real — a red circle next to a red circle satisfies both), and then one that isn't.

Turn order goes around twice: eight placements, ~4 minutes. Then a 90-second argument with the finished board on the TV, then a simultaneous private vote on every phone. Innocents win by majority-voting the erratum holder. The imposter wins by surviving — and their escape hatch, once they notice people flinching, is to place only in the **intersection** of the two rules without knowing what the other rule is.

## Technical approach

PartyKit Durable Object per room, one authoritative `RoomState`:

```
Room { code, phase: lobby|place|debate|vote|reveal, board: (Tile|null)[25],
       bag: Tile[], turn: playerId, placements: {by, idx, tile, t}[] }
Player { id, name, hand: Tile[], ruleId: 'color'|'shape', seat }
```

`ruleId` never leaves the server except to its own owner. On every board mutation the server recomputes a legality bitmask **per player** and pushes each player only their own 25-bit mask — clients hold no rules engine, so a curious player opening devtools learns nothing about anyone else. The host tab subscribes to a public projection with `ruleId` and `hand` stripped.

The genuinely hard part is **not** sync (turn-based, one writer at a time, trivially serializable) — it's **rule-pair calibration**. The two rules need overlapping-but-distinguishable legal sets: too much overlap and the imposter is invisible for all eight turns; too little and they're outed on turn two. That's an offline simulation job — enumerate random 8-placement games over candidate rule pairs and keep only pairs whose divergence first appears on turns 3–6 in the majority of runs. Secondary risk: an innocent who simply misreads their own overlay looks exactly like the imposter, which is a feature but needs a tuned tile bag so it stays rare.

## v1 scope

- One room, one round, 5 players, no accounts, no reconnect.
- Exactly one rule pair: same-color vs. same-shape.
- 5×5 grid, 4 colors × 4 shapes, 8 placements total.
- Debate is people talking in the room — no chat, no timer UI beyond a bar.
- One vote, one reveal screen showing both rules cards side by side and replaying the board with each player's overlay.

## Out of scope

Multiple imposters, multiple rounds, scoring across games, a rule library, spectators, reconnection, mobile-web polish beyond "it works in Safari," any animation on the reveal beyond a fade.

## Risks & unknowns

- The imposter may realize instantly on turn one if the overlays diverge early — needs the calibration pass above.
- Players might stare at their phone instead of the TV; the overlay must be small and the board large.
- Does the intersection escape hatch actually feel discoverable, or only in hindsight? Playtest question, not a design one.

## Done means

Five phones join a room via a code on the TV. Each phone shows a rules card and a green overlay; the server logs confirm one phone received a mask derived from a different `ruleId`. Eight placements complete, all phones vote, and the reveal correctly names the erratum holder. In three consecutive playtests with five people, the erratum holder's first *provably* divergent placement lands on turn 3 or later at least twice, and at least one game ends with an innocent voted out.
