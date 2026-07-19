## Overview
Composite is a browser extension for privacy-curious people that does the opposite of EasyList: rather than hiding trackers, it observes what they infer about you and renders your advertising doppelgänger — the demographic/interest 'composite sketch' the ad-tech pipeline believes you are — as an evolving, slightly unsettling ambient portrait. A toy you can't stop looking at that's also a genuine self-audit, riding the same disclosure zeitgeist as the NYC 'landlords must disclose AI' story.

## Problem
Ad blockers make tracking *invisible by removing it*, which paradoxically hides how much is inferred about you. Most people have never seen their own advertising profile. The inferences (income band, life events, 'in-market for a car') are real, consequential, and completely opaque. Pattern-of-Life audited your photos' geotags; nothing shows you the *inference layer* built from your browsing.

## How it works
Composite runs in a sandboxed 'exposure' mode you explicitly enable. As you browse, it inventories which known trackers fire (using the EasyPrivacy list — inverted, as a *detection* list, not a block list), reads the categories those trackers claim, and pulls back your actual profile where legally exposed: Google's Ad Settings page, Meta's 'Why am I seeing this ad' and ad-preferences endpoints, and IAB TCF segment strings present in on-page consent frames. It assembles these signals into a structured 'dossier' and drives a generative portrait — a collage/police-sketch aesthetic whose features (age tint, interest icons, life-event badges) map to inferred segments. The portrait mutates as your profile shifts, accreting a timeline of who the machine thinks you're becoming.

## Technical approach
Manifest V3 extension; a content script tags outbound requests against EasyPrivacy patterns to identify tracker categories, and a set of authenticated scrapers (running only on your own logged-in ad-settings pages, on user action) parse Google/Meta ad-preference DOMs into a normalized segment schema `{segment, source, confidence, first_seen}`. Everything stays local (IndexedDB). The portrait is deterministic generative art: hash the sorted segment set into a seed driving an SVG/canvas composition, with named segments mapped to visual motifs. The hard part is robust, ToS-respectful parsing of ad-preference pages that change layout, and designing a visual grammar where the sketch is legible ('it thinks I just had a baby') rather than abstract noise.

## v1 scope
- MV3 extension, explicit opt-in exposure mode
- EasyPrivacy-based tracker categorizer
- One profile source parsed (Google Ad Settings)
- Deterministic SVG composite portrait from the segment set
- Local-only storage; export dossier as JSON

## Out of scope
- Meta/IAB TCF parsing
- Year-long timeline animation
- Any data leaving the device

## Risks & unknowns
- Ad-settings pages change and may forbid scraping — needs graceful fallback
- Turning trackers 'on' is uncomfortable; must be sandboxed and clearly consented
- Making the portrait feel revealing, not gimmicky

## Done means
With exposure mode on and a Google account logged in, the extension produces a JSON dossier of at least a handful of real inferred segments and renders a deterministic composite portrait that visibly changes when a new segment appears.
