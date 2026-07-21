## Overview
Wind-Up steals the *boss telegraph* from character-action roguelikes (Hades, Furi, Souls). 3–5 players co-op against a single boss on the shared TV. The genre's whole tension is reading the wind-up before the blow lands — Wind-Up shatters that read across phones so no one player can do it alone.

## Problem
Boss telegraphs are the best 2 seconds in action games, but solo. Party games rarely capture real-time *reaction under shared pressure*. And most "co-op" party games are actually turn-based deduction wearing a co-op coat. This wants genuine simultaneous panic.

## How it works
The boss on the TV begins a wind-up over ~5 seconds; a charge bar fills. Each attack is defined by three attributes: **ZONE** (left / center / right), **TIMING** (which beat it lands on), and **COUNTER** (the one stance that survives: DODGE, BLOCK, or JUMP).

Crucially, the tell is split. Each phone **privately** receives exactly one fragment — Player A sees "aiming LEFT," Player B sees "lands on the 3rd beat," Player C sees "only BLOCK survives." No phone holds the full attack. Players must **shout their fragments** to reconstruct it out loud.

In the final 2-second **commit window**, every phone's stance pad (DODGE / BLOCK / JUMP) unlocks and each player must tap simultaneously. The server resolves per player: correct stance → you dodge and the boss takes a chunk; wrong → you take damage to the **shared party HP bar**. The TV shows only the boss, the party HP, and the charge bar — never the fragments. Kill the boss across a few wind-ups before party HP hits zero.

Per-phone is load-bearing twice over: the tell is *split* (one passed phone would reveal every fragment, killing the reconstruction), and the commit is *simultaneous* (you can't hand a phone around a 2-second window).

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Room state machine: `IDLE → WINDUP → COMMIT → RESOLVE → (loop)`. On WINDUP the server generates an attack def and deals each socket its private fragment. COMMIT opens a server-timestamped 2s window; phones run a reconciled countdown and send `{stance}`; server accepts by receive-time with a small grace buffer.

Data model: `Room{bossHp, partyHp, phase, phaseEndsAt}`, `Attack{zone, timing, counter, fragments:{playerId→fragment}}`, `Player{id, lastStance}`. Sync: server broadcasts phase transitions + `phaseEndsAt`; fragments go only to their owner's socket. Hard part: the sub-second synchronized commit under variable phone latency — solve with server-authoritative timing, client clock-offset estimation on join, and resolution by server receive-time rather than client-claimed time.

## v1 scope
- 1 boss, exactly 3 wind-ups to win
- 3 players, fixed fragment types (one player per attribute)
- 3 stances, 3 zones
- TV: boss art, party HP, charge bar
- Phone: your fragment + a stance pad that unlocks only in the commit window

## Out of scope
- Multiple bosses, phases, movement, combos
- Uneven fragment counts, more than 5 players
- Scoring/leaderboards beyond win/wipe

## Risks & unknowns
- Is 2 seconds enough to commit after reconstructing? Tune window length.
- Latency fairness on bad Wi-Fi during the commit window.
- Reconstruction may collapse if players don't talk — needs a loud, prompting UI.

## Done means
3 phones join, the boss winds up, each phone shows a different fragment, players talk, all three commit stances inside one server-timed window, the server resolves damage correctly, and the boss dies or the party wipes — one full round end-to-end.
