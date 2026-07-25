## Overview
A 4-player cooperative game about real-time bureaucracy. Everyone can see work that needs doing, everyone has hands on a control — but the machine rejects any action that wasn't verbally ordered by a superior, and the hierarchy is hidden and split across phones. Devils & the Details, restaged as an org chart you have to discover while it's on fire.

## Problem
Co-op party games make everyone equal and then the loudest person becomes the de facto captain. This game makes authority a *mechanical, hidden, unevenly-distributed resource* — so the room has to talk its way into a command structure instead of defaulting to whoever shouts. The itch: the funniest thing in a crisis is someone saying "I can't do that, you're not allowed to tell me to."

## How it works
Four players get secret clearance grades 1–4 (shuffled). Each phone privately shows:
1. **Your own grade** — and nothing about where it sits.
2. **One true relation about two OTHER players**: `RED outranks GREEN`.
3. **Your control panel** — three switches, one of which is currently needed.

The TV shows five open work orders, each naming a color and a control: `ORDER 3 — BLUE: close valve B (28s)`. Blue cannot just flip it. Someone who outranks Blue must *say it out loud* — "Blue, close valve B!" — and then a **two-sided handshake** fires: the orderer taps BLUE's badge on their own phone while Blue taps valve B. The server pairs the two intents inside a ~2.5s sliding window and checks `grade(orderer) > grade(actor)`. Match → order clears. Grade too low → `INSUBORDINATE` flashes on the TV with both names, and the room has learned something. No pairing → nothing happens, timer keeps burning.

Speech is load-bearing because the two taps must be near-simultaneous and Blue must know *which* order to act on — you cannot silently agree. Grade 1 can order nobody and discovers this publicly, becoming the round's bottleneck. When three orders fly at once, badge-taps cross-pair and chaos is genuine.

## Technical approach
Socket.IO server over Tailscale Serve, one room object. State: `{players: [{id, color, grade, knownRelation}], orders: [{id, actorColor, controlId, expiresAt, state}]}`. Each phone gets a filtered view: own grade, own relation, own controls, plus the public order list. Two message types — `ORDER {targetColor}` and `ACT {controlId}` — land in a per-player intent buffer with server-stamped receipt time (client timestamps ignored; server time is truth).

The hard part is the pairing resolver: an intent buffer swept every 100ms that matches ORDER→ACT pairs within 2500ms, resolves ambiguity (two people ordered Blue; Blue acted once) by preferring the *highest-grade* eligible orderer so the room isn't punished for redundancy, and expires unmatched intents so a stale tap can't retroactively authorize a later action.

## v1 scope
- Exactly 4 players, grades 1–4, one round
- 3 switches per phone, 5 sequential-ish work orders, 2-minute clock
- One relation fact per phone
- Binary outcome: all five orders cleared or not
- Host tab + 4 phones, LAN only

## Out of scope
Promotions/demotions, traitors, scoring, more than 4 players, voice capture or ASR, order chaining through middle management, art.

## Risks & unknowns
The hierarchy may be solved in 30 seconds and the rest becomes rote — mitigate by leaking only 4 of 6 relations. The double-tap handshake may feel fiddly rather than tense. Pairing window length is a pure playtest number. Ambiguous multi-orderer cases could feel arbitrary even with the highest-grade rule.

## Done means
Four phones plus a TV; each phone shows only its own grade, one relation, and its own controls; an ACT with no paired higher-grade ORDER inside 2.5s does nothing; an ACT paired with a *lower*-grade ORDER produces a visible INSUBORDINATE event naming both players; and one full playtest ends with all five orders cleared, with at least one insubordination logged along the way.
