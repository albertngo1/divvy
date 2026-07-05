## Overview
A real-time private-betting game layered on top of the most passive group activity there is: watching a clip together. The TV plays a 60-90s video; each phone is a private sportsbook running a live, decaying line on props about that clip. For friend groups who narrate everything they watch — now the narration is a wager. 3-6 players, one round.

## Problem
Group video-watching is pure spectating; the only interaction is talking over it. But everyone's already secretly predicting — "he's totally going to drop it," "a dog shows up in 3, 2…". That instinct has no stakes and no scoreboard. And the tension isn't *whether* you're right — it's whether you dared to commit before it was obvious.

## How it works
The host TV plays a curated clip. Before it starts, each phone is privately dealt **3 prop bets** about the clip ("someone says a number," "the camera goes handheld," "a character cries"). Props differ per phone.

- **Each phone (private):** shows your 3 props, each with a live **line** — a multiplier starting high (say 8×) that decays every second as the clip plays. Each prop has a LOCK button and a hidden 10-chip stake. You lock whenever you dare; the multiplier *at your lock moment* is frozen as your payout. Lock early on a hunch = high multiplier, high risk. Wait until you literally see it happen and the line has decayed to ~1×, so wait-and-see earns almost nothing.
- **Host TV (shared):** plays the clip and owns the master clock. It shows nobody's props or locks — only the clip and a running timer. At clip end it resolves each prop (host operator taps happened/didn't, or group vote) and reveals the payout board.

Props pay `stake × locked-multiplier` if the event occurred by clip's end, else the stake is lost. The whole game is a private nerve contest against a bleeding number.

## Technical approach
Host tab + phone PWA + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). 

Data model: `Room { code, clipId, startTs, phase }`, `Hand { playerId, props[3]{ text, stake, lockedAt|null, lockedMultiplier } }`, resolution `{ propId, hit }`. 

The genuinely hard part is **clip-timeline sync**: the decaying line must be identical and fair across phones, so multipliers are computed from the host video's `currentTime`, not each phone's wall clock. Host emits periodic `tick { videoTime, serverTs }` heartbeats; phones interpolate locally and reconcile on each tick, and a lock sends the phone's estimated `videoTime` for the server to authoritatively price. This tolerates buffering/pauses on the host and per-phone latency. Clips are a small static JSON list with hand-authored props for v1.

## v1 scope
- 3 players, one hard-coded clip, 3 props each
- Live decaying line, single lock per prop, stake fixed at 10
- Host-operator taps to resolve; one payout board

## Out of scope
- Auto-detecting prop events (CV/audio); community clip library
- Cash-out/re-bet, parlays, line movement from crowd money
- Rounds/match play beyond one clip

## Risks & unknowns
- Resolution ambiguity ("did that count as crying?") — needs crisp props.
- Decay curve tuning so early nerve genuinely beats safe waiting.
- Timeline sync under a laggy host connection.

## Done means
Three phones join, a clip plays on the TV, each phone shows 3 private props with a live decaying line, players lock at different moments, and at clip end the board pays each locked prop at its frozen multiplier — with the line provably driven by host `videoTime`, not local clocks.
