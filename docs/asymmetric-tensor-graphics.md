# Pressure & Twist — graphical end-goal proposal

**Status: end-goal brief; [Foam](../bend/foam-lab/README.md#L1) is the first playable slice.**
The audience is confirmed: **Tom, and only Tom**. The final scene and supported
dynamics of the full coupled toy remain open. This proposal extends the
[Bend tensor course](../bend/asymmetric-metric-tensor/README.md#L1), not a
replacement for [TauLab's scientific-engine destination](../.ok/taulab.ok.md#L19).

## The destination

**A beautiful, responsive fluid toy with a real laboratory underneath.**
Tom can enjoy manipulating an evolving field, then pause, cut it open and
question it when curiosity asks for an explanation. Play and inspection
show the same state: pressure capacity, transverse slip, internal twist,
face exchanges and the next state remain connected.[^scope]

[^scope]: RCCM supplies the proposed physical interpretation. Exact tensor
    identities, prescribed-field fixtures, numerical evolution under a declared
    closure, and independent physical validation are different evidence layers.
    The interface and saved experiments identify which layer is running.

The proposed target remains a native 3D room with a precise slice view, not
twenty lessons repainted as widgets. The microscope lives inside the toy;
it is not an entrance exam. A 2D slice may be a useful implementation slice
later; it does not define the ceiling of the end goal.

**Personal promise:** “I want to play with this again. As I do, I start to
anticipate its behavior. When I wonder why, I can open the exact thing I
was playing with and follow its rules into the tensor and the Bend code.”

### Tom's confirmed priorities

- **Immediate:** capture curiosity and excitement through his visual,
  aesthetic side. The toy must look and feel good to him, not merely score
  well as an educational exhibit.
- **Long term:** deeply master RCCM, fluid dynamics in general, and massively
  parallel programming in Bend. Intuitions gained through play must remain
  useful when the equations and implementation are opened.
- **Hard constraint:** the toy must be real in a meaningful, inspectable way.
  It must not imply behavior that violates its stated RCCM theory/regime.

No broad audience, specialist jury or generic engagement score substitutes
for Tom's experience. These are stated preferences, not evidence that any
mathematical prerequisite has been mastered.

### The play contract

The default view is an inviting field and a few discoverable controls, not
matrices, dashboards, a benchmark report or a compulsory prediction quiz.
Responsive manipulation, coherent motion, readable depth, attractive light
and color, and easy reset/replay are first-class requirements. The numerical
model and interaction constraints must be chosen together so responsiveness
does not depend on falsifying the response.

The desired loop is **touch -> response -> curiosity -> another variation**.
Inspection is an optional deepening of play: pause, reveal a slice or face
ledger, ask why, then return to the same evolving state. Teaching prompts and
the ordered-probe experiment are available on demand, not prerequisites to
having fun. Benchmarks and parallelism controls sit behind this first layer.

### What “real” requires

1. **A traceable causal rule.** Every physical-looking response has a chain
   from a stated source equation and regime through state, numerical update
   and observable to the rendered mark. A reference fluid solver with RCCM
   labels pasted on top does not meet this requirement.
2. **A complete rule for the chosen pocket.** A bounded, explicitly restricted
   sector can be real without simulating all of RCCM. Its evolution, initial
   conditions, boundaries and permitted interventions must nevertheless be
   specified. A source gap or contradiction is a blocker to that behavior,
   not permission to improvise an attractive closure and call it derived.
3. **Physically meaningful controls.** Gestures correspond to declared
   sources, initial conditions or boundary operations. In the evolving mode,
   `q`, `e` and `b` are derived consistently from the chosen state and ledger,
   not freely edited as unrelated effects. A hand injecting momentum is an
   external intervention with a budget, not spontaneous motion.
4. **Honest limits and evidence.** Enforce the supported domain, preserve
   existing motion, expose conservation/error checks, and test numerical
   refinement and replay. Do not hide an invalid state behind a pressure floor,
   damping trick or cosmetic smoothing. Declaring an approximation alone
   does not establish its compatibility with the selected source regime.
5. **Aesthetic freedom without counterfeit physics.** Color, lighting, camera
   easing and display trails can improve readability and pleasure. Their
   legends must not invent forces, propagating disturbances, material
   properties or coupling absent from the state. Display trails are not
   persistent physical material; camera smoothing is not fluid damping.

A prescribed-field or exact algebraic mode remains a real instrument for
its limited question. It does **not** by itself fulfill the evolving-fluid
toy goal. Nor does a disclaimer rescue misleading default behavior. The
preferred tradeoff is a beautiful, honest pocket of the theory rather than
a larger spectacle that teaches false intuition.

## Why this scene rather than the alternatives?

These are design judgments to test with Tom, not measured audience scores.

| Candidate | Strongest feature | Main weakness | Decision |
|---|---|---|---|
| Paused-world force theater: bodies, gravity, charge and magnets | Immediately recognizable physical stakes and motion | Familiar trajectories can hide the tensor and require body/field bridges not yet supplied | Keep as an alternative if Tom finds objects more inviting than fields |
| Local tensor instrument bench | Clearest demonstration of signed pairs and ordered probes; closest to existing exact contracts | Can become the same incremental curriculum with glowing controls | Reuse as the microscope, not the whole destination |
| Playable continuum with a tensor microscope | Connects an inviting field, meaningful manipulation, local structure and evolution; gives parallel computation useful work | Most demanding integration; spectacle can obscure causes | **Recommended**, with controlled reversal as an optional discovery |

Both halves matter: “I want to keep playing” and “playing gives me a better
feel for what this field does.” One discovery available beneath the surface:

> Two states can look identical through a pressure map and still differ in a
> directional reading. Open the field and discover what that first view hid.

## Open-ended play, with an optional 90-second discovery

This is an end-state storyboard, not a claim that a complete coupled solver
already exists. The current slice is a driven pressure-ledger instrument.
Candidate gestures such as pressing, sweeping or twisting must pass the causal
rule and intervention gates above before becoming controls. Their appealing
names do not establish the source equations needed to implement them.

The following guided route is optional. Its authored sign-reversal comparison
is an explicitly separate inspection fixture, not an arbitrary state edit
silently inserted into the evolving playground.

1. **Enter the world.** A bounded transparent volume contains a pressure-capacity
   landscape, sparse flow markers and a highlighted sampling patch. A labelled
   macro-load contour overlay can be separated from the total-capacity map.
   Start with few visual channels. Any apparatus, forcing and boundary exchange
   are visible; a sampling cube is not a solid wall or an unexplained pinned body.
2. **Pause and fork the view.** Compare two authored field snapshots with the
   same `q` and opposite selected twist in a marked region. Before opening any
   local inspector, predict where the whole-volume directional marks reverse
   and where they stay unchanged. Reveal that difference map beside the
   unchanged capacity landscape. State exactly what the intervention holds
   fixed. This comparison does not promise that
   arbitrary sign edits preserve a coupled PDE solution or its later pressure.
3. **Cut open the patch.** Show the signed transverse momentum-flux arrows on
   selected faces. They reverse while the diagonal readings stay fixed. The
   sideways exchange becomes visible to Tom, not merely a changed number.
4. **Ask the hidden question.** A same-direction probe cannot distinguish
   the two snapshots' sign-reversed antisymmetric parts. Give the probe a
   second, different direction; the selected cross-reading reveals the
   difference. The matrix appears here as a compact record of something
   already visible.
5. **Reveal the other channel.** Switch between a spatial pair, such as `xy`,
   and a time-space pair, such as `tx`. This distinguishes the twist channel
   from the transverse-slip channel rather than calling every curl “magnetism.”
6. **Unpause with a ledger.** Under an explicitly selected dynamics mode, show
   exchanges accumulating over multiple steps across spatially separated
   regions. Tom should be able to follow a declared boundary impulse
   into the changing momentum map, not just watch one cube's arrows update.
   The exact frozen-face fixture can explain the local exchange, but is not
   the whole-volume dynamics gate. Coupled evolution must carry its own
   closure, boundary and numerical evidence.
7. **Return to free play.** Invite Tom to predict a different
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
Its world-scale mark is a distinct `Delta P_macro/P_c` contour overlay, tied
to the same compartment in each local budget. The overlay states which
macro-load source is supplied; it does not hide local loading inside a
generic “gravity” color.
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
interaction sketch with Tom. An appearance-only sketch can test taste and
interaction appeal but must not be presented as dynamics evidence.

**The first gate is desire to play, not a quiz.** Does Tom like looking at it,
reach for another variation without being assigned one, and want to return?
Ask him directly; do not infer enjoyment or understanding from dwell time
alone. A scientifically tidy instrument he does not want to touch misses
the immediate goal.

**The second gate is trustworthy intuition.** After exploration, use small,
optional prediction-and-return probes. The complete destination should help
Tom:

1. distinguish the world-scale macro-load overlay from total remaining
   capacity, then predict the changed and unchanged regions of a prescribed
   twist-reversal map before opening the microscope;
2. follow a declared boundary intervention through a multi-step momentum
   redistribution across separated regions, with the boundary ledger visible;
3. identify capacity, slip and twist without memorizing a matrix;
4. predict a new cross-pair reversal and name what stays fixed;
5. explain that a same-direction probe hides `A`, not that `A` is absent;
6. connect a selected face exchange to cell momentum gain without erasing
   existing motion or confusing a local field value with its divergence;
7. distinguish a prescribed comparison from a coupled simulation result.

The first two are mandatory world-level gates for the complete destination.
A local probe bench, even inside attractive 3D scenery, cannot satisfy them.
The second remains blocked on the declared dynamics and numerical evidence;
a storyboard can test its legibility but cannot certify its implementation.

The strongest counterargument is that the microscope will dominate and the
experience will still feel like a matrix lesson. Reject or redesign this
opening if Tom feels assigned homework rather than invited to play, if the
visual legend builds wrong intuitions, or if the simpler force theater gives
him a better combination of delight and causal understanding. Excitement
without trustworthy intuition and correctness without appeal both miss the
brief. “RCCM has been proven” is not the desired takeaway.

## Planning gate after concept selection

The audience and priority order are confirmed. Next choose the concrete
playable scene together with a source-supported dynamical sector and one
meaningful gesture. Then work backwards from these observable outcomes into
independent requirements: scene/interaction, source-and-state contracts,
numerical dynamics, rendering, runtime/performance and learning/verification
evidence. Recursively split until each leaf has inputs, an output, an
acceptance test and explicit blockers. Do not reopen the audience question
or silently treat audience confirmation as approval of every proposed feature.

The execution loop should pair implementation with independent falsification:
agree the contract, write a failing test or counterexample, implement, challenge
the result, answer with evidence, integrate a small checkpoint, then reconcile
the remaining gaps. Use the maximum useful concurrency among unblocked,
independently owned leaves; do not split one dependent step across agents just
to increase their count.

No executable task DAG or new `.ok` constitution is created before that
selection. Existing TauLab tasks and ideal-state files are unchanged.
