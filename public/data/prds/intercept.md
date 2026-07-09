## Overview
A phone-native riff on **Decrypto**, for 4 friends split into two teams of two. The host TV is the shared "airwaves"; each phone is a private codebook. Teams transmit secret numeric codes to their own side while the other team listens in, trying to reverse-engineer the four hidden words behind the clues.

## Problem
Decrypto is one of the best modern party games, but its physical version leaks constantly — you shield a card screen with your hand, teammates lean, opponents peek. The whole tension is *controlled information leakage over rounds*, and paper can't enforce it. Per-phone privacy makes the secrecy actually airtight, which paradoxically makes the deliberate leaking meaningful.

## How it works
At setup, each team's phones (and only that team's phones) privately show the same **four secret words**, numbered 1–4 (e.g. 1=OTTER, 2=VELVET, 3=CHAPEL, 4=RUST). The opposing team never sees them.

Each round, one player is the **Encryptor**. Their phone — and no one else's — privately shows a three-digit **code** like `4-1-3`. They type three clues, one per digit, that point their teammate toward RUST, OTTER, CHAPEL without naming them. Clues appear on the host TV for the whole room.

Now both teams guess, each on their own phones, privately and simultaneously:
- The Encryptor's **teammate** guesses their own code (should be easy — they share the codebook).
- The **opposing team** guesses the code too (an *interception*), working only from accumulated clue history.

The host TV reveals results: your team miscommunicates = a strike; opponents intercept = a strike against you. The private per-phone codebook is load-bearing — one shared passed phone would expose both teams' word lists and collapse the entire bluff economy. Clue history stacks on the TV so later rounds get more dangerous.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `room{teams:[{words[4], players[]}], round, encryptorId, code[3], clues[], history[]}`. Codebooks are pushed only to same-team socket connections; the server never sends a team's words to the other team's clients. Sync: clue submission → broadcast to all; guess submission → collected privately, revealed only after both teams lock in. Hard part is *information partitioning* — the server must guarantee a client can never request another team's word list, even mid-reconnect; all private state is server-gated by team membership, clients render only what they're pushed.

## v1 scope
- 4 players, fixed 2v2.
- One team encrypts, one round, one 3-digit code.
- Curated 8-word deck (two sets of 4).
- TV shows clue history + strike tally; phones show codebook (own team) and guess entry.
- No scoring across rounds — just "did they intercept: yes/no."

## Out of scope
- Full best-of match, white/black token win conditions.
- Team sizes beyond 2, solo mode, matchmaking.
- Clue validation / anti-cheat (typing the literal word).

## Risks & unknowns
- Interception needs ~2+ rounds of clue history to bite; a one-round v1 may feel toothless — mitigate by seeding one round of fake prior clues on the TV.
- Two-player teams can just whisper aloud; needs a "no talking during guess" honor rule.
- Clue quality varies wildly with word deck.

## Done means
Four phones, split 2v2, each team sees only its own four words; an Encryptor gets a private code, types three clues to the TV; teammate and opponents each submit a private code guess; the TV correctly reveals both guesses and awards a strike if the opponents intercepted — with neither team's word list ever transmitted to the other team's device.
