## Overview

A 5-player, one-round hidden-role game for a living room with a TV and five phones. Everyone answers the same rapid either/or prompts privately. Between prompts, each phone shows only *your own* row of the agreement graph — who matched you. Exactly one player's row has one specific other player's result silently inverted, all game long. Neither of them is told. The round ends with the room trying to name the broken feed.

## Problem

Most "imposter sees a different screen" games corrupt a document: a map, a photo, a rulebook. The tell is a fact. Here the corrupted thing is a *relationship* — an edge in a social graph — and the corruption is invisible from one seat and undetectable from the other. It produces the one argument party games rarely manufacture honestly: two people who both sincerely believe the other is misremembering the same eight minutes.

## How it works

1. TV shows prompt 1 of 8 (divisive, dumb, fast: "Cereal is soup: yes/no"). 8-second timer.
2. Each **phone privately** shows two buttons, then a result strip: four name chips, green if that player answered the same as you, red if not. Nothing else. Raw answers are never shown to anyone, ever.
3. Exactly one player is the **Out of Phase** player; one other is their **Victim**. In the Out of Phase player's strip only, the Victim's chip is always inverted. Everyone else — including the Victim — sees the truth.
4. The **host screen** shows only the prompt, the timer, and a bare count of how many have answered. It never shows answers or matches. All comparison happens by talking.
5. After prompt 8: three minutes of open discussion. People trade totals ("I matched Sam 6 of 8"), find the one pair whose totals disagree, then have to decide which endpoint is broken — which is only resolvable by drilling into a single prompt and finding a third player who witnessed both ("prompt 5, you both said yes, and I matched you both").
6. Blind vote on every phone. Innocents score for naming the Out of Phase player. That player scores if the room convicts the Victim instead. TV then renders the true 5×5 matrix with the flipped edge glowing.

## Technical approach

PartyKit Durable Object per room; phones are a PWA over WebSocket; host tab is a read-only subscriber.

State: `{players[5], prompts[8], answers: Map<promptId, Map<playerId, 'A'|'B'>>, phaseId, victimId, stage}`.

Answers live only on the server. Every client read goes through one function, `stripFor(viewer, promptId)`, which computes matches and applies the flip when `viewer === phaseId && other === victimId`. There is deliberately no second code path to `answers` — the discipline is architectural, not conditional.

Hard part: **consistency of the lie across time**. Reconnects, the running-total view, and the end recap must all replay the same corrupted history. Solution: derive every view from `stripFor` on demand rather than caching client-side, and store the flip in room state at deal time so a rehydrated DO can't re-roll it. Second hard part: the reveal must show truth while the loser's memory insists otherwise — the recap animates their strip flipping back, per prompt, which is the whole payoff.

## v1 scope

- Exactly 5 players, one round, 8 hardcoded prompts, one flipped edge.
- Green/red chips only. No scores across rounds, no avatars.
- 8s answer timer, 3-minute discussion timer, one blind vote.
- Truth-matrix reveal on the TV.

## Out of scope

Multiple rounds, variable player counts, two corrupted edges, prompt packs, prompts that adapt to answers, rejoining mid-round, mobile-web audio.

## Risks & unknowns

- If a prompt is near-unanimous the flip is loud, and the Out of Phase player may self-identify by prompt 3. Mitigation: curate prompts that historically split rooms; measure split ratios in playtest.
- Players can physically show each other screens. Social contract only — but the strip is small and identical in layout, so a glance proves little.
- The triangulation step may be too hard cold. Fallback: TV surfaces a "remember prompt N" nudge at 60 seconds left.

## Done means

Five phones and a TV; across three playtests the room locates the disputed edge in at least two, and in at least one correctly identifies which endpoint is broken by citing a specific prompt and a third witness. Server logs confirm no client ever received another player's raw answer.
