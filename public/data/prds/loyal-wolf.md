# Loyal Wolf

## Overview
Werewolf, inverted. Instead of the villagers hunting the wolf, the villagers are secretly on the wolf's side — each has a hidden bond to the wolf (spouse, sibling, best friend, business partner) and MUST protect them from an external judge. Every night, one villager gets a private "accusation" cue and must choose whether to divert it, lie, or feign ignorance. The wolf doesn't know who their protectors are; the group has to help without outing themselves. Cooperative deception replaces adversarial deception. Load-bearing per-phone because private role/bond info + private nightly accusation cues can't survive a shared screen.

## Problem
Werewolf/Mafia's genre is exhausted; the deception format is beloved but stale. Everyone in party-game circles is looking for the next twist. Nobody's tried inverting the alignment: what if the group's goal is to PROTECT the deceiver, not expose them? That flips the social dynamics entirely — instead of "who's the wolf?" the tension is "how do we keep the judge from picking my person?" This is uniquely enabled by per-phone: each player must privately know their bond target AND privately receive night-phase accusation prompts without others seeing.

## How it works
Room code join, 5-8 players. Setup: one player is the Wolf (private role); each other player is a Protector, privately bonded to the Wolf (they know they must protect but don't know who else is a protector). Server also spawns a "Judge" — an LLM-driven external accuser that surfaces suspicion each night. Night 1: Judge announces a suspicion ("I suspect the Wolf may be someone quiet in the group") and privately prompts one random player: "You must publicly accuse one player next round." That player must comply or forfeit their protector points. Discussion phase: group discusses (out loud), accused player defends. Vote phase: everyone votes to convict the accused OR override. If Wolf is convicted, game ends (loss). Otherwise, next night; Judge gets angrier. Session = 4-5 nights or Wolf convicted. Score = Wolf survives (all Protectors win) or Wolf convicted (Judge wins).

## Technical approach
PartyKit / Durable Objects. Room state = `{wolf_id, protector_ids, judge_state, night_num, accusations_history, accused_this_round, votes}`. Haiku call each night: generates the Judge's suspicion cue + selects a random Protector to force-accuse. Vote UI: each phone taps convict/override. Reveal after each night's vote. LLM cost: ~$0.005/game (5 rounds × 1 Haiku call each).

## v1 scope
5 players (1 Wolf + 4 Protectors + 1 LLM Judge), 4 nights maximum, 1 forced accuser per night, Haiku Judge, binary vote (convict/override), no additional roles (no Doctor/Seer variants). Win = Wolf alive after 4 nights.

## Out of scope
Additional roles (Doctor, Seer, Vigilante), multi-wolf variants, silent night phases (mic-monitored), variable Judge personalities, tournament brackets, custom bond types beyond "Protector," reveal animations for individual player thoughts.

## Risks & unknowns
The forced-accusation mechanic may feel unfair — being forced to accuse your ally out loud is uncomfortable. May need a rule like "you can accuse but explicitly say 'I'm being forced,' cueing others to override." Or the mechanic is exactly the pressure that makes the game fun. The Judge's LLM-generated suspicions must feel plausible (Haiku prompt engineering); a bad suspicion round breaks the game. Discovering whether "protecting the wolf" feels heroic or icky depends on framing (bond narrative could be "you love them" vs "you owe them a debt"). Playtest: is the wolf's uncertainty about their protector fun or lonely?

## Done means
5 friends open the room, one becomes Wolf, and the group plays through 4 nights. Wolf survives at least one game across the session (a cooperative win) or is convicted (Judge wins) with clear finger-pointing at the reveal. If the Wolf hugs their Protector at the win screen, v1 shipped.
