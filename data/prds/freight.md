## Problem
Backup and sync jobs are invisible until they break. A progress bar is boring and forgettable, so nobody watches, so nobody notices the nightly job that's been silently failing for three weeks.

## What it is
A single ambient dashboard that renders each running data-transfer job (rsync, restic, borg, a `cp` you kicked off) as a cargo truck driving a side-scrolling highway. Distance-to-destination = bytes remaining. Truck speed = current throughput. Driver-fatigue meter = CPU/thermal load (throttle → the truck slows and the driver yawns). A stalled job's truck pulls over with hazards blinking; a completed haul honks and unloads at the depot. Leave it open on a spare monitor — it's a glanceable status board that happens to be an ETS2 fever dream.

## v1 (humiliatingly small)
One truck, one hardcoded job: parse the live progress of a single `rsync --info=progress2` piped into the page over a websocket. Truck moves right at a speed proportional to MB/s. Reaches the depot when done. No fatigue, no crashes, one lane.

## Done means
You start an rsync in a terminal, glance at the browser tab, and a little truck is visibly crawling toward a depot at a speed you can feel — and when the transfer finishes the truck arrives and honks.
