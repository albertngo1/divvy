## Overview
Place Card is a 4-6 player hidden-role pointing game. Each phone privately holds a roster mapping secret codenames to the seats around the room. The imposter's roster has two codenames swapped. The room answers a series of targeting prompts by physically pointing; the imposter — sincerely reading a corrupted map — points at the wrong seat only on prompts touching the swapped pair. For social groups who want deduction without lying, and something more embodied than a verbal accusation loop.

## Problem
Deduction games are almost always verbal and lean on confident lying. Place Card removes lying entirely: the imposter is honest but operating on bad reference data. The itch is spatial and low-pressure — you're hunting a *consistent geometric error*, not a smooth talker. That makes the "subtly-different private view" the literal mechanic, not a flavor layer.

## How it works
Players sit in a ring and register their seat index on their phone. Each is secretly assigned a codename (Falcon, Otter, Cardinal…). Every phone privately shows a roster diagram: a ring of seats labeled with codenames. Honest phones share one true mapping; the imposter's phone shows the same diagram with two codenames swapped between seats. The host screen then displays five targeting prompts one at a time — *"Point at OTTER"* — and on the count of three, everyone taps the target seat on their phone (v1) or points physically. The honest majority converges on the true seat; the imposter diverges only on the ~2 of 5 prompts naming a swapped codename. The host shows an anonymous heatmap of where fingers landed — never who pointed where. After five prompts, everyone privately votes for the corrupted player, then reveal.

**Phone (PRIVATE):** your codename, the full roster map (true or corrupted), your tap, your vote. **Host screen (SHARED):** the current prompt, the aggregate pointing heatmap, timer, final reveal.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Objects or Socket.IO over Tailscale Serve). Data model: `Room{ seats[], roster: seat→codename, imposterId, corruptedRoster, prompts[], answers[], votes[] }`. Server generates one true roster and a corrupted copy (swap two entries), hands the corrupted one to the imposter's socket, pushes prompts, collects tapped seats, and broadcasts only per-seat counts (the heatmap). Sync is low-rate. The genuinely hard part isn't plumbing — it's **corruption tuning**: choosing which codenames to swap and which prompts to ask so divergence is neither obvious on a single prompt nor invisible across five, especially with few players.

## v1 scope
- 4 players, one round, 5 prompts
- Tap-the-seat on phone (no camera pointing capture)
- One imposter, single swap pair, hardcoded codename pool

## Out of scope
- Camera/CV physical-pointing detection
- Multiple rounds, cross-game scoring, >6 players
- Dynamic difficulty

## Risks & unknowns
With only 4 players a single swap may be too obvious; prompt selection must include decoy targets. Tap-to-vote sacrifices the physical-comedy charm of real pointing. Codename memorization adds cognitive load.

## Done means
Four phones join, each shows a roster (exactly one corrupted); the host runs five prompts; the heatmap updates live from taps; everyone votes; the reveal states whether the group caught the corrupted-roster player. Testable: force the imposter seat and confirm their answers diverge on exactly the swapped-codename prompts and match on the rest.
