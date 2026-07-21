## Overview
A single-player puzzle/roguelite for people who love math and CS but never touch a proof assistant. You author a conjecture; the machine tries to break it. Sparked by the lobsters top post "Human mathematicians are being outcounterexampled" — this makes that duel the whole game.

## Problem
Counterexample search (QuickCheck, SMT, model-finders) is a serious, intimidating toolchain. Meanwhile the *feeling* of "I bet this is always true" is a universal, delicious itch. There's no lightweight place to test your own tiny conjectures against a clever adversary and feel smart (or humbled) in 90 seconds.

## How it works
Each round you write a claim in a constrained DSL over a chosen domain — integers, finite sets, small graphs, strings, matrices mod p. Example: `forall n:int in [1,10^6]: isPrime(n^2 - n + 41)`. You hit **Defend**. A visible "hunter" then attacks with escalating tactics: (1) cheap random/enumerative property testing, (2) boundary & structural mutation, (3) an LLM asked to *construct* a counterexample and propose a witness, which is then machine-verified. If the hunter finds a witness, you lose the round and it's displayed with a smug one-liner. Survive it and you bank the conjecture as a "standing theorem" trophy. A run is 10 rounds of rising hunter budget; a meta-progression unlocks harder domains and richer DSL primitives.

## Technical approach
Stack: TypeScript + a small parser (chevrotain/ohm) for the DSL, running in-browser. The DSL compiles to a pure JS predicate `(env) => bool`. Hunter tier 1–2: seeded PRNG generators per domain with shrinking (classic QuickCheck). Tier 3: call an LLM (Claude, via a thin server proxy) with the predicate source and domain grammar, asking for a candidate witness as structured JSON; the witness is substituted into the compiled predicate and checked deterministically — the LLM never adjudicates, it only *proposes*, so hallucinations can't cheat. Domains ship as plugins exposing a generator + a witness-decoder. The genuinely hard part is a DSL expressive enough to be fun but total/decidable enough that predicate evaluation always terminates (bounded quantifiers, no unbounded recursion).

## v1 scope
- One domain: integers with bounded quantifiers, `+ - * % ^`, `isPrime`, `gcd`, comparisons.
- Hunter tiers 1–2 only (no LLM), fixed budget.
- 10-round run, local high-score, one trophy shelf.

## Out of scope
- Multiplayer / conjecture-sharing.
- Actual proof (only refutation — surviving ≠ proven, and the game says so).
- Graph/matrix domains.

## Risks & unknowns
- DSL ergonomics: too weak = boring, too strong = undecidable. Iterate on a fixed conjecture set first.
- LLM tier could be slow/expensive; gate it behind a per-round token budget and only invoke when tiers 1–2 fail.
- "Survived" must never be mislabeled as "true" — UX honesty matters.

## Done means
I can type `forall n in [1,100]: n^2 >= n`, hit Defend, watch it survive; type the prime-generating polynomial and watch the hunter surface n=41 with a taunt — end-to-end, in the browser, no server for tiers 1–2.
