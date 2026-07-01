## Overview
Jewel Case is a web tool that generates a print-ready, fold-it-yourself physical package — front cover, spine, back-of-box screenshots and blurb, plus a little instruction manual — for games you only own as digital licenses. With physical discs ending, it's a nostalgic, slightly defiant craft project: give your ghostly Steam library a shelf presence again.

## Problem
We're sliding into a world where you own nothing on a shelf — no spines, no manuals, no box art in your hands. That's a real emotional loss for a generation raised on jewel cases and fold-out maps. Nobody's making it easy to reclaim the artifact even if the disc is gone.

## How it works
You paste a Steam profile URL or an AppID. The tool pulls the game's metadata, header art, and screenshots, then lays them into a classic DVD/jewel-case template: wraparound cover with spine text, a back panel with a blurb and three screenshot thumbnails plus fake system requirements, and a 4-page mini-manual (controls, lore snippet, "notes" page). Export a print-at-home PDF with crop marks and fold lines. A few template skins: PS2 blue-spine, PC big-box, Dreamcast.

## Technical approach
Stack: SvelteKit/Next front end; a small server proxy to hit the Steam Store API (`store.steampowered.com/api/appdetails?appids=`) and SteamGridDB for higher-res cover art, keeping keys server-side and caching responses. Layout is done in SVG at exact print dimensions (e.g., a 273×183mm DVD wrap) and rasterized to PDF with a headless-Chrome/`pdf-lib` pipeline so crop marks and fold guides land precisely. Templates are parameterized SVG with slots for art, title, spine, and screenshots. The genuinely hard part is print fidelity: correct bleed/margins, DPI-correct raster of Steam's compressed art (upscale gently), and fold geometry that actually assembles into a real case — which needs a physical test print, not just an on-screen preview.

## v1 scope
- Steam AppID → one DVD-case template
- Front cover + spine + back panel with real art/screenshots
- Print PDF with crop and fold marks
- One test print that folds into a case correctly

## Out of scope
- The mini-manual (v2), multiple template skins
- Non-Steam stores (GOG, PSN)
- Ordering real prints / merch

## Risks & unknowns
Steam art resolution is low for print; upscaling may look soft. Steam API rate limits and TOS for reusing art. Getting fold geometry to physically assemble is fiddly and needs iteration with a printer and scissors.

## Done means
Given a real AppID, the tool produces a PDF whose front, spine, and back carry that game's actual art and screenshots, and a printed copy folds into a case that reads correctly on a shelf.
