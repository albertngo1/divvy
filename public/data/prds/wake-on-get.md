## Overview
A small reverse proxy plus supervisor for homelabbers running 20–40 self-hosted services on one box. Services you touch twice a month get checkpointed to disk and their memory reclaimed; the first incoming connection restores the process image and forwards the request. The user never notices except that free RAM tripled.

## Problem
The hobby-scale deployment model wastes memory on idleness. A typical Mac mini or NUC homelab runs Sonarr, Prowlarr, Bazarr, Jellyseerr, a wiki, three dashboards, and a recipe manager — most of them idle 99% of the time while each holds 200–800 MB resident. The cloud answer is scale-to-zero, but cold-starting a JVM or .NET service takes 15–40 seconds, which is why nobody does it at home. Process checkpoint/restore skips the cold start entirely: it is a savestate, and emulators have shipped that trick for decades.

## How it works
1. Declare services in a TOML file: listen port, container name, idle timeout.
2. The proxy binds every declared port and forwards to the live backend, counting bytes.
3. After `idle_timeout` with no bytes, it checkpoints the container to disk and stops it. Memory is freed; the proxy keeps the port bound.
4. A new connection arrives. The proxy accepts, holds the client socket, and triggers restore.
5. When the backend's port answers, the proxy dials it and splices the two sockets. From the client's view it was a slow first byte.
6. A status page shows per-service state (LIVE / FROZEN), RAM reclaimed, restore latency histogram, and thaw count per day.

## Technical approach
Proxy in Go: `net.Listen` per port, a splice loop with an idle timer, and a state machine per service (live → freezing → frozen → thawing). Checkpointing via Podman's CRIU integration — `podman container checkpoint --export` and `--import`, with `--tcp-established` where connections must survive. Docker's experimental checkpoint API is a fallback but flakier. Checkpoint images land on SSD; measure them, because a 600 MB image restoring at 1.5 GB/s is a 400 ms floor before any application work.

State in SQLite: services, transitions, restore latency samples. Metrics exposed as Prometheus text so an existing homelab dashboard can graph reclaimed RAM.

The hard part is that CRIU is picky in exactly the ways real services are. Anything holding a persistent outbound connection (a database pool, a Syncthing peer, an MQTT session) never goes idle by the byte-counting definition and is dead on restore if it does. Restored processes see the monotonic clock jump forward, which breaks timers, schedulers, and TLS session assumptions in some runtimes. The honest design is a per-service allowlist plus a `--verify` mode that freezes, thaws, and runs a health check before ever trusting a service in production.

## v1 scope
- One host, Linux + Podman only
- Byte-count idle detection, single global timeout
- Freeze/thaw for exactly one hand-picked stateless HTTP service
- Client connection held during thaw, no queueing of concurrent connections
- `verify` subcommand: freeze, thaw, curl a health endpoint, print latency

## Out of scope
macOS hosts, Kubernetes, multi-host, live migration, GPU processes, anything holding a mounted network filesystem.

## Risks & unknowns
CRIU may fail outright on common .NET or JVM images. Restore latency may exceed a cold start for small services, making the whole thing pointless below some memory threshold. Filesystem state diverging between checkpoint and restore causes subtle corruption rather than a clean error.

## Done means
One real service (Jellyseerr or a wiki) survives 50 freeze/thaw cycles with a passing health check, median thaw under 800 ms, and `free -m` shows its full RSS returned to the host while frozen.
