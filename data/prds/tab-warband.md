## Overview
Tab Warband is a browser extension that reframes your open tabs as a medieval company of troops, straight out of Mount & Blade II: Bannerlord. Every tab is a recruit. Tabs you genuinely use earn veterancy and get promoted; tabs you ignore lose morale, start grumbling, and eventually *desert* — auto-bookmarked to a graveyard folder and closed. It's for chronic tab-hoarders who can't bring themselves to close anything "just in case."

## Problem
Tab hoarding is entropy with a favicon. You end the week with 60 tabs, none of them closable, all of them low-stakes. Existing tab managers are spreadsheets — sortable, joyless, and they never create the emotional friction that would actually make you let a tab die. There's no army morale in a list view.

## How it works
A new tab spawns as a green recruit (rank 0). Each time you truly focus and interact with a tab, it accrues XP: recruit → veteran → elite, shown as a chevron pip overlaid on the favicon. Idle tabs bleed morale each day. Below a grumble threshold they get a shabby state; below the desertion threshold they auto-bookmark to a "Fallen" folder and close at the next browser-idle window. You can *pay wages* (pin) to freeze a tab's morale, or *promote* to shield an elite from ever deserting. A roster popup shows troops by tier, total warband morale, and desertions this week — your own attrition report.

## Technical approach
Chrome MV3 extension. State per tab lives in chrome.storage.local keyed by tabId + a hash of the URL so ranks survive reloads. Active-focus time is tracked via chrome.tabs.onActivated plus a heartbeat timer while the tab is foregrounded; XP = bucketed active seconds, morale = a decay curve over hoursSinceLastFocus. A chrome.alarms job every 15 min runs the morale tick and desertion sweep. The rank chevron is drawn by a content script that repaints the favicon onto a canvas and swaps link[rel=icon]. The genuinely hard part is attributing *real* use vs background noise, and never nuking a tab someone actually wanted — so desertion needs a grace period and a 10-second undo toast.

## v1 scope
- Single window only
- Morale + XP + rank chevrons
- Desertion → bookmark-then-close with undo
- Roster popup with tier counts

## Out of scope
- Sync across devices
- Tab groups as "companies"
- Any multiplayer / shared warband

## Risks & unknowns
Auto-closing tabs is genuinely scary; it must be opt-in per threshold with a hard undo. Favicon rewriting is fragile across sites that reset their own icons.

## Done means
Leave 20 tabs across a week: the neglected ones auto-bookmark and close on their own, the roster shows correct ranks for the ones you kept alive, and you can undo any desertion within 10 seconds of it happening.
