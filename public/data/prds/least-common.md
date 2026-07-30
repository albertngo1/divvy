## Overview

A tiny silent cooperative puzzle for three players, a TV, and three phones. Everyone's token sits somewhere on a shared ring of 60 positions. Each player has a **private step size** and can only ever *add* it. The room wins the instant all three tokens occupy the same position. The catch: the TV shows the three positions **sorted**, as identical unlabeled pips. You know your own number, so you can read off the other two numbers — but not who owns which, and never how far anyone can stride.

## Problem

Match-without-talking games tend to hide the *target*. This one hides the *reachability*: the goal is visible, the arithmetic is visible, and the only unknown is what your partners are physically capable of. So the round becomes a wordless negotiation conducted in movement — you tap once and hold still to broadcast your stride, or freeze on a landing to say "come to me." Doing arithmetic on a partner's constraints from nothing but a sorted list of three numbers is a genuinely new coordination itch, and it's dead in the water if anyone can just look at another phone.

## How it works

Ring of 60 positions. Each player is dealt a random start and a private step drawn from {4, 7, 9} (one each, shuffled). Tapping ADVANCE moves you `+step mod 60`. There is no way to go backwards; overshooting means lapping the whole ring.

**Each phone privately shows:** your current position, your step size, an ADVANCE button, and a two-line hint of your reachable set ("you can only ever land on 3, 7, 11, …"). **The host TV publicly shows:** the ring with three identical pips, a sorted readout of the three values, the number of *distinct* occupied positions (3 → 2 → 1), and a **shared tap budget of 36** that decrements on every tap by anyone. 90-second clock. Win when the distinct count hits 1.

Because reachable set of player *i* is `start_i + gcd(step_i, 60)·Z` — that's stride 4 (gcd 4), 7 (gcd 1), 9 (gcd 3) — CRT guarantees at least five mutually reachable positions on every deal, so the room is never dead. The tension is that identifying them requires inferring two hidden strides from a sorted multiset that becomes ambiguous the moment two people tap at once.

## Technical approach

Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room; Socket.IO over Tailscale Serve works identically). Data model: `Room { code, phase, ring: 60, players: {id, pos, step}, tapsLeft, deadline }`. A tap is `{advance: true, expectedPos}` — the server rejects on mismatch, applies `pos = (pos + step) % 60`, decrements `tapsLeft`, then broadcasts two different payloads: to each phone its own `{pos, step}`, and to the host a **sorted** `positions[]` array with player identity stripped server-side. Identity must never leave the server in the host payload — the anonymity is the whole design, and it's one `.sort()` away from being leaked by a lazy client-side render.

The hard part is ordering, not throughput. Simultaneous taps must serialize deterministically and the host must render intermediate states, because if the server batches two taps into one broadcast frame the room loses the ability to attribute a jump — which is either the core difficulty or an infuriating bug depending on tuning. v1 chooses: broadcast every accepted tap as its own frame, ~40ms apart, and let genuine simultaneity stay ambiguous.

## v1 scope

- 3 players, one round, one deal, 90s, ring of 60, steps {4,7,9}.
- Shared 36-tap budget; forward-only movement.
- Host shows sorted pips + distinct count + budget. Nothing else.
- Win screen: reveal each player's stride and the five positions that were reachable all along.

## Out of scope

Backward steps, variable ring sizes, more than three players, multi-round or scoring, unsolvable-deal handling, a saboteur, chat or emotes of any kind.

## Risks & unknowns

Biggest risk is that it reads as homework — three people silently doing modular arithmetic is either delightful or a math test. Mitigation: the reachable-set hint on the phone removes the arithmetic and leaves the *social inference*, which is the fun part. Second risk: sorted-position anonymity may collapse instantly in a room of three, since watching one pip move by 9 basically outs a stride. Whether that's too fast is a playtest question; the lever is starting positions that cluster.

## Done means

Three phones join, each shows a different private stride, host never receives a payload containing player ids (verified by inspecting the socket frames), tapping is forward-only and clamped at 36 room-wide, two taps within 20ms produce two distinct host frames, and a fresh room of three converges to a single pip inside 90 seconds without speaking on at least half of ten scripted deals.
