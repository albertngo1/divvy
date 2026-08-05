## Overview
A 3–4 player cooperative shouting game for a living room with a TV and everyone's phone. Each player is issued a tiny private vocabulary — the only words they are allowed to speak aloud — and a private work order built almost entirely out of words they *don't* own. To get anything done, you must talk around the word you need until the person who owns it recognizes it as theirs and says it for you.

## Problem
Spaceteam's fun is the panic of relaying a token you can read but can't touch. Twenty imitators later, the token is always a *control*. Nobody has made the token the **utterance itself**. Taboo already proved that describing a word you can't say is funny; nobody has made "who is allowed to say this word" an asymmetric, per-player, real-time resource. That's the gap.

## How it works
**Privately, on each phone:** your LEXICON — 8 words, large, tappable (e.g. PURGE, STARBOARD, COIL, AMBER…). Below it, your ORDER QUEUE — two orders, each a 3-token sequence like `PURGE / STARBOARD / COIL`. Tokens are colored: green if the word is in your lexicon, grey if it isn't. Every word in the game is owned by exactly one phone.

**On the host TV:** three ORDER SLOTS, showing only the tokens accepted so far (`PURGE ▸ ___ ▸ ___`), a countdown per order, and a hull-integrity bar. The TV never reveals who owns what.

**The loop:** you hold an order needing STARBOARD, which you cannot say. So you describe it — "the side that isn't port!" Whoever's lexicon contains STARBOARD must self-identify, tap it, and say it aloud. The tap is what registers with the server; the saying is what makes it a party game. Tokens must arrive in sequence, so the room ends up half-yelling riddles at each other while three orders decay at once. Wrong token in a slot = hull damage. Saying a word you don't own = any player can hit FLAG, which costs the room time and puts your name on the TV.

## Technical approach
PartyKit Durable Object per room; host tab and phone PWAs on one WebSocket each. State: `{players: {id, lexicon[], orders[]}, slots: [{orderId, accepted[], deadline}], hull}`. Server is authoritative: `TAP {word}` is validated against the tapper's lexicon *and* the next open token of any live slot, then broadcast as a slot delta. Phones render optimistically and reconcile.

The genuinely hard part isn't the network — it's the **word-set generator**. Lexicons must partition cleanly (one owner per word), every order must span at least two owners, and every word must be describable without using its own root. v1 hand-authors 40 words across 5 fixed lexicon decks and shuffles which player gets which.

## v1 scope
- 3 players, one round, 3 minutes, fixed 40-word deck.
- Two orders per player, three tokens each, one active slot per player.
- FLAG button, hull bar, win/lose screen.
- Room code join, no accounts, no reconnect.

## Out of scope
Speech recognition to auto-detect forbidden words; scoring across rounds; 5+ players; word packs; audio effects beyond a buzz.

## Risks & unknowns
Self-identification latency — if owners are slow to realize a description points at their word, the game stalls instead of panicking. Mitigation: a 10s hint pulse that flashes the owner's word. Also: lexicons might be too easy to memorize by round two.

## Done means
Three phones and a TV; a round where at least one order is completed entirely through verbal description, with zero tokens entered by their own order-holder, and the room is audibly shouting.
