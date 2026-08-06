## Overview
Undocumented is a solo management roguelike about maintaining one fictional company's infrastructure across twenty years and eleven administrators. You play each admin for one tenure. When you leave, the machine keeps running — and so does everything you built, minus your understanding of it.

## Problem
Every infrastructure game models entropy as a hostile external force (attackers, load spikes). The real thing is knowledge decay: the system is mostly fine, and the danger is the script named `fix.sh` that has run nightly since 2019 and nobody dares delete. No game has made forgetting the core mechanic.

## How it works
A tenure is roughly 45 minutes of in-game years. You have a fixed weekly budget of *attention* (Project Zomboid's action economy, not a clock you can pause your way out of). Every week the sim advances: disks age on a Weibull hazard curve, certs march toward expiry, log volumes grow, package versions drift past EOL, one service's memory ceiling creeps up.

You spend attention on three things: firefighting (restores health now, teaches you nothing), investigating (reveals the true cause of a symptom), or **automating** — writing a job. Writing a job opens a small form: you pick a trigger, pick effects from what you currently understand, and you *type a name*, free text, yourself. That name is the entire artifact that survives you.

When you burn out (attention debt, or a Sev-1 you couldn't clear), the run ends. Score = uptime-years. Then the next admin starts, inheriting the same world state and a crontab of your jobs — name and observed schedule only. No effects listed. No comments. You now have to reverse-engineer your own past self, and the game's cruelest joke is that `fix.sh` was yours.

Jobs can also decay: an inherited job whose assumptions no longer hold becomes an active hazard, firing silently and corrupting state until someone investigates it. Deleting an unknown job is a gamble — half the time it was load-bearing.

## Technical approach
Browser game: TypeScript + Svelte, canvas for the rack/topology view, everything else DOM. No backend; runs persist to IndexedDB as a single append-only event log so a 20-year campaign is replayable and diffable.

Core sim is a deterministic tick loop over a component graph (`host → service → dependency`), seeded PRNG so runs are shareable by seed string. Failure model: per-component hazard `λ(t)` — Weibull for disks (shape ~1.8), step functions for cert/EOL cliffs, Poisson arrivals for external incidents. Cascading failure is a BFS over the dependency edges with per-edge propagation probability.

The interesting data structure is the **job record**: `{name: string (player-authored), trigger, effects[], authoredByRun, assumptionsHash}`. `assumptionsHash` snapshots the world facts the job depended on; when live state diverges past a threshold, the job silently starts misfiring. Inheritance across runs strips everything except `name`, `trigger`, and observable side effects — the effects array is present in state but not rendered to the player.

Hard part: making inherited confusion *fair*. If the player can never recover the truth, it's frustrating rather than funny. Fix: investigation always works, it just costs the attention you wanted for something else — the tension is opportunity cost, never a locked door.

## v1 scope
- One fictional company, one fixed topology of 8 services.
- Three tenures per campaign, not eleven.
- Four hazard types: disk failure, cert expiry, disk-full from logs, dependency EOL.
- Job authoring with free-text naming, and inheritance stripping.
- Score screen: uptime-years plus a crontab listing of what you left behind.

## Out of scope
Multi-datacenter, security/attackers, hiring or team management, real config-file syntax, mod support, audio beyond UI clicks.

## Risks & unknowns
The joke may only land for people who have actually inherited a crontab — needs a tutorial tenure that manufactures the aha. Balance risk: if automating is strictly optimal, everyone spams jobs and inheritance becomes noise rather than comedy; jobs likely need an ongoing attention tax proportional to how many you don't understand.

## Done means
A playtester finishes a three-tenure campaign, and in tenure 3 is observed hesitating over a job they personally wrote in tenure 1 — then either deletes it and breaks something, or investigates it and says "oh, that was me."
