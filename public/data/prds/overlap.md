## Overview

A cooperative silent word game for three people, a TV, and three phones. Each player holds a private rack of seven letter tiles. Exactly four of those tiles are on **everyone's** rack; the other three are yours alone. Nobody knows which four. The room wins when all three players submit the identical four-letter word — which is only possible using the four shared tiles.

## Problem

Word party games are about vocabulary breadth: who finds the longest, cleverest, funniest word. That's a solo skill performed in public. The itch here is the opposite — a word game where the letters themselves are hidden information, and finding the word is a joint deduction about what's in someone else's hand, with talking banned.

## How it works

The rules are stated up front on the TV: *every word is exactly four letters, no repeats; exactly four of your seven tiles are on all three racks.*

Each phone (private): seven tiles in a per-phone shuffled order, a word slot, a submit button. You cannot see anyone else's rack, ever, in any form.

All three submit simultaneously. The host TV then shows — and this is the only public information in the game — an **A–Z strip**, where each letter carries a count of how many of the three players *used* it this attempt: 0, 1, 2, or 3. Never the words. Alongside it: DISTINCT WORDS (3 / 2 / 1) and the attempt number.

The strip does the work. A letter reading 3 is definitely shared. A letter reading 1 is probably junk on someone's rack — you can strike it off your own mental map. Two attempts usually pin the core four exactly. Then the endgame is pure theory of mind with no further information: T-A-R-E is now known to all, and the room must silently agree on RATE vs TEAR vs TARE. The most *ordinary* word wins, which is a delicious thing to have to bet on without speaking.

Win: all three submit the identical valid word within four attempts. Reveal: the TV flips all three racks face up and the three junk tiles per player get roasted.

## Technical approach

PartyKit Durable Object per room; host tab plus phone PWAs over WebSocket. Server state: `{core: string[4], racks: {playerId: string[7]}, attempt, submissions: {playerId: word}, history}`. Rack dealing is server-side and each phone receives only its own array. Submissions are buffered and resolved only when all three land; the server validates each word against a small dictionary AND against that player's own rack, then emits a single aggregated `{letterCounts: Record<letter, 0-3>, distinctWords, attempt}` event — the words themselves never leave the server. Invalid submissions bounce privately without costing the attempt.

The genuinely hard part is rack generation: pick a core of four letters that spells at least two but no more than four common words, then fill each rack with three junk letters that are disjoint across players and don't accidentally extend the solution space.

## v1 scope

- Exactly 3 players, one round, max 4 attempts.
- One hand-picked core set (T/A/R/E) with hand-picked junk letters.
- ~2,000-word four-letter dictionary, bundled JSON.
- Host: A–Z count strip, distinct-word count, attempt counter, reveal screen.
- Phone: seven tappable tiles, four-slot word, submit, private invalid-word toast.

## Out of scope

Variable word length, 4+ players, scoring, multiple rounds, procedural core generation, reconnect handling, hints.

## Risks & unknowns

The anagram endgame may stall — three people who all know the letters and all pick differently, forever. Cap attempts and accept the loss as funny. Also: strong Scrabble players may deduce the core on attempt one and make the deduction phase vestigial.

## Done means

Three phones each show a seven-tile rack sharing exactly four letters, simultaneous submissions resolve into a single A–Z count strip on the host with no word content leaked, and three identical valid words inside four attempts triggers the rack reveal.
