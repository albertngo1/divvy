## Overview

An explorable static web atlas for journalists, students, and anyone who has ever pasted a country's population into a slide. Choose an indicator; the choropleth colors each country by the *spread* across sources rather than by the value. Click a country and you get a dot plot of every source's number, its vintage, its definition, a roundness score, and a copy-detection verdict.

## Problem

Every chart in the world renders one number per country as if it were measured. In practice, population for large swaths of Africa and Central Asia varies 20–40% between the UN, the World Bank, the CIA World Factbook, and the national statistics office — some of those countries have not run a census since the 1980s and the "number" is a projection of a projection. The uncertainty is knowable and public, and nobody draws it. Worse, apparent consensus is often laundering: three sources agreeing to six significant figures means two of them copied the third, which reads as confidence and is the opposite.

## How it works

1. Pick an indicator: total population, GDP per capita (current USD), life expectancy at birth.
2. The map colors by robust coefficient of variation (MAD ÷ median) across sources for the latest year all sources cover. Pale = agreement, hot = disagreement.
3. Click a country → a horizontal dot plot, one dot per source, with vintage badges ("2019 projection") and a definitions strip (de facto vs de jure population is usually the real culprit and must be shown or the viz lies).
4. Two forensic flags: **Roundness** — trailing-zero run length compared against a digit-distribution null, so "5,000,000" is marked as a stated guess; **Echo** — pairs of sources matching to ≥5 significant figures are drawn linked, not separate.

## Technical approach

Static site: Svelte + MapLibre GL with a Natural Earth admin-0 vector tileset. Data pipeline in Python, output as Parquet queried in-browser by duckdb-wasm (whole corpus is a few MB).

Sources: World Bank Indicators API (`api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=20000`), UN WPP CSV releases, `github.com/factbook/factbook.json` plus Internet Archive snapshots for older Factbook vintages, IMF WEO April/October releases, Our World in Data grapher CSVs.

Data model is one long table: `(iso3, indicator, year, source, source_vintage, value, unit, definition_id, url)`. The unglamorous hard part is the entity crosswalk — Kosovo, Taiwan, Western Sahara, Somaliland, Curaçao and the pre/post-2011 Sudan split each need a hand-written rule, and aggregates ("World", "Euro area") must be excluded or they dominate the color scale. Echo detection: for each source pair, compute the fraction of countries matching to ≥5 sig figs; a pair over ~0.9 gets collapsed into one node with a "derived" edge.

## v1 scope

- 3 indicators, 4 sources, latest common year only
- Choropleth + country detail panel
- Roundness flag; Echo flag as a static precomputed source-pair matrix
- No time slider

## Out of scope

Subnational units, survey-design confidence intervals, forecasts, any indicator requiring PPP conversion, an API.

## Risks & unknowns

Most "disagreement" is definitional, not epistemic; without the definitions strip the map is a slander generator. IMF WEO redistribution terms need checking. Vintage alignment (a 2024 release reporting 2022 data) is fiddly and easy to get silently wrong.

## Done means

The map loads under 2s with 3 indicators × 4 sources; clicking Nigeria shows a >25% spread with each source's definition; the Echo detector correctly identifies at least one real derived-source pair, verified by hand against the sources' own documentation.
