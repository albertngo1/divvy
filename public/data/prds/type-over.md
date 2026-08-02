## Overview

A 3–6 player party game where the shared screen is a single 40-character text field and every phone is a caret in it — simultaneously. Everyone is typing into the same sentence at the same moment with no locking, no turns, and no undo. For groups who like Jackbox writing games but are tired of "type your answer, wait 45 seconds."

## Problem

Writing-prompt party games are secretly solitaire: you type alone, then the group reacts. There is no live interaction between players' hands. Meanwhile the funniest thing about real collaborative editing — two cursors landing on the same word and producing garbage — is treated everywhere as a bug to be engineered away. Type Over makes it the scoring rule.

## How it works

The host screen shows a prompt ("BREAKING: local man ______") and 40 empty character cells, numbered. A 75-second timer starts.

Each phone privately shows: (a) your **payload** — one secret word, e.g. GERBIL, dealt only to you; (b) a slider to place your caret anywhere in 0–39; (c) a keyboard. Nothing else. You cannot see other players' carets, payloads, or intentions.

Everyone types at once. Characters appear on the TV instantly, color-coded per player. The collision rule: if you write to a cell that another player wrote to within the last 2.0 seconds, the cell becomes a **scar** (▓) — permanently locked, unwritable by anyone, and tinted with both players' colors so the room can see exactly who wrecked whom.

So the buffer erodes as you fight over it. The only fix is talking: "I'm taking 0 through 12, stay right." Claims are unverifiable and lying is legal — hogging cells you don't need is a real strategy, and so is bluffing a claim to push someone into a neighbor's zone.

At the buzzer the TV reads the surviving sentence aloud with speech synthesis, scars pronounced as beeps. Then each player reveals their payload. You score 3 if your payload appears intact and contiguous, 1 if it appears with scars inside it, 0 otherwise. The room then votes one bonus point for the funniest surviving fragment.

## Technical approach

Host browser tab + phone PWAs + an authoritative Socket.IO server behind Tailscale Serve (a PartyKit room works identically).

Data model: `Room { id, phase, prompt, deadline, cells: Cell[40], players: Player[] }`; `Cell { char, ownerId, writtenAt, scarred }`; `Player { id, color, payload, caret }`. Phones send `{type:'write', index, char}` and `{type:'caret', index}`; they never mutate local state optimistically for the buffer — only for their own caret.

Sync strategy: the server is the single writer. Each write is a compare-and-set against `cell.writtenAt` and `cell.ownerId`; if a different owner wrote inside the 2s window, the server flips `scarred` and broadcasts. Cell deltas fan out at 20Hz batched; the host renders the full 40-cell strip from server state only, so the TV is always the truth and phones can drift.

The genuinely hard part is **fairness under uneven phone latency**: a player on bad Wi-Fi collides with everyone because their writes arrive stale. Mitigation: timestamp writes client-side, have the server estimate per-client offset from a rolling ping, and evaluate the 2s window in server-corrected client time rather than arrival time. Getting this wrong makes the game feel unjust rather than chaotic.

## v1 scope

- One round, one hardcoded prompt, 3–4 players
- 40 cells, uppercase letters and space only
- Caret = a number slider, not a fancy drag interaction
- Scar rule + per-player color; no undo, no backspace
- Reveal screen: sentence, payloads, intact/scarred/absent
- Join by typing a 4-letter room code

## Out of scope

Multiple rounds, prompt packs, running score, TTS voices, spectators, reconnection, mobile keyboard polish, any anti-profanity handling.

## Risks & unknowns

The 2.0s scar window is the whole balance knob — too long and the board dies in 20 seconds, too short and there's no tension; needs playtest tuning per player count. Phone typing may be too slow for 75 seconds to feel generous. Risk that players trivially solve it by verbally partitioning the buffer in round one; the payload lengths and a deliberately-too-short buffer (40 cells for 4 players × 6-letter words plus filler) should keep it genuinely contested.

## Done means

Four phones join a room, all four type simultaneously into one host-rendered strip, a two-player overlap produces a scarred cell within 100ms on the TV, the buzzer freezes the buffer, and the reveal screen correctly marks each payload intact / scarred / absent.
