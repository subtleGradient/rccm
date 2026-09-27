# Voxel tank rendering studies

Start at [the visual map](index.html), then explore:

1. [One voxel, three visual languages](01-glyphs.html): composite cage, capacity bubble and planar instrument, one state and a live matrix.
2. [Resolution](02-resolution.html): two independently sampled toroidal reference defects, 1/8/64 voxels each, separate mean reciprocal and RMS activity.
3. [The fluid between](03-between.html): +/−, +/+, −/−, mass wells and uniform squeeze, with point-sampled tensor states and opposing face-pressure probes.

RCCM is the physics of this project. These are frozen rendering specimens with source-linked teaching, designed to select a visual vocabulary for the tank.

## Run

From the repository root:

```sh
python3 -m http.server 8777 --bind 127.0.0.1
```

Open <http://localhost:8777/examples/voxel-tank/index.html>. ES modules require HTTP; opening the files directly with `file://` is not supported. There is no build step. All fonts and graphics dependencies are local.

```sh
node --test examples/voxel-tank/*.test.mjs
```

## Files and source

- `math.mjs`: exact GfX Cartesian assembly and the prescribed Gaussian interaction specimen.
- `scene.js`: Three.js scene, camera, keyboard orbit and geometric drawing helpers.
- `glyphs.js`, `resolution.js`, `between.js`: independent visual studies.
- [Hyperslice / Quads-PREP record](../../PREP/voxel-tank-rendering/01-WORKING-MODEL.md): decisions, source facts, controls, counterexamples and rendering contract.
- [Original idea](idea.md): the voxel-tank brief.
- [Canonical GfX source](../../RCCM-GfX-2.tex): §§1–3,4.3,5.3 and16.2 are the primary routes.

## Dependencies

Three.js **0.180.0**, including its core and OrbitControls, is vendored from the npm distribution via jsDelivr. OrbitControls' bare `three` import is changed to the adjacent module path. See `vendor/THREE-LICENSE` (MIT). The architecture uses the [official Three.js documentation](https://threejs.org/docs/).

Inter Variable is vendored from the [official Inter distribution](https://rsms.me/inter/), with `vendor/INTER-LICENSE` (SIL Open Font License). No analytics, backend, or package installation is needed to run the pages.
