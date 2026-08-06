## Overview
A fast three-player drafting game for people who like drafting but not the twenty minutes of silent staring. You do not build your hand; other people carve it for you. Your job is to guess what they need and take it away first, while your own pack is out of sight being vandalized.

## Problem
The good part of a booster draft is the pass — the moment you decide what to deny. The bad part is everything around it: one pack moves at a time, everyone waits on the slowest reader, and cards get physically shielded from view with cupped hands. Simultaneity is impossible in person. Given six phones, it is trivial.

## How it works
1. Each player is dealt a private **pack of 7 ingredient cards** and one private **recipe** (three named ingredients). Your recipe is drawn only from cards that actually exist in play, and recipes deliberately overlap — sometimes there is exactly one copy of a thing two people need.
2. **Your own pack immediately leaves.** Your phone shows your *left neighbor's* pack — 7 cards, face up, on your screen and nowhere else.
3. **Burn step (simultaneous, 20s shot clock).** Every phone taps exactly one card to destroy. Server resolves all three burns at once, then rotates every pack one seat.
4. **Second burn step.** You now hold the third player's pack, minus whatever your neighbor burned from it. Burn one more.
5. Packs come home with 5 cards each. Your phone finally shows your own hand for the first time. TV scores each player: 3 points per recipe ingredient that survived.
6. **The shared screen** never shows any pack. It shows a live **scarcity board** — a count of how many copies of each ingredient still exist anywhere — plus a graveyard of burned cards labeled by *which pack they left*, not who burned them. With three players every burn is a 50/50 whodunit, and the scarcity board is how you learn your own recipe is being starved without knowing by whom.

## Technical approach
Host tab + phone PWAs + one PartyKit Durable Object (fallback: Socket.IO over Tailscale Serve). State: `{packs: Map<packId, cardId[]>, holder: Map<packId, playerId>, origin: Map<packId, playerId>, recipes: Map<playerId, cardId[3]>, graveyard: [{packId, cardId, step}], step}`. Pack contents are routed strictly by `holder` — a client's socket only ever receives the pack it currently holds, so a modified client cannot request its own pack mid-flight. Burns are a **barrier**: the server buffers `{playerId, cardId}` until all three land or the 20s timer fires (timeout burns a uniformly random card and the TV says so, loudly), then applies all burns and rotates atomically in one broadcast. The hard part is the barrier's failure mode — a phone that disconnects mid-step must not deadlock the room, so holder assignment lives server-side and a rejoining phone re-requests its current pack by session token rather than replaying state.

## v1 scope
- Exactly 3 players, 21 cards from a 7-ingredient deck (3 copies each), 1 recipe of 3.
- Two burn steps. One round. No rematch.
- Scarcity board + unattributed graveyard on the TV.
- Random auto-burn on timeout.

## Out of scope
- 4+ players, variable pack size, protect/veto tokens, deck synergies.
- Any card art beyond a word and an emoji.
- Reconnect beyond a simple session-token rejoin.

## Risks & unknowns
- With only two burns per pack, denial may be too weak to feel agentic — may need packs of 5 with two burns.
- Players may not infer anything from the scarcity board and just burn at random; needs playtesting before adding rules.
- Getting your own hand only at the very end could read as anticlimax rather than payoff.

## Done means
Three phones complete a round in under three minutes; no phone ever receives its own pack's contents before the final reveal (verifiable in the frame log); the scarcity board decrements within 500ms of each resolved burn step; and at least one playtest ends with a player who lost their recipe's last copy audibly accusing the wrong person.
