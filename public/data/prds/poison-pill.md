## Overview

A four-player riff on **Trapwords / Taboo** where the forbidden list is neither public nor shared. One Speaker, three Listeners. Each Listener secretly plants one trap word — their Pill — and each Listener's Pill is different and invisible to everyone, including the other Listeners. The Speaker types clues into a minefield mapped only in three separate private fragments.

## Problem

Taboo's forbidden words are printed on the card: public, symmetric, and enforced by a bored human judge. The tension is policing, not strategy. Digital versions keep the same list for everyone, which means there's nothing to hide and nothing to infer — you just avoid five known words.

## How it works

1. **Deal (30s).** TV shows the category only ("NATURE"). Speaker's phone privately shows the secret word: **VOLCANO**. Each Listener's phone privately shows a hand of six plausible words (`lava, erupt, mountain, Hawaii, ash, hot`) and picks one as their Pill. Picks are simultaneous and never revealed.
2. **The self-damage.** Your Pill is usually the *best* clue word for the target — trapping it makes the round harder for you too. You want to poison the word that helps the *other two* more than it helps you.
3. **Clue phase (90s).** Speaker types free-text into one box. Text streams to all phones and the TV **word-committed** — a token appears only once the Speaker hits space, so no partial-word leakage.
4. **Pops.** When a committed token stem-matches a Listener's Pill, that Listener's phone flashes **POPPED** (private) and the TV adds an anonymous red pip. The Speaker learns *that* they stepped on something, never whose or which.
5. **Guessing.** Listeners type guesses on their own phones throughout. First exact correct guess ends the round.
6. **Score.** Speaker: base minus 1 per pip. Correct guesser: points. A Listener whose Pill popped: bonus — *but only if they weren't the guesser*. Trapping and guessing actively compete for the same word.
7. **Reveal.** TV shows all three Pills and who ate whose.

## Technical approach

Host tab + phone PWAs + one PartyKit Durable Object per room. State: `{secret, speakerId, pills:{playerId: word}, committedTokens:[], pips:[], guesses:[]}`. Pills live server-side only and are never included in any broadcast payload; each Listener receives only its own. Speaker sends `token:commit` per word; the server runs a shared Porter-stemmer module (imported by both client preview and server ruling so they can never disagree) and matches against pills.

The genuinely hard part is **timing leakage**. A pip appearing the instant after "lava" commits tells the *other Listeners* someone trapped lava — which shouldn't be public information. Fix: pips flush to the TV on a fixed 1.5s tick, batched and shuffled, so near-simultaneous pops are indistinguishable and the offending token is blurred across a window. The Speaker still gets useful pressure; the Listeners still can't read each other.

## v1 scope

- Exactly 4 players, one secret word, one round.
- Six-word Pill hand, hand-curated per secret word.
- Typed clues only. 90s hard cap. First-correct-guess ends it.
- Simple stemmer, exact-guess matching.
- One final reveal screen, no running score.

## Out of scope

Speech/ASR clue-giving, multiple rounds or rotating Speaker, teams, custom decks, plural/synonym trap matching beyond stemming, >4 players.

## Risks & unknowns

The Pill hand *is* the game — a bad hand makes the round trivial or impossible, and curation doesn't scale. Stemmer false positives ("volcanic" popping "volcano") may feel unfair or may feel great; needs playtest. Typing-speed asymmetry advantages one Listener. 90s may be far too long.

## Done means

Four phones on one room code; inspecting the WebSocket payloads shows no Listener's Pill ever reaching another client or the TV; a pop fires on the correct committed token within one 1.5s tick; the round ends on a correct guess and the reveal shows all three Pills. Playtest bar: the Speaker audibly hesitates or backspaces after a pip because they're trying to guess which word bit them.
