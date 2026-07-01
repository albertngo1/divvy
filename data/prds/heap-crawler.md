## Overview
Heap Crawler renders a running Postgres database as a 2D side-scrolling mine. The HN post on reading Postgres internals is fascinating but reads like a spelunking log; this turns the actual on-disk layout into something you can *walk through*. It's for backend devs who want to feel their table's physical structure — and secretly learn what bloat, fill factor, and dead tuples really are.

## Problem
Database internals are invisible and abstract. Engineers know `VACUUM` and "bloat" as words, not as things with shape and size. Tools like `pageinspect` dump numbers into a terminal; nobody builds intuition from a table of `t_xmin` values. The physical reality — pages, item pointers, dead tuples piling up — has an obvious spatial metaphor that no tool exploits.

## How it works
You point Heap Crawler at a table. It renders each heap page as a vertical chunk in a scrollable canvas world. Within a chunk, each line pointer is a block: live tuples are solid ore colored by a chosen column's value, dead tuples are cracked "rubble," and free space is empty cave. You scroll/pan through the table's physical order. Clicking a tuple "mines" it — a panel shows its column values and header (xmin/xmax, HOT chain). Run `VACUUM` and watch rubble clear and free space open up in real time.

## Technical approach
Stack: a tiny read-only Node/Express backend + canvas front-end (reuse Divvy's pan/zoom). Data source: the `pageinspect` extension — `heap_page_items(get_raw_page('tbl', N))` yields per-tuple offset, length, and `t_infomask` flags; `pg_class.relpages` bounds the world; `pg_freespace` gives free space per page. The backend streams pages on demand as the viewport moves (never loads the whole table). Data model: `page{n, items[{offset, len, dead, colval}], freebytes}`. Key structures: a viewport→page-range mapper and a color scale over a selected column. The genuinely hard part is performance and safety on big tables — pagination by viewport, a hard read-only role, and decoding `t_infomask` bits correctly to tell live from dead from HOT-updated.

## v1 scope
- Connect to a Postgres URL, list tables, pick one
- Render first N pages as chunks with live/dead/free blocks
- Scroll to stream more pages on demand
- Click a tuple to see its decoded header + values
- Color ore by one chosen column

## Out of scope
- Index/TOAST/visibility-map visualization
- Live VACUUM animation (v2 payoff)
- Write operations of any kind

## Risks & unknowns
- `pageinspect` requires superuser to install; some hosts block it
- Very wide tuples or TOAST pointers complicate the "one block per tuple" metaphor
- Rendering thousands of pages smoothly needs canvas batching

## Done means
Against a demo table with churn, Heap Crawler renders its pages, visibly distinguishes live tuples from dead ones, lets you click a tuple to read its real column values, and streams new pages as you scroll without loading the full table.
