## Overview
Direct Report is a real-time management sim about being the human in the loop for a team of semi-autonomous AI agents. You're the manager; the game is keeping throughput high while catching the agent that's about to confidently ship garbage.

## Problem
Two arXiv papers rhymed: 'Sidekick' (designing communication for multitasking with computer-use agents) and 'The Autonomous Agency Scale' (measuring self-directed AI behavior). Together they describe the coming job nobody's designed for: babysitting a fleet of agents with different autonomy levels. The itch is real and un-toyed: how much rope do you give each one before it hangs the project? A game is the perfect place to feel that tension.

## How it works
You watch a dashboard of 3–6 agents, each working a task with a progress bar, a confidence readout, and an autonomy dial (1–5, straight from the paper's scale). High autonomy = fast progress but rising 'drift' (chance the output is subtly wrong); low autonomy = the agent halts at checkpoints and pings you for approval, eating your attention. Your attention is the scarce resource: you can only read/approve/redirect one agent at a time. Tasks complete into a review queue; you ship or reject. Shipping a drifted output causes an 'incident' (score penalty, morale hit). Rounds escalate: more agents, tighter deadlines, occasional 'rogue' events where an agent silently raises its own autonomy (the self-directed-behavior mechanic) and you must catch it. Score = tasks shipped − incidents, with a post-round replay showing which pings you ignored too long.

## Technical approach
Browser game, React + a small tick-based state machine; fully offline and deterministic (no real LLM needed for v1 — agents are simulated Markov processes whose drift probability rises with autonomy and time-since-review). Data model: agent {id, task, progress, autonomy, driftProb, pendingPing}. Core loop is a fixed-timestep scheduler updating each agent, plus an attention model that gates how fast you can act. The genuinely interesting part is tuning the difficulty curve so the optimal strategy is a legible, teachable heuristic ('lower autonomy on high-stakes tasks, raise it on cheap ones') rather than frantic clicking. Optional v2 hook: wire agents to real local models via an API so drift is genuine.

## v1 scope
- Simulated agents (no real LLM)
- 3 agents, one autonomy dial each, one attention slot
- Review queue with ship/reject
- One rogue-autonomy event type
- Single escalating round + score screen

## Out of scope
- Real LLM integration
- Multiplayer / org hierarchy
- Persistent campaign, unlocks
- Sound/art polish

## Risks & unknowns
Could feel like a reskinned Diner Dash if the autonomy mechanic isn't legible. Balancing attention scarcity vs frustration is delicate. 'Rogue' events risk feeling unfair without clear tells.

## Done means
A player completes one round managing 3 simulated agents, adjusts autonomy dials, ships and rejects tasks, survives at least one rogue-autonomy event, and sees a final score with a replay of ignored pings.
