## Overview
Brownout is a cooperative, voice-negotiation party game for 3-4 players in the Devils & the Details lineage. Each phone runs one kitchen appliance on a shared electrical panel; the group must finish every appliance's cook cycle without ever exceeding the breaker — but no one can see anyone else's power draw. The host screen is the breaker panel; each phone is a private appliance.

## Problem
Shared-resource party games usually make everyone's state public (you can see the whole board), so "coordination" collapses into silent optimization. The most fun real-world version of contention — a house where someone yells "don't run the microwave, I'm on the kettle!" — depends on nobody being able to see the total until it's too late. That hidden-sum panic is the itch.

## How it works
Host screen (shared): one big breaker gauge showing current TOTAL amps as a needle climbing toward a red TRIP line, plus four appliance icons with cook-progress rings. Crucially it shows the SUM, not the per-appliance breakdown.

Each phone shows PRIVATELY:
- **Your appliance** (kettle, microwave, toaster, blender) with its own draw in amps — different per appliance, and it SURGES randomly (e.g. a microwave spikes for 2s).
- **Your duty requirement**: cumulative on-time you must accumulate (e.g. "run 8 seconds total").
- **A big ON/OFF hold-button** — power flows only while you hold.

Because you can only see your own draw, and the panel shows only the sum, players must announce loads aloud ("I'm pulling six, I need three more seconds!") and take turns grabbing power windows. If the summed draw crosses the TRIP line for more than ~1s, the breaker flips: all cook progress resets and a re-arm delay burns the clock. Win = all four appliances reach their duty requirement before the round timer. The surges force live callouts — you'll think you have headroom, then someone's blender spikes and everyone must drop off fast.

## Technical approach
Authoritative WebSocket server (Socket.IO over Tailscale Serve or PartyKit). Data model: `Panel{tripAmps, currentSum, tripped, armDelay}`, `Appliance{baseDraw, surgeProfile, onHeld, cookAccrued, cookNeeded}`. Clients send only hold-down/up events with timestamps; the server owns draw simulation, surge scheduling, summation, and the trip decision at a fixed 20Hz tick — no client trusts another's numbers. Surges are server-seeded so the host panel and phones agree. The genuinely hard part is the trip hysteresis: a hard instant-trip feels unfair under network jitter, so the server integrates over-limit time (allow a ~1s grace) and RTT-normalizes hold timestamps so a laggy phone isn't blamed for a spike it already released.

## v1 scope
- 3 players, one 60-second round, one shared duty goal (each ~8s of cook).
- Fixed appliance draws + one scripted surge each.
- Breaker = single trip line, single 3-second re-arm penalty on trip.
- No scoring beyond win/lose.

## Out of scope
- Multiple breakers / circuits, appliance upgrades, difficulty tiers.
- Any use of the mic (voice is human-to-human, not sensed).
- Rounds, ladders, spectators, reconnection polish.

## Risks & unknowns
- Does hidden-sum-only give enough info to negotiate, or does it feel random? May need the panel to flash "OVER BY ~2A" hints on near-trips.
- Surge timing under latency could feel like blaming the wrong player — hysteresis tuning is the whole game feel.
- With everyone able to just hold constantly, is turn-taking forced enough? Duty requirements must be sized so simultaneous full-on always trips.

## Done means
3 phones + a laptop: each player sees only their appliance's draw + duty; the host panel shows only the live sum climbing to a trip line; holding all appliances at once trips the breaker and resets cook progress; the group can win only by verbally sequencing power windows to hit all three duty goals within 60s.
