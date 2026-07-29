## Overview

A 3–4 player concurrent drawing game for a living room with a TV and phones. Everyone simultaneously draws a cattle brand on their own phone. A frontier brand registry — the shared TV — accepts a brand only if it is not confusable with any other brand on the wall, where "confusable" uses the real rule brand inspectors use: rotations and reflections count as the same mark. A Lazy S is an S on its side. A Flying S has wings. They're different brands. Turn one into the other by accident and you both get rejected.

## Problem

Drawing party games reward the same instinct in everyone — the obvious icon, the fastest recognizable shape. Everyone draws the sun. Nobody notices the convergence because nobody is penalized for it. This game makes the convergence the entire game and puts it on a live meter.

## How it works

Each phone privately shows: (a) a **required element** it must include — "one closed loop," "exactly one crossbar," "a hook at one end" — drawn from a small set deliberately seeded so two players get elements that pull toward the same shape; (b) a **stroke budget** (4–6 strokes, private, unequal); (c) a blank canvas.

The TV shows the registry wall: all brands rendering live, side by side, as ink. Under each brand is a **conflict halo** — amber when that brand is drifting close to *some other* brand under dihedral comparison, red at the rejection threshold. The halo never names the other party. So you know you must swerve, you don't know which direction is safe, and swerving can steer you into a third brand nobody warned you about.

At 60 seconds the round locks. Any pair over threshold is rejected — both brands, no partial credit. Surviving brands score by stroke economy. Talking aloud is allowed and mostly useless: "mine's a circle" describes half the room.

## Technical approach

Host tab + phone PWAs + one Cloudflare Durable Object per room. Phones send stroke polylines as deltas at 10Hz. Server holds authoritative state: `players[id] = {strokes[], requiredElement, budget}`.

The hard part is the confusability check at interactive rates. Server rasterizes each brand to a 64×64 bitmap, dilates 1px for stroke tolerance, then for each pair evaluates max IoU across the 8 dihedral transforms with a ±3px translation search — cheap enough at 5Hz for 6 pairs in a Worker, but the *threshold* is the real problem. Too tight and the game is random; too loose and everyone passes. Halo state needs hysteresis (enter amber at 0.45, exit at 0.38) or it strobes and reads as broken.

## v1 scope

- 3 players, one 60-second round, no lobby beyond a 4-letter room code
- 4 hardcoded required-elements, hand-tuned to collide
- Conflict halo: amber/red only, no names
- Scoring: survived / rejected, plus stroke count

## Out of scope

Multi-round, brand vocabulary (Rocking/Tumbling modifiers), rustler role who alters others' brands, persistence, spectators.

## Risks & unknowns

Threshold calibration is the whole game and can only be tuned by playtesting. Small phone canvases may make fine divergence feel imprecise. If the halo is too informative, the tension collapses into a solved gradient-descent.

## Done means

Three phones draw simultaneously; the TV shows three live brands with independent halos; two players who converge on the same rotated shape both get REJECTED at lock, and each says "I could see it happening and couldn't tell who."
