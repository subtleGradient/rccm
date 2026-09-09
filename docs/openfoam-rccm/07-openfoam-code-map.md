# OpenFOAM code map: reusable machinery and the RCCM boundary

Return to the [atlas](README.md). Read this beside the [jobs map](01-jobs-and-hyperslices.md), [equation contract](04-equation-contract-and-gaps.md), [prototype audit](05-prototype-audit.md), and [implementation roadmap](06-implementation-roadmap.md).

OpenFOAM already supplies a large part of the machinery for moving fields through a meshed space. It can represent an asymmetric **spatial** stress tensor today. What it does not supply in this inspected tree is the RCCM state definition, a closed evolution system for that state, or the material and observable bridges needed to turn its solutions into gravitational, electromagnetic, or superconducting predictions.

## The inspected snapshot

| Property | Evidence recorded on 2026-09-09 |
|---|---|
| Source directory | `/Users/tom/Developer/OpenFOAM-dev` |
| Distribution | OpenFOAM Foundation development tree; origin `https://github.com/OpenFOAM/OpenFOAM-dev.git` |
| Branch | `master` |
| HEAD | `d58ef9707b444f5230fc80c0c9b4af29ce1373ac` |
| Commit timestamp | `2026-09-09T16:28:45+01:00` |
| Commit subject | `printAtStart coded function object: fixed to print at time 0` |
| Working tree | **103 pre-existing modified tracked files**, 9,658 insertions and 12,849 deletions reported by `git diff --stat` |
| Fingerprint observation | `2026-09-09T16:18:01.755329+00:00`; HEAD and modified-file count unchanged at this check |
| Tracked patch fingerprint | SHA-256 of the 873,032-byte output of `git diff --binary HEAD`: `b204c0bf4493a85d3111ce521343fc91a08a636fa3c8bba84872f12f6d2cac14` |
| Untracked files | `git ls-files --others --exclude-standard` returned **0** files; ignored/build outputs were not fingerprinted |
| Modified families | Thermophysical and chemistry templates, Lagrangian models, `LduMatrix`, gradient code, and other infrastructure |
| Audit method | Read-only source inspection, file inventory, targeted symbol searches, Git provenance inspection |
| Environment | Default task shell; no OpenFOAM environment was sourced or selected, no dependencies installed, and no source or configuration files changed |
| Execution status | **No compile, solver execution, numerical benchmark, or installed-binary verification performed.** |

The line links below identify the **working files as inspected**, not an assertion that every file equals the named HEAD. In particular, chemistry, matrix, and gradient dependencies have local modifications. The fingerprint identifies the tracked diff observed at the recorded instant; it does not freeze a source directory that another process or person can change. A future reproducible build must record the patch or use a deliberately selected clean revision. This audit neither changed nor interpreted ownership of those modifications.

Applicable parent instructions were read from `/Users/tom/Developer/AGENTS.md`; no nested `AGENTS.md` was found inside the inspected OpenFOAM tree. Capabilities in another OpenFOAM distribution or third-party extension are not silently attributed to this checkout.

## The ground: mesh, fields, time, and operators

| Layer | What is present | What it provides to an RCCM implementation |
|---|---|---|
| Three-dimensional vectors | [Vector.H:57](/Users/tom/Developer/OpenFOAM-dev/src/OpenFOAM/primitives/Vector/Vector.H:57) derives from a three-component vector space | Position, velocity, gradients, three-vectors in a spatial time slice |
| General spatial tensors | [Tensor.H:64](/Users/tom/Developer/OpenFOAM-dev/src/OpenFOAM/primitives/Tensor/Tensor.H:64) derives from `MatrixSpace<...,3,3>` | All nine spatial components, including asymmetry; asymmetry itself is not an unsupported datatype |
| Symmetric spatial tensors | [SymmTensor.H:53](/Users/tom/Developer/OpenFOAM-dev/src/OpenFOAM/primitives/SymmTensor/SymmTensor.H:53) stores six independent components | Symmetric strain/stress blocks |
| Arbitrary square matrix storage | [SquareMatrix.H:58](/Users/tom/Developer/OpenFOAM-dev/src/OpenFOAM/matrices/SquareMatrix/SquareMatrix.H:58) accepts a row/column count | Four-by-four algebra/storage is possible; this does not supply a registered spacetime field, metric signature, or spacetime differential operators |
| Physical dimensions | [dimensionSet.H:88](/Users/tom/Developer/OpenFOAM-dev/src/OpenFOAM/dimensionSet/dimensionSet.H:88) defines seven SI base-dimension exponents | Runtime dimensional checking; it cannot decide whether equal-dimension objects have the same physical meaning |
| Spatial derivatives | [fvcGrad.H:53](/Users/tom/Developer/OpenFOAM-dev/src/finiteVolume/finiteVolume/fvc/fvcGrad.H:53), [fvcDiv.H:24](/Users/tom/Developer/OpenFOAM-dev/src/finiteVolume/finiteVolume/fvc/fvcDiv.H:24), [fvmLaplacian.H:24](/Users/tom/Developer/OpenFOAM-dev/src/finiteVolume/finiteVolume/fvm/fvmLaplacian.H:24) | Gradient, divergence, explicit evaluation and implicit finite-volume Laplacian assembly |
| Curl and skew relation | [fvcCurl.C:55](/Users/tom/Developer/OpenFOAM-dev/src/finiteVolume/finiteVolume/fvc/fvcCurl.C:55) computes curl from the dual of `skew(grad(...))` | Existing three-dimensional vector-calculus machinery; no automatic identification with independent Clebsch fields |
| Time derivatives | [fvmD2dt2.H:24](/Users/tom/Developer/OpenFOAM-dev/src/finiteVolume/finiteVolume/fvm/fvmD2dt2.H:24), with first-derivative schemes under `src/finiteVolume/finiteVolume/ddtSchemes/` | First- and second-order time derivatives; a wave-equation implementation need not start from zero |
| Global march and correction loops | [foamRun.C:122](/Users/tom/Developer/OpenFOAM-dev/applications/solvers/foamRun/foamRun.C:122) | Advance a spatial mesh through time, with adaptive time-step hooks and PIMPLE correction stages |

A useful initial representation is a **3+1 split**: keep the existing spatial mesh and represent temporal scalars, mixed temporal-spatial vectors, and spatial tensor blocks explicitly. This is an implementation proposal, conditional on the [equation contract](04-equation-contract-and-gaps.md). It avoids assuming that the mesh must become a four-dimensional mesh merely because the theory has spacetime indices.

The metric signature, index raising/lowering, contraction rules, normalization by the propagation speed, and transformation behavior still need explicit definitions and tests. Ordinary tensor products in [TensorI.H:450](/Users/tom/Developer/OpenFOAM-dev/src/OpenFOAM/primitives/Tensor/TensorI.H:450) are three-dimensional products; naming a field `metric` cannot change those operations.

For a fourth-order spatial equation, the existing Laplacian is a building block. A possible numerical formulation introduces auxiliary fields and solves coupled second-order equations. That choice requires the correct number and kind of boundary conditions, a conservation/energy analysis, and convergence tests. Applying a Laplacian twice without this contract does not establish the desired operator or its boundary-value problem.

## Present physics families and their limits

| Family | Concrete source location | Supported terrain / boundary |
|---|---|---|
| Incompressible fluid flow | [incompressibleFluid/momentumPredictor.C:32](/Users/tom/Developer/OpenFOAM-dev/applications/modules/incompressibleFluid/momentumPredictor.C:32) | Velocity transport, rotation terms, momentum-transport closure, source models, pressure correction |
| Compressible thermofluid flow | [fluid.H:24](/Users/tom/Developer/OpenFOAM-dev/applications/modules/fluid/fluid.H:24), [isothermalFluid.H:24](/Users/tom/Developer/OpenFOAM-dev/applications/modules/isothermalFluid/isothermalFluid.H:24) | Density/pressure/energy machinery with thermodynamic and transport models; material definitions remain required |
| High-speed compressible flow | [shockFluid.H:24](/Users/tom/Developer/OpenFOAM-dev/applications/modules/shockFluid/shockFluid.H:24) | Density-based central-upwind compressible solver, including mesh motion/topology changes; relevant starting terrain for nozzle flow |
| Multiple fluids and interfaces | [incompressibleVoF.H:24](/Users/tom/Developer/OpenFOAM-dev/applications/modules/incompressibleVoF/incompressibleVoF.H:24), [compressibleVoF.H:24](/Users/tom/Developer/OpenFOAM-dev/applications/modules/compressibleVoF/compressibleVoF.H:24), [multiphaseEuler.H:24](/Users/tom/Developer/OpenFOAM-dev/applications/modules/multiphaseEuler/multiphaseEuler.H:24) | Volume-of-fluid and Eulerian multiphase families, with their specific closure/phase assumptions |
| Thin liquid films | [film.H:24](/Users/tom/Developer/OpenFOAM-dev/applications/modules/film/film.H:24), [isothermalFilm.H:24](/Users/tom/Developer/OpenFOAM-dev/applications/modules/isothermalFilm/isothermalFilm.H:24) | Dedicated film models; neither an arbitrary three-dimensional interface model nor a microscopic surface theory |
| Particle-laden flows | [incompressibleDenseParticleFluid.H:24](/Users/tom/Developer/OpenFOAM-dev/applications/modules/incompressibleDenseParticleFluid/incompressibleDenseParticleFluid.H:24), `src/Lagrangian/` and `src/lagrangian/` | Particle transport and coupling infrastructure; particle properties and force laws must be supplied |
| Species transport and reaction heat | [multicomponentFluid/thermophysicalPredictor.C:44](/Users/tom/Developer/OpenFOAM-dev/applications/modules/multicomponentFluid/thermophysicalPredictor.C:44) | Calls a reaction model, transports species mass fractions, normalizes composition, includes reaction heat in energy |
| Single-cell chemistry checking | [chemFoam.C:24](/Users/tom/Developer/OpenFOAM-dev/applications/solvers/chemFoam/chemFoam.C:24) | Designed for single-cell comparisons against other chemistry solvers; not first-principles discovery of reaction pathways |
| Molecular dynamics | [mdFoam.C:24](/Users/tom/Developer/OpenFOAM-dev/applications/legacy/lagrangian/mdFoam/mdFoam.C:24), [moleculeCloud.H:148](/Users/tom/Developer/OpenFOAM-dev/src/Lagrangian/molecularDynamics/moleculeCloud/moleculeCloud.H:148) | Existing molecular-dynamics implementation uses prescribed potentials; presence of molecular machinery does not establish an electronic-structure or superconductivity solver |
| Solid heat flow and deformation | [solid.H:24](/Users/tom/Developer/OpenFOAM-dev/applications/modules/solid/solid.H:24), [solidDisplacement.H:24](/Users/tom/Developer/OpenFOAM-dev/applications/modules/solidDisplacement/solidDisplacement.H:24) | Heat-transfer machinery plus linear-elastic, small-strain displacement with optional thermal stress; not a general Cosserat or quantum-material constitutive law |
| Applied gravity and buoyancy | [buoyancy.H:27](/Users/tom/Developer/OpenFOAM-dev/src/finiteVolume/cfdTools/general/buoyancy/buoyancy.H:27), [buoyancy.C:36](/Users/tom/Developer/OpenFOAM-dev/src/finiteVolume/cfdTools/general/buoyancy/buoyancy.C:36) | Reads uniform gravitational acceleration `g`, builds gravitational potential-height terms and `p_rgh`; does not derive gravity from RCCM source fields |

These are source capabilities, not proof that every family is compiled or working in this locally modified checkout. Specific case files, transport models, numerical settings, and validation remain necessary for each job.

### Electromagnetics exists already, with explicit scope

Three legacy applications were found:

1. [electrostaticFoam.C:62](/Users/tom/Developer/OpenFOAM-dev/applications/legacy/electromagnetics/electrostaticFoam/electrostaticFoam.C:62) solves an electric-potential Poisson equation and then a charge-density transport equation. It is not a general transient Maxwell-wave solver.
2. [magneticFoam.C:24](/Users/tom/Developer/OpenFOAM-dev/applications/legacy/electromagnetics/magneticFoam/magneticFoam.C:24) solves a magnetic scalar-potential problem for permanent magnets, producing magnetic fields and optionally a paramagnetic particle-force field.
3. [mhdFoam.C:27](/Users/tom/Developer/OpenFOAM-dev/applications/legacy/electromagnetics/mhdFoam/mhdFoam.C:27) describes **incompressible laminar conducting-fluid flow**, with uniform viscosity, conductivity, and permeability. The source explicitly says electric-field/current-density boundary conditions are not supported. Its [momentum equation at line 95](/Users/tom/Developer/OpenFOAM-dev/applications/legacy/electromagnetics/mhdFoam/mhdFoam.C:95) and [magnetic induction/correction loop at line 154](/Users/tom/Developer/OpenFOAM-dev/applications/legacy/electromagnetics/mhdFoam/mhdFoam.C:154) are useful reference implementations. The header also records a discretization issue involving stress cancellation; reuse should include its own numerical tests.

Thus “add electromagnetism” is too coarse a requirement. The missing work is the particular coupled field equations, sources, constraints, boundary conditions and material response required by the intended experiment. Superconductivity would require a defined state and closure for superconducting behavior and measured observable comparisons; a zero-resistance coefficient or an MHD magnetic field alone does not specify those phenomena.

### Inverse design exists, with a narrower objective than arbitrary field synthesis

[adjointShapeOptimisationFoam.C:27](/Users/tom/Developer/OpenFOAM-dev/applications/legacy/incompressible/adjointShapeOptimisationFoam/adjointShapeOptimisationFoam.C:27) is a legacy steady incompressible duct-optimization example. It introduces blockage in regions that contribute to pressure loss, using an adjoint formulation. Its source distinguishes its total-pressure-loss objective from the referenced paper's power-loss objective. The [blockage update at line 113](/Users/tom/Developer/OpenFOAM-dev/applications/legacy/incompressible/adjointShapeOptimisationFoam/adjointShapeOptimisationFoam.C:113) exposes a concrete design variable and update rule.

This is evidence for a reusable inverse-design pattern, not a general “draw the desired flow, receive the ideal object” capability. A nozzle or RCCM-device optimizer still needs a parameterized geometry/material/control space, an objective, constraints, a reliable forward solve, sensitivities or a derivative-free search, and evaluation across operating conditions. An adjoint must match the actual new governing equations and objective; reusing the duct adjoint unchanged would optimize a different problem.

## The pressure loop is a specific constraint mechanism

The current incompressible module assembles velocity transport, rotation, stress closure, and model sources in [momentumPredictor.C:36](/Users/tom/Developer/OpenFOAM-dev/applications/modules/incompressibleFluid/momentumPredictor.C:36). Its [pressure correction at line 47](/Users/tom/Developer/OpenFOAM-dev/applications/modules/incompressibleFluid/correctPressure.C:47) forms the inverse momentum diagonal and predicted face flux; [line 89](/Users/tom/Developer/OpenFOAM-dev/applications/modules/incompressibleFluid/correctPressure.C:89) solves a pressure Poisson equation, and [line 105](/Users/tom/Developer/OpenFOAM-dev/applications/modules/incompressibleFluid/correctPressure.C:105) corrects flux and velocity.

That is reusable machinery for a particular mass/volume conservation constraint. If an RCCM reduction has variable effective density, independent pressure/admittance evolution, new wave modes, or additional constraints, derive the corresponding pressure and flux equations. A PISO loop does not infer them from the stress tensor.

The matrix layer is also more nuanced than “everything is scalar-only.” [fvMatrixSolve.C:80](/Users/tom/Developer/OpenFOAM-dev/src/finiteVolume/fvMatrices/fvMatrix/fvMatrixSolve.C:80) selects segregated or coupled solution, with segregated as the default. However, the shown [coupled path at line 237](/Users/tom/Developer/OpenFOAM-dev/src/finiteVolume/fvMatrices/fvMatrix/fvMatrixSolve.C:237) uses `LduMatrix<Type, scalar, scalar>`. This is not evidence of an already assembled arbitrary cross-field RCCM Jacobian. Strong coupling, nonlinear iteration, constraints, and preconditioning need design and testing for the selected equation set.

## Extension seams: where new behavior can enter

| Change needed | Existing seam | Work still required |
|---|---|---|
| Add a source to an existing equation | [fvModel.H:24](/Users/tom/Developer/OpenFOAM-dev/src/finiteVolume/cfdTools/general/fvModels/fvModel.H:24), [codedFvModel.H:27](/Users/tom/Developer/OpenFOAM-dev/src/fvModels/general/codedFvModel/codedFvModel.H:27) | Define dimensions, field dependencies, implicit/explicit treatment and conservation accounting |
| Replace or extend a constitutive stress | Momentum-transport call at [momentumPredictor.C:40](/Users/tom/Developer/OpenFOAM-dev/applications/modules/incompressibleFluid/momentumPredictor.C:40) | Derived constitutive model or dedicated solver path; check whether the existing closure interface's assumptions fit asymmetric stress |
| Add independent field evolution or new correction stages | [solver.H:118](/Users/tom/Developer/OpenFOAM-dev/src/finiteVolume/solver/solver.H:118) runtime selection, [solver.H:169](/Users/tom/Developer/OpenFOAM-dev/src/finiteVolume/solver/solver.H:169) lifecycle methods | Implement state construction, equations, coupling, time-step limits, read/write behavior and boundary conditions |
| Couple spatial regions | [foamMultiRun.C:24](/Users/tom/Developer/OpenFOAM-dev/applications/solvers/foamMultiRun/foamMultiRun.C:24) | Define physically justified interface conditions and exchange quantities; multiple regions do not automatically solve multiscale closure |
| Support a new state representation | Existing scalar/vector/tensor fields, or custom datatype and registration | Serialization, interpolation, processor exchange, boundary patch handling, algebra, operator semantics and visualization |
| Track experiment observables | [forces.H:24](/Users/tom/Developer/OpenFOAM-dev/src/functionObjects/forces/forces/forces.H:24), [forceCoeffs.H:24](/Users/tom/Developer/OpenFOAM-dev/src/functionObjects/forces/forceCoeffs/forceCoeffs.H:24), [volFieldValue.H:24](/Users/tom/Developer/OpenFOAM-dev/src/functionObjects/field/fieldValues/volFieldValue/volFieldValue.H:24) | Define the correct RCCM physical measurement map and add missing conservation/constraint diagnostics |

A small source modification can fit an `fvModel`. A new independent field family or altered conservation structure points toward a dedicated solver module. A small standalone algebra library is useful before either: tensor construction, contractions, admissibility checks and dimensional mappings can be tested without a mesh.

## Geometry, parallel execution, and readable outputs can be reused

The surrounding toolchain is a major part of OpenFOAM's value:

- [blockMesh.C:24](/Users/tom/Developer/OpenFOAM-dev/applications/utilities/mesh/generation/blockMesh/blockMesh.C:24) and [snappyHexMesh.C:24](/Users/tom/Developer/OpenFOAM-dev/applications/utilities/mesh/generation/snappyHexMesh/snappyHexMesh.C:24) provide mesh-generation entry points.
- [checkMesh.C:24](/Users/tom/Developer/OpenFOAM-dev/applications/utilities/mesh/manipulation/checkMesh/checkMesh.C:24) provides mesh-quality checks.
- [decomposePar.C:24](/Users/tom/Developer/OpenFOAM-dev/applications/utilities/parallelProcessing/decomposePar/decomposePar.C:24) provides domain decomposition for parallel runs.
- [foamToVTK.C:24](/Users/tom/Developer/OpenFOAM-dev/applications/utilities/postProcessing/dataConversion/foamToVTK/foamToVTK.C:24) exports results for downstream visualization.
- Existing source cases include [airFoil2D](/Users/tom/Developer/OpenFOAM-dev/tutorials/incompressibleFluid/airFoil2D), [motorBikeSteady](/Users/tom/Developer/OpenFOAM-dev/tutorials/incompressibleFluid/motorBikeSteady), and [adjoint pitzDaily](/Users/tom/Developer/OpenFOAM-dev/tutorials/legacy/incompressible/adjointShapeOptimisationFoam/pitzDaily).

These support forward experiments, sweeps, and optimization loops. They do not replace an external optimizer, a CAD/manufacturing constraint system, or uncertainty quantification merely by being present.

## Concrete compatibility gaps in the supplied prototype

The [prototype](../../binyamin-sim/asymmetricTensorFoam.c) is not ready to build against this tree. This is a source/API comparison; no compile was attempted.

| Prototype request | Inspected checkout evidence | Consequence |
|---|---|---|
| `#include "fvCFD.H"` at line 22 | No tracked file with this name found | Explicit required headers must be selected for this Foundation revision |
| `addCheckCaseOptions.H` and `setRootCaseLists.H` at lines 28–29 | Neither tracked header found; stock programs use [setRootCase.H](/Users/tom/Developer/OpenFOAM-dev/src/OpenFOAM/include/setRootCase.H:1) | Case/bootstrap code needs porting |
| `postProcess.H` at line 27 | [postProcess.H:49](/Users/tom/Developer/OpenFOAM-dev/src/OpenFOAM/db/functionObjects/functionObjectList/postProcess.H:49) defaults `CREATE_CONTROL` to `createControl.H`; [line 94](/Users/tom/Developer/OpenFOAM-dev/src/OpenFOAM/db/functionObjects/functionObjectList/postProcess.H:94) includes it unless `NO_CONTROL` is defined | Prototype directory also needs compatible post-processing/control setup |
| `createFields.H` at line 35 | No companion header supplied in `binyamin-sim/` | Fields, dimensions, initial/boundary conditions and pressure reference are undefined |
| `runTime.timeName()` at line 42 | [Time.H:400](/Users/tom/Developer/OpenFOAM-dev/src/OpenFOAM/db/Time/Time.H:400) exposes static `timeName(scalar, precision)`; current stock applications use `userTimeName()` | No-argument call needs porting |
| `runTime.printExecutionTime(Info)` at line 114 | No `printExecutionTime` symbol found in `src/OpenFOAM/db`; stock [foamRun.C:195](/Users/tom/Developer/OpenFOAM-dev/applications/solvers/foamRun/foamRun.C:195) prints elapsed times explicitly | Reporting call needs porting |
| Pressure reference and solve calls | Current [mhdFoam.C:133](/Users/tom/Developer/OpenFOAM-dev/applications/legacy/electromagnetics/mhdFoam/mhdFoam.C:133) uses `pressureReference.refCell()/refValue()` and `pEqn.solve()` | Port and compile the entire pressure loop; similarity to a PISO example is insufficient evidence of API compatibility |

The [prototype audit](05-prototype-audit.md) carries the equation and field-meaning analysis. The practical implication here is to select and record one supported distribution/revision before completing the program. Header conventions in the prototype do not establish compatibility with the user's Foundation development checkout.

## Scoped negative findings

The following searches inspected `src/` and `applications/` in this checkout, not all third-party OpenFOAM projects or the internet:

- Filename searches located the electromagnetic and adjoint applications listed above; none was inferred from another distribution.
- A case-insensitive source-text search over `*.[CH]` for `superconduct`, `london equation`, `ginzburg`, `clebsch`, `cosserat`, `micropolar`, `einstein`, `lorentzian`, and `levi.civita` returned no matches.
- A filename search did not locate a dedicated `biharmonic` operator; it did locate first/second time-derivative and Laplacian operators.
- `git ls-files` found none of the three missing prototype headers listed above.

Negative text search is limited evidence: an implementation can use different names, and custom extensions may exist outside the checkout. Combined with the directly inspected tensor types, solver equations and available modules, it supports the narrower conclusion that **this inspected source tree does not show a ready RCCM, relativistic-metric, Cosserat, or superconductivity solver**. It does not support “OpenFOAM cannot be extended to do this.”

The missing layer is consequently a set of explicit model contracts plus selected numerical extensions, not wholesale replacement of the mesh engine. The [roadmap](06-implementation-roadmap.md) orders those additions by what can be specified and falsified first.
