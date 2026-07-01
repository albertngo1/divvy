## Overview
Backlog Draft is a season-long, low-effort fantasy league for friend groups with bloated Steam libraries. Instead of drafting athletes, each manager drafts *unplayed games* from the shared pool of everyone's libraries. You score points only when the real owner actually finishes one — turning the collective pile of shame into a spectator sport.

## Problem
Everyone hoards games in Steam sales and never plays them. The backlog is a source of passive guilt, not fun. Meanwhile, the games you *do* beat go uncelebrated. There's social energy in a friend group's shared laziness that nobody has weaponized.

## How it works
At season start, the app pulls every member's owned games and flags the 'unplayed' ones (near-zero playtime). Managers snake-draft games out of the combined pool — you're betting on which titles will actually get beaten this season. Each week the app rechecks playtime and achievements; when a drafted game crosses a 'beaten' threshold (main-story achievement or playtime ≥ HowLongToBeat main), its manager scores points scaled by how *long* it sat unplayed and how unlikely it looked. A public standings page and weekly digest keep the trash talk flowing.

## Technical approach
Stack: SvelteKit + SQLite, one nightly cron. Data: Steam Web API `GetOwnedGames` (`include_played_free_games`, `playtime_forever`, `rtime_last_played`), `GetPlayerAchievements`, and `GetSchemaForGame` to find the story-completion achievement per appid. Cross-reference the HowLongToBeat community API for 'main story' hour thresholds. Data model: `players`, `games`, `draft_picks(player_id, appid, drafted_at, baseline_playtime)`, `scoring_events`. Key algorithm: a 'beaten' detector combining achievement completion OR (playtime_forever − baseline ≥ HLTB_main), plus a rarity multiplier = (days_owned_unplayed / library_median). The genuinely hard part is defining 'beaten' fairly across games with no completion achievement — fallback heuristics and a manual manager-vote override.

## v1 scope
- Steam login via OpenID; import owned games + playtime
- Manual draft over a shared Google-Sheet-simple board (no live draft room)
- Nightly playtime poll + naive 'beaten = playtime jumped past HLTB main' rule
- One standings page, one leaderboard number per manager

## Out of scope
- Live draft rooms, trades, waivers
- Non-Steam stores (GOG, Epic)
- Anti-cheat against idle-farming playtime

## Risks & unknowns
- Steam API rate limits and private-profile players (needs opt-in public game details)
- 'Beaten' is genuinely ambiguous for sandbox games (Valheim, Satisfactory) with no ending
- Idling to fake completion; may need achievement-gated scoring only

## Done means
Four friends can log in, draft from their combined unplayed pool, and one week later the standings page correctly awards points to whoever's drafted game got beaten — verified against a manually-finished test title.
