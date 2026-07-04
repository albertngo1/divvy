## Overview
Hot Mic is a cooperative concurrent-room game about a single shared voice. At any instant exactly one phone is 'hot' — that player must be making sound (talking, humming, continuing a story) — while every other phone must be provably silent. The group's job: keep an unbroken 60-second broadcast alive by passing the hot mic around, with no collisions and no dead air. For 3–5 players who want a real-time coordination game rather than turn-based prompts.

## Problem
Storytelling and relay party games have no *stakes on silence* — people talk over each other and it doesn't matter. The itch here is the enforced discipline: the thrill of holding the only live mic, the panic of shutting up the instant you pass it, and the shared failure when two people blurt at once.

## How it works
Host screen (TV) shows one giant **ON AIR** indicator naming the current live player, a continuity bar that stays green while sound is present and flashes red on **dead air**, a **collision** strobe when a muted phone makes noise, the timer, and the final uptime score. It reveals who's live but not who's about to receive.

Each phone PRIVATELY shows one of two states: **'YOU'RE HOT — KEEP TALKING'** with a live level meter, or **'MUTED — STAY SILENT.'** The hot phone also shows a **PASS** button (choose a target or default to next in the ring). Passing is silent and instant. The instant you tap, your phone flips to MUTED and you must go quiet; the target's phone lights up hot.

All phones stream mic RMS continuously. Server rule: the hot phone's level must stay above threshold (else dead air); every muted phone's level must stay near ambient (else collision, attributed to that phone).

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room {code, hotPlayerId, continuity, collisions, timer}`, `Player {id, name, isHot}`. Phones stream RMS every ~150ms. Server is the single source of truth for `hotPlayerId`. **Genuinely hard part:** the handoff window — a pass must not be misread as a collision (old speaker's tail overlapping new speaker) or dead air (silent gap during transition). Needs a ~400ms grace window around every pass and sub-100ms token propagation so the live light never lies.

## v1 scope
- 1 cooperative round, 4 players in a fixed ring
- 60-second broadcast, tap-to-pass to next player
- Green/red continuity bar + collision strobe
- Score = % uptime minus collision penalties
- One shared success/fail screen

## Out of scope
- Free-target passing (ring only for v1)
- Story prompts / themed content
- Speaker verification (loudness only, not identity)

## Risks & unknowns
- Grace-window tuning: too long hides real collisions, too short punishes clean passes
- Phones hearing the hot speaker across the room → false collisions on muted phones
- Whether 'must keep talking' stays fun or gets stressful

## Done means
Four phones, one 60s round: the ON AIR light always names exactly one live player, a clean tap-pass never triggers a false collision in playtest, two people talking at once reliably flashes a collision, and the group sees a truthful uptime score at the end.
