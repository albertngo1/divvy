## Overview
Southpaw is a browser-extension + CLI test harness for web apps that exercises your UI as a roster of *edge-case personas* — the real humans whose existence your code quietly assumes away. Named for the left-handed-only bug making the rounds, it's aimed at frontend devs and QA who keep shipping assumptions they didn't know they had.

## Problem
Most bugs that reach production aren't logic errors — they're unstated assumptions about who the user is: names have two parts, phones are +1, everyone reads left-to-right, birthdays aren't Feb 29, mice are right-handed, colors are distinguishable. Each is invisible until a specific person hits it. There's no cheap way to *systematically* replay those people against a running app.

## How it works
You point Southpaw at a URL and a persona set. For each persona it drives the page (Playwright), applies environment mutations, walks the DOM filling forms with persona-appropriate hostile-but-valid data, screenshots each state, and diffs layout/behavior against a baseline persona. It flags: text overflow, clipped/mirrored controls, validation that rejects valid input, focus traps, contrast failures. Output is a ranked report: `persona → screen → what broke`.

Personas ship as declarative bundles: **RTL** (dir=rtl, Arabic name/address), **Southpaw** (mirrored pointer coordinates, left-anchored gestures), **Leap-Dayer** (born Feb 29 → age math, renewal dates), **Mononym** (single name → `firstName`/`lastName` splits), **Antipode** (+64 phone, DD/MM dates, comma decimals, DST-shifted timezone), **Deuteranope** (simulated colorblind rendering).

## Technical approach
Stack: Node + Playwright for driving, `axe-core` for a11y/contrast, `pixelmatch` for layout diffs, `fontkit`+canvas for text-fit detection. Persona bundles are JSON: a set of `page.emulate*` calls (locale, timezone, colorScheme, reducedMotion), CSS injection (`dir=rtl`, colorblind SVG filter matrices), a pointer-coordinate transform for the Southpaw mirror, and a faker-style data generator seeded per locale. The genuinely hard part is *semantic* form-filling — mapping an arbitrary form to persona data without per-app config; v1 uses label/autocomplete/`name` heuristics and degrades to a record-once template. Layout-break detection compares bounding boxes across personas and flags deltas beyond a threshold, filtering intentional differences via a baseline.

## v1 scope
- CLI: `southpaw run <url> --persona rtl,leap-dayer`
- 4 personas: RTL, Leap-Dayer, Mononym, Antipode
- Playwright screenshot + bbox diff report as static HTML
- Heuristic form-fill, no login flows

## Out of scope
- Native mobile apps
- Auth/multi-step wizards
- Auto-fixing (report only)
- CI gating / GitHub action

## Risks & unknowns
- Blind form-filling is fragile; may need record-once per app
- Distinguishing real breakage from expected persona variance (false positives)
- Colorblind/handedness "breakage" is judgment-heavy, hard to auto-score

## Done means
Run against a demo signup form with a hard-coded Feb-29 age bug and an `lastName required` split; report lists both, screenshots show the failure, zero manual annotation.
