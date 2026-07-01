## Problem
That HN post asked 'have you restarted your computer this week?' — nobody has. Uptime is invisible dead data. What if neglecting your reboot was *caring* for something?

## What it is
A reverse-tamagotchi living in your menubar. It reads system uptime and evolves: a fresh reboot spawns a tiny larva; days of uptime mutate it into a bloated, barnacled elder that whispers about the processes it's seen. Restarting the machine 'kills' the current familiar — it gets a headstone in a little graveyard log, and a new larva is born. The tension: OS wants you to reboot for updates, the familiar wants to live forever.

## v1 (humiliatingly small)
Mac menubar app (SwiftBar/Electron/rumps). Reads `uptime`. Maps uptime to one of ~6 ASCII/emoji life stages. On reboot detection (uptime reset), append a line to `graveyard.txt` with the dead familiar's max age. That's the whole thing.

## Done means
I can look at my menubar, see my familiar's current life stage, and after a forced reboot I feel a genuine flicker of guilt reading its tombstone.
