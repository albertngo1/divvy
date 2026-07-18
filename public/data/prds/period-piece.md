## Overview
Period Piece is a fast multiplayer web game. A scene set in a real year streams in word-by-word; hidden inside is exactly one anachronism — an object, word, or event whose first-known date postdates the scene. Players race to tap the offending phrase; the round resolves with a citation of the real date. History trivia turned into a reflex sport.

## Problem
The zoomable 4M-event Wikipedia timeline on HN is gorgeous and utterly passive. Anachronism-spotting is a delightful skill — the pleasure of catching a wristwatch in a Roman epic — that no game makes competitive. Existing history games are dating/placement quizzes, not real-time.

## How it works
Server picks a year and setting, gathers period-accurate facts plus one entity whose inception date is *after* the scene year, and has an LLM weave it in naturally over 4–6 sentences. The scene streams; the first player to tap the anachronistic span wins the round on speed. Wrong taps cost points. A "why" card cites the real first-known date. Ties break on tap timestamp.

## Technical approach
Next.js + WebSocket. Anachronism sourcing: query Wikidata SPARQL for entities with `inception`/`discovered` date properties, select one strictly greater than the scene year, feed to Claude to embed. Critical: a verification pass (second LLM + the known QID date) confirms *exactly one* anachronism and that the rest of the scene is period-clean. Data model: `scene(year, setting, anachronism_qid, inception)`, `round`, `tap(player, span, ts)`. The hard part is grounding — guaranteeing one verifiable anachronism and no accidental extras — which needs a real pipeline, not vibes.

## v1 scope
- Single room, 3–8 players
- 50 pre-generated, hand-verified scenes (offline)
- Tap-to-flag, speed scoring, citation cards

## Out of scope
- Live scene generation
- Mobile layout, anti-cheat
- Large auto-verified scene banks

## Risks & unknowns
Accidental second anachronisms elsewhere in the scene; LLM-hallucinated dates; genuinely fuzzy "when did X exist" cases. Mitigate with pre-verification, citations, and a dispute→citation resolution.

## Done means
50 verified scenes exist; a room of four plays a full match; every disputed round resolves cleanly to a dated citation.
