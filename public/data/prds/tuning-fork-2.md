## Overview
Tuning Fork is a concurrent-room party game for 3-5 players who each hold a private pitch and try to converge on a single unison note — blind, by ear, without ever hearing each other. The load-bearing trick: every player hears *only their own tone* through earbuds, so the sound in your head is useless for comparison. The only shared signal is an abstract 'beat' the TV shows the room.

## Problem
Singing in tune with others is easy *because you hear them*. Take that away and unison becomes a genuinely novel coordination puzzle. Existing sync games use rhythm or sliders; almost none exploit that a phone can pipe *different private audio into each person's ears* — a wildly underused per-phone capability.

## How it works
Each **phone shows/plays PRIVATELY**: a vertical drag strip that sets the frequency of a continuous sine tone played through *that phone's* earbuds (WebAudio oscillator). You hear your note steadily; you slide it up or down. You never hear, see, or get a number for anyone else's pitch.

The **shared host screen** shows one 'dissonance bar' — a shimmering, unstable meter derived from how spread out all the frequencies are (stddev in cents). Wide spread = the bar writhes and buzzes visually; approaching unison = it steadies and glows. It never reveals individual pitches or who's the outlier.

So the room must collectively feel out the Schelling pitch: if the bar worsens when you go up, someone's pulling the other way — you infer and adjust. **Win:** all frequencies within 15 cents for 3 continuous seconds. One 60-second round.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve).

**Data model:** `player {id, freqHz}`. Phones synthesize the tone locally (zero audio streaming) and send throttled `{freqHz}` updates on drag (~20Hz).

**Sync strategy:** server computes spread = stddev of log-frequencies (cents) across active players and broadcasts a single `consonance` scalar to the host at 20Hz. Host maps it to the bar's steadiness/color. Trivial server math — the hard part is elsewhere.

**Genuinely hard part:** the *experience*, not the sync. Continuous local audio must start on a user gesture (autoplay policy), stay glitch-free during drags, and the dissonance meter must be legible enough to guide blind hill-climbing without ever leaking who's off — too informative and it's trivial, too vague and it's random.

## v1 scope
- 3 players, one 60-second round, single unison goal.
- Drag-to-pitch tone per phone; host dissonance bar; win/lose screen.
- Assumes everyone has earbuds (checked at join with a 'do you hear a tone?' gate).

## Out of scope
- Chords/harmony targets, multiple rounds, scoring.
- Speaker fallback (defeats the private-audio premise).
- Mic input or actual singing.

## Risks & unknowns
- **Earbud dependency** is real friction; without it players hear each other and the game collapses.
- Whether a single shared consonance scalar gives enough gradient to converge.
- Cross-device audio latency/tuning quirks; tone-onset clicks.

## Done means
Three earbud-wearing players, hearing only their own tones, pull within 15 cents and hold 3s inside 60s in real playtests, with the host bar visibly steadying at the moment of unison.
