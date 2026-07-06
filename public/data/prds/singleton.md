## Overview
Singleton is a phone-native riff on *Just One* for 4–6 players, cooperative. One rotating guesser tries to name a secret word from single-word clues written by everyone else — but any clues that match each other are silently canceled first. The tension is writing a clue helpful enough to guide yet original enough to survive.

## Problem
*Just One*'s entire gamble — be useful but don't collide — only exists if clue-writing is private and simultaneous. Pass one phone around and every later writer sees the earlier clues; the game is ruined. And a physical version can't tell you how risky your word is. A phone can: it can privately warn you that your "obvious" choice is exactly what everyone else will write.

## How it works
Each round the server picks a target word and shows it PRIVATELY to all clue-givers; the guesser's phone instead shows a "look away" screen. Every giver privately types ONE word. As you type, your phone displays a private **collision meter** — a live estimate of how common/obvious your choice is, drawn from a bundled frequency table — tempting you toward or away from the safe answer. No other player's clue is ever shown to you.

On submit-lock, the server normalizes and compares all clues; exact matches and simple stem/plural matches CANCEL and are hidden. The host TV then reveals only the surviving clues (shuffled). The guesser says one guess aloud; the host reveals hit or miss.

**Each phone PRIVATELY:** the target word (givers) or an eyes-closed screen (guesser), plus your clue entry and collision meter.
**Host TV:** target hidden during writing, then the surviving clues and the result.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `room{ targetWord, guesserId, clues:{playerId:{word, locked}}, phase }`. Clues live server-side and are NEVER broadcast until every giver locks and cancellation resolves. Cancellation v1: lowercase, strip plurals, light stemming, group, drop any group of size ≥2. The collision meter is a client-bundled word→popularity dictionary so it leaks nothing over the wire. The genuinely hard part: keeping the target off the guesser's screen (honor + a dedicated look-away view) and tuning near-duplicate detection so it feels fair — v1 stays intentionally conservative (exact + stem only) to avoid canceling legitimately distinct clues.

## v1 scope
- 4 players: 1 guesser, 3 givers, ONE round
- One target from a ~200-word list
- Exact + plural/stem cancellation only
- Collision meter = simple frequency lookup

## Out of scope
- Synonym/embedding-based cancellation
- Multi-round scoring, streaks, guesser-rotation logic
- Spectator view, saboteur/hidden-role variants

## Risks & unknowns
- Guesser peeking (honor system only)
- Near-duplicate detection too aggressive or too lax
- Collision-meter data quality
- Three givers all picking the same obvious word → zero survivors (this is the intended fail-comedy, not a bug)

## Done means
Four phones connect; givers see a word the guesser cannot; all three type privately with a live collision meter; duplicate clues cancel server-side; the TV shows only the survivors; the guesser guesses aloud; hit/miss displays — and at no point does any phone reveal another player's clue before lock.
