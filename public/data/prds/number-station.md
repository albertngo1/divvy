## Overview
Number Station is a cooperative, voice-driven counting game for 3-4 players, dressed as a spy shortwave broadcast. The room collectively voices a climbing count; the twist is that *who says which number* is private, so the sequence has to self-organize entirely by ear.

## Problem
Group counting games (fizzbuzz, count-to-twenty icebreakers) are genuinely fun but need a moderator, and everyone can see whose turn it is. The itch: a self-organizing vocal sequence where you must track a shared count purely by listening, and know from private information exactly when your voice — and only your voice — belongs.

## How it works
The host TV shows a big radio dial climbing from 1 toward a target (say 20), a shared **signal-strength** health bar, and a static-burst timer. Nobody's turn is ever announced. Each phone PRIVATELY shows a ledger: which numbers are **yours** (e.g. {3, 8, 9, 14}), which are **unison** numbers you share with exactly one other player (must be voiced together), and which are **blackout** numbers nobody may say (skipped in dead silence). Play is spoken aloud: someone says "one," the owner of "two" jumps in, and so on. A number logs only when its correct owner voices it *and* taps SAY IT. Collisions (two people claiming a solo number), a spoken blackout, or a wrong owner all drain signal strength. Reach the target before the timer or health runs out.

Private vs shared: the host shows current number, health, timer, and static bursts; each phone shows only its own filtered ledger plus an optional subtle buzz as the audible count nears one of yours. No phone ever shows the full ownership map — that's the point.

## Technical approach
Host browser tab + phone PWAs + an authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `Game{ targetN, currentN, health, ownership: Map<number, playerId[]>, blackouts: Set<number> }`; each phone receives only its filtered slice at deal time. Advancing the count v1 uses tap+voice rather than ASR: the owner voices the number aloud (enforced socially) and taps SAY IT; the server validates `owner == currentN`'s owner, and unison numbers require both owners' taps within a 600ms window. The genuinely hard part is deciding whether to trust speech recognition or taps — v1 punts on ASR and leans on the social contract of speaking aloud, with the buzz assist keeping it honest. Real-time sync: `currentN`, health, and the unison window broadcast to all clients.

## v1 scope
- 3 players, count 1 → 20, one 90s round
- ~5 solo numbers each, exactly 1 unison pair, 1 blackout
- Tap-to-confirm (voicing enforced by social rule)
- Shared health bar + win/lose screen

## Out of scope
- Real speech recognition / speaker ID
- Multiple rounds, difficulty ramps, leaderboards
- Larger targets or ownership sets

## Risks & unknowns
- Without ASR, is saying-aloud actually enforced? (Rely on social play + buzz timing.)
- Unison-window feel at 600ms.
- Whether tracking-by-ear is delightfully hard or just frustrating at 3 players.

## Done means
Three phones, count climbs 1→20 with correct owners tapping in sequence; a solo-number collision and a spoken blackout each visibly drop the health bar; reaching 20 before 90s shows a win screen.
