## Overview
Seedbank is a self-hosted dashboard-game that turns your BitTorrent seeding into a wildlife-conservation tycoon. It's the mischievous inversion of PeerBanHelper: instead of *banning* peers to protect yourself, you're rewarded for *keeping alive* the torrents nobody else is seeding. For homelabbers running qBittorrent who want a reason to keep rare content healthy.

## Problem
Rare torrents quietly die when their last seeders drop off — and there's zero feedback loop rewarding you for being that last seeder. Ratio-chasing pushes people toward popular content that doesn't need help. Preservation is invisible and unglamorous.

## How it works
Seedbank reads your client's torrent list and, for each, estimates 'endangerment' from swarm health: fewer seeders, older age, and your share of total upload = higher conservation value. Torrents become 'species' with a rarity tier (Common → Critically Endangered → Extinct-in-the-wild if you're the only seeder). You earn 'stewardship points' scaled by rarity for uptime and bytes delivered to peers who'd otherwise starve. A map/aviary view shows your menagerie; alerts fire when a species drops to one-other-seeder (you can save it) or when you're the sole lifeline. Seasonal 'migrations' highlight categories at collective risk. It's ambient — it just watches and scores what you already do.

## Technical approach
Stack: Python/FastAPI + a small React or plain-JS front end, SQLite for history. Data via the qBittorrent Web API (`/api/v2/torrents/info`, `/api/v2/sync/maindata` for peer counts, `/api/v2/torrents/trackers` for scrape seeds/leechers). Poll every few minutes; store time series of seeds/peers/uploaded per infohash. Endangerment score = weighted function of `min(seeds)`, torrent age, your upload share, and downward trend slope. Hard part: reliably estimating true swarm size — tracker scrape data is noisy/absent for DHT-only torrents, so blend tracker scrapes with observed peer connections and mark confidence. Rarity tiers are percentile buckets over your library.

## v1 scope
- Connect to qBittorrent Web API, list torrents
- Compute a simple endangerment score from tracker scrape + age
- One page: species list sorted by conservation value, with tiers
- ntfy alert when any torrent hits ≤1 other seeder

## Out of scope
- Auto-downloading rare content to 'rescue' it
- Multi-client (Deluge/Transmission) support
- Actual game economy / upgrades

## Risks & unknowns
- Swarm-size estimates are unreliable for DHT-only torrents
- Could nudge people to hoard; framing must reward *health*, not quantity
- Tracker scrape rate limits

## Done means
I open Seedbank against my qBittorrent, see my torrents ranked by how endangered they are, and get an ntfy ping the moment I become the last seeder of something.
