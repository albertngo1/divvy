## Overview
Palate is a 3–5 player Jackbox-style drafting party game about building a private wine cellar. The shared TV is the auction floor; each phone is a sommelier's secret notebook. It's for people who love the tension of a booster draft but hate the paper-shuffling and honor-system scorekeeping that hidden-value drafts demand in person.

## Problem
The most interesting drafts are ones where players value cards differently in secret — but in person that means hidden score sheets, constant mental math, and telegraphing your interest by how long you stare at a card. The bookkeeping kills the elegance. Phones can hold each player's private valuation function and tally silently, making asymmetric drafting effortless.

## How it works
The host TV shows a **river of 6 bottle cards**, each with a few visible traits (region, vintage decade, body/tannin icons). Every phone **privately** shows: (1) your secret *palate rubric* — a scoring rule only you see, e.g. "+3 per pre-2000 vintage, −2 per heavy body, +4 if you own 3+ from one region"; (2) your current cellar of won bottles with a live private score; (3) a small token budget for tiebreaks.

Each round is **simultaneous**: every player secretly taps ONE bottle to claim. On reveal, uncontested claims are awarded instantly. **Contested bottles** (two+ players tapped the same one) trigger a one-shot sealed bid from private token budgets — highest bid wins, ties both miss and the bottle is discarded. The river refills; repeat until the deck runs dry (4–5 rounds). Final private scores are revealed on the TV with a flourish. Because valuations are hidden, staring is now free — the only tell is the claim itself.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, one room = one DO). Data model: `Room { riverCards[], phase, round }`, `Player { id, rubricJSON, cellar[], tokens, pendingClaim, pendingBid }`. Rubrics are generated server-side from a template grammar and pushed only to their owner. Sync strategy: claims and bids are collected server-side during a countdown, then resolved atomically and broadcast — clients never see each other's pending taps, only outcomes. The genuinely hard part is **fair simultaneous resolution**: buffering all claims until the timer expires, resolving contested lots deterministically, and animating the reveal on the TV in lockstep so no phone leaks timing. Score evaluation runs server-side against each hidden rubric so no client can inspect another's rule.

## v1 scope
- 3 players, one game of exactly 4 rounds
- 18-card fixed bottle deck, 3 hand-authored rubric templates
- Contested-bottle sealed bid with a flat 5-token budget
- Final score screen on TV

## Out of scope
- Rubric variety beyond 3 templates, custom decks
- Multiple games / matchmaking / persistence
- Animations beyond a basic reveal, sound

## Risks & unknowns
- Rubrics must feel legibly different yet balanced — tuning risk
- Contested-bid frequency: too many stalls the game, too few makes claims trivial
- Players may find hidden scoring opaque; needs a clear end-of-round "why you scored that" recap

## Done means
Three phones join a room, each receives a distinct private rubric, a 4-round draft completes with at least one contested sealed bid resolved correctly, and the TV shows correct final private scores that match hand-computed values.
