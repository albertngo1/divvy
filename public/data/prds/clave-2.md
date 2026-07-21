## Overview
Clave is a 3-player cooperative convergence game where the shared answer is a *rhythm*. The host TV shows one evocative prompt word; each player privately taps out a short rhythm on their phone. The room wins if everyone independently produced the identical beat pattern — a Schelling point not in space or time-of-tap, but in *which beats you'd hit*.

## Problem
Existing sync games nail *when* a single tap lands (Dwell, Shutter) or *what* value you pick. Nobody's converged on a *pattern in rhythm*. Rhythm is deeply embodied and pre-verbal — 'heartbeat' and 'stumble' feel like specific rhythms to everyone, yet you've never had to prove your body agrees with your friends' without humming a note. Crucially, you must not *hear* each other, or the game collapses into mimicry.

## How it works
The host TV shows a prompt word (e.g. HEARTBEAT, GALLOP, STUMBLE, KNOCK). **Each phone privately** shows a 4-beat bar as four large pads and a metronome dot that loops silently (visual pulse only, no audio out — so no one can eavesdrop on a neighbor's phone). The player taps to toggle which of the four beats they'd strike; toggling builds a pattern like ●·●● that pulses back to them visually as the bar loops. They can feel it, edit it, and lock in. No phone ever plays another player's rhythm.

The **host screen** shows, live, only a per-beat heat bar: for each of the 4 beats, how many of the three players have that beat ON (0–3). So the room sees 'beat 1 is unanimous, beat 3 is split 2/3' — enough to nudge convergence without revealing any full pattern or who's the odd one out. **Win = all three 4-bit patterns identical.** On win, the host finally plays the agreed rhythm aloud once, in unison, as the payoff — the first sound anyone hears.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room { prompt, players:{ id -> { pattern: 4-bit int | null, locked } } }`. Sync: phone sends `setPattern(bits)`/`lock`; server broadcasts the 4-beat heat histogram (popcount per beat position across players) and a `win` when all three patterns equal and locked. The hard part is *keeping it silent per phone* — the visual metronome must feel rhythmic enough that players commit on internal feel, using `requestAnimationFrame` against a server-broadcast bar clock so every phone's loop pulse is phase-aligned (though the taps themselves are pattern, not timing, so drift tolerance is loose). The unison win-playback is host-only Web Audio.

## v1 scope
- 3 players, one prompt word, a single 4-beat bar (4-bit pattern), one round.
- Silent visual metronome + tap-to-toggle pads + lock.
- Host per-beat heat bar, win detection, one unison audio playback on win.

## Out of scope
- Longer bars, tempo control, velocity, multiple bars, swing.
- Scoring, prompt decks, more players, per-round rotation.
- Any inter-phone audio during play.

## Risks & unknowns
- 4 beats = only 16 patterns; may be too easy — may need 8 beats or a 'hit exactly N' constraint.
- Silent tapping may feel unnatural; the visual pulse must sell the rhythm.
- Per-beat heat could over-hint toward a trivial all-on/all-off answer; empty and full patterns may need disallowing.

## Done means
Three phones show a silently looping 4-beat bar, each player toggles beats blind to the others, the host shows a live per-beat heat bar leaking no full pattern, and when all three 4-bit patterns match the host fires a win and plays the agreed rhythm aloud in unison.
