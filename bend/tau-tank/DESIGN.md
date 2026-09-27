# Tau Tank

A native Bend toy for Tom. RCCM supplies the rules of this world. The first
release is a weak-field macroscopic sandbox with gravity, electric charge and
permanent magnetic moments, traveling fields, movable rigid source bodies,
recorded time, and a freely orbitable observation cube.

## Figure and ground — confirmed 2026-09-26

The tau medium is the primary, continuous substance. It completely fills the
observation cube. Objects read as bubbles or cavities within that substance.
The voxel cells tile the volume with **no geometric gaps**. Their boundaries
are changes in sampled state, not empty cracks or disconnected little boxes.
Opacity increases with available ambient capacity. Integrate extinction over
ray length so changing voxel resolution does not change the tank's opacity.
Use the actual cell field for the colors. Camera, transfer-function and slice
controls affect presentation only. The cavity mask belongs to the finite
black-box body's prescribed boundary; it is not simulated nucleation.

The only initial rendering mode is translucent medium with cavities. Defer
the inverse object-in-empty-space toggle. Present familiar macroscopic bodies
(penny, brick, car, house scale), with scaled units and adjustable playback
speed. Deep zoom, resolved cavitation, fundamental constituent formation,
chemistry, induced polarization and induced magnetization are later work.
Keep world coordinates separate from camera scale and grid spacing so those
extensions do not require rewriting the interaction model.

## Engine and experience

Objects -> distributed sources -> evolving cell field -> force/torque -> objects.

- Native macOS, Bend 2.0.29; pure Bend physics, interaction and rendering.
- Rigid finite source volumes with mass, signed charge, magnetic moment,
  orientation, position, velocity and spin; eight bodies initially.
- Open observation window with an exterior computational buffer; no tank walls.
- Weak-field scalar gravity plus transverse electric/magnetic dynamics at a
  common normalized propagation speed; explicit model closure and conventions.
- Shared exact tensor reference, independently tested F32 numerical operations.
- Stable timestep independent of rendering. Parallel independent spatial work.
- Startup quality selection and paused resolution changes; 16/32/64 visible
  cells per edge are targets, enabled according to measured hardware limits.
- Orbit, zoom, plane/axis-constrained grabbing, separate magnetic orientation,
  pause, step, recorded playback/branching, local experiment save/load.
- Presets: gravity, charge, magnets, mixed, empty. Optional field/tensor inspector.

## Delivery

1. Restore the existing tensor tests on current Bend; establish the continuous
   volume renderer and cavity interaction in a runnable window.
2. Add tested traveling fields, source coupling and body motion.
3. Finish presets, time recording, persistence and measured quality selection.

Each stage must remain runnable. Important exact rules belong in LAWS.bend;
PROOF.bend checks them. Numerical behavior, convergence and rendering require
separate executable tests. Preserve source TeX and existing law meanings.
