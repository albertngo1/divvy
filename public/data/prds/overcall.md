## Overview
Overcall is a 3–6 player concurrent-room party game where an in-browser language model's perplexity is the hidden hand strength in a poker-style confidence auction. Everyone writes one sentence, nobody sees the model's verdict, and then you wager on how well you think you channeled the machine. For groups who like bluffing games (Liar's Dice, Cockroach Poker) but want a fresh source of hidden information.

## Problem
Most 'write a sentence' party games reveal the score immediately, so there's no bluff, no read, no nerve. The itch: what if you had to *bet* on your own writing before the truth came out — and the truth was an alien statistical judgment you can only estimate, never know?

## How it works
The host TV shows a shared topic word (e.g. "elevator"). Each phone PRIVATELY shows a text box; every player writes one sentence containing the topic word, simultaneously and blind. No sentence is ever shown to the room during play.

Each player then privately sees only their OWN sentence and a starting stack of 10 chips. The claim: "I think my sentence is the LEAST surprising to the model (lowest perplexity) in this room." On their phone each player privately wagers 0–10 chips on that claim — an all-pay confidence bet. They can also privately mark a self-estimate slider ("I think mine ranks: top / middle / bottom") purely for their own reference.

The host screen shows only chip-counts committed (anonymized backs), building tension as the pot fills. On reveal, the host runs every sentence through distilgpt2, computes length-normalized perplexity, and ranks them low→high. The single lowest-perplexity author wins the whole pot proportional to what everyone wagered; everyone else loses their bet. A twist band: if you wagered big and finished dead last, you pay a penalty. Then the sentences and their perplexity ladder are revealed for the laughs.

The private-per-phone part is load-bearing: seeing anyone else's sentence would collapse the bluff, and the wagers must be secret and simultaneous.

## Technical approach
Host browser tab runs transformers.js (distilgpt2) for authoritative scoring. Phone PWAs connect over an authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `room{topic, phase}`, `player{id, sentence, wager, chips}`. Phases: WRITE → BET → REVEAL, server-gated so no phone can leak state early. Sync is simple request/response per phase — no real-time streaming needed. Genuinely hard part: perplexity must be deterministic and comparable across short sentences, so normalize by token count and enforce a minimum length to stop one-word gaming.

## v1 scope
- 3–4 players, one topic, one round.
- Fixed 10-chip stacks, single winner-takes-pot.
- distilgpt2 host-side scoring, phones only send strings/ints.
- Reveal ladder + winner.

## Out of scope
- Multi-round tournaments, chip persistence.
- Challenges/re-raises, side pots.
- Model choice or difficulty tiers.

## Risks & unknowns
- Can casual players form any intuition about perplexity to bet on? A one-line calibration example before the round helps.
- distilgpt2 load time on the host tab.
- Degenerate 'the the the' sentences — mitigated by min-length + normalization.

## Done means
Four phones write blind, secretly wager, and on reveal the host shows a correct perplexity ladder; the lowest-perplexity author's chips increase and the pot resolves correctly, all within one WebSocket round-trip per phase.
