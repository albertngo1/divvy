## Overview
A five-minute room game for 4–6 people with phones on the table. Every phone runs a voice-activity detector on its own owner and ships talk-seconds to the server. Nobody sees the standings. Each player is privately told a *rank* they must hit — "finish 3rd quietest of 5" — and the round is just a normal conversation about a dumb prompt on the TV, played by people secretly steering their own volume of speech toward a target they cannot measure.

## Problem
Every "stay quiet" party game meters silence against a fixed number: a budget, a ceiling, a clock. Fixed numbers are solvable — you count, you comply, it's a chore. Rank targets are unsolvable alone, because your target moves every time somebody else opens their mouth. The itch is a constraint that makes talking and not-talking *both* frightening.

## How it works
Host screen: the conversation prompt ("Argue about the best sandwich in this city"), a 4-minute clock, and a single anonymous swarm of dots drifting — no names, no seconds. That's it. The TV knows everything and shows almost nothing.

Each phone privately shows three things: (1) your rank target, e.g. **AIM: 4th quietest of 5**; (2) your own live talk-seconds; (3) one *rival window* — the live talk-seconds of exactly one other player, secretly assigned, who does not know you're watching them. Every player therefore holds a different partial view of the same hidden scoreboard. Sharing what you see is the obvious play, and describing it out loud burns the only resource being scored. Lying about your rival's number is free and delicious.

When the clock ends, the TV reveals the true ordering, then each target, then who hit it. Points for exact rank; half for off-by-one; zero otherwise. The comedy is the last 30 seconds: two people who both need to not be quietest, jabbering over each other into a photo finish.

## Technical approach
Host tab + phone PWAs + one authoritative room actor (PartyKit / Cloudflare Durable Object).

Data model: `Room { code, phase, promptId, endsAt, players }`, `Player { id, name, targetRank, rivalId, talkMs, speaking }`. Only the DO holds the full `talkMs` vector; each socket gets a filtered projection (self + rival).

VAD runs **on-device**: `getUserMedia` → `AudioWorklet` computing frame RMS, adaptive noise floor from a 3-second calibration, hangover of ~250ms so pauses inside a sentence don't count as silence. The phone sends only `{speaking: bool}` edge events plus a 1Hz heartbeat with cumulative `talkMs`; the DO trusts phone-reported millis but clamps against wall clock so a backgrounded or lying client can't bank negative time.

The genuinely hard part is not sync — it's **cross-talk**. Phones on one table all hear the loudest speaker. Mitigation: per-device calibration converts RMS to a normalized z-score against that device's own floor, and the DO suppresses any frame where a phone is speaking while another phone reports higher normalized energy in the same 100ms window (winner-takes-frame arbitration). This is the make-or-break experiment and it must be run on real hardware on day one.

## v1 scope
- One room, 4 or 5 players, one 4-minute round, one hardcoded prompt.
- Rank targets dealt as a random permutation of 1..N.
- Phone shows: target, own seconds, one rival's seconds.
- TV shows: prompt, clock, and nothing else until reveal.
- Reveal screen with true ordering and per-player hit/miss.

## Out of scope
- Multi-round scoring, lobbies, rejoin, avatars, sound design.
- Speech recognition of any kind. We count *that* you talked, never *what*.
- Headset or per-player mic hardware.

## Risks & unknowns
- Cross-talk arbitration may be too noisy in a loud room; fallback is a louder-and-slower variant where only sustained 1s+ speech counts.
- Mobile Safari suspends audio when backgrounded — phones must stay awake and face-up (make that a house rule shown on the join screen).
- Rank targets may be too easy at the extremes ("be loudest" is trivially winnable). Consider dealing only middle ranks in v1.

## Done means
Five people at one table finish a 4-minute round; the reveal ordering matches a human observer's stopwatch ranking of who talked most; at least two players hit their exact rank; and at least once during the round somebody audibly lies about what their rival window says.
