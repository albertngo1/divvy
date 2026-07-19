## Overview
Underhand is a phone-native adaptation of **Skull (Skull & Roses)** for 3-6 players: a tiny, vicious bluffing microgame where the whole tension lives in a stack of discs nobody else can see. Host screen is a TV/laptop; each player uses their phone as a private controller.

## Problem
Skull is one of the purest bluffing games ever made, but it needs coasters and disciplined hidden placement, and at a table it's fiddly to keep stacks honestly secret. Phones make hidden, ordered, per-player stacks trivial and tamper-proof — and let the host animate the flip reveal with real drama.

## How it works
Each player is privately dealt **3 Roses + 1 Skull**, visible only on their phone. **Placement phase:** in turn order, a player either taps to add one of their discs face-down onto their own growing stack, or opens the **bid**. The host TV shows only stack *heights*, never contents. **Bidding:** the opener declares a number N ("I will flip N discs, all Roses"); others raise or pass around the table. The highest bidder must flip N discs, **always starting with their entire own stack top-down first**, then choosing opponents' top discs one at a time. Each flip animates on the TV. Flip N Roses = win the round; flip a Skull = bust and lose a disc.

Private to each phone: your remaining disc inventory, your stack's exact contents and order, and whether you've committed your Skull yet. Shared on the TV: heights, current high bid, live flip reveals, and win/bust.

## Technical approach
Authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `player{ id, name, inventory:[discType], stack:[ordered discIds] }`, `room{ phase, turnIdx, bidder, currentBid, flipQueue }`. The server is the sole source of truth for hidden disc types — clients receive only heights until a specific disc is flipped, at which point the server broadcasts that reveal to everyone. Sync is turn-gated: placement appends to your private stack, bidding is a server-arbitrated raise/pass ladder, flipping is a server-driven one-disc-at-a-time reveal. Hard part: guaranteeing no hidden contents ever reach an opponent's client before a flip (audit the wire), plus clean turn arbitration on flaky phone connections.

## v1 scope
- 3 players, fixed 3 Roses + 1 Skull each
- One round only: ends at the first successful bid **or** the first bust
- No match-to-2-wins, no disc-loss elimination
- Host TV shows heights + flip animation; phones show private discs

## Out of scope
- Multi-round match play and elimination
- Reconnection / spectators
- Emotes, cosmetics, sound design beyond a flip sting

## Risks & unknowns
- Sequential turns can drag on phones — add a per-turn timer
- Bluff tension leans on tells; compensate with a bid clock and tap-emotes
- Bid-ladder UI must make "flip your own stack first" legible to newcomers

## Done means
Three phones join; each sees its own hidden discs; players build stacks the others cannot inspect (TV shows only heights); a bid resolves with flips animating one at a time on the TV; a Skull flip correctly busts the bidder — and a wire audit confirms no hidden disc type reached any client before its flip.
