## Overview

A 4-player, eight-minute card game where the cards are dealt by a language model. Everyone shares one sentence growing on the TV; each phone holds a private hand of six words whose value swings, live, with every word appended. For groups who like a tight simultaneous-reveal card game more than they like writing jokes.

## Problem

Word games hand you a static rack — Scrabble tiles don't get better while you sit there. And LLM party games treat the model as author or referee. Nobody has made it the *deck*. The itch: a hand whose worth visibly moves in front of you, where the only steering wheel is spending your ripest card.

## How it works

The TV shows an opening stem: *"The night before the wedding, "*. The host computes the model's next-token distribution, filters to single-token whole words (leading space, alphabetic, stopwords removed), takes the top 60, and deals **disjoint** 6-word hands to the four phones — shuffled, so nobody knows their cards' ranks.

Each phone privately shows its six words as bars. A bar's length is that word's probability *given the sentence as it currently stands*, recomputed after every append. You see your own hand heating and cooling. You see nothing of anyone else's.

Each turn all four players privately pick one card and lock. The host evaluates the four played words against the current position; the highest-probability one is appended to the sentence on the TV and its owner banks 100×p — and that card is spent, gone from their hand. The three losing cards return to their owners, never revealed. Losing costs nothing and leaks nothing.

Seven turns, then the sentence is read aloud and the biggest bank wins. The bind: a word only ripens if the sentence walks toward it, and the sentence only walks where the winner drags it — so buying the steering wheel means burning your best fruit.

## Technical approach

Host tab runs distilgpt2 via transformers.js on WebGPU. One forward pass per turn over the current prefix yields the full softmax — every phone's heat for every one of its six cards is a *lookup* in that same vector, not 24 separate inferences. This is what makes live private heat cheap.

Room state in a Durable Object: `{ prefix[], turn, hands: {pid: [{word, tokenId}]}, plays: {pid}, banks }`. The server owns the hands and unicasts each hand plus its heat only to its owner. Sync is lockstep: server waits for four plays or a 20s clock, asks the host to evaluate, receives a `{word: p}` map, resolves the winner, broadcasts the new prefix and banks.

Hard parts: word↔token alignment (a multi-token word has no single softmax entry — v1 deals only single-token words); and the fact that the host tab is both renderer and authority on probability, which v1 simply trusts.

## v1 scope

- Exactly 4 players, one sentence, seven turns
- One hardcoded stem, 6-card hands, no redraws
- distilgpt2 only; ties broken by lowest seat index
- No reconnect, no lobby, no animation polish

## Out of scope

Multiple rounds, custom stems, discard/redraw, teams, spectator betting, punctuation cards, model swapping, decay rules on held cards.

## Risks & unknowns

Degenerate distributions: after a bland stem the top-60 is all function words, so stopword filtering must be aggressive or every hand is interchangeable. Dead hands are the real failure — mitigate by dealing 2 cards from ranks 1–20 and 4 from ranks 20–60 so every hand holds something live. One player's card may dominate all seven turns. distilgpt2 will drift into nonsense by turn five; that's probably funny, but it might just be dull.

## Done means

Four phones each show six private heat bars that visibly move after every append; seven turns resolve without a stall; the finished sentence is readable aloud; final banks differ by more than rounding; and a network-log inspection confirms no phone ever received another phone's hand payload.
