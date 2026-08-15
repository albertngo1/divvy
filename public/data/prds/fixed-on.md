## Overview

A 4-player, one-sentence party game where the shared screen shows a sentence the room co-wrote anonymously, and each phone privately renders one attention head of a tiny transformer reading that sentence. Attention entropy is the stake: a head that locks hard on one word pays big, a head that smears across everything pays almost nothing. For groups who liked the idea that a language model is full of small weird animals, each with its own fixation.

## Problem

Every "LLM party game" so far treats the model as an oracle that scores your writing. Nobody has let the room look *inside* the same forward pass from four different windows. Attention heads are the best-shaped hidden information in the whole stack: individually legible (this one always looks at the previous token; that one hunts for the subject noun), collectively unshareable, and genuinely surprising even to people who know how transformers work.

## How it works

1. Host TV shows a stem: `The night before the wedding, the ___ ___ ___ ___.`
2. Each of 4 phones privately types **one word**. Submissions are blind and simultaneous.
3. Host shuffles the four words into the four slots and displays the completed sentence — **authorship hidden**.
4. Host tab runs one forward pass of distilgpt2 (transformers.js, `output_attentions: true`).
5. Each phone is assigned a different, pre-vetted `(layer, head)`. Privately it shows: a horizontal bar per word of the sentence (attention mass from the final token), the head's entropy in bits, and a certainty dial — **no author names, ever**.
6. Ninety seconds of open talk. You may say anything: "mine is welded to slot 2." You may lie.
7. Each phone privately answers one question: **whose word is my head fixated on?** Payout = correct × (H_max − H_head), rounded to whole bits. A 0.4-bit laser head is worth 4 points; a 2.8-bit fog head is worth ~0.
8. TV reveals authorship, all four attention pictures side by side, and the scores.

The squeeze: to get others to name their word you have to describe your head's gaze, but describing it points people at your own word.

## Technical approach

Host browser tab is the compute node and the display; phones are dumb PWA clients over a PartyKit Durable Object. Data model: `Room { stem, slots: [{word, authorId}], assignments: {playerId → [layer, head]}, bets, phase }`. The host runs inference locally (~80ms on distilgpt2, 6 layers × 12 heads), extracts the last row of each head's attention matrix, aggregates sub-word tokens back to whole words, computes Shannon entropy per head, and pushes **only that player's row** to each phone. The server is authoritative for phase and bets; attention payloads are per-socket, never broadcast.

Hard part is not sync — it's **head casting**. Most heads in a small model are boring positional heads that always stare one token back, which makes four phones show near-identical pictures and the deduction collapses. v1 needs an offline vetting script that runs 200 candidate sentences through all 72 heads and picks a set of 4 with maximally divergent argmax positions and a spread of mean entropies. Second hazard: word-to-token aggregation (sum mass, don't average, or long words look interesting for no reason).

## v1 scope

- Exactly 4 players, one stem, one round, one bet.
- One hardcoded stem and one hardcoded set of 4 vetted heads.
- Bar chart + a single bits number on the phone. No animation.
- Scores printed as text on the TV.

## Out of scope

Multiple rounds, head re-draws, cross-round leaderboards, model choice, showing the full attention matrix, mobile inference, any player count other than 4.

## Risks & unknowns

Heads may prove too correlated on short sentences — mitigation is a longer 12-word stem. The gaze may be uninteresting (everything stares at token 0, the attention sink) — v1 masks position 0 out of the distribution and renormalizes. Non-technical players may bounce off the bar chart; the phone should say "your gremlin is staring at word 3" above the chart, not below it.

## Done means

Four phones join, each types a word, the TV shows one sentence, each phone shows a visibly *different* attention picture of it, all four bets resolve, and the scoreboard demonstrates at least one player winning big off a low-entropy head and one player earning under 1 point off a high-entropy one — in a single playthrough under four minutes.
