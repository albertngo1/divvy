## Overview
A 4-5 player game built on the most universal passive-consumption ritual there is: shouting answers at a quiz show. The host tab runs a 60-second "name as many ___ as you can" segment; the room plays along as one team. Underneath, every phone privately holds a betting slip on a point spread against the room's *own* final score — and some of those slips say UNDER. Cooperation becomes theater.

## Problem
Co-op trivia is warm and forgettable; competitive trivia just rewards whoever knows the most. Neither has a reason to watch each other. The itch: a betting layer where the thing you're wagering on is a group performance you personally control, so throwing it is possible, profitable, and deniable.

## How it works
1. **Line.** Server sets a spread for the segment (e.g. "ROOM SCORES 11.5"). Each phone privately draws a side — OVER or UNDER — with 3 players dealt roughly 2 OVER / 1 UNDER. The TV shows the line. It never shows the split.
2. **Segment (60s).** TV displays the category ("US state capitals," "Pixar films"). The room shouts freely, as it would at a real show — but an answer only scores when someone *types* it into their phone. First correct typer gets credit; duplicates are silently rejected. **Three wrong answers end the segment early.** That strike rule is the shaving lever: a wrong answer is fast, cheap, and completely deniable ("I thought Sacramento was— wait").
3. **Private phone state:** your side of the line, your own answer box, your personal count, and a live "strikes remaining" warning. **Host TV:** the category, the running room score against the line, the strike counter, and each player's answer *count* only — never their content, never their side.
4. **The read.** Because the TV shows counts, a shaver can't just sit still; the honest play is to shout answers aloud so others burn them as duplicates, or to type one confident wrong answer at minute's end.
5. **Accusation.** One 20-second vote: each phone names who it thinks held UNDER. Sides reveal. Bettors are paid on the line; a correctly-fingered UNDER holder forfeits their winnings to the accusers.

## Technical approach
Socket.IO server (Tailscale Serve) or a PartyKit Durable Object; host browser tab + phone PWAs. Data model: `Round {category, answerSet, line, tEnd, strikes}`, `Player {id, side, submissions[]}`, `Submission {playerId, text, tServer, verdict}`. Answers are normalized (lowercase, strip punctuation/articles, small alias table) and checked against a hardcoded answer set server-side; the server is the only holder of `side` until reveal.

The hard part is **first-typer adjudication under jitter**: two people typing "Boise" 80ms apart must resolve deterministically and identically on every screen. Submissions are ordered by server receive time with a 150ms coalescing window; ties inside the window are awarded to the earlier client timestamp after an NTP-style offset handshake. Everything else — score, strikes, clock — is server-authoritative and pushed as full round state at 5Hz, so a reconnecting phone never sees a stale score.

## v1 scope
- 3 players, one category with a hardcoded ~40-item answer set, one 60s round.
- One fixed line, sides dealt 2/1.
- Three strikes ends the round.
- One accusation vote, then reveal + payout table.

## Out of scope
Multiple rounds, real game-show video, fuzzy/LLM answer grading, dynamic lines, bankrolls across rounds, more than one UNDER.

## Risks & unknowns
String matching will reject a right answer and someone will (fairly) be furious. With 3 players the UNDER holder may be trivially obvious. The shaving strategy might collapse to "type nothing," which is boring — the strike rule exists to fix that and may not be enough. Shouting-vs-typing may feel like two games stapled together.

## Done means
Three phones and a laptop: a 60s round runs, the TV shows a live score against a line with per-player counts and no leaked sides, a deliberate wrong answer visibly costs a strike, the accusation vote resolves, and in one playtest an UNDER holder gets away with it.
