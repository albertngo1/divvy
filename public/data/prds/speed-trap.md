## Overview

A 3–4 player ultrasonic drag race across the living room, where the finish line is the TV and every racer is under a *different, private* speed limit. Two minutes to teach, best played by adults willing to look ridiculous walking at 0.4 m/s in front of their friends.

## Problem

Every motion party game is about shaking *harder* or *faster*. Nobody has built one about **velocity control**, even though a phone can measure your walking speed with no GPS and no camera — just a tone and a microphone. And room-scale games all measure *where you are*; measuring *how fast you're going* is a funnier constraint, because human open-loop speed control is terrible and every overcorrection is visible to the whole room.

## How it works

The host tab plays a continuous 18 kHz sine out of the TV speakers. Each phone runs an FFT on its own mic and tracks the peak near 18k. Walking toward the TV shifts it up, away shifts it down: Δf ≈ f·v/c, so 0.5 m/s ≈ 26 Hz — comfortably resolvable.

**Private on your phone:** your secret speed band ("hold 0.30–0.60 m/s toward the screen"), a live speedometer needle, and your own strike count. **Public on the TV:** four anonymous horses on a track showing distance covered only, plus a siren flash whenever *somebody* speeds — never who.

One 60-second round. Start at the back wall, walk to the TV. Every 500 ms your phone reports radial velocity. In band → progress accrues. Over band → strike, progress frozen 3 s. Under band → nothing accrues, so standing still can't cheese it. First to the screen wins. Because the bands differ, someone striding past you may be perfectly legal or one step from a ticket — and the optimal play is to walk provocatively fast to bait a rival into overspeeding.

## Technical approach

Host browser tab + phone PWAs + PartyKit Durable Object (or Socket.IO over Tailscale Serve) as authority. Phones push `{playerId, radialV, confidence}` at 4 Hz; the server owns bands, integrates progress, adjudicates strikes, and broadcasts anonymized track state at 10 Hz. All DSP is on-device — raw audio never leaves the phone.

Model: `Room{code, phase, toneHz, tStart}`, `Player{id, band{min,max,sign}, progress, strikes, lastV, conf}`.

The hard part is not sync — 4 Hz scalars are trivial. It's the DSP. Mic AGC pumps the carrier, the direct-path tone sits as a huge fixed spike beside the tiny body-reflected sidebands, and arm swing injects ±0.5 m/s of noise on a handheld phone. Mitigations: 4096-pt FFT @48 kHz (11.7 Hz bins) with parabolic peak interpolation to ~1 Hz, 3-sample median filter, notch-out of the static carrier bin, and a hard rule that the phone is held flat against your chest.

## v1 scope

- 3 players, one 60-second round, one room, one lap toward the TV.
- Three hardcoded bands: slow / medium / brisk.
- Host screen: three anonymous progress bars + a speeding siren flash.
- Phone: speedometer needle, band as a green arc, strike counter.
- 5-second calibration: stand still, capture the resting carrier bin.

## Out of scope

Multi-lap, reverse legs, teams, per-phone speaker emission, obstacle layouts, score history, non-Chrome-Android/iOS-Safari fallbacks.

## Risks & unknowns

Many phone mics roll off hard above 16 kHz — may need to drop to 17 kHz and accept audibility for some ears/dogs. Reflections off walls create velocity ghosts. Multiple phones in one room is fine (single shared emitter), but a second running instance nearby is not. Sub-0.15 m/s is below the noise floor; the bands must stay above it.

## Done means

Three phones join via room code; each shows a different private band; three people walk toward a TV; a phone that exceeds its band flashes a ticket and freezes progress within 700 ms; a phone in-band advances its bar; one bar reaches 100% and the TV names a winner — with no player having seen another's band.
