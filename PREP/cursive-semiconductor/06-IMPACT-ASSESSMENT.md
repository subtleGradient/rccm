# Impact and external audit

## Practical audit

### Manufacturing

- Curvilinear masks and wafer patterns are now technically credible, but full
  adoption requires compatible layout representation, design-rule checking,
  parasitic extraction, optical proximity/inverse-lithography correction, mask
  writing, inspection, and yield models.
- “All smooth” is unlikely to be the optimal manufacturing constraint.
  Restrictive or partial free-form routing can capture useful shortcuts while
  retaining proven Manhattan devices and tooling.
- Process variation can erase a nominal curvature benefit. Printed edge
  roughness and corner radius must be measured, not inferred from design data.

### Design tools

- Existing standard-cell libraries, compact models, timing/power tables, and
  verification tools assume restricted geometries. Curvilinear devices can
  require new parameter extraction and larger design spaces.
- A router optimizing only path smoothness can worsen area, coupling,
  routability, or thermal density. The objective must include energy,
  correctness, timing, area, yield, reliability, and cost.
- Free-form design may increase computational-lithography work and data
  complexity even if it reduces metal layers on the final chip.

### Measurement

- The expected curvature-only effect may be smaller than probe, package,
  regulator, workload, and die-to-die variation. On-die paired structures and
  high measurement power are essential.
- Ring-oscillator power is not automatically application energy. A complete
  result needs both isolated coupons and a correct-function macro.
- Lower peak current density may primarily improve lifetime. Marketing it as a
  power reduction without a boundary energy integral would misstate the result.

## Human and social audit

- A successful free-form-routing method could lower operational energy, wafer
  steps, or material use. It could also be spent on more compute per die,
  leaving total electricity demand unchanged or higher.
- More complex masks and proprietary EDA flows could concentrate access among
  the best-funded foundries. Open test structures, extracted data, and
  reproducible analysis would improve scientific access.
- “RCCM proves curved chips think with less energy” would outrun the evidence.
  The honest public claim is: RCCM inspired a geometry-first decomposition;
  conventional semiconductor physics identifies the mediators; silicon
  measurement decides.
- A negative result remains valuable. It would stop effort from being wasted
  on curvature-only aesthetics while preserving targeted high-field,
  high-current, RF, photonic, and routing-topology applications.

## Safety and reliability

- High-voltage and high-current tests require current limiting, thermal
  shutdown, guarded probes, and breakdown containment.
- Accelerated lifetime tests must distinguish lower energy from delayed
  failure; the most energy-efficient design is not acceptable if it violates
  electromigration, dielectric, or soft-error limits.
- Adiabatic or resonant power clocks can create high internal voltages or
  stored energy even when average dissipation is low. Wall-plug and fault
  energy belong in the ledger.

## Cost of being wrong

| Wrong belief | Likely cost |
|---|---|
| Curves always save energy | Tooling and mask complexity with no chip benefit |
| Corners never matter | Missed leakage, breakdown, RF, or reliability gains |
| Imec wafer printing proves power savings | Manufacturability mislabeled as system evidence |
| Lower power means lower energy/op | Slow or erroneous hardware presented as efficient |
| RCCM analogy replaces transport physics | No quantitative sign, scale, or fabrication rule |
| Conventional models make RCCM useless | Lost geometry-first insight and poorer experimental controls |

## Deployment rule

Proceed in increasing-cost rungs:

1. field-solver coupons with preregistered geometry and material parameters;
2. PCB or mature-node passive/inverter matched pairs;
3. multi-variant same-die silicon;
4. correct-function compute macro;
5. system and wall-plug accounting;
6. independent replication.

Promotion stops at the highest rung actually passed.
