## Overview

A parimutuel betting round played over a single short internet video on the shared TV. Four players, ten chips each, three possible endings, two betting windows. For a group that watches things together and narrates predictions at each other anyway.

## Problem

Group video-watching is the purest passive consumption: one screen, four spectators, zero stakes, and the only interaction is somebody saying "watch, he's gonna drop it." Sports betting apps solved this for sports and nobody solved it for a cooking clip. The interesting part isn't predicting the ending — it's that in a real betting market, *the odds themselves are a broadcast of what other people secretly know.*

## How it works

Host plays a 90-second clip and freezes it one beat before the payoff. The TV shows three labelled outcomes (A/B/C).

Before the clip, each phone privately received one **Scrap** — a different, true, individually insufficient piece of evidence:
- a still frame from 2 seconds before the end, cropped
- the video's actual title
- the top YouTube comment
- how much runtime remains after the freeze

No scrap resolves the question. Every scrap eliminates something.

**Window 1 (12s, board dark):** phones privately allocate chips across A/B/C. The TV shows only a count of chips committed, not where. Window-1 chips carry a **1.5× stake multiplier**.

**Window 2 (12s, board live):** the tote board goes up on the TV — pool share per outcome, animating as money moves. Now you can read the room's private knowledge off the drift. Remaining chips can be placed. But payout is **parimutuel**: the winning outcome's backers split the whole pool proportional to weighted stake, so joining the favourite pays almost nothing — and one chip thrown at a wrong outcome manufactures fake steam for everyone else to chase.

Host unfreezes. Pool splits. TV replays the board's movement second by second next to who actually did it.

## Technical approach

PartyKit Durable Object per room. Data model: `Room {clipId, phase, closeAtEpochMs, pools:{A,B,C}, players:{id, chipsLeft, stakes:{A,B,C}, scrapId}}`.

Only the host tab plays media; phones render no video, which sidesteps stream sync entirely. Clocks are server-epoch based: the server publishes `closeAtEpochMs`, clients render their own countdown, and the server alone decides the close — with a 300ms freeze before the bell so a laggy phone isn't robbed by RTT.

The genuinely hard part is leak discipline. Per-player stakes must never leave the server; clients receive only `pools`, and each client receives only its own `stakes`. Any naive `broadcastRoomState()` hands the whole game away. The board is diffed at ~10Hz so movement reads as continuous drift rather than jumps, since drift *is* the signal.

## v1 scope

- One hardcoded clip, three outcomes, four hardcoded Scraps.
- 4 players, 10 chips each, two 12-second windows.
- Parimutuel settle with a 1.5× early multiplier.
- One reveal screen: correct outcome, each player's hidden allocation, payout.

## Out of scope

A clip library, user-submitted videos, in-clip live markets, more than one round, cash-out/hedging, spectator betting, any ML on the video.

## Risks & unknowns

Content authoring is the real cost — every clip needs three plausible outcomes and four hand-written scraps, which does not scale past a demo. Twelve seconds may be too short to allocate chips on a phone. If one scrap is decisive, the round collapses; scraps must be tested for insufficiency.

## Done means

Four phones each show a different Scrap, allocate chips blind in window 1, watch a live tote board move in window 2, and settle correctly — verified by inspecting the socket frames to confirm no client ever received another player's stakes, and by a scripted last-100ms bet landing on the correct side of the server's bell.
