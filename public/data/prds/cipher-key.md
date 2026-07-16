## Overview
Cipher Key is a 4-6 player hidden-role decoding party game. The shared host screen (TV/laptop) displays a single coded message — a row of abstract glyphs. Each player's phone privately holds a decoder legend mapping glyph → word. The whole room decodes the *same* message, but one imposter's legend has been subtly corrupted. It's for people who like Werewolf's paranoia but hate that most players just sit there knowing nothing.

## Problem
Hidden-role games usually make the imposter *act* — bluff, lie, perform. That rewards extroverts and punishes everyone else. And any game where the secret info is 'read this card' collapses the moment a phone is passed around. Cipher Key hides a private *lookup table*, so the imposter sincerely believes a different message and generates natural tells without acting at all.

## How it works
The host shows an 8-glyph sentence, e.g. `△ ◐ ✦ ▽ ◨ ✦ ● ⬡`. Each phone PRIVATELY shows a scrollable legend (glyph→word). Honest players share one identical legend; the imposter's legend swaps 2-3 entries (e.g. `✦`=river for everyone, but `✦`=fire for the imposter). Players decode silently for 30s. Then two clue rounds: each player must describe the message's *meaning* aloud WITHOUT speaking any decoded word verbatim (paraphrase/theme only). Honest players want to say enough to align — but not so much they hand the imposter the true decode. The imposter, reading a genuinely different sentence, drifts. After the rounds, each phone PRIVATELY submits a vote; the host reveals the imposter and the swap.
Private per-phone: your legend. Shared host screen: the glyph message, phase, timer, and final reveal only.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Cloudflare Durable Object over Tailscale Serve). Data model: `Room{code, players[], phase, message: glyph[], legends: {playerId: {glyph:word}}, votes}`. Server generates one canonical legend, clones it to all honest phones, then mutates 2-3 entries for the chosen imposter. Each legend is pushed ONLY to its owner — never broadcast — so no phone can inspect another's. Sync is phase/turn-based (lobby→decode→clues→vote→reveal), not sub-frame, so it's trivial. The genuinely hard part is content authoring: curating glyph/word sets where the imposter's swaps land on glyphs that actually appear AND produce a plausible-but-divergent paraphrase rather than obvious nonsense.

## v1 scope
- 4 players, exactly one imposter, one round
- One hardcoded message + one curated legend + one fixed 3-glyph swap set
- Emoji/unicode glyphs, text-only
- Manual host phase advance, simple majority vote + reveal

## Out of scope
- Dynamic legend/message generation, multiple imposters, cross-round scoring, images, difficulty tuning, the 'no verbatim word' rule being auto-enforced (honor system in v1).

## Risks & unknowns
The paraphrase-without-verbatim rule may confuse first-timers. If the imposter realizes their message is incoherent they might stall (a tell — acceptable, but could feel bad). Swap count needs balancing: too many and they're instantly obvious, too few and nothing diverges.

## Done means
Four phones each show a legend, the imposter's differs by exactly 3 entries and no phone can see another's, the group runs 2 clue rounds off the shared glyph message, everyone votes on their own phone, and the host reveals the imposter and whether they were caught — all state server-authoritative.
