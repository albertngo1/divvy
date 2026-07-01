## Overview
Kanji Safari is a phone-first capture game for people learning Japanese. Point your camera at real-world Japanese text — a menu, a sign, a snack package — OCR it, and each new kanji you photograph is captured into a personal dex, with the photo itself becoming that kanji's card art. It bridges two unrelated GitHub trenders: ImageToolbox's on-device OCR and kana-dojo's Monkeytype-style drill loop.

## Problem
Language apps drill in a vacuum while the real world is saturated with free, contextual Japanese you walk straight past. Reading practice and daily life stay disconnected, and there's no reason to actually *look* at the text around you. Learners crave a reason to notice.

## How it works
Snap a photo → OCR extracts the text → kanji are segmented and checked against your dex. New kanji are "captured": added with the source photo as card art plus reading and meaning attached. Immediately after, a quick Monkeytype-style timed drill quizzes you on the readings/meanings of what you just caught. Rarity scales value — common kana are worth little, uncommon jōyō or rare kanji score big. Streaks and a weekly leaderboard of "kanji caught in the wild" turn passive sign-reading into a collection race between friends.

## Technical approach
React Native (or a camera-capable PWA). OCR via Tesseract.js with the `jpn` traineddata, or on-device ML Kit text recognition — ImageToolbox proves the on-device image pipeline is viable. Segment kanji by filtering the OCR string against the Unicode CJK Unified Ideographs range; look each up in bundled KANJIDIC2 (readings/meanings) + JMdict (words) JSON. Store the dex and SRS state in local SQLite / IndexedDB. Leaderboard is a small backend receiving a POSTed caught-count. The genuinely hard part is OCR accuracy on messy real-world photos — angled signs, decorative fonts, vertical text — and getting clean kanji segmentation out of noisy OCR output.

## v1 scope
- Photo → OCR → highlight detected kanji
- Tap a kanji to capture it
- Dex list showing each captured kanji with reading + meaning + its source photo
- No drill, no leaderboard yet

## Out of scope
- SRS scheduling and review
- Leaderboard and streaks
- Vertical-text handling
- Grammar/vocabulary (kanji only)
- Cloud dictionary sync

## Risks & unknowns
OCR on wild photos is genuinely hard and may need heavy preprocessing. JMdict/KANJIDIC2 are CC-BY-SA — attribution required. Photo privacy matters, so OCR should stay on-device and photos never leave the phone.

## Done means
I photograph a Japanese food package, the app highlights the kanji in it, I tap 二 to capture it, and it appears in my dex with reading コン／ふた and meaning "two," using my photo as its card.
