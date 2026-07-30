## Overview
Same Hat is a four-player co-op: one phone is the map, three phones are blind pieces. The Cartographer's phone shows the entire board — walls, pits, exit, and every player's token. The catch: the tokens are identical. No names, no colors, no numbers. The Cartographer can track a dot moving across the board but has no idea which human it belongs to. Pieces see no board at all — only their own private breadcrumb trail.

## Problem
Blind-maze party games collapse into one person barking coordinates while everyone else executes. The map-holder has all the information *and* all the authority; the pieces are input devices with faces. We want a version where the map-holder's knowledge is genuinely incomplete in a way only the pieces can repair — and where being knowable costs the pieces something.

## How it works
6×6 grid, 12 ticks of 8 seconds.

- **Cartographer's phone (private):** the live board — pits, exit, four identical dots trailing short fading tails.
- **Piece phones (private):** no board. Your own trail as relative moves — `R R U U L` — a direction pad, and two buttons: **THAT'S ME** / **NOT ME**.
- **Host TV (public):** the tick clock, how many pieces are safe on the exit, and a running transcript of every order.

Each tick the Cartographer taps one dot and assembles an order from a fixed phrase kit: *"You have gone RIGHT, RIGHT, UP. Now go DOWN."* It hits the TV and is spoken aloud. Every piece silently compares it against their private trail and claims or declines.

- **Exactly one claimant:** the order executes.
- **Nobody:** the tick is wasted.
- **Two or more:** collision — every claimant stumbles and loses their next move. The TV reads only **TWO ANSWERED**.

Non-claimants move wherever they like that tick.

The game lives in that failure case. Pieces begin with identical trails and are therefore un-addressable. To become describable you must spend moves *differently* from everyone else — usually away from where you want to go. Distinctiveness is the currency, and the Cartographer buys it with wasted ticks.

Win: all three pieces on the exit before tick 12.

## Technical approach
One PartyKit Durable Object per room; host tab plus phone PWAs over WebSocket. Server owns grid, per-piece `{pos, trail[], stunned}`, tick counter, current order. Three server-filtered views: `/map` (unordered position set, no stable indices), `/self` (your trail and stun state, nothing else), `/public` (transcript, exit count, clock). Fixed 8s server ticks; all intent — order, claim, move — buffers and resolves at the tick boundary, so nothing depends on arrival order.

The hard part is leak-proofing the claim. If the Cartographer's screen so much as flickers when a claim lands, latency alone re-identifies the dot. Claims are collected across the window and applied in one batch, and the map view freezes for the final 500ms. The second leak is payload shape: identity must never be inferable from array order, key names, or animation IDs, so positions ship as a shuffled set each tick and the Cartographer's client stitches trails by nearest-neighbor. Tracking a dot through time is allowed and fun; knowing whose dot it is is not.

## v1 scope
- Exactly 4 players; first joiner is Cartographer, no role UI.
- One hand-authored 6×6 board, 4 pits, 1 exit.
- One round, 12 ticks, then a win/lose card.
- Fixed phrase kit, no free text; trails truncated to last 3 moves.
- TV is one page: clock, transcript, exit count.

## Out of scope
Procgen boards, moving hazards, reconnect, multiple rounds, cross-game scoring, custom TTS, more than 3 pieces, Cartographer rotation.

## Risks & unknowns
- Trails may diverge too fast and kill the tension; the 3-move truncation is the main dial.
- Trail-matching in a loud room may be cognitive overload — render arrows as huge glyphs, not text.
- Collisions could read as punishing rather than funny; stun is capped at one tick.
- Does "I can see everything and can't address anyone" feel delicious or impotent? Primary playtest question.

## Done means
Four devices in one room finish a round: 12 orders issued, at least one double-claim where both claimants see a collision while the Cartographer sees only TWO ANSWERED, and a win achieved by pieces deliberately diverging before converging on the exit. No player ever sees another player's position on their own phone.
