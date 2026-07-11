## Overview
Quiet Car is a competitive elimination party game for 3-5 players on a shared TV plus private phone controllers. It's musical chairs, but the "chairs" are acoustic spots in the room and every player secretly needs to hit a *different, hidden* loudness band. Last player standing wins.

## Problem
Mic party games have been cooperative (hold a loudness band together) or endurance-based (stay silent longest). Nobody has made a **competitive scramble** that turns the room's real acoustic geography into contested territory — where demand for the good quiet corner is hidden and unequal, so you never know if the person crowding you actually needs the spot.

## How it works
The host TV plays continuous pink noise from its speakers at a fixed level, creating a real loudness gradient: loud by the TV, quieter behind the couch, in corners, down the hall. Each phone PRIVATELY shows only its own live mic-RMS meter and a hidden target BAND — "stay between X and Y." Bands are unequal: one player must find a near-silent spot (the room's one best corner); another needs a middling level; using a band (floor AND ceiling) means you can't just cup the mic to win. A round runs 20s of free scramble — players move through the room reading their own meter, hunting a qualifying spot. At a random cutoff the host freezes everyone; each phone reports in-band or not. Whoever is out of band (or has the worst margin) is eliminated. Because bands are private, you can't tell whether a rival body-blocking your corner truly needs it — that hidden asymmetry is the whole game. The host screen shows only avatars and locked/over status at cutoff; phones NEVER show other players' meters or targets.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Phones sample a WebAudio `AnalyserNode` RMS at ~10Hz, smooth via EWMA, and stream to the server, which owns cutoff timing and pass/fail. Data model: `Room{players[], phase, cutoffAt}`; `Player{id, bandLo, bandHi, currentRms, inBand}`. Genuinely hard part: phone mic auto-gain-control makes absolute dB meaningless — must request `getUserMedia` with `autoGainControl/noiseSuppression/echoCancellation:false` and normalize per device via a 3s baseline capture near the TV, expressing bands relative to each phone's own captured loud/quiet range. Cutoff must be server-authoritative so nobody can claim a late-found quiet spot.

## v1 scope
- 3 players; one round; fixed pink noise from the host
- Three preset bands (strict / medium / easy); 20s scramble + random cutoff
- Eliminate the single worst player; survive/out only

## Out of scope
- Brackets/multiple rounds, dynamic noise, directional audio
- Spectator meter view, cross-phone interference modeling

## Risks & unknowns
- AGC normalization reliability across devices
- Small rooms may lack enough distinct acoustic zones
- Pink-noise fatigue; players deliberately making noise to sabotage a rival's band (possibly a feature)

## Done means
Three phones calibrate, the TV emits pink noise, and at a server-fired cutoff each phone's in-band/out-of-band verdict matches a handheld SPL reading within tolerance — eliminating exactly the intended player, decided entirely server-side.
