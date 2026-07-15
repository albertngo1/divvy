## Overview
Blackball is a 3-5 player elimination-draft deduction game. Instead of picking things to keep, everyone spends the game secretly *killing* tiles off a shared board, while each phone privately guards a hidden agenda about which tiles it needs alive at the end. It's the tense "ban phase" of a draft — the part experienced players love — made into the whole game.

## Problem
Draft ban phases (MOBA pick/bans, keeper-league vetoes) are the most strategic moment in drafting, but they're miserable in person: hidden agendas require a notekeeper, simultaneous secret bans need a trusted moderator, and reading who wants what devolves into staring contests. The delicious asymmetry — I'm protecting something and you don't know what — collapses the moment anyone has to say a pick out loud.

## How it works
The host TV shows 8 tiles (movie titles, snacks, vacation spots — any themed set). Each phone privately receives an agenda: a couple of tiles to PROTECT and a couple to DESTROY, dealt so agendas overlap and conflict across players. Each round, every phone *secretly* taps one surviving tile to burn. On simultaneous reveal, the single most-burned tile is removed (ties broken by a pre-seeded random). Repeat for 4 rounds until 4 tiles survive. Then agendas score against the survivors, agendas are revealed on TV, and players get one guess each at who was protecting what for a bonus.

Private per phone: your agenda card and your secret burn each round. Shared on TV: the tile board, which tile died each round and its vote count (but *not* who burned it), and the final survivors + scores. The core read: the vote spread each round leaks agendas, so sometimes you throw a burn at a decoy to hide what you're guarding, or refuse to pile onto the obvious kill so you don't out yourself.

## Technical approach
Authoritative WebSocket room (PartyKit / Durable Object or Socket.IO over Tailscale Serve) holds `{tiles:[{id,alive}], agendas:{playerId:{protect,destroy}}, round, burns:{playerId:tileId}}`. Phones POST a burn; the server buffers all burns behind a barrier and only broadcasts the aggregate (which tile died, the count) — never the per-player mapping. Agendas are sent once, privately, to each phone at deal time. The genuinely hard part is leak-proofing: no reveal event may ever carry who-burned-what or another player's agenda, and the simultaneous-reveal barrier must handle a slow/absent phone (auto-burn a random alive tile on timeout) without stalling the round.

## v1 scope
- 3-4 players, one device each, one board of 8 tiles, exactly 4 burn rounds.
- One fixed themed tile set, auto-dealt agendas, plurality-kill resolution.
- End-of-game agenda reveal + one guess phase.

## Out of scope
- 5+ players, custom tile sets, multi-round matches, weighted or multi-burn actions.
- Reconnection, chat, spectators, sound.

## Risks & unknowns
- With 4 players and 8 tiles the deduction may be thin; agenda overlap must be tuned so conflicts are guaranteed.
- Plurality-kill can feel swingy on ties; the seeded tiebreak must feel fair and visible.
- Agendas need to be scorable yet not trivially satisfiable by round two.

## Done means
Four phones each hold a private agenda, secretly burn one tile for four rounds, the correct plurality tile dies each round with no screen ever showing who burned it, survivors score against hidden agendas, and the final reveal correctly attributes each agenda for the guessing bonus.
