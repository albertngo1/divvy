## Overview

A four-player, one-round hidden-role game for a living room with a TV and four phones. One player is the SUBJECT. The other three are CLAIMANTS who each privately receive a three-line dossier of the Subject's real answers — except one claimant's phone is quietly serving a *different player's* real answers under the Subject's name. That player, the DONOR, is sitting right there, hearing their own secrets described as someone else's.

## Problem

Hidden-role games hand the imposter a blank: they know nothing and must bluff from air, which is stressful and mostly punishes bad improvisers. Nobody wants that seat. Here the odd player out is *confident and completely sincere* — they're working from true, specific, checkable facts. They just have the wrong file. Lying is replaced by honest, well-sourced wrongness, which is funnier and much easier to play badly-on-purpose.

## How it works

1. **Intake (45s, private).** Every phone asks three prompts: a chore you skip, an app you'd delete last, a food you'd never eat. Answers are never shown publicly.
2. **Deal.** TV names the Subject. The three claimant phones each show `SUBJECT: Priya` with three dossier lines beneath. Two are Priya's actual answers. One phone silently shows the Donor's answers instead. Nobody is told their file is bad. The Subject's phone shows no dossier — only a secret grading strip.
3. **Claims.** In TV-driven turn order, each claimant says one sentence aloud predicting something about the Subject, leaning on a dossier line without quoting it. They tap which line they used; the TV shows only "used line 2" as a bar, never the text.
4. **Grading.** After each claim the Subject taps ✓ or ✗ privately. Grades stay hidden until the vote.
5. **Vote (private, simultaneous).** Everyone names who had the bad file *and* who they think the Donor was. The Mole separately guesses whose file they were reading.
6. **Reveal.** TV prints the file map, the grades, and both dossiers side by side.

Scoring: clean claimants +2 for catching the Mole; Mole +3 if uncaught, +2 for naming the Donor; **Donor scores only if the room fails to identify them** — so the one person with certainty must sit on it rather than lead the accusation.

## Technical approach

PartyKit Durable Object per room; phones are a PWA over Tailscale Serve, host is a plain browser tab. Model: `room{players[], intake:{pid:[3]}, round:{subjectId, fileMap:{claimantId→sourceId}, claims[], grades[], votes}}`. Dossiers go out on **per-connection** messages only — the broadcast channel never carries answer text, so a leaked host devtools session reveals nothing. State is keyed on `playerId`, not socket, so a phone reload re-serves the identical (possibly wrong) file.

The hard part isn't sync — turn rate is low. It's **choosing the Donor**: their answer set must be plausible for the Subject but not accidentally identical. v1 scores candidate donors by token overlap and picks from a mid-similarity band, rejecting exact matches.

## v1 scope

- Exactly 4 players, one round, one Subject
- 3 text prompts, plaintext only, no avatars
- Claims spoken aloud; only the line-used tap is transmitted
- One vote screen, scores as plain text on the TV
- No accounts, no persistence, room dies with the tab

## Out of scope

Multiple rounds, rotating Subjects, 5+ players, two Moles, custom prompt packs, images, any scoring history.

## Risks & unknowns

Donor detection may be *too* instant, collapsing the round — mitigated by the Donor's incentive to hide. Answers may be too generic to be distinguishable ("pizza"); prompt wording carries most of the weight and will need three playtests of tuning. Four-player-only limits table fit.

## Done means

Four phones join over LAN, one round completes end to end, exactly one phone displayed a mismatched dossier, the reveal screen correctly diffs the two files — and in a live playtest the Donor visibly reacted to hearing their own answer attributed to the Subject.
