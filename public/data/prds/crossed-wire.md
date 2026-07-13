## Overview
A hidden-role party game for 4-6 players where the imposter's private view is AUDIO, not visual. Every phone privately plays the same recorded message; exactly one phone — the imposter's — plays a version with a single altered detail. For groups who've exhausted spot-the-difference and want a fresh sensory channel.

## Problem
Every hidden-role "different private view" game leans visual — doctored photos, shifted palettes, swapped maps. Ears are unused. And private audio is genuinely impossible to fake with one phone passed around a room: each player needs their own simultaneous playback in their own ears. That constraint is the whole point.

## How it works
The host TV shows a "voicemail inbox," a play-together countdown, then question prompts. On play, every phone privately plays an identical ~25s scripted message ("Hey, it's Dana — party moved to my brother's on Alder Street, bring the blue cooler, we start at 8..."). One randomly chosen phone (the imposter) instead receives an edited cut where ONE noun differs (Alder→Elm, blue→green, 8→9). Nobody is told they're the imposter; the imposter believes their cut is canonical. Each player may replay privately once. The TV then reveals three questions ("What street? What color? What time?"). Players answer ALOUD from memory, in turn. Consensus forms; the imposter confidently contradicts on exactly one axis. Discussion, then a synchronized vote on phones. Reveal.

Private (phone): the audio clip, the single replay, the vote. Shared (TV): timer, questions, live vote tally, reveal.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Cloudflare Durable Object). Data model: Room{code, players[], phase, clipSet}, Player{id, role: honest|imposter, replaysLeft, answers, vote}. Two pre-rendered audio files per round (canonical + variant); server hands the variant URL only to the imposter. Sync: server drives phase transitions on a shared clock; "play" fires a scheduled start timestamp so all phones begin within ~100ms. Hard part: audio latency — preload and decode both clips before the countdown so playback is gapless and truly simultaneous; treat backgrounding or scrubbing as a forfeited replay. Secondary: authoring a swap that's plausible but not a giveaway.

## v1 scope
- 4 players, one round, one hardcoded clip pair.
- Random imposter, single variant with one swapped noun.
- Three fixed questions answered aloud (no in-app entry).
- One-tap vote, host reveal screen.

## Out of scope
- Voice-swap / stereo-attribution variants.
- Multiple rounds, scoring, clip library, TTS generation.
- In-app transcription or answer capture.

## Risks & unknowns
- Everyone on speakerphone bleeds — needs earbuds or a "cup your phone" instruction.
- One-word swaps may be too easy or too hard; calibration-heavy.
- Memory-only recall could frustrate; the single replay is the mitigation.

## Done means
Four phones play simultaneously, exactly one hears the variant, the group discusses and votes, and the reveal correctly names the imposter — in at least one playtest where the imposter genuinely didn't realize their clip differed.
