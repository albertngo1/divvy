## Overview
Downbeat is a 3–4 player cooperative rhythm party game. The host TV is a scrolling music conveyor showing the shared groove; each phone is a private chart for one instrument. Most notes are solo taps, but scattered UNISON hits require two secretly-paired players to strike the exact same beat together — and neither the host nor the pairing is announced, so you have to find your partner by voice, in tempo. For groups who want Spaceteam's overload with a musical, timing-driven feel.

## Problem
Rhythm games are almost always solo or same-screen. A co-op rhythm game where the *coordination* — not the tapping — is the challenge doesn't exist. The itch: I can see my own part perfectly, but the hit that matters requires someone across the room whose part I can't see, on a beat that's already rushing toward the line.

## How it works
**Host screen (shared):** a conveyor of note markers scrolling toward a "NOW" line at a fixed tempo, plus a combo meter. Markers show *when* hits land but not *who* owns them and not which are unisons.

**Each phone (private):** your lane of upcoming notes with their beat positions. Solo notes are plain. A unison note is flagged with the name of your partner instrument ("UNISON w/ BASS on beat 3") — a flag only you and that one partner can see. You don't automatically know they see it too; you confirm by voice.

**The loop:** you tap your solo notes in time (host combo climbs on clean hits). When a unison approaches, you call it — "unison, beat 3, that's you Bass!" — and both partners must tap within a ~120 ms window of each other AND on the beat. Miss the window or the beat and the unison shatters, dropping the shared combo. Because partners' charts differ, no one can just watch the host and know when to help — the voice call is the only bridge.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). **Data model:** `Song{bpm, bars, notes[]}`; `Note{beat, instrument, type:'solo'|'unison', partnerId?}`; server holds the master clock. **Sync strategy:** the server broadcasts a shared start timestamp and tempo; each phone renders its lane locally from that clock so scrolling stays smooth without per-frame packets. Taps are sent with client timestamps, normalized against server-measured RTT, and judged server-side against the beat grid. **Genuinely hard part:** the unison window. Two independent phones' taps must be compared after latency normalization; the window has to be generous enough to survive jitter yet tight enough that sloppy timing fails. Getting the felt tempo synchronized across phones (audio/haptic metronome per device) without drift is the core prototype risk.

## v1 scope
- 3 players, one 8-bar loop at a single moderate tempo
- Each player ~6 solo notes + exactly one unison hit between two named players
- Tap-only input, host combo meter, win = finish the loop above a combo threshold

## Out of scope
- Multiple songs/tempos; difficulty ramp; pitch or hold notes; more than one unison; scoring leaderboards; reconnection.

## Risks & unknowns
- Cross-device tempo drift could make even solo taps feel off; may need a per-phone haptic click locked to server time.
- The unison window under real Wi-Fi jitter may be unforgiving; needs early latency testing.
- Voice coordination on a fast beat might be genuinely too hard at speed — tempo must be tuned down for v1.

## Done means
On three phones + one host, an 8-bar loop plays with each phone showing its own note lane; solo taps register on the host combo meter, and the single unison hit only counts (keeping combo alive) when both paired players tap within the normalized window on the correct beat — demonstrably breakable by having one partner tap late.
