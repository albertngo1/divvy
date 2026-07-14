## Overview
Prop is a second-screen party game for 3-6 people watching a short clip together. The host plays the video; each phone is a private betting card. It converts passive co-watching — the thing where everyone half-watches a random video — into a live prop-bet market where you're the only one who knows what you're rooting for.

## Problem
Group video-watching is low-stakes background noise; attention leaks to phones. The itch: give every person a secret reason to stare at the screen, and make their reactions betray them.

## How it works
One round over a preloaded ~60-90s clip.
1. **Deal (private):** each phone receives 3 secret prop cards — crisp observable events ("someone says 'wow'", "a dog appears", "cut to slow-mo"). The pool is authored so some props CONFLICT across players (one bets the dish gets eaten, another bets it doesn't).
2. **Stake (private):** each phone secretly sets a stake per prop and designates one "nap" — its single most confident bet — for a 2x multiplier.
3. **Watch:** the host plays the clip once. Everyone watches the same footage hunting different secret events, reacting honestly or bluffing to throw others off.
4. **Settle:** the host steps prop-by-prop; the table adjudicates hit/miss by majority vote. Payout = stake × rarity, nap doubled.

Private phone shows: your 3 props, stakes, which is your nap — all hidden. Host shows: the clip, then the prop-by-prop reveal exposing who held what (and who groaned when their rival's opposite prop hit).

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). Data model: `room {clipId, phase}`; `player {props:[{text, stake, isNap, result}]}`. The server deals props from a per-clip curated pool guaranteeing at least one conflict pair, and runs a phase machine (deal → stake → watch → adjudicate → payout). Sync is light: playback is host-only; phones need just phase state + a "clip started/ended" signal; adjudication uses live per-prop table votes. The genuinely hard part is CONTENT, not sync — authoring prop pools whose hit/miss is unambiguous and adjudicable, and pairing conflicts so opposite reactions actually emerge at the same instant.

## v1 scope
- 3 players, one hand-picked 60s clip.
- 3 props each drawn from a hand-authored pool of ~12 with one guaranteed conflict pair.
- One round, host taps hit/miss, nap doubling only.

## Out of scope
- Arbitrary YouTube ingestion + auto-generated props.
- Automatic event detection (CV/audio).
- Live streaming, bankroll persistence, multiple rounds.

## Risks & unknowns
- Ambiguous props spark arguments — keep props crisp, adjudicate by majority.
- Auto-authoring props for any video is genuinely hard; v1 stays hand-curated.
- A single clip goes stale on replay.

## Done means
Three phones each get 3 hidden props, set stakes and one nap, watch a clip once, the host adjudicates each prop and computes payouts with nap doubling — and at least one conflicting prop pair produces two players reacting oppositely at the same moment.
