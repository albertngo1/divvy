## Overview
Party Line is a cooperative real-time voice game for 3–6 players in one room: a shared TV/host screen plus each player on their own phone. It's for groups who loved Spaceteam's shouting chaos but want the tension of *listening* rather than reading a prompt.

## Problem
Most "voice" party games actually route coordination through the screen — you read a prompt, you tap, the room's real audio is decoration. The itch: a game where the only wire connecting players is the air, where you fail because you weren't LISTENING.

## How it works
The host builds a hidden routing table and splits it across phones. Each phone privately shows exactly one rule: "When you hear GREEN, shout FALCON." No phone shows the whole chain, and — crucially — no phone tells you when it's your turn. The host injects a start phrase ("GREEN!") on the TV and the human relay begins: whoever's listening for GREEN shouts FALCON, then whoever's listening for FALCON fires next, on down the chain until a token reaches the host's "hang up" word. To keep the room honest, when you fire your SAY phrase you tap a big button; the host verifies it was the valid next hop and advances a progress bar. Later rounds run two tokens at once, so you might hear your cue twice or hear a cue that isn't yours — overload by design. A misfire injects a dead token and the TV "crackles."

Private per phone: your single LISTEN-FOR → SAY rule and your fire button. Shared host screen: the start phrase, live token progress, timer, and failure crackle — never the routing table.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { players[], routingTable: Map<phrase,{ownerId,sayPhrase}>, tokens[{id,currentPhrase,alive}], timer }`. Each phone receives only its own rule over a private channel. On fire, the phone sends `{playerId, sayPhrase}`; the DO checks whether any live token's expected next hop equals that (owner, sayPhrase), updates token state, and broadcasts only progress deltas to the host. The genuinely hard part is adjudicating human timing: taps are asynchronous and lossy, so the server needs a tolerance window plus rules for double-fires and out-of-order taps without desyncing the shared token count — real-time reconciliation with unreliable human actors. No ASR: voice advances the chain socially; the tap only logs it.

## v1 scope
- 3 players, a single token, one ~5-hop chain, one 60s round.
- Fixed word list (colors → callsigns), pre-generated routing table.
- Host shows start phrase, one progress bar, timer, win/crackle screen.
- Phone shows one rule + one fire button.

## Out of scope
- Multiple simultaneous tokens, branching chains, ASR verification, scoring/streaks, custom word packs, reconnect handling.

## Risks & unknowns
- Without ASR a player can tap without speaking, starving the next listener — does social pressure hold? Playtest.
- Room acoustics/crosstalk may make cues unhearable; may need distinct phonetics.
- Is one token too easy and two too chaotic? Tune hop count.

## Done means
3 phones each show one rule; a shouted start phrase propagates by voice through all three and lights "hang up" on the TV within 60s, and a deliberate misfire visibly crackles the line — all state authoritative on the server.
