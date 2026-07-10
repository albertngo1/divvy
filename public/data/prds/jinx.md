## Overview
Jinx is a fast anti-coordination word game for 3-6 people in one room, each on their own phone with a shared TV/laptop host screen. It weaponizes the childhood 'jinx!' moment: saying the same thing as someone else is the *loss* condition, not a win.

## Problem
Minority/duplicate-answer games (Scattergories, Herd Mentality) resolve blind — you dump an answer, then discover collisions after the reveal. All the tension is deferred to a scoring screen. There's no live dance of *watching a collision approach and deciding whether to swerve*. That real-time chicken game is the fun nobody's shipped.

## How it works
The host screen shows one open prompt with a huge answer space: 'a word that starts with S,' 'something in a junk drawer,' 'a movie villain.' A 30s timer runs.

Each phone PRIVATELY shows: a text box, and a single 'heat' bar. As you type, the server normalizes your draft (lowercase, trim, basic singularize) and tells your phone only *how many other live drafts currently normalize to the same string* — never which players, never the strings. Cold = you're alone. Glowing red = someone else is on your word right now. You can rewrite as often as you like until the timer ends.

The host screen shows NONE of the answers mid-round — only a room-wide 'collisions brewing' ember count, so spectators feel the pressure without spoiling positions. At lock-in, any normalized answer held by ≥2 players jinxes all of them (0 points); every unique answer scores. Reveal animates the jinxed pairs snapping together.

The delicious part: when two players both see red, both want the *other* to abandon the word first. Blinking early wastes your safe lead; holding risks mutual zero.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `room{prompt, phase, deadline}`, `player{id, draftNorm, lockedNorm, score}`. On every keystroke (debounced ~150ms) the phone sends `draftNorm`; the server maintains a `Map<normStr, count>` and pushes each player *only their own* count. The genuinely hard part is doing frequency feedback in real time without leaking answers — the server must broadcast aggregate-per-player scalars, never the map, and rate-limit to prevent binary-search deanonymization of a rival's word. Normalization must be deterministic and shared server-side only.

## v1 scope
- One prompt, hardcoded.
- 3-4 players, 30s timer.
- Exact normalized-string matching (no synonyms).
- Binary jinx: collision = 0, unique = 1 point.
- Heat bar = raw collision count, three visual tiers.

## Out of scope
- Synonym/fuzzy matching, multiple rounds, categories.
- Anti-deanonymization hardening beyond basic rate limiting.
- Spectator answer reveal before lock.

## Risks & unknowns
- Heat feedback could be gamed to sniff a rival's exact word; needs coarse tiers.
- Exact matching feels unfair when 'cats' vs 'cat' should collide — normalization quality is make-or-break.
- Some prompts have too small an answer space; collisions become unavoidable and unfun.

## Done means
4 phones join, type live, each sees only its own heat tier update within 300ms, and at timer end matching answers are zeroed while unique ones score — verified with a deliberate two-player collision.
