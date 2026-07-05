## Overview
Read Back is a 3-player cooperative crisis game in the Spaceteam / Devils & the Details lineage, played on a shared host screen (TV/laptop) with each player on their own phone. It turns the aviation/nuclear ritual of *verbal read-back verification* into a real-time voice loop: no command can execute unless it's spoken, repeated back verbatim, and confirmed by a third crewmate who alone can see whether the repeat was correct.

## Problem
Most co-op party games route information through the screen, so voice is optional flavor. Read Back makes accurate *speech* the only channel that clears the task — and it hides the ground truth from the person doing the talking, so trust and tension between three humans, not the machine, carry the round.

## How it works
Each round a stream of hard-to-say technical commands must be cleared before the ship's heat bar maxes out, e.g. `PRIME COOLANT LOOP BRAVO TO SIXTY PERCENT`.

Private per-phone views (load-bearing):
- **Sender** sees the full command text. Nobody else does. They read it aloud.
- **Receiver** sees NO text — only a `KEYED` indicator and an `EXECUTE` button that stays locked. They must repeat what they heard, out loud, from memory.
- **Checker** privately sees the *same* true text as the Sender, hears the Receiver's read-back, and taps **MATCH** or **NO-MATCH**.

The shared host screen shows only the ship status, the heat bar, commands-remaining, and the timer — never any command text. On **MATCH**, the Receiver's EXECUTE unlocks and the command clears (+1). On **NO-MATCH**, the Sender must re-read (costing precious seconds). If the Checker confirms a read-back that was actually wrong, the ship faults — so the Checker must genuinely listen, not rubber-stamp.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Command {id, text, status}`, `Player {id, role: sender|receiver|checker}`, `Round {timerMs, heat, queue[]}`. The server pushes each new command's text to Sender and Checker *atomically and simultaneously*, and never to the Receiver. Verdicts flow Checker → server → host. The genuinely hard part is not netcode throughput but **information hygiene under latency**: guaranteeing the Receiver's socket never receives the text (even in reconnect/replay), and that Sender+Checker see identical strings at the same instant so the Checker isn't judging a stale command. Scoring/timer are server-authoritative; the Checker tap is the only adjudication input.

## v1 scope
- Exactly 3 players, fixed roles for the whole round (no rotation).
- One 90-second round, clear 8 commands to win.
- Single shared heat bar; 3 faults = loss.
- ~40 hand-authored command strings.

## Out of scope
- Role rotation, 4+ players, multiple parallel commands.
- Any automatic speech-to-text adjudication (humans referee in v1).
- Difficulty tiers, cosmetics, reconnection polish.

## Risks & unknowns
- Is the Checker role fun or a chore? Needs playtest.
- Text-leak bugs would instantly kill the asymmetry.
- Read-backs may be too easy without truly gnarly phonetic strings.

## Done means
Three phones join a host room; Sender and Checker see a command the Receiver cannot; a correct spoken read-back + Checker MATCH clears it and increments score; a wrong one forces a re-read; 8 cleared within 90s shows a WIN screen — all state server-authoritative.
