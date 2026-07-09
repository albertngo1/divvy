## Overview
Warmer is a Jackbox-shaped cooperative party game for 3–6 players riffing on Wavelength. Instead of one psychic hiding a single target, *every* player is secretly planted at a different point on the same spectrum, and the room must reconstruct the whole ordering from one clue each. It's for groups who love Wavelength's "read the mind through a fuzzy analog dial" itch but want everyone thinking at once instead of waiting their turn.

## Problem
Wavelength is brilliant but serial: one clue-giver, one dial, everyone else idle between turns. The magic — expressing a precise hidden value through an imprecise clue — happens once per round for one person. Warmer makes that the job of every player simultaneously, and turns the guessing into a single satisfying collaborative sort.

## How it works
The host TV shows a labeled axis, e.g. **Cheap ← → Expensive: "things in a kitchen."** Each phone PRIVATELY shows that player's own secret position as a number 0–100 and a little marker on their own copy of the axis — *only they see it.* Nobody sees anyone else's number, or even the distribution.

Each player types one clue word evoking a thing at their point (at 90 on Cheap↔Expensive you might say "espresso machine"; at 10, "paper towel"). Clues drop onto the host screen as anonymous name-tokens in random order.

Then the whole room, together, drags the name-tokens into the order they believe the hidden values run, left to right — argued out loud, resolved on the host screen. Lock in. The host reveals every true position and scores the guessed ordering against the real one (Kendall-tau distance): a perfect sort is a group triumph, one swap is a groan. One shared score, one round.

The privacy is load-bearing: the entire puzzle *is* that only your own phone knows your value. A single passed-around phone cannot hold five simultaneous private targets — the game collapses into everyone announcing their number.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { axis, phase, players[] }`, `Player { id, name, secret:0..100, clue, connected }`. Server assigns `secret` via spaced sampling so points aren't adjacent-clumped. Phases: `assign → clue → sort → reveal`. Sync is trivial — low-frequency discrete events (clue submit, token-drag broadcast, lock-in); the host is the display authority for the drag order, one editor at a time via a soft lock. Genuinely hard part is *content*, not networking: axes must be spanning-but-not-mappable-to-obvious-numbers, and the scoring must feel fair when two secret points are near-tied (bucket near-ties as "either order accepted").

## v1 scope
- 3 players, one hand-authored axis, one round.
- Private numeric target per phone; one text clue each.
- Host-screen drag-sort with a single soft editor lock.
- Kendall-tau score with near-tie tolerance; reveal screen.

## Out of scope
- Multiple rounds, running score, teams.
- Fancy Wavelength-style dial art.
- Auto-generated axes / any NLP on clues.

## Risks & unknowns
- Do one-word clues carry enough signal to sort 5 points, or only 3? (v1 caps at 3 to de-risk.)
- Near-tie scoring feeling arbitrary.
- Players gaming it by encoding numbers into clues — needs a social "no numbers" rule.

## Done means
Three phones each see a distinct private 0–100 target, submit one clue, the room sorts anonymized tokens on the host, and locking in reveals true positions plus a tau score — playable end to end on real phones over the WebSocket server.
