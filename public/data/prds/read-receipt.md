## Overview
Read Receipt is a single-player deckbuilding roguelike that reads from your actual email inbox. Instead of fictional cultists, the enemies on each floor are your real unread senders. It's for the chronically inbox-anxious developer who'd rather beat a boss than 'do email' — the reward loop of Slay the Spire smuggled onto a chore.

## Problem
Inbox triage is unbounded, joyless, and offers no feedback except a shrinking number. There's no run structure, no 'win', no satisfying combo. Meanwhile deckbuilders are dopamine machines built around exactly the loop email lacks: assess a board, spend limited energy, clear it, level up.

## How it works
Each 'floor' is a batch of ~8 unread threads. Every thread becomes an enemy: HP = message count in the thread, Attack = days-since-received (older mail hits harder each turn you stall). You hold a hand of triage cards drawn from your deck: Archive (2 dmg, cheap), Reply (big dmg but costs 3 energy and opens a compose box that actually sends), Snooze (shield, delays the enemy N turns), Unsubscribe (instakill on newsletter-type senders, adds a scar). You have 3 energy/turn. Clearing a floor with zero enemies surviving = 'flawless', earns a card upgrade or a relic (e.g. 'Filter Rule: auto-Archive one sender per floor'). Bosses are your top-3 highest-HP threads. Losing = end of run; your streak and inbox-count-delta persist.

## Technical approach
Stack: Electron or a local Node service + React/Canvas for the battle board. Email via IMAP (imapflow) against Gmail/Fastmail using an app password or OAuth device flow — read headers + thread structure via `X-GM-THRID` / `References` to compute HP; never download full bodies unless a Reply card is played. Actions map to real IMAP verbs: Archive = move to \All, Snooze = a custom label + local timer, Unsub = parse `List-Unsubscribe` header and fire the one-click POST. Data model: Run{seed, deck[], relics[], floors[]}, Enemy{threadId, hp, atk, senderClass}. Sender classification (newsletter vs human vs transactional) via a tiny heuristic on `List-Id`/`Precedence`/DKIM. Hard part: making it feel like a game while every action has irreversible real-world consequences — so all destructive verbs are stageable and flushed only on 'End Turn' with an undo window.

## v1 scope
- Read-only IMAP connect to one Gmail account
- One floor of unread mail, three card types (Archive, Snooze, Reply)
- Turn/energy loop with a win/lose screen
- Actual Archive executes; Reply/Snooze staged but not yet sent

## Out of scope
- Multiple accounts, deck persistence, relics/upgrades
- Real Reply sending, Unsubscribe automation
- Mobile

## Risks & unknowns
- OAuth friction vs app passwords; Gmail may throttle IMAP
- Irreversible actions in a 'game' context are dangerous — undo must be bulletproof
- Fun ceiling: does anyone want their inbox gamified twice?

## Done means
Connect a real Gmail, see 8 unread threads rendered as enemies with correct HP, play Archive to clear one, confirm it actually moved to All Mail, and reach a win screen showing inbox count dropped by the number cleared.
