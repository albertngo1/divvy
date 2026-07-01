## Problem
HN keeps asking 'have you restarted your computer this week?' — uptime is a fact everyone carries and nobody sees. Your machine already keeps a meticulous diary of every sleep, wake, kernel panic, and cold boot, and it's completely invisible. There's no artifact of the thousands of tiny sessions that make up a year at a desk.

## What it is
A background menubar app that reads the system power log (`pmset -g log` / `log show` on macOS) and renders a live, ever-growing radial 'tree ring' image. The clock hand sweeps once per day around a ring; each ring is one week or month. Sleep = thin band, clean shutdown = notch, unexpected reboot/panic = a red scar, long uptime streaks = thick dense wood. It just sits there and thickens. At year's end you export a single high-res PNG of your machine's biography.

## v1 (humiliatingly small)
A script that parses the last 30 days of `pmset -g log`, buckets events into (day, type), and draws ONE static radial PNG with a colored tick per event. No live update, no menubar — just `python rings.py` → `rings.png`. If a panic shows up as a red scar, ship it.

## Done means
Running the script on your own machine produces a ring image you actually want to set as a wallpaper, and you can point at a specific red scar and remember 'oh yeah, that was the kernel panic during the demo.'
