## Overview

A cooperative three-player round for a TV plus three phones. Wavelength's psychic sees the target and everyone else guesses. Here there is no psychic: the target is a thin sliver on a 0–100 spectrum, and each of the three phones privately shows a *wide arc* that contains it. The sliver is exactly the three-way intersection. No single player can see the answer, and no player can be silent.

## Problem

Wavelength's asymmetry is one-to-many: one person knows, the rest triangulate off a single clue. That makes it a clue-writing skill test with a passive table. The itch is a version where knowledge is genuinely *distributed* — where your own partial view is honest, useful, and insufficient, and the group's answer emerges from three honest-but-vague clues instead of one clever one.

## How it works

**Host screen (shared):** the spectrum bar with its two poles ("BARELY A SPORT ↔ DEFINITELY A SPORT"), a phase label, and later the three clues attributed by player color. It never shows any arc.

**Each phone (private):** the same bar with *your* arc shaded — say 38–73 — and a text field for one clue of ≤3 words: a thing that sits inside your band. "Competitive darts." Submit.

The TV reveals all three clues at once. Now every phone shows its own arc plus a draggable marker. Each player privately places a marker where they believe the sliver is — constrained to their own arc, because they know that much for free — and locks. The TV shows only a lock counter.

Reveal: the three arcs animate in, their overlap glows, and the three markers drop. Score is markers-inside-the-sliver, 0–3, with a bonus at 3.

The privacy is the game. Your arc tells you where the answer *isn't*; the other two clues tell you which end of your arc to abandon. Simultaneous locked placement is what stops the loudest person in the room from dragging one shared dial.

## Technical approach

PartyKit Durable Object per room; host tab + phone PWAs on WebSockets. Generation: pick sliver `[t, t+12]`, then arcs `[t − aᵢ, t + 12 + bᵢ]` with `min(aᵢ) = 0` and `min(bᵢ) = 0` across the three, so the intersection is exactly the sliver. Constraint: each arc ≥ 2.5× sliver width, so no player is handed the answer alone.

State: `{ spectrum, sliver, arcs: Record<pid,[lo,hi]>, clues, markers, phase }`. `sliver` and other players' `arcs`/`markers` are stripped server-side per-connection.

Sync is turn-based and easy; the genuinely hard part is leak prevention. Clue text must never stream per-keystroke. Markers must be held server-side and broadcast only on the third lock — a naive "broadcast marker position live" makes the last locker unbeatable. Late joins and reconnects must re-derive the redacted view, not replay full state.

## v1 scope

- Exactly 3 players, one spectrum, one round
- 20 hardcoded spectrum pairs
- QR join, no accounts, no timer
- Score printed on the TV, then stop

## Out of scope

Multi-round, teams, custom spectrums, a spectator dial, reconnect, score history.

## Risks & unknowns

If arcs are too wide, clues degrade into noise and the round is a shrug — width tuning is the whole balance problem. Players can verbally cheat ("mine's on the left"), which needs a stated rule, not code. Three-player-only is restrictive.

## Done means

Three phones join by QR, each sees a different arc, one round completes through clue → clue reveal → private lock → animated overlap reveal with a 0–3 score, and a unit test asserts over 1000 generated rounds that the three-arc intersection equals the sliver exactly and no arc is narrower than 2.5× it.
