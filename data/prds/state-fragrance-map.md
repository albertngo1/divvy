# State Fragrance Map

## Overview
An interactive US choropleth that reveals the single most-searched fragrance in each state, with a hover card that unpacks each scent into its "profile" — top/heart/base notes. For the perfume-curious, gift-shoppers, and the map-and-trends crowd on social media.

## Problem
Everyone has seen "most popular X by state" maps for baby names, beers, and Google searches — but nobody has done it for *smell*, the sense with almost no visual representation. There is a genuine "what does my state smell like?" itch: it's identity-flavored, instantly shareable, and personal. Fragrance is a $50B industry with obsessive fans, and no one has turned regional search demand into a single glanceable artifact.

## How it works
Land on a US map colored by fragrance "family" (floral, woody, gourmand, fresh, oriental). Each state is labeled with its #1 searched fragrance. Hover (or tap on mobile) a state and a card slides in: the fragrance name, brand, its accord breakdown as a small note-pyramid, and a one-line "this state smells like ___" caption. A legend toggles between "by family color" and "by intensity." A share button exports the current view (or a single state card) as a PNG.

## Technical approach
Static site — **Svelte + D3** for the choropleth (TopoJSON US states via `us-atlas`), no backend. Data pipeline is offline and baked into a JSON blob shipped with the site.

- **Trends source:** **Google Trends** — pull relative search interest for a curated list of ~150 fragrance names, scoped by US state (`geo=US-XX`), via the unofficial `pytrends` library or manual export. Trends only returns *relative* interest per query, so the algorithm is: for each state, rank the fragrance list by normalized interest and take the argmax. Trends throttles hard, so batch queries in groups of 5 and cache aggressively.
- **Scent profiles:** scrape/curate note pyramids from a fragrance database (Fragrantica-style structured data) into a `{fragrance: {top:[], heart:[], base:[], family:""}}` lookup. Manual curation of the ~150-item list is acceptable and higher-quality than scraping everything.
- **Data model:** `states.json` = `{ "CA": {fragrance, brand, family, notes} }`; `fragrances.json` = the profile lookup.
- **Hard part:** Google Trends returns *relative* not absolute volume and is noisy/rate-limited; getting a defensible "most-searched" per state requires careful normalization and a hand-curated candidate list, or you get garbage.

## v1 scope (humiliatingly small)
- One static US choropleth, states colored by fragrance family.
- ~150 hand-curated fragrances with baked Trends rankings (one snapshot, not live).
- Hover card with name + family + note pyramid.
- PNG export of the whole map.

## Out of scope (for now)
- Live/refreshing Trends data.
- International maps or county-level granularity.
- User accounts, "rate this scent," or affiliate links.
- Audio or scent-strip gimmicks.

## Risks & unknowns
Prior-art verdict: **Partial.** "Popular fragrance by state" ranking listicles exist, but a *search-trends-driven choropleth with per-scent note profiles* does not. The fresh re-angle: treat it as a data-viz artifact (family-colored map + note pyramids + shareable state cards), not a text ranking — the encoding and the "your state smells like" hook are the novelty. Main unknown: Google Trends noise may make some states' #1 look arbitrary; mitigate with a curated candidate list and a visible "based on relative search interest" disclaimer.

## Done means
A deployed static page where a US visitor sees their state's top fragrance, hovers to read its note profile, and can export a PNG card — with all 50 states + DC populated from a real Trends snapshot.
