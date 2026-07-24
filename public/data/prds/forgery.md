## Overview
Forgery is a phone-native riff on *A Fake Artist Goes to New York* for 4 players. Everyone collaboratively draws one secret object onto a shared TV canvas — but one player is the Faker who never learned the word and must bluff strokes. The twist: every spectator privately logs live suspicion as each stroke lands, so the catch isn't one end-vote but an accumulating secret dossier. For groups who like drawing games with a paranoia layer.

## Problem
Fake Artist is brilliant but analog-clumsy: one shared marker, honor-system word secrecy, and a single end-of-round vote that throws away every "wait, that stroke was weird" reaction you had mid-draw. Phones can hold the secret perfectly and capture suspicion the instant it happens — which is exactly what makes per-phone load-bearing here.

## How it works
Setup: the server picks a secret noun and secretly assigns one Faker. Every real artist's phone privately shows the word; the Faker's phone shows only "You're the Faker — blend in." TV shows a blank canvas and turn order.

Drawing lap: players take turns; the active player's phone becomes a private drawing pad — one continuous stroke, then submit. The stroke appears on the shared TV canvas. Crucially, while each stroke is drawn, every OTHER player privately drags a "sus" slider on their own phone for the drawer — recorded silently, per-phone, never shown on the TV. One lap, one stroke each (4 strokes total).

Reveal & vote: after the lap, each phone privately votes for the Faker. TV tallies. If the group fingers the Faker, the Faker gets one steal: privately type the word; correct = Faker wins anyway (they read the drawing well enough). If the group misses, the Faker wins.

Privately per phone: word-or-Faker status; your drawing surface on your turn; your live suspicion log; your final vote; the Faker's steal guess. Shared TV: the emerging composite drawing, turn order, final tally.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Room{word, fakerId, turnOrder[], strokes[{playerId, path[]}], suspicion[{fromId, aboutId, value, t}], votes{}, stealGuess}`. Word/role pushed only to the owning socket. Drawing: the active phone streams stroke points; the server relays to the TV as an SVG/canvas path (~20-30 pts/stroke, light bandwidth). Suspicion sliders stream privately to the server only. Genuinely hard part: phase-gating and fairness — locking the active drawer while everyone else's suspicion updates in real time, then a simultaneous private vote with no TV leakage of who suspected whom; the server buffers votes and reveals only the tally.

## v1 scope
- Exactly 4 players; one secret noun from a small curated list.
- One drawing lap (one stroke each), private suspicion sliders, one private vote, one Faker steal-guess.
- TV renders the composite drawing live.

## Out of scope
- Multiple laps/rounds, scoring across games, category hints.
- Suspicion analytics/replay, undo, colors, brush sizes.
- Rematch, spectators, player-submitted words.

## Risks & unknowns
- One stroke each may be too little signal to catch a good Faker; may need 2 laps — v1 tests the floor.
- Live suspicion sliders could distract from watching the drawing; needs a dead-simple UI.
- Stroke sync jitter on the shared canvas; mitigated by relaying completed strokes, not live-dragging.

## Done means
On 4 phones + a TV: exactly one phone shows "Faker" and the rest show the word, each player draws one stroke from their own phone onto the shared canvas while others privately log suspicion, and a simultaneous private vote plus a Faker steal resolves the round — with the word never appearing on the Faker's phone or the TV.
