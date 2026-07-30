---
id: task-build-executable-demo
level: low
status: in-progress
blocked_by: []
ok_refs:
  - ".ok/taulab.ok.md#Reference and Metal solvers"
  - ".ok/taulab.ok.md#Validation ladder"
gap_refs:
  - "gap-demo"
---

# Build the executable RCCM demo

Make a fresh checkout answer `make demo` with a self-contained, deterministic
terminal experiment that a curious technical reader can run without first
learning TauLab's internal tooling.

The demo must:

- compile and execute the real C++23 reference solver;
- lock its report to the immutable RCCM-v0 theory hash;
- measure acoustic propagation rather than merely print an assumed speed;
- show numerical improvement under grid refinement;
- show conservation residuals and bitwise deterministic replay;
- exercise the live Metal constitutive kernel when Metal is available and
  compare it against the CPU oracle;
- clearly state both the bounded result and the unproven scientific frontier;
- fail with a nonzero status if any reported scientific gate fails.

Acceptance evidence:

1. C++ tests cover each numerical gate and the reader-facing claim boundary.
2. `make demo` succeeds from the repository root.
3. The displayed results come from the run in progress, not stored fixtures.
4. The ordinary `taulab` validation suite remains green.

