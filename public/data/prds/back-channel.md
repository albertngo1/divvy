# Back-Channel

## Overview
Two Agents secretly need to transmit a target phrase to each other through an ordinary-looking group chat. An Eavesdropper (also in the group) is trying to detect the covert channel and decode the phrase. The chat must appear normal — spectator can't tell who's an Agent — but subtle patterns (word choice, message length, timing) can encode letters. (Concept sibling to Divvy's existing Cover Traffic scanner idea, adapted for concurrent-room party format.) Per-phone is load-bearing because Agent roles and target phrase must be genuinely private; a shared screen collapses the whole game.

## Problem
Party games rarely reward subtlety — most reward loud disclosure. Steganography is a real, gorgeous idea in security research but nobody has translated it into party-game form. The gap: information-hiding games as party mechanic. Also: LLMs make this concretely feasible — a spectator LLM can score both "did the phrase land?" and "did the chat look natural?" in a way humans couldn't reliably arbitrate.

## How it works
Room code join, 4-6 players. Setup: 2 players are secretly assigned Agent roles + a shared 5-word target phrase (e.g. "meet at the docks midnight"). Others are neutrals. One neutral is designated Eavesdropper. All players (Agents, neutrals, Eavesdropper) participate in a themed group chat around an innocuous prompt ("plan a birthday dinner", "argue about movies"). Chat runs for 3 minutes. Agents must smuggle the target phrase via any encoding they can invent (first letters of messages, message length ≡ letter index, timing patterns). Eavesdropper watches the chat and after 3 minutes types their guess for (a) who the Agents were, and (b) what the phrase was. Reveal: score based on Agents' success vs Eavesdropper's catches.

## Technical approach
PartyKit / Durable Objects. Room state = `{roles: {player_id: agent|neutral|eavesdropper}, target_phrase, chat_log with timestamps, eavesdropper_guess}`. LLM (Haiku) generates the innocuous chat topic prompt at start. Post-game, optional Haiku call to grade "how natural did the chat look?" as bonus scoring for Agents. Chat UI is standard message list with timestamps visible (letting timing-based encodings be built).

## v1 scope
5 players (2 Agents + 2 neutrals + 1 Eavesdropper), 3-minute chat window, hand-authored chat topic (skip LLM in v1 for simplicity), hand-authored target phrase set (~20 phrases in the deck), Eavesdropper's guess = free-text phrase + name list. Score = 1 point per Agent success + 1 point per Eavesdropper correct guess. No LLM naturalness bonus in v1.

## Out of scope
LLM naturalness grading, custom target phrases, multi-round tournaments, hint mechanics for Eavesdropper, replay analysis, encoding suggestion UI (Agents must invent their own), spectator scoring, chat search/filter tools.

## Risks & unknowns
The mechanic assumes players can invent an encoding on the fly under time pressure — new players may freeze up. Hint mechanic ("first letters of each message") may be needed as a fallback scheme players can default to. Chat 3 min may be too short for Agents to establish an encoding AND transmit; playtest to tune. If Agents' encoding is TOO obvious (they message every 5 seconds in a distinct pattern), Eavesdropper wins trivially. If TOO subtle, phrase never gets through. Balance is delicate. Playtest question: is the joy in inventing the encoding, or in decoding it? Answer determines what to optimize.

## Done means
5 friends open the room, get their private role/phrase assignments, chat for 3 min about the given topic, and Eavesdropper submits a guess. If Agents successfully transmit at least once across a session AND Eavesdropper catches at least once, v1 shipped. Bonus win: the group post-game says "wait, THAT was your signal?" with surprise.
