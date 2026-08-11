## Overview

A 12-minute party game for 4–5 people watching a 3-minute clip on a shared TV — a competition-show tasting, a home-reno reveal, a wildlife hunt. Each phone is privately dealt prop contracts on that clip. The twist: **you can never settle your own contract.** Before the settlement bell you must hand every position to another named player, who accepts it half-blind. Research is only worth chips if someone else believes you.

## Problem

Private-betting layers over a group watch tend to be solitaire in parallel — five people quietly clicking, one winner announced at the end, no reason to talk. Making the position non-settleable by its author forces the value out of the phone and into the room: the whole back half of the clip is people pitching convictions they're not allowed to state plainly.

## How it works

1. **Deal (private).** As the clip starts, each phone receives 3 prop contracts from a clip-specific deck — "the soufflé collapses," "a judge says the word 'texture'," "the dog leaves frame before 2:00." Only you see your props.
2. **Stake (private, first 90s).** Stake 1–5 chips on each, choosing YES or NO. Unstaked contracts are discarded.
3. **Give up (public scramble, last 90s).** Offer each contract to a named player. Their phone shows: your name, the side, the stake, and one 40-character note you typed — which may be a lie. It does **not** show the prop text until they accept. You may talk out loud to sell it, but saying the prop's literal text voids the contract, so pitches stay at "this one is a lock, I promise."
4. **Accept cap.** Each phone can accept at most 2 contracts all game. Scarcity turns the final 45 seconds into a real scramble while the clip is still playing and evidence is still arriving.
5. **Bell.** Any contract still held by its author voids and the author eats the stake. Everything else settles for whoever holds it.

Host TV shows: the clip, the countdown, and a running transfer tape — *who offered to whom, and who declined* — with zero content. Reputation is public; information is not.

## Technical approach

Host tab + phone PWAs against a single authoritative Durable Object per room: `{clipId, tNow, contracts: {id, propId, authorId, holderId, side, stake, note, state}, acceptsUsed: {playerId: n}}`. Phones get a per-player projection; prop text for an un-accepted offer is withheld server-side, never client-hidden.

The hard part is the transfer race under a hard clock. Two players can tap Accept on the same contract inside the same 80ms, and accept-caps must hold globally. Single-writer DO serializes it: transfers are compare-and-swap on `(contractId, expectedState)`, losers get an immediate `claimed` bounce, and the UI shows an optimistic "pending" state that can flip to declined. Clip time is host-authoritative — the DO stamps `clipStartedAt` and every deadline derives from it, so a lagging phone never gets a longer window to shop a contract.

## v1 scope

- One hardcoded 3-minute clip, 4 players, one settlement bell
- 10-prop hand-authored deck, 3 dealt per phone
- One offer at a time per contract; accept cap of 2; 40-char note
- Host taps YES/NO on each prop at the bell to settle
- Transfer tape on the host screen; final chip standings

## Out of scope

Counter-offers, price negotiation, partial transfers, re-selling an accepted contract, multiple rounds, clip library, reconnect, odds or a pari-mutuel pool.

## Risks & unknowns

The accept cap may deadlock the endgame — if everyone fills up early, late contracts void en masse and the round ends in a whimper; caps and deal size need tuning against 4-player playtests. The "don't say the prop aloud" rule is honor-system and may be unenforceable in a loud room. And the note field is where all the fun lives or dies: 40 characters may be too thin a channel to carry a persuasive lie.

## Done means

Four phones join, receive disjoint private props with no cross-leakage on the wire, stake, and complete at least six give-up transfers under the clock with correct cap enforcement and no double-accept; the bell voids unheld contracts, settlement pays the holder rather than the author, and the transfer tape on the TV correctly shows every decline.
