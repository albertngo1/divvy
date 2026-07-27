## Overview
Turnstile is a 4-player, four-tick game for a TV and four phones: a late-night subway station, five turnstiles, one last train. You score by getting through a gate *alone*. It's for groups who like table-talk games where lying is free and cheap.

## Problem
The minority game (El Farol) is the purest anti-coordination structure in game theory and also, as usually built, a dry spreadsheet. It needs two things to become a party: a physical consequence you can watch pile up, and asymmetric private views so the table-talk actually carries information worth lying about. Turnstile adds both — jams weld gates shut permanently, so the board visibly shrinks toward a forced disaster.

## How it works
Each tick is 20 seconds. Every player privately locks in one turnstile.

Phone (PRIVATE): your CARD — the 3 of 5 gates your fare card actually opens, dealt to overlap heavily; your INTEL — a live readout of one *named* other player's card, rotating each tick so you know whose secret you hold; and your own trip counter.

Host TV (SHARED): five gate columns, which gates jammed and are now welded shut, the growing crowd of stranded commuters at each dead gate, every player's trip total, and the countdown to the last train. Never anyone's card, never anyone's pending choice.

Resolution: exactly one body at a gate → through, +1 trip. Two or more → JAM: nobody through, and that gate closes permanently. Since cards overlap and gates keep dying, the legal option space collapses tick over tick until collisions are nearly unavoidable — the endgame is about who eats the jam. Talking is unrestricted; claiming "my card doesn't open 3" costs nothing and can't be checked. Win: 3 trips before the train leaves; ties broken by fewest jams caused.

One phone passed around is impossible here — simultaneous secret lock-ins plus per-player intel *are* the game.

## Technical approach
PartyKit / Durable Object as the authoritative room. Model: `Room {code, tick, gates[5]{open}, players[]{id, name, card:Set<gateId>, trips, intelTarget}}`. Phones send `{tick, choice}`; the server rejects any gate outside your card or already welded, and — critically — never broadcasts a choice before the tick barrier closes. Phones render a local countdown reconciled against a server timestamp; a missing submit auto-picks randomly from your legal set and says so publicly.

The hard part isn't throughput, it's **information hygiene and deal generation**. Resolution must animate frame-aligned on the TV and all four phones from an already-decided server result. And the deal needs a small constraint solver with rejection sampling: every gate must appear in ≥2 cards, no player may hold a privately uncontested gate, and the position must remain winnable after two welds.

## v1 scope
- Exactly 4 players, exactly 4 ticks, 5 gates
- Hardcoded intel rotation (each tick, you see the next player clockwise)
- No reconnect, no accounts, no lobby chat
- TV shows gates, welds, crowd sprites, trip counts, timer — nothing else
- Text-and-rectangles art; the crowd is one repeated sprite

## Out of scope
Variable player counts, multiple games in a session, richer intel types, score history, spectator view, mobile push, reconnection.

## Risks & unknowns
It may solve to "just talk honestly" among friends who don't want to betray each other; 20-second ticks may drag; welds could produce an unwinnable board despite the solver; four players may be too few for real crowd dynamics.

## Done means
Four players complete a full four-tick game in under five minutes; at least one jam in a real playtest is caused by two players acting on conflicting intel rather than by random collision; and inspection of the WebSocket traffic confirms no client can observe another's choice before the tick resolves.
