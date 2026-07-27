## Overview
A 3-4 player race for one host screen and one phone-plus-earbud per player. Each phone pipes its owner's own microphone back into that owner's earbud at a delay. Delayed auditory feedback is a well-known physiological trap: at 150-250ms most people cannot speak fluently — they stall, repeat syllables, trail off. The round is a race to read a 12-word passage aloud cleanly. Silence is the only thing that reduces your delay, and silence is also the only currency that buys delay for someone else.

## Problem
Every silence game enforces quiet with a rule and a scoreboard, so the punishment lives in the software. Here the punishment lives in your skull. Nobody has to police anyone — the room simply watches four people physically fail to finish sentences, and nobody but the victim knows why theirs got worse.

## How it works
**Setup.** One earbud in, phone in hand. A 10-second calibration confirms mic-to-earbud loop and sets baseline delay to 0ms.

**The round (120s).** Every phone privately shows the same 12-word passage plus that player's own live state: current delay in ms, a HUSH bank (seconds of silence accumulated), and how far through the passage the server has accepted them.

Speaking a word advances you when on-device SpeechRecognition matches the next expected word. But speaking also *ramps your own delay* by +15ms per voiced second, and spends nothing from your bank. Every second you stay silent drains 10ms off your delay and adds 1 second to your HUSH bank.

**The weapon.** Tap a rival's name on your phone and spend 5 HUSH to inject +120ms into their earbud for 20 seconds. They get no notification. They just suddenly cannot talk. The host TV shows progress bars and a global SABOTAGE FIRED flash with *no attribution* — the room knows someone shot, not who or at whom.

So: winning requires talking, talking is the only vulnerable act, and the ammunition is manufactured exclusively by the people currently doing nothing. The last stretch of the passage is deliberately long, so the player who blitzed early arrives at it carrying 300ms of self-inflicted delay and an empty bank.

Per-phone is unavoidable here: the entire mechanic is four private, individually-degraded audio channels. A single passed-around phone erases the game.

## Technical approach
Host tab + phone PWAs + Socket.IO server behind Tailscale Serve (or a PartyKit DO).

Audio is fully local: `getUserMedia` → `MediaStreamSource` → `DelayNode` → destination, with `delayTime` ramped via `setTargetAtTime` so injections glide rather than click. `echoCancellation: false` and `autoGainControl: false`, or the browser fights the loop.

State: `Player{id, delayMs, hushBank, progressIdx, injections[{fromId, endsAt}]}`. Server is authoritative on progress, bank, and injections; the phone applies `delayMs` locally each tick.

The hard part is not throughput — it is that delay must be *felt as fair*. Bluetooth earbuds already add 150-250ms of uncontrolled latency, which shifts everyone's floor unevenly. v1 measures each player's true loop latency during calibration (play a chirp, detect it back through the mic, store the offset) and treats that as their personal zero, subtracting it from the target so a Bluetooth player and a wired player start at the same *perceived* delay. Second hard part: acoustic howl if someone plays without an earbud — detect loopback correlation and hard-mute with a WEAR YOUR EARBUD screen.

## v1 scope
- 3 players, one 120s round, one hardcoded 12-word passage
- Local DelayNode, server-owned bank and injections, one sabotage type at one fixed price
- Host TV: three progress bars plus an unattributed sabotage flash

## Out of scope
Multiple rounds, sabotage variety, reconnect, non-English passages, choosing your own passage, any attribution UI.

## Risks & unknowns
Earbuds for everyone is real setup friction and may kill it at a party. DAF sensitivity varies wildly — some people are barely affected, which flattens the whole design; needs a live test on ~6 humans before anything else. Browser SpeechRecognition on iOS Safari is the other coin-flip; fallback is a manual host-side advance tap.

## Done means
Three players in one room, earbuds in: a player who has been silent taps a rival, and that rival visibly stumbles mid-sentence within a second, with no on-screen cue telling them why — and the round ends with the quietest player finishing the passage first.
