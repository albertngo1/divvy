## Overview
A 4-player drawing game where nobody draws. A single virtual pen leaves one continuous line across a page on the host TV for three minutes, and each player's phone controls exactly one axis of that pen. The output is a print that no individual made and no individual could have made — the keepsake is the whole point, and there is no score.

## Problem
Collaborative drawing games (exquisite corpse, Drawful) are really just several solo drawings stapled together; authorship survives intact and you can always point at the bad bit and name who did it. Splitting the *control* rather than the *canvas* makes a genuinely unattributable object, and it makes the room talk out loud constantly.

## How it works
Four fixed roles, assigned at join. Every phone shows its own control and a deliberately crippled view:
- **Heading** — a rotary dial. Sees a tight close-up window around the pen tip only, roughly 10% of the page. Steers with no idea where they are.
- **Speed** — a slider from 0 to max. Sees no canvas at all: a speedometer and a scrolling strip of recent motion. Fully blind driver.
- **Width** — thin↔thick. Sees the page as a blurred silhouette with no pen cursor: mass, not moment.
- **Camera** — drags and pinches the viewport. The only player who sees the whole page and where the line is landing, and the only one who can't touch the line.

The pen never lifts. The line never breaks. Each phone also privately holds a secret subject ("a lighthouse", "a sleeping dog", "a fern", "a bridge") plus five banned synonyms. Talking is not just allowed, it's the game — you may say anything except your word, so the room spends three minutes shouting geometry at each other while four incompatible pictures fight for the same line.

The host TV shows only the drawing: no controls, no names, no timer chrome beyond a thin bar. At time-up the line freezes and the page renders as a print with the four subjects listed at the bottom in random order, unattributed. Optional 20s coda: everyone guesses which word was whose, purely for laughs. Then one vote — **frame it or bin it**. Binning deletes it irrecoverably, which is what makes saving it mean something.

## Technical approach
Host tab is authoritative and integrates the pen at 60fps. Phones send input deltas (not state) at ~20Hz over a PartyKit Durable Object, which owns role assignment and rebroadcasts inputs. Data model: `{roles{pid:axis}, path:[{t,x,y,heading,width}], subjects{pid:word}, phase}`.

The genuinely hard part is real-time sync for the Heading player, who needs a live pen-tip close-up or steering feels dead. The trick is to **never stream pixels**: broadcast the path as ~12-byte samples at 20Hz, keep an identical path buffer on every client, and let each phone render its own projection locally — close-up, blur, thumbnail. Phones render 100ms behind the host tick for smoothness; late joiners get a path snapshot. Total bandwidth is a few kB/s.

## v1 scope
- Exactly 4 players, fixed roles, 3 minutes, one line.
- One subject list of four words, no reshuffling.
- Speed cap, edge bounce, sane width range so it can't become mush.
- PNG export as a QR on the TV; one frame-it-or-bin-it vote.

## Out of scope
Variable player counts, pen lift, color, undo, replay animation, a saved gallery, plotting to real paper (tempting, later).

## Risks & unknowns
It may reliably produce scribble rather than anything worth keeping. Steering latency above ~150ms makes the dial feel unattached. Four secret subjects may be one or two too many — it might need only two. Continuous dial control on a small screen is fiddly for some hands.

## Done means
Four phones, three minutes, one unbroken line, exported as a PNG the room voluntarily chooses to save; each phone verifiably shows only its own axis and its own restricted view; steering latency measured under 120ms p95 on local wifi; and no phone at any point renders the full page with a live cursor except Camera's cursorless thumbnail.
