## Overview

False Color is a 4–6 player hidden-role party game for a TV/laptop host screen plus phones. Everyone stares at the same chart. Nobody can read it alone. One person is reading it wrong and doesn't know.

For groups who like Herd Mentality / Wavelength but are tired of games where the traitor has to *act*. Here the traitor's tell is not nerves — it's coherence with the wrong document.

## Problem

Most hidden-role games ask an ordinary person to lie convincingly under scrutiny. That's a performance skill, unevenly distributed, and it's why the same friend wins every time. The itch: a deduction game where the odd one out is being completely honest, and the group has to find the seam between two internally-consistent stories.

## How it works

**Host screen (shared):** one abstract chart — say a 6-bar chart, or a 12-cell grid choropleth — rendered in six saturated colors with no legend, no labels, no numbers. Just shapes and colors. It stays up the whole round.

**Each phone (private):** a legend. Color swatch → category name. "Teal = Denmark. Coral = Brazil. Ochre = Kenya…" Five players get the true legend. One player gets a legend with exactly two entries transposed. Nobody is told which role they have. Everybody believes they're the honest one.

**The talk phase (3 min, timer on TV):** players take turns saying one sentence about the chart. Hard rule enforced socially and printed on the TV: *you may name categories, never colors.* "Brazil is nearly double Kenya." "Denmark is the short one on the left." The swapped player's sentences are grammatical, confident, and subtly incompatible.

**The vote:** every phone privately picks one player. The TV reveals the true legend, the doctored legend, and who held it. Scoring: honest players score for fingering the swapped one; the swapped player scores if they escape *or* if they self-report before the vote (a "Miscalibrated" button on their phone) — which is only findable once they realize the group's picture can't be theirs. That button is the whole late-game tension.

The phone is load-bearing and non-negotiable: the entire game is that six people hold six copies of a document and one copy differs. Hand one phone around the room and the game evaporates in four seconds.

## Technical approach

Host tab and phone PWAs both connect to a single PartyKit Durable Object keyed by a 4-letter room code. Server is authoritative and holds the only copy of the truth.

Data model: `Room { code, phase: lobby|talk|vote|reveal, players: [{id, name, connected}], chart: {bars:[{colorId, value}]}, trueLegend: {colorId → category}, swappedPair: [colorIdA, colorIdB], impostorId, votes: {voterId → targetId}, selfReported: bool }`.

Sync strategy: the server broadcasts a redacted room state to the host and a *per-socket personalized* payload to each phone — `myLegend` is computed at send time by applying the swap only for `impostorId`. No client ever receives another client's legend, so a devtools-open player learns nothing. Phase transitions are server-driven with a server-owned timer; clients render countdowns off a `phaseEndsAt` epoch and a one-time clock-offset handshake, never a local `setInterval` counter.

The genuinely hard part isn't sync — it's **chart generation**. The chart must be readable enough that six honest people converge on one story, while the swapped pair must produce statements that are *plausible but contradictory*. Swap two bars of nearly equal height and nothing happens. Swap the tallest and shortest and the imposter outs themselves in sentence one. v1 punts entirely: three hand-authored charts with hand-picked swap pairs, playtested until the tuning is understood.

## v1 scope

- One round. Exactly 5 players, exactly one imposter. No lobby polish.
- Three hand-authored chart+legend+swap-pair sets, chosen at random.
- Host screen: chart, turn order highlight, 3:00 timer, vote tally, reveal.
- Phone: name entry, legend card, "Miscalibrated" button, vote list.
- Scoring printed as text at reveal. No persistence, no accounts, no rematch.

## Out of scope

Procedural chart generation. Multi-round series. Sound. Spectators. Reconnect-after-refresh (a dropped phone ends the round). Colorblind-safe palettes are a real accessibility gap but the color-swap mechanic needs re-designing around shape or texture to solve properly — deferred, and flagged loudly.

## Risks & unknowns

The imposter may be obvious within two sentences, collapsing the round to 40 seconds. Or the chart may be so ambiguous that honest players sound as broken as the imposter and the vote is noise. That tuning window is narrow and unproven. Second risk: the no-colors speech rule is unenforced by software, and one player saying "the teal one" ends the round instantly — v1 accepts this and tests whether groups self-police.

## Done means

Five phones and one laptop on the same Wi-Fi complete a full round end-to-end without a reload. Across ten playtest rounds, the imposter is voted out more than 40% and less than 80% of the time, and at least three rounds see a player press "Miscalibrated" unprompted.
