## Overview
Bookbell is a weekend-buildable web app that turns any EPUB into a structured workout you do while listening. It's for people who read on a treadmill or want to gamify a reading habit — the literary cousin of couch-to-5K. Directly inspired by the 'Moby Dick Workout' (do a set whenever a whale is sighted) generalized to arbitrary texts via a Pandoc parsing pipeline.

## Problem
The Moby Dick Workout is delightful but hand-crafted for one book. Nobody wants to manually annotate 200,000 words with exercise triggers. Meanwhile treadmill-readers and audiobook-walkers have no way to bind physical effort to narrative beats, so reading and moving stay separate chores.

## How it works
You drop in an EPUB and pick a rule set: 'every chapter start = 10 squats', 'each occurrence of a name/regex = 5 pushups', 'every scene break = 20s plank'. Bookbell parses the text, resolves trigger positions to a timeline (by word-count → estimated seconds via a words-per-minute TTS rate), and produces a playable session: TTS narration plays, and at each trigger it ducks the audio, chimes a bell, and speaks the exercise. A live progress bar shows chapters as laps; a post-session summary tallies total reps and 'pages per pushup'.

## Technical approach
Frontend: Svelte/Vite single page. Ingest: run `pandoc epub → json` (Pandoc's AST) server-side (small Node function shelling out to pandoc), or a Pandoc Lua filter that walks Para/Header blocks and emits `{offset, type, text}` events — Lua filters are the clean way to tag structural triggers. Word-regex triggers run over the flattened plaintext with cumulative word-index → time mapping. Narration uses the browser Web Speech API (free, offline) with an ElevenLabs fallback. Data model: `Session {book, wpm, rules[], events[]}`, `Rule {matcher: regex|structural, exercise, reps}`. The genuinely hard part is time-alignment: Web Speech gives `onboundary` word events unevenly across engines, so triggers must reconcile predicted vs actual boundary offsets to avoid drift over an hour-long book.

## v1 scope
- EPUB upload, pandoc-to-JSON parse
- Three trigger types: chapter, scene-break, word-regex
- Web Speech narration + bell + spoken exercise cue
- Session summary (total reps, duration)

## Out of scope
- Accounts, saved libraries, cloud sync
- Heart-rate / wearable integration
- Multi-book programs and social leaderboards
- DRM'd store books (bring-your-own EPUB only)

## Risks & unknowns
Web Speech quality/boundary events vary by browser; long TTS sessions may be tiring to hear. Copyright: users must supply their own files. Some may find fixed rep triggers unsafe mid-workout — needs a 'skip' gesture.

## Done means
I upload a public-domain EPUB, set 'chapter = 15 jumping jacks', hit start, and within one chapter the app narrates the text and audibly cues me to do jumping jacks at the exact chapter boundary, ending with a correct total-rep count.
