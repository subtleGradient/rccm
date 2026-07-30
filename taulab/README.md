# TauLab

TauLab is the executable scientific-theory layer for RCCM. It treats each
candidate continuum as a versioned, falsifiable hypothesis and keeps reference
physics outside the candidate evolution.

The canonical destination is
[`../.ok/taulab.ok.md`](../.ok/taulab.ok.md). Current work state lives only in
[`../.tasks/`](../.tasks/). The six Quads-PREP governance artifacts live in
[`../PREP/`](../PREP/).

## Implemented boundary

The current foundation contains:

- a TypeScript theory compiler that checks physical dimensions, tensor shape,
  symbol closure, parameter cycles, and direct or transitive holdout leakage;
- a content-hashed immutable RCCM-v0 candidate bundle;
- typed experiment modes, intervention ledgers, checkpoint-DAG identity, and
  trajectory-certification rules;
- a deterministic double-precision C++23 structured-grid oracle with
  structure-of-arrays state;
- second-order MUSCL finite-volume reconstruction, Rusanov fluxes, SSP-RK2,
  CFL enforcement, and positivity floors for compressible transport;
- exact local Maxwell-conformation and microrotation relaxation plus a bounded
  diffuse-phase response;
- analytic smooth transport and acoustic refinement tests, periodic
  conservation, deterministic replay, shock admissibility, relaxation, and
  phase-bounds tests;
- a live Metal 3 compute path for the first local constitutive law, verified on
  the Apple M1 against the CPU oracle.

The immutable RCCM-v0 theory identity is:

```text
0159d804fc8b186e3707f1264a56f56abffa395ebc8ae0bcfacf7858d432f503
```

## Scientific claim boundary

This is a validated **engine foundation**, not yet a validated physical
theory. The numerical implementation does not yet include:

- conservative/adaptive transport of all microrotation, conformation, and
  cavity fields;
- feedback from elastic, couple, viscous, or diffuse-interface stresses into
  momentum and total energy;
- semi-implicit diffusion and full phase-field equilibrium dynamics;
- discrete Helmholtz extraction, stable emergent defects, or interacting
  defect benchmarks;
- Metal transport and phase kernels;
- serialized full-state checkpoints and experiment-result bundles;
- electromagnetic, quantum, particle, chemical, or biological claims;
- learned acceleration.

Nothing beyond the implemented test surface is scientifically certified.
Standard gravity, Coulomb, Maxwell, particle, and reaction laws have not been
inserted into tau evolution.

## Build and validate

Requirements are Bun, CMake 3.25 or newer, a C++23 compiler, and on macOS,
Metal 3.

```bash
cd taulab
bun install
bun run validate
```

The validator runs the TypeScript gates, builds the C++/Objective-C++ engine,
runs the CPU tests, attempts the live Metal parity test, and executes a
deterministic CLI smoke experiment. A process that cannot see a Metal device
reports an explicit skip. To make that a hard failure:

```bash
TAULAB_REQUIRE_METAL=1 bun run validate
```

Individual entry points:

```bash
bun test
bun run typecheck
bun run theory:validate
cmake -S engine -B build/engine -DCMAKE_BUILD_TYPE=RelWithDebInfo
cmake --build build/engine --parallel
ctest --test-dir build/engine --output-on-failure
./build/engine/taulab-cli --scenario entropy-wave --grid 32 --steps 40
```

## Stateless resumption

A fresh agent or contributor should:

1. read `.ok/taulab.ok.md` as the unchanging target;
2. read the `status`, `blocked_by`, `ok_refs`, and `gap_refs` front matter in
   `.tasks/*.md`;
3. inspect `git log --oneline` and repository evidence rather than relying on
   conversation history;
4. run `cd taulab && bun run validate`;
5. take the smallest unblocked low-level task and preserve failed evidence.

The current next numerical move is recorded in
[`../.tasks/task-transport-rccm-primary-fields.md`](../.tasks/task-transport-rccm-primary-fields.md).
