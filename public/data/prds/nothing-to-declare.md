## Overview
A bluffing party game for 3-5 players riffing on *Sheriff of Nottingham*, compressed to a single tense round. Each round one player is the Customs Officer; the rest are Smugglers, each holding a private bag of goods only visible on their own phone. Smugglers publicly DECLARE what's in their bag (truth or lie); the Officer inspects exactly one bag. Catch a liar and you seize their contraband; open an honest bag and you pay them a penalty. The bag's true contents living on one private phone is the whole game.

## Problem
*Sheriff of Nottingham*'s joy is the eye-contact bluff over a sealed pouch — but it's slow (the sheriff visits every player, lots of downtime) and needs physical cards you all pretend not to peek at. Phones fix both: contents are genuinely secret, declarations are instant, and one simultaneous reveal replaces a long inspection lap.

## How it works
Server deals each Smuggler a private hand of 3 goods — a mix of LEGAL (low value) and CONTRABAND (high value, illegal). The phone PRIVATELY shows your real bag. On the host TV, each Smuggler is a face-down bag. Each Smuggler taps a DECLARATION on their phone: they claim their bag holds only legal goods of a stated type (e.g. 'three apples'), which posts publicly to the TV — the claim is visible, the truth is not. The Officer sees only the public claims and, on their own phone, privately selects ONE bag to inspect (or waives inspection entirely). On lock, the TV flips every bag at once. Scoring: an inspected liar forfeits their contraband to the Officer; an inspected honest Smuggler collects a bribe-penalty FROM the Officer; un-inspected Smugglers keep everything they smuggled — so contraband that slips past scores big. The Officer's inspect choice stays private until the simultaneous flip, so no one can read a tell mid-decision.

Per-phone privacy is load-bearing: your true bag is invisible to the room, the Officer's target is hidden until reveal, and a single passed-around phone would leak every bag on the way to the officer.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object): `{officerId, bags: {playerId: {goods[], declaration, inspected}}, phase}`. Phases: DEAL → DECLARE (Smugglers, timed) → INSPECT (Officer picks one, timed) → REVEAL → SCORE. Almost no real-time pressure — the only synchronized beat is the simultaneous REVEAL, which the server gates until the Officer locks, then broadcasts one flip event so no phone reveals early. Deck is a static JSON of goods with values/legality; dealing is server-side RNG. The hard part is less technical than economic: TUNING the payoff matrix (contraband value vs. false-inspection penalty vs. slip-through reward) so bluffing and honesty are both live options and the Officer's inspect isn't a pure coin-flip.

## v1 scope
- 3 players (1 Officer, 2 Smugglers), one round.
- Fixed 6-good deck, 3 goods dealt each.
- Declaration is a single dropdown ('all legal: X'); Officer inspects one or waives.
- Simultaneous reveal + a one-screen score tally.

## Out of scope
- Officer rotation, multi-round economy, bribes/negotiation UI.
- Partial-truth declarations, variable bag sizes.
- Persistent scores or leaderboards.

## Risks & unknowns
- Payoff balance — easy to make honesty or lying dominant; needs playtest.
- With only 2 Smugglers the Officer's odds are coarse; may want 3+ for tension.
- Declarations may feel thin without a live bribe/haggle step (deferred).

## Done means
Three phones join; each Smuggler sees a private bag the room can't; both post a public 'all legal' claim to the TV; the Officer privately picks one bag; on lock all bags flip simultaneously; a caught liar's contraband transfers to the Officer and the tally screen shows the swing.
