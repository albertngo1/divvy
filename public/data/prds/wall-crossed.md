## Overview
Wall Crossed turns a two-minute video clip — the thing a group would otherwise slouch through — into an information market with one insider in it. Four people, four phones, one TV. Everyone stakes private chips on a prop about the clip. One player has secretly been "crossed the wall": their phone showed them one true fact about what happens. They have to profit without their money screaming.

For groups who already watch things together and narrate over them. The game is not "guess the outcome" — it's "read the order flow."

## Problem
Watching something together is passive and unequal: one person is invested, everyone else is on their phone. Existing watch-along games ask trivia questions, which is just a quiz with a screensaver. Nobody is playing against anybody. And every social-deduction game leaks through *talk* — this one leaks only through *money*.

## How it works
1. Four phones join a room code on the TV. Everyone is seeded 100 chips.
2. The server privately deals one INSIDER card to one random phone: a single true statement about the clip ("nobody ever gets in the car"). The other three phones read "YOU ARE CLEAN." Nobody knows the insider exists as a person, only that one does.
3. The TV plays the clip and opens one market: *"PROP: the dog appears before the phone rings."* 45-second window, running while the clip plays.
4. **Privately on each phone:** pick YES or NO, drag a stake 0–40, tap COMMIT. Once committed you cannot change it.
5. **On the TV only:** a live money bar — percentage of committed chips on YES vs NO, a "3 of 4 committed" counter, and a ticker of *when* the bar last jumped. No names, no amounts. A big confident stake visibly slams the bar, and everyone sees it happen without knowing whose it was.
6. Payout is parimutuel: losers' chips split among winners pro-rata. This is the elegant part — the insider's edge is self-capping, because betting huge both exposes them and dilutes their own payout.
7. Reveal: the TV replays "the tape" — every stake as A/B/C/D with timestamps. Then each phone **privately** names who was crossed. Correct namers take 25 chips off the insider; miss as a group and the insider keeps it all.

## Technical approach
PartyKit Durable Object per room (or Socket.IO behind Tailscale Serve). State: `{players[], insiderId, spoilerText, market:{propId, outcome, closesAtVideoMs}, bets: Map<pid,{side,stake,serverTMs}>}`.

The host tab owns the `<video>` and heartbeats `currentTime` every 250ms; the server gates market close on **video position**, not wall clock, so a buffer stall or a pause doesn't silently close the book. Bets are server-timestamped on receipt. Privacy is enforced at the serialization boundary: the broadcast payload literally contains only `{yesPct, noPct, committedCount, lastMoveTMs}` — no client ever receives another player's stake until the reveal frame.

The genuinely hard part isn't sync, it's **anonymity leakage by subtraction**. With few players, the second and third commits nearly de-anonymize the first. Mitigations: quantize the bar to 10% buckets, seed a fixed 20-chip house position on each side, and hard-require four players.

## v1 scope
- Exactly 4 players, no spectators, no rejoin
- One locally-hosted 100-second clip, one hand-authored prop, hard-coded outcome timestamp
- One betting window, parimutuel settlement, one accusation vote
- Host screen is: video, money bar, tape, result. That's all four views.

## Out of scope
Multiple rounds or props, a clip library, YouTube embedding, chat, avatars, cross-round standings, an insider with more than one fact, mobile video playback.

## Risks & unknowns
- De-anonymization at small player counts (the core risk above)
- A spoiler that is *too* decisive makes the insider's play obvious; the fact may need to be probabilistic rather than certain
- Props that everyone reads the same way produce a 95/5 bar and no game — prop authoring is the real content cost
- Herding: the bar itself may cause everyone to pile onto one side

## Done means
Four phones in one room, one clip, one prop. The TV bar visibly jumps when a big stake lands. Devtools on a non-insider phone shows no other player's stake in any received frame before reveal. Parimutuel payouts sum correctly, the accusation vote resolves, and during a live playtest at least one person says out loud "someone just dumped on NO."
