# Adversarial evidence log

Search date: 2026-07-30

Search target: evidence that smooth physical chip geometry does **not** reduce
energy per correct computation, plus evidence that separates local corner
effects, global routing effects, temporal waveforms, and whole-chip energy.

Tags refer to the frozen universal hypothesis. `[FALSIFIES]` means the fact
contradicts the universal or proposed dominant mechanism; `[SUPPORTS]` means
it is compatible with a bounded benefit. Neither tag promotes a simulation,
analogy, or design estimate into measured system evidence.

## Raw observations

### Established semiconductor and circuit behavior

- `[FALSIFIES: curvature-as-primary-mechanism]` A MOSFET’s insulated gate
  capacitively controls an inversion channel through the oxide electric field.
  The standard device account is expressed in doping, electrostatics, carrier
  density/mobility, dimensions, and terminal voltages—not a count of visual
  corners. Source:
  [Cambridge, *Fundamentals of Modern VLSI Devices*, MOSFET chapter](https://www.cambridge.org/highereducation/books/fundamentals-of-modern-vlsi-devices/FC4BC491DDD2F339A03BE28C6E174169/mosfet-devices/F2F5AA38E2F4175753298DEE0D5966FF).
- `[FALSIFIES: curvature-as-primary-mechanism]` In static CMOS, a low input
  turns the pMOS on and nMOS off, pulling the output high; a high input does
  the reverse and pulls the output low. Logic comes from complementary
  field-controlled conduction networks.
  Source:
  [UC Berkeley EE 42/100, “CMOS Transistors and Logic Gates”](https://rfic.eecs.berkeley.edu/courses/ee42_100/pdf/lect23_ann2.pdf).
- `[FALSIFIES: curvature-as-primary-mechanism]` The standard leading dynamic
  power term is switching activity times load capacitance times supply voltage
  squared times frequency. The same source separates load charging,
  short-circuit current, and static leakage and calls load capacitance the
  largest component in its model.
  Source:
  [Rabaey/Berkeley CMOS power lecture](https://people.eecs.berkeley.edu/~alanmi/research/timing/papers/lec25_bw_2xp.pdf).
- `[FALSIFIES: universal-sign claim]` Because interconnect capacitance and
  inductance increase with trace length, a smooth route that becomes longer
  can worsen its RC time constant and switching load. Curvature is therefore
  unable to guarantee a negative energy change.
  Source:
  [Texas Instruments, *TWL1200 PCB Design Guidelines*, §2.3](https://www.ti.com/lit/an/scea042/scea042.pdf).

### Local sharp-corner effects

- `[SUPPORTS: targeted rounding]` A 1987 silicon experiment reported that
  sacrificial rounding oxidation reduced electric-field intensification at a
  convex silicon corner and decreased thin-gate-oxide leakage. It also examined
  time-dependent dielectric breakdown.
  Source:
  [Shibata et al., IEEE Transactions on Electron Devices, DOI 10.1109/T-ED.1987.23137](https://cir.nii.ac.jp/crid/1360574095377457920).
- `[SUPPORTS: targeted rounding]` An industrial trench-MOSF process report
  presents SEM images and electrical measurements in which corner treatment
  removed oxide weak spots and improved breakdown voltage. This is a
  reliability/high-field result, not a complete chip-energy result.
  Source:
  [X-FAB, “Improved corner rounding method for trenched MOSFET”](https://www.xfab.com/resourcexplorer/detail/improved-corner-rounding-method-for-trenched-mosfet).
- `[FALSIFIES: “sharp bend means large practical loss”]` A Bell Labs model
  agreed with experimental printed-conductor measurements and found a maximum
  reflection of about 4.5% for one specified very fast edge; it concluded that
  90-degree bends remained adequate for bit rates of a few gigabits per
  second. The effect is scale- and regime-dependent, not a categorical
  sharp-versus-smooth law.
  Source:
  [Bell Labs, “Reflections from Bends in a Printed Conductor” (1990)](https://www.nokia.com/bell-labs/publications-and-media/publications/reflections-from-bends-in-a-printed-conductor/).
- `[SUPPORTS and bounds]` AMD’s high-speed layout guidance says a 90-degree
  turn adds local excess capacitance because the trace becomes wider, while
  mitering, cutouts, or curvature can reduce the discontinuity. This supports
  local field shaping but identifies capacitance and path matching—not
  smoothness itself—as the mediators.
  Source:
  [AMD UltraScale PCB Design Guide, “Microstrip/Stripline Bends”](https://docs.amd.com/r/en-US/ug583-ultrascale-pcb-design/Microstrip/Stripline-Bends).

### Curvilinear semiconductor layouts

- `[SUPPORTS: free-form optimization]` Imec’s curvilinear standard-cell work
  found that most studied cells reduced total metal length and via count and
  could eliminate an extra metal layer compared with one-dimensional
  Manhattan layouts. These are plausible routes to lower capacitance,
  resistance, delay, or power.
  Source:
  [Kim et al., “Curvilinear Standard Cell Design for Semiconductor Manufacturing,” DOI 10.1109/TSM.2024.3362900](https://imec-publications.be/entities/publication/aab5ea0c-ac56-4740-87f8-4d976c7cfacc).
- `[FALSIFIES: evidence already settles energy]` The related 2024 Imec/SPIE
  paper explicitly says system-level power/performance evaluation was **not
  included** and was future work.
  Source:
  [Kim et al., “Manufacturing-friendly curvilinear standard cell design,” pp. 6–7](https://imec-publications.be/bitstream/handle/20.500.12860/44038.2/1295405.pdf?sequence=1).
- `[SUPPORTS: manufacturability only]` Imec fabricated masks and exposed
  curvilinear D-flip-flop routing structures on wafers. The experiment
  validated lithographic printability from 40 nm down to 32 nm pitch and
  reported large reductions in use of upper routing layers across the studied
  cell library. It did not electrically operate the flip-flop or measure
  energy per operation.
  Source:
  [Treska et al., “EUV Single Patterning Validation of Curvilinear Routing”](https://imec-publications.be/server/api/core/bitstreams/8c9d8a92-8155-4e7c-99e6-2848daa3808a/content).
- `[SUPPORTS: estimated design benefit; FALSIFIES: curvature-only story]`
  Imec’s 2025 technical summary reports about 5% estimated standard-cell delay
  improvement because the new route removed a via and shortened the metal
  path. The stated mechanism is topological/path optimization, not merely
  rounding a fixed corner. Whole-layout power improvement is described as an
  estimate.
  Source:
  [Imec, “Curvilinear technology: a game changer for the logic technology roadmap”](https://www.imec-int.com/en/articles/curvilinear-technology-game-changer-logic-technology-roadmap).
- `[FALSIFIES: “all smooth has no cost”]` Fabricated annular and ring-gate
  NMOS devices in a commercial 0.35 µm process incurred higher area penalties
  than ordinary two-edged devices and required nonstandard parameter
  extraction. This does not directly measure energy, but it demonstrates a
  real cost and an extra modeling burden for smooth/enclosed geometry.
  Source:
  [Fan et al., “Gate-enclosed NMOS transistors,” DOI 10.1088/1674-4926/32/8/084002](https://www.jos.ac.cn/en/article/doi/10.1088/1674-4926/32/8/084002).

### A separate kind of cursiveness: time

- `[SUPPORTS: smooth trajectory, not smooth outline]` A fabricated 130 nm
  adiabatic FIR-filter test chip produced measured energy-saving factors
  consistent with simulation relative to a static-CMOS counterpart. The
  mechanism uses energy-recovering temporal waveforms and circuit topology.
  It is not evidence that curved physical outlines save energy.
  Source:
  [Teichmann, *Adiabatic Logic: Future Trend and System Level Perspective*](https://link.springer.com/book/10.1007/978-94-007-2345-0).

### RCCM source observations

- `[SUPPORTS: spatial reasoning]` `RCCM-Condensed.tex` §“EM Kinematics & The
  LC-Acoustic Isomorphism” places electric/magnetic fields, capacitance,
  inductance, impedance, and Poynting flux into one field-and-flow picture.
- `[SUPPORTS: hypothesis-generation]` The same document’s kinematic-impedance
  section treats resistance as inverse compliance/admittance, which makes
  local bottlenecks and field concentrations natural objects to inspect.
- `[FALSIFIES: RCCM already predicts the chip]` The TeX does not supply
  semiconductor energy bands, Fermi statistics, dopant ionization, drift-
  diffusion/ballistic transport, mobility and scattering, recombination,
  MOS-interface states, compact transistor equations, lithographic geometry,
  or a curvature-to-loss constitutive law. Its EM mappings are document claims,
  not independent validation of a cursive chip.

## Failed falsification search

I did not locate a published experiment satisfying all of these conditions:

1. fabricated angular and curvilinear implementations on matched silicon;
2. identical logical function and process;
3. measured energy per **correct** operation, not only simulated PPA, delay,
   leakage, breakdown, printability, or S-parameters;
4. separated curvature from wire length, conductor volume, via count, timing,
   voltage, temperature, and error rate; and
5. repeated dies or independent replication.

The absence of a located result is not evidence that none exists. The Imec
papers are particularly informative because they demonstrate that the
technology is real while explicitly exposing the missing system-power test.

## Evidence update

The evidence kills “smooth curves always reduce chip energy” as a law and kills
“sharp corners are the dominant ordinary-CMOS loss” as the default mechanism.
It does **not** kill the bounded hypotheses that targeted rounding helps a
field-concentration hotspot or that globally optimized free-form routing can
shorten paths, remove vias, and thereby improve energy.
