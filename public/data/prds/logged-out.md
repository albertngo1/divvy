## Overview
A local, offline forensics tool that answers one question nobody can currently answer about themselves: *of all the links I have ever shared, which ones are still open to the entire internet?* For individuals and one-person consultancies who have accumulated a decade of Google Docs links, Dropbox shares, Notion pages, meeting recordings, Figma files, and S3 presigned URLs.

## Problem
Share links are created in a hurry, set to "anyone with the link", and then live forever. The tl;dv incident exposed 181,874 meeting recordings; almost every victim had personally created the link. Nobody audits their own outbound share surface because the links are scattered across mail, chat, calendar invites, and browser history, and because checking one means opening a private window and pasting it. Vendors will never build this — it audits *them*.

## How it works
1. **Harvest.** Point it at local sources: Chrome/Firefox `History` SQLite, `~/Library/Mail` or an `.mbox` export, and calendar `.ics` files. Regex + host allowlist extracts candidate share URLs (docs.google.com/*/d/*, dropbox.com/s/*, notion.site/*, *.tldv.io/*, figma.com/file/*, S3 presigned).
2. **Cold fetch.** Each URL is fetched in a throwaway Playwright context — no cookies, no profile, clean UA, one request per URL, respecting a 1 rps per-host cap. The verdict comes from the landing state: content rendered, login wall, 403/404, or "request access".
3. **Guessability score.** Independently of the fetch, the URL's opaque id is scored: Shannon entropy per character, alphabet size, and whether it looks *sequential* (short, numeric, or base62 with a low-order counter). A 7-digit numeric id is flagged CRITICAL even if it is currently private — that is the tl;dv failure mode. **It never probes neighbouring ids; guessability is measured, not tested.**
4. **Report.** A static HTML page: red (public + guessable), amber (public), green (walled), grey (dead), each with the date you shared it, who you shared it with, and a deep link to the vendor's sharing settings.

## Technical approach
Python + Playwright + SQLite. Data model: `link(url, host, id_token, first_seen, source, recipients)` and `probe(link_id, ts, verdict, http_status, title_hash)`, so re-running produces a timeline — a doc that flips from walled to public is its own alert. Vendor detection is a small YAML of host patterns plus a per-vendor DOM predicate for "is this the real content or a login wall" (the genuinely hard part: SPAs return 200 with an empty shell, so verdicts need per-vendor selectors and a screenshot fallback for unknown hosts). Second hard part: not tripping abuse detection while fetching a few thousand URLs — hence per-host rate limits, jitter, and resumable runs.

## v1 scope
- Chrome history only, three vendors (Google Docs, Dropbox, tl;dv-style recording hosts)
- Cold fetch + screenshot per URL
- Entropy/sequentiality score on the id token
- One static HTML report, sorted worst-first

## Out of scope
Auto-revoking access, org/team mode, mail providers beyond a local mbox, any cloud component.

## Risks & unknowns
Login-wall detection is brittle per vendor. Some hosts rate-limit hard. Screenshots of your own exposed docs are themselves sensitive and must stay in a `chmod 700` directory.

## Done means
Run it on a real 5-year browser history; it produces a report where at least one link is genuinely world-readable, and opening that link in a private window on another machine confirms the verdict.
