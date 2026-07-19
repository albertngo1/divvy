## Overview
Regift is a phone-native riff on *That's Not a Hat* — a memory-and-bluff game — for 3–5 players. Absurd gifts ("a live goose", "a haunted mirror", "a jar of teeth") circulate face-down. Each phone privately holds one real gift and a public *claim* about it; you pass it on with your own claim (truthful or a lie), and your neighbor must decide, from failing memory, whether to trust you or call your bluff.

## Problem
The joy of *That's Not a Hat* is that everyone slowly loses track of what's actually in front of whom, so a confident lie can slip past. That requires each player to privately *know and then forget* their own card — impossible with communal cards on a table without constant peeking, and completely broken by one shared phone that would show every hidden gift at once.

## How it works
- The **host TV** shows a circle of players and, for each, one face-down gift with its current **public claim** label ("claims: a live goose"). It also shows whose turn it is and the strike tally.
- Each **phone** privately holds the TRUE identity of the gift in front of that player. Crucially, the phone reveals the real contents only as a **2-second peek** when you receive it, then hides it — you're now running on memory.
- On your turn you must pass your gift to your neighbor and announce a claim: either the truth or a bluff. You tap TRUTHFUL or type/select a LIE label; the TV shows only your public claim, never the truth.
- Your neighbor's phone shows the incoming claim. They either ACCEPT (and take it, getting their own 2-second peek at what's really inside) or CHALLENGE ("that's not a goose!"). The server flips it: a caught liar or a wrong challenge earns a strike. First to 2 strikes loses; last standing wins.

Private per phone: your gift's true contents, your brief peek window, your accept/challenge decision. A single passed phone would expose every secret gift and kill the memory tension entirely.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Gift{ id, trueLabel, claimLabel, holderId }`, `Player{ id, strikes, peekExpiresAt }`. Phase machine: DEAL → (PASS → RESOLVE)* → END. The server is the sole holder of `trueLabel`; clients receive only `claimLabel` unless they're in an active peek window, when the server sends `trueLabel` with a server-enforced 2s expiry (never trust client timers — the peek is a server-scheduled reveal-then-redact). Challenge resolution is a server compare of `trueLabel === claimLabel`. Hard part: fair, tamper-proof peeks — the reveal must come from and expire on the server so a player can't freeze or screenshot around the memory pressure (v1 accepts screenshot risk, just enforces timing).

## v1 scope
- 3 players, one small deck (~8 gift types), one game to 2 strikes.
- Fixed 2-second server peek.
- Lie labels chosen from the visible gift set (no free text).

## Out of scope
- Free-text bluff labels, custom gift decks.
- Screenshot/anti-cheat hardening.
- Score history, multiple simultaneous gifts per player.

## Risks & unknowns
- 2 seconds may be too short/long — needs playtest tuning.
- Very memorable gift art could defeat the forgetting; abstract/absurd items help.
- Turn-order clarity on a small TV with 5 players.

## Done means
Three phones join; each is dealt a gift it sees for exactly two server-timed seconds then loses; a player passes with a truthful-or-lie claim shown on the TV but never the true contents; the receiver accepts or challenges; the server correctly assigns a strike; play continues until someone reaches two strikes and the TV declares a winner.
