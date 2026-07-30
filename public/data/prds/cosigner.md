## Overview

A 4-player co-op about displaced cost. Silence isn't scored — it's *charged to somebody else*. Each phone privately names one WARD: another player whose credit balance you spend every time you open your mouth. You know exactly whom you are bleeding. You do not know who is bleeding you. For groups who like a mechanic that makes them feel briefly, genuinely bad.

## Problem

Silence games price talking against your own score, so the whole thing collapses into individual restraint — boring, and easily solved by one loud player who decides they don't care. The unexplored angle is *externality*: make the cost land on a named friend. Restraint stops being self-discipline and becomes care, and the loud player becomes a person visibly hurting someone specific.

## How it works

The host TV shows five blank slots that together form one answer phrase, plus a single anonymized room SOLVENCY ring. That's all it shows.

Each phone privately shows: your assigned WORD (you hold exactly one of the five, unique to you — the round is unwinnable without your voice), your own CREDIT BALANCE (a bar, falling, with no explanation of why), your WARD's name, and two silent single-use pings (GO / WAIT) that broadcast anonymously to the TV.

The only input channel is speech. A slot fills when a player says their word aloud and their own phone's on-device ASR recognizes it. Cost is A-weighted acoustic energy × duration, debited *from your ward's* balance, not yours. Short and quiet is cheap. But too quiet and ASR misfires, so you must repeat — and the repeat is billed again, to the same friend. That is the entire skill: one clean, minimal, correctly-heard utterance.

The trap: a player whose balance hits zero is MUTED — their phone stops accepting speech — and since every word is unique and required, muting anyone before they've spoken loses the round for everyone. So turn order matters enormously: the person closest to bankruptcy must go first. Nobody can see anyone else's balance. Coordinating that order requires talking, which spends someone's balance. Two anonymous pings per player are the only free channel, and they're not enough.

## Technical approach

Host tab + phone PWA + Socket.IO over Tailscale Serve (or one Durable Object per room). Per-phone: Web Speech API for on-device recognition against a 1-word grammar, plus a WebAudio ScriptProcessor integrating A-weighted RMS over the utterance window. The phone computes `(energy, duration, transcript, startTs)` and posts it; the server is authoritative for the ledger and applies the debit to `wards[seat]`. Data model: `Room { seats[], wardOf{seat→seat}, balance{seat→number}, words{seat→string}, slots[5], pingsLeft{seat} }`. Each phone receives only its own ledger row.

The genuinely hard part is attribution: all four mics hear the same utterance, so a naive implementation bills every phone's ward for one person's sentence. Solution is loudest-mic-wins over a 150 ms cross-phone correlation window — your own voice is reliably 8–20 dB hotter at your own mic — with server-side clock offsets from ping RTT to align windows. Secondary: ASR latency varies by 300–900 ms across devices, so slot ordering must serialize on phone-side utterance start timestamps, not arrival order.

## v1 scope

- 4 players, one round, one 5-slot answer
- Fixed ward cycle (1→2→3→4→1), assigned once, never revealed
- Flat starting balance, no top-ups, no recovery
- Two anonymous pings per phone
- Binary outcome: all five slots filled, or someone gets muted

## Out of scope

Multiple rounds, scoring, traitor roles, ward reassignment mid-round, iOS ASR parity (v1 targets Chrome on Android; iOS falls back to a 2 s clip sent to a local Whisper endpoint), post-round ledger reveal.

## Risks & unknowns

Attribution errors are fatal to trust — a single mis-billed utterance and players stop believing the ledger. Whisper-range ASR accuracy is the other cliff: if soft speech fails 40% of the time, the game becomes a repeat-tax lottery rather than a skill. And the emotional core may land as mean rather than funny; playtest whether groups laugh or go quiet in the bad way.

## Done means

Four players in one room, one round, and at least one recorded moment where a player pauses, looks at a specific friend, and then chooses to repeat their word anyway — with the post-round reveal of the ward cycle producing an argument.
