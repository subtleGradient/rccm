# Pressure & Twist — graphical end-goal proposal

**Status: recommended concept for discussion, not an approved build plan.**
The user has chosen end-goal-first planning; the primary audience and final
scene remain open. This proposal concerns graphical lessons for the
[Bend tensor course](../bend/asymmetric-metric-tensor/README.md#L1), not a
replacement for [TauLab's scientific-engine destination](../.ok/taulab.ok.md#L19).

## The destination

**A transparent, evolving continuum laboratory that you can pause, cut open,
and question.** A visitor moves between the whole field and one local tensor
without changing experiments. Pressure capacity, transverse slip, internal
twist, face exchanges and the next state remain connected on screen.[^scope]

[^scope]: RCCM supplies the proposed physical interpretation. Exact tensor
    identities, prescribed-field fixtures, numerical evolution under a declared
    closure, and independent physical validation are different evidence layers.
    The interface and saved experiments identify which layer is running.

The target is a native 3D room with a precise slice view, not twenty lessons
repainted as widgets. Its local instrument is the microscope inside the world,
not the entire world. A 2D slice may be a useful implementation slice later;
it does not define the ceiling of the end goal.

**Visitor promise:** “I can open this apparent empty space, see which parts of
its local structure my measurement misses, change one thing, and predict a
different reading or a bounded momentum exchange.”

**Provisional audience:** visually curious technical adults and programmers
who do not already think in tensor notation. Equations, numerical diagnostics
and provenance are deeper inspection layers. If the primary audience is
instead physics/CFD specialists, benchmark credibility should move into the
opening scene.

## Why this scene rather than the alternatives?

These are design judgments to test, not measured audience scores.

| Candidate | Strongest feature | Main weakness | Decision |
|---|---|---|---|
| Paused-world force theater: bodies, gravity, charge and magnets | Immediately recognizable physical stakes and motion | Familiar trajectories can hide the tensor and require body/field bridges not yet supplied | Keep as a later application or a different opening for a broad audience |
| Local tensor instrument bench | Clearest demonstration of signed pairs and ordered probes; closest to existing exact contracts | Can become the same incremental curriculum with glowing controls | Reuse as the microscope, not the whole destination |
| Transparent CFD laboratory with a tensor microscope | Connects a visible field, local structure, face exchanges and evolution; gives parallel computation useful work | Most demanding integration; spectacle can obscure causes | **Recommended**, with one controlled reversal as its central story |

The lesson is not “this fluid looks impressive.” It is:

> Two states can look identical through a pressure map and still differ in a
> directional reading. Open the field and discover what that first view hid.

## A proposed 90-second visitor journey

This is an end-state storyboard, not a claim that these graphics or a complete
solver already exist.

1. **Enter the world.** A bounded transparent volume contains a pressure-capacity
   landscape, sparse flow markers and a highlighted sampling patch. Start with
   few visual channels. Any apparatus, forcing and boundary exchange are visible;
   a sampling cube is not a solid wall or an unexplained pinned body.
2. **Pause and fork the view.** Compare two authored field snapshots with the
   same `q` and opposite selected twist. Their capacity maps agree. State exactly
   what the intervention holds fixed. This comparison does not promise that
   arbitrary sign edits preserve a coupled PDE solution or its later pressure.
3. **Cut open the patch.** Show the signed transverse momentum-flux arrows on
   selected faces. They reverse while the diagonal readings stay fixed. The
   visitor sees a sideways exchange, not merely a changed number.
4. **Ask the hidden question.** A same-direction probe cannot distinguish
   the two antisymmetric contributions. Give the probe a second, different
   direction; the selected cross-reading reveals the difference. The matrix
   appears here as a compact record of something already visible.
5. **Reveal the other channel.** Switch between a spatial pair, such as `xy`,
   and a time-space pair, such as `tx`. This distinguishes the twist channel
   from the transverse-slip channel rather than calling every curl “magnetism.”
6. **Unpause with a ledger.** Under an explicitly selected dynamics mode, show
   local exchanges building the next state. The exact frozen-face fixture can
   already explain equal-and-opposite cell momentum gains. A coupled field
   evolution must carry its own closure, boundary and numerical evidence.
7. **Return the control to the visitor.** Ask them to predict a different
   axis-pair reversal before revealing it. Replay restores the saved state,
   including existing momentum; it does not erase inertia or reverse dissipation.

The visual consequence is essential. A probe-only opening risks teaching
memorized color changes. Conversely, a movie of turning parcels must not
invent dynamics to make the prescribed tensor appear physically complete.

## One world, three legible channels

The [focused matrix](../RCCM-GfX-2.tex#L125-L143) and
[course aliases](../bend/asymmetric-metric-tensor/README.md#L44-L85) provide
the initial map:

| Channel | Visual reading | Formal attachment |
|---|---|---|
| Pressure capacity | Contours plus a local nested-budget meter | `q = P_static/P_c`; symmetric entries `-q` and `1/q` |
| Transverse slip | Directional ribbons and an inspectable time-space pair | `e_i = alpha v_perp,i/c`; entries `U_ti = -e_i`, `U_it = e_i` |
| Internal twist | Oriented rings plus spatial cross-pair/face-flux readings | `b_i = alpha t_p Omega_i`; for example `U_xy = -b_z`, `U_yx = b_z` |

The gravity-related view opens the macroscopic compartment of the
[nested pressure ledger](../RCCM-GfX-2.tex#L49-L85). It does not relabel every
change in `q` as gravitational: local loads also consume capacity.
The electromagnetic view opens the proposed electric/slip and magnetic/twist
identifications in [section 3.2](../RCCM-GfX-2.tex#L117-L141).

Keep the sensory legend precise:

- physical static pressure, remaining capacity `q`, spatial weight `1/q`, and
  stress deviation `P_c(U-eta)` have distinct readouts;
- the regular nonnegative-load branch has `0 < q <= 1`; exhausted capacity
  is a different state, not an ordinary reciprocal hidden behind a clamp;
- a spatial-weight glyph is not a simulated material deformation;
- slip/twist colors do not assert charge density, material response or SI
  electric/magnetic units;
- time-space entries need a time-space inspector, not a disguised fourth
  spatial axis or an ordinary spatial-face traction;
- streamlines, particle paths, field axes and flux arrows are different marks;
- “foam” is a possible visual style, not evidence of resolved physical
  bubbles, cavities or emergent particles.

## The exact insight underneath the scene

For two probe directions `a` and `b`, define the displayed reading as
`B(a,U,b) = a^T U b`. Split it into `S` and `A` contributions:

```text
B(a,S,b) =  B(b,S,a)
B(a,A,b) = -B(b,A,a)
B(a,A,a) = 0
```

Only the antisymmetric contribution necessarily reverses under the swap.
For the full tensor, the symmetric contribution stays and the antisymmetric
contribution flips. The full same-direction reading is generally not zero.
This is an ordered pair of index/direction roles, not a claim that performing
two experiments in a different temporal order changes the material.

For example, hold `q = 3/4` and all other input components fixed, and compare
`b_z = +1/4` with `b_z = -1/4`. Both states have the same diagonal entries;
their `xy` and `yx` readings reverse. This is an algebraic fixture unless a
source-field/pressure-ledger construction is supplied.

The source-backed reusable contracts are already present:

- [same-vector cancellation and ordered probes](../bend/asymmetric-metric-tensor/lessons/05-probes.md#L45-L66);
- [the pressure-tagged stress map](../bend/asymmetric-metric-tensor/README.md#L120-L125);
- [shared-face balance](../bend/asymmetric-metric-tensor/lessons/09-flux.md#L16-L74);
- [bounded updates under supplied frozen forcing](../bend/asymmetric-metric-tensor/lessons/10-evolution.md#L24-L39).

Use the course's explicit flux convention: transport direction first,
momentum component second. `T_xy` and `T_yx` are not interchangeable. A
spatially uniform stress can have nonzero face readings with zero divergence;
nonzero local twist alone is not a license to animate net acceleration.
Actual rotation also needs an angular-momentum/microrotation balance.

## Current implementation terrain

### Bend is a plausible host, not a performance result

Read-only inspection of `~/Developer/refs/bend` (HEAD `6018e28` during
reconnaissance) found:

- recursive `Pix`/`Qua` images, `App.run`, keyboard and mouse input in
  `guide/GUIDE.md:408-433`;
- an interactive 2D renderer in `demos/app_triangle_2d/main.bend:48-92`;
- camera-controlled 3D ray marching, parallel image subdivision and a
  GPU-marked render call in `demos/app_ray_tracer_3d/main.bend:91-203,299-325`;
- native CPU, Metal/CUDA GPU and JavaScript backend documentation in
  `guide/GUIDE.md:496-508,585-595`;
- important limits in `README.md:226-244`: `F32`, no `F64`, no
  JavaScript graphics/audio, and platform/toolchain requirements for GPU use.

The pure parallel-sum demo ran successfully during reconnaissance. No
graphical app, GPU path or application-scale benchmark was run.

Spatial samples, pixels, independent probes and comparison experiments are
natural parallel work. Shared faces must have one consistent flux; reductions,
neighbor exchange, solver iterations and state updates introduce dependencies.
Timesteps remain causally ordered even when substantial work within each step
runs concurrently. Image quadtrees do not automatically define an adaptive
physical mesh.

The end-state performance experiment should compare the **same numerical
workload and output tolerances** across thread counts and any supported GPU
path. Measure solver, rendering, transfer and input-to-frame latency separately.
Do not use particle count, proof success or GPU branding as a speedup result.
The exact course can serve as a small-fixture oracle; its noncanonical rational
representation is not automatically the hot numerical grid representation.

### The physics is a separate dependency branch

A real coupled end goal needs state/constitutive closure, a pressure or energy
equation, density and velocity definitions, evolution of the Clebsch/rotational
sector, angular-momentum balance, boundary/initial data and an auditable
discretization. Charge/current, material response and force/torque mappings are
additional obligations if physical bodies are introduced.

The [course's open closure boundary](../bend/asymmetric-metric-tensor/README.md#L127-L131)
and [TauLab's implemented boundary](../taulab/README.md#L54-L73) remain in force.
The [OpenFOAM source route](../README.md#L134-L145) is an incomplete translation
hypothesis, not a ready-made solver to reskin.

Preserve focused-versus-Condensed differences in stress, effective density and
field decomposition; do not silently combine them into a new closure. Useful
current markers are the [field-course source gaps](../log/2026-09/2026-09-20-log.md#L365-L376).

## How to decide whether this is the right demo

Before building the full simulator, test a short storyboard or disposable
interaction sketch with members of the chosen audience. No participant data
has been collected yet.

The demo succeeds when a visitor can:

1. identify capacity, slip and twist without memorizing a matrix;
2. predict a new cross-pair reversal and name what stays fixed;
3. explain that a same-direction probe hides `A`, not that `A` is absent;
4. connect a selected face exchange to cell momentum gain without erasing
   existing motion or confusing a local field value with its divergence;
5. distinguish a prescribed comparison from a coupled simulation result.

The strongest counterargument is that the microscope will dominate and the
experience will still feel like a matrix lesson. Reject or redesign this
opening if visitors remember the colors but cannot transfer the prediction,
or if the simpler force theater produces better causal understanding for the
chosen audience. Excitement is useful evidence; “RCCM has been proven” is not
the desired takeaway.

## Planning gate after concept selection

First confirm the audience and the central visitor experience. Then work
backwards from these observable outcomes into independent requirements:
scene/interaction, source-and-state contracts, numerical dynamics, rendering,
runtime/performance and learning/verification evidence. Recursively split
until each leaf has inputs, an output, an acceptance test and explicit blockers.

The execution loop should pair implementation with independent falsification:
agree the contract, write a failing test or counterexample, implement, challenge
the result, answer with evidence, integrate a small checkpoint, then reconcile
the remaining gaps. Use the maximum useful concurrency among unblocked,
independently owned leaves; do not split one dependent step across agents just
to increase their count.

No executable task DAG or new `.ok` constitution is created before that
selection. Existing TauLab tasks and ideal-state files are unchanged.
