## Overview

**Point Taken** is a 4–6 player living-room game where the phone is a compass needle and the room is the board. Each player is privately assigned a physical target in the room ("the TV", "whoever is wearing the most black", "the front door"). Everyone points their phone at their target at once. The catch: if any two headings land within 15° of each other, *both* players score zero for the round. Since the game deliberately assigns targets that sit near each other, at least one pair is always doomed — and the only way out is for someone to point somewhere false. It is a game of chicken conducted entirely with your arms.

## Problem

Party games about hidden information almost always route through typing. The room is right there — sightlines, furniture, people's bodies — and no game uses it. Meanwhile "anti-coordination" games (pick a unique number) are dry math exercises because the collision space is abstract. Make the collision *physical* and it becomes visible, funny, and negotiable in real time by body language alone.

## How it works

1. Host screen shows a calibration ring: players stand in a rough circle and each taps "I'm facing the TV" once to zero out.
2. **Private on each phone:** your target card ("point at the oldest person here"), a live heading readout, and a private nudge meter that tells you *only* whether something is currently within 15° of you — not who, not which side. You feel the crowding without knowing its source.
3. **Shared on the TV:** a compass rose with an anonymous tick per player, live, but rendered as a **fat 30° wedge** — deliberately blurry, so you can see congestion but never confirm you're clear.
4. 20-second commit window. Arms up, phones out, everyone visibly aiming while trying to read whether the person across from you is about to yield.
5. Lock in. TV resolves: exact headings snap in, colliding pairs annihilate in a red flash, survivors score 2. A player who points at a *decoy* (their heading is >30° off their assigned target) scores 1 — surviving on a lie is worth less than being right.
6. Reveal: every assigned target is shown. The room instantly relitigates who chickened out.

## Technical approach

- Host browser tab + phone PWAs, authoritative Socket.IO server behind Tailscale Serve (or PartyKit Durable Object per room code).
- Data model: `Room {code, phase, players[], targets[], roundSeed}`; `Player {id, name, assignedTargetId, heading, locked}`. Targets come from a hand-authored deck of ~24 room-relative prompts, drawn so at least two are physically adjacent.
- Sensors: `DeviceOrientationEvent` — `webkitCompassHeading` on iOS (needs an explicit permission tap), `alpha` + `absolute` on Android. Phones stream heading at 10 Hz; server broadcasts a **quantized, anonymized** heading list at 5 Hz (30° buckets) to the host, and to each phone only a boolean `crowded`.
- Hard part: absolute heading is unreliable indoors — magnetic interference, per-device offsets, drift. Mitigation is the manual "face the TV" zeroing plus a per-device offset stored in localStorage, and scoring on *relative* angles between players only, never on absolute compass truth. Second hard part: the deliberate 5 Hz / 30°-bucket blur is a game mechanic, not a perf compromise — the server must never leak exact headings before lock.

## v1 scope

- One round. Four players. No accounts, no persistence.
- A single hand-written deck of 12 target prompts; 4 dealt per round with a guaranteed adjacent pair.
- Host: compass rose, wedge ticks, resolve animation, final scores.
- Phone: permission tap, zeroing tap, target card, crowded dot, LOCK button.

## Out of scope

- Multi-round matches, scoreboards across games, rejoin-after-refresh.
- Any use of distance, elevation, or camera. Heading only.
- Auto-detected room targets. A human reads the prompt and decides what it means.

## Risks & unknowns

- iOS compass permission is a per-page user gesture and silently absent on some browsers; fallback is a drag-a-dial screen, which keeps the chicken game but loses the arms-up spectacle.
- If players stand too close, everyone's headings crowd by default and every round is a wipe. Needs a minimum-spread check at calibration.
- 15° may be too tight to feel fair; tunable, must be playtested with real arms, not simulated.

## Done means

Four phones on a real living-room floor complete one round: each sees a different private target, the TV shows four anonymous wedges updating live, at least one pair collides and visibly annihilates on resolve, and at least one player is caught having pointed at a decoy — all with no player ever seeing another player's exact heading before lock.
