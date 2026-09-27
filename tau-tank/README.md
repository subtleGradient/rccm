# Tau Tank — visual field studio

A Three.js toy for exploring the appearance of a continuous, voxel-sampled tau medium. The renderer uses a 3D texture and ray integration, with signed-distance cavities cut out of the material. The Induction scene includes a small quasistatic electromagnetic, circuit and filament model. The other five scenes remain authored field fixtures. A full tau-fluid PDE solver and freely evolving body mechanics are deferred.

## Run

From this `tau-tank/` directory, using Node.js 24 or newer:

- `npm ci`
- `npm run dev`
- `npm test`
- `npm run build`

The existing Sites project is identified by `.openai/hosting.json`. Its static output is `dist/`.

## Saved source

Saved into the RCCM repository on 2026-09-27 from published source commit
`08f9ddb20e6eaadf5d1bccd891004751a1d713dd` (Sites version 4).
Includes source, tests, locked dependencies, public assets and the production build.
The original Sites checkout's Git metadata and installed dependencies were not copied.

Live site: [Tau Tank — Field studio](https://voxel-motion-language.subtlegradient.chatgpt.site/).

## Visual contract

- The medium fills the entire cube. Voxel boundaries have no physical gaps.
- Ambient capacity controls extinction; the presence slider is a display gain. Absorption integrates over physical ray length rather than adding a fixed opacity per voxel.
- Cavity geometry is subtracted from the volume. Bubble, brick, penny and bar shapes are available.
- Longitudinal markers, tapered transverse trails and oriented vorticity orbits are separate layers. The transverse and twist marker strengths follow the dimensionless tensor contributions e and b, including their modulus factor alpha.
- Readout time is independent of the frozen field. Camera movement, markers and visibility controls cannot alter the tensor state.
- Resolution chooses the field texture and inspector's voxel centers. Markers are thinned at high resolutions to keep the display readable; every volume cell is still sampled.
- The focus slab dims surrounding context; it does not remove material from the stored field.
- Drag cavities in the view plane, or edit each position axis in the cavity inspector.

## Authored-scene tensor and pressure mapping

`src/fields.js` follows the local Cartesian, comoving-frame matrix in RCCM-GfX-2.tex sections 2–3 and the teaching aliases in bend/asymmetric-metric-tensor/README.md:

```
-q   -ex  -ey  -ez
 ex  1/q  -bz   by
 ey   bz  1/q  -bx
 ez  -by   bx  1/q
```

Here `q = P_static/P_c`, `e = alpha v_perp/c`, and `b = alpha t_p Omega`. These are dimensionless tensor readings, not SI field units. The symmetric and antisymmetric inspector modes operate on the same stored matrix. Seven readings determine all sixteen entries.

The normalized pressure ledger closes as `P_static + DeltaP_macro + P_dyn + P_shear = P_c = 1`. Ambient capacity is `1 - DeltaP_macro`; it is distinct from remaining static capacity. `P_dyn` is the sum of squared normalized velocity magnitudes; the fixtures bound it so `q > 0`. Display constants are `c = 1`, `rho_tau = 2`, and `t_p = 0.55`. The authored rotational speed uses a fixed display radius of 0.16. The inspector also reports `alpha_s = sqrt(q)`, `alpha_g = sqrt(ambient)` and `alpha_a = sqrt(q/ambient)`.

The source kernels, longitudinal pattern, shear allocation and velocity rescaling are authored fixtures for visual comparison. They are not a derived thermodynamic closure or a solution of the RCCM PDE. Source mass, charge and moment reshape those fixtures; bodies remain where the user places them. The pressure lens depicts total pressure load `1-q`, not a new independent scalar or a calibrated mechanical pressure.

## Induction: motion into light

The default scene contains a permanent-magnet cavity, a five-turn coil on a fixed stand, paired leads, an open/closed circuit contact and a filament bulb. Drag along the guide first, then use **Explore freely** for three-dimensional motion and rotation. Arrow keys move the magnet; in free mode W/S move depth and Shift + arrows rotate. The Layers drawer also provides position and orientation sliders.

**Hold magnet** fixes its current pose while the circuit and thermal state settle. **Pause event** freezes pose, velocity, angular velocity, current, current derivative, temperature and energy totals. Field glyphs keep reading that stored snapshot. **Pause readout** independently stops the glyph phase. The last 30 recorded seconds can be scrubbed and replayed at ¼×, ½× or 1×; playback never recomputes the recorded physics at a new speed. Return live before editing. Circuit reconfiguration and pole reversal start a new recording without a switching arc. Pole choice persists into demonstration sweeps.

### Model contract

`src/induction.js` is independent of Three.js, the DOM and wall time. Public operations construct/step a snapshot, sample fields, compute coil linkage/EMF and reaction, test pose clearance, and manage a bounded recording through `ExperimentClock`. Render settings never enter these operations.

All quantities are relative, with normalized c = 1. The source route is RCCM-Condensed.tex, **EM Kinematics & The LC-Acoustic Isomorphism** (B = curl A, E = −∂t A), with an explicit adapter to the printed GfX Cartesian matrix. This is a restricted forward model inside the toy, not a full constitutive implementation of either document.

- Magnet vector potential: `A = 0.10 (m × r) / (r² + 0.19²)^(3/2)`, where m is its unit body axis times pole sign. Both B and the induced E are differentiated from this same smooth potential; angular as well as translational motion is included.
- The coil is a stationary effective five-turn circular winding of radius 0.72. Its per-current vector potential uses a softened line integral with coupling 0.024 and wire core 0.045. The visible helix is a thin-winding representation of that effective loop. The paired leads' enclosed area is neglected.
- Linkage is `5 ∮ A_magnet · dl`; magnet EMF is its negative time derivative. The circuit's L is computed with the same 96-point quadrature and coil vector potential, so its self-field circulation agrees with the lumped model. `R = 3L`, with 85% assigned to the filament.
- A fixed 1/120 event-second step advances `L dI/dt + RI = EMF`. The midpoint drive uses the actual change in linkage. Midpoint current provides the exact discrete ledger `work = ½LI² + Joule heat` from a zero-current start. Instantaneous EMF and dI/dt are also stored for field readout.
- Filament heating is I²Rbulb; heat capacity 0.055 and cooling coefficient 0.07 produce a short afterglow. Thermal glow is a presentation curve of temperature, not a calibrated spectrum or a direct function of magnet position.
- Reaction force is `I ∇pose(linkage)` and torque uses rotational derivatives. Their work opposes the external source input. Player motion is imposed; these arrows do not integrate magnet recoil.
- Open circuits retain magnet-induced E and have zero loop current. Contact opening resets the experiment; arcing and conductor surface-charge redistribution are not modeled.

For the tensor inspector, `e = E_total` and `b = −B_total`. The negative sign is an explicit orientation adapter to the existing printed matrix. It must not be silently removed by matching variable names. The induction scene fixes `q = 0.88`, ambient capacity 0.90 and the reference pressure ledger; it never rescales induction fields with the authored fixture's pressure clamp. Filament temperature is a separate thermal state.

### What each mark reads

- Violet local rings and orbiting beads: magnet B. Teal rings: current-produced coil B. Their circulation is a readout of the local axial direction, not matter being advected.
- Gold voxel trails and interpolated field traces: total E, including coil self-induction; direction is the push on positive charge. Their circulation around the conductor is RI. Stream traces interpolate the displayed voxel field and do not affect the circuit calculation.
- The inspection sheet shows the magnet's B through the oriented +X coil opening, or its local change rate. Violet is positive and blue negative. The inspector's threading and induced drive likewise refer to the magnet contribution; the separate coil layer shows the response.
- Circuit chevrons: conventional current. Filament glow: temperature. Neither is a stream of particles emitted by the magnet.

The renderer retains geometry and updates field buffers at up to 30 Hz; camera and glyph readout run independently. Stationary coil basis samples are cached. Every volume cell is sampled at the chosen resolution; dense marker grids are thinned. Motion is bounded at fixed steps and a conservative capsule clearance keeps the magnet outside the rig and tank boundary.

Recording waits for motion initially, then includes movement, induced response and filament afterglow. It stops appending frames after two seconds below the activity thresholds (speed, angular speed, EMF, current and current derivative below `1e-4`; filament temperature below `0.002`). The live model keeps evolving; thresholds never clamp physical readings. New activity resumes capture with a baseline frame. Recorded time excludes idle gaps; playback advances through immutable samples, retaining at most 30 captured seconds. Manual event pause holds the exact live snapshot even if recording is idle.

Voxel edges use black absorption inside the volume and black surface lines. Field-marker gain spans 0–500%; opacity saturates without adding colors to white, while field strength, focus and zero-field masking remain independent.

## Checks

Twenty-three Node tests cover induction curl identities, flux surface/contour agreement, pole and motion reversal, speed scaling, open circuits, self-inductance, energy balance, reaction work, timestep/quadrature convergence, pose clearance, snapshot immutability, bounded history, idle recording with automatic resume, exact manual pause during idle, collision settling, and rendering independence. They also cover tensor signs and decomposition, ledger conservation and finite capacity across presets/extreme gains, independence of field values from visual time/camera controls, and cell/cavity boundaries. Browser checks cover WebGL compilation, lenses, slicing, resolution, source editing, readout pause and responsive drawers.

Browser acceptance on 2026-09-26: desktop and 390×844 mobile; guide dragging, keyboard depth/rotation, pole reversal across sweeps, live/hold/pause, slow replay/scrubbing, open-circuit zero current/heat, focus slab, 24³ samples and unchanged paused readings. Follow-up browser checks verified black voxel edges, 500% marker gain in induction and dipole scenes, idle capture stopping and restarting, and quarter-speed replay at 390×844 without horizontal overflow or console errors. The default 12³ scene reached approximately 60 fps in the local browser. Performance varies with device and voxel resolution.

## Graphics references

- [Three.js Data3DTexture](https://threejs.org/docs/pages/Data3DTexture.html)
- [Three.js OrbitControls](https://threejs.org/docs/pages/OrbitControls.html)
