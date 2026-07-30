## Overview
Anneal is a CLI that answers a question every Python performance effort asks badly: *which functions are worth compiling, and which ones can be compiled at all?* Restricted-Python compilers (Shed Skin, mypyc, Cython pure mode) demand static, monomorphic code — but nobody knows which parts of a real codebase already qualify. Anneal runs your program, records the concrete type shape at every call, joins that with a sampling CPU profile, and emits a crystallization report: the minimal cut of functions that are both hot and already statically well-behaved. For Python teams with a real hot loop and no appetite for a rewrite.

## Problem
Optimizing Python currently means guessing. You pick a module, annotate it, run mypyc, and discover it's 3% of runtime — or that one `**kwargs` passthrough poisons the whole call graph. The information needed ("is this function ever called with two different argument type shapes?") is a *runtime* fact, and no static tool can see it. Meanwhile the compilers themselves fail with unhelpful errors deep in the call tree, hours in.

## How it works
`anneal run -- python train.py` wraps your normal invocation. Two observers attach:
- **Shape recorder.** PEP 669 `sys.monitoring` with `PY_START`/`PY_RETURN` events, sampled at 1-in-N calls per code object with an adaptive rate (drop the rate for anything called >10k times). For each sampled call it records a *type shape*: `(qualname, tuple(type(a).__name__ for a in args), return_type)`, plus container element types probed one level deep (first + last element of lists, one key/value pair for dicts). Shapes are hashed into a per-code-object `Counter`.
- **CPU sampler.** py-spy in `--nonblocking` mode against the same PID, folded stacks at 100Hz, attributed to code objects by `(file, line)`.

A static pass (ast/tree-sitter) flags disqualifiers per function: `eval`, `setattr` on non-self, `*args`/`**kwargs` forwarding, dynamic imports, decorators from unknown modules, mutation of a global.

Then: build the call graph from the sampled stacks, and compute the **crystal**: the maximal subgraph where every node is monomorphic (one dominant shape ≥ 99% of samples), has no disqualifiers, and every edge stays inside the subgraph or crosses a clean boundary (only primitives/`list[int]`-shaped values pass). Rank candidate crystals by cumulative self-time. Report:

```
crystal #1  •  41.2% of CPU  •  9 functions  •  compilable: mypyc ✓  shedskin ✗ (set of tuples)
  geom.dist(x: float, y: float) -> float          22.1%  1 shape
  geom.bbox(pts: list[tuple[float,float]]) -> ...  9.4%  1 shape
  ✗ geom.load(path)   3 shapes: (str,) (Path,) (bytes,)   ← blocks the crystal, split it
```

`anneal patch` writes the observed annotations into the source as a diff.

## Technical approach
Pure Python 3.12+ core (the whole point is `sys.monitoring`'s near-zero cost for disabled events), rustworkx for the call graph, py-spy as a subprocess. Data model is a single SQLite file: `shape(code_id, shape_hash, argtypes_json, count)`, `sample(code_id, self_ns)`, `edge(caller_id, callee_id, count)`, `disqualifier(code_id, kind, lineno)`. The hard part is *representative coverage*: shape data is only as honest as the workload you ran, so Anneal reports a confidence column (samples per function) and refuses to call anything monomorphic below a floor. Second hard part is boundary typing — a crystal is only useful if its edges pass compiler-friendly values, which is a graph-cut problem with a cost function over argument types.

## v1 scope
- One process, no threads, no async
- `sys.monitoring` shape recorder + py-spy folded stacks
- Report only: ranked list of monomorphic hot functions with observed signatures
- Disqualifier list: `eval`/`exec`, `**kwargs` forwarding, `setattr`
- No crystal graph-cut yet — just "hot ∧ monomorphic ∧ clean"

## Out of scope
Actually invoking mypyc/Cython, multiprocessing, C extension boundaries, generating stubs for third-party libs, IDE plugin.

## Risks & unknowns
Overhead of shape recording on call-heavy workloads (target <15%); how often real code is monomorphic at all (may be depressingly rare in library-heavy code, which is itself a publishable finding); joining py-spy line attribution to code objects across decorators.

## Done means
Run it on a real numeric Python project, get a ranked report, hand-annotate the top crystal, compile with mypyc, and measure a wall-clock speedup on the same workload — with the report's predicted CPU share matching the observed improvement within a factor of two.
