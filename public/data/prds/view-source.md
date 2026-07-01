## Overview
View Source is a browser-native detective game with no visible UI to speak of. You load a plain webpage — a fake corporate 'about us' site — and the game tells you a crime happened here. Every clue is hidden in the page's guts: `display:none` elements, base64 in data attributes, commented-out HTML, a suspicious `/api/` call replaying in the Network tab, a `debugger` statement guarding a locked door. For web devs, front-end curious folks, and CTF-adjacent puzzle lovers.

## Problem
DevTools is the most powerful reverse-engineering toy most developers use daily and never think of as *fun*. Meanwhile puzzle games invent fake 'hacking' UIs that look nothing like real tooling. View Source inverts that: the real inspector *is* the game board. It also sneakily teaches people to read a page the way an attacker or auditor does.

## How it works
You're told a message was leaked from this company site; find the leaker. Progression is gated by DevTools actions: (1) Inspect a hidden `<div hidden data-note>` to read the first memo. (2) Edit CSS to reveal an element stacked behind another (z-index puzzle). (3) In Network, notice an XHR to `/vault?k=` — replay it with an edited query param to fetch the next chapter. (4) Hit a `debugger;` trap; stepping over it in Sources prints a clue to console. (5) Decode a zero-width-unicode string hidden in body text (nod to the Claude steganography story) using a console snippet the game hands you. Each solved step unlocks the next fragment server-side, so you can't just skip.

## Technical approach
Static site + a tiny stateful backend. Frontend is hand-authored HTML/CSS/JS with deliberately readable-but-cryptic structure. Backend: a small Deno/Hono server exposing `/vault`, `/api/*` endpoints that return chapter fragments only when the right params/headers are present (progress token in a cookie). Clue types map to DevTools panels: Elements (hidden nodes, data-attrs), Console (staged `console.log`/`debugger`), Network (replayable requests, custom headers), Application (localStorage/cookie clues), Sources (a minified script with an obfuscated function to read). Anti-cheat is soft: fragments are server-gated so viewing raw source alone doesn't leak the ending. Hardest part: designing puzzles that are discoverable-but-not-trivial without any in-page hints, and making them robust across Chrome/Firefox DevTools differences.

## v1 scope
- One 5-clue case, ~15 min solve
- Static page + single Deno endpoint with progress cookie
- Clue types: hidden element, CSS reveal, replayable request, zero-width decode
- A 'stuck?' page with graduated hints

## Out of scope
- Accounts, leaderboards, timers
- Level editor / user-made cases
- Mobile (DevTools is desktop-first)
- Anti-cheat beyond server-gating

## Risks & unknowns
- Players who don't know DevTools bounce instantly — need a gentle tutorial clue as step 0
- Cross-browser DevTools quirks
- Determined players read the backend responses out of order; mitigate with per-step tokens

## Done means
A fresh player with basic DevTools familiarity, given only the URL and 'find the leaker,' can solve all 5 clues using only the inspector, and cannot reach the final fragment without completing steps 1–4.
