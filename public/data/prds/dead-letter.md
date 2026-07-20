## Overview
Dead Letter is a browser roguelike whose dungeon *is* your inbox. It reads your Gmail metadata, spawns each frequent sender as a monster whose stats scale with how relentlessly it emails you, and turns clearing floors into an actual inbox cleanup: kill a monster and Dead Letter sends its real List-Unsubscribe request. For anyone drowning in newsletters who can't be bothered to unsubscribe the boring way.

## Problem
Unsubscribing is a chore with zero dopamine, so we never do it and the inbox rots. Meanwhile people happily grind 40-hour roguelikes for imaginary loot. The itch: make the tedious cleanup feel like the loop from Rust/DayZ — scary, escalating, satisfying — so the reward system finally aligns with the maintenance we keep avoiding.

## How it works
On login the app builds this run's dungeon from the last 90 days of mail. Floors are grouped by sender category (Promotions, Social, Updates). Each sender = a monster: HP = email volume, attack = unread ratio, 'venom' = how often it lands in Promotions vs Primary. You descend turn by turn, spending a stamina budget (a proxy for real inbox attention) to attack. Defeating a monster pops a confirm — 'Banish forever?' — and on yes fires the real unsubscribe + a filter to archive stragglers. Bosses are your top-5 offenders. Permadeath: run out of stamina and the run ends, but every kill is permanent in real life. Shareable end screen: 'Cleared 3 floors, banished 14, freed 210 emails/mo.'

## Technical approach
Stack: TypeScript SPA + a thin Node backend for OAuth. Gmail API `users.messages.list` + batch `metadata` format pulls From/List-Unsubscribe/labels without reading bodies (keeps the scope minimal and privacy story clean). Monster generation is deterministic from a seed = hash(date + account) so a run is reproducible. Unsubscribe uses RFC 8058 one-click `List-Unsubscribe-Post` where present, falling back to mailto or flagging a manual link. Combat/rendering is a small ECS on a canvas grid; no server-side game state — the 'save' is your real mailbox. The hard part is honest monster stats from noisy headers (senders rotate subdomains, spoof List-IDs) and making unsubscribe reliable/reversible enough that a misclick isn't catastrophic (30-day undo queue before the filter+unsub actually commit).

## v1 scope
- Google OAuth, read-only + modify scope
- One dungeon of ~3 floors from Promotions label
- Turn-based canvas combat, stamina budget
- One-click RFC 8058 unsubscribe on kill, with a 7-day undo tray
- Shareable summary card

## Out of scope
- Non-Gmail providers
- Reading email bodies / any content
- Meta-progression, gear, multi-run persistence beyond the mailbox itself

## Risks & unknowns
- Gmail API quota + OAuth verification friction for a 'fun' app
- Unsubscribe failures/dark-pattern senders that re-add you
- Making it fun enough to replay when the inbox is already clean (procedural variety runs dry)

## Done means
A new user connects Gmail, plays one ~5-minute run, and afterward at least 5 senders are genuinely unsubscribed (verifiable: no new mail from them next week), with a working undo for any misclick.
