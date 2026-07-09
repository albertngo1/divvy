## Overview
House Special is a 3–8 player party game that hijacks the most passive group ritual there is — squinting at a delivery menu deciding what to order — and turns it into a private prediction market. The host screen is the menu; every phone is a hidden betting slip. It's for friends about to actually order food together, or anyone who wants the menu-scroll to have stakes.

## Problem
Group ordering is dead time: someone reads dishes aloud, everyone waffles, the loudest voice wins. The menu is *consumed* passively and forgotten. There's latent social knowledge in that moment — who always gets the fried thing, who's secretly vegetarian tonight, who caves to peer pressure — and nothing rewards noticing it.

## How it works
The host loads a menu (a preset demo menu in v1). The **shared screen** shows the full menu, a countdown, and later the live tally. Each **phone privately** shows the same menu with a betting interface: you get, say, 10 chips to stake across dishes you predict will make the table's FINAL real order — you're betting on the group's collective behavior, not what you want. Higher chips on a dish = bigger payout if it lands, but you can also short ("nobody orders the calamari").

After a 90-second private betting window (slips locked, hidden from all), the table does the real thing out loud: negotiates and commits an actual order via the host (any player taps dishes in; group confirms). The host reveals every slip simultaneously. You score for each predicted dish that made the real order, scaled by chips staked and inversely by how many others also bet it (reading a *non-obvious* order pays more). The reveal is the fun: "you shorted the fries?! traitor."

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, one DO per room, or Socket.IO over Tailscale Serve). Data model: `Room { code, menu[], phase, players[] }`; `Player { id, name, chips, slip: {dishId: stake}, locked }`; `FinalOrder { dishIds[] }`. Sync: phones emit `stake` deltas the server ignores for broadcast (slips stay private) — only `locked` status is broadcast so the host can show "4/6 in." On phase change to REVEAL the server broadcasts all slips at once. Scoring is pure server-side. The genuinely hard part isn't real-time sync (it's turn-based-ish) — it's the trust boundary: slips must NEVER leak before reveal, so the server must never echo another player's stakes, and late joiners can't peek. Also, the "final order" input needs one authoritative editor to avoid two phones fighting over the cart.

## v1 scope
- One preset menu (~12 dishes), one round.
- 3–6 players, room code join, no accounts.
- Fixed 10 chips, no shorting (add later).
- Host-driven final-order entry + simultaneous slip reveal + score.

## Out of scope
- Real menu scraping / delivery-app integration.
- Shorting, multi-round bankroll, persistent stats.
- Actually placing the order anywhere.

## Risks & unknowns
- Does betting on *others'* choices beat just betting your own appetite? Needs the inverse-popularity payout to force reading the room.
- The real-order negotiation could drag; may need a hard timer.
- Fun may hinge on a real hungry group — cold playtests could feel flat.

## Done means
Six phones join a room, each privately stakes 10 chips on a shared menu with zero cross-leak before reveal, the group commits a final order on the host, all slips reveal simultaneously, and the server produces a correct popularity-weighted scoreboard.
