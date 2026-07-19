## Overview
Brownout is a self-hosted image-transcoding proxy for hobbyist web servers that turns your monthly data-transfer budget into a visible, ambient gauge: as the quota depletes, images across the site degrade — softer, blockier, grayer — then snap back to full quality when the billing cycle resets. It's the 'Regressive JPEGs' project fused with the 'death and rebirth of my home server' ethos: a serious infra concern (bandwidth caps) rendered as an ambient artifact that quietly authors itself over a year.

## Problem
Solo operators on cheap VPS/home connections have transfer caps, but usage is an opaque number in a dashboard you never check until you're throttled or billed. Meanwhile everyone wants their indie site to feel *alive*. Why not make remaining bandwidth something you can literally see, and buy yourself headroom automatically at the same time?

## How it works
Brownout sits in front of your static site. It tracks bytes served this cycle against a configured quota. A 'health' value = remaining/quota drives a degradation curve applied on-the-fly to images: at 100% health, originals; at 50%, lower JPEG quality and slight downscale; near 0%, aggressive quantization, desaturation, and heavier compression. Because worse images are smaller, degradation is self-correcting — the site throttles its own consumption as it browns out, extending your runway. A tiny status footer ('atmospheric quality: 62%') and an optional year-long thumbnail strip lets you watch each month's brownout-and-recovery accrete into a calendar poster.

## Technical approach
A Caddy plugin or a small Go/Rust reverse proxy using libvips (govips) for fast transcoding, with an LRU disk cache keyed by (path, health-bucket) so each bucket is transcoded once per cycle, not per request. Byte accounting is a rolling counter persisted to SQLite; cycle boundary configurable. The degradation curve maps health→{jpeg quality, scale, saturation, chroma subsampling}. The genuinely hard part is caching sanely: quantize health into ~10 buckets so you don't regenerate constantly, and make CDN/browser caches cooperate via short max-age plus a health header in the Vary. A monthly job stitches one representative thumbnail per day into a growing PNG for the ambient poster.

## v1 scope
- Proxy that transcodes JPEG/PNG through libvips by a single health value
- SQLite byte counter with configurable monthly quota + reset
- 10 health buckets, disk cache per bucket
- Status footer showing current 'atmospheric quality'

## Out of scope
- Video, non-image assets
- Multi-origin / CDN integration
- Per-visitor fairness or auth

## Risks & unknowns
- Serving paying/real users worse images is a real UX cost — needs an opt-in 'aesthetic only' mode that caps minimum quality
- Cache invalidation across health-bucket transitions
- Byte counting accuracy behind an upstream CDN

## Done means
Running in front of a demo site, I can watch image quality provably drop as I burn simulated quota, see the byte counter and health footer track it, confirm degraded pages weigh less, and it resets cleanly at cycle rollover — with one month's daily thumbnails stitched into a poster strip.
