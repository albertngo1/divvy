## Overview
Snag is a phone-native riff on *Trapwords* (itself a devious Taboo) for 4–6 players split into two small teams. One player describes a secret word to their teammates; the *opposing* team has secretly planted forbidden words they're betting you'll blurt. It's Taboo where the taboo list is invisible, adversarial, and different every round.

## Problem
Taboo's forbidden words are printed on the card — static, fair, and known to everyone. The delicious part of Trapwords is that your *opponents* choose the traps, and you have no idea what they are, so every clue is a nervous tiptoe. But that only works if the traps stay genuinely hidden. Around a table you need a screen or a whispered huddle; a shared passed phone leaks the whole minefield the instant the clue-giver glances at it.

## How it works
Round: Team A guesses; Team B are the trappers.
- The **host TV** shows the round is live and a snag counter (e.g. 0/3).
- The **clue-giver's phone** (Team A) privately shows the SECRET TARGET WORD (e.g. "volcano"). Their teammates' phones show nothing but a big guess-shout prompt.
- **Team B's phones** each privately show the same target and a field to submit 2 trap words they predict the clue-giver will utter ("lava", "erupt", "mountain"). These are invisible to Team A.
- The clue-giver describes the word aloud. Teammates shout guesses. If the clue-giver *speaks a trap word*, any Team B player taps their glowing trap chip to fire it. The server takes the first tap, the TV flashes "SNAG: lava", and the counter ticks up.
- Team A wins by getting the word before 3 snags; Team B wins if they hit 3 snags first.

Private per phone: the trap set (Team B only), the target (giver + trappers, never the guessers), and each trapper's individual buzz button. Nothing about this survives one phone being passed around.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ target, teams, snagCount, phase }`, `Trap{ ownerId, word, fired:bool }`. Phase machine: LOBBY → PLANT (trappers submit) → DESCRIBE → RESOLVE. Sync: server broadcasts sanitized state — guessers never receive `target`, giver never receives `traps`. The genuinely hard part is adjudicating spoken traps in real time: rather than ASR, keep a human in the loop — the trapper who *hears* their word taps; the server dedups by `Trap.id`, marks it fired, and reveals it. Race safety: first tap wins via a server-side compare-and-set on `fired`; a trap can only fire once.

## v1 scope
- 4 players, 2v2, one target word, one round.
- 2 traps per trapper, 3 snags to lose.
- Manual tap-to-fire; no audio recognition.
- Text on TV, no animations beyond a flash.

## Out of scope
- ASR auto-detection of spoken traps.
- Score persistence, multiple rounds, team switching.
- Trap-word dictionaries / anti-cheat on plausibility.

## Risks & unknowns
- Trappers might plant absurdly common words ("the") — need a light rule/UI nudge ("real words you expect them to say").
- Disputes over whether a word was truly spoken; v1 leans on group vibe.
- Firing latency between two trappers spotting the same word (mitigated by first-tap-wins).

## Done means
Four phones join; trappers plant hidden words unseen by Team A; the clue-giver describes a word that only their phone shows; when they say a planted word a trapper taps and the TV flashes the exact snag; the round ends deterministically at either a correct guess or the third snag.
