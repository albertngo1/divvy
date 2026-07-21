## Overview
A talking hidden-role game for 4-6 players around one shared sentence. Every phone displays the identical line of text, but with exactly one word **bolded** — and one player (the imposter) has a *neighboring* word bolded instead. Players read the line aloud, one at a time, stressing their bold word naturally, then vote on who emphasized the odd one.

## Problem
Prosody carries meaning: "I never said she stole my money" has seven meanings depending on which word you lean on. No party game weaponizes stress. And most social-deduction games hinge on information you *have vs. lack* — here everyone holds the same words, so the only tell is a single audible flicker of emphasis you can't take back once you've spoken.

## How it works
Roles are assigned server-side. N-1 players (the crew) all get the same word bolded; one imposter gets an adjacent word bolded. Sentences are curated so a one-word stress shift genuinely flips meaning but stays deniable.

**Each phone shows PRIVATELY:** the full sentence with *your* single bolded word; a tap-to-reveal one-line note on what that emphasis implies (so you can defend yourself in discussion without naming the word); and, after reads, a vote panel of seats.

**The host screen shows (shared):** the round title, whose turn it is to speak (one highlighted seat at a time), a "reads remaining" counter, then the vote tally and reveal. Crucially it **never shows the sentence text**, so listeners must actually listen — no reading along.

Flow: shuffled turn order → each player reads the line once → open discussion → simultaneous private vote → host reveals the imposter and whether the crew caught them.

## Technical approach
Host browser tab + phone PWA clients + an authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `room { players[], sentence, crewWord, imposterSeat, imposterWord, phase, votes{} }`. On start the server assigns roles and pushes each phone *only its own* word payload. Turn order and phase transitions broadcast to all. This is turn-based, so real-time sync is easy — the genuinely hard part is **content**: authoring a sentence bank where a one-word emphasis shift is audible yet deniable, and choosing imposter-word adjacency subtle enough to fool but not impossible. v1 does no audio capture; a "done reading" tap advances turns.

## v1 scope
- 4 players, one round
- One sentence, one read per player, one vote, host reveal
- Curated bank of ~10 stress-sensitive sentences
- Manual "done" tap after each read
- Binary outcome: crew caught the imposter or didn't

## Out of scope
- Any audio analysis of actual spoken stress
- Multiple rounds, scoring streaks, leaderboards
- Player-authored sentences
- Replay / recording of reads

## Risks & unknowns
- People read flatly and produce no signal (mitigate: on-screen coaching + expressive sentences)
- Imposter word too obvious or too subtle to detect
- Non-native speakers disadvantaged by English stress patterns

## Done means
Four real phones each show the same sentence, exactly one with a different bold word; after each player reads aloud and casts a private vote, the host reveals the imposter and whether the group caught them — playable start-to-finish over WebSocket on real devices.
