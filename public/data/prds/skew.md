## Overview
Skew is a 4–5 player real-time hidden-role game. The room cooperatively steers a dot across a grid to an exit by tapping direction pads on their phones — but one player, whose grid is secretly rotated 90°, keeps dragging it off course without knowing why. For groups who want a frantic, physical deduction round instead of a talky one.

## Problem
Hidden-role games are almost always turn-based and verbal. The itch: a saboteur who isn't lying with words but with sincere, WRONG inputs — and a town that must read intent from noisy collective motion rather than testimony.

## How it works
The host shows a 5x5 grid with a dot and an exit. Each "tick" (~3s) every phone shows a D-pad and privately taps ONE direction; the server sums the vote vectors, snaps to the nearest cardinal, and moves the dot one cell. Most players see the grid in true orientation. The Skew sees the SAME grid rotated 90° on their phone, so their sincere "toward the exit" taps push perpendicular. Only the NET movement is shown — never individual taps. Over ~10 ticks the dot's persistent sideways drift betrays a disoriented player. If the dot reaches the exit, town wins the navigation; then everyone votes who was skewed. Town wins fully by also fingering the Skew.

Private per phone: your D-pad AND your grid's orientation. Shared: the dot, the exit, net movement, the tick timer.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room {code, grid, dotPos, exitPos, players[], skewId, rotation, tick, votesThisTick{}, ballot{}}. Each tick the server opens a vote window, collects one vote per phone, resolves at close, and broadcasts the new dotPos to host + all phones — each phone rendering it in its OWN orientation. The Skew's client applies a +90° transform to both what it renders and its outgoing vote labels, so it never learns it's rotated; payloads are identical in shape. Hard part: real-time fairness — the tick window must feel simultaneous, late votes must resolve deterministically, and aggregate-only resolution must hide individuals while still leaking a statistical signal.

## v1 scope
- 4 players, 1 Skew, one 5x5 grid, fixed +90° rotation.
- ~10 ticks, 3s each, vector-sum → cardinal resolution.
- One navigation attempt, then one vote + reveal.
- Tailscale Serve LAN; room-code join.

## Out of scope
- Walls/obstacles, multiple exits, multiple Skews.
- Variable rotation (180°/mirror), difficulty scaling.
- Score persistence, reconnect handling.

## Risks & unknowns
- Does one rotated voter in 4 move the net enough to be visible, or does sum-resolution drown it? Core tuning risk — may need vote weighting or fewer players.
- 3s ticks may feel slow or chaotic; needs a feel-first prototype.
- The Skew might infer rotation from the mismatch between their taps and the observed motion.

## Done means
4 phones join; the dot moves each tick by the summed private votes; one phone silently renders a rotated grid; the host shows only net motion; the group reaches (or misses) the exit and then votes out the Skew — with no payload revealing the rotation.
