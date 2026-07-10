## Overview
Chargemaster is a short, darkly funny web tycoon that teaches how U.S. medical billing actually works by letting you *be the upcoder*. You run the revenue-cycle desk of a fictional hospital; each 'shift' is a patient encounter you must maximize. For anyone who's ever opened a surprise ER bill and wondered how the number got that big.

## Problem
The ambulance/ER pricing outrage recurs constantly (HN front page again), but explanations are dry think-pieces. People don't understand chargemasters, CPT codes, modifiers, facility fees, or 'balance billing.' The itch: an interactive that makes the machinery viscerally clear — and a little enraging — in five minutes, by putting the levers in your hands.

## How it works
A patient card appears: 'Sprained ankle, seen 40 min, one X-ray.' You have a tray of billable **CPT/HCPCS codes** (E/M level 99283, radiology 73610, facility fee, 'trauma activation'…) and **modifiers** (-25 significant separate E/M, -59 distinct procedure) you can attach. Each choice bumps the total and a **audit-risk meter**. A shadowy 'Compliance' bar fills as you push implausible codes; overreach triggers a denial or clawback (payday tycoon-style setback). Between shifts you spend earnings on upgrades — a 'scribe' that auto-suggests upcodes, a 'coding consultant,' a lobbyist that lowers audit risk. The twist ending each round: a reveal panel translates your simulated bill against a *reasonable* benchmark and the actual Medicare allowed amount, showing the multiple.

## Technical approach
Stack: static SPA (Svelte or React), no auth, no PHI (all fictional). Data: a curated JSON of ~60 real CPT/HCPCS codes with descriptions and rough relative values from the public **CMS Physician Fee Schedule / Medicare allowed amounts** and published chargemaster medians; modifiers as rule objects. Core is a small rules engine: each code has `baseCharge`, `plausibleFor: [scenarioTags]`, and `auditWeight`; total = sum with modifier multipliers; audit-risk = Σ(auditWeight × implausibility). A seeded scenario generator emits patient encounters with tags. Hard part: sourcing defensible dollar figures (chargemasters are opaque and vary wildly) and encoding *plausibility* so the satire is accurate enough to be educational rather than libelous — cite ranges, label everything fictional.

## v1 scope
- 5 scripted patient scenarios
- ~40 codes + 6 modifiers, hand-tuned charges
- Audit-risk meter with denial events
- End-of-round 'you charged $X, Medicare pays $Y' reveal

## Out of scope
- Real EHR/837 claim formats
- Insurance-negotiation depth, prior auth
- Persistent economy / accounts
- Any real patient data

## Risks & unknowns
- Getting charge numbers right enough to be honest; heavy sourcing/disclaimer burden.
- Tone: satire of a system, not of clinicians — easy to misread.
- Fun vs. lecture balance.

## Done means
A player completes a scenario, attaches codes/modifiers, sees a live total and audit meter that responds to overreach, hits a denial at least once, and finishes with a reveal panel showing their bill vs. the Medicare benchmark multiple — all with visible citations for every dollar figure.
