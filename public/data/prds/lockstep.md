## Overview
Lockstep is a phone-native riff on *The Mind* — a wordless cooperative game for 3–5 people in one room. The TV is the shared, rising tower of played numbers; each player's phone is a private hand of secret cards. The whole joy is the collective held breath as you sense whether your card is the next one due.

## Problem
*The Mind*'s magic evaporates the instant cards become visible or a single phone gets passed around — you'd glimpse someone's hand and the tension is dead. The only way to preserve the game's silent, synchronized dread is a genuinely private per-phone hand: nobody can ever see another player's numbers, so the room can only coordinate by feel and nerve.

## How it works
The server deals each player secret numbers from 1–100 (v1: 2 each). The goal: play every card in the room in global ascending order, with zero talking and no hinting at values. Win by emptying all hands within a small life budget.

**Each phone shows PRIVATELY:** only that player's remaining cards (sorted) and one glowing PLAY button for their lowest, plus a subtle haptic "pressure" pulse that intensifies the longer nobody has played — a private nudge, not a shared signal.

**The host TV shows only:** the last-played number, the growing stack, remaining-card count, and lives.

When you believe your lowest card is the room's next-lowest, you tap PLAY. If it truly is the global minimum among all outstanding cards, it stacks green. If someone was holding a lower card, it's a STRIKE — the TV flips up both the played card and the skipped lower card so everyone sees the misjudgment — and a life is lost.

## Technical approach
Host browser tab + phone PWAs + an authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `room{ players[], lastPlayed, lives, phase }`, `player{ id, hand[], connected }`. On PLAY the phone sends `{cardValue}`; the server atomically validates it against the minimum of ALL outstanding hands and is the sole source of truth, so near-simultaneous taps resolve deterministically by receipt order. It then broadcasts a delta to host + phones. The genuinely hard part is real-time fairness: two players tapping adjacent cards within ~150ms. v1 keeps it pure — order strictly by server receipt timestamp, apply strikes consistently, and mask latency only enough that an honest but laggy player doesn't feel cheated.

## v1 scope
- 3 players, 2 secret cards each, 2 lives, ONE round
- Numbers 1–100, text-only host tower
- Server-authoritative strike detection by receipt order
- No talking (rules-enforced honor)

## Out of scope
- Multiple levels / throwing-star "peek" powers
- Mid-round reconnection, spectator view
- Sound design beyond one tick + one strike sound

## Risks & unknowns
- "Unfair strike" feeling from latency is the top risk
- Card-count tuning (too easy vs. impossible)
- Table talk / signaling can't be technically prevented

## Done means
Three phones are each dealt 2 hidden numbers; the room empties all 6 in true ascending order with strikes correctly assigned by the server; the TV shows the climbing stack and a win/lose result; and at no point is any number ever visible across phones.
