## Overview
Terrarium is a calm live-wallpaper/browser toy that renders your actually-running containers as a tiny living ecosystem. Pods are creatures, CPU is weather, restarts are molts. For homelabbers who want their infra to feel like Wallpaper Engine ambience instead of an anxious dashboard.

## Problem
`docker stats` and k8s dashboards are ugly and stress-inducing — walls of numbers that only speak up when something's on fire. Make infrastructure ambient and glanceable: a calm scene you're happy to leave on screen, that quietly tells you your services are alive.

## How it works
A local sidecar reads container stats; the browser renders a side-view terrarium. Each container is a critter: size = memory, activity = CPU, health tint = restart/OOM count. Autoscaling spawns and despawns critters; a crash is a critter fainting; a pod with long uptime grows moss on its shell. No numbers on screen unless you hover. Set the page as your desktop wallpaper and forget it's telemetry.

## Technical approach
A tiny Go or Node sidecar hits the Docker Engine API (`/containers/json`, the `/stats` stream) or the kubelet summary API, normalizes events, and exposes a websocket. Frontend is an HTML canvas / PixiJS scene with simple boids-ish idle animations; state is a `map<containerId, critterState>`. It riffs on the "Kubernetes ported to the browser" post — the whole toy could even run client-side against a mock control plane for demos. Set-as-wallpaper via a thin wrapper (Plash on macOS, Lively on Windows) pointed at localhost. The genuinely hard part is mapping noisy per-second stats to *calm* motion — heavy smoothing and hysteresis so critters don't jitter — while still hitting 60fps with dozens of containers.

## v1 scope
- Docker only, read stats via socket
- Render N critters with size/activity/health
- Live websocket updates
- Runs in a plain browser tab

## Out of scope
- Kubernetes, remote/multi-host
- Any control/writes (start/stop/scale)
- A packaged wallpaper app

## Risks & unknowns
Docker socket permissions vary by host. Animation perf under many containers. The discipline risk: without restraint it slides back into being a numbers dashboard with a green background.

## Done means
Starting or stopping a real container makes a critter appear or faint on screen within 2 seconds, live.
