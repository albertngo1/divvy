## Overview

A 3–5 player speed-typing party game where the enemy is not the clock or the dictionary — it's everyone else's fingers. One category on the TV, everyone types simultaneously on their own phone, and overlapping word-starts destroy points for everybody involved. For groups who like Boggle/Scattergories energy but want the panic of feeling a stranger's cursor breathing on your word.

## Problem

"Name something in a hospital" games die on obviousness: everyone writes *doctor*, the scoring rule says "unique answers only," and you find out you collided ten seconds later when it's too late to care. The collision should be *felt live*, mid-word, while you still have time to panic and swerve.

## How it works

Host TV shows the category ("things in a hospital") and a 60-second timer. Everyone types at once, no turns.

**Private (phone):** a text field, your current word, and a **heat bar**. The heat bar lights the moment your typed buffer shares a ≥3-character prefix with any other player's *live, unsubmitted* buffer. It tells you *hot*, not *who* and not *what*. Backspacing cools it. You submit when you dare.

**Public (TV):** an alphabet strip. Each committed word's 3-letter prefix is burned and shown publicly ("NUR — taken"). Also a headcount of how many players are currently hot, with no names. That public strip is the trap: it herds everyone into the same three unburned letters.

**Collisions:** submitting a word whose 3-letter prefix is already burned = 0 points and the word is void. Two submits of the same prefix inside 400ms = both void. Clean submit = 10 × word length. Three words each, or the buzzer.

The result is a 60-second game of chicken: type fast and claim prefix space, or type slow, watch the heat, and get burned by someone braver.

## Technical approach

Host browser tab + phone PWAs + authoritative WS server (PartyKit / Durable Object per room).

**Data model:** `Room { category, endsAt, burnedTrie, players }`, `Player { id, buffer, submissions[], score }`.

**Sync:** phones send debounced `keystroke{buffer}` at ≤15/s. Server recomputes heat by walking a small in-memory trie of live buffers, and unicasts each player only their own scalar heat level (0–2). The host gets an aggregate diff (burned prefixes, hot count). Buffers never leave the server as text.

**Hard part:** fairness on near-simultaneous submits. Two phones on the same wifi can differ 150ms in RTT, so "who claimed NUR first" is a latency lottery. Fix: NTP-style offset estimation via ping/pong, client-stamped submits corrected to server time, and a deliberate 400ms *mutual-destruction* window instead of first-wins — inside that window nobody wins, which makes the unfairness disappear by design.

## v1 scope

- 3 players, one category, one 60-second round
- 3-letter prefix collision rule only
- Heat bar with exactly two states: cold / hot
- No dictionary validation — humans eyeball the reveal
- Scoring = 10 × length, void on collision

## Out of scope

Multiple rounds, category packs, profanity filter, spell-check, per-player handicaps, rejoin-after-disconnect, animations beyond the burn strip.

## Risks & unknowns

Mobile keyboards eat screen space — the heat bar must sit above the fold. Autocorrect may silently rewrite buffers and cause phantom collisions (disable `autocorrect`/`autocapitalize`). 3 characters may be too coarse ("nurse"/"nurses") or too fine; needs a tuning night.

## Done means

Three phones and a laptop in one room: two players independently start typing "nurse", both see heat inside 300ms, one swerves to "gurney" and scores, the other submits anyway and gets a visible 0 — and the TV's burned strip shows NUR without ever naming who touched it.
