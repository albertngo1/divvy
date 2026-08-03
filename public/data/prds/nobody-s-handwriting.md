## Overview

A 3-5 player collaborative writing toy that ends in one handwritten letter, displayed on the host TV as an unfolding page. Each player contributes words, but the visual identity of each word is assigned by the server, not the author — so the finished document is in five handwritings and nobody, including the authors, can reliably map hand to person. For groups that want to make something together and specifically do not want to know who said what.

## Problem

Collaborative writing games optimize for attribution: who wrote the funniest line, who gets the point. That pressure makes people write for the room instead of writing honestly. The itch is the opposite — a game where anonymity is the mechanic and the prize, where you can put a real sentence into a shared object precisely because it will never be traced back.

## How it works

The host TV shows a sheet of paper and a salutation drawn from a pack: *"To whoever finds this house after us,"* / *"Dear person I was six years ago,"*. Below it, an empty page.

The game runs in **beats**. On each beat, every phone simultaneously and privately shows:

- The current visible tail of the letter (last ~8 words), so you have context.
- A private **Constraint** for this beat only: "your word must be a verb", "your word must be something you can hold", "your word must be under four letters", "your word must not have been used yet".
- A single text field, one word, and a 12-second timer.

All phones submit at once. The server picks ONE submitted word per beat — weighted so everyone lands roughly equally over the round — appends it to the letter, and renders it in a handwriting style. **The style is assigned per-word by the server, drawn from a shuffled pool, and re-shuffled every beat.** Your word from beat 3 and your word from beat 7 are in different hands. The rejected words are silently discarded and never shown to anyone, ever — including you. Your phone does not say "you were chosen" or "you were not." It just shows the letter growing.

That last detail is the whole game: because you can't tell whether the word that appeared was yours, and because styles rotate, you can write something true. After twelve beats the host renders the full page with a slow ink-drying animation, no author list, no score, and offers a QR download. Room votes once, unanimously, whether to keep or burn it — burning plays an animation and deletes the record.

## Technical approach

Host browser tab + phone PWAs + a PartyKit Durable Object.

Data model: `Letter { salutation, beats: [{ index, chosenWord, styleId, authorId }], stylePool, players[] }`. `authorId` is stored server-side for the weighting fairness pass and is **never** included in any client broadcast — the wire message is `{index, word, styleId}` only. The host tab never learns authorship.

Sync: the DO drives a strict beat clock. Beat opens → broadcast constraint set → collect submissions until all-in or 12s → server selects → broadcast one append event to host and all phones → next beat. Phones are pure views of the DO's beat state, so a late join re-hydrates from a full snapshot.

Handwriting rendering: five loaded webfonts (Caveat, Homemade Apple, Shadows Into Light, etc.), each with a per-word random baseline jitter, rotation of ±1.5°, and ink-color variance, so the same font twice doesn't look mechanically identical.

The genuinely hard part is **provable anonymity under a 3-player load**. With three players and one word chosen per beat, you have a 1-in-3 prior and players will absolutely try to fingerprint each other by word choice. The fix is structural: per-beat constraints are *different per phone*, so "that word satisfies a constraint I didn't have" is uninformative rather than a tell. Whether that's actually enough entropy at n=3 is the open question.

## v1 scope

- 3 players, one letter, 8 beats, one salutation.
- 4 constraint types, 3 handwriting fonts.
- Server picks one word per beat with equal-share weighting.
- No authorship on the wire, ever.
- Host renders page to canvas → PNG → QR download.
- Keep/burn vote at the end.

## Out of scope

Multi-word contributions, editing or deleting placed words, punctuation control, multiple letters, mailing the artifact, any scoring or "best word" vote, real handwriting capture from the touchscreen.

## Risks & unknowns

One-word-per-beat may produce incoherent mush rather than a letter — the constraint set is doing heavy lifting and may need tuning toward grammatical scaffolds. Players may feel *nothing* if their word never lands and they can't tell; the invisible-rejection design may read as broken rather than anonymous. Three-player anonymity may be too thin to be felt. Handwriting fonts at TV distance may all look the same.

## Done means

Three phones, given differing private constraints, submit words across eight beats; the host page fills with eight words in visibly distinct handwriting; no client message anywhere in the session contains an author id for a placed word (verifiable in the network log); each phone downloads an identical PNG; and in playtest, at least two of three players cannot correctly identify which words were their own.
