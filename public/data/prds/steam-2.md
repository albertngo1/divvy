## Overview
Steam is a live cash-out betting game for 3–6 people around a TV. The host plays short real suspense clips — a Jenga tower rising, a trick-shot attempt, a soufflé in the oven, a domino run — and everyone privately rides a climbing multiplier on their phone, racing to cash out before the clip "crashes." For groups who already shout at YouTube.

## Problem
A "will it land?" clip is pure passive held breath you release by yelling. Steam converts that shared tension into money on the line, privately, so your nerve is tested against everyone else's in the room.

## How it works
- Host loads a clip with a hidden binary resolution (success/collapse) at an unknown moment. A multiplier starts at 1.00× and climbs as the clip runs — accelerating as visual tension mounts (hand-authored tension curve per clip).
- Each PHONE privately shows: your staked pot growing at the current multiplier, a giant CASH OUT button, a private "tell" card unique to you (e.g. "4th of 4 attempts — they usually nail the last one" vs. "watch his left hand"), and a live count "N still holding" (numbers only, never names).
- The shared HOST screen shows the clip, the big multiplier, and the total pot — but NOT who is still in, nor anyone's tell.
- The instant the clip resolves negatively (tower falls) = the CRASH: everyone still holding loses their stake. Cash out early to lock current multiplier × stake. If it resolves positively before you expect, the multiplier freezes and holders bank the frozen value — so bailing too early is punished too.
- One round = one clip. Highest banked chips wins.

Per-phone is load-bearing: 3–6 people hold simultaneous private positions with different secret tells and different nerves. A single passed phone cannot host four independent live bets at once.

## Technical approach
- Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve).
- Data model: Room{clipId, phase, tickStartTs}; Clip{videoUrl, tensionCurve[], resolveTs, resolveType}; Player{id, stake, cashedOutAt|null, tellId}. Server owns the clock.
- Sync: server broadcasts multiplier ticks (~10 Hz) derived from a deterministic tension curve keyed to video playback time; phones interpolate locally between ticks. CASH OUT sends a timestamped intent; server arbitrates against server-time multiplier (RTT-normalized) so a laggy phone can't cash out "in the past." The crash is a single server event at resolveTs.
- Hard part: latency fairness — everyone must see the same climbing number and the crash near-simultaneously, and each cash-out must resolve at the value the player actually saw. Solve with a server-authoritative multiplier, per-phone RTT estimate, and a ~150 ms cash-out grace window.

## v1 scope
- 3 players, one hardcoded clip with hand-authored tension curve + resolve time.
- Fixed equal stakes; multiplier, cash-out, crash, banked total, winner.
- 3 static "tells."

## Out of scope
- Clip library / upload, categories, multi-round bankroll, real video-frame analysis, spectators, camera adjudication.

## Risks & unknowns
- Does a pre-authored curve feel fair, or do players reverse-engineer resolveTs? Randomize clip order and seed some early crashes.
- Latency fairness on cheap phones.
- Are the private tells fun or just noise? Playtest.

## Done means
3 phones join, watch one clip, see a shared climbing multiplier, each independently cash out (or crash), and the host shows a correct banked-chip ranking — with each cash-out resolving at the multiplier the player saw within 150 ms.
