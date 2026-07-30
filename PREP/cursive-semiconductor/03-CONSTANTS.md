# Constants and controls

These are the stable constraints that every cursive-chip explanation and test
must preserve.

## Physical ledgers

- [x] Energy is measured at the chip boundary:
  \[
  E_{\mathrm{in}}=\int V_{\mathrm{DD}}(t)I_{\mathrm{DD}}(t)\,dt.
  \]
  A local temperature drop or field improvement is not automatically a
  reduction in total supplied energy.
- [x] The denominator is **correct completed operations**. Lower power caused
  by lower throughput, missing transitions, timing failures, or bit errors is
  not an energy-efficiency win.
- [x] Conventional CMOS dynamic energy is governed at leading order by
  switched capacitance, voltage squared, and switching activity. Leakage and
  short-circuit current remain separate terms:
  \[
  P_{\mathrm{CMOS}}\approx
  a C_{\mathrm{sw}} V_{\mathrm{DD}}^2 f
  V_{\mathrm{DD}} I_{\mathrm{leak}}
  P_{\mathrm{short}}.
  \]
- [x] Resistive heating is a field integral:
  \[
  P_R=\int_V \mathbf{J}\cdot\mathbf{E}\,dV
  =\int_V \frac{|\mathbf{J}|^2}{\sigma}\,dV.
  \]
  Reducing a maximum current-density hotspot does not necessarily reduce this
  volume integral by a measurable amount.
- [x] Stored electric-field energy is:
  \[
  U_E=\frac12\int_V\epsilon|\mathbf{E}|^2\,dV
  =\frac12 CV^2.
  \]
  Geometry matters through the field solution and the resulting capacitance,
  not through an aesthetic smoothness score.
- [x] For a uniform ordinary conductor in the lumped regime,
  \(R\approx\rho L/A\). Increasing route length or reducing cross-section can
  negate a corner improvement.

## Semiconductor terrain

- [x] Silicon’s allowed electronic states form valence and conduction bands
  separated by a band gap. Doping changes the available mobile-carrier
  population; n-type material has electrons as majority carriers and p-type
  material has holes as majority carriers.
- [x] A MOSFET has source, drain, gate, body, and a gate dielectric. Gate
  voltage changes the electrostatic terrain and carrier density under the
  dielectric, opening or closing a conducting channel.
- [x] A CMOS gate uses complementary nMOS pull-down and pMOS pull-up networks.
  The output is a charged node with two robust voltage basins, not a tiny bead
  of charge labeled “0” or “1.”
- [x] A thinking machine is a hierarchy:
  transistor → logic gate → combinational/sequential block → memory and
  interconnect → instruction/data machine → algorithm. Curving a wire does not
  change the Boolean function unless it changes connectivity, timing, or
  analog behavior.

## Geometric constraints

- [x] Curvature \(\kappa\) has units \(L^{-1}\). A quantitative prediction
  needs dimensionless ratios such as \(\kappa w\), conductor length/width,
  feature size/wavelength, and rise time/propagation time.
- [x] Fabricated “sharp” corners have finite radius, roughness, and process
  variation. A mathematical infinite-curvature singularity is not the
  physical control specimen.
- [x] Local boundary curvature, route centerline, path length, conductor
  volume, spacing, layer count, and via count are distinct variables.
- [x] DC/low-frequency conduction, fast digital edges, RF transmission,
  optical waveguides, high-voltage breakdown, and superconducting current
  crowding are different regimes. Evidence does not transfer without matching
  the governing dimensionless scales and constitutive laws.

## Experimental invariants

- [x] Match logical netlist, process, supply, clock/throughput target,
  workload, temperature, device sizing, correctness criterion, and measurement
  bandwidth.
- [x] Put angular and cursive variants on the same die where possible; mirror
  and randomize positions to expose wafer gradients.
- [x] Include at least three controls:
  curvature-only, free-form route optimization, and temporal waveform.
- [x] Report extracted \(R,C,L\), wire length, via count, area, timing,
  leakage, peak current density, temperature, and errors beside energy.
- [x] Predeclare the smallest effect worth claiming and an equivalence region.
  “No significant difference” is not evidence of equality unless the
  experiment has the power and precision to resolve the target effect.
- [x] A system-level gain from a shorter path or fewer vias is real but cannot
  be attributed to curvature alone.

## Epistemic invariants

- [x] Dimensional compatibility is not physical identity.
- [x] A field/fluid analogy may organize the terrain without replacing carrier
  transport or circuit equations.
- [x] Simulation predicts the encoded model; wafer printing establishes
  manufacturability; electrical operation establishes device behavior;
  energy-per-correct-operation establishes the target claim; independent
  replication tests generality.
- [x] `RCCM-Condensed.tex` is the formal source for the RCCM interpretation.
  Its electromagnetic and impedance identifications remain claims of the
  document unless independently validated.
