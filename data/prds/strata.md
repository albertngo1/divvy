## Problem
A year of your working life leaves almost no artifact you can hold. Calendars are lists; screen-time charts reset weekly and get deleted. There's no *object* of a year — nothing with grain, nothing you'd frame.

## What it is
A tiny background agent that, once per day, samples a few cheap ambient signals (dominant foreground app, average CPU temperature, keystroke/idle ratio, maybe local weather) and paints a single thin horizontal layer into one tall PNG — like a mineral core pulled from a drill. Busy hot days → dense dark bands; quiet cold weekends → pale seams. It never asks for attention; it just accumulates. After 365 layers you have a scrubbable core column: hover a layer to see that day, and the visual texture alone reveals crunch weeks, vacations, and the exact stratum where a project cracked. The whole point is that it generates itself while you forget it exists.

## v1 (humiliatingly small)
A cron/launchd job that runs once a day, reads ONE signal (which app was frontmost most of the day, from a log), maps it to a color, and appends a 2px-tall stripe to a growing PNG. That's it — a striped column that gets one line taller each day.

## Done means
It's been quietly running for a week with zero interaction from you, and opening the PNG shows seven distinct colored bands you can correctly read back as "that was the Tuesday I was in the editor all day."
