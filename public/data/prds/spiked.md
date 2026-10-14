## Overview
Spiked is a 3–6 player real-time party game played on a TV and phones. Each player runs a newsroom desk. The TV is the live front page. Each round, a desk wins by filing scoops nobody else files at the same time.

## Problem
Racing is fun, but racing games always reward the fastest person. A real scoop works differently: if two outlets break the same story in the same minute, neither one owns it. Spiked takes the gap between being first and being alone and turns it into a party game, where the panic of rushing to file is what gets you spiked.

## How it works
- **Tips.** There are 10 stories in the round. The server gives each desk a private stack of 5 tips, and each story is held by 1–4 desks. Your phone shows your tips as headlines, each with its own **freshness bar** that drains over 60–120s. A tip's value is highest when fresh and drops to 0 when the bar runs out.
- **Filing.** Tap a tip and then **FILE**. The server then holds the filing for **3 seconds**, the "copy desk window":
  - If no one else files that story in the window, the headline goes on the TV front page with your desk's name and you get its current value.
  - If another desk files the same story inside the window, both get **SPIKED**: a red stamp on the TV and −2 for each desk.
  - Filing after a story has run counts as a **follow-up** and earns 1 point.
- **Private noise.** Each tip shows a "wires are buzzing" meter, a noisy estimate of how many desks hold it (true count ± 1). Once in the round, a desk can **plant a rumor**: it boosts the buzz meter on one of its own tips for every other holder of that tip, which scares them away so you can file alone.
- **Talking** is legal. But saying "I'm filing the mayor story NOW" brings everyone who holds that tip in at once, and that's how you get spiked.

**Phone (private):** your 5 tips, their freshness bars and buzz meters, the FILE button, and the rumor charge. **TV (shared):** the front page as it fills in, SPIKED stamps, a ticker of follow-ups, and the round clock. The TV never shows who holds which tip.

## Technical approach
The room runs on one authoritative Durable Object. State is `{stories[10]: {holders[], value(t), status}, pending: {storyId: [{deskId, tServer}]}, scores}`. A filing opens or joins a pending window keyed by story. An alarm fires 3s after the first filing and resolves the window. The rule depends on server time only, so ties are decided on arrival at the server, not phone clocks. The hard part is fairness under network lag: a phone on bad Wi-Fi might arrive outside a window it should have been in. To soften that, each window has a 3s base plus 250ms of slack. Phones animate the "held at copy desk" state right away so the 3s feels intended rather than laggy.

## v1 scope (humiliatingly small)
- 1 round of 2 minutes with 4 desks and 10 stories
- Headlines are a fixed list of 30 silly ones
- Freshness, buzz meter, FILE, and the 3s window
- One rumor plant per desk
- Final front page plus a scoreboard

## Out of scope (for now)
Writing your own headlines, editors voting on importance, multiple rounds or editions, beats and specialties.

## Risks & unknowns
- Players might just hoard until a tip is almost stale. Freshness decay has to punish waiting.
- With 6 desks the overlap math could produce constant spikes, so the deal has to scale with player count.
- 3s might feel too long or too short. It needs playtesting.

## Done means
Four phones play a full 2-minute round. The server log shows at least 2 SPIKED collisions and at least 4 clean scoops. Repeating the same filing timestamps in a test produces the same results every time. At least 3 of 4 players say they held back a tip because they suspected someone else had it.
