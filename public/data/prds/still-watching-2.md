## Overview

A 6-minute hidden-agenda market for 3–6 friends, played on a fake streaming home screen. The thing you're betting on isn't a show — it's *which show this room will actually start*. For anyone who has lost half an evening to "I don't care, you pick."

## Problem

The browse is the longest, most passive, most annoying part of TV night, and it's already secretly adversarial: everyone is lobbying, nobody admits it. Existing party games ignore the twenty minutes before the party game. Make the browse the game and it resolves faster, funnier, and with a scoreboard.

## How it works

**Host screen (TV):** a row of 8 title tiles — poster, one-line blurb, runtime, a fake "97% match" — plus a hero panel that slowly pans across whichever tile is currently *featured*, and a 5:00 countdown labeled STARTING SOMETHING IN…

**Each phone, privately:**
1. **A portfolio** — unequal shares in 2 of the 8 titles. Nobody else sees your holdings.
2. **One Objection card** — a plausible line you must say out loud before time runs out ("that one's three hours", "we bounced off it already", "I can't do subtitles tonight"). Unplayed = −2.
3. **One player secretly holds the House position:** they are long whatever tile the hero panel is showing at 0:00 — which is what plays if the room deadlocks. Their job is to keep the argument alive.

**Play:** five minutes of open, spoken argument. No turns, no prompts. The only button is REQUEST HERO (2 uses each), which moves the hero panel to a tile of your choice. The TV shows the move; it never shows who made it.

**Resolution:** at 0:00 every phone secretly picks one tile. Plurality wins, and its shareholders cash 3/2/1 by share count. No plurality → the hero tile plays and the House position cashes big. Then the host actually starts the winning title.

## Technical approach

PartyKit Durable Object per room; the TV joins as `role=host`. State: `{titles[8], heroIndex, phase, deadlineTs, players:{id, name, holdings:{titleId:shares}, objection, isHouse, heroRequestsLeft, vote}}`. Public broadcast is only `heroIndex`, countdown, and hero-request count; holdings, objections, House flag, and votes never leave the server until reveal. Votes arrive as commands, are buffered, and are revealed atomically at 0:00. Clock is server-authoritative — the host renders the countdown from a `serverNow` offset measured by ping/pong, so a phone can't gain time by lagging.

The genuinely hard part isn't throughput (a dozen messages a minute); it's dealing. The House's hero-at-zero must be *reachable*, and no player may hold only hopeless tiles, so holdings are dealt by rejection sampling at room start. Secondary hard part — synchronized video previews across TV and phones — is deleted in v1 by using static posters with a Ken Burns pan.

## v1 scope

- 4 players + one host tab, one 5-minute round, done
- One hardcoded row of 8 titles (JSON + 8 poster JPEGs), posters only, no video
- 2 shares dealt per player, exactly one House, one Objection card each
- REQUEST HERO ×2, secret vote, reveal, payout table
- Room code only — no accounts, no reconnect, no lobby

## Out of scope

Real streaming-service integration, multi-round play, custom title lists, spectators, chat, mobile-as-host, persistent scores.

## Risks & unknowns

The House player may be trivially readable (they're the one stalling) — mitigated by letting anyone legitimately hold hero-tile shares, so stalling is ambiguous. Five minutes of unstructured argument can go flat; REQUEST HERO is the pacing device and may need a cooldown. And if players don't recognize the titles, advocacy has nothing to bite on — the title list is real design labor, not filler.

## Done means

Four phones and a TV, hidden holdings dealt, five minutes of real argument, a secret vote, a correct payout table on screen, and the room actually starting the winning title — with at least one person asking "wait, who kept moving it back to the documentary?"
