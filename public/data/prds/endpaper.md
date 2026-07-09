## Overview
Endpaper is a 3–5 player concurrent-room game that produces one marbled-paper sheet — the kind on the inside cover of an old book — as a shared keepsake. Every player privately drips ink into a common pool on the host screen, then the group combs it into swirls once. Two wins coexist: the group keeps the poster, and each player secretly hopes their hidden signature motif goes unidentified in the final review.

## Problem
Collaborative art on one shared canvas turns into a turn-taking queue or a mess dominated by the boldest person. And there's no intimacy stake. Endpaper makes contribution simultaneous and private, and layers in a gentle anonymity game so the artifact carries a little secret.

## How it works
The host TV shows one rectangular ink bath, initially blank. Each phone PRIVATELY shows: a small assigned palette (2 colors nobody else has), a targeting reticle mapped to the bath, and a secret "motif card" — a tiny shape stamp (a comet, a fish, three dots) that is uniquely yours. In the DRIP phase, all phones simultaneously tap/drag to place drops and one motif stamp into the bath at coordinates they choose; drops land live on the host as expanding ink blooms — but your phone only shows YOUR reticle, never who dropped what. In the COMB phase, players take turns dragging one comb line across the host (or all drag simultaneously on a shared grid), which advects the ink into classic marbled swirls, distorting every motif so it's warped but still faintly present. The host renders the final sheet and pushes a PNG to every phone (the keepsake). Then a private REVEAL: each phone shows the finished sheet and asks you to tap where you think each OTHER player's motif ended up and guess whose it is. You win anonymity if your warped motif goes unnamed. No points tallied — just "kept" and "stayed hidden."

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Bath { grid: dyeField[W][H], drops[], combStrokes[] }`, `Player { id, palette, motifId, motifDropXY }`, `Guess { fromId, aboutId, guessedXY }`. The host runs the fluid sim; phones send only `DROP{x,y,color}` and `COMB{path}` events. Sync strategy: server is authoritative on event order and timestamps, rebroadcasts a compact dye-field delta (or just the event log the host replays) at ~15fps so all viewers see identical marbling. The genuinely hard part is a cheap, deterministic marbling advection that looks good and produces the SAME image on host and in the exported PNG — v1 uses a coarse grid dye-diffusion + a simple comb displacement field, deterministic from the seeded event log so any client can reproduce it.

## v1 scope
- 3 players, one bath, ~4 drops + 1 motif each, one comb pass.
- Fixed palettes and a fixed set of 3 motif stamps.
- Host renders one PNG; all phones download the identical image.
- Reveal is a single private "who made the comet?" guess per player.

## Out of scope
- Realistic Navier–Stokes fluid, custom colors, undo.
- Multiple sheets, saved gallery, scoring the anonymity round.
- Phone-side rendering of the full bath (host is the canvas).

## Risks & unknowns
- Marbling that looks convincing but stays deterministic across host + export is the core technical bet.
- Motifs may warp into unrecognizable smears (kills the anonymity game) or stay too obvious (kills the fun) — needs tuning of comb strength.
- Simultaneous dripping may feel chaotic without per-drop attribution feedback.

## Done means
Three phones drip privately into one shared bath, the group combs it once, an identical marbled PNG reaches all three phones, and each phone can privately submit a motif-attribution guess that the server scores as identified/anonymous.
