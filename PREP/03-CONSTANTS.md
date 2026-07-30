# TauLab Constants and Control Group

These are constraints for the research process. RCCM-specific physical claims
are deliberately absent unless identified as candidate assumptions.

## Mathematical constants

- [ ] Addition and equality connect only quantities with matching dimensions
  and tensor shapes.
- [ ] A spatial gradient subtracts one length exponent.
- [ ] A time derivative subtracts one time exponent.
- [ ] `curl(velocity)` has dimension `T^-1`; multiplying by a length is
  required to obtain velocity.
- [ ] A symmetric `3×3` tensor has six independent components.
- [ ] A symmetric traceless `3×3` tensor has five independent components.
- [ ] An antisymmetric `3×3` tensor has three independent components.
- [ ] A numerical solution is not independent of discretization until a
  convergence study establishes a limiting result.

## Conservation controls

- [ ] Closed-universe evolution declares and audits mass, linear momentum,
  angular momentum, and total energy.
- [ ] Controlled experiments balance the same ledgers including boundary work
  and source flux.
- [ ] God-sandbox changes are external interventions, not conservation-law
  violations attributed to the candidate universe.
- [ ] Dissipative constitutive terms transfer or degrade resolved free energy
  according to their declared thermodynamic ledger.

## Scientific-method controls

- [ ] Calibration evidence and protected holdout evidence are assigned before
  fitting.
- [ ] A revealed holdout cannot change the same immutable theory version.
- [ ] Every parameter has one declared role and an inspectable dependency
  graph.
- [ ] Passing dimensional analysis is necessary but never sufficient for a
  physical identification.
- [ ] Matching known data establishes empirical adequacy only within the tested
  domain.
- [ ] A claim of new physics requires a preregistered distinguishing prediction
  and independent reproduction.

## Numerical controls

- [ ] The CPU reference backend uses deterministic algorithms and double
  precision where supported.
- [ ] Metal results are compared with tolerance rather than assumed identical.
- [ ] Timestep selection satisfies the declared stability limits.
- [ ] Boundary conditions, domain size, grid size, and precision are part of
  every result identity.
- [ ] Manufactured solutions and refinement studies precede interpretation of
  RCCM-specific failures.

## Hardware controls

- Target baseline: Apple M1, 8 GPU cores, 16 GB unified memory.
- Supported baseline: Apple7 GPU family and Metal 3.
- Measured recommended GPU working set: approximately 12.7 GB.
- TauLab sustained allocations must reserve memory for the operating system,
  compiler/runtime, checkpoints, and analysis rather than treating the
  recommendation as a target.

## Model constants for normalized RCCM-v0

These are normalization choices, not empirical discoveries:

- `c = 1`
- baseline density `rho0 = 1`
- reference length `L0 = 1`
- derived reference time `t0 = L0 / c = 1`

Every physical export must carry an explicit adapter from normalized units to
SI values.

