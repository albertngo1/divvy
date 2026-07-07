## Overview
Crib is a phone-native micro-riff on *Decrypto* for two teams of two. Each team guards four secret keywords that live only on that team's two phones; you give coded clues to your partner while the opposing team eavesdrops and tries to reverse-engineer your words. It's for people who love the cold-sweat tension of transmitting a message in the open, knowing the enemy is listening.

## Problem
Party word games are mostly *everyone shares one screen*. But the best hidden-information games (Decrypto, Spyfall) hinge on *asymmetric* secrets — my team knows something yours doesn't. On a passed phone or shared TV, those secrets leak the instant the wrong person glances over. Nobody has built the clean, humiliatingly-simple version where the phone IS the secure channel.

## How it works
Four players split into Blue and Red. **Privately on each phone:** your team's four keywords, labeled positions 1–4 (Blue phones show Blue's words; Red phones show Red's — never crossed, never on the TV). 

One round: Blue's **encryptor** phone privately reveals a two-digit code, e.g. `3-1`. The encryptor types two clues — one hinting keyword #3, one hinting #1 — which appear on the **host TV** for the whole room. Now two simultaneous private guesses: Blue's **partner** taps the code they think the clues meant (from 1–4), while **both Red phones** privately tap their interception guess for the same code. Server locks all guesses, then the TV reveals: the true code, whether Blue's partner read it (miss = a *miscommunication* mark), and whether Red cracked it (an *intercept* point). 

The private phone is load-bearing three ways at once: your four words must be hidden from opponents *and* shared with your teammate *and* everyone guesses simultaneously without seeing each other. No single shared or passed screen can enforce all three.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `Room{ teams: {blue,red}, phase }`, `Team{ words:[4], memberIds:[2], encryptorId }`, `Round{ code:[a,b], clues:[str,str], guesses:{playerId→[a,b]} }`. Sync is turn-gated, not high-frequency: the genuinely hard part is *the secrecy invariant* — the server must NEVER include Team A's `words` in any payload routed to a Team B socket, and clues must fan out to everyone while guesses stay sealed until all four lock. One leaked word ends the game, so message routing is filtered per-recipient, and locked guesses use commit-then-reveal to prevent last-glance copying.

## v1 scope
- 4 players, fixed 2v2
- One team is encryptor, one round, one two-digit code
- Preloaded 8-word pool (4 per team) from a static list
- TV shows clues + final reveal; phones show private words + guess pad
- Score: one intercept vs one miscommunication, then stop

## Out of scope
- Multi-round scoring races, the full Decrypto 8-round arc
- Teams larger than 2, odd player counts, solo
- Clue legality enforcement, custom word packs

## Risks & unknowns
- Secrecy routing bugs are catastrophic and must be tested adversarially
- One-round tension may feel thin without the multi-round accumulation of intercept data
- Encryptors may give too-easy or unparseable clues; no referee in v1

## Done means
Four phones join, each team sees only its own four words, an encryptor sends two clues to the TV, all four players lock private guesses, and the reveal correctly scores exactly one intercept-or-miss — with a verified log showing no opposing-team word ever crossed the wire.
