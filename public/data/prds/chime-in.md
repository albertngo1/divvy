## Overview
Chime In is a 4-player cooperative voice game built on an inversion: overlap is the goal, not the failure. The room is secretly split into pairs, each pair shares a hidden codeword, and a slot on the host screen only energizes when a matched pair vocalizes their shared word **simultaneously**. It's for people who found Spaceteam's collision-avoidance stressful and want the opposite catharsis — a coordinated shout that has to land as one sound.

## Problem
The voice-coordination genre is saturated with anti-collision mechanics (dead air on overlap, one-mic-at-a-time). The itch: coordinating a deliberate, tight, two-person overlap is genuinely hard and completely unexplored — you have to find your partner by talking, then count into a shared downbeat.

## How it works
The host TV shows a small circuit with 2 empty slots and a countdown. Four phones are secretly paired: two phones privately hold codeword `HERON`, the other two hold `MARBLE`. No phone knows who its twin is — each shows only its codeword plus a thin private hint (`your twin's word is also a BIRD` / no hint at all).

Players broadcast aloud to hunt their match: "I've got a bird — anyone else a bird?" Once a pair identifies each other, they must **both vocalize the codeword within a ~250ms window** (each phone detects its own voice-onset spike). If the two onsets are the intended pair AND land inside the RTT-normalized window, the slot lights. A wrong overlap — two non-partners chiming together — buzzes both and briefly locks their phones. Both slots lit before the timer wins the round.

Each phone PRIVATELY shows: its codeword, its optional twin-hint, and a big CHIME button that arms voice-onset detection. The shared screen shows only the anonymous slots and the timer — never who holds what.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Each phone runs `getUserMedia` + Web Audio, detects an amplitude-onset spike locally, and posts `{codeword, onsetClientTs}`. The server RTT-normalizes each timestamp (rolling ping estimate), and looks for two onsets with the SAME codeword within a ~250ms server window. Content isn't verified by ASR — the shared codeword is guaranteed by assignment, so the machine only judges simultaneity; players say it for the human joy and because voicing (not tapping) triggers the onset. Data model: `players[id] = {codeword, twinHint}`; `slots[codeword] = lit`. The genuinely hard part is **fair simultaneity detection across heterogeneous phone mics and latencies** — onset thresholds vary by device and room noise, so the server must adapt the window and reject double-counting a single loud shout picked up by two mics.

## v1 scope
- Exactly 4 players → 2 pairs, 2 slots, one round, one 60s timer.
- Two hand-authored codeword pairs with one category hint.
- Onset detection only; no pitch/word verification.

## Out of scope
- Odd player counts, trios that must chime three-way.
- ASR content checking, harmony/pitch matching, scoring across rounds.
- Reconnect handling, spectators.

## Risks & unknowns
- Cross-mic bleed: one player's shout registering on a neighbor's phone as a false onset — needs a per-device onset floor and de-dupe.
- Window tuning: too tight feels impossible, too loose lets any two shouts pass.
- Finding your twin might resolve too fast with only 4 players; the wrong-overlap penalty must sting enough to keep it tense.

## Done means
Four phones join and each shows a private codeword; when the two phones sharing a word produce voice onsets within the normalized window the matching slot lights, a mismatched overlap buzzes and briefly locks both, and lighting both slots before the timer triggers the TV's win state.
