## Overview
An explorable map of occupational license portability, drawn in the visual language of the KSP delta-v subway map. Each node is a (state, license) status; each edge is a legally defined transition with a three-component cost. You pick a start and a destination and get a **burn plan**: an itemized, cited route. For barbers, cosmetologists, EMTs, HVAC techs, dental hygienists, and anyone who has moved states and discovered their career didn't come with them.

## Problem
"Can I work in Texas with my New York license?" has an answer, and it is buried in state administrative code, board FAQs, and reciprocity compacts that contradict each other. The existing presentations are either a legal PDF or a green/yellow/red choropleth that flattens a multi-dimensional cost into one color. Nobody shows what the move actually *costs* — and nobody shows the non-obvious fact that indirect routes are sometimes cheaper, because state A won't take your hours but state B will, and state C takes anyone licensed in B.

## How it works
The map renders as a node graph where **edge length is proportional to cost** under a weighting you control with three sliders: money, retraining hours, calendar wait. Drag the sliders and the map physically re-warps — cheap-under-money and cheap-under-time are different-shaped countries, and watching them differ is the point.

Click a start and end node and it solves the shortest path, then prints a burn plan: `NY → PA: transfer application $42, 0 hours, jurisprudence exam, ~6 weeks. PA → CA: 0 fee, 300 hours, practical exam, ~5 months.` Each line cites the administrative code section and the date the rule was read. Where a transition is only available in windows (exams offered quarterly), the map shows **transfer windows** the way an orbital map shows launch windows.

## Technical approach
Data is hand-encoded YAML, one file per (state, license), reviewed against primary sources — no scraping of legal text, because a wrong number here wastes someone's year. Schema: `{jurisdiction, license, initial_hours, exams[], fees[], reciprocity: [{from, accepted_if: <predicate on applicant hours/years>, extra_hours, extra_exams, typical_weeks, cite, read_on}]}`. The predicate language is deliberately tiny (`hours >= 1200 and years_practiced >= 1`) and evaluated against an applicant profile, so edges are *conditional* on who you are — the map redraws per person.

Rendering: D3 with a stress-majorization layout rather than plain force-directed, so drawn distance is an honest embedding of the chosen cost metric. The genuinely hard part is that this cost metric **violates the triangle inequality** — the whole insight of the tool is that A→B→C can beat A→C — and no metric embedding can represent that. The fix is the same one the delta-v map uses for gravity assists: embed the direct-cost metric, then draw beneficial indirect routes as explicit annotated shortcut arcs on top. Layout stress is reported to the user as a "distortion" figure so the map never silently lies.

Stack: static site, Svelte + D3, YAML compiled to JSON at build time. No backend, no accounts.

## v1 scope
- One license: barber.
- Eight states, hand-encoded, each with citations.
- Two sliders (money, hours) — drop calendar wait.
- Shortest path + printed burn plan. No shortcut-arc annotation yet; just note when an indirect path wins.

## Out of scope
Multi-license careers, federal licenses, international credentials, compact states' automatic privileges, anything resembling legal advice, user accounts.

## Risks & unknowns
Legal accuracy is the whole product and it decays — rules change and the map goes stale silently. Mitigate with a visible `read_on` date per edge and a staleness fade. Risk that the orbital-map metaphor is charming to me and confusing to the person who just needs an answer; mitigate by making the printed burn plan the primary artifact and the map the exploration surface. Data entry is unglamorous and slow: budget four hours for eight states.

## Done means
With the money slider maxed, the map shows at least one pair of states where the two-hop route is cheaper than the direct one, the burn plan prints with a citation on every line, and a licensed barber reading it agrees the numbers match their own experience.
