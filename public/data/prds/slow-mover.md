## Overview
A tense, keyboard-driven solo game about identification under uncertainty. You are the duty identification officer at a NATO-flank sector operations centre. You do not fly and you do not shoot; you *classify*. Each shift you work a dozen radar tracks and decide, for each, what it probably is and what response the rules of engagement permit. For people who loved Papers, Please and Return of the Obra Dinn but want the ambiguity to be statistical rather than puzzle-shaped.

## Problem
Every air-combat game hands you ground truth in a HUD label. The real, currently newsworthy problem — drones crossing a border three nights running, indistinguishable on scope from an ultralight — is that you must act on a posterior, not a fact. No game models restraint as the skill.

## How it works
The scope shows tracks as position history plus whatever your sensors currently earn you:
- **Primary radar**: noisy position, derived speed/heading/altitude, crude RCS band.
- **Secondary/ADS-B**: only if the target squawks — silence is evidence, not proof.
- **ESM**: emitter class, only while the target radiates.
- **EO/IR from an intercept**: decisive, but costs 6+ minutes and a scarce alert pair, and is weather-gated.

For each track you set a belief slider across five identities (airliner off-route, GA/ultralight, bird flock, decoy, one-way attack drone) and pick a rung on the ROE ladder: monitor → query on guard → scramble intercept → engage. Then the shift clock runs regardless. A track that reaches a protected point while you were still gathering evidence is a failure. So is a scrambled intercept on a Cessna with a dead transponder, three times in one month, on the news.

The debrief is the whole game: it replays the shift and overlays the **optimal Bayesian posterior** at every timestep given exactly the evidence you had. You find out whether you were wrong or merely unlucky.

## Technical approach
Godot 4 (GDScript) or TypeScript + canvas; no 3D needed. The generative model is the scoring model — that's the design lock. Each identity class is a distribution over a kinematic state: cruise speed, altitude band, climb rate, turn-rate ceiling, RCS log-normal, transponder-on probability, emitter schedule. A track is a sampled true class run through a Dubins-path motion model with process noise; sensors are explicit likelihood functions applied to the true state (Gaussian position error scaled by range, Bernoulli detection, censored ESM). Because the sim *is* the likelihood, the ideal posterior is a closed-form recursive Bayes filter over five hypotheses — cheap to compute and honest to display. Player belief is scored by Brier score integrated over time, weighted by decision moments. Kinematic envelopes seeded from public performance figures (Shahed-class ~180 km/h at 1–2 km; ultralight ~120 km/h; birds <90 km/h, erratic).

Hard part: authoring scenarios where the correct answer is genuinely uncertain but the *decision* is still learnable — tuning class overlap so pure guessing loses and good triage wins.

## v1 scope
- One 15-minute shift, 8 tracks, 3 identity classes
- Primary radar + transponder only
- Belief slider, two ROE rungs (monitor / scramble)
- Debrief with posterior overlay and Brier score

## Out of scope
- Campaign, politics meter, multiple sectors, real geography, any 3D
- Multiplayer of any kind

## Risks & unknowns
The subject is live news; the framing must stay on restraint and civilian protection, not kill-count. Ambiguity may read as unfairness if the debrief isn't legible enough. Brier score is unintuitive — needs a plain-language translation ("you were 80% sure and right 40% of the time").

## Done means
A playable shift where a tester who ignores evidence and always scrambles scores measurably worse than one who triages, and the debrief convinces a losing player they were unlucky rather than cheated.
