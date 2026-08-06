## Overview

A four-player reflex-and-nerve game for a living room with a TV and four phones. It takes Anomia's core thrill — two players' symbols collide and they race to blurt — and removes the one thing Anomia gives you for free: the knowledge that you are in the collision. Here the symbols live only on phones, exactly two of the four match, and nobody knows which two.

## Problem

Anomia's duel is pure reaction time. The fastest talker wins every night and the round has no decision in it. The itch: keep the blurt, but make buzzing a wager on *who else is holding what*, so a slow player who reads the room can beat a fast one.

## How it works

**Host screen (shared):** one category, huge — "A BRAND OF TOOTHPASTE" — a 20s clock, four player nameplates, and scores. No glyphs, ever, until reveal.

**Each phone (private):** your glyph (one of six shapes in one of four colors), and one line of private partial intel: *"2 other players share your color."* Nothing else. Your glyph is never sent to any other client.

The server deals four glyphs such that exactly one pair shares a shape. Colors are dealt independently, so color-count is a real but lossy clue: if you're told 0 others share your color, your partner is definitely not the one wearing your color, and so on.

Anyone may hit BUZZ. The first buzz freezes the clock, is announced on the TV simultaneously to everyone, and opens a 3-second JOIN window. Whoever joins first is the claimed partner. Both claimants must then say an answer to the public category out loud — the answer is unjudged flavor, but you need one loaded before you dare buzz, which is what makes buzzing cost something.

Then the TV flips all four glyphs. Correct pair: both +2. Wrong pair: both −1, and the real pair sees themselves on screen having missed each other. Nobody buzzes in 20s: everyone −1.

## Technical approach

PartyKit Durable Object per room; host tab and phone PWAs both WebSocket clients. State: `{ phase, category, deal: Record<pid,{shape,color}>, colorHint: Record<pid,number>, firstBuzz, joins[], scores }`. Only `colorHint` and your own deal entry are ever serialized to a phone.

The hard part is buzz fairness. Phone-to-server RTT varies 30–200ms on home wifi, so first-come server arrival is unjust. Each client measures clock offset with a three-sample NTP-style ping at round start; buzzes carry a client monotonic timestamp, the server holds a 150ms commit window after the first arrival and orders by corrected client time. The JOIN window is anchored to the *broadcast* of the first buzz, not its arrival, so the announcement is the starting gun for everyone equally.

## v1 scope

- Exactly 4 players, one round, then a static scoreboard
- 12 hardcoded categories, 6 shapes × 4 colors
- QR join, no accounts, no reconnect
- Spoken answers unvalidated

## Out of scope

More than 4 players, multiple rounds, answer validation, speech recognition, mobile-web audio, matchmaking.

## Risks & unknowns

The color hint may be too weak to make buzzing feel like a read rather than a coin flip — needs playtest tuning of hint strength. The 3s JOIN window may reward panic-joining; may need a join cost. Four-player-only is a real ceiling.

## Done means

Four phones join by QR, each shows a different glyph, one round runs end to end, and both outcomes are demonstrated live: a correct pair scoring +2 and a wrong pair scoring −1 with all four glyphs revealed on the TV.
