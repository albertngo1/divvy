## Overview
A CLI/daemon for backend engineers and homelabbers that measures **connection churn**: how often a service opens a fresh TCP and TLS session to a destination it could have reused. The output reads like a bill: "api-gateway paid 41 minutes of handshake latency and 2.3 CPU-hours to `payments.internal` today."

## Problem
The Go 1.27 post about HTTP/1 connection reuse is a reminder that most stacks drop keep-alive quietly. Common causes are an unread response body, a fresh `http.Client` per request, a proxy sending `Connection: close`, or an idle timeout shorter than the request interval. Nothing logs these. Latency dashboards show p99 going up but not why.

## How it works
1. `handshake-tax run` attaches eBPF probes for 10 minutes or runs as a daemon.
2. It records each outbound `connect()` (pid, cgroup/container, dst ip:port), `close()`, and TLS ClientHello timing via uprobes on OpenSSL/BoringSSL and Go's `crypto/tls`.
3. Per (service, destination) it computes concurrent connections, new-connections-per-request, the idle gap before close, and who closed first (FIN direction).
4. It classifies the cause: *client closes after each request* (body not drained or no pooling), *server closes at N seconds idle* (timeout mismatch), *pool too small* (bursts open fresh sockets while the pool is full).
5. Output is a ranked "tax bill": wasted RTTs × measured handshake time, plus a likely fix ("raise `MaxIdleConnsPerHost`; currently looks like 2").

## Technical approach
- Rust + Aya, or Go + cilium/ebpf. Kprobes on `tcp_v4_connect`/`tcp_close`, and the `inet_sock_set_state` tracepoint for state transitions and FIN origin.
- TLS cost: uprobes on `SSL_do_handshake` and Go's `(*Conn).Handshake` (resolved via symbol table; Go needs return-probe workarounds because of stack moves).
- Container attribution goes through cgroup id → docker/k8s metadata.
- Data model: `conn(id, svc, dst, opened_ns, closed_ns, closer, bytes, handshake_ns)` in an in-memory ring, aggregated to SQLite.
- Hard part: inferring "requests per connection" without L7 parsing. Use the count of write/read direction flips on the socket as a request proxy.
- macOS fallback: `nettop`/pcap mode with lower precision.

## v1 scope
- Linux only, kprobes + tracepoints, no TLS uprobes
- 10-minute capture, terminal table output
- Three cause classifiers

## Out of scope (for now)
- Live dashboard, Prometheus exporter
- HTTP/2 and QUIC stream analysis
- Auto-patching configs

## Risks & unknowns
- Requires root/CAP_BPF, which blocks managed platforms.
- The request-count heuristic may misfire on streaming protocols.
- Existing tools (`ss`, Pixie) overlap in part. The niche is the cause classification and the bill.

## Done means
A test Go service that forgets to drain response bodies shows up as the top line item with cause "client closes after each request". After the one-line fix, its tax drops by at least 90% on rerun.
