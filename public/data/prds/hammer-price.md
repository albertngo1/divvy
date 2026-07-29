## Overview
Hammer Price is a 3–5 player sealed-bid auction in which the bid is a physical blow. Each player grips their phone in a fist and drives it down into their own open palm (or a cushion on their knee) on a shared beat. The phone's accelerometer records the impact envelope, and that number — normalized to that player's own maximum — is the bid. For groups who like auction and bluffing games but are tired of typing numbers into a form.

## Problem
Sealed-bid games are mathematically delicious and physically dead: you type a number, everyone reveals, someone does arithmetic. All the tells are gone. Physical party games, conversely, almost never carry real hidden information — they're just reflex or volume. Hammer Price puts the bid inside a gesture. Your arm is public; your number is private; the gap between the two is the entire game. A giant wind-up that lands soft is a legal, gorgeous lie.

## How it works
One lot is on the block. The host TV counts 3–2–1–NOW. On NOW, everyone punches simultaneously.

PRIVATE, per phone: your live calibration meter during warm-up; after the beat, only YOUR normalized bid (0–100) and whether you busted. One randomly chosen player is the Consignor and privately holds the hidden reserve R (a number 40–90 on the shared normalized scale). Nobody else ever learns R until reveal.

SHARED, on the TV: the countdown, then an anonymized ladder — four unlabeled bars, sorted, no names — then the reveal. Any bid strictly above R busts (over-slam voids it). The highest non-busting bid wins the lot. The Consignor scores on how close the winning bid lands under R, so they are motivated to punch a decoy bid and to perform misleading body language.

The only public channel is your visible arm motion. Everyone watches everyone wind up. Because the impact is into flesh, it is quiet and unattributable by ear — the room gets choreography, not data.

## Technical approach
Host browser tab + phone PWAs + one authoritative Durable Object per room (PartyKit-style) over WSS via Tailscale Serve.

Data model: `Room { phase, players[{id,name,gainCal,maxG}], beatAtServerMs, reserve, bids{playerId:{norm, tOffsetMs, envelope[16]}} }`.

Sync: the server picks a beat timestamp ~3s out; each phone estimates its clock offset with NTP-style WS ping/pong (median of 8 round trips). Phones sample `devicemotion` at ~60Hz into a 2s ring buffer, then submit the peak plus a 16-bin downsampled energy envelope for the window [T−250ms, T+250ms]. The server validates the window and rejects envelopes that look like sustained shaking rather than a single impulse.

The genuinely hard part is not sync — it's that IMUs clip at ±2g/±4g/±8g/±16g depending on device, so an honest hard punch saturates a cheap phone and not a flagship. Fix: a 3-punch warm-up per player; the server fits each player's personal max and every bid is expressed as a percentage of your own ceiling. That is both fairer and funnier — brute strength buys nothing, so it's pure nerve.

## v1 scope
- 3–4 players, ONE lot, ONE beat, one round
- 3-punch personal calibration, then straight into the auction
- Random Consignor, random reserve 40–90
- TV: countdown, anonymized bar ladder, reveal
- Bust rule + single winner line. That's it.

## Out of scope
Multi-lot economies, currency, avatars, reconnection, spectators, mic cross-checking of impacts, leaderboards, sound design.

## Risks & unknowns
iOS gates `DeviceMotionEvent.requestPermission()` behind HTTPS and a user gesture, and caps sampling near 60Hz — a 5ms impact spike may be undersampled, which is why we score envelope energy rather than a single raw peak. Safety: people must punch into a palm or cushion, never a table; the UI enforces this in the warm-up copy. Cheating by tapping the phone on a hard edge is possible; envelope validation catches the obvious cases, not all.

## Done means
Four phones, one beat: all four impulses land inside the validated window, the TV shows an anonymized ladder, the bust rule voids at least one over-punch correctly, and in playtest at least one player successfully sells a huge fake wind-up that lands under 30.
