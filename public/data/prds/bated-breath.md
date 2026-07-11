## Overview
Bated Breath is a 3–6 player nonverbal standoff for a room that thinks it can keep quiet. The shared host screen (TV/laptop) is a slowly filling "pressure" gauge; every player's phone is a private role card and a personal snitch. The fun is the involuntary crack — the nervous laugh, the reflexive "shh" — under mounting silence, sharpened by the knowledge that one or two people in the room are secretly *required* to break it.

## Problem
Silence games devolve into one person policing everyone by ear, and arguments about who actually made the noise. And pure "don't laugh" endurance has no strategy. Bated Breath adds hidden asymmetric obligations so silence becomes a bluff, and makes each phone the impartial referee for exactly one mouth.

## How it works
At round start each phone privately deals a role. Most players are **Holders**: the card says only "STAY SILENT — win if you never vocalize." But 1–2 phones privately show "**PLANT**: you must produce an audible vocalization before the gauge fills, or you bust." The gauge on the host TV rises over ~60–90s.

Each phone runs its own mic locally and flags *only its owner* the instant it detects a vocalization (laugh, word, gasp). The first Holder to vocalize is eliminated on the host screen; Plants who never vocalize before the gauge fills bust. Plants therefore want to bait a jittery Holder into cracking early so the room's attention (and the pressure) breaks before they're forced to make their own move — a cough timed to hide inside someone else's laugh. Holders privately don't know how many Plants exist, so every twitch is suspect.

PRIVATE per phone: your role, your own live "you just made a sound" flag, a discreet countdown if you're a Plant. SHARED on host: the pressure gauge, an anonymized elimination feed ("someone cracked"), and the final reveal of roles.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). Data model: Room{gaugeStart, gaugeDuration, roster[]}, Player{id, role, busted, firstVocalTs}. Each phone uses WebAudio AnalyserNode → RMS envelope with a short calibration (2s of room-floor sampling) to set a *relative* threshold, so it fires on its owner's near-field voice, not the room. On detection the phone sends {playerId, localTs}. The genuinely hard part is fair ordering: to name the true first-breaker across devices we run an NTP-style clock-offset handshake per phone and compare server-normalized timestamps, and require a minimum RMS margin over room floor to reject cross-talk bleed.

## v1 scope
- 3–4 players, exactly one Plant, one round.
- Fixed 60s gauge, no scoring beyond win/bust.
- Per-phone RMS calibration + relative-threshold VAD.
- Host shows gauge + anonymized cracks + final reveal.

## Out of scope
- Multiple rounds, tournament scoring.
- Distinguishing laugh vs word vs cough.
- Voice fingerprinting to attribute a sound without the owner's own phone.

## Risks & unknowns
- Cross-talk: a loud laugh may trip a neighbor's phone — mitigated by relative threshold + margin, but needs field tuning.
- Clock-offset accuracy on flaky wifi could mis-order near-simultaneous cracks.
- Plants may find it trivially easy to satisfy their obligation in a dead-quiet room; may need a "must sound convincingly involuntary" wrinkle later.

## Done means
Four phones join, each gets a private role, the gauge fills on the host TV, and when a player audibly laughs their *own* phone flags them and the host eliminates the correct person — while a silent Plant who coughs at 0:58 is credited and a Holder across the room is not falsely triggered.
