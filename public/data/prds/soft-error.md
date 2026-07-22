## Overview
Soft Error is an ambient wallpaper/screensaver for homelabbers with ECC RAM. It turns the invisible drizzle of single-bit memory errors — cosmic rays, alpha particles, thermal noise — into a slowly growing constellation. By December your desktop is a year-long map of every stray particle your server caught and healed.

## Problem
ECC memory quietly corrects bit-flips all day and logs them where nobody looks (`rasdaemon`, EDAC counters). That data is a genuinely cool physical signal — you're detecting radiation — but it dies in a syslog. Meanwhile people pay for ambient art that means nothing. Here's ambient art that's a real instrument reading of the space weather in your closet.

## How it works
A background collector polls corrected-error events from the kernel. Each correctable error becomes a fleck placed on a dark canvas: position seeded from the physical DIMM/rank/bank/row address (so errors cluster by chip, revealing a weak module as a bright region), brightness from recency, hue from CPU/ambient temperature at that moment. Bursts render as brief showers. Uncorrectable errors — the scary ones — flash red and get a timestamped log. The image persists and accretes for 365 days; a New Year's export renders a high-res 'radiation almanac' poster with monthly bands and total particle count.

## Technical approach
Stack: a small Rust or Go collector + an HTML5 canvas/WebGL renderer served locally (or a native GLSL screensaver). Data source: `rasdaemon`'s SQLite ras-mc-ctl database, or parse `/sys/devices/system/edac/mc/*/ce_count` and dmesg EDAC lines directly; on servers, scrape IPMI/redfish sensor logs for temperature. Data model: append-only event log `{ts, mc, rank, bank, row, col, type, temp}`; renderer maps DIMM topology to a deterministic 2D layout via a hash of the address bits so the same failing cell always lands in the same pixel. Key detail: dedup/aggregate storms so a flapping cell doesn't whiteout the canvas. Hardest part: correctable-error rates on healthy consumer ECC are *very* low (maybe a handful a month), so v1 needs a graceful 'quiet sky' aesthetic and optionally a synthetic-injection demo mode (`edac` error injection) so the thing looks alive during development.

## v1 scope
- Linux collector reading rasdaemon/EDAC counters into a local event log
- Canvas renderer: dark field, flecks by DIMM address, brightness decay
- Uncorrectable-error red flash + logged alert
- Manual PNG export of the current sky

## Out of scope
- Windows/macOS ECC support
- Cross-machine aggregation
- Real geomagnetic/solar-weather correlation (tempting v2)

## Risks & unknowns
- Consumer boxes may log near-zero events — needs the injection/demo path to be compelling
- EDAC address decoding varies by memory controller; topology mapping may be coarse
- People without ECC can't use it (niche by design)

## Done means
On a machine with rasdaemon running, injecting 50 correctable errors across two ranks produces 50 flecks clustered into two distinct regions, brightness decays over minutes, an injected uncorrectable error flashes red and appears in the alert log, and the PNG export shows the accumulated field.
