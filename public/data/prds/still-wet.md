## Overview
Still Wet is a 3–5 player, scoreless consensus toy for the end of a party, when arguing is fun and competing isn't. One image lives on the TV. Each phone owns exactly one parameter of it and is never told what that parameter does. The room talks the picture into a shape it collectively wants to keep, then lifts hands together. The frozen frame — stamped with the date and everyone's name — is the whole prize.

## Problem
Generative-art toys are single-player: one person drives, everyone else watches over a shoulder. Meanwhile every party game insists on producing a winner, when what a room actually wants at 1am is one thing they made together that they can still look at on Thursday. Still Wet makes the artifact the win condition and makes the group physically necessary to reach it.

## How it works
The host renders one parametric image (a flow-field / reaction-diffusion hybrid) from N coupled parameters, continuously, at 60fps. Everyone sees it.

Each phone shows privately:
- **one unlabeled vertical slider** — your parameter, no name, no number
- a **ghost**: a small still render of what the *whole* image would look like if you alone pushed to your extreme and everyone else held still
- a **LIFT** toggle

The ghost is the engine of the game. You privately see a possible future nobody else can see, and the only way to lobby for it is to describe it out loud — badly, in words, while the picture keeps moving. And because the parameters are multiplicatively coupled, your axis means something different depending on where everyone else is sitting: your ghost mutates as they move, so your pitch goes stale mid-sentence and you have to re-see it.

When all N phones hold LIFT simultaneously for two seconds, the canvas freezes. That exact frame is the artifact: titled, dated, credited to all players, downloadable from each phone by QR. If anyone drops LIFT, it flows again. No timer, no score, no rounds. You leave with a picture or you don't.

## Technical approach
Host tab renders in WebGL and is authoritative. Phone PWAs send slider floats at 20Hz over PartyKit; the host smooths with a critically-damped spring so a laggy phone reads as slow, not jumpy. State: `Room{params: float[N], lifted: bool[N], liftSince, frozenFrame}`. LIFT is evaluated server-side against a 2s all-true window so nobody can fake it locally.

The hard part is the ghosts: each is a *different* render of the same scene, so the host draws N extra offscreen passes. Budget them at 128×128, 4fps, round-robin (one ghost per frame at N≤5), encode to WebP, and push per-socket. Naïvely rendering N full previews every tick is the perf cliff that kills the whole thing on a laptop.

## v1 scope
- 3 phones, 3 coupled parameters, one shader
- One session, no lobby beyond a 4-letter room code
- Ghosts at 128px / 4fps
- Freeze → PNG → QR download

## Out of scope
Parameter reassignment, multiple shaders, undo, a gallery, saving to a server, spectators, sound.

## Risks & unknowns
Biggest risk: it's a lava lamp, not a game — if every state looks equally fine, nobody argues and LIFT happens in 20 seconds. Mitigate by tuning the shader so most of the parameter space is genuinely ugly. Second: ghost latency making the private future feel like a lie. Third: one dominant person just narrating everyone into agreement.

## Done means
Three people on three phones, cold, reach a frozen frame in 3–8 minutes without instructions beyond "the picture isn't dry yet," and at least one of them sets it as a phone wallpaper the same night.
