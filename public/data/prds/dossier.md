## Overview
Dossier is a 4–6 player hidden-role memory-and-bluff game for a shared host screen plus private phones. Everyone studies the same fictional briefing (a suspect's face, a car, an address, a time) — but one player, the Mole, is handed a briefing with a few details subtly altered. A rapid recall round then exposes who's been working from the wrong page.

## Problem
Hidden-role games usually hinge on secret WORDS or roles you protect by staying quiet. The itch here: what if the secret is a subtly-corrupted VIEW of a shared truth, and the tell leaks out involuntarily every time you answer honestly? The fun is watching yourself diverge and deciding, in real time, whether to trust your memory or fake the crowd.

## How it works
Lobby: host TV shows a room code; phones join. Each phone PRIVATELY displays a briefing card for 20s: a cartoon suspect plus 4–5 facts ("drives a BLUE sedan / lives on the 3rd floor / seen at MIDNIGHT / carries a RED umbrella"). Honest players get the canonical card; the Mole's card has 2–3 facts flipped (blue→green, 3rd→5th). The card then vanishes from every phone.

Recall round: the host TV reads one question at a time ("What color was the car?") with 3–4 choice chips. Every phone answers PRIVATELY and simultaneously within 8s. The host TV then reveals the aggregate — "3 chose BLUE, 1 chose GREEN" — without naming who. Across ~6 questions, a divergence pattern accumulates, but honest players also misremember, adding real noise. The Mole's dilemma: answer honestly (from a corrupted memory, standing out) or bluff toward the visible majority (safe, but they don't actually know the truth and guess wrong on unaltered facts too). Final phase: every phone privately nominates one player; TV tallies. Mole escapes if not the top vote.

Private per phone: your briefing (role-dependent), your live answer, your final vote. Shared on TV: the question, the anonymized answer distribution, the vote result.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, one object per room). Data model: `room{code, phase, questionIdx, briefingSet}`, `player{id, role, answers[], vote}`. Server owns the canonical + mole briefings and never ships a player another's card. Sync is turn-gated by phase; the only real-time-sensitive moment is the simultaneous answer window — server timestamps arrivals, closes the window server-side, and broadcasts the count-only histogram so no phone can infer authorship. Hard part: authoring briefing sets where the altered facts are individually plausible answers (so the Mole blends) yet collectively separable — plus keeping the histogram truly anonymous under small player counts.

## v1 scope
- One briefing set, one Mole, 4 players, one round.
- 20s study, 6 fixed questions, one vote, one reveal.
- Text + one static suspect image; no accounts, no scoring across games.

## Out of scope
- Multiple rounds, role rotation, points/leaderboards.
- Player-authored briefings, images beyond a stock face.
- Reconnect grace, spectators, mobile-vs-tablet layout polish.

## Risks & unknowns
- Honest-player noise may swamp the signal at 4 players — tune alteration count.
- Mole may find copying-the-majority strictly dominant; may need a rule rewarding the Mole for answering their own (wrong) facts.
- Anonymized histograms leak identity when counts are tiny.

## Done means
Four phones join, each gets a role-correct briefing that expires at 20s, all four answer six questions with server-anonymized histograms on the TV, a vote resolves, and the TV correctly reveals whether the room caught the Mole.
