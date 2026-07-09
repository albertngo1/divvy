## Overview
Hot Mic is a cooperative concurrent-room party game for 3–6 players. Every phone is a private microphone-level meter AND a secret cue light. An invisible "live mic" passes around the group in a hidden order; when it's yours, you must be the only audible voice in the room. The shared host screen (TV/laptop) is the group's single scoreboard — a chain of links that grows when the hand-off is clean and shatters on a mistake.

## Problem
Most voice party games are about *what* you say. The itch here is timing and restraint: the delicious tension of a relay where you can't see the baton coming — you feel it, react by making noise, then must shut up completely and trust the room. It turns a living room into an improvised, eyes-up radio net.

## How it works
The server generates a random visitation order over the players (hidden). Rounds run in ~1s ticks. Exactly one player is "live" at a time.
- **Each phone shows PRIVATELY:** a big dark panel that flashes GREEN + buzzes the instant *you* go live ("YOU — speak now"), a private live loudness bar (your own mic RMS), and a tiny status word ("listen" / "you're up" / "hush"). You never see who's next or who's live besides yourself.
- **The host screen shows PUBLICLY:** the growing chain of successful hand-offs, a single room-wide "one voice / silence / OVERLAP" indicator, and the fail animation. It never reveals the order.
The live player must push their loudness above threshold within a grace window; everyone else must stay below it. A clean pass = live player quiets AND the next cued player goes loud within the hand-off window. **Fails:** two phones loud at once (OVERLAP), or dead air longer than the gap window (STALL). Because only your phone knows your turn, you must read the *room* — listen for the previous voice trailing off — to nail your entrance. That's the whole game.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Phones capture mic via getUserMedia, compute windowed RMS in an AudioWorklet, and send a lightweight `{loud: bool, rms}` at ~15Hz (raw audio never leaves the phone). Server holds `{order[], cursor, chainLen, phase}` and is the sole judge of overlap/stall by comparing timestamps of loud-flags across phones. **Genuinely hard part:** real-time fairness — mic bleed (a loud neighbor tripping your meter) and network jitter can cause false OVERLAP. Mitigations: per-phone auto-calibrated noise floor at lobby time, a short debounce, and requiring physical spacing so each mic mostly hears its owner. The room's layout literally becomes the board.

## v1 scope
- 3 players, one fixed random order, one chain attempt to reach length 6.
- Green-flash + buzz cue; single loudness threshold; overlap and stall detection.
- Host shows chain length + pass/fail; no accounts, QR-code join.

## Out of scope
- Scoring history, difficulty ramp (speeding tempo), multiple rounds.
- Reverse/skip baton, sabotage roles, pitch or word detection.

## Risks & unknowns
- Mic bleed causing false overlaps in a small room — needs real calibration testing.
- iOS mic-permission + AudioWorklet reliability across phones.
- Is reacting to your own buzz too easy? May need to hide the cue behind a beat of anticipation.

## Done means
Three phones in one room complete a clean 6-link chain, and a deliberate double-talk fires OVERLAP on the host screen within 300ms, while a 3-second silence fires STALL.
