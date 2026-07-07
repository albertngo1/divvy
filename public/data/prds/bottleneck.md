## Overview
Bottleneck is a read-only dashboard that renders your homelab's data pipeline as a Satisfactory factory: nodes are services, conveyor belts carry real throughput between them, and congestion is shown as physically backed-up belts and overflowing buffers. For homelabbers who find Grafana dashboards accurate but joyless.

## Problem
A media/homelab stack (torrent client → *arr → transcoder → storage → Jellyfin) is a literal pipeline, but you monitor it as disconnected line charts. You can't *feel* where the jam is. When Jellyfin buffers or downloads stall, finding the choke point means squinting at five tabs.

## How it works
You lay out (or auto-detect) a graph of your services. Bottleneck polls each service's real metrics and animates belts between nodes at a speed proportional to current throughput. When a downstream node can't keep up, its input belt fills with backed-up 'items' and turns amber→red, pointing you straight at the bottleneck. Nodes show a small overlay: rate, queue depth, error state. It's ambient — leave it on a wall monitor and the factory hums when healthy, jams when not.

## Technical approach
Stack: a small Go/Node poller + a canvas frontend (PixiJS) for belt animation. Data sources: qBittorrent Web API (dl/ul rates, queue), Sonarr/Radarr API (queue/activity), Jellyfin API (active transcodes/streams), node_exporter/cAdvisor or Docker stats for CPU/mem/disk I/O per container. Data model: `Node(service, in_rate, out_rate, queue, status)` and `Edge(src, dst)`; throughput mapped to belt items/sec, queue depth to buffer fill. Layout via a simple DAG auto-layout (dagre) with manual nudge. Hard part: normalizing wildly different units (torrents in MB/s, transcodes in streams, arr in items) onto one visual 'flow rate' so belts are comparable — solved per-edge with a configurable scale factor and log compression.

## v1 scope
- Hardcoded 3-node chain: qBittorrent → Sonarr → Jellyfin
- Poll each API every 5s for one throughput metric
- Animated belts whose speed = throughput, red when downstream queue grows
- Single static HTML page served from homelab

## Out of scope
- Auto-discovery of the service graph
- Alerting (it's ambient viz, not paging)
- Historical/time-travel replay
- Writing/controlling services (read-only always)

## Risks & unknowns
- Mapping heterogeneous metrics to one 'flow' may mislead more than inform
- API polling overhead / auth token management per service
- Belt animation at many nodes could be a perf hog in-browser
- Cute-but-not-useful risk vs. just using Grafana

## Done means
With qBittorrent actively downloading and Jellyfin transcoding, the page shows moving belts whose speeds track the real rates, and artificially throttling one service makes its input belt visibly back up and turn red within one poll cycle.
