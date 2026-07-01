## Overview
Evict is a browser extension that runs a Kubernetes-flavored control loop over your open tabs. Tabs become pods; windows become namespaces; you get replicas, resource requests, liveness probes, and — the whole point — eviction under memory pressure. For tab hoarders who think in infra.

## Problem
Browsers already suspend tabs, but opaquely and without agency. The HN 'I ported Kubernetes to the browser' post proves the mental model is fun and legible. Tab managers today are flat lists; nobody has given tabs the one thing k8s does brilliantly — declarative resource limits and honest, explainable eviction when you're over budget.

## How it works
You set a namespace memory budget (say 4 GB). Each tab declares a request/limit (auto-estimated from `performance.memory` and process stats, overridable). A reconcile loop runs every few seconds: if usage exceeds the budget, the scheduler evicts lowest-priority tabs (LRU + a QoS class you assign: Guaranteed / Burstable / BestEffort), suspending them to a serialized 'evicted pods' shelf you can reschedule with one click. Liveness probes ping tabs; a hung/crashed tab gets restart-on-failure. A tiny `kubectl`-style command bar lets you `get pods`, `describe tab`, `cordon` a window, or `scale` a pinned tab to keep-alive.

## Technical approach
Stack: a Chrome/Firefox MV3 extension, TypeScript, using `chrome.tabs`, `chrome.tabs.discard`, `chrome.runtime`, and `chrome.storage` for evicted-pod state. The reconcile loop is a setInterval controller comparing desired vs actual (classic k8s reconciliation). Data model: `Pod { tabId, namespace, qos, requestMB, lastActiveTs, restarts }`. Eviction algorithm: sort BestEffort→Burstable→Guaranteed, then by LRU, evict until under budget — a direct port of kubelet's eviction ranking. Command bar parses a minimal `kubectl` grammar. Hard part: memory attribution per tab is imprecise cross-browser, so 'request' is an estimate — surface it honestly rather than faking precision.

## v1 scope
- Map tabs→pods, windows→namespaces
- One global memory budget with LRU + QoS eviction to `discard()`
- Evicted shelf with one-click reschedule
- `get pods` / `describe` in a command bar

## Out of scope
- Actual cross-device tab sync
- Real cgroup-accurate memory numbers
- Deployments/replicasets beyond a keep-alive pin
- Network policies

## Risks & unknowns
- Evicting the wrong tab mid-form-fill is unforgivable — need a grace period and 'protected' QoS
- Per-tab memory data availability varies by browser
- Is the k8s metaphor delightful or just cosplay? Keep the actual eviction genuinely useful

## Done means
Open 30 tabs, set a low budget, and watch Evict discard the lowest-priority least-recently-used tabs until under budget, list them under `get pods`, and reschedule an evicted tab back to active with one click.
