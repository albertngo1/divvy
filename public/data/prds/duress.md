## Overview
Duress is a shared family/friend-group app that looks like a lightweight party game — trade absurd challenge-response pairs, get quizzed at random — but its real job is to keep a rotating library of un-guessable proof-of-life challenges warm in everyone's memory, so when a three-second voice clone calls Grandma begging for a wire, she has a reflex: 'What did we name the fish?'

## Problem
AI voice fraud now needs only seconds of audio to clone a loved one and manufacture a panicked 'I'm in trouble, send money' call. The recommended defense — a family safeword — fails in practice because nobody sets one, and if they do, they forget it under stress. A static secret decays; a drilled reflex doesn't.

## How it works
A group creates a shared library of Q→A pairs that are personal and hard for an outsider or an LLM to guess ('What's Dad's fake middle name?'). The app delivers them as playful, low-stakes prompts on a spaced-repetition schedule ('Roll call! Who broke the lamp in 2019?'), keeping recall fresh. In a live scare, either side taps **Challenge**: it serves a random *due* card, and can also push it out-of-band to the other person's phone so a suspicious call can be verified on a channel the attacker doesn't control. The game framing is the retention mechanism.

## Technical approach
Stack: Expo / React Native; Supabase-style backend (Postgres + push) for the shared library and delivery. Scheduling uses SM-2 spaced repetition per user per card. Answers are end-to-end encrypted with a group key derived at setup so the server never holds plaintext secrets — matching is done client-side with fuzzy/normalized comparison (lowercase, strip punctuation, Levenshtein tolerance). The genuinely hard part is that the secret library must not itself become the breach: no plaintext at rest, careful key handling, and quizzes that reinforce recall without ever displaying the answer except to confirm a self-typed one.

## v1 scope
- Create group, add ~10 Q/A pairs
- SM-2 scheduled push quizzes
- 'Challenge now' screen that serves a due card locally
- Client-side fuzzy answer matching, E2E-encrypted storage

## Out of scope
- Real-time in-call audio analysis or deepfake detection
- Enterprise / bank integrations
- Automatic call interception

## Risks & unknowns
Adoption is the killer — elderly targets are the least likely to keep an app; may need a caregiver-managed mode. Fuzzy matching under stress (typos, panic) must be forgiving without becoming guessable. Notification fatigue could kill retention.

## Done means
Two phones in a group can each set up cards, receive a scheduled quiz, and one can push a live challenge that the other answers correctly out-of-band — with no plaintext answer ever stored server-side.
