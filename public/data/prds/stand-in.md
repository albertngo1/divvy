# Stand-In (formerly Understudy)

## Overview
Improv-style social deduction where an LLM generates two subtly-different versions of a monologue line, one is randomly assigned to each player privately, and players read their line aloud with conviction. The group votes on who read version A vs version B without ever seeing the other version. Success = your read was interpreted as the *other* version. The LLM's paired-generation ability is load-bearing: no human could reliably produce two "meaningful but only subtly different" versions on demand at party pace, but Haiku can do it in 2 seconds. (Same concept previously named Understudy — renamed to Stand-In for Divvy.)

## Problem
Improv games are fun but hard to run for non-improvisers — nobody wants to be "the one who freezes". Existing digital improv (Jackbox's Talking Points) uses prompts but doesn't create the *diagnostic* social-deduction layer where the reveal is "wait, we didn't all have the same line?" LLMs newly make this practical: generating two similar-but-different monologue lines was previously the game master's job in an obscure improv exercise; it's now a one-Haiku-call operation.

## How it works
Room code join, 4-8 players. Round: a scene setup broadcasts to all phones ("You're at the airline counter, and your flight has just been cancelled"). Each player's phone displays ONE of two LLM-generated lines they must speak next (version A: "This is unacceptable, I demand a supervisor" vs version B: "I understand, could you help me find alternatives?"). Roles distributed at random (~half get A, half get B). Each player takes turns reading their line to the group with full conviction. After all lines are read, everyone votes on which version each player had. Reveal shows the actual assignments + how convincing each player was. Score = correct votes cast + votes fooled.

## Technical approach
PartyKit / Durable Objects for room state. Haiku call at round start: `"generate a scene setup + two subtly opposing lines a character might say. Format as JSON: {scene, version_a, version_b}"`. Response cached per round. Each phone privately receives its assigned line + version_letter. Voting UI: tap each player's name, choose A or B. Reveal computes accuracy. Approx cost per round: ~$0.002 for Haiku call, well under a penny per game.

## v1 scope
3-4 rounds, 4-6 players, Haiku-generated scenes + line pairs (cached to disk for retry), typed clue log (no audio recording), single fixed round timer (60s to read all lines). Score = correct votes + fool votes. No difficulty tiers, no scene themes, no line preview mode.

## Out of scope
Recorded audio playback of lines, LLM-scored delivery quality, voice-only games (typed instructions only), custom scene creation, three-version rounds (v1 is A/B only), spectator mode, replay of successful "fool" rounds.

## Risks & unknowns
Haiku's paired-generation is the whole game — if the two lines are TOO similar, no one can tell; if too different, everyone can. Prompt engineering must dial the difficulty. Some scenes may generate lines that overlap in tone even if intent differs, making the vote arbitrary. Group's improv willingness varies — introverts may hate reading a line aloud. May need a "silent read" fallback where the line is displayed on a shared screen while player just says "I choose A" or performs it via emoji. Playtest question: is the "convincing read" performance actually the fun bit, or the diagnostic post-mortem ("wait, YOU had that?")? Probably both, but weight matters.

## Done means
4 friends open the room, play 3 rounds, and at least once someone reads their assigned line so convincingly the group flips the vote in the wrong direction. If someone leans into a character and everyone else groans laughing at the reveal, v1 shipped.
