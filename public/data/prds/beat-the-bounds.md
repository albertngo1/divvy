## Overview

Beat the Bounds borrows the English parish ritual of walking a boundary once a year to remember where it runs. Three players, one round, one shared map on the TV. Each phone owns exactly one stake — a vertex of a single shared triangle — and privately holds one ordinance the boundary must obey. Nobody scores. When every ordinance is satisfied at once, the host stamps the bound with the date and exports a GPX of its perimeter: a walk the room can actually take tomorrow. For housemates, visiting friends, anyone who wants the party to leave a trace on the neighborhood.

## Problem

Cooperative party games are almost always about information you shout. Very few are about a *shape* three people are deforming simultaneously, and almost none end with something you can put on a wall or in a watch. The itch: a group puzzle whose solution is a physical place, and whose reward is an outing.

## How it works

The TV shows a fixed neighborhood map with ~8 labelled features (two bridges, a main road, a school, a pond, a tall tower, a corner shop, a park). A red triangle sits over it, its three vertices color-coded to the three phones.

**Privately, each phone shows:** its own stake as a big draggable thumb-target on a cropped view of the map; its single ordinance in plain English ("the bound must enclose both bridges", "the bound must never cross a main road", "the bound must exclude the school and enclose the pond"); and one lamp — red or green — for that ordinance only.

**The host screen shows:** the living polygon, its perimeter length in metres, and three anonymous lamps in a row. It never shows any ordinance text.

All three phones drag at the same time. The polygon writhes. Your ordinance can only be satisfied by where the *other two* stakes are, so you must talk — describing what you need without being able to just hold up your card. Ordinances are deliberately in tension (enclosing both bridges tends to drag the bound across the main road). When all three lamps are green and stay green for 5 continuous seconds, the host "beats the bounds": it zooms out, draws the boundary in ink, stamps the date and room name, renders a poster PNG, and offers a GPX of the perimeter to every phone.

## Technical approach

Host browser tab + phone PWAs + one authoritative WebSocket room (PartyKit / Durable Object; Socket.IO over Tailscale Serve is fine). Room state: `{phase, stakes: {playerId: [lat,lng]}, ordinances: {playerId: ruleId}, lampStates, holdStartedAt}`. Map is a static raster tile image with a known bounding box plus a hand-authored GeoJSON of the 8 features — no live geolocation, no tile server.

Phones send `dragStake {lat,lng}` at ~20Hz (rAF-throttled, coalesced). The server is the only place the polygon exists: it applies the move, then evaluates all three predicates against the GeoJSON — point-in-polygon (ray casting) for enclose/exclude, segment-intersection for "never crosses" — and broadcasts the polygon plus lamp booleans to the host, but sends each phone *only its own* lamp. Ordinance text is delivered once, per-connection, at deal time and never rebroadcast.

The genuinely hard part is the feel: at 20Hz × 3 draggers the polygon must look like one rubber band on the TV rather than three laggy pointers, so the host interpolates vertices toward server positions (~80ms lerp) while phones render their own stake optimistically and snap on correction. Second-hardest is the 5-second hold: it must be server-timed and reset atomically the instant any predicate flips, or one phone's stutter fakes a win.

## v1 scope

- 3 players, 1 round, 4-letter room code, no lobby.
- One hardcoded map image + one hand-drawn GeoJSON with 8 features.
- Exactly 3 ordinances, hand-authored, hardcoded, dealt in fixed order.
- Triangle only — 3 vertices, one per phone, no adding or removing stakes.
- 5s green hold → poster PNG on the TV + GPX download link on each phone.

## Out of scope

Live geolocation or real OSM tiles; 4+ players / more vertices; generated ordinances; elevation or walkability routing (the GPX is the raw perimeter, not a street-following route); multiple rounds; saving bounds server-side.

## Risks & unknowns

The three ordinances may prove trivially or impossibly satisfiable — solvability needs authoring by hand and a solver check, not vibes. A triangle may be too few degrees of freedom for interesting negotiation (a quadrilateral with a fourth free vertex is the likely fix, but that breaks the one-stake-per-phone symmetry). Perimeter GPX may cut through buildings and be unwalkable, which undercuts the whole keepsake premise — v1 should say "a line to follow, not a route" out loud. Small-screen dragging on a cropped map may be fiddly.

## Done means

Three phones join by code and each receives exactly one ordinance no other client ever sees; three people drag simultaneously and the TV shows one coherent writhing triangle at ~20Hz; each phone's lamp reflects only its own predicate; a deliberately wrong configuration keeps at least one lamp red; the correct configuration held 5s produces a dated poster PNG on the TV and a downloadable GPX on all three phones whose track, loaded into any map app, traces the polygon they built.
