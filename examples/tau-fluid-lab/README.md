# Tau Fluid Lab

Four standalone React Three Fiber studies share one moving electron/positron tornadonut fixture:

| Page | Use |
|---|---|
| `flow.html` | Follow tagged fluid parcels and optionally compare instantaneous streamlines. |
| `cavities.html` | Slice through toroidal voids and capacity contours. |
| `tensor.html` | Probe the seven local readings and complete 4×4 matrix. |
| `playground.html` | Compose all display layers and reposition the pair. |

The index at `/` links the four pages. Pair settings are carried in the URL when moving between pages.

## Run

Use Node.js 24 or newer from this directory:

```bash
npm ci
npm run dev
npm test
npm run build
```

Vite serves the index and four HTML entries. The build writes static files to `dist/`.

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

The `electron` and `positron` names label the two teaching specimens. Their charge identity stays fixed when either core is turned or its authored circulation is varied. The fixture does not derive charge from the torus, generate a pair, solve forces between cores, or solve the RCCM equation of motion. Its twist field is authored; it is not asserted to equal the curl of its material velocity. The pressure allocation is a display regime, not a cavitation law. This boundary follows the repository's [charge-rotation audit](../../docs/charge-rotation-audit.md) and separates the new visual toy from [TauLab's scientific engine](../taulab/README.md).

## Implementation map

- `src/model.ts`: pure geometry, field sampling, pressure ledger, tensor, parcel and streamline tracing.
- `src/scene.tsx`: reusable R3F cube, torus pair, volume, paths, slice, glyphs, probe, and timeline driver.
- `src/main.tsx`: four compositions, controls, inspector, responsive navigation, and URL state.
- `src/style.css`: luminous-fluid visual language and responsive layout.

The volume uses a sampled 3D texture and ray integration, adapted conceptually from [Tau Tank](../tau-tank/README.md). Slice contours, traces, and glyphs follow visualization operations used in ParaView and OpenFOAM. The control named **Display quality** changes sampling and line density while preserving the selected path and probe's field reading.
