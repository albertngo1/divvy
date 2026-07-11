## Overview
Retcon is a 3-5 player hidden-role party game for a shared host TV plus private phone controllers. Everyone studies what looks like the identical 4-panel wordless comic, then writes a one-line 'moral of the story.' One player (the imposter) unknowingly read a version where a single middle panel was swapped, bending the plot. The group reads the anonymized morals aloud and votes out the person whose story clearly happened in a different comic.

## Problem
Most hidden-role games make the imposter a knowing liar performing deception. That's exhausting and skill-gated. Retcon's itch: the imposter often doesn't KNOW they're the imposter — they answered honestly about a story that was subtly falsified under them. The fun is the dawning realization ('wait, why does everyone think he apologized?') and the imposter's genuine confusion.

## How it works
Host screen: a lobby, then a synced 'reading' countdown, then (later) the reveal — both comic versions side by side with the swapped panel highlighted.

Privately, each phone shows its OWN full 4-panel comic during a 45s reading window. Four phones show the canonical strip; one phone (assigned randomly, told nothing) shows a strip where panel 3 is replaced with an alternate image that flips causality or blame (e.g., canonical: a dog knocks over paint; imposter's: a child knocks over paint). Phones then hide the comic and each player privately types a single sentence: 'What's the moral?' or answers a leading prompt ('Who's to blame, and are they sorry?').

Host screen displays all answers anonymized, shuffled. Players discuss aloud and each privately taps a vote for the odd one out. Majority-outed correct = group wins; imposter survives = imposter wins. Reveal overlays both strips.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room {code, phase, players[]}, Player {id, role: 'canon'|'imposter', comicId, answer, voteFor}. Content: a comic pack = {panels[4 imgUrls], swapPanelIndex, altPanelImg}. Server picks one imposter at room start, streams the matching panel set to each phone; the imposter never receives the canonical panel 3, so client-side inspection can't reveal the trick.
Sync is turn-gated and low-frequency (phase transitions, answer submission, votes) — no real-time tick needed. Genuinely hard part: authoring swaps that are meaningful but not so blatant the imposter self-detects. Panel art must be near-identical in composition so the divergence is semantic, not visual.

## v1 scope
- 3 players, one round, one hardcoded comic + its swap.
- Free-text moral, anonymized display, single private vote.
- Host reveal overlays both strips.
- No accounts, no scoring across rounds.

## Out of scope
- Comic authoring tools, art pipeline, multiple swaps per strip.
- Persistent scores, matchmaking, spectators.

## Risks & unknowns
- Swap too obvious (imposter fakes) or too subtle (nobody diverges). Needs playtest tuning.
- Text answers can be gamed by vague morals; may need sharper leading prompts.
- Art cost per comic is real.

## Done means
Three phones join via code; one silently gets the swapped strip; all four write morals; host shows them anonymized; a private vote resolves; host reveals both comics with the swapped panel highlighted — and in playtests the imposter's moral is identifiably off at least 60% of the time.
