## Overview
A tense, physical stealth-crossing game for 3–5 players in one room. The host TV is a stylized searchlight sweeping an abstract map; each phone is a private 'freeze/go' watch tuned to *that player's* zone. It's Red-Light-Green-Light where nobody shares a light.

## Problem
Classic freeze games have one global caller, so everyone reacts identically and the tension is shallow. The itch: what if the light that could catch *you* is on a schedule only your phone knows, so you can never just copy the room?

## How it works
Players line up against one wall; a target spot sits at the opposite wall. The host TV shows a beam sweeping lanes on a fixed loop. Each player is assigned a lane, and each lane's beam-overhead windows differ. **Privately, each phone shows only:** a big GO / FREEZE face plus a 2-second countdown to your next freeze — derived from your lane's schedule, not the global picture. **The shared TV shows:** the sweeping beam, anonymized 'caught' flashes, and who has reached the far wall. During your FREEZE window, the phone reads the accelerometer (RMS of gravity-removed acceleration + step spikes); movement above threshold while frozen = an anonymous buzz on the TV and you're sent back a step. Because schedules are staggered, players surge and stall out of sync — you must self-time and avoid bunching into a lane that's about to light. First to the wall (or co-op: all cross before the loop count runs out) wins.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. **Data model:** room `{loopMs, lanes[], phase, tick}`; player `{id, lane, schedule[], crossed, strikes}`. The server owns the master clock and broadcasts `tick` at ~20Hz; each phone computes its own GO/FREEZE locally from `schedule` + `tick` so the display is latency-tolerant. Phones sample `devicemotion` at 30–60Hz, compute a short-window RMS, and send a boolean `moving` flag (debounced) only during their freeze windows; the server, not the phone, adjudicates strikes so a cheater can't hide motion. **Genuinely hard part:** motion thresholds vary wildly by phone and by how people hold devices — needs a 3s calibration ('stand still') per phone to set a personal noise floor, plus hysteresis so a hand tremor isn't a strike.

## v1 scope
- 3 players, 3 lanes, one crossing, one 90s loop.
- Fixed hand-authored schedules (no difficulty tuning).
- Accelerometer RMS + per-phone stillness calibration.
- Anonymized caught-flash on TV; simple 'reached wall' detection via a manual tap when you touch it.

## Out of scope
- Auto-detecting real position (no indoor positioning); crossing is honor + tap.
- Difficulty curves, multiple rounds, scoring leagues.
- Camera or audio.

## Risks & unknowns
- Motion-threshold reliability across devices (mitigated by calibration + hysteresis).
- Players gaming 'freeze' by setting the phone down — v1 accepts it; later require phone-in-hand via slow gravity drift.
- Fun depends on schedules interleaving; needs playtest tuning.

## Done means
Three phones show independent, staggered FREEZE/GO timers from one host clock; moving during your private freeze reliably triggers an anonymous strike within 300ms; a player tapping the far wall registers a win on the TV.
