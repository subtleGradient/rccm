---
id: task-taulab-numerics
level: medium
status: in-progress
blocked_by: []
ok_refs: [".ok/taulab.ok.md#Reference and Metal solvers", ".ok/taulab.ok.md#Validation ladder"]
gap_refs: ["gap-coupled-primary-state", "gap-constitutive-feedback", "gap-full-metal", "gap-dense-convergence"]
---

# Build TauLab numerical engine

Own the CPU oracle, Metal parity backend, numerical tests, and validation
reports after the theory contracts are executable.

The bounded foundation has a green CPU oracle and first live Metal parity
kernel. The next atomic move is `task-transport-rccm-primary-fields`; the
medium-level task remains open until the complete RCCM-v0 discrete state,
coupled constitutive feedback, dense convergence, and corresponding Metal
kernels satisfy the evergreen solver and numerical-validation razors.
