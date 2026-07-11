## Overview
Cardinal is a silent-signaling party game for 4-6 players on a shared TV plus private phone controllers. Players are secretly split into pairs; each pair must converge on a shared compass heading (point at the same wall) without speaking, while keeping clear of the other pair's chosen direction. It's cooperative-per-pair with a deduction layer riding on top.

## Problem
Every compass party game so far is a *solo* act — claim an empty sector, converge on a group consensus. Nobody has used heading as a **private channel between two secret partners** who have to find each other in plain sight. And there's an unscratched itch for a body-language signaling game where the way you turn your body IS the message — and the tell.

## How it works
Everyone calibrates by facing the TV, which zeroes their heading. The server secretly pairs players (4 = two pairs; an odd player becomes a Spotter). Each phone PRIVATELY shows: your partner's name, a big live heading dial, and two lights — "in sync" (your heading within ~20° of your partner's *live* heading) and "clear" (no rival pair within the separation buffer). The goal: both partners rotate to point at the SAME wall/heading, while the two pairs keep their headings ≥60° apart; hold everything green for 3s to win together. Talking is banned, so you signal your partner by exaggerated body-pointing — but that also tells the Spotter and the rival pair who you are, so subtlety is rewarded. The host TV shows only anonymous "sync 1/2" bars, a separation warning, and a countdown — never headings or identities. After the round the Spotter names the pairs for bonus points.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Phones read `deviceorientationabsolute` / `webkitCompassHeading` at ~15Hz, subtract their TV-calibration offset, and stream relative heading. Data model: `Room{players[], pairs[[a,b]], phase}`; `Player{id, heading, offset, partnerId}`. The server computes each pair's circular heading difference and the inter-pair separation, and broadcasts only boolean lights to phones plus aggregate bars to the host. Genuinely hard part: magnetometer offset and drift vary per device and indoor metal (the TV itself) warps readings — mitigated by relative-to-TV zeroing, generous tolerance, a re-zero button, and careful 0/360 wrap-around math on all circular diffs.

## v1 scope
- 4 players, exactly two pairs (no Spotter — host auto-reveals pairs at the end)
- One round, 20° sync tolerance, 60° separation, 3s hold
- Silent play; TV-facing calibration; per-phone offset

## Out of scope
- Spotter deduction scoring, 6+ players, multiple rounds
- Anti-spoofing on headings, decoy/fake-partner roles

## Risks & unknowns
- Indoor compass warping near the TV/metal; players clumping so pointing is ambiguous
- Both pairs may pick nearby walls and violate separation, forcing silent renegotiation (intended friction, could frustrate)
- Balancing "signal clearly enough for your partner" vs "stay subtle for the Spotter"

## Done means
Four phones calibrate to the TV, two hidden pairs form, and when both pairs simultaneously hold matched-and-separated headings for 3s the host flips to WIN — verified by a handheld compass confirming each pair truly faces a shared wall ≥60° from the other pair.
