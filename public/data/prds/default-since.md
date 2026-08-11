## Overview
An interactive timeline of ~30,000 Firefox preferences across 25 years of mozilla-central history. Every pref is a horizontal strand: it begins the commit it was introduced, changes color when its default value flips, and ends when it's deleted. For browser nerds, product people who argue about settings, and anyone who wants evidence that a settings screen is a fossil record of arguments somebody lost.

## Problem
Every long-lived product accretes toggles, and nobody can see the accretion. `about:config` shows you today's 3,000+ prefs with no history: no birthday, no story, no indication that `network.http.pipelining` sat at `false` for a decade before being deleted outright. The history is fully public in git, and nobody has ever rendered it. It's the most legible dataset in software archaeology and it has never been made beautiful.

## How it works
A scrubbable timeline, prefs sorted by birth date, filtered by namespace (`network.*`, `dom.*`, `privacy.*`). Zoom out: a coral-reef silhouette of the browser's growing surface area, with visible mass-extinction events (the pipelining purge, the XUL addon removal). Hover a strand: the pref name, its default over time, the commits that touched it, and the Bugzilla bug title pulled live. Two derived views ship with v1: a **survival curve** (median pref lifetime, and the long-lived tail that never dies) and an **orphan list** — prefs still shipping whose names appear nowhere else in the source tree, i.e. dead toggles the browser still parses at every startup.

## Technical approach
Clone `mozilla/gecko-dev` (git mirror of hg). Walk `git log --follow` over `modules/libpref/init/all.js`, `modules/libpref/init/StaticPrefList.yaml`, and `browser/app/profile/firefox.js` — a few thousand touching commits. At each, read the blob and parse it: the `.js` files are a restricted grammar (`pref("name", value);`), the YAML is straightforward, both need tolerant parsers because 2003-era syntax varies. Diff consecutive parses into events: `born`, `default_changed(old, new)`, `removed`. Extract bug IDs from commit messages via `/[Bb]ug (\d+)/` and hydrate titles from the Bugzilla REST API (`bugzilla.mozilla.org/rest/bug?id=`), cached to SQLite.

Output one ~10MB JSON/Arrow file of events; front end is a canvas renderer (not SVG — 30k strands kills the DOM) with a quadtree for hover hit-testing. Orphan detection: grep the current tree for each live pref name, excluding the definition files, allowing for prefs assembled by string concatenation — which is exactly where the false positives live and the genuinely hard part sits.

## v1 scope
- Firefox only, `all.js` + `StaticPrefList.yaml`
- Timeline + hover detail + namespace filter
- Survival curve
- Static site, precomputed JSON

## Out of scope
- Chromium `about:flags`, VS Code settings, systemd — obvious sequels
- Telemetry on which prefs users actually change
- Live rebuild on new commits

## Risks & unknowns
Pref renames read as death + birth (needs a name-similarity heuristic); the concatenated-pref-name false positives in the orphan list; whether 30k strands stay legible or turn to mush at full zoom.

## Done means
The page loads in under three seconds, you can find `browser.urlbar.suggest.searches`, see every default flip with a linked bug, and the orphan list contains at least one pref a Mozilla engineer confirms is genuinely dead.
