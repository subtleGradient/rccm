---
id: task-build-metal-parity
level: low
status: done
blocked_by: []
ok_refs: [".ok/taulab.ok.md#Reference and Metal solvers"]
gap_refs: ["gap-metal-solver"]
---

# Build the Metal parity backend

Implement Metal kernels for the first supported discrete laws and compare them
against the CPU oracle using declared tolerances on the Apple M1.

Completed for the first bounded Metal law: exact local conformation and
microrotation relaxation. Runtime-compiled Metal 3 code executed on the Apple
M1/Apple7 GPU, replayed deterministically, and matched all nine CPU-oracle
fields within the declared `2e-6` single-precision tolerance. Conservative
transport, phase evolution, and coupled stress feedback remain future kernels.
