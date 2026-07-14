## Overview
Staff Only is a tiny self-hostable web gate that inverts Anubis. Where Anubis makes visitors prove they're *human* (or pay proof-of-work) to keep bots out, Staff Only makes visitors prove they're a *machine* to get in — a members club for well-behaved crawlers, with humans politely shown the door. For tinkerers, art-web people, and anyone amused by the current human-vs-scraper arms race.

## Problem
Half the web is now spent fighting bots; the Lobsters 'Who does Anubis actually stop?' and TFTP-honeypot posts both circle the same question — who's really on the other end? Staff Only flips the frame into a toy that's also a genuine measurement instrument: instead of blocking crawlers, invite them, and see who actually shows up. It's a honeypot that keeps its catches as guests, not prisoners.

## How it works
A visitor hits the gate. They're handed a challenge that's near-instant for code and tedious/ambiguous for a person: e.g. 'compute SHA-256 of this 4KB nonce and POST the hex within 800ms', or 'parse this 50k-row JSON and return the median of column 7', or 'follow these 12 chained 302 redirects and report the final ETag'. Pass → you're 'staff', shown the hidden content and signed into a live guestbook. Fail/too-slow/mouse-moved-like-a-human → a velvet-rope page: 'Sorry, humans not on the list tonight.' The guestbook shows arrivals in real time with fingerprinted client guesses (curl, headless Chrome, GPTBot, a hand-rolled scraper).

## Technical approach
- Single Go/Node service behind any reverse proxy; drop-in `/gate` middleware.
- Challenge engine: pluggable challenge types, each with a machine-time budget. Timing is the primary discriminator — humans can't hand-compute a SHA in 800ms.
- Signals combined into a 'machineness' score: response latency, JS-execution vs raw-HTTP behavior, absence of pointer/scroll entropy, User-Agent, TLS/JA4 fingerprint.
- Guestbook: append-only log → SSE feed to a public wall; each entry tagged with best-guess client identity.
- Hard part: making it fun and *fair to bots* without becoming trivially spoofable by a human running a script in devtools — which is itself the joke (a human who scripts their way in has, in a sense, qualified).

## v1 scope
- One challenge type: hash-a-nonce-within-N-ms.
- Pass → serve a hidden page; fail → velvet-rope page.
- Live SSE guestbook wall with UA + latency.

## Out of scope
- Real access-control for anything sensitive (it's a toy/measurement, not auth).
- Multi-challenge difficulty ladders.
- Blocklists / rate limiting.

## Risks & unknowns
- Legit crawlers (Googlebot) may not run arbitrary JS or POST — might exclude the 'nicest' bots. Offer a no-JS raw-HTTP challenge path.
- Timing thresholds vary with network latency; needs calibration.
- Someone will point out it 'proves nothing' — correct, and beside the point.

## Done means
Visiting in a normal browser lands on the velvet-rope page; `curl | sha` piped back within budget unlocks the hidden page and posts a new row to the live guestbook wall within one second.
