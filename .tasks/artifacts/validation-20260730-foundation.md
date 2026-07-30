# TauLab Foundation Validation

## Certification boundary

This report certifies the first executable engine foundation only. It does not
certify RCCM-v0 as a closed numerical realization, demonstrate emergence, or
support gravity, electromagnetism, particle, quantum, chemistry, or biological
claims.

## Reproducible identities

| Artifact | Identity |
|---|---|
| Theory bundle | `0159d804fc8b186e3707f1264a56f56abffa395ebc8ae0bcfacf7858d432f503` |
| Evergreen spec checkpoint | Git `71dabfa` |
| Theory compiler checkpoint | Git `e6958d6` |
| CPU oracle checkpoint | Git `1359953` |
| Initial Metal checkpoint | Git `fcbc675` |
| GPU | Apple M1, Apple7, unified memory |
| Metal recommended working set | `12,713,115,648` bytes |
| Metal parity tolerance | `2e-6` absolute, float32 versus CPU float64 |

## Executed gates

| Gate | Evidence | Result |
|---|---|---|
| Dimension and shape compiler | 15 Bun tests, including invalid curl-speed comparison | Pass |
| Parameter provenance | cycle and direct/transitive holdout-leakage rejection tests | Pass |
| Theory identity | repeated compile and mutation-sensitive hash tests | Pass |
| Experiment/control contracts | mode, intervention, DAG, and certification tests | Pass |
| Type safety | `bunx tsc --noEmit` | Pass |
| Uniform numerical state | deterministic digest unchanged | Pass |
| Periodic conservation | mass, momentum, and total energy residual tolerances `1e-12` | Pass |
| Manufactured smooth transport | entropy-wave 32/64-cell refinement ratio above `2.5` | Pass |
| Acoustic propagation | one sound-crossing return with 32/64-cell refinement ratio above `2.5` | Pass |
| Shock admissibility | positive density and pressure after 40 steps | Pass |
| Local constitutive response | exact exponential conformation and microrotation relaxation | Pass |
| Phase admissibility | cavity phase remains in `[0,1]` | Pass |
| Metal determinism | identical live GPU dispatches are bitwise equal | Pass |
| CPU/Metal parity | all nine local constitutive fields within `2e-6` | Pass |
| CLI smoke | dense `32^3`, 40 steps; mass residual `1.10245e-13`, energy residual `4.44089e-14` | Pass |

## Live Metal result

```text
Metal parity passed on Apple M1
Apple7=true
recommendedWorkingSetBytes=12713115648
```

## Open scientific gaps

- The numerical hydro core does not yet transport all non-hydrodynamic primary
  fields.
- Elastic, couple, viscous, and diffuse-interface stresses do not yet feed
  momentum and energy.
- Phase dynamics are only a bounded local/diffusive primitive, not a validated
  equilibrium or cavitation model.
- Metal parity currently covers only local conformation and zero-curl
  microrotation relaxation.
- No emergence or reference-physics gate has passed.
- No holdout experiment or distinguishing RCCM prediction has been run.

These gaps keep the parent scientific-engine and numerical-engine tasks open.
