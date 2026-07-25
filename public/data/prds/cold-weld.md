## Overview
A 3–5 player real-time panic game. TV shows a failing reactor; every player holds a phone displaying an **identical** control panel. The room must cover each pulse's demanded controls — but any two people who hit the *same* control at the same instant get **cold-welded**: from that moment their two phones behave as one operator, and each loses half its panel. For groups who like Spaceteam-shaped chaos but are bored of unison being the win condition.

## Problem
Every phones-as-controllers party game rewards getting on the same wavelength. None of them make sameness the disease. And collision-punishing games (traffic, ALOHA, buzzer races) reset after each mistake — failure has no memory, so nobody's play changes. Cold Weld makes each collision permanently mutate *what your controller is*. The punishment is loss of agency, not loss of points.

## How it works
**Host screen (public):** a reactor with a demand strip. Every ~8s a PULSE appears — e.g. `VENT: ▲ ✚ ✹` — three distinct glyphs that must each be pressed by *someone* inside a 1.2s window. No assignments are given. Also public: the weld graph and everyone's name.

**Phone (private):** the same 6-glyph grid for everyone, plus a **private LOAD table** — for you specifically, two glyphs are cheap and two run HOT. Pressing a HOT glyph adds to your own private heat gauge; max heat and you're out. Because load tables differ, everyone silently wants the same cheap glyphs, and the fastest way to fill a pulse is exactly the way to collide.

**The weld:** two presses of the same glyph within 250ms (server-normalized) weld those two players. Afterwards: (a) a press from either only counts if their partner presses the *same* glyph within 400ms, and (b) each of the two phones has half its panel blacked out — **different halves** — so neither can reach every glyph alone. They have to describe their remaining buttons to each other out loud, mid-pulse, while everyone else screams.

A welded pair counts as one presser. Once 4 players become 3 effective operators, a 3-glyph pulse is barely fillable; at 2, the reactor scrams and everyone loses. Staying *apart* is the actual game.

## Technical approach
PartyKit / Cloudflare Durable Object room. State: `players[]{id,name,loadTable,heat,panelMask}`, `pulse{glyphs,deadline}`, `welds` (union-find). Phones send `press{glyph,clientTs}`; the server stamps arrival and subtracts a per-connection RTT estimate (rolling median of 1Hz pings) to get an estimated true press time.

The hard part is **fair collision detection at 250ms**, which is inside phone-WiFi jitter. The server buffers presses in a 300ms adjudication window, sorts by normalized time, then resolves — and clamps each connection's RTT correction so a chronically laggy phone isn't systematically welded. Second hard part: weld state rewrites each phone's rendered panel per-connection, mid-pulse, without a reload — every client gets a filtered view, never the room state.

## v1 scope
- 3 players, one machine, one game of 5 pulses
- 6 glyphs, hardcoded load tables
- Welds are pairs only; no chains, no unwelding
- Win = survive 5 pulses; lose = scram. No scores, no rounds, no lobby beyond a 4-letter code

## Out of scope
Unwelding minigames, weld chains of 3+, heat-venting mechanics, multiple machines, spectator view, audio.

## Risks & unknowns
250ms may be too tight to feel fair — needs a tuning dial. Welding may feel purely punishing rather than funny; the half-panel talk-to-your-partner beat is what should make it comedy, and if it doesn't land the whole thing is a chore. Panel-half split must never leave a pair unable to reach a demanded glyph.

## Done means
Three phones on one WiFi. A deliberate simultaneous double-press produces a weld inside 500ms on all four screens; the two welded phones each render a *different* half-panel; and the pair can only satisfy the next pulse by pressing the same glyph together within 400ms.
