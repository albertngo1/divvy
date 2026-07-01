## Overview
Want Gallery is a browser extension that does the artful opposite of EasyList. Where an adblocker hides ads to show you content, Want Gallery hides the content to show you *only the ads* — lifted onto a clean gallery wall, each with a placard naming the advertiser, the network, and its best guess at why you were targeted. It's for people who find adtech fascinating, creepy, and beautiful all at once.

## Problem
Ad blocking is a solved, joyless arms race. But the ads themselves are a live anthropological record of what the internet thinks you want — and nobody ever *looks* at them on purpose. Inverting the most popular filter list on GitHub turns invisible surveillance into a viewable exhibit.

## How it works
Click "Enter the Gallery" on any page. The extension matches the DOM against EasyList's cosmetic and network rules — then applies the mask *inversely*: everything that ISN'T an ad gets hidden, and every matched ad creative is extracted and tiled onto a neutral gallery background. Each piece gets a placard: advertiser domain, ad network (from the request origin), and a "Why you?" line inferred from UTM params, referrer, and any visible targeting signals. A running collection persists so you can revisit your personal Museum of Want and export a contact-sheet PNG.

## Technical approach
Manifest V3 extension. Reuse an existing EasyList parser (uBlock's cosmetic filter syntax is documented) to get the ad selector set, then invert it: hide non-matches, promote matches. Attribute networks via declarativeNetRequest / webRequest logging of creative request domains. Placard "Why you?" text assembled from URL params, document.referrer, and the Topics API if exposed. Collection stored in IndexedDB: {captured_at, page, creative_src, advertiser, network, why}. Contact-sheet export via an offscreen canvas. The genuinely hard part is reliably isolating creatives — many ads are injected late, live in nested iframes or shadow DOM, and are deliberately obfuscated — plus clean network attribution.

## v1 scope
- One-click toggle that hides content and tiles current-page ads
- Basic placard: advertiser domain + network
- Works on a handful of ad-heavy news sites

## Out of scope
- Persistent cross-session collection / museum
- PNG contact-sheet export
- "Why you?" targeting inference beyond UTM params

## Risks & unknowns
- Cross-origin iframe ads may be un-liftable (just show a framed placeholder)
- MV3 restrictions on request logging
- Sites that break entirely when content is hidden

## Done means
On a chosen ad-heavy page, clicking the toolbar button hides all editorial content and displays every detectable ad as a tidy gallery wall, each with a placard naming its advertiser and network — verified across three different sites.
