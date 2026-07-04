## Overview

Ambient layer over group video watching. While the group watches a movie/show/YouTube video on a shared TV, each phone privately fires occasional prediction prompts ("who saves the day?", "does she text him back?", "what happens to this side character?"). Players bet privately; reveal happens when the on-screen resolution lands. Doesn't replace the watching — it enhances it. Per-phone is load-bearing because private betting must stay hidden until reveal to preserve the "OH I called it" moment.

## Problem

Group video watching is a huge part of hanging out, but nobody is doing anything except watching. Second-screen apps for scoring at sports events (Yahoo picks, DraftKings) exist but nothing for casual TV/movie watching with friends. Party games either interrupt the watching (Jackbox during a movie is not really a movie night) or ignore it (game night is game night). Second Screen sits *in between* — it doesn't replace the show, it just adds a subtle betting layer.

## How it works

Room code join, 3-8 players. Group starts watching whatever (Netflix, YouTube, whatever). One player designates themselves as "GM" and paces the game via a simple GM interface: they type a prediction prompt at moments of narrative uncertainty ("who did it?", "does the deal go through?"). Prompt appears simultaneously on all other phones with a 20-second bet window (private tap-a-choice). Group keeps watching. When the on-screen answer resolves, GM taps the actual outcome; scoreboard updates silently on each phone. Game runs alongside the video, session ends when video ends or GM stops. Score at end.

## Technical approach

PartyKit or homelab Socket.IO. Room state = `{gm_id, active_prompt, bets: {player_id: choice}, scores, history}`. GM has an extra UI to compose prompts on the fly (~10s effort per prompt). No content library — GM authors prompts live. No AI needed for v1 (Haiku could suggest prompts later). Very light architecture; everything else lives outside the app (the actual video plays on TV or wherever). Optional: for known shows, pre-authored prompt packs (a "The Bear" pack, a "Succession" pack) could be curated later.

## v1 scope

4 players, one GM (rotating between sessions), single active prompt at a time, 20-second bet window, up to 10 prompts per session, binary or 3-choice answers, cumulative scoreboard. GM types prompts freeform. No prompt library, no AI generation, no video integration (external), no share/export.

## Out of scope

Auto-generated prompts from the video content (that requires video ingestion + a model), curated prompt packs, integration with streaming services, spectator mode, prompt scheduling, multi-choice ranked bets, statistics/history persistence, rotating GM per prompt.

## Risks & unknowns

The GM role is a lot — one person authoring prompts while everyone else watches. May need to rotate or lower the load (e.g. small prompt template picker). Prompts too specific to one show may not resolve cleanly. Playtest question: does the light game layer *enhance* watching, or does it distract from following the plot? If people miss key plot beats because they're on their phones, the whole thing fails — betting must be quick and rare. Suggested design principle: fewer prompts than you think, and only at narrative uncertainty moments where you'd naturally pause and speculate anyway.

## Done means

4 friends watch an episode of something together while playing, GM types ~5 prompts, everyone bets, at least one player scores a "called it!" reveal moment. If people ask "let's do this again next episode" — v1 shipped.
