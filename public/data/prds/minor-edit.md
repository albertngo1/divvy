## Overview
Minor Edit is a 3–4 player game about a Wikipedia article that four people are quietly vandalizing in different directions at the same time. The host screen is the live article. Each phone is a private editor with a private motive. It's for word-game groups who like a hidden agenda but are bored of bluffing rounds.

## Problem
Hidden-agenda games are almost always turn-based: you scheme, then you act, then you wait. The waiting is where the energy dies. Minor Edit makes every player act continuously and simultaneously, and makes the punishment for two people wanting the same thing at the same moment structural rather than social — the sentence itself gets scar tissue.

## How it works
The host TV shows one numbered sentence: *(1)The (2)mayor (3)announced (4)a (5)modest (6)plan (7)to (8)repaint (9)the (10)bridge.*

Each phone shows PRIVATELY: the same sentence, word-tappable, plus a goal card only that player sees ("make the sentence say the bridge is HAUNTED") and a private bank of three replacement words. Banks overlap slightly; goals do not.

For 45 seconds everyone edits at once. An edit is: tap a word, pick a replacement from your bank, tap COMMIT. The server buffers commits for 1.5s, then resolves:
- **One commit on a word** → applied. The TV animates the swap.
- **Two or more commits on the same word (or adjacent indices) in the same buffer** → CONFLICT. Both revert, both editors burn the word they spent, and the target word is **locked**: struck through in red on the TV, permanently unwritable for the rest of the round.

So the sentence's editable surface shrinks every time two people reach for the same juicy noun — and the juicy noun is exactly where four secret agendas converge. Word 10 ("bridge") is a graveyard by second 20.

The TV shows a presence ghost — a cursor hovering a word — but deliberately delayed 1.5 seconds. It is real information that is always stale, so reading it is a trap: you dodge to word 5 because someone was on 10, and so did they.

At the buzzer, each player reads their goal card aloud and the room votes on whether the final sentence delivers it. One point per delivered agenda.

## Technical approach
Host tab + phone PWAs over PartyKit / a Cloudflare Durable Object. State: `{ words: [{text, locked}], agendas: {pid: goal}, banks: {pid: [word]}, presence: {pid: idx} }`. Commits are optimistic-concurrency writes against a word index with a server-side resolution buffer rather than last-write-wins.

The hard part isn't throughput, it's making the buffer feel honest: a 1.5s window means your commit visibly hangs before resolving, which reads as lag unless it's dressed as "saving…" with a spinner and a conflict animation good enough that the revert lands as a joke instead of a bug. Presence is broadcast on a fixed 1.5s tick, intentionally lagged and never corrected.

## v1 scope
- 3 players, one sentence, one 45-second round
- Three hand-authored agendas and banks, no generator
- Conflict → revert + permanent lock; that's the whole rules set
- Manual verbal scoring at the end, no scoreboard

## Out of scope
- Multi-sentence articles, insert/delete (replace only), undo, talk pages, automated agenda judging

## Risks & unknowns
- Players may cooperate by announcing targets out loud — needs a rule (silence) or agendas antagonistic enough that announcing is suicide
- Adjacent-index conflicts may feel arbitrary; may ship exact-index only

## Done means
Three phones, one TV: a 45-second round ends with at least one permanently locked word, at least one player's agenda visibly delivered, and nobody asking whether the revert was a network error.
