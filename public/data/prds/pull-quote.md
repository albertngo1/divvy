## Overview
Pull Quote is a cooperative concurrent-room party game for 3 players. A wall of text sits on the shared host screen; each player privately drags across their own phone to select a contiguous run of words — the 'pull quote' they believe is the room's obvious pick. The room wins only when all three selections are byte-for-byte identical. It's for people who like Codenames-style 'read the room' telepathy but with zero talking and no clue-giver.

## Problem
Schelling-point party games are almost always single-answer (pick a word, pick a tile). Selecting a *span* — where do you start, where do you stop — is a far richer convergence target with real texture, but it only works if everyone commits privately and simultaneously. Passing one phone around leaks the answer instantly.

## How it works
The **host screen** shows a ~60-word passage (an evocative paragraph, a fake product blurb, a horoscope) with each word tokenized. Below it: a live **coverage heatmap** — each word tinted by how many players' current spans cover it (0/1/2/3), and nothing else. No names, no boundaries, no counts spelled out.

Each **phone** shows the *same* passage privately, and the player drags a start-handle and end-handle to select a contiguous span. Your own span is highlighted only on your phone. You watch the shared heatmap warm up where the three of you overlap, then nudge your handles inward or outward to tighten toward the emerging consensus band. When you're confident, you tap **Lock**. Any player can unlock and re-drag until all three are locked *and* the three spans are identical. On win, the host reveals all three spans stacked, the agreed pull quote enlarged as a poster.

The fun is the silent negotiation of edges: everyone can see the phrase is 'the quiet part' — but does it include 'the' before it? The trailing comma-clause? You converge boundary by boundary.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). **Data model:** room = { passageId, tokens:[...], players: { id → { span:[startIdx,endIdx], locked:bool } } }. Phones send span updates (throttled ~10/s); server recomputes per-token coverage counts and broadcasts only the aggregate array + lock flags — never individual spans until win. Win check: all locked && all spans deep-equal. **Genuinely hard part:** it's cheap sync (small integer state), so the real work is passage curation — text with exactly one 'gravitational' phrase but a fuzzy, negotiable boundary, so convergence is non-trivial but achievable in ~5 nudges.

## v1 scope
- 3 players, one passage, one round
- Two-handle contiguous span select on phone
- Shared coverage heatmap (0–3 tint) as sole feedback
- Lock/unlock; win on identical locked spans
- Winning-quote reveal poster

## Out of scope
- Multiple rounds / scoring across rounds
- Non-contiguous or multi-span selection
- Player-submitted passages
- More than 3 players (heatmap tiers get muddy)

## Risks & unknowns
- Passages with a *too*-obvious phrase are instant wins (boring); *too*-ambiguous ones stall. Needs playtested corpus.
- Boundary convergence may frustrate if two players anchor on different sub-phrases.
- Heatmap must convey '2 of 3 agree here' legibly on a TV at distance.

## Done means
Three phones join, each selects a span, the host heatmap updates live from aggregate coverage only, and when all three lock identical spans the host displays the shared pull quote — with no phone ever having seen another player's selection before the win.
