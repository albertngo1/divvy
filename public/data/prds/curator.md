## Overview
Curator is a 3–5 player hidden-agenda game where the group collectively hangs a small gallery wall — the shared keepsake artifact — while each player secretly steers it toward their own private theme. The win condition is anonymity: your taste makes it onto the wall, but nobody pins the theme on you. For groups who like light social deduction but want to end with an *object*, not a body count.

## Problem
Hidden-agenda games (Codenames-adjacent, secret-objective drafts) almost always resolve to points, and their "boards" evaporate at game end. The itch: a bluffing game where the tension is *staying unreadable*, and the residue is a curated wall you'd actually screenshot — an artifact the whole table built without admitting what they were each doing.

## How it works
The host screen shows a **tile pool** of ~16 pieces (public-domain paintings or bold object-emoji tiles) and **4 empty frames** on a gallery wall. Each phone privately receives one **secret theme card** drawn from a known deck (e.g. *round things, blue, animals, faces, symmetry, red, night, hands*). Every tile is pre-tagged with which themes it satisfies (authored data), and most tiles satisfy 2–3 themes — so no vote is a clean tell.

Play is 4 **nomination rounds**. Each round, every phone **privately and simultaneously** taps one tile to nominate. When all lock in, the host reveals the vote tally, the top tile is **hung** (fills a frame, leaves the pool), ties broken by server coin-flip. Your phone shows only *your* secret theme and the live pool; the host shows only the wall and anonymized tallies — never who voted what. You want ≥2 hung tiles matching your theme, but pushing too hard makes your theme obvious.

After 4 tiles hang, the wall is titled and saved as a **keepsake PNG**. Then a **private accusation phase**: each phone secretly assigns a theme (from the known deck) to every *other* player. Scoring is binary and personal — **you win if the wall contains ≥1 tile matching your theme AND no one correctly guessed your theme.** No aggregate leaderboard; the shared win is simply that the wall got made.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ code, players[], pool: Tile[], wall: Tile[], round, secretThemes:{playerId}, votes:{playerId:tileId}, accusations:{playerId:{targetId:theme}} }`; `Tile{ id, img, themes[] }`. Sync: phones send `nominate(round, tileId)`; the DO buffers all votes, resolves the round atomically, and broadcasts only anonymized tallies + the hung tile. Secret themes and per-player accusations are stored server-side and never echoed to other clients. The genuinely hard part is **information containment** — the server must be the single source of truth for who-voted-what and must broadcast *only* aggregate tallies, so a sniffing client can never see another phone's vote or theme; reconnects rehydrate public wall-state only.

## v1 scope
- 3 players, one 16-tile pool (emoji tiles), 8-card theme deck, 4 nomination rounds.
- Blind simultaneous single-vote per round; anonymized host tally.
- One accusation phase; per-player win check; keepsake wall PNG export.

## Out of scope
- 4–5 players, curated painting sets, tiles satisfying weighted/partial themes.
- Persuasion/chat mechanics, multi-round matches, streaks, ELO.
- Accounts, remote play beyond one room code.

## Risks & unknowns
- Balance of tile-to-theme tagging: too clean and themes are obvious; too muddy and votes feel random.
- With 3 players the accusation space is tiny — anonymity may be too easy or too hard; needs playtest tuning of deck overlap.
- Simultaneous voting can feel slow if one player dithers; may need a soft round timer.

## Done means
Three phones join, each gets a private theme card, four blind simultaneous nomination rounds hang four tiles with correct anonymized tallies (no vote leakage verifiable in network logs), the accusation phase resolves each player's win/lose privately, and the room downloads a titled gallery-wall PNG — with no points displayed anywhere.
