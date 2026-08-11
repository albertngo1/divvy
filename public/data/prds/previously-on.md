## Overview

A 10-minute party game for 4–6 people around one TV. Everyone watches a 60-second clip — a cooking segment, a reality-show confessional, a nature doc — with phones face-down. The clip is not the market. The market is the *recap*: one player has to describe what just happened out loud, and everyone else has already bought shares in what that description will and won't contain.

## Problem

Every prop-betting party game has the same failure: the moment betting opens, the room stares at phones and stops watching the thing they were supposedly enjoying together. Betting on a human retelling inverts it — the only way to have an edge is to actually watch, and the only way to cash it is to read the person talking. The passively-consumed clip becomes shared evidence rather than a scoreboard.

## How it works

1. **Watch (60s).** Host screen plays the clip. All phones show a lock screen: "Watch." No input accepted.
2. **Deal (20s).** The server names one player the Recapper on the host screen. Every *other* phone privately receives a disjoint hand of 4 claim cards drawn from a deck seeded to the clip — "the recap names a color," "the recap mentions the dog," "the recap runs under 15 seconds," "the recap states something that did not happen." Each bettor privately stakes 1–3 chips per card, or passes. Nobody sees anyone else's hand, so nobody knows the full board.
3. **Recapper's private brief.** The Recapper's phone alone shows three details they are paid to *suppress* and one false detail they are paid to *smuggle in*. They also earn a cut of every chip the table loses — so they are guessing at claims they cannot see.
4. **Recap (max 30s).** Recapper talks. Bettors may not speak. Host screen shows only a timer and the Recapper's name.
5. **Settle.** Host screen walks the claim list; the room votes yes/no on each with a tap. Payouts fire, the suppression brief is revealed, and the table finds out how badly they were handled.

Private on phone: your claim hand, your stakes, the Recapper's brief. Public on TV: the clip, the timer, and settlement.

## Technical approach

Host browser tab + phone PWAs over a PartyKit / Durable Object room holding authoritative state: `{roomCode, clipId, phase, recapperId, hands: {playerId: Card[]}, stakes: {playerId: {cardId: chips}}, brief, votes}`. Phones subscribe to a filtered projection — the server never ships another player's hand down the wire, since view-source is a real attack in a room full of friends. Phase transitions are server-timed and broadcast; clip playback is host-local with a `clipStarted` timestamp so phones can unlock in sync without needing frame accuracy.

The hard part is settlement, not sync. "Did the recap mention the dog?" is contested by design, and the person who benefits from the answer is in the room. v1 punts to a majority tap-vote with the Recapper's vote excluded; a mic transcript via Web Speech API is a later credibility layer, not the mechanism.

## v1 scope

- One hardcoded 60-second clip, one round, 4 players, one Recapper
- 12 hand-authored claim cards for that one clip; 4 dealt per bettor
- Flat chip stakes (1–3), no odds, no pari-mutuel pool
- Majority tap-vote settlement on the host screen
- Room code join, no accounts, no reconnect handling

## Out of scope

Multiple rounds and rotating Recappers; speech transcription; a clip library or user-supplied video; live odds; spectators; mobile-host mode.

## Risks & unknowns

Claim cards must be genuinely 50/50 for the specific clip — authoring them is the real design work and doesn't generalize cheaply. The Recapper may find suppression trivially easy by just talking for four seconds; a minimum-word-count floor may be required. Vote-settlement can curdle into arguing, which is either the best part or the thing that kills the round.

## Done means

Four phones join a room code, one clip plays, four private hands are dealt with zero cross-leakage (verified by inspecting the socket traffic), a recap is given, all claims settle by vote, and the host screen shows a final chip standing — and in playtest at least one bettor visibly changes their read of the Recapper mid-sentence.
