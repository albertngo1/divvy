## Overview
Snap is a phone-native riff on *Anomia*. Each player's phone privately flips a stream of category cards; when your top card's symbol matches another player's, the server pits just the two of you in a private, buzzing type-race to name something in the *other person's* category. It's for the chaotic-blurting crowd who love Anomia's face-offs but hate hunting for symbol matches by eye.

## Problem
Anomia's fun is the sudden panic of a match — but spotting matches across a table is slow, error-prone, and only ever allows one duel at a time. And its cards are public, so you can pre-scan and cheat the tempo. A phone can watch every card simultaneously, keep your category secret, and run *several duels at once* — things a tabletop deck physically cannot.

## How it works
**Privately on each phone:** your current top card — a category (e.g. "a breakfast food") plus a colored symbol — visible only to you. You tap to advance your own deck at your own pace. The server continuously compares every player's top-card *symbol*. 

When two players share a symbol, **only those two phones vibrate and flip to duel mode**, each privately showing the *opponent's* category. First to type a valid answer wins both cards; loser's deck advances. Crucially, other pairs can be mid-duel at the same instant — the room becomes several simultaneous private shouting-matches. The **host TV** shows only the scoreboard and a live "who's dueling whom" graph — never anyone's category or top card.

Per-phone privacy is load-bearing two ways: categories stay secret so nobody pre-plans, and *parallel concurrent duels among different pairs are impossible on one passed phone*. That simultaneity is the whole texture.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve or a PartyKit room). Data model: `Player{ deck:[cardIds], topIdx, score }`, `Card{ symbol, categoryId }`, `Duel{ a, b, startedAt, winnerId }`, `Category{ id, prompt, acceptList:Set }`. The hard part is real-time fairness: (1) collision detection must re-scan on every top-card change with server timestamps, (2) a player already in a duel is locked out of new matches until it resolves, and (3) race resolution must be deterministic under near-simultaneous submissions — first *server-accepted* answer wins, ties broken by server receipt time. v1 validates answers against a curated per-category accept-list (case/stem-normalized) to avoid LLM latency in the hot path.

## v1 scope
- 3 players, one 12-card deck each from a fixed pool
- 4 symbols, 8 categories, static curated accept-lists
- Play until the first duel resolves and awards cards, then stop
- TV: scoreboard + duel graph; phones: private top card + duel type-pad

## Out of scope
- LLM/fuzzy answer judging, disputes, synonyms beyond the accept-list
- Cascading double-matches (Anomia's chain rule), wild cards
- 5+ players, custom decks, full deck-exhaustion win condition

## Risks & unknowns
- Accept-lists feel unfair when a right answer isn't listed; peer-override may be needed
- Concurrent-duel UX could confuse players about who they're racing
- Typing is slower than blurting — the panic may deflate vs physical Anomia

## Done means
Three phones join and flip private decks, the server detects a symbol collision and buzzes exactly the two matched phones into a private duel, the first valid typed answer is accepted deterministically and awards the cards on the TV — with a second concurrent duel proven to run without cross-talk.
