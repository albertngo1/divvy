## Overview
Adverse Possession is a macOS menubar toy-slash-audit that draws your keyboard and shades every chord someone else has claimed. It is for anyone who has ever pressed a shortcut and had the wrong window appear — and had no way to find out who did it, because macOS offers no API to ask.

## Problem
Apps register global hotkeys silently at install or update time. Chrome shipping a global shortcut for a Gemini popup is only the loudest recent example; Raycast, Alfred, Zoom, Slack, 1Password, screenshot tools, and window managers are all homesteading the same small territory. The OS keeps the registry private, so the only feedback loop a user has is surprise. There's no "who owns this key?"

## How it works
- A keyboard renders in a popover. Keys you've never contested are pale; keys observed to be consumed by an invisible owner are shaded and flagged.
- Detection is empirical rather than declarative: press any chord and the app tells you whether it reached the foreground app or got eaten in flight.
- Passive mode: as you use your machine normally, keys light up ghost-green the moment a global hotkey fires, so the map fills in over a week.
- Menubar badge: "2 new tenants this week" — the actual product moment is catching an app that took a key during a silent update.
- Eviction: for known tenants, deep-link to that app's shortcut settings, or offer a copyable `defaults write` for system-owned chords.

## Technical approach
Swift + AppKit menubar host, SwiftUI keyboard view. Detection installs two listen-only `CGEventTap`s: one at `kCGHIDEventTap` (pre-dispatch, requires Accessibility permission) and one at `kCGAnnotatedSessionEventTap` (post system/global-hotkey processing). A chord that appears at the HID tap but never surfaces at the session tap within a short window was consumed by a registered global hotkey. That diff is the core signal and, as far as I know, is the only way to get it without private SPI.

Attribution is forensics, because `RegisterEventHotKey` is opaque about its caller. Three stacked sources: (1) system chords parsed from `com.apple.symbolichotkeys` — each entry encodes a char code / virtual keycode / modifier-mask triple; (2) `defaults read <bundleid>` sweeps of installed apps, since the two dominant third-party shortcut libraries (MASShortcut and Sindre's KeyboardShortcuts) persist `keyCode` + `modifierFlags` into UserDefaults in recognizable shapes; (3) a small curated registry for the big offenders that store shortcuts elsewhere. Anything left over is honestly labeled "unknown tenant."

Storage: SQLite `chords(keycode, mods, first_seen, consumed_count, suspected_owner, evidence)`.

Ethics constraint that shapes the build: this must not be a keylogger. Unmodified keystrokes are dropped before they leave the tap callback; only modifier-bearing chords are ever recorded; and the whole thing ships open source, because nobody should grant Accessibility to a closed binary that watches keys.

## v1 scope
- Menubar popover with a static keyboard grid.
- Dual-tap swallow detection, passive only.
- symbolichotkeys parsing for system-owned chords.
- `defaults read` sweep for the two common shortcut libraries.
- "Unknown tenant" label when attribution fails.

## Out of scope
Automated eviction, Windows/Linux, per-app profiles, remapping, any synthesized keystrokes.

## Risks & unknowns
The Accessibility permission prompt scares off exactly the privacy-minded users who'd want this; the two-tap timing comparison may prove flaky across macOS versions or under load; probing by synthesizing chords would give crisp answers but could fire destructive actions, so it stays off the table; attribution coverage may plateau low enough that the app mostly says "unknown."

## Done means
On a stock machine with Chrome installed, launching the app and pressing the disputed chord shows it as occupied and names Chrome — with zero configuration and nothing typed into the app.
