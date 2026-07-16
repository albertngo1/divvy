## Overview
Ratio is a browser tycoon/management sim where you run a fictional invite-only file-sharing tracker in its golden age. Aimed at the OiNK/What.CD nostalgia crowd and management-game fans, it turns the arcane social economy of private trackers — ratio, invites, freeleech, staff drama, and looming raids — into a playable, entirely fictional simulation.

## Problem
The HN piece mourning "the lost joy of music piracy" romanticizes a culture almost nobody experienced from the inside: the ratio economy, the curatorial pride, the constant paranoia. That texture is begging to be a game, but no one has grafted a tycoon loop onto it. It's a rich, untouched setting hiding in a nostalgia thinkpiece.

## How it works
Turn-based months. Each tick you allocate: server capacity, invite generosity, and staff attention. Members have simulated behavior — seeders keep the economy healthy, leechers drain it, hit-and-runners tank community ratio. You run events: a freeleech weekend spikes signups but strains bandwidth and dilutes ratio discipline; a donation drive funds a new seedbox; an invite forum thread can import a whole vibrant community or a nest of ratio cheaters. A rising "heat" meter tracks anti-piracy attention; ignore opsec and you get a raid event that can end the run. Win conditions: reach a target member count and library completeness before heat or economic collapse ends you.

## Technical approach
Stack: TypeScript + a lightweight state store (Zustand) + Canvas/SVG dashboard, fully client-side, localStorage saves. Core is a deterministic seeded simulation: member cohorts modeled as a small agent population with ratio/activity attributes updated by difference equations each tick; events are cards drawn from a weighted deck seeded per run (no `Math.random` reliance — seedable PRNG so runs are shareable). Flavor text (genre-curation snobbery, staff chat) generated from handwritten template banks. Hard part is tuning the economy so freeleech is tempting-but-dangerous and the death spiral feels earned, not arbitrary — needs a tunable balance sheet and playtesting.

## v1 scope
- 24-month single scenario, one win/lose condition.
- Three sliders (capacity/invites/moderation), five event cards, one raid endgame.
- Shareable seed + end-screen scorecard.

## Out of scope
- Any real files, torrents, or networking — pure sim.
- Multiplayer / persistent leaderboards.
- Multiple eras or genres beyond one.

## Risks & unknowns
- Must stay unambiguously fictional/satirical to avoid glorifying-piracy optics.
- Economy tuning is the whole game; easy to make it boring or unfair.
- Nostalgia audience is niche; retention depends on run variety from few event cards.

## Done means
A player can complete a 24-month run, trigger at least one freeleech and one raid event, hit either a win or a collapse end-screen, and copy a seed string that reproduces the same run for a friend.
