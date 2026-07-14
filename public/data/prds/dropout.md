## Overview
Dropout is a 3-6 player hidden-role party game where the shared 'reality' everyone reasons about is a short audio clip — and one player heard a subtly different edit of it. It's for groups who love the 'wait, we all heard that, right?' moment. The host TV is a lobby and a stage; the game happens in your ears and in the argument that follows.

## Problem
Most social-deduction games hand the imposter a *label* ('you are the spy') and ask them to act. The tension is performed. Dropout removes the performance: the imposter doesn't know they're the imposter. Their divergence is *organic* — they simply remember the scene honestly, and honesty is what betrays them. The itch is the paranoia that YOU might be the one who heard it wrong.

## How it works
Each round the server picks a ~20s narrative audio clip (a tiny scene: a voicemail, a diner, a heist briefing) with a few 'probe points' — a spoken number, a named person, a background sound. Every phone **privately streams the canonical mix through earbuds/speaker**. Exactly one phone is served a **variant**: one probe altered ("meet at four" → "meet at five", a barking dog removed, "Marcus" → "Marco").

The shared host screen shows only: who's connected, a countdown, and — after — the vote tally. It never shows the clip contents.

After listening, each **phone privately** asks the player to lock in short answers to 2-3 recall probes (this is a commitment device — you can't backpedal later). Then the table **talks openly** to reconstruct the scene. The imposter contradicts on their one altered detail, defends it as memory, and — not knowing they're flipped — starts accusing others of mishearing. Innocents must probe the right details to surface *whose* divergence is systematic vs. ordinary bad memory (red herrings are expected). Finally everyone votes on their phone. Innocents win by fingering the imposter; the imposter 'wins' by surviving. The host reveals locked-in answers only after the vote.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object per room; Socket.IO over Tailscale Serve for the homelab). Data model: `Room{code, phase, clipId}`, `Player{id, role, variantProbe?}`, `Answers{playerId, probe→value}`, `Votes{voterId→targetId}`. Audio is pre-rendered: canonical + one variant per probe, shipped as small MP3s so no live DSP is needed. Sync strategy: server assigns roles, pushes each phone a signed clip URL (imposter gets the variant), and gates phase transitions (listen → lock → discuss → vote). **Genuinely hard part:** near-simultaneous private playback so no one hears a neighbor's phone leak the canonical version a beat before/after theirs — solved with a server 'play at T+2s' scheduled start and a mandatory-earbuds nudge; and authoring probes subtle enough to resist instant blurting yet decisive on the vote.

## v1 scope
- One hand-authored clip with 3 probes and 3 pre-rendered variants
- 3-4 players, one round, one imposter
- Earbud-only; phone-speaker fallback flagged as 'leaky'
- Lock-in answers + open discussion + single vote + reveal

## Out of scope
- Multiple clips / rounds / scoring across games
- Procedural audio generation or TTS
- 'Imposter aware' variant (told something's off, must self-diagnose)
- Spectators, reconnection polish

## Risks & unknowns
- Audio bleed between phones ruins asymmetry (mitigate: earbuds + staggered start)
- Altered detail too obvious (instant out) or too obscure (never surfaces)
- Non-imposter misremembering muddies the signal — could be feature or bug

## Done means
Three phones in a room; each plays its assigned mix on a synced start; one phone provably receives a variant; the table discusses, votes on-phone, and the host reveals both the imposter and everyone's locked answers — with at least one authored clip where playtesters can't reliably out the imposter in under a minute.
