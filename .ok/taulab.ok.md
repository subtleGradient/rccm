# TauLab Scientific Simulation Engine — Evergreen OK State

## How to use this specification

This file defines what **must remain true** of TauLab. It is intentionally
stateless: it contains no dates, sprint status, completion percentages, or
chronological backlog.

Reality is reconciled against these binary assertions:

- `TRUE` means the repository contains inspectable evidence satisfying the
  assertion.
- `FALSE` means the assertion generates fresh work in `.tasks/`.
- Uncertainty counts as `FALSE` until an executable or documentary mark exists.

Current gaps, work ordering, and progress belong exclusively in `.tasks/`.
Deleting and rebuilding `.tasks/` must never change the meaning of this file.

## Purpose and scientific boundary

### razor-purpose-1 — Scientific instrument before game engine

**TRUE iff** TauLab can define, execute, reproduce, and falsify versioned RCCM
candidate theories without depending on a game interface or visualization.

### razor-purpose-2 — Executable hypothesis, not presumed truth

**TRUE iff** every RCCM-specific physical identification is labeled as a
candidate hypothesis until it passes its declared mathematical and empirical
gates.

### razor-purpose-3 — Separate forms of success

**TRUE iff** dimensional consistency, algebraic validity, structural
correspondence, numerical agreement, empirical adequacy, novel prediction, and
external replication are recorded as different evidence levels.

### razor-purpose-4 — Reference physics remains external

**TRUE iff** Standard Model equations and established experimental
measurements are comparison targets and are not silently inserted into tau
evolution as forces, particle identities, or reaction rules.

## Cardinal hyperslices

| Razor | Side A | Side B | Required invariant |
|---|---|---|---|
| Causation | Endogenous tau evolution | Exogenous intervention | Every external change is represented by an intervention ledger |
| Scientific authority | Reference numerical solver | Learned surrogate | Scientific acceptance terminates in exact residual verification or reference replay |
| Model layer | RCCM candidate | Reference physics | Agreement is measured without making it tautological |
| Evidence use | Calibration | Holdout | A revealed holdout cannot modify the same theory version |
| Representation | Universal state | Observable | Mass, charge, spin, fields, and particles remain extractors until emergence is demonstrated |
| Resolution | Resolved | Effective | Every coarse model declares and tests its validity domain |
| Dynamics | Continuous evolution | Topological transition | Cavitation, reconnection, decay, and annihilation require executable transition dynamics |
| Time behavior | Reversible mechanics | Dissipation and yield | Rewind restores checkpoints rather than pretending irreversible physics runs backward |

### razor-hyperslice-1 — Every artifact has a side

**TRUE iff** every trajectory, observable, benchmark, and model declares its
position on each applicable hyperslice instead of blurring the two sides.

### razor-hyperslice-2 — Intervention is not prediction

**TRUE iff** downstream results produced by arbitrary state edits are marked
intervention-dependent and cannot be reported as autonomous predictions.

### razor-hyperslice-3 — Empty quadrant is rejected

**TRUE iff** a learned surrogate operating on novel or out-of-domain states
automatically falls back to the reference solver rather than certifying its own
trajectory.

## Quads-PREP governance

### razor-governance-1 — PREP corpus exists

**TRUE iff** `PREP/01-WORKING-MODEL.md` through
`PREP/06-IMPACT-ASSESSMENT.md` exist and respectively hold the current
hypothesis, adversarial evidence, constants, stress tests, theoretical
framework, and practical/scientific impact audit.

### razor-governance-2 — Theory versions are immutable

**TRUE iff** each executable `TheoryBundle` has a canonical content hash and
any change to an equation, closure, parameter role, observable mapping, or
provenance produces a new identity.

### razor-governance-3 — Failed theories remain evidence

**TRUE iff** a failed theory version, its experiment manifests, inputs,
checkpoints, and results remain reproducible and are never overwritten by a
later fit.

### razor-governance-4 — Parameter roles are explicit

**TRUE iff** every parameter is classified as exactly one of `axiom`,
`closure`, `calibrated`, `derived`, `nuisance`, or `holdout`.

### razor-governance-5 — Target leakage is mechanically blocked

**TRUE iff** dependency validation rejects cycles and rejects any non-holdout
parameter or governing law fitted from protected holdout evidence.

## Formal theory compiler

### razor-compiler-1 — Public contracts are stable

**TRUE iff** machine-readable contracts exist for:

- `TheoryBundle`
- `TauState`
- `ObservableExtractor`
- `ExperimentManifest`
- `InterventionLedger`
- `Checkpoint`
- `TrajectoryCertification`

### razor-compiler-2 — Dimensions form an executable type system

**TRUE iff** expressions occupy coordinates in mass, length, time,
temperature, and charge dimension-space; multiplication adds coordinates,
division subtracts them, powers scale them, derivatives shift them, and
addition/equality reject mismatched coordinates.

### razor-compiler-3 — Shape is distinct from dimension

**TRUE iff** scalar, vector, symmetric-tensor, antisymmetric-tensor, and general
tensor shapes are checked independently from physical units.

### razor-compiler-4 — Every equation closes

**TRUE iff** every governing and constitutive equation references defined
symbols, has compatible shapes and dimensions, declares its domain and
boundary assumptions, and identifies its provenance.

### razor-compiler-5 — SI export is explicit

**TRUE iff** normalized tau units declare `c = 1`, `rho0 = 1`, and a reference
length while every exported observable carries an explicit mapping and
uncertainty back to SI units.

## RCCM-v0 candidate continuum

### razor-theory-1 — Candidate status is visible

**TRUE iff** RCCM-v0 is labeled as a versioned implementation hypothesis:
a compressible micropolar viscoelastic diffuse-interface continuum, not a
claim that the current RCCM corpus already derives this complete closure.

### razor-theory-2 — Primary state is minimal and complete

**TRUE iff** each resolved cell contains mass density, momentum density, total
energy density, independent angular-momentum or microrotation state, symmetric
elastic memory, cavity/order parameter, and declared boundary/source fields.

### razor-theory-3 — Conservation and closure are explicit

**TRUE iff** the theory supplies conservation laws for mass, linear momentum,
angular momentum, and energy plus executable evolution for elastic relaxation
and the cavity phase, all closed by one dimensionally and thermodynamically
auditable free-energy/constitutive model.

### razor-theory-4 — Helmholtz sectors are derived

**TRUE iff** longitudinal, transverse, and rotational sectors are derived from
primary state through a discrete Helmholtz decomposition rather than evolved
as redundant velocity fields.

### razor-theory-5 — Rotational speed is dimensionally repaired

**TRUE iff** rotational saturation compares `vRot = ellRot * |curl(v)|` with
`c`, and the characteristic length `ellRot` is declared by the theory version.

### razor-theory-6 — Strain and rotation are not conflated

**TRUE iff** symmetric traceless strain carries five independent components,
microrotation carries three, and their `5 + 3` count is not called `SU(3)`
without a demonstrated representation- and dynamics-preserving map.

### razor-theory-7 — Familiar forces are emergent tests

**TRUE iff** Newtonian gravity, Coulomb force, Maxwell force, particle
identities, and decay channels are absent from tau evolution and appear only
as observable mappings or external benchmarks.

## Reference and Metal solvers

### razor-solver-1 — Deterministic CPU oracle exists

**TRUE iff** a C++23 command-line reference solver can reproduce a trajectory
from theory hash, experiment manifest, checkpoint, timestep policy, and seed.

### razor-solver-2 — Conservative numerical core exists

**TRUE iff** the CPU solver uses a second-order conservative finite-volume
method on a structured grid, with explicit conservative transport and
implicit or semi-implicit handling of declared stiff relaxation, diffusion,
and phase-field terms.

### razor-solver-3 — Metal is an equivalent backend

**TRUE iff** a Metal compute backend executes the same discrete laws and every
kernel is compared against the CPU oracle with declared floating-point
tolerances.

### razor-solver-4 — Dense truth precedes sparse optimization

**TRUE iff** dense-grid convergence is established at practical grids up to
`128^3` before active bricks or multiresolution change the numerical domain.

### razor-solver-5 — Memory use is bounded

**TRUE iff** primary fields use structure-of-arrays storage, hot GPU state
avoids unnecessary copies, and the sustained working set stays below a
declared safe fraction of the target device recommendation.

### razor-solver-6 — Numerical error is separable from theory failure

**TRUE iff** manufactured solutions, refinement studies, CPU/Metal parity, and
invariant residuals can distinguish discretization failures from failures of
the candidate physical model.

## God control and experiment execution

### razor-control-1 — Three modes are enforced

**TRUE iff** execution distinguishes:

- `closed-universe`: no post-initialization intervention;
- `controlled-experiment`: only declared apparatus, sources, and boundaries;
- `god-sandbox`: arbitrary edits with visible conservation debt.

### razor-control-2 — Every intervention balances a ledger

**TRUE iff** interventions record injected or removed mass, momentum, energy,
angular momentum, topology, and boundary work.

### razor-control-3 — Scientific mode protects the state manifold

**TRUE iff** invalid scientific-mode edits are rejected or projected into a
valid state with the projection recorded, while sandbox edits remain allowed
but intervention-dependent.

### razor-control-4 — Time control is reproducible

**TRUE iff** pause, rewind, and branching use a checkpoint DAG containing full
state digests, parent identity, theory and solver hashes, time, timestep, seed,
and branch reason.

### razor-control-5 — Accepted trajectories are self-describing

**TRUE iff** any accepted result can be reconstructed from its experiment
manifest, theory hash, solver hash, checkpoint lineage, and deterministic seed.

## Learned acceleration

### razor-surrogate-1 — Training truth is full state

**TRUE iff** exact checkpoints store physical fields rather than rendered
images and training examples map state, boundary, intervention, and time
increment to a predicted state delta plus uncertainty.

### razor-surrogate-2 — Datasets are theory-versioned

**TRUE iff** training, validation, and holdout samples identify the exact
theory and solver that generated them and incompatible theory versions are not
silently mixed.

### razor-surrogate-3 — Adoption order protects authority

**TRUE iff** learned acceleration is introduced in this order:

1. initial guesses and preconditioners followed by exact residual correction;
2. speculative timeline previews;
3. adaptive selection of exact high-resolution regions;
4. reduced-order components verified by resolved replay.

### razor-surrogate-4 — Every learned step is guarded

**TRUE iff** conservation residuals, symmetry, topology, uncertainty, and
domain coverage are checked and any failure rolls back to the last exact
checkpoint.

### razor-surrogate-5 — Scientific certification ends in exactness

**TRUE iff** a surrogate-influenced scientific result is accepted only after
exact residual verification at every accelerated solve or complete
reference-solver replay.

## Validation ladder

### razor-validation-1 — Formal gate

**TRUE iff** all symbols are stable, all equations are shape- and
dimension-compatible, the PDE system is constitutively closed, and the
parameter dependency graph is acyclic.

### razor-validation-2 — Numerical gate

**TRUE iff** the implementation passes manufactured solutions, acoustic
propagation, shock/pressure relaxation, viscoelastic response, vortex
transport, angular-momentum accounting, phase-boundary equilibrium,
CPU/Metal parity, and spatial/temporal convergence.

### razor-validation-3 — RCCM emergence gate

**TRUE iff** a stable finite-energy cavity and persistent vortex emerge
without imposed particle forces, share one underlying state, possess
resolution-independent invariants, and interact without separately coded
gravity, electric, or magnetic laws.

### razor-validation-4 — Reference-physics gate

**TRUE iff** frozen theory versions are tested in order against dispersion,
Maxwell residuals and polarization, static pair scaling, magnetic torque,
moving-source behavior, interference, scattering, bound-state spectra,
spin/statistics, annihilation, and decay observables.

### razor-validation-5 — Holdouts stay untouched

**TRUE iff** calibration and holdout data are separated before fitting, one
frozen parameter set addresses all applicable benchmarks, and any revision
after a holdout failure creates a new theory version.

### razor-validation-6 — Claims include uncertainty

**TRUE iff** every comparison reports numerical uncertainty, experimental
uncertainty, parameter provenance, applicable validity domain, and the
strongest evidence level actually reached.

### razor-validation-7 — Equivalence is not ontology

**TRUE iff** matching established results is reported as empirical adequacy
rather than proof of the tau ontology, and stronger claims require
preregistered distinguishing predictions plus independent reproduction.

## Scope and staged destination

### razor-scope-1 — Initial engine scope is protected

**TRUE iff** gameplay, polished visualization, biological micromachines, and
player experience cannot block or weaken the scientific engine’s formal,
numerical, and reproducibility gates.

### razor-scope-2 — First executable milestone is bounded

**TRUE iff** the first milestone delivers the governance corpus, compiled
RCCM-v0 theory bundle, dimension/dependency gates, deterministic control
contracts, CPU continuum primitives, and CPU/Metal comparison infrastructure.

### razor-scope-3 — First external milestone is ordered

**TRUE iff** electromagnetic propagation and pair interaction are attempted
only after stable continuum primitives, and quantum statistics and reactions
are attempted only after stable topological defects emerge.

## Stateless resumption protocol

### razor-resume-1 — No hidden state

**TRUE iff** a new agent can read this specification, inspect repository
reality, regenerate `.tasks/`, and identify the next atomic action without
conversation history.

### razor-resume-2 — Progress is evidence

**TRUE iff** task completion is determined from files, tests, manifests,
checkpoints, and validation output rather than prose claims or remembered
intent.

### razor-resume-3 — The spec survives replanning

**TRUE iff** all ephemeral tasks may be archived and regenerated without
altering this OK state; changing the intended scientific destination requires
an explicit edit to this file and a corresponding new reconciliation snapshot.

