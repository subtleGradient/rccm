# TauLab Adversarial Stress Tests

| Attack | Expected failure signal | Required discriminator |
|---|---|---|
| Halve the grid spacing twice. | A cavity radius, force exponent, or invariant drifts. | Estimate convergence order and refuse emergence status without a stable limit. |
| Double the domain while preserving local resolution. | Far-field behavior changes because of boundaries. | Compare periodic, reflecting, and absorbing boundary families. |
| Rotate and translate the complete initial state. | Observables change with the coordinate frame. | Symmetry residuals and transformed trajectory comparison. |
| Replace one calibrated target with a protected holdout. | A parameter dependency reaches the holdout. | Compiler rejects the bundle before execution. |
| Fit every known experiment simultaneously. | Flexible closure memorizes targets but predicts nothing. | Preserve preregistered experiment families and unused parameter regimes. |
| Remove the imposed cavity seed. | No defect nucleates. | Distinguish seeded stability from spontaneous formation. |
| Perturb a stable vortex below one cell. | Identity changes discontinuously or vanishes. | Resolution-independent topology and basin-of-attraction measurement. |
| Reverse winding. | Mass changes sign or annihilation is not symmetric. | Separate scalar energy from handed topological observables. |
| Bring two candidate defects together. | A hard-coded extractor produces the expected force even when the field does not. | Compute force only from stress/flux through a control surface. |
| Disable microrotation. | Magnetic observables remain unchanged. | Demonstrate which independent state carries rotation rather than relabeling velocity curl. |
| Set elastic relaxation to zero and infinity. | Both limits behave identically. | Recover declared fluid-like and solid-like asymptotes. |
| Force cavity phase outside `[0,1]`. | Solver becomes nonphysical or silently clamps energy. | Reject/project in scientific mode; record debt in sandbox mode. |
| Inject mass without energy in god mode. | Downstream state is reported as autonomous. | Intervention ledger and intervention-dependent certification. |
| Ask time to run backward through dissipation. | Numerical inversion is described as physical reversal. | Restore an earlier checkpoint and branch instead. |
| Run Metal at lower precision. | Topological invariants change while aggregate loss stays small. | Compare field, invariant, and event-level errors to the CPU oracle. |
| Train a surrogate on only smooth waves. | It confidently predicts a collision or cavitation event. | Out-of-domain detection and exact fallback. |
| Train on one theory version and infer on another. | Apparently good predictions hide changed dynamics. | Theory-hash mismatch is a hard failure. |
| Let a surrogate roll out for 10× its training horizon. | Conservation and phase errors compound. | Periodic exact shadow steps, uncertainty growth, and rollback. |
| Match Maxwell residuals by defining observables from Maxwell equations. | “Emergence” becomes tautological. | Observable extractors may read tau state but may not solve the reference target. |
| Match particle mass by using that mass to define the cavity radius. | Output reproduces an input. | Dependency graph marks the result as reconstruction, not prediction. |
| Fit all current data with two incompatible closures. | Both appear “proven.” | Compare complexity, holdouts, and distinguishing predictions. |

## Absurd variable injections

- Make the reference length depend on observer orientation.
- Give the cavity phase negative mobility.
- Swap symmetric strain with antisymmetric microrotation.
- Let a checkpoint claim a different theory hash than its state generator.
- Permit a surrogate to change winding while exactly conserving scalar energy.
- Use a one-cell universe and ask for an inverse-square far field.
- Treat a render frame as a scientific checkpoint.

Each absurd case should fail at the earliest responsible boundary: schema,
dimension/shape compiler, experiment validator, stability guard, or
certification gate.

