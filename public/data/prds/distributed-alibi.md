# Distributed Alibi

## Overview
Cooperative-with-traitors mystery reconstruction. A short crime narrative is generated (or hand-authored); each player privately receives ONE witness testimony fragment on their phone. 1-2 of these fragments contain deliberate LIES (marked only on the liar's phone). The group's job: discuss what they saw, then jointly vote on (a) who is the culprit, and (b) who was lying. Asymmetric info is the whole point: no one has the full picture, and some pieces are actively poisoned. LLM generates the case + testimonies; per-phone privacy is what makes the "did you REALLY see that?" doubt real.

## Problem
Werewolf/Mafia have the deception layer but no puzzle to solve. Detective board games (Sherlock Holmes: Consulting Detective, Chronicles of Crime) have the puzzle but no deception. Nobody has combined them into a per-phone concurrent-room format where each player is BOTH a witness AND a potential liar. LLM generation makes fresh cases genuinely playable — no case library needed, every play is unique.

## How it works
Room code join, 4-6 players. Session start: LLM (Haiku) generates a case — one paragraph setup ("At the Bramwell Manor gala, socialite Eleanor Vance was found dead in the library at 10:47pm. Six guests are being questioned"), plus a set of witness testimonies (one per player) that collectively describe the crime. Server marks 1-2 testimonies as "lies" (deliberately altered), assigns them privately to those players. Players read their testimony on their phone. Discussion phase (5 min): players share what their witness saw (out loud or via typed chat). Vote phase: each phone independently submits (a) suspect and (b) suspected liar(s). Reveal: LLM-generated true solution + who lied. Score = correct culprit + correct liar identification (bonus for liars who evaded detection).

## Technical approach
PartyKit / Durable Objects. Room state = `{case_setup, testimonies: {player_id: text}, is_liar: {player_id: bool}, true_solution, discussion_log, votes}`. Haiku call at start with structured prompt: `{players: 5, structure: "mystery with 5 witnesses, 2 of whom are lying, generate: setup, 5 testimonies (marked truth/lie), true_solution"}`. Cost: ~$0.01 per game. Testimonies delivered privately to each phone; is_liar flag shown only to the liar. Reveal shows LLM's marked truth/lie status.

## v1 scope
5 players, 1 LLM-generated case per session, exactly 2 liars, single guess phase, no hint mechanics, no rewind. Score = 1 point for correct culprit + 1 point per correct liar identification.

## Out of scope
Case difficulty tiers, custom case themes (heist, poisoning, etc. all in one generic prompt), multi-round mysteries, tutorial mode explaining "how to spot a lie," chat history search/annotation, spectator mode, LLM-scored testimony delivery quality ("did you sell your lie?").

## Risks & unknowns
LLM must reliably generate mysteries where the truth is deducible from combining truths and where liars have inconsistencies with truths — this is a hard prompt engineering problem. May take a dozen iterations to nail. If the LLM generates a case that's impossible to solve (contradictions among truths, or truths that also contradict), the whole game is void — needs a validation pass ("does removing the lies leave a consistent narrative?"). Playtest: are Haiku-generated mysteries actually interesting, or do they feel formulaic? Consider mixing with hand-authored "prompt seeds" for flavor. Also: how obvious is the "liar" to the group vs. the LLM's difficulty setting? Fine balance.

## Done means
5 friends open the room, get their private testimonies, discuss the case, and complete a vote. If the group identifies the culprit correctly AND at least one liar is caught (and one gets away with it, sparking finger-pointing), v1 shipped.
