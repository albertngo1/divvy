## Overview
A living-room prediction-market party game for 3-6 people watching a short curated clip together (a cooking-show plating, a game-show final answer, a nature-doc chase, a trailer). The host TV is the screen everyone watches; each phone is a private bet slip building a **parlay** — a chain of predictions that only pays if *every* leg lands.

## Problem
Watching clips together is pure passive consumption. Someone yells "he's gonna drop it!" and is right, and... nothing happens. There's a whole prediction market in the room and no stakes on it.

## How it works
The clip is pre-split into three segments. Before each segment the host **pauses on a prompt card** — "What does the contestant do?" — with 3-4 options. Each player privately taps one option on their phone and stakes chips; that pick becomes the next leg of their parlay. Then the segment plays and resolves the leg.

The twist that makes hidden phones load-bearing: payout multiplier = the **product of each leg's rarity**. If you were the only one who called the long-shot option and it hit, that leg pays huge; if everyone picked the same "chalk" answer, it barely pays. Because rarity is computed from what others secretly picked, seeing anyone else's slip mid-game would let you copy the safe money and collapse the market — so simultaneous privacy is the entire game.

**Private (phone):** your building parlay, your three picks, your live combined multiplier, your chip stack.
**Shared (host):** the video, the prompt options, an anonymized lock counter, and — only at the end — the final standings. Never who picked what mid-round.

## Technical approach
Host browser tab (sole video source) + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{clipId, segmentIdx}`, `Segment{prompt, options[], answerId}`, `Player{id, chips, parlay[]}`, `Pick{playerId, segIdx, optionId, stake}` (server-held). Sync: the host gates segment advance on a server "all locked" barrier; the server holds picks hidden, computes each option's rarity *after* lock, resolves the leg against the authored answer, and pushes only per-player state. The hard part is aligning the video timeline with the betting windows across the network and guaranteeing zero pick-leakage before the barrier — phones are pure bet slips, they never stream the video.

## v1 scope
- One 90-second clip, three segments, hand-authored prompts + answers.
- 3 players; each privately locks one pick + stake per segment.
- Server computes rarity multipliers and all-three-legs-hit parlay payouts.
- Host shows final standings.

## Out of scope
- User-supplied or live videos; live sports feeds.
- Auto-generated prompts; streaming the actual video to phones.
- Cash-out / hedge markets, insurance legs, multi-clip tournaments.

## Risks & unknowns
- Content authoring burden: needs a genuinely surprising clip with fair, resolvable prompts.
- Spoiler risk if a player has seen the clip — favor obscure footage.
- Rarity payouts can feel swingy with only 3 players; may need a floor multiplier.

## Done means
Three phones join, the clip plays through three pause points, each phone privately locks a pick + stake per segment, the server computes rarity-weighted parlay payouts requiring all three legs to hit, and the host shows final standings — with no phone ever seeing another's pick before the round ends.
