## Overview
Thrash is a single-player puzzle-roguelike for programmers who half-remember what LRU means but have never *felt* an eviction policy fail. Each run replays a real access trace — sampled from your own machine — and asks you to play the cache by hand: when it's full and a miss arrives, you choose what to throw out. Your score is hit rate; your opponents are the classic algorithms.

## Problem
Caching is invisible until it hurts, and the intuition for *why* a policy thrashes on a given workload is buried in textbooks. Nobody develops a gut feel for working sets by reading about them. Meanwhile your actual laptop's page cache is quietly making these choices badly for your workload and you'll never know.

## How it works
A trace is a stream of keyed accesses. You have a cache of N slots and a small look-ahead preview (like Tetris's next-piece queue). Each incoming key is a hit (green, free) or a miss; on a miss with a full cache you click which resident item to evict. Between levels you draft **policy relics**: a one-shot Belady oracle peek, a frequency sketch overlay that tints hot keys, a 'ghost list' that shows recently-evicted regrets. Par for each level is Belady's offline-optimal hit rate computed after the fact; bots (LRU/LFU/W-TinyLFU) are ghost racers on a side meter.

## Technical approach
Stack: TypeScript + React/Canvas front end; a Node or Rust trace-ingest CLI. Real traces come from `sudo fs_usage -w -f filesys` (macOS) or `strace -e trace=openat` (Linux), reduced to (key, tick) events; ship a few bundled sample traces so play works with zero setup. Reference policies: textbook LRU/LFU plus a faithful port of caffeine's TinyLFU count-min sketch + window. Belady optimal computed offline with a next-use index heap. The genuinely hard part is *game feel*: manual eviction is only fun with legible feedback, so the UI must surface each item's recency, frequency, and predicted next-use without just handing you the answer — that tension is the whole design.

## v1 scope
- One bundled trace + one 'import your own' button
- Fixed cache size, click-to-evict, hit/miss scoring
- Two bot ghosts (LRU, LFU) and a post-hoc Belady par line
- Three relics

## Out of scope
- Multiplayer / leaderboards
- Live streaming from a running process
- Multi-tier / write-back cache modeling

## Risks & unknowns
Manual eviction at trace speed may feel like whack-a-mole; may need to slow ticks or batch decisions. Trace capture needs sudo, a friction point — sample traces mitigate.

## Done means
I can import a real fs_usage trace, play it to completion, and see my hit rate ranked against LRU, LFU, and the Belady optimum on one screen.
