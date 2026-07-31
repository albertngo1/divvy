## Overview

An 8-minute prediction market for 3–6 people played over a public ambient livestream — a bird feeder, a harbor cam, a Tokyo train platform. One binary contract, one price, and one rule that makes it a party game instead of a spreadsheet: **you can only trade while the stream is paused, and pausing it is something the whole room sees you do.**

## Problem

Ambient livestreams are the purest passive consumption there is. Meanwhile, every prediction-market party toy lets you trade continuously, so players stare at a ticker instead of the thing. Coupling the order window to a halt inverts that: attention becomes the resource you spend, and the interruption is the tell.

## How it works

**Host screen:** the livestream fullscreen, a 0–100 price band for one contract ("A BIRD LANDS ON THE FEEDER BEFORE 8:00"), a running tape of past prints, and a HALTED overlay.

**Halts:** any phone may call one (2 tokens each, 4 chips a pop). The stream pauses, a 20-second sealed order window opens, and the TV announces HALT #2 — never who called it.

**Orders:** during the window each phone privately enters a signed quantity — buy YES or buy NO, up to a cap. Orders are simultaneous and secret. All fill at the *pre-halt* price, then an LMSR updates the price from net flow and prints it to the tape. The tape therefore tells the room exactly how much it disagreed with the last price, and nothing about who.

**Privately on each phone:** your position and average cost, your remaining halt tokens, and a **Rider** — a personal side bet with a different shape than everyone else's: *+8 if a halt is called in the first two minutes* / *+8 if the price ever touches 80* / *+8 if you finish flat* / *+10 if there are fewer than three halts all game*. Riders are why someone halts at an insane moment, and why the room can never quite read the tape.

**Settle:** at 8:00 the host taps YES or NO. Shares pay 100/0, riders settle, chips rank.

## Technical approach

Cloudflare Durable Object per room owning the clock and phase machine: RUNNING → HALT_OPEN(20s) → FILL → RUNNING → SETTLE. LMSR with b=30: `p = e^(qy/b) / (e^(qy/b)+e^(qn/b))`, giving a smooth price and bounded loss without an order book. State: `{contract, qYes, qNo, tape[], haltCount, players:{id, chips, qYes, qNo, cost, haltTokens, rider}}`. Public broadcast: price, tape, halt count, phase, server clock. Never broadcast: positions, riders, or the contents of an open order window.

The hard part is not the market — sealed orders are just server-side buffering. It's pausing a *live* stream in lockstep across a TV and N phones when HLS sits 5–20 s behind the live edge. v1 punts honestly: only the host embeds the video (YouTube IFrame API `pauseVideo`/`playVideo`, seek to live edge on resume); phones show no video at all. The lost seconds during a halt are reframed as the cost of trading — you paid to stop watching, and you missed whatever happened.

## v1 scope

- One room, 4 players, one host tab
- One hardcoded stream URL, one hardcoded contract, one 8-minute window
- 2 halt tokens each, 4 rider cards total, fixed order-size cap
- Host taps the outcome; scoreboard; end
- No reconnect, no order cancel, no second round

## Out of scope

Order books or limit orders, multiple simultaneous contracts, computer-vision auto-resolution, streamer chat ingestion, cross-room leaderboards, phone-side video.

## Risks & unknowns

If nothing happens on the stream the contract is dead — picking contracts with a genuine ~50% base rate over 8 minutes is the real authoring work, and it may not generalize across cams. LMSR is opaque to non-finance friends, so the UI must only ever say "price went 42 → 61" and "you own 12 YES at 42." Live-edge seeking may fight the pause on some streams. Host adjudication of an ambiguous outcome will start an argument (possibly good).

## Done means

Four phones, a bird cam, and one round that produces: at least one halt called purely to satisfy a private rider, a tape the room confidently misreads, and a settled scoreboard — all within ten minutes of someone typing the room code.
