## Overview
Ghost Note is a rhythm social-deduction game for 3-5 players spread around a room. Together you keep a repeating clap loop tight; one hidden 'Ghost' is trying to derail it. It's for groups who like Werewolf but want the tell to be *behavioral* — bad timing you can hear but can't quite pin.

## Problem
Social-deduction games rely on lying with words. The itch: build the deception out of an embodied, ambiguous signal — a dropped beat could be sabotage or just someone with no rhythm — using the mic as a per-player clap detector, and forcing players to physically spread so their mics don't all hear the same thing.

## How it works
The host TV shows a pulsing 4-beat loop at ~90 BPM and one shared 'GROOVE' meter — the aggregate tightness of the whole circle. It never shows individuals. **Privately, each phone shows only that player's beat map**: on your beats your phone flashes 'CLAP' and its mic listens for a loud transient within ±120ms. Hit your window, the loop stays tight; miss, the meter sags.

One player is secretly the **Ghost** — their private beat map is subtly shifted, so following their own phone faithfully still drags the groove down, and they can lean into it to sabotage. Because everyone claps at once, mics bleed; players must physically fan out to separate spots so each phone hears mainly its own clapper — the room's corners become the board. After four loops, the meter's history is revealed and everyone votes on the Ghost.

**Per-phone is load-bearing:** each device holds a *different secret pattern* and independently judges its own player's claps in real time. One shared phone can neither hide asymmetric maps nor listen to three separated clappers at once.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Shared clock broadcast from server; clients schedule flashes via WebAudio time. Data model: `Room { tempo, loopCount, players[{id, pattern, isGhost}], tightnessHistory }`. Each phone runs energy-based onset detection (windowed high-band RMS with a per-phone calibrated threshold) and emits `beatHit{playerId, beatIndex, onsetMs}`. Server scores |onsetMs − expected| into the aggregate meter and drives the TV. The hard part: onset detection robust to neighbors' claps (mitigated by physical spreading + local calibration during a 5-second 'clap to set your level' step) and a tempo clock that stays sub-100ms-aligned across phones.

## v1 scope
- 3 players, exactly one secret Ghost.
- One 4-beat loop, four repetitions, then one vote.
- Per-phone calibration step before the round.
- TV shows only the shared groove meter + final vote tally.

## Out of scope
Scoring/streaks, multiple Ghosts, polyrhythms, distinguishing clap vs stomp, mic anti-spoofing, replay of who missed which beat.

## Risks & unknowns
Cross-talk still fooling onset detection if players cluster; clock drift on cheap phones; the Ghost being *too* obvious (shift too large) or invisible (too small) — needs tuning; a genuinely arrhythmic innocent looking guilty (which is arguably the fun).

## Done means
Three spread-out phones each detect their own player's claps ≥8/10 within window, the shared groove meter visibly sags on the Ghost's loops, and after four loops the group can vote with the meter history shown — with the Ghost winning if unvoted.
