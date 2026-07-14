## Overview
A 3-6 player party game where the group writes a single sealed "time-capsule letter" together, one private line each, and the goal is that no line can be traced back to its author. It's for friend groups who want a keepsake with a mischievous twist: the artifact only "seals" when everyone has successfully hidden inside the group voice.

## Problem
Collaborative-writing games reward being clever and identifiable (Quiplash). Nothing rewards the opposite — the delicate craft of writing something meaningful while erasing your fingerprints. That tension (I want to say a real thing / I must not sound like me) is unmined and genuinely funny.

## How it works
The host TV shows a letter skeleton: a shared prompt ("Dear us, one year from now…") and empty numbered slots, one per player. Everyone writes simultaneously.

PRIVATELY, each phone shows: (a) your own draft line, and (b) a live "Identifiability meter" — a rough client-side stylometer scoring how much your line diverges from the running anonymized group mean (avg word length, punctuation density, function-word ratio, sentence length, emoji use). The meter is red until you're under threshold. You cannot see anyone else's text — only the moving group mean, so you're blind-blending toward an unseen target while still trying to smuggle in real sentiment.

The host TV shows only anonymized progress: N glowing "sealed" dots, one per player, no text. When all dots go green (everyone under threshold), the assembled letter is revealed in random slot order.

Then a GUESS PHASE: each phone privately attributes every line to a player. Win condition: the letter seals AND no line is correctly attributed by a majority. The finished letter exports as a keepsake PNG with a "do not open until [next year]" stamp. No score, no leaderboard — just did the anonymity hold.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{prompt, phase, players[], groupMeanVector, lines[{slot, text, authorId, sealed}], guesses[]}. Each phone computes its own style vector locally on keystroke and sends {vector, sealed} deltas (never raw text until seal) so the server can update the running mean and broadcast ONLY the aggregate back — private text never leaves the phone until the seal barrier. Hard part: a stylometer stable enough on ~15-word lines to feel fair, and defining "under threshold" relative to a mean that shifts as others edit (feedback loop / oscillation). Debounce mean updates and freeze the target once ≥half have sealed.

## v1 scope
- 3 players, one prompt, one round
- 4-metric stylometer, single threshold, meter as a colored bar
- Text stays local until seal; server holds only vectors + sealed lines
- One guess phase, PNG export of the letter

## Out of scope
- Multiple rounds/prompts, difficulty tiers
- ML stylometry, adversarial detectors
- Actual scheduled re-open next year (just the stamp)

## Risks & unknowns
- Stylometry on short text may feel arbitrary — needs playtest tuning; may need a minimum word count.
- Blending could feel like homework rather than play; the guess-phase payoff must land.
- Feedback-loop oscillation of the group mean.

## Done means
Three phones on a LAN write blind, each sees a private meter, all seal, the letter renders anonymized on the TV, guesses submit privately, and a keepsake PNG downloads — with at least one line nobody pinned correctly.
