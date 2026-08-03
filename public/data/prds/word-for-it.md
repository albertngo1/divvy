## Overview
Word for It is a 3-player cooperative voice game for a living room: one TV or laptop as the host screen, one phone per player as a private controller. The room has 120 seconds to execute a stream of orders about objects that have no names. The comedy and the difficulty are the same thing: coining terms under time pressure and getting other people to accept them.

## Problem
Spaceteam's joy is shouting nonsense words at your friends — but the words are handed to you. "Set the Bloxor to 4" is already unambiguous; you just have to say it fast. The genuinely hard part of real-time human coordination happens *before* the vocabulary exists: two people arguing whether the shape is a crab or a broken chair while a clock runs. No party game makes the coining itself the mechanic.

## How it works
Each phone privately shows a 3×3 grid of nine abstract glyphs — procedurally drawn squiggles, no labels, no numbers, no easily-verbalized colors. The three panels are disjoint: 27 glyphs, exactly one owner each. No player ever sees another player's panel, and neither does the TV.

Orders stream in. An order appears on YOUR phone as a large picture of a glyph that lives on SOMEONE ELSE'S panel. You cannot tap it. You can only describe it aloud. Its owner taps it. 15-second TTL, two orders live per phone at once — so all three players are describing three different shapes simultaneously, over each other.

The trap: the generator seeds near-identical glyph pairs and deliberately splits them across different players. "The spiky one" gets the wrong tap; a wrong tap burns 3 seconds off the clock. Precision buys speed.

The payoff loop: every glyph successfully hit is promoted to the host TV's **Known Shapes** gallery — the picture, small, permanent for the round. Once it's on the wall, players point at the TV and use the nickname they already coined. The TV becomes a growing dictionary the room wrote itself. Late-round orders reuse earlier glyphs, so a room that named things crisply accelerates while a room that said "the wiggly one" four times stalls out.

Host screen shows only: timer, score, Known Shapes gallery. Never a panel, never an order.

## Technical approach
Host browser tab + phone PWAs + PartyKit Durable Object per room, authoritative.

Data model: `Room {code, seed, phase, tRemaining, players[], panels: {playerId: glyphId[9]}, orders: {id, glyphId, speakerId, ownerId, issuedAt, ttlMs, state}, known: glyphId[], score}`. A `Glyph` is a 12-float parameter vector rendered client-side as deterministic SVG; confusability is L2 distance in that vector space.

Sync: server ticks at 10Hz. Host receives a public projection (timer, score, `known[]`). Each phone receives only its own panel and its own orders on a private channel — the private slice is enforced server-side, not filtered in the client. Taps post `{glyphId, clientTs}`; the server resolves against live orders, RTT-normalized, and emits HIT/WRONG/EXPIRED.

The genuinely hard part is glyph generation, not networking: you need sets where near-miss pairs are (a) visually confusable enough that lazy descriptions fail, (b) describable enough that careful ones succeed, and (c) always assigned to *different* phones. v1 hand-curates 27 glyphs and a confusion matrix rather than solving this generatively.

## v1 scope
- Exactly 3 players, one 120-second round, no lobby beyond a 4-letter join code
- 27 hand-drawn SVG glyphs, fixed disjoint panel assignment from a seed
- 2 concurrent orders per phone, 15s TTL, 3s penalty on wrong tap
- Host: timer, score, Known Shapes gallery. That's the whole TV
- One end screen: score + "you named 14 shapes"

## Out of scope
Accounts, audio, speech recognition, difficulty tiers, 4+ players, rematch flow, mobile install prompts, procedural glyph generation.

## Risks & unknowns
- Glyphs may be *too* hard to describe → paralysis instead of comedy. Mitigation: bias toward silhouettes with limb-like features people anthropomorphize.
- Rooms may converge on positional shorthand ("top left") — panels are private, so this fails, but players may waste 20s discovering that. The tutorial card must say it.
- Reuse rate must be tuned: too low and naming never pays off.

## Done means
3 phones and a laptop on the same LAN. Three players who have never played complete a round, and at least 6 glyphs reach the Known Shapes gallery. Playback of the room's audio contains at least one invented noun used twice by two different people.
