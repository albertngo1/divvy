## Overview
Spine is a 3-6 player concurrent-room writing game for a TV-plus-phones setup. The room collaboratively authors one short poem, one line per player, and the finished poem is exported as a saveable keepsake. The catch: the *first letters* of the lines, read top to bottom, secretly spell a hidden word (an acrostic 'spine'). No single player knows the whole word — each only knows the letter they're forced to start with.

## Problem
Group poetry apps are either free-for-all mush or turn-based tedium where you stare at a passed phone. There's no elegant reason everyone needs their own screen, and no shared object to keep at the end. Spine gives every phone a private constraint that only makes sense simultaneously and blind, and produces one artifact worth screenshotting.

## How it works
The host TV picks a secret spine word (e.g. MOTH) sized to the player count and a loose theme ('a letter to the sea'). Each phone PRIVATELY shows: (a) the one letter this player's line must begin with, (b) the theme, and (c) a live 'stub' — the last few words of the line slotted directly above them, pushed server-side so lines can chain, but NOT the other players' full lines. The host TV shows only anonymized progress dots and the theme — never the letters, never the text-in-progress. Everyone writes their line simultaneously under a 90-second timer. On lock, the server assembles lines in slot order and reveals the full poem on the TV with the acrostic column glowing. Win condition is the artifact, not points: the poem exports as a formatted PNG keepsake. Optional flourish — before reveal, each phone guesses the hidden spine word from the assembled poem; a coherent poem where nobody can back out the word is the group's trophy.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room { spineWord, theme, slots: [{playerId, forcedLetter, text, locked}] }. Each phone subscribes only to its own forcedLetter and a derived 'stubAbove' (last 6 words of slot i-1), recomputed and pushed on every keystroke-debounce of the neighbor. The genuinely hard part is the live stub bleed: forwarding a redacted slice of the adjacent slot in near-real-time without leaking the full line or the neighbor's forced letter, plus validating first-letter compliance server-side before lock. Reveal is a single broadcast of the assembled poem; PNG render is client-side canvas on the host.

## v1 scope
- 3 players, one round, fixed 4-letter spine word from a small wordlist
- Forced-letter assignment + theme prompt per phone
- Simultaneous 90s write with one live stub-above line
- Server first-letter validation + assemble + TV reveal with glowing acrostic
- Host-side PNG export

## Out of scope
- Guess-the-spine-word scoring phase
- Variable line counts / multi-stanza poems
- Rhyme/meter assistance
- Accounts, galleries, persistence beyond the exported PNG

## Risks & unknowns
- Forced letters may make natural lines hard (X, Q); need a curated wordlist
- Blind chaining might produce incoherent poems that don't feel like a keepsake
- Stub-bleed sync could leak too much or too little context

## Done means
Three phones each receive a distinct forced letter, write blind under a timer with a live stub from the line above, and the host TV reveals one assembled poem whose first letters spell the secret word, exportable as a PNG — with no per-phone leak of others' full lines during writing.
