## Overview

A 4–6 player couch game for people who already watch clips together and already fight over the remote. Instead of betting on *what happens* in a video, you bet on *which seconds of it get to exist*. Every player secretly owns slices of the timeline; the room collectively holds a skip button. Your money is in the minutes, and the minutes are only safe if nobody knows they're yours.

## Problem

Group video watching is passive and the remote is a tyranny — one person skips, everyone shrugs. Existing second-screen betting games are all prop bets ("will he cry?"), which turn the video into a trivia substrate and go stale the moment the clip ends. Nobody has made the *act of watching* the contested resource.

## How it works

Host screen: a 6-minute video, chunked into eighteen 20-second slots shown as a bar along the bottom.

**Auction (60s, sealed):** each phone privately sees the slot grid with thumbnails-only (one blurred frame per slot, no audio, no context) and 12 chips. You secretly allocate chips across slots. High bidder owns a slot; ties split ownership. Phones show *your* holdings only. The host screen shows nothing but "3 of 4 players locked in."

**Playback:** the video plays. At any moment a player can press SKIP on their phone; a skip fires only when 2 of 4 press within 5 seconds, jumping ahead 20s. The host screen shows the vote count filling — but never who pressed. Phones privately show your own holdings ticking green as your seconds actually air.

**Payout:** 1 point per owned second aired. Plus, at the end, the room votes on the single best moment; whoever owned that slot doubles it.

The fun is entirely verbal: "no wait, this part's good" is a confession. Defend too hard and the room skips you out of spite. Say nothing and you get skipped anyway. Bidding on the obviously-great-looking thumbnail means splitting it three ways with people who then have no reason to skip — dull safety versus lonely, indefensible ground.

## Technical approach

Host tab + phone PWAs over a PartyKit Durable Object per room.

Data model: `Room { videoId, slots[18], phase, clockMs, skipVotes:Set }`, `Player { id, chips, bids:Map<slotIdx,chips>, holdings:Set<slotIdx> }`. Bids stay server-side until auction close; the client never receives another player's bid map, so leakage is impossible by construction rather than by UI discipline.

Sync: the host tab is the only thing playing video. It broadcasts `currentTime` at 4Hz; the server is authoritative for slot accounting so a lagging phone can't dispute what aired. Skip votes are timestamped server-side within a 5s sliding window.

Hard part: skip attribution. The server must decide *which slot was airing* when a vote landed, under 100–300ms of phone latency, or scores get argued over. Fix: votes carry the host's last broadcast `clockMs`, not the phone's clock, and slot accounting runs off host time only.

## v1 scope

- One hardcoded 6-minute YouTube/mp4 clip
- 4 players, 12 chips, 18 slots
- Sealed auction, one playback, skip needs exactly 2 votes
- Points = seconds aired + best-moment double
- Ownership revealed on the results screen, slot by slot

## Out of scope

- Video library or upload
- Rewind, pause, variable skip length
- Reselling slots mid-playback
- More than one round

## Risks & unknowns

- Blurred thumbnails may not give enough signal to make bids feel like judgment instead of dice.
- The 2-vote threshold may be too easy at 4 players; may need 3.
- Silent players get farmed. A minimum-airtime floor might be needed.

## Done means

Four people on four phones complete an auction and a playback where at least two skips fire, at least one player audibly lobbies against a skip, and the reveal screen makes the room laugh at someone who defended their own slot too obviously.
