# TauLab Executable Demo Validation

## Objective

Prove that someone can check out the committed repository, run `make demo`,
and receive a compelling, scientifically honest RCCM result generated on their
machine.

## Reproducible identities

| Artifact | Identity |
|---|---|
| RCCM-v0 theory bundle | `0159d804fc8b186e3707f1264a56f56abffa395ebc8ae0bcfacf7858d432f503` |
| Demo story/acceptance contract | Git `5c5e967` |
| Red executable acceptance tests | Git `616202a` |
| Green scientific demo engine | Git `4110bb6` |
| Root `make demo` entry point | Git `4895e90` |
| Live GPU | Apple M1, Apple7 family, unified memory |

## Requirement audit

| Requirement | Authoritative evidence | Result |
|---|---|---|
| A checkout exposes `make demo` | Root `Makefile`; committed-archive execution | Pass |
| The command performs real work | CMake builds and runs `taulab-demo`; initial and evolved density fields differ | Pass |
| Output is readable and exciting | Hook, moving field plot, progressive scientific attacks, payoff, and frontier card | Pass |
| Output remains scientifically honest | Explicit “demonstrates / does NOT demonstrate” boundary | Pass |
| Theory identity is immutable | Full RCCM-v0 content hash printed and asserted in tests | Pass |
| Wave speed is measured | Fourier phase is extracted from the evolved density field | Pass |
| Numerical error is attacked | Three live resolutions with decreasing L2 error and reported order | Pass |
| Conservation is visible | Mass, momentum, and total-energy residuals printed and gated | Pass |
| Time control is reproducible | Independent continuations produce identical 64-bit full-state digests | Pass |
| Intervention causation stays separate | One-cell energy edit creates a different branch and reports injected energy | Pass |
| Apple silicon is exercised | Live Metal 3 dispatch over 65,536 cells and nine fields | Pass |
| GPU does not become scientific authority | Metal result is compared to the double-precision CPU oracle | Pass |
| Failures cannot masquerade as success | CPU/available-GPU gate failure makes the executable return nonzero | Pass |
| Existing validation remains green | `bun run validate` after integration | Pass |

## Executed numerical result

```text
predicted c_tau      1.183216
measured c_tau       1.183452
relative mismatch    2.00e-04

mass drift           5.55e-16
momentum drift       3.96e-12
energy drift         5.33e-16

grid cells           32          64          128
L2 field error       2.3573e-06  7.6976e-07  2.4703e-07
observed order       1.615       1.640

closed digest        0b77097a0f988b2e
replay digest        0b77097a0f988b2e
intervened digest    73c42bc850169d16
intervention energy  1.130281e-12 tau-energy
```

## Live Apple Metal result

```text
device               Apple M1
cells                65536
fields               9
unified memory       yes
Apple7 family        yes
max CPU-oracle error 6.64e-08
declared limit       2.00e-06
GPU replay           bit-for-bit
```

The in-app restricted process cannot see Metal and therefore reports an honest
skip. The same committed `make demo` command was also executed outside that
restriction and passed the live GPU gate shown above.

## Fresh-checkout simulation

`git archive HEAD` was expanded into a new temporary directory containing only
committed files. `NO_COLOR=1 make demo` configured, built, executed, printed the
complete report, and exited zero. This excludes untracked local corpus files,
previous build products, and conversation state from the success evidence.

## Story and trust audit

The story opens with a concrete invitation rather than RCCM vocabulary:
“Create a universe. Disturb it once. Then try to catch it lying.” It then makes
the reader apply four reconciliation policies: measurement, refinement,
replay/branching, and CPU/GPU cross-examination.

Story Golf scores the message `3/25`: translation `1`, identity threat `0`,
causal friction `1`, apathy risk `1`, trust burden `0`. Proof happens locally,
requires no sensitive access, and preserves the reader's agency.

The terminal payoff does not claim particles, gravity, electromagnetism,
quantum statistics, chemistry, or the truth of the RCCM ontology. Its strongest
claim is that one locked tau-continuum candidate now produces falsifiable,
converging, conservative, reproducible numerical measurements.
