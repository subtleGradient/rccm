# Tau Fluid Lab

Eight standalone React Three Fiber studies use reusable field and scene components:

| Page | Use |
|---|---|
| `flow.html` | Follow tagged fluid parcels and optionally compare instantaneous streamlines. |
| `cavities.html` | Slice through toroidal voids and capacity contours. |
| `tensor.html` | Probe the seven local readings and complete 4×4 matrix. |
| `playground.html` | Compose all display layers and reposition the pair. |
| `charge.html` | Walk through circulation, gap flow, static pressure, surface pushes, and released motion. Flip the right charge in one aligned fixture. |
| `starfield.html` | Watch one coasting cavity revealed by fluid markers and entrained medium. |
| `pair.html` | Explore a conjugate winding field with fluid paths, gap probe, pressure slice, tensor, and calculated boundary motion. |
| `atom.html` | Explore a knotted proton, guided 1s/2s/2p motion, a full fluid volume and three movable slices. |

The index at `/` links all eight pages. The four original studies carry their pair settings in the URL when moving among them. The charge study starts with a separate aligned fixture; the single-cavity, pair-field, and proton/electron pages are separate component playgrounds.

## Run

Use Node.js 24 or newer from this directory:

```bash
npm ci
npm run dev
npm test
npm run build
```

Vite serves the index and eight study HTML entries. The build writes static files to `dist/`.

The production export opens the proton/electron playground at `/`, with the complete study gallery retained at `/lab.html` and the original page routes preserved. Sites configuration lives in `.openai/hosting.json`; publish from an isolated checkout of this directory, not the encompassing RCCM repository.

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

## What the pair field playground computes

`pair.html` uses a separate trial field. Each cavity is empty. In its local torus frame, a monotone streamfunction produces a poloidal slip tangent to its boundary; a toroidal circulation supplies a rotational channel. These local flows turn with the cavity. A separate signed, radial charge-slip halo is centered on each cavity but does not use its axis as the charge direction. This is an explicit orientation-invariant field hypothesis inspired by the focused TeX's polarity and transverse-slip mapping; the TeX does not derive this halo or a solved charged-defect boundary field. The scenario selector loads two negative windings near each other or one positive and one negative winding farther apart. Each cavity gets an independent random 3D axis on load and on every loop.

The sampler returns the two charge-slip contributions, local poloidal and toroidal flow, their resultant slip, internal vorticity, normalized static pressure, capacity `q`, and the §3 tensor. The gap probe displays each charge-slip vector, their sum, and the cross term `−ρτ vcharge,1·vcharge,2`. The normalized teaching pressure closure allocates `½ρτ|vcharge,1 + vcharge,2|²` to dynamic pressure, with a fixed macroscopic reserve and a floor at `q = 0.08`. Like signs cancel charge slip in the gap; opposite signs reinforce it. Local vortex and entrained motion still move tracers and enter the displayed tensor slip, but do not spend pressure in this closure. The pressure slice colours static pressure only; particle count is not used as pressure. Its violet-to-teal palette stretches from the lowest to highest fluid pressure in the current slice on each sampled frame, so colors compare locations within a frame rather than absolute pressure across time. This selective ledger is a trial assumption, not a full RCCM constitutive equation.

Boundary arrows show the local change in static-pressure push relative to each isolated cavity, plus a separate twist cue from the neighbouring vorticity. Quadrature over each torus surface gives a net pressure force and torque. The trajectory integrates these using explicitly normalized added mass and rotational inertia. No approach or retreat curve is prescribed: the two presets instead start at different separations, and the charge-slip halo makes their pressure interaction visible over the ten-second teaching timeline. Continuity and no-flux residuals remain visible in the inspector: the radial charge halo is not a solved incompressible, no-flux fluid flow around a torus. Particle paths are cached at fixed steps so scrubbing returns to the same positions. This pressure-force closure is not an integration of the focused tensor's full spatial traction `Tn`.

Playback loops at ten seconds. The first page load and each later loop independently randomize both cavities' starting directions over 3D space, plus small initial yaw and tilt angular velocities. The orientation then evolves through its own angular inertia and the calculated boundary torque. Winding signs and initial separation stay fixed for the selected scenario. The panel displays the starting angles and rates used for the current loop. If the trial predicts first contact before ten seconds, the pair holds its contact pose until the loop restarts. The focused TeX also sketches possible pre-contact orbital deflection. The page does not supply a solved charged-cavity initial/boundary value problem or a physical electron–positron annihilation calculation.

## Continuous proton and electron experiment

`atom.html` is a design playground that leaves `pair.html` unchanged. `RCCM-GfX-2.tex` is the current formal reference for slip, internal twisting, remaining scalar capacity and tensor assembly (§§1–3). The current TeX's atomic-quantization roadmap does not supply a proton knot or the trajectories in this page. The earlier prototype's pressure-driven atom motion has been replaced with explicitly guided motion at the user's request.

The scene starts with one positive trefoil cavity and two negative ring cavities, both using a shared 1s shape guide. The proton uses an authored (2,3) knot; it is not attributed to GfX-2 as a derived proton topology. Fluid marks wrap around its empty tube, with no filled surface mesh. Cavity yaw, tilt and angular velocity are independently randomized; rotating a cavity does not change its charge or its selected orbital axis. Sizes and the 32:1 inertia ratio are enlarged/compressed for visibility. The proton recoils in the common center-of-mass presentation.

Each electron can use 1s, 2s, or a real 2p x/y/z guide. Reference densities come from the analytic hydrogen wavefunctions in [MIT OCW §4.5, Tables 4.3–4.4](https://ocw.mit.edu/courses/6-974-fundamentals-of-photonics-quantum-electronics-spring-2006/8a3eb732190cc7fc2520fa122bed8dcd_hydrogen_atom.pdf); approximate energy labels use the 1/n² series and [NIST's hydrogen ionization energy](https://physics.nist.gov/PhysRefData/Handbook/Tables/hydrogentable1.htm). The 2s radial node and real 2p nodal plane are encoded. A seeded lavender reference cloud samples those densities. Display masks exclude enlarged cavity interiors without changing the underlying analytic function.

Motion uses a regularized log-density gradient, damped random stirring, core clearance and adjustable electron avoidance at fixed 1/120 scene-second steps. The paths are imagined, not quantum trajectories, and their residence need not match the supplied density after these visual constraints. There is no loop or fixed orbit rail. The independent recorded visit cloud uses a fixed 48³ grid, a volume-normalized radial histogram, and a 30-second trail per electron. Population/guide/motion changes clear observations; display changes do not. The cube is a 24-unit observation volume, not a confining wall.

Ten thousand tracers initially fill the volume, adjustable from 3,000 to 18,000. Gray means weak or balanced source influence, yellow positive, and blue negative. A signed source-weighted hue emphasizes overlapping electron influence. The optional **proposed blue avoided regions** layer adds blue at supplied orbital nodes and softens preferred regions toward gray. This is the user's capacity interpretation rendered as a visual hypothesis, not a derivation; its colors do not drive electron motion. Scalar q and signed tensor components remain distinct from this hue. Neutral color need not mean a vanishing field.

Three orthogonal cuts move independently through the whole cube, with individual toggles, position sliders, recenter buttons, opacity and quantity selection:

| Quantity | Reading and palette |
|---|---|
| Remaining capacity | `q = −S00`; violet → teal, with ambient capacity nearly transparent. |
| Charge-linked slip | Source-weighted blue → gray → yellow, matching the fluid interpretation. |
| Rotational twist | `Ayz = −α t_p Ωx`; mint → gray → coral. |
| Orbital reference | Supplied `|ψ|²`; dark → lavender, empty at nodes. |

The selective pressure closure still computes `P_static = max(0.08, P_c − ΔP_macro − ½ρτ |Σv_charge|²)`. Local swirl and translation populate fluid movement and tensor readings but are not all included in this pressure budget. The signed radial halo remains an assumed field, not a solved solenoidal, no-flux PDE. Guided motion is intentionally separate from that pressure calculation. Background tracer replenishment at the view edges is a display mechanism.

One proton with two electrons represents negative hydrogen, not helium; the two electrons may share 1s. Independent hydrogen templates do not reproduce the correlated negative-ion density. Extra electrons and excited combinations are an unrestricted design palette, not claimed bound states. No full fluid solver, orbital derivation or conservation/convergence claim is made. Per prototype instructions, no tests or browser/layout QA were performed; publishing runs the production build.

## Implementation map

- `src/model.ts`: pure geometry, field sampling, pressure ledger, tensor, parcel and streamline tracing.
- `src/scene.tsx`: reusable R3F cube, torus pair, volume, paths, slice, glyphs, probe, and timeline driver.
- `src/main.tsx`: four compositions, controls, inspector, responsive navigation, and URL state.
- `src/charge-model.ts`: aligned two-source circulation, pressure, torus-surface forces, deterministic release.
- `src/charge-scene.tsx` and `src/charge-page.tsx`: guided 3D composition, fluid tracers, pressure cut, source comparison, and narrative controls.
- `src/starfield-cavity.ts` and `src/starfield-main.tsx`: one coasting cavity and its focused playground.
- `src/playground-controls.tsx`: playback and scene clock shared by the component playgrounds.
- `src/pair-field.ts`: charge winding hypothesis, field sampler, pressure and tensor, boundary traction, and deterministic motion.
- `src/pair-particles.tsx`, `src/pair-visuals.tsx`, and `src/pair-main.tsx`: particles, probe, pressure and force views, and the pair playground.
- `src/atom-geometry.ts` and `src/atom-orbitals.ts`: empty trefoil/ring geometry and analytic hydrogenic references.
- `src/atom-field.ts` and `src/atom-simulation.ts`: trial fluid field, independent guided wandering and bounded residence recording.
- `src/atom-fluid.tsx` and `src/atom-reference.tsx`: charge-colored volume/cavity tracers and the supplied probability cloud.
- `src/atom-visuals.tsx`, `src/atom-main.tsx`, and `src/atom.css`: movable slices, recorded visits, inspection and exploration controls.
- `src/style.css`: luminous-fluid visual language and responsive layout.

The volume uses a sampled 3D texture and ray integration, adapted conceptually from [Tau Tank](../tau-tank/README.md). Slice contours, traces, and glyphs follow visualization operations used in ParaView and OpenFOAM. The control named **Display quality** changes sampling and line density while preserving the selected path and probe's field reading.
