# OpenFOAM hello world: sliding-lid cavity

A 10 cm square of viscous fluid starts at rest. Its top boundary slides right
at 1 m/s; the other three sides hold still. Viscosity drags the nearby fluid,
and the walls turn that motion into a clockwise circulating roll.
Think of an endless belt passing across the top: the square stays in place.

This is a conventional incompressible Navier–Stokes example, adapted from the
[OpenFOAM cavity tutorial](https://www.openfoam.com/documentation/tutorial-guide/2-incompressible-flow/2.1-lid-driven-cavity-flow).
It establishes the simulation-to-ParaView workflow for later tensor experiments.

## Run

From the repository root:

```sh
./examples/openfoam-cavity/run.sh
```

The script uses `~/bin/openfoam` (override with `OPENFOAM_LAUNCHER`), runs
`blockMesh`, `checkMesh`, `icoFoam`, and gradient/vorticity post-processing,
then verifies the output. Every run gets a new directory under `runs/`.
It solves in `/private/tmp` to avoid OpenFOAM path handling issues with spaces
in the repository path, then copies the complete results back. Scratch output
is retained, including logs if a command fails. Generated runs are Git-ignored.

With the resulting run directory substituted below:

```sh
~/Applications/ParaView.app/Contents/bin/pvpython \
  examples/openfoam-cavity/view.py \
  examples/openfoam-cavity/runs/openfoam-hello.XXXXXX
```

In ParaView, choose **File → Load State**, select that run's
`hello-cavity.pvsm`, and keep **Use File Names From State**. The prepared view
shows speed colours, velocity arrows, and streamlines at 2 seconds. Use the
first-frame and play buttons to watch the saved transient. A PNG preview is
saved beside the state. If you move the case, regenerate the state to update
its absolute data path.

Alternatively open `cavity.foam`, click **Apply**, choose **U → Magnitude**
for colouring, and jump to the last time step. The `.foam` file is an empty
marker: keep its surrounding mesh and time directories with it.

## Read the scene

| Mark | Input and meaning |
|---|---|
| Colour | Speed, 0–1 m/s on a fixed scale |
| White arrows | Velocity direction; length scales with speed |
| Curves | Streamlines tangent to the velocity at the selected instant; not tracked particle histories |
| Time | Simulated seconds, independent of playback speed |

Select **Fluid midplane** in the pipeline to colour by `p`, `vorticity`,
or `grad(U)` instead. For signed out-of-plane rotation choose `vorticity → Z`
and rescale the colour range. Toggle the arrow and streamline eyes to inspect
the field without overlays.

## Case contract and checks

| Setting | Value |
|---|---|
| Tested runtime | OpenCFD OpenFOAM v2512, build `_87ed40d256-20251219`, native macOS `darwin64ClangDPInt32Opt` |
| Solver | `icoFoam`, laminar incompressible flow, PISO pressure correction |
| Geometry | 0.1 × 0.1 m; one 0.01 m numerical extrusion, with `empty` front/back boundaries enforcing 2D flow |
| Mesh | 40 × 40 × 1 = 1,600 cells |
| Kinematic viscosity | 0.01 m²/s; Reynolds number = speed × length / viscosity = 10 |
| Time | 0–2 s, step 0.0025 s, writes every 0.025 s: 81 saved times including the initial condition |
| Pressure `p` | Kinematic pressure, physical pressure divided by constant density, units m²/s²; reference value zero at cell 0 |

`verify.py` requires a passing mesh, completed run, Courant number below 1,
small continuity error after the final PISO correction of **every** step,
all expected times, finite final fields, zero out-of-plane velocity, and
both lid entrainment and return flow. These are smoke checks, not a
mesh/time convergence study or benchmark-accuracy claim. The idealized abrupt
lid/sidewall junction also has corner singularities; don't read corner peaks
as resolved measurements.

The case files retain their upstream headers; `COPYING` carries OpenFOAM's
GPL licence. This case targets the installed OpenCFD v2512 runtime, separate
from the Foundation `OpenFOAM-dev` source checkout documented elsewhere.

## Next tensor experiment

We already save `grad(U)` (nine spatial components, units 1/s) and
`vorticity = curl(U)` (three components, units 1/s). A useful next scene would
put a tiny cross in each cell and separately show its instantaneous
deformation and rotation using the symmetric and antisymmetric parts of the
velocity gradient. Explicitly fix the component convention before interpreting
signs or applying either matrix to a vector.

That is a bridge to tensor intuition. RCCM's dimensionless 4 × 4 tensor in
[`RCCM-GfX-2.tex` Sections 1–3](../../RCCM-GfX-2.tex) additionally requires
its capacity ratio, transverse-slip state, Clebsch rotational sector and
normalization. The cavity's kinematic pressure is not that capacity ratio,
and its total curl is not automatically the Clebsch-sector vorticity. A later
RCCM view should expose those inputs and its chosen formula explicitly.

First prediction: if the lid slides left instead, what happens to the main
roll's rotation direction?
