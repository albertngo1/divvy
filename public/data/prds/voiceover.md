## Overview
Voiceover is a 3–5 player hidden-role deduction game where the private channel is *sound*. Each player privately listens (earbuds or phone speaker held to the ear) to what is pitched as "the same" narrated story — a short account of a shared fictional event, e.g. "the night the power went out at Aunt Rosa's." One player's audio is a subtly altered dub: a handful of facts are swapped (the dog was a cat, it was raining not snowing, the neighbor's name was Dev not Theo). Then everyone discusses the night out loud and votes on whose account doesn't fit. The kicker: no one is told they're the imposter — the altered listener sincerely believes their version, and every innocent player is equally unsure whether *they* are the odd one out.

## Problem
Hidden-role games telegraph roles: the wolf *knows* it's the wolf and performs deceit. That's a bluffing skill, not a paranoia experience. Voiceover removes the meta-knowledge entirely, so the table gaslights itself — the funniest social texture in the genre, rarely captured.

## How it works
Host TV (shared): a title card, a synced "press play" countdown, the discussion timer, and finally the reveal graphic. It never shows the story text — the story exists only in ears.

Each phone (private): a single audio file streamed/assigned per player. Four players get the canonical dub; one gets the altered dub. All dubs are the same length, same voice, same cadence — only ~4 nouns/facts differ. A replay button (one replay allowed) and a 5-choice ballot at the end.

Flow: (1) all phones play in sync on the host countdown; (2) 90s open discussion — players retell details, naturally colliding on the swapped facts; (3) each phone votes for who sounded "off"; (4) TV reveals the altered listener and diffs the two scripts. Innocents win by fingering the altered player; the altered player wins by surviving the vote (they had no idea, which makes winning hilarious).

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Room{code, phase, players[], scriptSetId, alteredPlayerId, votes{}}`; each `Player{id, dubUrl, hasReplayed, vote}`. Audio files are 5–10 pre-generated TTS clips per story pack, canonical + altered variants, served from static storage. Sync strategy: server broadcasts a `PLAY_AT(serverTimestamp+2s)` message; clients schedule playback via WebAudio `currentTime` offset to stay within ~50ms — good enough since audio is private, not communal. The genuinely hard part is *authoring* alterations that are deniable-but-decisive: too subtle and no contradiction surfaces; too loud and it's instant. This is content design, not code — needs playtested fact-swap templates (swap a color, a name, a weather state, a count).

## v1 scope
- Exactly 3 players, one story, one altered dub.
- One hand-authored story pack (canonical + 1 altered script).
- Sync-play, 90s timer, single replay, one vote, reveal-with-diff.
- Phone speaker OK; earbuds recommended in copy.

## Out of scope
- Multiple rounds, scoring across games, >5 players.
- Player-generated stories, live TTS, accessibility captions (captions would leak the private text — deliberately excluded).
- Reconnect grace, spectators.

## Risks & unknowns
- Audio leakage: if players overhear each other's phones, the difference is exposed. Copy must push earbuds/spacing.
- Some fact-swaps may never come up in 90s of talk, producing a dud round — needs swaps on "unavoidable" details.
- Hearing-impaired players are excluded by the medium.

## Done means
Three phones sync-play two dub variants within 50ms of each other; after discussion each phone casts a vote; the host reveals the correct altered player and shows the exact swapped facts; the round is decidable by the swaps alone in ≥8 of 10 playtests.
