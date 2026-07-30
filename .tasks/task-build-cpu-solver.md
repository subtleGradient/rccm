---
id: task-build-cpu-solver
level: low
status: done
blocked_by: []
ok_refs: [".ok/taulab.ok.md#Reference and Metal solvers"]
gap_refs: ["gap-cpu-solver"]
---

# Build the CPU reference solver

Implement the deterministic C++23 structured-grid oracle and its conservative,
manufactured, acoustic, relaxation, and replay tests.

Completed with a structure-of-arrays `TauGrid`, MUSCL/Rusanov finite-volume
transport, SSP-RK2 time integration, exact local Maxwell and microrotation
relaxation, bounded diffuse-phase response, CFL enforcement, deterministic
state digests, and analytic/conservation/admissibility tests.
