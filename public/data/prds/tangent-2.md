## Overview
Tangent is a hidden-role party game for 4–6 players using a shared host screen (TV/laptop) and each player's phone as a private controller. Everyone answers a short burst of prompts; one player — the Tangent — has secretly been shown a subtly different prompt on every question. The group must find them from the answers alone.

## Problem
Fibbage and Quiplash are about writing funny lies. Nobody has bottled the specific paranoia of a group slowly realizing *they might not all be answering the same question*. The itch: an answer that's technically reasonable but faintly, hilariously off-topic — and the creeping suspicion of who's on a different wavelength.

## How it works
A round is 4 fast prompts. Every phone PRIVATELY shows one prompt and a text box. Loyalists all see the same prompt ("Name something you'd pack for the beach"); the Tangent's phone shows an adjacent one ("Name something you'd pack for a hike"). On a 12s timer, everyone submits one short answer privately. The host TV then reveals all answers for that prompt in an ANONYMIZED, shuffled grid — no names attached. Most answers cluster (towel, sunscreen); the Tangent's leak (bug spray, trail map) sometimes overlaps, sometimes sticks out. After 4 prompts, everyone privately votes for the Tangent. The Tangent scores if uncaught; loyalists score if caught. Crucially, the Tangent only ever sees their OWN prompt — they must infer the real question from the public answer cloud and steer their submissions toward overlap.

Private (phone): your prompt + your input box, never anyone else's prompt. Shared (TV): the anonymized pooled answers and the timer only.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{code, players[], round, prompts:{loyalPrompt, tangentPrompt}, tangentId, submissions:{playerId:{promptIdx,text}}, votes}. Sync: server assigns the role + prompts at round start and pushes each phone ONLY its private prompt; collects submissions; on all-in-or-timeout broadcasts the shuffled, identity-stripped answer list to the host. The genuinely hard part is not code (it's turn-gated, so real-time sync is trivial) — it's authoring prompt PAIRS adjacent enough to overlap yet divergent enough to occasionally out the Tangent.

## v1 scope
- 4 players fixed, exactly 1 Tangent, one 4-prompt round.
- 10 hand-authored prompt pairs.
- Text answers, 12s timer, one final private vote, plain score reveal.
- Room-code join, no accounts.

## Out of scope
- Multi-round meta/scoring, extra roles, LLM prompt generation, reconnection polish, spectators, keyboard niceties.

## Risks & unknowns
- Content authoring IS the game: pairs too close and nobody's ever caught; too far and it's obvious. Only 4 players and 4 prompts may give too little signal to deduce from. Phone typing is slower than tapping.

## Done means
Four phones join by code; each receives a private prompt (one differs); all submit; the host shows an anonymized grid per prompt; the group votes; the host reveals the Tangent and whether they were caught — playable end to end in one sitting.
