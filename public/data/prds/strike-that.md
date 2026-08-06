## Overview
Strike That is a 4–6 player concurrent-room game about a plan that keeps getting revised. Each phone privately receives a stream of ephemeral text messages; the group then has to fill in one shared booking form by talking it out. Exactly one player's feed dropped a retraction and gained a fabricated one, so they defend a superseded plan with total confidence — and because every message self-destructed, nobody can prove anything.

## Problem
The "one player's copy was altered" genre almost always alters a *static* stimulus you studied once. That makes the odd player out detectable by careful recall. Nobody has built the version where the divergence is **temporal** — the imposter isn't wrong about a detail, they're right about an *earlier version of the truth* — and where everyone's memory is genuinely, symmetrically unreliable, so being wrong is not evidence.

## How it works
Setup: the TV shows a group chat from "Dana" with every bubble blurred to unreadable — you can see bubble count, length, and timestamps, but no text. A ticker reads AMENDMENTS: 0/6.

Delivery phase (~70s): each phone PRIVATELY renders one bubble at a time in the clear for 4 seconds, then blurs it permanently. Messages arrive on the same schedule for everyone and the TV's blurred bubbles light up in sync, so counting is useless as a tell. Messages are a mix of setup facts and amendments: "8pm at Rina's" … "scratch that, 9" … "bring cash, they're card-only, ignore that".

One player's feed is tampered with in exactly two places: amendment #4 never arrives (they still hold the pre-retraction value), and a phantom bubble is inserted in its slot so their bubble count and TV sync stay correct.

Discussion phase (~2 min): the TV shows a blank booking form — TIME / PLACE / HEADCOUNT / BRING. Talking is unrestricted. Each phone privately submits its own filled form; nobody sees anyone else's until lock-in.

Reveal: the TV lays all forms side by side. Everyone privately votes for the tampered phone. Room scores for a correct majority; the tampered player scores if they survive the vote. Genuine misremembering by innocents is common and is the whole alibi engine.

## Technical approach
Host tab + phone PWAs + Socket.IO over Tailscale Serve (or a PartyKit DO). State: `{ script: [{t, id, text, isAmendment, field, value}], tamperedId, tamperSlot, forms: {playerId: {time, place, headcount, bring}}, votes }`. The server holds the wall-clock schedule and emits `bubble` events per socket; the tampered socket receives a substituted payload at `tamperSlot`. Clients never hold the future script — a leaked script is a total loss.

Ephemerality is enforced server-side-ish: the client blurs at T+4s via CSS filter and the text is dropped from state, but a screenshot defeats it. v1 accepts that (it's a living-room game) and adds one deterrent: the 4s window is short enough that screenshotting costs you the *next* message.

Hard part: schedule fairness. If one phone lags 800ms, its owner reads bubble 3 while others discuss bubble 4, which mimics tampering. Mitigation: server timestamps every event, clients render on a common `startAt + offset` clock with a measured RTT offset, and any phone whose measured drift exceeds 250ms gets flagged and the round voids.

## v1 scope
- One scripted chat, 6 bubbles, 2 amendments, one tampered feed
- 4 players, one round, hardcoded script in a JSON file
- Four-field form, side-by-side reveal, one vote, text scoring

## Out of scope
Generated scripts, LLM-written chats, multiple rounds, audio, screenshot prevention, spectators.

## Risks & unknowns
The cognitive load may be too high — if everyone is wrong about everything, the tampered player is camouflaged into invisibility and the vote is noise. Tuning knob: bubble dwell time (4s → 6s) and amendment count (2 → 1).

## Done means
Four phones join; the tampered phone's network log shows a substituted bubble at the right slot; every phone blurs on the same second (drift < 250ms measured); a real group plays one round, the reveal produces at least one "no, she DEFINITELY said nine" argument, and the vote lands better than chance across three plays.
