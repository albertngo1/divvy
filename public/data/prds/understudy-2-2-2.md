## Overview
Understudy is a theatrical hidden-role party game for 3–4 players: the host TV sets the scene, and each phone privately holds that player's 'sides' (an actor's personal script). One set of sides has been secretly doctored. It's for groups who'd rather perform and laugh than sit around accusing each other.

## Problem
Social deduction almost always reduces to accusatory talking. We want the deduction hidden *inside* a shared creative act, where the imposter's subtly-different private view is a doctored script only they can see — surfacing as a continuity break you have to track through a performance, not a number anyone can blurt.

## How it works
The TV shows the SETTING and a title (e.g. 'Two siblings argue over a will') but never the lines. Each phone PRIVATELY shows that player's sides: the full 6-line scene with only their own ~2 lines revealed in full, others shown as blanks with cue words. The group performs by reading lines aloud in order, watching the TV, which highlights whose turn it is ('Line 3 — Player B'). Crew all hold the same canonical script. The imposter's sides have ONE line doctored so it contradicts a fact another player's normal line establishes ('as your brother' becomes 'as your sister'; 'we've never met' becomes 'we grew up together'). To keep the imposter from being the obvious weirdo, EVERY player's lines carry small harmless flavor tweaks — only the imposter's actually breaks continuity. After the scene, each phone privately votes 'Whose line broke the story?' The TV reveals.
Private per phone: your sides (and, for the imposter, the doctored line), your vote. Shared: setting, turn order, cue prompts, final tally.

## Technical approach
Host tab + phone PWA + WS server (PartyKit/DO or Socket.IO over Tailscale Serve). Data model: Room{code, sceneId, turnIndex, phase}, Scene{lines:[{speaker, canonicalText, doctoredText?, cue}]}, Player{id, name, role, sides}. The server deals sides: each player gets the scene with their own lines full and others as cues; for the imposter, one of their lines is swapped to its doctored variant. Sync is turn-based, not real-time — the server advances turnIndex and both host and phones subscribe so highlighting stays consistent; the actual performance is live voice IRL, so no audio streaming is needed, only turn choreography and a gated vote phase. The genuinely hard part isn't networking — it's CONTENT: authoring scenes where one swapped line reliably breaks continuity yet reads naturally in isolation, and where every player has a plausible oddity so the imposter isn't trivially the odd one out.

## v1 scope
- 3 players, one round
- One hardcoded 6-line scene with authored doctored variants
- TV turn-highlighting
- Private per-phone sides
- One 'who broke it?' private vote, text reveal

## Out of scope
Scene picker / multiple scenes, more players, scoring, timers, TTS narration, more than one imposter, replays.

## Risks & unknowns
The doctored line may be too obvious (instant out) or too subtle (no signal) — pure authored tuning; shy players who won't perform kill the tell; a flubbed normal line creates false positives; the whole thing lives or dies on well-crafted scenes (content bottleneck).

## Done means
3 phones join; each sees its own sides, exactly one with a doctored continuity-breaking line; the group reads the scene following TV turn order; each casts a private vote; the TV reveals the imposter and whether the crew caught the broken line — one round, no restart.
