## Overview
A ten-minute closing ceremony for 3–5 people who are in the same room tonight and won't be again soon — the last night of a trip, someone moving away, the end of a holiday. The group co-writes one short message none of them ever reads, encrypts it live, and hands every phone a fragment of the key. The keepsake is the sealed capsule; the game is whether the room can keep it sealed.

## Problem
Party games evaporate the moment the TV turns off. Group "time capsules" fail for a boring reason: one person owns the doc, so one person reads it early, so it isn't a capsule. And "write something meaningful" as a prompt makes everyone freeze. This needs ceremony, a real lock, and a reason to feel something in the next ninety seconds rather than in a year.

## How it works
**Seal phase.** The host TV shows a public frame — *"On August 1st, we ___, and we were ___."* Each phone privately receives a *different* clause slot with a 60-character cap. You write blind: you never see any other clause, and the TV shows only a row of grey blocks, one per locked clause, widths proportional to length. Nobody knows what the message says. The host tab assembles it, generates an AES-GCM key, Shamir-splits it into n shares with threshold k = n−1, and shows each phone its own share as a QR plus six words: *screenshot this now.* Plaintext and key are destroyed.

**Temptation phase.** 90-second countdown. Every phone has a hold-to-submit OPEN IT button. The TV shows only an aggregate: **1 of 2 shares held.** Never who. Releasing your hold retracts your share, so the count goes *down* — the whole game is watching "1 of 2" sit there while everyone stares at the ceiling. Reach k and the capsule decrypts and is read aloud on the TV forever, spent. Let the clock run out and the TV renders a sealed card: *opens when 2 of 3 of you are in a room again.*

Privately, a phone shows: your clause prompt, your draft, your key share, your own hold state. Publicly: block count, share count, timer, final artifact.

## Technical approach
Authoritative Durable Object per room. `Room{code, phase, players[]}`, `Clause{playerId, slot, text, cap}`, `Capsule{ciphertext, iv, k, n}`, `Hold{playerId, down}` — holds live in DO memory only, never persisted, never broadcast per-player. Clause text is relayed to the host tab exactly once at seal; the host does WebCrypto encryption and GF(256) Shamir (~80 lines), returns ciphertext plus per-player shares, and the server unicasts each share to exactly one socket.

The hard part is that anonymity has to be a *system property*, not a UI promise. Only the integer count is broadcast; each count change is delayed by a randomized 300–900 ms so a press can't be visually correlated with someone's arm moving across the room; no per-player hold event is ever logged; message plaintext is scrubbed from DO memory the instant the ciphertext returns. Second hard part: the year-later `/open` page must be a static file that decrypts from k pasted shares plus the ciphertext embedded in the sealed card's QR — no server, no account, still works if this whole thing is dead.

## v1 scope
- Exactly 3 players, k = 2, one message, three 60-char clause slots
- One 90-second temptation window, no rematch, host = a laptop tab
- Sealed card PNG with ciphertext QR + static `/open` decrypt page
- Zero accounts, zero persistence beyond what people screenshot

## Out of scope
Email/cloud delivery, images or audio in the capsule, custom prompts, >5 players, share-integrity verification, any cheating detection.

## Risks & unknowns
The phase may be a foregone conclusion — if everyone opens instantly, k and timer need tuning. Sealed endings risk anticlimax. Lost screenshots kill a capsule permanently (arguably the point, arguably a support nightmare). iOS QR-screenshot friction. Crypto must actually be correct.

## Done means
Three phones, three blind clauses, three distinct QR shares, and plaintext never once on the TV. During the window the public count visibly rises and falls while no screen anywhere reveals whose finger is down; two holds reads the message aloud, fewer downloads a sealed PNG that the static page decrypts a day later from two pasted shares.
