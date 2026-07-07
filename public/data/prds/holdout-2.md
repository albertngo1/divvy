## Overview
Holdout is a Jackbox-shaped party game for 3–6 players: one host screen (TV/laptop) runs the auctioneer, every phone is a private bidding paddle. It fuses a hidden-value auction with a war-of-attrition silence game. You bid not with money but with your own composure — the last player still silent wins the lot.

## Problem
Party games either reward the loudest person or make silence a dull penalty. Nobody has made staying silent an *active competitive resource* with hidden stakes. The itch: turn a room full of people trying to make each other laugh into a structured game where cracking up has a real, private cost.

## How it works
The host screen reveals lots one at a time (e.g. "THE LAST SLICE," "BRAGGING RIGHTS," "THE AUX CORD"). Each phone PRIVATELY shows that lot's value *to that player only* — a secret 1–10 valuation the game assigned, so different players covet different lots. Your phone shows a big FOLD button and your live silence status.

When a lot opens, everyone is presumed IN and must go silent. Each phone runs its OWN mic (near-field, calibrated to its owner) and drops that owner the instant it detects any vocalization — a laugh, a gasp, a whispered word. Folded players (and already-dropped players) may talk freely, and are actively encouraged to heckle, taunt, and provoke the holders into making a sound. The lot goes to the last holder still silent; ties split value. Fold early on lots you don't want so you can spend your voice sabotaging the ones you do.

The host screen shows only public state: who's still IN (silent), who folded, a running "cracked!" ticker, and the scoreboard — never anyone's private valuation.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room {lots[], phase, holders:Set, folded:Set}`, `Player {id, secretValues:Map<lotId,int>, status, score}`. Each phone runs WebAudio: RMS envelope + a short voiced-frame check; when its owner's level crosses a calibrated threshold it emits `cracked{playerId, lotId, t}` — the phone judges only itself, sidestepping room crosstalk. Server is authoritative on drop order and lot resolution. Sync is low-stakes (event-driven, not frame-locked); the genuinely hard part is per-phone calibration so ambient heckling from *others* doesn't false-trigger your drop — solved with near-field hold-to-play and a 30-frame rolling baseline captured during a silent countdown.

## v1 scope
- 3–4 players, one auction of exactly 3 lots, one round
- Per-phone calibration countdown before each lot
- Server picks secret valuations; mic detects own-owner vocalization; last-silent wins
- Host shows IN/FOLDED/scoreboard only

## Out of scope
- Bluffing folds, re-buys, multi-round tournaments
- Transcription of what was said; leaderboards across sessions
- Tuning heckle 'bait' prompts on folded phones

## Risks & unknowns
- False drops from a nearby loud heckler leaking into your mic (calibration must be tight)
- Is a silent lot fun to watch, or dead air? Heckling must be the engine
- Phones muting/backgrounding audio on lock

## Done means
4 phones join, each sees a different private value for the same lot, all go silent, one player laughs and their phone (only theirs) drops them within ~400ms, and the last silent player is awarded the lot with the score updating on the host screen.
