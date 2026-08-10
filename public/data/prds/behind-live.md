## Overview
Behind Live is a 3–5 player trading game for a room already watching something together. There is no shared picture: the TV is the exchange floor, and the show only exists on the phones — every one of them playing the same clip at a different, private delay. For groups that enjoy poker faces, shouting, and accusing each other of cheating.

## Problem
Every "bet on the clip" party game hands the whole room the same frame at the same instant, so the only possible edge is opinion. Real markets aren't won on opinion; they're won on being three seconds early. Meanwhile the actual social texture of group viewing — the gasp, the "oh no," the person laughing before you get there — is treated as ambience. Behind Live makes the gasp the tradeable asset.

## How it works
One 75-second clip. At start the server deals each phone a hidden offset: 0s, 4s, or 8s behind live. Your phone tells you *your own* lag ("you are 4.0s behind") and nothing about anyone else's.

Private, on your phone: your delayed video, your chip stack, your current position, and a one-tap offer pad.
Public, on the TV: no video at all — a live tape of every offer and fill (name, side, price, size, market-time stamp), the room's net position, and a clock.

There is one public binary prop ("Does he land it?"). You never bet against a house — you post offers. One tap posts *I'll take YES at 2:1 for 5 chips*. Offers hit the tape instantly and expire in 8 seconds; anyone may hit them, first come.

That's the trap. If you're at 0s and already saw the landing, your generous offer is free money — until the 8s player hears the room groan and stops filling you. Posting invites getting picked off; hitting stale prices is how the laggards eat; and every action is stamped on the tape, so after the clip people reconstruct who must have been early. Standing flat is not safe: a 1-chip seat fee bleeds every 10 seconds you hold no position.

## Technical approach
Host tab + phone PWAs + one authoritative Durable Object (PartyKit) per room. Model: `{ clipId, t0ServerMs, players: {id, name, offsetMs, chips, position}, offers: [{id, maker, side, odds, size, expiresAt}], tape: [] }`.

Sync: each phone runs 5 ping/pong rounds for an NTP-style clock offset (median), then computes `localPlayhead = serverNow − t0 − myOffsetMs` and seeks if drift exceeds 150 ms. The clip is a preloaded local MP4, so per-phone delay is just a seek — cheap.

The genuinely hard part isn't video, it's fair matching. A 0s player and an 8s player racing for the same offer must not be decided by Wi-Fi jitter. Matching runs server-side in 250 ms randomized batch windows — a speed bump, which is both correct and thematically perfect. Ties inside a window resolve by pro-rata split, not by arrival.

## v1 scope
- 3 players, one hardcoded 75s clip, offsets fixed at 0/4/8s
- One binary prop, written by hand
- Offers are one tap: fixed 5-chip size, three preset odds
- 8s expiry, chips settle once at clip end
- TV shows tape + clock only

## Out of scope
Multiple clips or rounds, user-supplied video, live sources, multi-prop books, partial fills, cash-out, persistence, spectators.

## Risks & unknowns
Mobile autoplay policies (mute all phone audio; the room's *voices* are the soundtrack). Four phones decoding video drains battery. The 8s player may feel purely farmed — mitigate with a bigger starting stack for the laggard. Physical cheating: people will show each other their screens, which is arguably fine and arguably the game.

## Done means
Three phones on one LAN show playheads verifiably 4s apart when held side by side; an early player's offer is filled by a lagging player and appears on the TV tape within 300 ms; the seat fee ticks; final chip counts sum exactly to the starting total.
