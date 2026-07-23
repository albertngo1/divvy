## Overview
A social-deduction navigation game for 4 (1 Navigator + 3 travelers). One player's phone is the map; the other three are blind pieces on it — and one of them is lying. For groups who want Werewolf-style paranoia grafted onto a real spatial task.

## Problem
Blind-escort co-op is warm but toothless once solved. The itch: give the blindness a *cover story*. If honest players constantly misstep because they can't see, a saboteur can hide willful drift inside plausible fumbling — deniability that only exists *because* the pieces are truly blind and moving at once.

## How it works
- **Navigator's phone (PRIVATE map):** a 5×5 grid with a start, a green EXIT, a red EXIT, and a live dot per traveler. The Navigator may talk freely: "Blue, left; Red, forward." They see positions but **not roles**.
- **Each traveler's phone (PRIVATE):** a 4-way D-pad, a private role card, and no map. Two are **Loyal** (goal: reach the GREEN exit). One is the **Stray** (secret goal: land the convoy on the RED exit *or* survive the vote unaccused). They feel only their own wall-bumps.
- **Beat:** every 3s all three travelers step **simultaneously**; server resolves moves and collisions. Loyalists genuinely mis-hear and overshoot — that noise is the Stray's camouflage.
- **Host TV (SHARED):** a fog title + beat during play; at round end it animates the full path and lights whichever exit was reached.
- **Endgame:** when the convoy reaches an exit or time runs out, Navigator + travelers vote on the Stray. **Scoring:** Loyalists win only if GREEN reached AND Stray voted out; Stray wins on RED reached OR going unaccused.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). **Data model:** `Room{grid, exits, beat, phase}`, `Traveler{id,color,pos,role,lastBump}` (role never leaves the server except to its owner). **Sync:** server assigns roles at start (one Stray, seeded), runs the beat tick, resolves simultaneous queued moves with collision blocking, broadcasts each traveler only their private state, the full board to the Navigator, and nothing to the TV until reveal. Vote is a separate phase with tallied ballots. **Genuinely hard part:** not sync but *tuning* — grid size, beat rate, and bump frequency must make honest error common enough that the Stray has cover, yet not so chaotic the Navigator can never distinguish signal from noise. That balance is the whole game and only playtest finds it.

## v1 scope
- Exactly 4 players: 1 Navigator, 3 travelers (1 Stray).
- One 5×5 grid, one green + one red exit, one 2-minute round.
- One vote, binary scoring, TV path replay.

## Out of scope
- Multiple Strays, multi-round series, role rotation.
- Obstacles, items, fog-of-war radii for pieces.
- Text/emote back-channels between travelers.

## Risks & unknowns
- If the Navigator can simply see the Stray drifting toward red, deniability collapses — bump/blindness noise must be dialed high enough.
- One Stray among three may be too easy to guess; may need a swappable red-herring twist.
- Vote can feel arbitrary if the path replay gives it all away.

## Done means
Four phones join, a blind convoy walks (and mis-walks) toward an exit while one Stray nudges it astray, the group votes, and testers report the Stray's sabotage was genuinely hard to separate from honest blind fumbling.
