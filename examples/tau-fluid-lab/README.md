# Tau Fluid Lab

Five standalone React Three Fiber studies use reusable field and scene components:

| Page | Use |
|---|---|
| `flow.html` | Follow tagged fluid parcels and optionally compare instantaneous streamlines. |
| `cavities.html` | Slice through toroidal voids and capacity contours. |
| `tensor.html` | Probe the seven local readings and complete 4×4 matrix. |
| `playground.html` | Compose all display layers and reposition the pair. |
| `charge.html` | Walk through circulation, gap flow, static pressure, surface pushes, and released motion. Flip the right charge in one aligned fixture. |

The index at `/` links the five pages. The four original studies carry their pair settings in the URL when moving among them. The charge study starts with a separate aligned fixture.

## Run

Use Node.js 24 or newer from this directory:

```bash
npm ci
npm run dev
npm test
npm run build
```

Vite serves the index and five HTML entries. The build writes static files to `dist/`.

## What the toy computes

`src/model.ts` defines an authored moving-pair fixture. Each core is an oriented toroidal signed-distance cavity. Toroidal and poloidal flow around the cavities, plus their prescribed slow translation, define a material velocity at each fluid point. The field fades away from the pair. Near each moving cavity surface, its relative normal flow is removed. Tagged parcels integrate this velocity at fixed steps; streamlines follow the velocity frozen at the selected instant. A parcel path can end at a cavity or at the viewing cube's edge.

The local pressure ledger uses normalized values:

```text
macro   = 0.055
dynamic = 0.085 |material velocity|²
shear   = 0.070 |authored twist|
q       = 1 − macro − dynamic − shear
e       = 0.55 × transverse slip
b       = 0.55 × 0.60 × authored twist
```

The shared adapter assembles the local Cartesian comoving matrix in `RCCM-GfX-2.tex` §§2–3:

```text
−q   −ex  −ey  −ez
 ex  1/q  −bz   by
 ey   bz  1/q  −bx
 ez  −by   bx  1/q
```

All visual layers and the inspector sample the same field. Inside a cavity, the sampler returns `void` and no fluid tensor. Medium presence, camera, layers, and display quality do not affect field values. Pose or source edits begin a new deterministic timeline. The cube is an observation window, not a vessel with simulated walls.

In these four studies, the `electron` and `positron` names label the two teaching specimens. Their charge identity stays fixed when either core is turned or its authored circulation is varied. The moving-pair fixture does not derive charge from the torus, generate a pair, solve forces between cores, or solve the RCCM equation of motion. Its twist field is authored; it is not asserted to equal the curl of its material velocity. The pressure allocation is a display regime, not a cavitation law. This boundary follows the repository's [charge-rotation audit](../../docs/charge-rotation-audit.md) and separates the visual toy from [TauLab's scientific engine](../taulab/README.md).

## What the charge study computes

The guided charge page keeps the torus axes parallel and the pair on an x-axis translation rail. It names a left specimen A and a right specimen B, with a separate charge sign, so B can be either an electron or a positron. Its first scene evaluates only A's flow. Later scenes sum two authored circulation fields. The ring winding of B reverses between like and opposite charge; the smaller tube circulation stays fixed. Both contributions satisfy a tangency correction near each cavity surface.

The normalized teaching closure is `p = q = 0.8 − 0.1 |u_A + u_B|²`. The displayed dynamic-pressure cross term is `+0.2 u_A·u_B`, so reinforcing facing flow takes more of the static budget. The pressure colours and gauges sample this same closure. Surface arrows show local inward pressure force; net force is the quadrature `F = −∮p n dA` over each complete torus. Release integrates both positions from these calculated forces at 60 steps per toy-time unit with equal effective masses. It stops before contact or the cube edge. The held stages represent an aligned measurement fixture; the cube itself is an observation window.

This is an in-model illustration of the pressure chain proposed in `RCCM-Condensed.tex`, “Coulomb's Law,” not a solved two-defect flow. It does not establish a charge invariant under arbitrary core rotation, mass, material constitutive law, angular dynamics, or physical time and force units. The cited [charge-rotation audit](../../docs/charge-rotation-audit.md) records the missing core-to-exterior construction. The source, surface forces, tracer paths, and release share one calculation inside this declared aligned fixture.

## Implementation map

- `src/model.ts`: pure geometry, field sampling, pressure ledger, tensor, parcel and streamline tracing.
- `src/scene.tsx`: reusable R3F cube, torus pair, volume, paths, slice, glyphs, probe, and timeline driver.
- `src/main.tsx`: four compositions, controls, inspector, responsive navigation, and URL state.
- `src/charge-model.ts`: aligned two-source circulation, pressure, torus-surface forces, deterministic release.
- `src/charge-scene.tsx` and `src/charge-page.tsx`: guided 3D composition, fluid tracers, pressure cut, source comparison, and narrative controls.
- `src/style.css`: luminous-fluid visual language and responsive layout.

The volume uses a sampled 3D texture and ray integration, adapted conceptually from [Tau Tank](../tau-tank/README.md). Slice contours, traces, and glyphs follow visualization operations used in ParaView and OpenFOAM. The control named **Display quality** changes sampling and line density while preserving the selected path and probe's field reading.
