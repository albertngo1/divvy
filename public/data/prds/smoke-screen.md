## Overview
A 90-second real-time fireworks show for 3 players. The host TV is the night sky plus a public "crowd hype" curve that rises to a finale peak. Each phone is a pyrotechnician's private firing panel holding three shell cards. Everyone wants the peak; the peak can only hold one shell.

## Problem
Collision games usually give everyone the same collision rule, so the room can reason its way to a clean schedule and the tension dies. Real contention is asymmetric: nobody knows how much room the other person actually needs. There is no party game where your own exclusion zone is private, negotiable, and worth lying about.

## How it works
Each phone privately holds 3 shell cards. Every card has a value multiplier and a **smoke duration** — a fat 3x gold willow fouls the sky for ~6s, a 1x crackle clears in 0.5s. Both numbers are private to the owner.

During the 90s show, tapping a shell launches it at that instant. Its score is the hype curve's value at that moment, times the multiplier — **unless** it launches while any earlier shell's smoke (including your own) is still hanging, in which case it is spoiled and scores zero.

Host TV (public): the scrolling hype curve, a flash for every launch, and a smoke puff. Critically, every puff renders identically for its first 1.5s and only then fades at its true rate — smoke duration is real information, but it arrives too late to react to. No shell values, no owner labels until the end.

Phone (private): your 3 cards with true smoke seconds and multipliers, a FIRE button, and an instant SPOILED/SCORED verdict the room does not see. So you know you just wasted your best shell while everyone else assumes the peak is now occupied — and you can say so out loud, truthfully or not. Talking is the whole game: "I'm clean, go right behind me."

## Technical approach
Host browser tab + phone PWAs + a PartyKit Durable Object as the authority. Model: `Room{showStartRoomTime, curve[], players[{id, shells[{id, mult, smokeMs, state}]}], launches[{playerId, shellId, roomTimeMs, smokeUntil, spoiled}]}`.

Sync: each client runs an NTP-style handshake (5 ping/pongs, median offset) so taps are stamped in room time, not wall time. Phones send `{shellId, clientRoomTime}`; the server clamps to a plausible window, sorts by room time, and resolves spoilage against `max(smokeUntil)` of all prior launches. Ties under 15ms both spoil.

The hard part is fairness under 60–200ms jitter: with a 0.5s smoke shell, a 120ms sync error is the difference between the finale and a dud. Clock calibration plus a visible 250ms "fuse delay" on every launch absorbs jitter and makes late-tap sniping honest.

## v1 scope
- 3 players, 3 shells each, one 90s show
- 3 hardcoded shell types, one baked hype curve
- Join by 4-letter code, no accounts, no lobby art
- 2D canvas sky, flash + puff only
- End screen: full timeline reveal of who fouled whom

## Out of scope
- Multiple rounds, audio, spectators, animations, rejoin, persistence, more than 3 players

## Risks & unknowns
- Clock sync may not feel fair; needs measuring on real phones over Wi-Fi
- Private smoke duration may read as arbitrary rather than strategic
- The finale peak may dominate so hard everyone fires there and the show degenerates; curve shaping is untested
- 3 players may not create enough contention to force negotiation

## Done means
Three phones and a laptop run one 90s show where at least one shell is spoiled by another player's smoke, the phone owner learns it privately at least 2s before the TV reveals anything, the end screen correctly attributes every foul, and launch resolution is consistent within 100ms across clients.
