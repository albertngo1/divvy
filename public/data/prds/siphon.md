## Overview
Siphon is a 4-player round of noisy, self-defeating greed. A hidden cycle assigns each player a victim: A drains B, B drains C, C drains D, D drains A. Everyone is simultaneously a parasite and a host, and nobody knows either edge they're on except their own outgoing one — which they don't even see, they only feel the incoming one. For groups who enjoy paranoid deduction but are tired of accusation-round formats.

## Problem
Silence games usually make silence a rule you obey. Siphon makes silence an *instrument*: your charge bar's rate of change is (you speaking) minus (your parasite speaking), so while you're talking your own signal is jammed by your own voice. Listening costs money. That single equation is the whole design.

## How it works
1. The server deals a random 4-cycle. Nobody is told any part of it.
2. The TV shows a bland public prompt to babble about ("describe your commute in unnecessary detail") and a 90-second clock.
3. **Each phone privately shows:** your CHARGE bar (live, ~10 Hz), three name buttons, and one SHUSH button.
4. Voiced audio credits +1 unit/sec to the speaker and debits −1 unit/sec from the player that speaker drains. So talking pays; being talked at by *your specific* parasite bleeds you; everyone else's chatter is irrelevant to you.
5. The deduction: sit silent for 8 seconds. If your bar falls, your parasite is one of the people currently talking. Repeat, intersect, and you have them — at the cost of every second of income.
6. **SHUSH** (one per player, ever): tap a name. Correct → you seize everything they've banked and they reset to zero. Wrong → you lose half your charge and the TV announces that a wrong shush happened, without saying whose.
7. **Host TV shows only:** the total pot, four nameplates that glow while that player is voiced (public information anyway — you can hear them), and shush results. Bars are never public; making them public would let everyone correlate everyone and collapse the game.

## Technical approach
Phone PWA: WebAudio AnalyserNode → 10 Hz frames of calibrated RMS plus a voiced/unvoiced classifier (spectral flatness + zero-crossing rate, to reject laughter-free table thumps and rustling). Frames stream over WebSocket to a PartyKit room / Durable Object that owns the authoritative ledger and ticks every 100 ms.

Data model: `Room{cycle:[pid...], tick, pot, phase}`, `Player{id, name, charge, shushUsed, gainDb}`, `Frame{pid, t, dbCal, voiced}`.

The hard part is **attribution under cross-talk**: my phone hears your voice almost as well as mine does, and naive per-device VAD would credit all four players for one person's sentence. The rule is loudest-calibrated-mic-wins per 100 ms bucket, with a second speaker credited only if they exceed the room median by ≥5 dB — so genuine simultaneous talk still resolves, but a single loud voice can't pay everybody. Requires a startup tone calibration and clock-offset estimation, same as any cross-device audio game. Secondary risk: a whisperer can't earn, which is correct and thematic.

## v1 scope
- Exactly 4 players, one 90-second round, fixed random 4-cycle
- One public babble prompt on the TV
- Private bar + one SHUSH each; no rebuttals, no second accusations
- Reveal screen drawing the cycle as arrows

## Out of scope
- Variable graph shapes (chains, forks, two-cycles), 5+ players
- ASR, content scoring, "you must say real words" enforcement
- Multi-round scoring, lobbies, reconnection

## Risks & unknowns
- Is 90 seconds enough to feel a drain *and* act on it? May need 120s or a steeper rate
- The room may discover the degenerate equilibrium of everyone talking constantly (flat bars, no information) — the pot bonus for high total charge is the intended counter-pressure, but needs playtesting
- Bar readability at 10 Hz on a small screen; may need a smoothed derivative arrow instead of the raw bar

## Done means
With four phones and a dealt 4-cycle: a player who stays silent for 10 seconds while their parasite talks sees a monotonic drop, sees no change when a non-parasite talks alone, and a correct SHUSH transfers the full banked charge and renders on the TV within 300 ms.
