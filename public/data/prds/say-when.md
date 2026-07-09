## Overview
Say When is a cooperative nerve game for 3–4 players around one host screen (TV/laptop) and their phones. A gauge climbs on the TV; the round ends the instant ANY player vocalizes. Each player may speak exactly one word the whole round — so speech is both your only action and your scarcest resource. The catch: three private constraints must ALL be satisfied by the single moment the gauge stops.

## Problem
Most 'stop the timer' games are solo reflex tests. And most party games reward the loudest person. Say When inverts both: it makes silence the strategy and hands the group one irreversible shared trigger, forcing tense nonverbal negotiation over who dares to be the one to speak.

## How it works
The host TV shows a single authoritative gauge sweeping 0→100 over ~12s (then looping). PRIVATELY, each phone shows a different secret constraint on the final stop value — e.g. 'must land in the GREEN band (40–60)', 'must land on an ODD tick', 'must be AFTER the bell chimes at ~8s'. No phone sees the others' constraints. Phones also show a silent 'ready / not-yet' toggle whose state appears on the TV only as anonymous colored dots, so the team can align timing without words.
The stop itself IS a vocalization: the first phone whose mic detects your voice fires the stop at that server-stamped instant, freezing the gauge. Because you get ONE word, a nervous giggle or 'um' burns it and ruins the timing. The team wins only if the single frozen value satisfies all three private constraints simultaneously — so players must silently deduce who is best positioned to call and hoard their breath until the exact tick.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). The DO owns the gauge and ticks value at fixed cadence, broadcasting to all clients. Data model: `room { phase, gauge{value,running,startedAt}, players[{id, constraintId, wordSpent, ready}], stop{playerId, value} }`. Each phone runs WebAudio AnalyserNode RMS with an adaptive noise floor; an onset above threshold = a vocalization event, sent with the client's audio-capture timestamp.
The genuinely hard part: fairly mapping a phone's mic-onset time to the shared gauge value. Client audio latency + network jitter mean a naive stamp is unfair. We calibrate per-phone RTT and clock offset (ping/pong before start), then the server reconstructs the true gauge value at (onset_time − offset). Second hard part: gating the owner's own voice from room crosstalk — each phone is near its owner's mouth, so a per-phone SPL threshold set during a 3s calibration hush isolates the owner.

## v1 scope
- 3 players, one round, one gauge.
- Exactly three constraint types (green band / odd tick / after-bell).
- First vocalization from any phone stops the gauge; win = all three satisfied.
- Anonymous ready-dots on TV; no chat.

## Out of scope
- Scoring across rounds, leaderboards.
- Speech-to-text of the word; multiple words; role variety.
- More than 4 players or multiple simultaneous gauges.

## Risks & unknowns
- Mic false-triggers from HVAC/laughter could stop the gauge unfairly — tune threshold + hush calibration.
- Latency normalization may still feel ~50ms off; playtest whether that matters at 12s sweeps.
- Is one shared irreversible stop too punishing? May need a 2-stop budget.

## Done means
Three phones join, each sees a distinct private constraint, the TV gauge sweeps, the first vocalization freezes it within ±1 tick of the true value, and the host screen correctly declares win/loss by checking all three constraints against the frozen value.
