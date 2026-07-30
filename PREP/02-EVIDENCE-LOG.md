# TauLab Adversarial Evidence Log

Evidence tags describe the relation to the original prior, not the truth of the
RCCM ontology.

## Corpus evidence

| Tag | Raw fact | Source | Consequence |
|---|---|---|---|
| `[SUPPORTS]` | The corpus states a continuity condition and an admittance-modified momentum equation with a material derivative. | `RCCM-Condensed.tex`, “The Admittance-Modified Navier-Stokes Equation” | There is enough structure to formulate candidate evolution laws. |
| `[SUPPORTS]` | The corpus separates longitudinal, transverse, and rotational behavior and proposes modal admittances. | `RCCM-Condensed.tex`, “The Unified Fluid Lagrangian & Modal Admittance” | A decomposed continuum state is a plausible implementation target. |
| `[SUPPORTS]` | The corpus proposes Maxwell-shaped identities from transverse displacement and vorticity. | `RCCM-Condensed.tex`, “EM Kinematics & The LC-Acoustic Isomorphism” | Electromagnetic residuals can become explicit benchmarks. |
| `[SUPPORTS]` | The corpus describes stable cavities, vortices, circulation, confinement, annihilation, and beta decay. | `RCCM-Condensed.tex`, “The Unified Topological Engine” and “Continuous Wave Mechanics & Topological Phase States” | It supplies candidate phenomena and topology observables to test. |
| `[SUPPORTS]` | The root atlas already distinguishes source evidence, inference, speculation, and experimentally tested findings. | `README.md`, “Evidence Legend” and “Claim Ladder” | The repository has an epistemic structure suitable for a scientific engine. |
| `[FALSIFIES]` | No minimal complete tau state or single constitutive relation connects density, pressure, moduli, relaxation, temperature, and cavitation. | `README.md`, “Open Gaps” 1–2 | The corpus is not yet a closed PDE specification. |
| `[FALSIFIES]` | Expressions compare `curl(velocity)`, which has units of inverse time, directly with `c`, which has units of velocity. | `RCCM-Condensed.tex`, modal-admittance and antimatter equations | The proposed Lagrangian cannot be coded faithfully without a characteristic-length repair. |
| `[FALSIFIES]` | The phase table assigns electron, quark, photon, and neutrino angles rather than deriving their formation and stability from evolution. | `RCCM-Condensed.tex`, “Topological Charge & The Phase Map” | Particle identity is currently a mapping, not an emergent numerical result. |
| `[FALSIFIES]` | Beta decay is written as an input-output channel without a transition rate, spectrum, branching rule, or probability measure. | `RCCM-Condensed.tex`, “Mechanical Yield & Beta Decay” | Arbitrary reaction simulation is underspecified. |
| `[FALSIFIES]` | The `SU(3)` passage calls strain symmetric, counts nine matrix entries, and later adds antisymmetric rotation. Symmetric traceless `3×3` strain has five independent components. | `RCCM-Condensed.tex`, “Generalized Hooke's Law & SU(3) Symmetry” | Strain and microrotation require separate state and the group mapping remains unproved. |
| `[FALSIFIES]` | Several numerical claims use measured masses, Planck scales, or empirical couplings in their input chain. | `README.md`, “Open Gaps” 8–9 and claim-family gates | Numerical agreement can contain target leakage. |
| `[FALSIFIES]` | No exact quantum measurement, probability, fermionic-statistics, contextuality, or entanglement rule is supplied. | `README.md`, “Open Gaps” 11–12 | Deterministic continuum trajectories are not yet a complete quantum model. |

## Numerical and hardware evidence

| Tag | Raw fact | Observation | Consequence |
|---|---|---|---|
| `[SUPPORTS]` | The target device is an Apple M1 with 8 GPU cores and 16 GB unified memory. | Local hardware query | A bounded dense 3D field solver is feasible. |
| `[SUPPORTS]` | The GPU reports Apple7 and Metal 3 support, unified memory, function pointers, dynamic libraries, and a recommended working set of about 12.7 GB. | Local Metal device query | A Metal compute backend can remain resident and share selected data with CPU analysis. |
| `[SUPPORTS]` | Bun, CMake, Apple Clang, Xcode, and the Metal compiler are installed. | Local toolchain query | The proposed TypeScript/C++/Metal stack can be built locally. |
| `[FALSIFIES]` | GPU access may be unavailable inside a restricted process sandbox even when Metal is installed. | `MTLCreateSystemDefaultDevice()` returned `nil` in sandbox and succeeded outside it. | GPU validation must report unavailable hardware distinctly from kernel failure. |
| `[FALSIFIES]` | The workspace initially had no Git repository and sandbox policy blocked creation of `.git`. | Local repository inspection | Reproducible history depends on approved Git initialization or an external repository. |

## Learned-simulation evidence

| Tag | Raw fact | Consequence |
|---|---|---|
| `[SUPPORTS]` | Learned graph and neural PDE simulators can approximate fluid and deformable trajectories over many steps. | A surrogate can accelerate previews and numerical subproblems. |
| `[FALSIFIES]` | Long rollouts accumulate error and underrepresent important spatial frequencies. | One-step loss cannot certify a scientific trajectory. |
| `[FALSIFIES]` | Generalization across geometry, resolution, and thermodynamic range is not guaranteed. | Novel states require uncertainty detection and exact fallback. |
| `[FALSIFIES]` | Learned trajectories can violate conservation or topology even when visual error is small. | Invariant and topological guards are mandatory. |

## Current update

The evidence supports building a **theory compiler and adversarial numerical
laboratory**. It falsifies building a single authoritative “RCCM simulator”
directly from the current equations.

