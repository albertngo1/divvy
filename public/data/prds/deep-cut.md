## Overview
An audio party game for 3-6 people. The background playlist nobody's really listening to becomes a private over/under market: you're not betting on the song, you're pricing your friends' taste. Best for music-nerd friend groups who love arguing about who knows what.

## Problem
At a party the playlist is pure passive consumption — one person DJs, everyone half-hears it. But a room's *collective* recognition of a track is a hidden, bettable quantity: you know what YOU know, and the fun is guessing everyone else. Nothing turns that latent knowledge into a game.

## How it works
The host TV will play a 20-second snippet of each track — but first, the market opens. Each phone PRIVATELY sees a house line the server sets ("O/U 2.5 players will know this") and secretly:
- wagers chips,
- picks **over** or **under**.
Crucially you set this *before hearing the snippet on the reveal* — you're pricing the room from the cover art / a one-word genre hint on your phone alone. Betting locks, the snippet plays on the TV only. On a server-gated 3-2-1, everyone taps "I know it" at once; the TV shows the COUNT (identities optional for spice). Server settles the over/under and pays out.
Host screen: the line, the tally, the running chip leaderboard, title revealed only after settling. Phone: your private wager slider, over/under toggle, your chips.

## Technical approach
Host tab is the only audio source (phones are silent controllers) + phone PWAs + authoritative WebSocket server. Data model: `Room{ tracks[], round, line, players{id->{chips, wager, dir, knew}} }`. Server owns the state machine: set line → open betting → lock → play snippet → open the "know it" tap window → tally → settle. Genuinely hard part: audio lives only on the host so five phones don't blast out of sync, and the simultaneous tap must be server-gated so no one can tap *after* watching others react — a tight, latency-tolerant round clock with server-authoritative timestamps.

## v1 scope
- 3 players, 5 curated 20-second snippets, one playlist.
- Server-provided fixed line per track, tap-to-know (no mic).
- Name-only QR join, single round of 5 tracks.

## Out of scope
- Spotify/Apple Music APIs, custom playlists, dynamic line-setting.
- Mic-based sing-along detection, images beyond a genre hint.

## Risks & unknowns
- Honesty of the "I know it" tap — players may lie; reveal-who mode helps.
- Snippet licensing for anything shipped publicly.
- Over/under on only 3 people is coarse; the fun may need 5+ players.

## Done means
3 phones each place a private over/under wager on a hidden line, the host plays a snippet, players tap simultaneously under a server gate, the server settles the bet and updates chips, and the leaderboard shows a clear winner after 5 tracks.
