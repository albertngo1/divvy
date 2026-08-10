## Overview
Nothing's On is a 3–5 player game for the specific dead hour when a TV is on and nobody is really watching. Clips shuffle on the host screen; each phone secretly holds a small portfolio that earns or bleeds for every second a certain kind of content stays on air. The remote is the only lever, and it takes two people to pull it.

## Problem
Existing media-betting games all bet on an *outcome*: what happens, what gets ordered, who wins. But the real group-viewing dynamic isn't prediction — it's attrition. Somebody always wants to flip, somebody always says "no wait, this one's good," and nobody can say why. Nothing's On gives that argument a hidden financial motive and stops treating airtime as free.

## How it works
The TV autoplays 60-second clips from a shuffled bag. Each clip carries 2–3 public tags shown as a chyron: `animals · slow · outdoors`.

Private, on your phone: two contracts — one **LONG** tag paying +1 chip per second it's on air, one **SHORT** tag costing −1 chip per second. You never see anyone else's book. Also a big **FLIP** button you press and *hold*.

Public, on the TV: the clip, its tags, a live chip-total-free scoreboard showing only rank, and a **FLIP meter** that fills whenever *any* number of hands are holding — but never says how many or whose.

The channel changes only if two or more players are holding within the same 3-second window. So flipping is a conspiracy you have to run in public, in real time, without speaking your book aloud. You hold, the meter glows, and now the room knows *somebody* wants out — you're praying the person who joins you is a co-conspirator and not just bored. When two hands land, everyone learns that two people at this table share an interest, and the accusations start.

A 5-second grace period after each cut blocks instant re-flipping. Round is four minutes; highest chips wins.

## Technical approach
Host tab + phone PWAs + one Durable Object per room (PartyKit) or Socket.IO over Tailscale Serve. Model: `{ bag: [{clipId, tags[]}], nowPlaying, clipStartedAt, players: {id, book: {long, short}, chips}, holds: {playerId: lastHeartbeatMs} }`.

Accrual runs server-side on a 250 ms tick against the host's reported `video.currentTime` — the host is clock master, so a laggy phone never earns or loses differently from a fast one. Holds are 100 ms heartbeats, so a released button is detected in ≤200 ms without trusting a `mouseup` that may never arrive.

The hard part is the co-flip window: presses arriving from three devices with different RTTs must resolve deterministically into "were these within 3 s of each other?" Server stamps on receipt, maintains a sliding window per clip, and fires exactly one cut — then hard-locks flips for the grace period so a late third press doesn't double-cut the next clip.

## v1 scope
- 3 players, one 4-minute round
- 4 pre-tagged local MP4s, 5 tags total
- Two contracts per player, dealt at random, ±1 chip/sec
- Hold-to-flip, 2-player threshold, 3s window, 5s grace
- Scoreboard shows rank only until the end

## Out of scope
Streaming-service integration, trading or selling contracts, multi-round economy, tag negotiation, more than one short position, persistence.

## Risks & unknowns
Curating clips whose tags are unambiguous is most of the design work. A degenerate equilibrium exists where nobody ever presses and everything rides — mitigated by short bags and long clips making inaction expensive for somebody. Three players may be too few for the conspiracy read to land; five is probably the floor.

## Done means
Three phones join, each shows a different private book; a solo hold visibly fills the meter and does *not* cut; two holds inside 3 s cut within 400 ms; final scores are reproducible line-by-line from the server's per-second airtime log.
