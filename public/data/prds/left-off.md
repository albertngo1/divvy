## Overview

A 4-player, one-round hidden-role game for a living room with a TV and four phones. Everyone talks through a simple division problem out loud. Three phones show the full room. One phone — the Blind Spot — shows a roster with one player silently absent. That player is never proposed for, never argued about, never named by one specific person. The tell is not a wrong statement. It is an absence, and the person best placed to notice it is the one being erased.

## Problem

Every hidden-role game with an asymmetric view has the odd player saying something *wrong*: the wrong island, the wrong left, the wrong lyric. That makes the tell a contradiction, and contradictions get caught by arithmetic. Nobody has built the version where the odd view is a *deletion* — where the imposter's screen is internally perfect, their reasoning is sound, and the only evidence against them is a hole in the conversation that they cannot possibly see. It also flips who the detective is: the erased player feels it in their body before anyone can articulate it.

## How it works

**Host TV (public):** eight illustrated objects on a table — a bike pump, a rice cooker, a dog, a tent, etc. A single shared **Allocation Board**: each object either sits unclaimed or shows a player's color. Nothing else. No chat log, no player list beyond four colored avatars, no scores.

**Each phone (private):** (a) your own two-line WISHLIST for the objects ("you want anything you could carry alone"); (b) exactly ONE other player's wishlist, so everybody is genuinely partially informed and "I can't see that" is a normal sentence; (c) a **target roster** — the buttons you tap to assign an object to a person.

The Blind Spot's roster has three buttons, not four. There is no gap, no greyed slot, no count. Objects have no per-person quota, so three targets for eight objects never looks arithmetically wrong.

The room talks freely for four minutes and drags objects onto the board by tapping *object → person* on their own phone; assignments land instantly on the TV and can be overwritten by anyone. Then everyone privately votes: **who was looking at a short roster?** The Blind Spot votes too, sincerely, having never been told anything.

Room wins if a majority names the Blind Spot. Blind Spot wins by surviving — which in practice means noticing, mid-round, that everyone keeps saying a name they don't have, and improvising cover.

## Technical approach

PartyKit Durable Object per room, one authoritative `RoomState`: `{ players[4], objects[8], allocations: {objectId → playerId|null}, phase, votes }`. On join, the server deals a `PrivateView` per socket: `{ wishlistSelf, wishlistOfOther, roster: playerId[] }`. The roster is the *only* field that differs, and it is computed server-side once — clients never receive the full player list on any other channel, which is the hard constraint.

That is the genuinely hard part: leak-proofing the client. Avatars on the TV are colors, not names; the phone's assignment UI renders strictly from `roster`; vote-time candidate lists must be built from `roster` too, or the Blind Spot's ballot exposes the trick one second early. We render the vote ballot as "tap a color on the TV" instead of a phone list to sidestep it. Allocation writes are last-write-wins with a server sequence number; the board is small enough that full-state broadcast at 10Hz is fine.

## v1 scope

- Exactly 4 players, one round, one hand-authored object set of 8
- One Blind Spot, chosen at random, never told
- 4-minute timer, then one vote, then reveal
- Host TV is a single static board; phones are one screen each
- No accounts, no persistence — room code only

## Out of scope

- 5+ players, multiple rounds, scoring across rounds
- Text chat, emoji, any phone-to-phone channel
- Content packs, art beyond eight SVGs
- Rematch with roles remembered

## Risks & unknowns

- **Too easy:** if the erased player calls it out at 30 seconds, the round is dead. Mitigation: the per-phone wishlist blindness gives everyone a legitimate reason to under-mention someone.
- **Too cruel:** being ignored for four minutes is a real feeling. The reveal has to land as a joke fast, and the erased player should get a point for calling it.
- Four players is thin for a majority vote; 2-2 splits need a tiebreak rule.

## Done means

Four phones join by room code. Exactly one receives a 3-button roster with no visual gap. The TV shows an eight-object board that updates within 200ms of any tap. After 4 minutes, all four vote by tapping a TV color, the reveal names the Blind Spot, and in playtest at least two of three rounds end with the erased player being the first to say "wait, has anyone talked to me?"
