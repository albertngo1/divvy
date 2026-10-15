## Overview
A generative art piece and gallery site. Every "artwork" is a web page built so that EasyList, EasyPrivacy and Fanboy's Annoyances hide every visible pixel of it. Visitors running uBlock Origin see a white page with one line at the bottom: "nothing to see." Visitors without a blocker get a dense collage of banner shapes, cookie walls, social widgets and newsletter modals. For net-art people, privacy nerds, and anyone who wants to show a friend how much their blocker does.

## Problem
Ad blocking can't be seen. You install it and the internet just looks a bit cleaner. Nobody ever looks at the filter lists themselves: 70,000 hand-written lines of CSS selectors, built up over twenty years of fighting ads. This piece turns those lines into the material the art is made from.

## How it works
1. Parse the cosmetic filter lines (`##.ad-banner`, `example.com##div[id^="sponsor"]`, `##.cookie-consent > .overlay`).
2. For each generic selector, build the smallest DOM fragment that matches it: classes, ids, attribute prefixes and child chains.
3. A seeded layout engine packs the fragments into a canvas-like page. Each fragment gets a fill, a shape and a size taken from the semantics of its selector name ("sticky" → fixed strips, "modal" → centered blocks, "social" → small circles, "newsletter" → envelopes).
4. Every daily seed publishes one piece at its own URL. A toggle explains what you are (or aren't) seeing.
5. A "diff mode" screenshot compares the blocker-on and blocker-off renders, side by side.

## Technical approach
- Node script parses the lists using `@cliqz/adblocker` parsing (or a hand-rolled ABP syntax parser) and keeps only generic cosmetic rules plus ones scoped to the gallery's own domain.
- Selector to DOM: use `css-what` to get the AST, then emit elements that satisfy it. Combinators become nesting. `:has()`/`:not()` and procedural filters (`:-abp-contains`) are skipped in v1.
- Verification is the hard part. Load each generated page in Playwright with uBlock Origin installed, take a screenshot, and assert that it is fully white (pixel histogram). Then load it without uBlock and assert coverage above 80%. Any fragment that survives the blocker gets removed and the page is regenerated.
- Lists change daily, so a nightly CI job regenerates the pieces. A piece that starts "leaking" (filter removed upstream) gets marked as a fossil.
- Static hosting with no trackers. Gallery chrome sits in a shadow root that no rule matches.

## v1 scope
- EasyList generic cosmetic rules only
- One seeded piece per day, static HTML
- Playwright check with uBlock Origin (Chromium)
- 12-colour palette, rectangles and circles only

## Out of scope (for now)
- Network-rule art (blocked image requests)
- Brave and AdGuard engines
- Prints/NFTs

## Risks & unknowns
- Some list maintainers might add an exception for the domain, or block the whole domain, which would be its own piece.
- Generic-rule hiding varies by blocker, so "blank" may only hold for uBlock.
- Thousands of elements could make pages heavy. Cap each piece at about 2k nodes.

## Done means
On a clean Chromium profile with uBlock Origin defaults, today's piece screenshots 100% white. With uBlock disabled, at least 80% of the viewport is painted. The nightly job publishes a new piece and the verification report automatically.
