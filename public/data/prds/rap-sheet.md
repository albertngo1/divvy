## Overview
Rap Sheet is a local audit tool that enumerates every *immutable* identifier your computer leaks — the ones you can't rotate, disable, or reset — and presents them as your device's permanent record: a printable 'rap sheet' with a mugshot-style header. Sparked by the Lobsters thread on Microsoft's GDID ('a device identifier that cannot be disabled, documented in an FBI case filing'). For privacy-curious people who assume incognito mode means anonymous.

## Problem
Most privacy tools chase the *changeable* surface — cookies, IP, user agent. The scary layer is the permanent one: hardware serials, MachineGuid, TPM EK, MAC OUIs, disk serials, GDID. These are invisible, undeletable, and cross-correlate you forever. There's no single, plain-language 'here's your indelible dossier' view — and the FBI-case framing makes the point land.

## How it works
Run `rapsheet`. It collects the immutable identifiers available on the host, grades each on **indelibility** (can you change it at all?) and **linkability** (how uniquely does it pin you?), and renders a one-page 'record': a header with a deterministic identicon 'mugshot' derived from the identifier hash, then booking-style rows — `MACHINE GUID … PERMANENT`, `PRIMARY NIC OUI … VENDOR-TRACEABLE`, `DISK SERIAL … PERMANENT`. A summary 'un-anonymizability score' sums the linkage. The mischief is entirely in the framing; the tool is defensive and read-only, and by default *hashes* the raw values on screen so a screenshot doesn't dox you (a `--raw` flag reveals them).

## Technical approach
Stack: Rust (single static binary, cross-platform). Per-OS collectors: macOS via `IOKit`/`ioreg` (platform serial, hardware UUID), Windows via WMI/registry (`MachineGuid`, `Win32_BIOS`, GDID where present), Linux via `/sys/class/dmi/id/product_uuid`, `/sys/class/net/*/address`, disk serials. Data model: `identifier{name, value, category, mutability: none|reset|spoofable, linkability: 0-1, source}`. Output: an HTML/print-CSS page (mugshot = SVG identicon seeded by `blake3(all_ids)`). Score = weighted sum of `linkability * (mutability==none ? 1 : 0.3)`. The genuinely hard part is honest cross-platform *mutability* classification — knowing which identifiers are truly permanent vs merely inconvenient — without overclaiming.

## v1 scope
- macOS + Linux collectors, ~6 identifiers total
- Hashed-by-default terminal table + one-page printable HTML with identicon mugshot
- A single 0–100 un-anonymizability score

## Out of scope
- Windows/GDID collector (v2), browser fingerprint surface, network-level leaks
- Any *changing* or spoofing of identifiers — read-only only
- Uploading anything anywhere

## Risks & unknowns
- Some identifiers need elevated privileges; must degrade gracefully
- Mutability claims are legally/technically nuanced — risk of overstating 'permanent'
- Could read as fearmongering if the framing isn't backed by accurate grading

## Done means
On a Mac and a Linux box, `rapsheet` prints a one-page record listing at least six real immutable identifiers with correct permanent/spoofable labels, a stable identicon mugshot, and a score — and re-running it yields the identical mugshot and score, proving the identifiers really are unchanging.
