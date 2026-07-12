## Overview
Detune is a 3-4 player concurrent-room game where the whole room sings one sustained chord — and the goal is to stay OUT of each other's way. Each phone listens to its own singer's pitch. If two voices crowd the same note, the host TV punishes the room with audible beating and a visual smear. It's a party game for people who can't necessarily sing but can hear when something sounds wrong.

## Problem
Group singing games chase unison or harmony — matching. That's coordination as the goal. Detune inverts it: unison is the failure. The itch is the physical comedy of everyone humming, hearing a horrible wobble bloom, and silently sliding their voice apart until the chord suddenly locks clean — with no one able to see who they're colliding with.

## How it works
Host TV displays a target chord as a vertical stack of empty "slots" (e.g. three notes spanning an octave) plus a live spectral ribbon of the combined room sound. Each phone runs pitch detection on its own mic. Your phone PRIVATELY shows only YOUR current pitch as a dot and a rough shaded target region ("aim low," "aim high") — you never see anyone else's pitch, only hear the collective result. Players hum and hold. The server tracks each voice's fundamental. If two fundamentals fall within a semitone, that's a COLLISION: the host emits a beating/dissonance sting and the ribbon turns muddy red — the punishment is inescapably audible to everyone. To win, all voices must be mutually spread (each in a distinct slot, no two within a semitone) and held stable for 3 seconds. Because no phone sees the others' pitches, the only channel is your ears, so the room negotiates purely by listening and swerving.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Pitch detection runs on-device (autocorrelation / YIN via Web Audio `AnalyserNode`) so raw audio never leaves the phone; each client sends only a stream of `{ fundamentalHz, confidence }` at ~15Hz. Data model: `Player { id, name, hz, confidence }`, `Room { targetSlots[], phase, lockTimer }`. Server computes pairwise semitone distances, flags collisions, and holds the 3-second all-clear timer authoritatively; the host TV subscribes to that resolved state to drive the dissonance audio. Genuinely hard part: pitch detection on humming across cheap phone mics is noisy — octave errors and low confidence in a loud room could make collisions phantom or missed. Needs confidence gating, median smoothing, and octave-fold normalization so the game feels fair rather than random.

## v1 scope
- 3 players, one fixed target chord, one round
- On-device pitch → `{hz, confidence}` stream only
- Private per-phone pitch dot + target hint; shared TV chord slots + dissonance sting
- Server-side semitone-collision detection + 3s lock win

## Out of scope
- Scoring, multiple chords/rounds, key changes
- Timbre/vibrato analysis, harmony grading
- Accompaniment backing track

## Risks & unknowns
- Phone-mic pitch tracking on humming may be too flaky in a noisy party; needs live testing.
- Semitone threshold tuning: too tight feels impossible, too loose feels trivial.
- Cross-talk — each mic hears the whole room, not just its owner; may need loudness-based own-voice gating.

## Done means
Three phones join, all hum at once, and when any two settle within a semitone the host TV audibly beats and reddens, while three well-spread held voices lock the chord clean for 3 seconds and trigger the win — with only pitch numbers, never audio, leaving each device.
