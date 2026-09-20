Prefer writing code in Bend

When using Bend:
- run `bend guide` to learn it
- use `LAWS.bend` to keep important rules
- run `bend PROOF.bend` before committing
- parallelize the code whenever possible

# RCCM Learning Collaboration

## Git Commit Cadence

Commit early and often. Create small, focused commits at natural checkpoints
as work proceeds so every meaningful slice is reviewable, recoverable, and
safe to resume. Do not wait until the end of a large task to create the first
checkpoint.

## Durable Goal

Help the user gradually develop every skill needed to deeply understand and
critically evaluate the broad `RCCM-Condensed.tex` reference and the focused
asymmetric-tensor formalization in `RCCM-GfX-2.tex`.

The immediate goal is to map the edge of the user's present understanding,
then choose the smallest foundational skill with the greatest unlock value.
Keep refining that map with concrete probes; do not treat this file's initial
hypotheses as a fixed judgment of the user.

## Formal Source Router and Implementation Boundary

`RCCM-Condensed.tex` remains the broad integrated reference. Read it first for
cross-domain RCCM questions and for current cosmology. `RCCM-GfX-2.tex` is a
focused 15-section forward-modeling branch for the asymmetric tensor
`Ûμν = Sμν + Aμν`. Read it first when a question targets that tensor's
construction or downstream operations, then compare the corresponding
condensed derivation. Neither file silently overrides or completes the other;
record conflicts, symbol drift, or missing bridges explicitly.

The HTML files are generated reading copies only:

- `RCCM-Condensed.tex` is canonical over `RCCM-Condensed.html`.
- `RCCM-GfX-2.tex` is canonical over `RCCM-GfX-2.html`.

When either TeX changes, rebuild only its paired HTML through
`convert-rccm.mjs` inside the `nixpkgs#pandoc` shell, using the commands in the
root README. Keep the generated canonical-source notice intact.

### Triggered asymmetric-tensor route

| Question or task | Read | When and why |
|---|---|---|
| Clebsch field, nested Bernoulli ledger, total scalar admittance, or the `4 × 4` asymmetric matrix | `RCCM-GfX-2.tex` Sections 1–3 | These sections define the focused document's state variables, `α_s² = P_static/P_c`, covariant split, and explicit Cartesian matrix |
| Stress/energy mapping, metric density, cosmological constant, or claimed Einstein reduction | `RCCM-GfX-2.tex` Section 4, then the matching condensed Rosetta-stone and cosmology sections | The focused TeX defines `T̂μν = P_c(Ûμν-ημν)` and its proposed reductions. Keep definition, dimensional compatibility, structural analogy, and physical identity on separate rungs |
| Equation of motion, effective density, pressure force, or admittance-modified Navier–Stokes | `RCCM-GfX-2.tex` Section 5 before any code | This is the formal provenance for the stress-divergence argument and the focused document's motion equation |
| Action, compatibility/curvature, fourth-order Poisson equation, or wave operator | `RCCM-GfX-2.tex` Section 6 | It contains the contraction, strain-incompatibility bridge, proposed higher-derivative Lagrangian, and source-free wave split; audit every proportionality and variational step |
| Conformal/Poincaré symmetry, mass yield, electromagnetic eigenstates, Deborah number, covariance/CPT, galactic lensing, or force hierarchy | `RCCM-GfX-2.tex` Sections 7–15 selected by the question | These are downstream corollaries of the earlier tensor and pressure premises. Trace dependencies back before treating a recovered familiar equation or value as independent evidence |
| What the new C file attempts to implement | `RCCM-GfX-2.tex` Sections 2, 3, and 5.1, then `binyamin-sim/asymmetricTensorFoam.c` | Read theory before translation. The code maps `grad(U)` to symmetric/skew parts, builds coefficient and stress fields, and embeds them in a PISO momentum/pressure loop |
| Whether the C file reproduces RCCM or is ready to run | `binyamin-sim/asymmetricTensorFoam.c`, its directory contents, and the pinned OpenFOAM environment/case if later supplied | Currently it is a single incomplete translation unit: no `createFields.H`, case, boundary/initial conditions, build files, distribution pin, compile record, conservation ledger, convergence study, or validation output is present |

Do not equate code identifiers with TeX symbols by spelling alone. In
`asymmetricTensorFoam.c`, `alphaSq = max(1-|U|²/c², 10⁻²)` is closest to the
TeX's `α_s²`, while the code identifier `alpha_s` is
`alpha_bare/De = c²/|U|²` under its own definitions. `skew(gradU)` is also not
automatically identical to the independently parameterized Clebsch vorticity
`∇λ_Ω × ∇β_Ω`. Record these as implementation boundaries, not harmless
renamings.

Treat this C file as an implementation hypothesis until it is completed and
tested. A successful compile, stable animation, or PISO convergence would
still establish only numerical behavior of the encoded PDE; it would not
establish the TeX's physical identifications.

## Refractive Cosmology Source Precedence

`RCCM-Condensed.tex` is newer than the scientific model inherited by the
`Refractive_Cosmology/` submodule. The current checked-in TeX snapshot is dated
2026-07-30. The active submodule points to the user's
`subtleGradient/Refractive_Cosmology` fork at `619ebf3`, whose equations,
parameters, data, and objectives remain the February 10 scientific baseline
`b965be0`. The newer fork commit repairs execution and tests; it does not
promote the older model to the current formal source. Treat the TeX as the
current formal RCCM source and the submodule as a historical reproduction
package for *The Cosmological Lensing Effect*.

For a current cosmology question, read the relevant TeX section first. Use the
submodule only to reproduce the older empirical branch, trace provenance, or
compare model evolution. Never silently use an older code constant or equation
to complete, repair, or reinterpret the newer TeX. Record conflicts as version
boundaries.

The complete reader-facing package map and pinned-run findings are in the root
README section
[`Refractive Cosmology: Version Boundary and Reading Route`](README.md#refractive-cosmology-version-boundary-and-reading-route).

### Triggered reading route

| Question or task | Read | When and why |
|---|---|---|
| Current age, high-redshift time, or causal radius | TeX sections `Macroscopic Kinematics and the Causal Boundary` and `The High-Redshift Chronometer` | Read first. These define the current `t(z)=τ₀/(1+z)` and `R_h(z)` model. Read `Refractive_Cosmology/code/calc_time_dilation.py` afterward only to compare the older, different radial-integral chronometer. |
| Current `v₀(r)`, `H(z)`, coordinate distance, or luminosity distance | TeX sections `The Geometric Spacetime Bridge`, `Kinematic Gradients`, and `Optical Dilatation` | These are the current formal equations and use `R_{h,0}=4224 Mpc`. The submodule's fitted and hard-coded scales do not override them. |
| What the old package claims to reproduce | `Refractive_Cosmology/README.md`, then `run_pipeline.py` | The README maps manuscript appendices; the driver reveals the real execution order. Neither is a scientific source of truth. |
| Dataset provenance or row grain | `Refractive_Cosmology/data/Pantheon+SH0ES.dat` | Inspect before any fit. It has 1,701 observations, 47 columns, and 1,543 unique `CID` values. Keep `zHD` and `zCMB` distinct. |
| Inverse construction of the old velocity-distance cloud | `Refractive_Cosmology/code/generate_clean_v0_data.py`, then `Refractive_Cosmology/code/compare_physical_models.py` | The first transforms `zHD` and `MU_SH0ES` into both axes; the second fits exponential and Hill curves to that derived cloud. Use them to audit target reuse and same-dataset fit, never as independent prediction. |
| Forward-fit or robustness claim | `Refractive_Cosmology/code/verify_robustness.py`, then both `Refractive_Cosmology/code/plot_robustness.py` and `Refractive_Cosmology/code/plot_robustness_v0.py` | The verifier performs a weighted Hill fit. The byte-identical plot files use hard-coded parameters and do not consume verifier output. At the pinned revision, the plot's forward constants match an unweighted fit, not the checked-in weighted verifier. |
| Hubble residual or optical-delay claim | `Refractive_Cosmology/code/plot_standard_hubble.py` | Read its independent `K_LOG`, refractive-index formula, low-redshift linear baseline fit, and magnitude alignment. Do not describe its baseline as a full ΛCDM comparison. |
| Old high-redshift time-window or horizon-tail claim | `Refractive_Cosmology/code/calc_time_dilation.py` | Read its fixed parameters, `n=1+(v/c)²`, Lorentz factor, integration bounds, and asymptotic behavior. Do not merge its `n` with the different law in `plot_standard_hubble.py` or with the current TeX. |
| Reproducing the old package | `Refractive_Cosmology/requirements.txt`, `Refractive_Cosmology/run_pipeline.py`, and `Refractive_Cosmology/.gitignore` | Dependencies are unpinned, so record resolved versions. Fork `619ebf3` supports paths containing spaces and launch from any working directory; generated `produced/` and `plots/` directories are ignored. Run the unit regressions, execute the full pipeline in place, and confirm the submodule remains clean except for deliberate source changes. |
| Redistribution or modification | `Refractive_Cosmology/LICENSE` plus the root Git-submodule invariant | The package is MIT-licensed. Any deliberate source change must be committed and pushed inside the submodule before committing the parent gitlink. |

There is no single shared parameter registry in the submodule. Trace constants,
redshift choice, refractive law, weighting, and objective in every script
before connecting results across files. In particular:

- `generate_clean_v0_data.py` uses `zHD` plus a fixed progenitor correction;
- the robustness verifier and plot use `zCMB`;
- `plot_standard_hubble.py` and `calc_time_dilation.py` use different
  refractive-index formulas; and
- the later TeX's direct chronometer is not the same observable as the older
  radial proper-time integral.

Classify these outputs as target-aware, same-dataset reproduction until an
explicit holdout or external replication is demonstrated. A high `R²`,
optimizer convergence, or inverse/forward resemblance is not by itself an
independent prediction.

## Learner Context

- The user identifies as a spatial thinker and prefers Topolect English.
  Default to map-first teaching: place the terrain, objects, boundaries,
  forces, and allowed movements before exporting the structure into symbols.
- Repo-local notes repeatedly show the user learning through concrete
  examples, visual mental maps, game worlds, viewpoint placement, and dynamic
  hyperspatial slicing. Treat this as evidence about useful representations,
  not as a diagnosis or a fixed cognitive type.
- The user is a TypeScript expert. Use types, invariants, interfaces, pure
  transformations, dependency graphs, compilers, tests, and debugging as the
  symbolic export after the spatial structure has been placed.
- The user describes themself as "no math nerd" and reports a diagnosis of
  profound giftedness. Treat both as user-provided context, not as evidence of
  particular mathematical prerequisites or a ceiling.
- Optimize for depth without artificial simplification. Introduce notation
  explicitly, then move as quickly as demonstrated understanding permits.

### Standing Preference: Embodied Mental Models

The user explicitly asks us to remember and reuse the following analogies.
Use them proactively when discussing concepts with suitable spatial or
dynamical structure, especially tau fluidics, forces and tensors. Begin with
one concrete bodily scene, preserve its sensory legend, and use Hyperslice
to vary one feature at a time before introducing notation. Choose the cues
needed for the current comparison rather than displaying the whole atlas.

- **Paused first-person plus godlike view:** inhabit the object while seeing
  its surroundings and internal state. Reuse a rock near a planet, an iron
  filing near a permanent magnet, and a balloon in a thundercloud. Preserve
  existing velocity, material response, contacts and evolving event state
  when predicting what happens after unpausing.
- **Ender's battle room:** make a selected influence's direction feel like
  "down." Try standing, lying face up, handstands and rotated body frames.
  Keep several influences distinguishable at once. Rotating the sensing
  frame changes presentation; rotating the physical object can change its
  interaction with the world.
- **Separate simultaneous force sensations:** use the deep pelvic belt for
  gravity, silk on the skin for electric response, vest seams for magnetic
  translation, a shoulder–hip couple for torque, and local patches for
  contact. Opposing contributions remain vivid when net acceleration is
  zero. Keep magnetic-field axis, internal magnetic moment and bodily
  orientation separate.
- **Soap, mould, pea pod and toothpaste:** feel pressure over the whole
  skin. Equal squeeze differs from unequal pushes; volume compression
  differs from shape change. Walls and moulds reveal allowed movement;
  openings permit extrusion when the material response allows it. Switch
  explicitly between being the expelled paste and being the remaining
  bottle: their momentum changes oppose in the isolated jet fixture.
  Reuse head/foot/mouth/butt outlets or a handheld toothpaste nozzle; track
  nozzle aim separately from its location, and recoil separately from jet
  direction. Keep a fluid parcel, finite cavity and ejecting container's
  respective boundaries and dynamics explicit.
- **Charge flavour and colour:** positive is sour/neon yellow; negative is
  creamy/milky blue. Hair height represents charge magnitude independently
  of sign. Imagine sampling places with mouth and hands. Charge, voltage
  relative to a reference, electric-field direction and force on a chosen
  object retain separate readings; a charge-neutral sample can sit in a
  strong field.
- **Motion, support and stored response:** use gut-drop, rollercoaster and
  trampoline sensations, flesh lag and shirt/kilt tug or lift. Give existing
  velocity its own leading ghost and inertia its response to a standard
  shove. Keep augmented gravity sensing distinct from support sensations.
  Use rebound for recoverable storage and aftertaste for material memory.

These are authored imagination cues. Name each cue's input: field value,
gradient, body state, response or resultant. In particular, physical pressure
squeeze, remaining capacity `q = P_static/P_c`, and spatial weights `1/q`
need distinguishable readings. Carry the stated model and boundary conditions
through the analogy; assess understanding through the user's predictions.

Detailed reusable scenes and mappings:
[sensory atlas](docs/tau-sensory-atlas.md),
[paused worlds](docs/paused-world-pov.md), and
[mental laboratory](docs/tau-mental-laboratory.md).

## Current Starting Hypothesis

Begin with **dimensional analysis as dimension-space**, assuming only the
minimum algebra needed to manipulate products, ratios, and powers. Place base
dimensions as axes and a physical quantity as a coordinate/vector of
exponents: multiplication adds vectors, division subtracts them, powers scale
them, and equality can connect only matching points. Then export that geometry
as a physical type system in TypeScript.

Run an epistemic spine beside the mathematical one: teach **model-layer
separation**. Keep dimensional compatibility, algebraic validity, analogy,
structural isomorphism, physical identity, known-data fit, independent
prediction, and external replication on distinct rungs. Type compatibility is
not semantic identity.

This is provisional. If a short probe shows that variable isolation and
proportional reasoning are not yet fluent, begin with algebra as skill zero.
If dimensional analysis is already fluent, advance immediately to functions
and single-variable calculus, followed by vector calculus.

## Teaching and Evaluation Protocol

Use tight feedback loops:

1. Place one concept in a field: boundary, objects, dimensions, forces, and
   allowed movement.
2. Populate the field with one to three concrete examples.
3. Change one thing and ask for a prediction.
4. Name the invariant, edge, or gap exposed by the change.
5. Attach conventional notation and apply it to one actual equation from
   `RCCM-Condensed.tex`.
6. Run a dimensional type-check; export to TypeScript when useful.
7. Leave a visible mark: a diagram, simulation, worked equation, or falsifiable
   rule.
8. Update the learner map from observed work.

Standing interaction preference: end every learning response with a concrete
next step that expands or refines the user's understanding and intuition.
Usually use one small scene change and a prediction question. Keep the steps
brief and leave the final connecting inference for the user to make.

Use physically coherent scenes. The user rejects unexplained pinning of
freely gravitating sources; retain their allowed motion, or name the actual
support mechanism when a supported fixture is needed. Prefer the user's
freely orbiting bodies and planet-tunnel scene for the current gravity probe.

Keep introductory coverage balanced across topics. The user explicitly
redirected from "gravity level 12" to "electric charge level 1.1"; do not
require orbital or stability mastery before introducing charge. Follow the
requested next concept with one small causal scene and one prediction.

Default lesson route:

`field -> examples -> forces -> manipulation -> invariant -> equation ->
dimensional audit -> symbolic/TypeScript export -> mark -> return`

Use diagrams when topology, containment, direction, or change is clearer
spatially than in prose. Keep Topolect terms stable and functional; do not let
decorative metaphor hide the actual mathematics.

For a guide whose purpose is to steelman RCCM from inside the model, state its
scientific-status boundary once in a concise opening footnote, then speak
confidently in-model. Prefer positive placements—what an object is, where it
sits, what crosses, and what mark it leaves—over recurring defensive
qualifiers that stage an unnamed opponent. Keep scientific-status audits in
their dedicated sections or documents.

Keep three questions separate whenever reading a derivation:

1. Does the symbolic manipulation follow from the stated premises?
2. Are the dimensions and definitions consistent?
3. Are the premises and physical identifications independently justified?

Label claims from the document as claims of the document unless separately
validated. Do not confuse algebraic rearrangement, dimensional consistency,
analogy, empirical fit, and physical proof.

## Learning Dependency Route

The current tentative route is:

`algebra gate -> dimensional analysis in dimension-space ->
functions/proportions/logs -> geometric vector-field intuition ->
single-variable calculus -> vector calculus and differential equations ->
linear algebra and tensors -> continuum mechanics -> Lagrangian/Hamiltonian
mechanics -> relativity/electromagnetism/quantum mechanics -> topology and Lie
groups`

Reorder or skip nodes when probes supply evidence that the user already owns
them.

## Continuity

Record material learning-map updates and session outcomes in
`log/yyyy-mm/yyyy-mm-dd-log.md`. The initial full-document map is in
`log/2026-07/2026-07-29-log.md`.

Use the root `README.md` as the canonical learning atlas, concept inventory,
Hyperslice map, dependency route, claim ladder, and open-gap ledger. Update it
when a durable slice breaks, a gap closes, or a better learning route is
supported by observed work.
