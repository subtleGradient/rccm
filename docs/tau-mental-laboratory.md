# A mental laboratory for tau fluidics

Imagine a transparent three-dimensional volume. A few parcels have tracking dots. Tiny marked cubes reveal deformation. Arrows on their faces reveal pressure and shear. A cavity has a visible boundary; a travelling disturbance has a visible wavefront. All these marks occupy the same space, but each answers a different question.[^status]

[^status]: This is a set of learning experiments inside RCCM's proposed world, with conventional mechanical fixtures where stated. RCCM's physical identifications remain claims of its TeX sources. Its complete coupled evolution and cavity-transition rules are unfinished; the [OpenFOAM equation audit](openfoam-rccm/04-equation-contract-and-gaps.md) records those gaps. The scenes below distinguish a calculable fixture, an in-model identification, and an unresolved continuation. They are brainstorming designs, not simulations run here.

The goal is to acquire **a next-frame instinct**: after changing one thing, locate the first change in force, predict how velocity changes, and track the response back through the surrounding field. This does not require seeing every channel at once.

Use one stable set of visual marks:

| Mark | What it measures | What to feel or follow |
|---|---|---|
| Tagged parcel and a straight arrow | Material position and velocity | Ride the parcel; follow its existing motion |
| Tiny cube with three marked edges | Local change of volume, shape and orientation | Squeeze, skew and turn are separate movements |
| Arrows on the cube's faces | Normal pressure and tangential traction | Which side presses harder; which faces slide against each other |
| Labelled pressure contours | Pressure level and its spatial slope | Compare neighboring values before choosing a force direction |
| An outlined cavity | Region excluded from the surrounding fluid | Track the boundary separately from nearby parcels |
| A moving phase stripe | Position of a disturbance | Follow the pattern, then return to one tagged parcel |
| A capacity meter | A declared RCCM pressure budget | Track load and remaining capacity without inventing a material response |

The imaginary cubes and arrows are measuring instruments. They do not assert that tau consists of little cubes, beads, rods or springs. There is no privileged downward direction until a source or boundary establishes one.

**1. Pressure gloves: build the feeling of gravity from unequal contact.**

Place a tiny, initially stationary parcel between your imaginary palms. Extend those palms into a complete enclosure: the surrounding medium presses on every face. Equal pressure everywhere gives equal and opposite contributions. You can feel intense squeeze while the center has no pressure-driven acceleration.

Now make the left side press harder than the right. The initial acceleration points right. Rotate that imbalance around the parcel: the acceleration follows it. Keep the pressure at the center unchanged while reversing its slope: the acceleration reverses even though the center retains the same colour.

For the prescribed pressure-only reduction, the symbolic export is

\[
\mathbf a=-\frac{1}{\rho_\tau}\nabla P.
\]

The gradient points toward increasing pressure; acceleration points the other way. The surrounding pressure **pushes toward the lower-pressure side**. A finite deformable cavity also needs its own boundary and inertia rules; do not silently give it the same parcel equation.

**Change:** give the parcel an initial rightward velocity while acceleration points left. Its first movement can still be rightward. It slows, and only later may turn. Flattening the pressure field removes this pressure acceleration; it does not erase velocity.

**Mark:** keep three arrows separate: velocity now, acceleration now, velocity next. A uniform pressure increase can still compress a compliant cavity if its interior pressure and support stay fixed, even when translational force cancels.

Source: [Condensed pressure-gradient scene](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-Condensed.tex:1175>); [painted-field toy](../rccm-data.md#t2-painted-field-gradient-probe). These are prescribed instantaneous fields. Holding the background at rest despite a pressure slope requires a balancing force; otherwise the background may accelerate too.

**2. A cube you can squeeze, skew and turn: feel what a tensor needs to record.**

Enlarge one tiny material cube until you can stand beside it. First carry it bodily to the right. Then stretch it east–west while compressing it north–south. Then turn the entire cube without changing any edge or angle. Finally slide its upper face sideways relative to its lower face.

The four observations are translation, pure strain, rigid rotation, and simple shear. Simple shear contains both shape change and local rotation. One spiral glyph cannot tell them apart.

Use these explicit velocity fixtures, with rates \(s,\Omega\) in inverse seconds:

| Fixture | Velocity field | Shape change? | Local rigid rotation? |
|---|---|---|---|
| Uniform translation | \((U,0,0)\) | No | No |
| Pure strain | \((sx,-sy,0)\) | Yes | No |
| Rigid rotation | \((-\Omega y,\Omega x,0)\) | No | Yes |
| Simple shear | \((sy,0,0)\) | Yes | Yes |

**Change:** reverse \(\Omega\). The cube turns the other way; its speed squared at a fixed distance from the axis stays unchanged. Separately reverse the simple shear and watch both parts reverse.

**Mark:** one local instrument for volume, one for shape, one for rotation. Then attach conventional names: divergence, deviatoric symmetric strain rate (the shape-changing part), and antisymmetric rotation rate. A response law is still needed to translate those motions into stresses.

This is a kinematic teaching fixture. Compare the proposed RCCM channels in [GfX Section 1](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-GfX-2.tex:31>) and the [existing tensor map](../README.md#tensor-symmetry--trace), without identifying all their similarly named fields.

**3. A whirlpool with no drain: feel continuous turning.**

Stand beside a circular orbit in an ideal, steady swirling flow. Follow a tagged parcel. Its velocity points along the circle. Its acceleration points inward. Pressure is greater on the outside of its orbit than on the inside, supplying that inward turn.

In this controlled axisymmetric fixture,

\[
\frac{dP}{dr}=\rho\frac{v_\theta^2}{r}.
\]

The arrow field can remain unchanged at every fixed location while every travelling parcel continuously accelerates. **A steady field can contain accelerating material.** From the laboratory viewpoint, do not add an extra outward force to this same parcel after already accounting for its curved motion. A rotating observer can use a centrifugal term, but that is a different frame's accounting.

Now put a tiny freely turning local rotation probe in the flow and draw a much larger loop around the core. These measure different things. An ideal potential vortex has local curl zero outside its core while a loop enclosing that core has nonzero circulation. Curved parcel paths alone do not establish local rotation. [MIT's vorticity and strain explanation](https://ocw.mit.edu/courses/16-01-unified-engineering-i-ii-iii-iv-fall-2005-spring-2006/a7293462acaca70f82f1ef3e9a1ac36a_f11_mud.pdf)

**Change:** externally contract a circular loop while holding circulation \(\Gamma=2\pi r v_\theta\) fixed. Halving its radius doubles speed, quadruples kinetic energy per unit mass, and increases the required inward acceleration eightfold. The contraction requires work or energy transfer; it is not free acceleration.

**Mark:** distinguish motion around a loop from material passing through a closed enclosing surface. Neither requires a bottomless drain. The RCCM circulation route starts at [Condensed 2587](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-Condensed.tex:2587>).

**4. A cavity with a surrounding moving mass: feel inertia outside the hole.**

Prescribe a spherical empty cavity in an unbounded ideal fluid. Accelerate it to the right. Fluid ahead must move aside and the surrounding velocity field must change. Your shove puts kinetic energy into fluid outside the cavity.

The spherical added-mass fixture gives \(m_{added}=\rho V/2\). Doubling the prescribed cavity volume at fixed density doubles added mass; the same external force gives half the acceleration. Changing the shape or nearby boundaries changes the added-mass problem. [MIT's sphere derivation](https://ocw.mit.edu/courses/2-016-hydrodynamics-13-012-fall-2005/resources/add_mass_sphere/)

**Change:** stop the shove. Added mass by itself does not supply a braking force during constant motion. Keep inertia and dissipative drag on separate controls.

RCCM adopts this external-inertia picture in [Condensed 2031](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-Condensed.tex:2031>). The useful image is an empty interior whose motion recruits a surrounding flow field. Do not turn its distributed kinetic energy into a literal rigid coating, or identify cavity volume with every other particle radius in the TeX.

**Mark:** distinguish equal applied force from equal gravitational environment. In the latter, a chosen equivalence-principle model scales gravitational force with inertia; the same-force comparison above makes no statement that heavier objects fall slower.

**5. A pressure basin and two nearby travellers: feel fall, coasting and tides.**

Prescribe a spherical pressure basin. Farther out the pressure is higher; nearer the source it is lower. Release a test body using the source's stated weak-gravity law. Ambient traction gives an inward acceleration. Give the body sideways velocity and watch that same inward acceleration bend its route.

Nothing needs to swallow the surrounding fluid for a maintained pressure terrain to exist. The current reading route is circulation → deficit → external pressure/compliance terrain. The [root gravity map](../README.md#gravity-topology-what-sink-means-inside-rccm) preserves the distinction from earlier intake-and-exhaust narratives.

**Change:** in the prescribed exterior branch with pressure deficit proportional to \(1/r\), double the distance. The acceleration falls to one quarter. Put two travellers at slightly different distances: their unequal accelerations stretch their separation along the radial direction. Now place two equal sources left and right. At the exact midpoint their force contributions cancel while the pressure deficit remains.

For two attractive inverse-square sources, nudge a resting midpoint probe toward either source: it continues toward the nearer one. Nudge it perpendicular to their connecting line: the acceleration points back toward that line. This is a saddle, not a stable nest.

**Mark:** pressure level, slope, and variation of slope answer different questions: local state, acceleration, and differential acceleration/stability. Cancellation at a point does not establish a whole zero-force plane. Source: [GfX weak gravity](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-GfX-2.tex:387>); [Condensed scalar versus gradient](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-Condensed.tex:1170>).

**6. The pressure-capacity meter: feel how much response margin remains.**

Place a fixed-height meter beside a point. For the simple Condensed scalar fixture, movement occupies part of its pressure capacity and the remainder is \(q=P_{static}/P_c\):

\[
q=1-P_{dyn}/P_c,\qquad \alpha_s=\sqrt q.
\]

Raise the specified load from zero to three quarters of capacity. The remaining fraction becomes one quarter; admittance becomes one half. In this section's scalar effective-density relation, \(\rho_{eff}/\rho_\tau=1/\sqrt q\), so the factor becomes two.

**Change:** reverse the velocity while retaining its magnitude. A kinetic load built from speed squared stays unchanged. Change the spatial distribution of load while holding its value at the probe fixed: the local pressure slope can change.

**Mark:** the meter records a state relation. It does not itself tell you viscosity, relaxation time, cavity growth rate or the force on a particular body. At zero remaining capacity the displayed smooth response reaches its limit; a post-limit movie needs another rule.

Sources: [Condensed phase stiffening](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-Condensed.tex:1801>). The [GfX nested ledger](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-GfX-2.tex:49>) is a separately labelled experiment with background, local kinetic and shear loads. Equal total \(q\) can hide different load splits; see [what the matrix leaves undetermined](../rccm-data.md#what-the-matrix-leaves-undetermined).

**7. A boundary under opposing radial loads: feel cavitation and stability.**

Cut a cavity through its center and stand beside the cut. Draw the full boundary, then mark the radial loads: exterior normal pressure, interior pressure if present, any prescribed interface tension or elastic traction, and the surrounding flow response. In a classical bubble fixture, surface tension tends to contract the cavity. RCCM's cavity is a different proposed boundary; its support law must be specified rather than borrowed silently from a soap bubble.

**Change:** lower the imposed exterior pressure while holding the other loads and initial state fixed. Its inward contribution becomes smaller, so the initial net radial tendency shifts outward. That does not guarantee expansion if other inward contributions still dominate. Reverse the change and the tendency shifts inward.

Now find an instant where the radial forces cancel. Nudge the radius slightly larger and smaller. A stable radius requires restoring responses on both sides. Force cancellation alone is one frame; stability is a response to perturbation.

**Mark:** four different events need different descriptions: an existing cavity deforms; a new cavity nucleates; a vortex reconnects; a cavity disappears. A speed or pressure threshold locates an edge, but does not supply those event laws. The missing continuation is itemized in the [equation contract](openfoam-rccm/04-equation-contract-and-gaps.md) and [implementation roadmap](openfoam-rccm/06-implementation-roadmap.md).

**8. A sideways pulse and a travelling front: feel light and its two transverse directions.**

Place tagged parcels along a corridor. A small transverse pulse passes rightward. At first order, each tag moves sideways and returns while the pulse advances. Track one parcel, then track the pulse. They trace different routes.

Introduce a prescribed region of slower coordinate propagation below the pulse. The lower part of its wavefront advances less. The front turns, bending the ray toward the slower region. Make the propagation speed uniformly lower throughout the corridor: transit takes longer, but the uniform interior adds no bending. At an interface, entry geometry can still cause refraction.

For the electromagnetic view, attach two perpendicular field arrows to each station and an energy-flow arrow perpendicular to both, using a declared wave convention. These are field measurements; do not automatically read both as parcel velocities. RCCM supplies its intended acoustic/EM bridge in [Condensed 3135](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-Condensed.tex:3135>) and its pressure-lens picture at [1306](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-Condensed.tex:1306>).

**Change:** combine two equal transverse displacement components. In phase they trace a line at a fixed station. A quarter-cycle phase offset makes a circle. Reverse that offset and its handedness reverses. Distinguish this temporal rotation from a parcel orbiting a cavity.

**Mark:** particle motion, phase-front motion, energy transport and local clock readings need their own arrows. The [polarization playground](../rccm-data.md#t3-polarization-playground) is a useful early experiment before full particle interactions.

**9. Two held vortices: feel interaction without confusing it with self-energy.**

Hold two candidate cavity structures fixed. Enlarge the gap and draw both local velocity vectors at the same point. In a declared superposed velocity fixture, the kinetic quantity contains

\[
\tfrac12\rho|\mathbf v_1+\mathbf v_2|^2
=\tfrac12\rho v_1^2+\tfrac12\rho v_2^2
+\rho\,\mathbf v_1\cdot\mathbf v_2.
\]

Reverse one field. Its own squared contribution stays fixed; the interaction term changes sign. Reverse both and the interaction term returns to its original value. RCCM uses this distinction in its [charge/Bernoulli construction](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-Condensed.tex:3538>): in its chosen geometry, alignment in the gap lowers static pressure and opposing arrows raise it.

**Change:** release the structures only after specifying their boundary dynamics and the stresses over their whole surfaces. Gap colour alone does not determine that motion. A directly calculable counterexample is an ordinary ideal two-dimensional point-vortex pair: equal-sign vortices orbit one another, while an equal-and-opposite pair translates together. “Opposite whirlpools attract” is therefore not a transferable fluid law.

**Mark:** signed orientation and unsigned magnitude are independent controls. Also distinguish turning a structure in space from changing its winding class. A clockwise glyph viewed from the other side appears anticlockwise; a particle's charge cannot change merely because the observer walked around it.

For magnetism, a useful later probe is a prescribed dipole in a field: first change its orientation and observe torque; then introduce a spatial field gradient and inspect translation. Supply the dipole coupling law explicitly. The [magnets guide](../rccm-magnets.md) places that bridge.

**10. A steering corridor: feel electric push and magnetic turning.**

Use a calibrated conventional force fixture as a target for the tau explanation. A positively charged probe enters from the left, moving right. A uniform magnetic field points into the page. Its magnetic force points up. As the probe turns, the magnetic force turns with it, always perpendicular to its instantaneous velocity. It bends the route without changing speed in this magnetic-only fixture with radiation and other forces neglected. [MIT's magnetic-field chapter](https://ocw.mit.edu/courses/res-6-002-electromagnetic-field-theory-a-problem-solving-approach-spring-2008/c3032bc0c615f6d752a650c45c63fed1_MITRES_6_002S08_chapter5.pdf)

**Change:** reverse the charge, the initial velocity, or the magnetic field one at a time. Each reversal flips the initial magnetic force. Double the initial speed while keeping field and charge fixed: the force magnitude doubles, although the faster probe follows a larger-radius circle at fixed nonrelativistic mass. With no initial velocity, this magnetic term gives no force.

Now use a uniform electric field pointing right, with the magnetic field off. It pushes a positive probe right even when the probe starts at rest. It can change speed and transfer energy. Turn both fields on and add the force vectors before advancing the velocity:

\[
\mathbf F=q_e(\mathbf E+\mathbf v\times\mathbf B).
\]

Here \(q_e\) is electric charge, distinct from pressure fraction \(q\). **Mark:** pressure-like translation and orientation-dependent transverse coupling are different sensations. This fixture supplies a known response to reproduce; drawing tau vortices does not yet derive it. The [equation contract](openfoam-rccm/04-equation-contract-and-gaps.md) identifies the field-to-material and unit-mapping bridges required to connect the microscopic picture to a measured probe.

**11. A material with memory: feel why tempo changes the response.**

Imagine a region coupled to its neighbors through a response that can relax. Impose the same small shear deformation twice, once quickly and once slowly. In a single-relaxation Maxwell fixture, a fast deformation initially stores elastic stress; a slow one gives the relaxing part more time to move. If you impose a deformation and hold it, stress decays with the fixture's relaxation time. [MIT's viscoelasticity lecture](https://www.ocw.mit.edu/courses/3-071-amorphous-materials-fall-2015/e38e7e85eaa4b138badbf01f673f8435_MIT3_071F15_Lecture7.pdf)

The spring-and-dashpot image describes the response law; it does not add literal hardware to the medium. RCCM uses the comparison \(De=\omega t_r\), where \(\omega\) is forcing angular frequency and \(t_r\) is a relaxation time, in [Condensed 1627](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-Condensed.tex:1627>).

**Change:** keep amplitude fixed while increasing frequency. Then make two copies with identical visible shape but different stored stress. Their next responses can differ. Shape is not always complete state.

**Mark:** stiffness, inertia, damping, yield and memory require separate knobs. This scene is a useful bridge toward the proposed strong-interaction/relaxation territory. Actual decay products, lifetimes and stable particle identities require the missing defect dynamics.

**The Hyperslice board**

Our hyperblob is everything a picture of “tau fluidics” might be smuggling together. These razors retain distinctions that survive counterexamples; they are working probes rather than a final taxonomy.

| Razor | Half A | Half B | Target placement and attack |
|---|---|---|---|
| Transport test | Material crosses the selected surface | No material crosses it | A travelling wave can still occupy B; tag a parcel separately |
| Net traction | Balanced | Unbalanced | A cavity can be strongly squeezed in A |
| Local slope | Zero | Nonzero | A deep pressure deficit can occupy either half |
| Material acceleration | Zero | Nonzero | A steady vortex belongs in B despite an unchanging arrow field |
| Shape | Preserved | Changing | Rigid rotation preserves shape; simple shear changes it |
| Local rotation | Zero | Nonzero | A curved path can occupy the zero-curl exterior of a vortex |
| Loop circulation | Zero | Nonzero | This does not determine net flux through a closed surface |
| Cavity | Absent | Present | A smooth vortex can have no cavity; a prescribed cavity can have no vortex |
| Perturbation response | Returns locally | Does not return locally | Instantaneous force balance alone cannot assign the target |
| Reversal | Readout unchanged | Readout changes | Self speed-squared is unchanged; signed circulation reverses |
| Relaxation clock | Forcing slower than relaxation | Forcing faster than relaxation | The same material can cross this boundary when tempo changes |
| State completeness | Enough to advance this chosen model | Not enough | Equal visible fields can conceal different stored stresses |

Some tempting binary cuts broke: gravity versus EM is not equivalent to curl-free versus curl-carrying; fluid versus solid needs a forcing timescale; clockwise versus anticlockwise needs a viewpoint and does not by itself encode charge. Finding such a failure calls for another axis, not a more persuasive drawing.

Cross two robust cuts:

| | No cavity | Cavity |
|---|---|---|
| **No circulation** | Resting, translating, or another zero-circulation fixture | Supported/prescribed cavity; persistence needs a boundary law |
| **Circulation** | Smooth vortex without cavitation | Circulating cavity, the candidate RCCM defect picture |

Every cell has a useful role. A cavity-free vortex isolates circulation; a circulation-free cavity isolates boundary mechanics. Neither is a failed version of the final particle picture. The full target occupies the lower-right only after its support and evolution are supplied.

An additional crossed experiment is **orientation cancellation versus stored magnitude**: alternate opposing local rotations, then zoom out. Their signed mean can vanish while their squared magnitudes remain nonzero. That is useful for imagining neutral-looking matter retaining internal activity; it does not itself derive a neutral material's mass or magnetic response.

**Where the scenes must stop or fork**

The sources currently leave several relevant bridges unsettled. Preserve them as named forks in the mental laboratory:

- Early intake/exhaust stories and the later maintained pressure basin have different material-flow requirements. Use the [root version map](../README.md#gravity-topology-what-sink-means-inside-rccm).
- The Condensed source places its speed-limit core differently in the rheology and spin passages ([1597](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-Condensed.tex:1597>), [2597](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-Condensed.tex:2597>)). Cavity radius, Compton envelope and Planck core must remain separate labels.
- Its density-to-tension substitution at [2186](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-Condensed.tex:2186>) does not follow its stated signs. With \(\mathbb T_c=-P_c\) and \(\mathbb T_{local}=\mathbb T_c+P_{dyn}\), the positive capacity ratio is \(\mathbb T_{local}/\mathbb T_c\), not the printed \(2-\mathbb T_{local}/\mathbb T_c\). Use the positive pressure ledger for these scenes.
- Internal circulation is treated as remaining clock capacity in one construction and included among loads in another. Keep the [phase-lock fixture](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-Condensed.tex:1838>) separate from the [motion-equation load fixture](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-Condensed.tex:2281>) until a variable bridge is supplied.
- Exact electric/magnetic units, defect motion, nonlinear wave coupling and cavity formation require the declared field/boundary/observation contract. The [OpenFOAM audit](openfoam-rccm/04-equation-contract-and-gaps.md) supplies the detailed ledger; normalized tensor entries are not already calibrated volts and tesla.

**A repeatable route through any experiment**

1. Place the domain, source, supports, outer boundary and observer.
2. State what is held fixed and what one knob changes.
3. Locate the changed pressure or traction on a parcel or boundary.
4. Predict acceleration first, then update the existing velocity.
5. Track where momentum and energy move, including supports and outgoing waves.
6. Feed the changed motion back through the specified response law.
7. Stop at a missing law or threshold; label the needed next rule.
8. Return to the same initial state and reverse the knob. Check which signs reverse and which magnitudes survive.

In TypeScript terms, a beautiful field image is a render. A prediction requires a state and a rule:

```ts
type MentalExperiment<State, Boundary, Reading> = {
  initial: State;
  boundary: Boundary;
  step: (state: State, boundary: Boundary, dt: number) => State;
  observe: (state: State) => Reading;
};
```

The pressure-only gradient check has dimensions
\((\mathrm{Pa}/\mathrm m)/(\mathrm{kg}/\mathrm m^3)=\mathrm m/\mathrm s^2\).
For fixed \(P_c=\rho_\tau c^2/2\), it becomes
\(\mathbf a=-(c^2/2)\nabla q\), with \(q\) dimensionless. This is the explicitly reduced [GfX/data-guide experiment](../rccm-data.md#four-tests-of-alleged-sufficiency), not the entire nonlinear update rule.

Suggested first route: **pressure gloves → marked cube → drainless whirlpool → cavity shove → gravity basin → wavefront → paired structures**. Add the capacity and memory views when they answer a specific prediction. No learner mastery is inferred until the predictions are actually tried.

First unanswered probe: **a parcel is already travelling right; pressure increases toward the right. After a very short interval, where does it move, and how does its rightward speed change?** Then predict what happens if the pressure slope suddenly becomes flat.
