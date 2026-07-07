## Overview
Type Specimen is a browser game about the *thrill of discovery* in cellular automata. Every day everyone shares one CA rule (a fresh corner of a huge rulespace). You poke at it, and when you find a novel persistent pattern — a still-life, an oscillator, a glider — the game classifies it and, if nobody's logged it before, awards you naming rights. A communal illustrated bestiary accretes over time, each entry stamped with its discoverer, like the type specimen that defines a species in a museum drawer.

## Problem
Cellular automata are endlessly fascinating (the Lobsters "accidentally discovering a new CA" post is exactly this joy) but exploring them is a solitary, aimless activity. There's no stakes, no sharing, no reason to come back. Meanwhile daily games (Wordle-likes) are sticky but shallow. Nobody has fused open-ended emergence with scientific-priority competition.

## How it works
1. A date-seeded rule selects the day's automaton (a rule table over a small neighborhood/state space — richer than Life, e.g. a random Larger-than-Life or multi-state rule).
2. Sandbox: you paint an initial seed on a grid and run it.
3. The engine watches the evolution and auto-detects persistent structures: still-lifes (fixed point), oscillators (period ≤ P), and spaceships (translating cycle) via period/displacement analysis on a normalized bounding box.
4. Any detected pattern is hashed to a canonical form (min-rotation/reflection of its phase set). If that hash is new to today's rule, you claim it: name it, and it's minted to the bestiary with your handle. If it exists, you get points for rediscovery.
5. Shareable card: "3 species found, 1 first discovery 🥇."

## Technical approach
- **Stack:** pure client-side TypeScript + Canvas/WebGL for simulation; a tiny serverless KV (Cloudflare Workers + KV or Supabase) for the shared bestiary and priority ledger.
- **Detection algorithms:** hash each generation's live-cell set (normalized to bounding-box origin, canonicalized over the 8 dihedral symmetries). Still-life = identical consecutive hashes; oscillator = hash recurs with zero displacement within window; spaceship = hash recurs with nonzero integer displacement. Prune the dead/exploding via population bounds.
- **Data model:** `species(rule_date, canon_hash, class, period, name, discoverer, ts)`; claims are first-write-wins on `(rule_date, canon_hash)` to settle priority races.
- **Hard part:** canonicalizing patterns so the *same* creature found via different seeds collapses to one hash (symmetry + phase alignment), and picking daily rules interesting enough to reliably contain discoverable structures without being trivial or chaotic.

## v1 scope
- Binary-state Life-family rules only, date-seeded from a hand-vetted pool.
- Detect still-lifes and oscillators (skip spaceships).
- Global first-discovery ledger + name claim; anonymous handles.
- One shareable result card.

## Out of scope
- Multi-state/continuous (Lenia) rules.
- Accounts, friends, chat.
- Anti-cheat beyond first-write-wins.

## Risks & unknowns
- Rule curation: many random rules are boring or explode — needs an offline filter that scores rules for "discoverable structure."
- Canonical hashing bugs = duplicate or missed species.
- Griefers spamming garbage names (needs light moderation).

## Done means
Two players seeding the same daily rule differently who both produce the identical oscillator get collapsed to one bestiary entry credited to whoever submitted first, and a genuinely new pattern mints a fresh named entry — verified across a 10-pattern test set.
