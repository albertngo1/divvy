## Overview
Salient is a 3-5 player concurrent-room party game that turns Colonel Blotto — the classic hidden-allocation battle — into a clean, simultaneous, phone-native reveal. For groups who enjoy a quick bluff-and-read standoff with a dramatic all-at-once flip.

## Problem
Blotto-style 'secretly divide your forces across contested fronts, then reveal' is a brilliant tabletop tension, but in person it's clumsy: players scribble allocations on paper, someone inevitably peeks, totals must be checked by hand, and the reveal is a slow one-by-one slog that kills the simultaneity the whole game depends on. Private phone state is the natural home for it — every player allocates in secret, at the same time, and the math is instant.

## How it works
The **host TV** shows five neutral 'fronts' (Bakery, Harbor, Rooftop, Tunnel, Vault) as empty columns, plus a countdown timer. Nothing about anyone's plan is visible.

Each **phone shows privately**: twenty soldiers to distribute and five sliders/steppers (one per front), a live 'remaining troops' counter, and a LOCK IN button. You silently commit however you like — 20 on one front, or 4-4-4-4-4, or a sneaky 5-5-5-5-0 — hoping to *out-guess* where opponents stacked. You never see anyone's board until reveal.

When all phones lock (or the timer expires, auto-locking current allocations), the TV flips every front simultaneously: for each column, whoever committed the most troops *wins that front* (ties = no one). Win the majority of fronts (3 of 5) to win the round. The reveal is the whole show — the Vault everyone abandoned, the front three people over-defended. A one-tap 'call your shot' before locking (predict which fronts you'll win) adds a bragging bonus.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{players[], fronts[5], phase, deadline}`, `Player{id, allocation[5], locked}`. Sync is simple because it's turnless-simultaneous: phones send `allocation` updates (or just the final locked array) privately to the server, which validates `sum <= 20` and hides every board until the phase flips. The **genuinely hard part is trustworthy simultaneity**: the server must guarantee no allocation is revealed — even to the host — until *all* players are locked or the deadline fires, and must resolve per-front winners and ties deterministically before broadcasting a single synchronized reveal frame so no one sees a partial flip. Server-side validation also prevents a client from over-committing.

## v1 scope
- 3 players, one room code
- Exactly 5 fronts, 20 troops, one round
- Simultaneous private allocation + synchronized single reveal
- Winner = most fronts (ties = neutral)

## Out of scope
- Multi-round matches, carry-over armies, escalating budgets
- The 'call your shot' prediction bonus
- Uneven troop counts / handicaps
- Chat, taunts, avatars, sound

## Risks & unknowns
- With 3 players and 5 fronts, is one round strategically rich or shallow? May want best-of-3.
- Deadline behavior: auto-locking a half-set board could feel unfair — needs a clear 'you didn't finish' state.
- Is the reveal dramatic enough with only three boards, or does it need 5 players to sing?

## Done means
Three phones join via code; each privately allocates 20 troops across 5 fronts with local validation; on all-locked, the TV reveals all three boards at once, marks the winner of each front, and declares whoever took the majority of fronts — with no allocation visible to anyone before that synchronized reveal.
