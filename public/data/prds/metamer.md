## Overview
Metamer is a 4–6 player hidden-role deduction game built on color perception. The host screen sets the scene ('a gallery, a suspected forgery') while each player's phone privately displays the *same* painting rendered from a shared palette. One player, the Forger, gets a palette where 2–3 swatches are shifted a small amount in hue/warmth — a metameric nudge that leaves most comparisons intact but flips a few.

## Problem
Hidden-role games rarely tap perception directly, and 'spot the different color' games have no bluffing. Metamer fuses them: the imposter's altered reality is invisible to them (they don't know *which* swatches moved), so they must answer perceptual questions from a corrupted gut while trying to conform to a majority they can only partly see — a tension no single passed-around phone could create.

## How it works
Each PHONE privately renders the painting from its palette; honest players share one palette, the Forger's has a few entries shifted. The host asks a sequence of ~5 quick comparative questions — 'Is the sky bluer or greener than the sea?', 'Which is warmer: the robe or the curtain?' Every phone answers privately and simultaneously (two-button tap, short timer). After each question the host screen shows the *anonymized* split (e.g. '3 said warmer, 1 said cooler') — but not who. Honest players cluster; the Forger, whose specific pairs are shifted, diverges on the questions touching their altered swatches. The Forger sees the running splits and can try to conform, but because they don't know which of their own colors are wrong, they can't distinguish 'my honest answer that matches' from 'my honest answer that will out me.' After the question round, every phone privately votes for the Forger; host reveals the two palettes side by side.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: `Room { paletteSeed, forgerId, forgerShifts[], questions[], answers{qId:{playerId:choice}}, votes{} }`. Server generates the base palette from a seed and the Forger's shift vector, pushes each phone only its own palette; questions are server-scripted so the shifted swatches actually flip a subset of answers. Sync: answer collection is server-authoritative with a per-question timer; splits are broadcast only after all-in or timeout to prevent copying live. Hard part: calibrating shifts across real phone screens (brightness, color profiles, viewing angle) so the metamerism is reliable — likely bounded to high-chroma swatches and warm/cool questions rather than absolute hue.

## v1 scope
- One painting, one fixed shift vector, one Forger.
- 4 players, one round, 5 scripted comparison questions.
- Two-button answers; anonymized split shown after each question.
- Flat host reveal of both palettes.

## Out of scope
- Per-device color calibration, multiple paintings, multi-round scoring, player-authored questions, more than one Forger.

## Risks & unknowns
- Screen color variance may make shifts unreliable — biggest technical risk.
- Shift too subtle = Forger never diverges; too strong = obvious. Needs playtest tuning.
- Honest players may disagree on borderline warm/cool calls, adding noise (could be a feature).

## Done means
Four phones render the seeded palette, one metamerically shifted; players answer 5 comparison questions privately with anonymized splits shown; phones vote and the host reveals both palettes; in playtests the Forger's answers diverge on shifted-swatch questions above chance.
