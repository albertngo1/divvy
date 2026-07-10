## Overview
Buddy System is a silent mutual-pairing game for 4 players around a shared host screen, each holding a phone. The room must resolve into perfect pairs where both people chose each other—no talking, no gesturing agreements, just reading who wants whom.

## Problem
The classic 'everyone point at someone on the count of three' bit is one-shot and fully public: you see all hands at once and it's over. There's no *game* in it—no live negotiation, no private stakes, no reshuffling. The itch is a continuous, hidden pairing problem the room has to untangle by feel.

## How it works
Each **phone privately** shows a button per other player. You tap to aim your link at one of them; re-tappable any time, and your current target is yours alone. A pair 'locks' the instant two players are pointing at each other. Your phone shows a subtle *matched / not matched* glow—if you're matched, you already know by whom (you chose them), which is fine and intended.

The **host screen** shows only 'Locked pairs: X / 2' and a heartbeat pulse—never who is pointing at whom. Win when the directed graph is a perfect matching (all four in mutual pairs) held stable for 3 seconds; the host then reveals the two pairs. The drama is the love-triangle: A→B, B→C, C→A means someone must silently yield and re-aim, all resolved by eye contact and nerve.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `room { players: [{id, name, target: playerId | null}] }`. Each tap sends `{target}`. Server recomputes: a pair is mutual iff `target[a]==b && target[b]==a`; counts locked pairs; checks perfect matching. It broadcasts to the host only the locked-pair count, and to each phone only *its own* matched boolean. Genuinely hard part: real-time stability—pairs form and dissolve rapidly during reshuffles, so a full perfect matching must hold 3 seconds to fire, debounced to avoid win-flicker, while never leaking any player's live target before the win.

## v1 scope
- Exactly 4 players, single round
- Target = perfect matching (2 mutual pairs)
- Host shows locked-pairs count + pulse + win reveal
- No scoring beyond time-to-solve

## Out of scope
Odd player counts, alternative win-shapes (cycles, unanimous focal pick), multiple rounds, reconnection, scoreboards.

## Risks & unknowns
With 4 players it may resolve too fast to feel like a game—6 might create better deadlock drama. Body language leakage borders on 'talking': glancing is allowed but may make it trivial; a no-eye-contact variant might be needed. Stable non-winning states (all pointing in a 3-cycle plus one) could stall indefinitely.

## Done means
Four phones join; each privately aims a link; the host counts Locked 0/2 → 2/2 as mutual pairs form; when both pairs hold mutual for 3 seconds the host flashes WIN and reveals the two pairs—and no phone or host ever displays another player's live target before the win.
