## Overview

**Never Lift** is a 90-second, 3-player game that produces exactly one thing: a single unbroken line drawing, downloadable as SVG and PNG. No scoring, no rounds, no reveal of who drew what. It's for people who want a fridge-worthy object out of a party rather than a leaderboard.

## Problem

Exquisite-corpse games chop the artifact into visibly authored chunks — the seams are precisely where authorship lives, and whoever draws best carries the picture. Turn-taking also turns it into a performance with three spectators. The thing a group actually wants to keep is something none of them could have made and none of them can claim.

## How it works

The TV shows a black canvas and a prompt (v1 fixed: *"a house with someone in the window"*). A pen goes down at t=0 and **never lifts for 90 seconds**.

The server holds a hidden schedule of randomized 3–8 second slices assigning the pen to one player at a time, in non-obvious order. Each phone is a full-screen **relative trackpad** — deltas, not absolute positions, so the pen's location is global and shared. When you hold the pen your pad glows warm; otherwise it's dead but still tracking. No countdown, no advance warning, no "you're next." The TV shows only the growing line — never a cursor color, never a name.

Handoffs use a **600ms crossfade**: pen velocity is a weighted blend of the outgoing and incoming players' finger deltas, so a transition is a smooth curve rather than a corner. This is why dead phones keep streaming frames — the incoming player is faded in from their *actual current motion*, and constant traffic from everyone means socket activity leaks nothing.

Privately, each phone also holds one **secret inclusion** — *a hat*, *a chimney*, *a dog's tail* — it must smuggle into the picture while blind-steering a pen it can't see except by glancing at the TV like everyone else. Afterward, the host shuffles and shows the three secrets and the room guesses aloud which made it in. Nothing is scored and authorship is never revealed.

## Technical approach

PartyKit / Durable Object per room. Phones push 30Hz input frames; the server keeps only the pen-holder's (plus the crossfade partner's), integrates into one polyline, and broadcasts point batches to the TV at 20Hz.

The hard part is latency without client-side prediction: **no phone renders the canvas**, so nothing can be predicted locally — you steer with ~80ms of lag, which is genuinely part of the charm but makes server tick discipline non-negotiable. The crossfade must be computed on a fixed 33ms tick so both contributing clients' frames land in the same bucket; otherwise the blend weights desync and the seam reappears as a visible kink. Light velocity capping and smoothing keep the line reading as confident rather than palsied.

## v1 scope

- Exactly 3 players, 90 seconds, one fixed prompt
- Single stroke, black on white, fixed stroke width
- 6-item secret-inclusion deck
- SVG + PNG download to every phone

## Out of scope

Color, undo, pressure/width variation, multiple strokes, a gallery, >4 players, any scoring or authorship reveal.

## Risks & unknowns

It may simply look like scribble — damping and speed caps help, but only playtesting tells us whether three blind hands make a readable house. Unknown whether hidden handoff survives a small room (people yelp when the pad lights up), and unknown whether 600ms is enough to hide a stylistic switch from someone who's looking for it.

## Done means

Three phones and a TV; 90 seconds produces one polyline with **zero pen-up events**; in a blind test a naive observer cannot correctly locate the handoff points above chance; SVG downloads successfully on all three phones.
