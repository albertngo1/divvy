## Overview
Overnight is a deliberately high-latency forum — a small self-hosted BBS that revives the store-and-forward rhythm of FidoNet/UUCP mail. Threads and replies are queued locally and only 'delivered' during a nightly batch sync. For a small group of friends who miss crappy forums but hate the infinite-scroll dopamine treadmill, it turns conversation back into correspondence. Over a year it quietly accretes into a slow, readable archive.

## Problem
Modern forums optimize for instant reaction: refresh, dopamine, repeat. The HN 'bring back crappy forums' nostalgia isn't really about the CSS — it's about a *pace* where you wrote something thoughtful and waited. You can't get that pace on anything real-time; the medium fights you.

## How it works
You write a post; it lands in your Outbox with a visible 'delivers tonight 03:00' stamp. Nothing appears in the public thread until the nightly cron 'mail run' flushes all outboxes at once, so everyone wakes to the day's batch simultaneously — like getting the morning post. There is no live view, no unread-count anxiety during the day, no notifications. You get exactly one daily digest. Because delivery is batched, everyone sees the same thread state; nobody 'wins' by refreshing. An optional slower tier ('airmail', 3-day delay) exists for long-form debates.

## Technical approach
Stack: a single Go or Node binary + SQLite, deployable on a homelab box (fits Albert's self-hosted setup). Tables: users, threads, posts(status: queued|delivered, deliver_at). A cron job (or internal ticker) at a fixed local hour moves all queued posts to delivered and regenerates the static digest. Frontend is intentionally plain server-rendered HTML — no JS required — echoing the 'crappy forum' aesthetic. The genuinely interesting part is the *delivery scheduler*: honoring per-tier delays, ensuring a strict global batch boundary (so nobody sees a partially-flushed thread), and idempotent re-runs if the box was asleep at 03:00 (catch-up flush on next boot). Auth: invite codes only, tiny trusted group.

## v1 scope
- Post → outbox → nightly flush → digest
- Threads + flat replies, single delay tier
- Static per-day digest page, permalinked
- Invite-code signup, no passwords beyond a magic link

## Out of scope
- Real-time anything, notifications, mobile app
- Federation / ActivityPub
- Rich media, search (v2)

## Risks & unknowns
- Cold-start: a slow forum with 2 people is just slow
- Will the delay feel charming or just annoying after a week?
- Missed-flush edge cases if the host sleeps

## Done means
Two users on different machines can post during the day, see nothing update, and both find each other's posts in the same digest after the 03:00 flush — with a catch-up flush correctly firing if the host was offline at flush time.
