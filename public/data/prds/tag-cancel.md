## Overview
A co-op fighting-game combo relay for 3 players. The shared TV shows one training-mode stage with a dummy opponent and a giant combo counter. Each player privately owns a different slice of a tag-team character's movelist and must execute their link in sequence — nobody can finish a combo alone. It's for people who love the *feel* of a big Marvel-vs-Capcom combo string but have never had the execution to land one solo.

## Problem
Combo videos look incredible; actually inputting a 40-hit string is a wall almost no casual player clears. The itch: let a room *collectively* land the sickest combo they've ever seen by splitting the execution burden, so the hard part becomes verbal timing and trust rather than solo dexterity.

## How it works
One character is assembled from three roles: **Launcher** (opens the combo), **Juggler** (keeps the dummy airborne), **Ender** (the finisher). Each role lives on exactly one phone.

- **Privately, each phone shows:** its own 1–3 move buttons, a live "you're up" cue, and a shrinking **link ring** — a circle collapsing over ~500ms marking the cancel window in which you must tap. Miss it and the combo drops. Your ring only appears when the previous player's hit connects, so you're reacting to *them*, not a clock.
- **The shared TV shows:** the avatar, the dummy, the running hit counter, damage total, and a scaling meter. When the Launcher connects, the TV animates the launch and the Juggler's phone lights up; the group is effectively shouting "NOW — up! — now ender!" in real time.

A round is a fixed route (Launcher → Juggler ×2 → Ender). Hit the target hit-count before three drops and you win. The fun is the panicked verbal handoff — "wait for the bounce… GO."

## Technical approach
- **Server:** authoritative WebSocket room (PartyKit / Durable Object) holding `{comboState, currentSlot, windowOpenAt, hitCount, drops}`.
- **Data model:** `players[]` each with `role`, `moves[]`, `linkWindowMs`. Combo is a scripted node list; each node names the slot and its window.
- **Sync strategy:** server opens a link window (broadcasts `windowOpenAt` + duration), the owning phone sends a `tap` with client timestamp, server validates against its own clock (not the phone's) to prevent latency cheese. Valid → advance node + animate TV; invalid/expired → drop.
- **Genuinely hard part:** fairness of the timing window under variable phone latency. Solve by measuring each client's RTT at join and padding its window by half-RTT, so a laggy phone isn't unfairly punished, while keeping the window tight enough to feel like a real cancel.

## v1 scope
- Exactly 3 players, fixed roles, one character, one combo route.
- One dummy, no defense/AI, no health — just hit-count vs. target.
- One round; win/lose screen; no scoring beyond drops-used.

## Out of scope
- Player-vs-player, blocking, mixups, multiple characters.
- Branching combos, meter spending, tag assists beyond the fixed 3.
- Matchmaking, persistence, mobile input beyond taps.

## Risks & unknowns
- Windows may feel unfair on flaky Wi-Fi despite RTT padding.
- Reaction-to-neighbor may be too hard or too easy — window length needs playtest tuning.
- Could devolve into one person calling every cue; roles must feel individually load-bearing.

## Done means
3 phones join, the TV shows a dummy, and a group can land a target 12-hit combo by relaying three link windows across three phones — with a mistimed tap visibly dropping the counter.
