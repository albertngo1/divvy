## Overview
A self-hosted pipeline that turns a group-chat export into a printable, bound comic book at year's end, rendered with the just-open-sourced Microsoft Comic Chat layout/avatar engine. For friend groups and families who want a keepsake artifact instead of a scroll-forever history. It's the 90s-internet-resurrection energy of self-hosted AIM servers, aimed at nostalgia-as-object.

## Problem
Group chats hold the best running jokes of a friendship and they're utterly ephemeral — buried, unsearchable, gone when someone leaves the app. Screenshots are ugly. There's no artifact. Comic Chat's original 1996 layout algorithm (panel breaking, speech-bubble placement, gesture inference) was genuinely clever and is now MIT-licensed; nobody has grafted a modern message export onto it.

## How it works
1. Import a chat export (Signal/WhatsApp/Discord JSON).
2. Segment into 'scenes' — bursts of conversation split by time gaps — each becoming a comic page.
3. Assign each participant a Comic Chat avatar. For each message, an LLM infers the emotion + gesture (the old engine used a crude keyword/emoticon lookup; here the LLM fills the same emotion-wheel slots: happy, shout, wave, bored, love, etc.), so the avatars actually emote to the content.
4. The Comic Chat layout engine breaks messages into panels, places speech balloons, picks camera framing.
5. Compile to a print-ready PDF: cover, monthly chapters, a 'most-quoted lines' back page.

## Technical approach
Stack: Node/TypeScript orchestrator. Port or FFI-wrap the open-sourced Comic Chat rendering core (its panel-breaking + balloon-placement heuristics are the reusable gem); if the source is Win32-bound, reimplement just the layout algorithm from it in canvas/SVG. Emotion/gesture inference: batch messages to a local model, constrained JSON output mapping each line to one of Comic Chat's ~12 gesture states. Scene segmentation: time-gap + topic-shift heuristic (embedding cosine drop). Render pages to SVG → PDF via resvg. Data model: `Scene{messages[]}` → `Page{panels[]}` → `Panel{speaker, balloonText, gestureState, framing}`. Hard part: mapping arbitrary modern messages (emoji, images, 4-way crosstalk) onto an engine designed for slow 2-person IRC — pacing and panel density need real tuning to not look like a wall of bubbles.

## v1 scope
- Import one Signal JSON export.
- Keyword-based gesture assignment (LLM optional) for two speakers.
- Render one month as a Comic Chat PDF.

## Out of scope
- Custom avatar creation, image/sticker rendering, video.
- Groups larger than ~4 active speakers per scene.
- Hosted service / accounts.

## Risks & unknowns
- The open-sourced code may be too Win32-entangled to reuse directly, forcing a layout reimplementation.
- LLM gesture inference could feel random; may need few-shot tuning.
- Privacy: chat exports are sensitive — must stay fully local.

## Done means
Feed a month of a real 3-person chat export in; out comes a multi-page PDF where each conversational burst is a legible comic page, speakers have consistent avatars, and at least the obvious emotional beats (a laugh, an argument) show the right gesture.
