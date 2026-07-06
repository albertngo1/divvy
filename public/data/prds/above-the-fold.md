## Overview
Above the Fold is a satirical browser game where you play as a humble UI button whose one job is to get clicked — while cookie banners, newsletter modals, sticky headers, and layout reflows conspire to bury you below the fold. Sparked by the Lobsters essay "If you're a button, you have one job."

## Problem
It's a toy, so the itch is emotional, not utilitarian: everyone loathes dark patterns but there's no cathartic way to laugh at them, and the people who build UIs almost never feel the button's point of view. Above the Fold makes you *live* it.

## How it works
You see a rendered fake webpage viewport and control the button (arrow keys or drag). Your job: stay inside the visible viewport AND clickable — not covered by a higher z-index element — while a timer counts down to the "user" clicking you. Waves spawn hostile UI: a cookie wall slides up from the bottom, a modal drops in and dims everything, a sticky nav shoves content down so a reflow pushes you, an autoplay video steals focus. Survive the countdown while clickable and you score a "conversion." Difficulty ramps with faster reflows and nastier patterns. Power-ups riff on real CSS: `aria-label` (brief invulnerability), `position: sticky` (anchor yourself), `!important` (shove one hazard off you).

## Technical approach
Pure front-end, single static page — and the twist is it uses a *real* DOM sandbox rather than a canvas. The "webpage" is actual HTML/CSS; the button is a DOM node; obstacles are real elements with z-index and overflow. Coverage detection uses `document.elementFromPoint()` at the button's center — if it returns anything other than the button, you're buried. Reflow hazards trigger genuine CSS layout changes, so the "physics" is literally the browser's layout engine. A requestAnimationFrame loop drives input (transforms) and state (score, wave, active hazards). The genuinely fun/hard part: authoring hazards that are recognizable satires of specific dark patterns, and tuning coverage detection so deaths feel fair, not random.

## v1 scope
- One viewport, keyboard-movable button
- 3 hazard types (cookie wall, modal, sticky-nav reflow)
- Coverage/visibility detection + countdown-to-click scoring
- Visible score + wave counter

## Out of scope
- Mobile touch tuning, leaderboards
- Level editor or a large hazard library
- Any real analytics/A-B satire beyond flavor text

## Risks & unknowns
- `elementFromPoint` edge cases with transforms and overlap
- Might land as a cute one-off demo rather than something replayable
- Balancing reflow hazards so they feel fair, not cheap deaths

## Done means
The game loads as one static page; the player drags a button, a cookie wall and a modal try to bury it, coverage is detected via elementFromPoint, and surviving to the click increments a visible score across escalating waves.
