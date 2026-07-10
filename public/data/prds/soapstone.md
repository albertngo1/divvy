## Overview
Soapstone steals the *Souls-like* asynchronous message-and-ghost system — those cryptic orange scrawls ("try jumping", "amazing chest ahead", "liar ahead") strangers leave on the ground — and squeezes it into a phone-party gauntlet for 3–6 people in one room who love a little friendly treachery.

## Problem
Co-op party games are either fully shared (everyone stares at one screen) or fully solo (no reason to be together). The Souls message system is the perfect middle: strictly private play, but a thin, deniable channel of communication where the delicious question is *should I trust the stranger who left this?* Nobody has turned that into a party toy.

## How it works
Each phone privately runs the SAME short hazard gauntlet — a 12-tile corridor of hidden traps (spike, pit, fake floor, ambush). You advance tile by tile; each step you pick an action from a fixed set (STEP, JUMP, WAIT, PROBE). A wrong action at a trapped tile = death, and you drop a **bloodstain** at that tile.

At each tile you clear, your phone offers to leave ONE message, composed *only* from a Souls-style template grammar: ["try" | "beware" | "no" | "praise the"] + ["jumping" | "waiting" | "the pit" | "ambush" | "liar"]. That message is stamped to that tile — but you never see it again. It surfaces PRIVATELY on the phone of whoever reaches that tile next, alongside a rating count of prior players who found it helpful. Messages can be honest lifesavers or gleeful lies.

The **host screen** is the graveyard: a live heatmap of the corridor showing anonymized bloodstains piling up at each tile and a ticker of who's furthest. Nobody's private run or action choices are visible there.

Round ends when everyone dies or clears. Score = distance reached + "helpful" votes your messages earned − "misleading" votes.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object per lobby; Socket.IO over Tailscale Serve as fallback). Data model: `Room{seed, players[], tileMessages: Map<tileIdx, Message[]>, bloodstains: Map<tileIdx,count>}`. Each `Player{cursor, alive, votesEarned}`. The gauntlet layout is derived deterministically from `seed` so every phone shares one trap map without leaking it. The genuinely hard part is *ordering*: messages must appear on the next arriving player, so the server timestamps arrivals and serves the freshest message-per-tile the requester hasn't authored. Latency is forgiving — it's turn-paced, not twitch.

## v1 scope
- One 12-tile corridor, one seed, one round.
- 3–6 players, 4 actions, 4 trap types.
- Fixed 10-word message grammar; one message per cleared tile.
- Host graveyard heatmap + final scoreboard.

## Out of scope
- Multiple biomes, boss tiles, persistent profiles.
- Free-text messages (grammar only — keeps it fast and deniable).
- Matchmaking beyond one local lobby.

## Risks & unknowns
- Is the message grammar expressive enough to enable real trust/betrayal without being either useless or fully readable? Needs playtest tuning.
- Fast clearers outrun the message pool (empty tiles). Mitigate with seeded "NPC" decoy messages.

## Done means
5 phones join one lobby, each plays its own hidden run, a message one player leaves demonstrably appears on the next arriver's phone (helping or misleading them), the host graveyard fills with bloodstains, and a final score reflects distance plus message votes.
