## Overview
Ransom is a 3-5 player concurrent-room craft game where each phone is a private tray of cut-out letters and the shared host screen is the layout table. Together you assemble a classic mismatched-font ransom note of a phrase the group chose — the keepsake — and there are no points: you win by completing the artifact, whose deliberate un-attributability (you can't tell who cut which letter) is the thematic payoff.

## Problem
Digital party games almost never leave you with a physical-feeling keepsake, and there's a delightful logistics puzzle hiding in the phrase *no single person can spell this.* Ransom turns collaborative typing into a small heist of cooperation.

## How it works
In the lobby the group secretly agrees on a short phrase (or the host suggests one). The server then partitions the alphabet into disjoint sets and hands each phone a PRIVATE tray of only its owned letters, rendered as ragged ransom-style tiles in random fonts and colors. The host TV shows the target phrase as empty slots. To fill a slot needing "E", only the phone that owns E can tap that tile and send it to the slot — so spelling anything requires everyone. When two players own letters needed in the same word, they must coordinate order and placement live. Because every tile carries a random font, the finished note is genuinely un-attributable. The host assembles the collage in real time; when every slot is filled, the note is done — screenshot or print to keep.

Private vs shared: each phone shows only its own letter tray plus which currently-unfilled slots it can fill (highlighted). The host shows the growing note and remaining slots — never which player placed which letter. The disjoint ownership is what makes a single passed-around phone useless: simultaneous private trays are the entire point.

## Technical approach
Host tab + phone PWA + authoritative WS server. Data model: Room{phrase, slots[]}, Player{ownedLetters[], fontSeed}, Slot{char, filledBy?, tileStyle}. The server validates each placement (does this player own this char? is the slot empty and needing it?) and broadcasts fills to the host. The hard part is concurrent placement conflicts (two players racing the same slot): resolve with server-authoritative first-write-wins plus optimistic UI and rollback. The second challenge is making the typography look handmade, not cheap — deterministic ragged CSS transforms and a random Google-font subset seeded from fontSeed.

## v1 scope
- 3 players, one short phrase (≤12 letters) picked from a host list
- On-screen tap-to-place, 4 fixed fonts
- Ownership assigned AFTER phrase choice to guarantee solvability
- One completed note, screenshot to keep

## Out of scope
Camera letter-capture from real magazines, custom/profanity-filtered phrases, printing, multiple notes, undo.

## Risks & unknowns
A needed letter owned by nobody breaks the game — the server must assign ownership to guarantee the phrase is spellable. Placement race conditions and typography that reads cheap rather than charming are the main unknowns.

## Done means
Three phones each display a distinct private letter tray, the group fills every slot of a shared phrase using only owned letters with the server rejecting illegal placements, and the host shows a completed mismatched-font ransom note the group can screenshot.
