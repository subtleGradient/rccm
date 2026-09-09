# Paused worlds: be the object and see its surroundings

You are the object. Your wider viewpoint surrounds the object and sees through it. Pausing preserves all the motion already present: the rock still has velocity, the filing still has spin and a magnetic history, and the cloud still contains its charges and any existing ionized channels. You have paused the update, not erased its inputs.[^status]

[^status]: RCCM provides the proposed continuum interpretation used here. The calculable examples use explicitly declared gravitational, electromagnetic, material and contact laws; the complete tau-derived material and discharge dynamics remain unfinished. These are mental experiment designs, not simulated or experimentally validated RCCM worlds. The [equation contract](openfoam-rccm/04-equation-contract-and-gaps.md) records the implementation boundary.

**The hybrid viewpoint has five simultaneous senses.**

| Sense | From inside the object | From the surrounding view |
|---|---|---|
| Motion already present | A forward route and a sense of current spin | A straight tangent arrow plus an angular-velocity marker |
| Distributed load | Contact, stretch, squeeze and twisting tendency | Pressure and shear tractions across surfaces; their summed force and torque |
| Coupling to the field | Which internal parts respond and which can rearrange | Mass/inertia, charge distribution, polarization and magnetization |
| Holds | The table, string, support or neighboring object limiting motion | Contact normals, friction limits, joints, available rotation axes |
| Possible next changes | What begins to move or change internally | A short conditional future trace, field feedback, and event thresholds |

Your godlike sense may display quantities a real body cannot directly feel. In particular, a small freely falling body feels approximately weightless even when its planet-relative coordinate acceleration is large. Keep the ordinary support-force sensation distinct from the augmented field display.

The reusable update is:

```text
preserve current velocity, spin and internal state
→ determine forces, torque and contact reactions
→ change momentum and angular momentum
→ move and rotate
→ update magnetization, charge, material state and fields
→ inspect the next frame
```

An existing field, its force on a particular object, and the object's future trajectory are three different views. None should silently replace the others.

**World 1: I am a rock near a planet.**

Choose one spherical planet, a small rock outside it, no atmosphere, no thrust and no other bodies. Use a nonrotating, planet-centered frame. Your starting position is three planet radii from its center. The surface lies below you, two radii away.

From inside the rock, there is no ground under your feet. You feel no support force. Your godlike sense paints an inward acceleration arrow through your center and preserves your existing velocity as a separate arrow. NASA describes vacuum falling and orbital motion as the same gravity-only problem, including the shared acceleration that produces weightlessness. [NASA free fall](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/free-falling-objects/)

Replay that position with different stored velocities. Let the local circular-orbit speed be one speed unit. In each example below the initial velocity is purely sideways, tangent to a circle around the planet:

| Sideways speed | Your future | What differs in the paused frame |
|---|---|---|
| Zero | Radial fall into the surface | No initial sideways motion |
| 0.5 circular speed | A curved route that still hits the planet | Some sideways motion, insufficient clearance |
| 0.8 circular speed | A closed ellipse that clears the surface | Enough sideways motion to miss the planet |
| 1 circular speed | A circle | Speed and radius match the circular solution |
| 1.6 circular speed | Escape on an open curve | Enough energy to remain unbound, with a clear outgoing route |

These are calculations for the chosen starting radius, not universal numerical cutoffs. Every row begins with the same gravitational force for the same rock. There is no extra outward force to switch on for the orbit or escape rows in this frame.

**The feel:** your current motion carries you along the tangent; gravity continually changes that motion inward. During escape, the acceleration remains inward. Whether gravity eventually turns you back depends on energy and geometry, not on the arrow suddenly changing direction.

For a general initial direction, your godlike view needs three readings: moving inward or outward now; enough energy to reach arbitrarily large distance; and whether the route clears the surface. A rock moving inward can exceed escape speed and still hit the planet before escaping. A bound ellipse can also intersect the surface.

Symbolic export, with \(\mu=GM\), center distance \(r\), planet radius \(R\), and planet-relative velocity \(\mathbf v\):

\[
\mathcal E=\frac{|\mathbf v|^2}{2}-\frac{\mu}{r},\qquad
h=|\mathbf r\times\mathbf v|,\qquad
v_c=\sqrt{\mu/r},\quad v_{esc}=\sqrt{2\mu/r}.
\]

Energy \(\mathcal E\) distinguishes bound from unbound motion; angular momentum \(h\) helps determine closest approach. These are standard single-center invariants. [MIT orbital mechanics](https://ocw.mit.edu/courses/16-50-introduction-to-propulsion-systems-spring-2012/ed0c2e057d08d0d954a206a622962b3c_MIT16_50S12_lec3.pdf)

For \(h>0\), compute \(e=\sqrt{1+2\mathcal E h^2/\mu^2}\) and closest conic radius \(r_p=h^2/[\mu(1+e)]\). A bound path survives as an orbit only when \(r_p>R\). An inward unbound path hits if \(r_p\le R\), otherwise it swings past and escapes. An outward unbound path escapes; a below-surface mathematical periapsis may lie in its past. For purely radial motion, an inward rock hits; an outward bound rock returns and hits; an outward unbound rock escapes.

**Turn on the tau view.** Paint pressure capacity increasing outward and lower toward the planet. GfX's weak static branch writes

\[
q=\frac{P_{static}}{P_c}=1-\frac{2\mu}{c^2r},\qquad
\mathbf a=-\frac{c^2}{2}\nabla q=-\frac{\mu}{r^2}\hat{\mathbf r}.
\]

This is the proposed continuum interpretation of the same inward acceleration. Do not add a second force labelled “tau pressure” to the gravity arrow. At ordinary planetary scales, the capacity difference is tiny; a vivid display needs explicitly amplified contrast. This scalar field does not specify a river of fluid flowing into the planet. Sources: [Condensed pressure terrain](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-Condensed.tex:1306>), [GfX acceleration](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-GfX-2.tex:387>) and [pressure profile](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-GfX-2.tex:453>).

**Change one thing:** keep the rock's position and every force unchanged, then change only its velocity. A paused force map alone cannot distinguish the resulting futures.

**World 2: I am an iron filing beside a permanent magnet.**

Put yourself directly outside the magnet's north pole, over a horizontal table. The local magnetic-field arrow points away from that pole. The field's magnitude increases toward the magnet. Keep those two facts separately visible.

Inside your body, draw two axes: your physical long axis and your magnetization. In soft iron the magnetic domains can rearrange. Internal magnetization can change while the body's orientation stays fixed. A permanent-magnet needle has a moment more strongly retained relative to its body. Magnetic history and material response therefore belong in the paused state. [OpenStax magnetic materials](https://openstax.org/books/university-physics-volume-2/pages/12-7-magnetism-in-matter), [University of Virginia: soft and hard magnets](https://galileoandeinstein.phys.virginia.edu/Elec_Mag/2022_Lectures/EM_33_Magnetic_Materials.html)

Your wider view shows a possible bodily turning tendency, magnetic force toward greater field magnitude in the induced soft-material example, gravity downward, and any support/friction reactions. Outside the north pole you can accelerate toward the magnet even though the local magnetic arrow points away from it. Field arrows are not flight paths. [MIT's iron-particle force example](https://web.mit.edu/6.013_book/www/chapter11/11.8.html)

**The feel:** your internal magnetic state responds first or alongside your body; the resulting distributed load can turn you, pull your center, or be balanced by the table. A long filing's orientation-dependent response can favor alignment of its long axis. A perfectly isotropic induced sphere can instead have an aligned moment and zero dipole torque while still being attracted by a gradient.

Unpause with one of these starting states:

| Paused state | What begins next |
|---|---|
| Resting in air, near a nonuniform field | Magnetic acceleration plus downward gravitational acceleration |
| Already moving away from the magnet | Continued outward displacement initially, even if acceleration points inward |
| Resting on paper, with adequate contact resistance | Internal magnetization may change while the center stays fixed |
| Able to turn, with sufficient magnetic torque | Body rotation; it can overshoot unless damping removes rotational energy |
| Nearly uniform magnetic field, no support | Magnetization/alignment response can occur while gravity makes you fall |

For a simple table model, ignore adhesion and tipping temporarily. With upward magnetic component \(F_{mag,z}\), the required normal support is \(N=mg-F_{mag,z}\). If it becomes negative, the table cannot supply it: contact opens. Sliding starts when the required horizontal holding force exceeds static friction's capacity \(\mu_sN\). For a jagged filing, also check torque about the actual contact points; it may tip before lifting bodily. These thresholds follow from the specified contact model.

In the dipole formulas, \(\mathbf B\) is the external field at the object, excluding its own field. The conventional permanent-dipole fixture has
\(\boldsymbol\tau=\mathbf m\times\mathbf B\) and
\(F_i=\sum_j m_j\partial_iB_j\), with the moment fixed during the spatial derivative. Exact antiparallel alignment has zero instantaneous torque but is unstable to a small tilt. [OpenStax dipole torque](https://openstax.org/books/university-physics-volume-2/pages/11-5-force-and-torque-on-a-current-loop)

For a separate isotropic, reversible, linear induced fixture,
\(\mathbf m=\beta\mathbf B\), \(\beta>0\), and
\(\mathbf F=\tfrac12\beta\nabla B^2\).
The corresponding energy is \(-\tfrac12\beta B^2\); treating the induced moment as a permanent one would give an incorrect factor of two. Real iron requires additional shape, saturation and hysteresis information. [University of Pisa induced-dipole derivation](https://osiris.df.unipi.it/~macchi/TEACHING/FISICA2/PROBLEMS/magneticmomentforce.pdf)

**Turn on the tau view.** The magnet's aligned microscopic circulating states build an oriented rotational field. Your filing's internal response changes how it couples to that field. Unequal stresses produce translation; their moment about your center produces torque. This is the [RCCM magnetic interpretation](../rccm-magnets.md), with the conventional material and contact laws providing the next-frame calculation. Do not turn field lines into ropes or streams dragging every filing along their arrows.

**Change one thing:** reverse the source magnet. In the induced soft-material fixture, internal magnetization reverses while attraction remains. Replace the filing with a clamped permanent dipole and repeat: the response changes because the coupling state is different.

**World 3: I am a balloon inside a thundercloud.**

Specify a balloon with known mass, displaced-air volume, charge distribution, dielectric response and surface conductivity. Latex and a conducting envelope require different electrical response laws. Your motion also depends on the surrounding air's velocity.

In the body view, show weight downward, buoyancy, aerodynamic loading and the net electrical load. For a small charged object in a nearly uniform imposed field, the net-charge term is \(Q\mathbf E\). Polarization requires resolving separated charge responses, especially in nonuniform fields; a neutral polarized object can experience opposing electrical loads with zero net translation in a uniform field. [MIT polarization and forces](https://ocw.mit.edu/courses/res-6-002-electromagnetic-field-theory-a-problem-solving-approach-spring-2008/2cccce322d387cccbc78c3ed65843f49_MITRES_6_002S08_chp03_text.pdf)

Your godlike view then leaves the balloon and fills the air with a separate map: cloud charges carried by water/ice, electric-field vectors, air density, temperature and composition (including humidity), particle geometry, free charge carriers, and any existing channels with their temperature and conductivity. This map determines where electrical activity can grow. Balloon acceleration is not its gauge. The balloon can be mechanically balanced while the surrounding electrical loading is strong.

**A complete pause contains no continuing buildup.** To examine buildup, hold the balloon geometry fixed and advance the storm's charging drive through successive frozen states. That explicitly changes charge separation and the surrounding field. Then release the air's microscopic response.

Zoom into a possible discharge region:

```text
seed electrons gain energy from the field
→ collisions create or remove mobile electrons
→ a growing population creates space charge
→ space charge reshapes the local field
→ an ionization front may advance and branch
→ a sustained conducting channel may develop
```

This is a reaction-and-field feedback process. A streamer is an advancing ionization front; a leader is a sustained, much more conductive channel; the return stroke is a rapid current wave along the established connection. For the common negative cloud-to-ground case, an advancing leader and an upward connecting discharge establish the connection used by the return stroke; other flash types have different geometry. [NOAA lightning types](https://www.nssl.noaa.gov/education/svrwx101/lightning/types/), [NOAA lightning questions](https://www.nssl.noaa.gov/education/svrwx101/lightning/faq/)

**The feel:** electrical load becomes an increasing opportunity for microscopic charge motion. The first conducting region changes the load on the next region. The path is made as the event grows. It is not a completed route already encoded by one static field line.

For this scene, the honest target is to predict favorable regions, growth versus extinction, and effects of changing conditions. A coarse frozen field map does not fix the exact first time, branch geometry and attachment point. Original lightning-initiation observations distinguish activity that develops into a flash from activity that dies out. Streamer experiments and simulations also show the importance of microscopic fluctuations to branching. [Rison et al. original observations](https://www.nature.com/articles/ncomms10721), [CWI branching study](https://ir.cwi.nl/pub/33330)

Compare identical geometry and large-scale field with (a) weakly ionized air and (b) an existing conducting channel. Their next frames differ. Change density or object shape and the initiation conditions can change again; an airborne-conductor study explicitly investigates these dependencies. [NASA airborne-object study](https://ntrs.nasa.gov/citations/20120003683)

**Turn on the tau view.** RCCM's electric-strain interpretation provides the proposed field layer. The air's ionization, transport, heating and conductivity remain material response rules. The Condensed source explicitly places ordinary high-voltage phenomena deep within its linear tau regime, so its own account does not locate ordinary lightning at the absolute tau-cavitation limit. See [Condensed line 3239](</Users/tom/Library/Mobile Documents/com~apple~CloudDocs/RCCM/RCCM-Condensed.tex:3239>). Lightning here is a change in the conducting state of the air. The source does not supply a completed streamer/leader model.

**Change one thing:** keep the balloon's net force balanced while increasing electrical loading elsewhere in the cloud. Mechanical stillness and readiness for discharge are independent observations.

**World 4: I inhabit the objects in classic electrostatics.**

Keep charges attached to actual material locations or permitted transport paths. A conductor permits charge redistribution; an insulator restricts it. A grounded object exchanges charge with a reservoir. An isolated object's total charge obeys a different constraint. [OpenStax conductors and induction](https://openstax.org/books/university-physics-volume-2/pages/5-2-conductors-insulators-and-charging-by-induction)

| Experiment | Your body view | Godlike view and decisive change |
|---|---|---|
| Charged bead between plates | Electrical force and weight act together | Adjust \(Q E_z\) against \(mg\); retain current velocity even at force balance |
| Neutral paper near a charged balloon | Different internal charge responses feel different loads | Resolve polarization and the source's field gradient; reversal can reverse polarization while attraction remains |
| Charged balloon at a wall | Normal attraction, contact and weight | Include wall polarization and tangential friction; attraction alone does not say whether the balloon slides |
| Electroscope leaf | Repulsion produces a turning tendency; gravity and the hinge oppose it | Track charge redistribution, leaf angle and torque; the equilibrium angle solves the torque balance |
| Neutral conductor near a charged rod | Charges rearrange internally before the body need move | Add/remove a grounding path and track the charge reservoir and connection order |
| Parallel capacitor plates | Distributed attraction loads the supports | Hold total charge fixed or keep voltage fixed with a supply; these are different experiments as spacing changes |

For the ideal isolated parallel plates (large area \(A\), negligible edge fields), fixed charge gives \(E=Q/(\epsilon A)\); fixed voltage gives \(E=V/d\). With plate pressure \(\epsilon E^2/2\), reducing spacing leaves the ideal fixed-charge force unchanged but increases the fixed-voltage force. The supply's exchanged charge and energy belong in the second experiment. The energy method explicitly treats electrical/mechanical coupling. [MIT electroquasistatic energy](https://web.mit.edu/6.013_book/www/chapter11/11.4.html)

The charged-bead balancing fixture is especially useful. Set upward \(Q E_z=mg\). A bead already moving continues to move initially; balance sets its instantaneous acceleration to zero. In ideal uniform fields a vertical displacement supplies no restoring tendency, so this is not a stable trap. Change the field gradient or add a mechanical constraint before asserting stable levitation.

The tau view assigns the electric loading to the proposed continuum strain channel, and matter's charge/polarization to its coupling. Ordinary electrical force is the macroscopic readout of that proposed mechanism. Count that force once, using constituent forces or their equivalent integrated stress rather than adding the two descriptions. Atomic/contact forces hold the material together, so surface or volume stress must transmit the microscopic loading to the body's motion.

**The strongest Hyperslices exposed by these worlds**

| Razor | Two halves | Counterexample that makes it useful |
|---|---|---|
| Motion versus acceleration | Existing velocity / change of velocity | An escaping rock can accelerate inward |
| Field versus force | Environmental field / object-specific response | A filing moves toward a north pole while local \(\mathbf B\) points away |
| Internal versus bodily change | Magnetization/charge rearranges / body moves | A soft filing remagnetizes without flipping |
| Load versus permitted motion | Applied force / unbalanced force after constraints | Friction holds a loaded filing |
| Balance versus stability | Net force zero now / restoring response after a nudge | A balanced charged bead in uniform fields is not trapped |
| Mechanical motion versus material transition | Object acceleration / conduction or phase change | A balanced balloon can be surrounded by growing discharge activity |
| Appearance versus continuation state | Same visible geometry / same complete evolving state | An existing conducting channel changes the next discharge |
| Fixed charge versus fixed voltage | Isolated reservoir / controlled supply | The plate-force response to changing separation differs |

One compact symbolic export is enough to retain the architecture:

```ts
type PausedWorld = {
  bodies: BodyState[]; // position, velocity, orientation, angular momentum
  response: MaterialState[]; // charge, polarization, magnetization, memory
  fields: FieldState;
  contacts: ContactState;
  drives: SourceAndBoundaryState;
};
// Loads update momenta; momenta move bodies; materials and fields respond.
```

**Return probe:** you are the same rock at the same position. In one paused copy you are stationary; in the other you have exactly the circular-orbit sideways velocity. Point to the thing that changed, the thing that stayed identical, and the first difference after time advances.
