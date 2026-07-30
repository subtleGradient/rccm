# Prior: the cursive-semiconductor hypothesis

Date frozen before the evidence search: 2026-07-30

## Claim under test

For two semiconductor implementations that compute the same function at the
same throughput, voltage, process node, temperature, and reliability target,
replacing sharp-cornered device/interconnect geometry with continuously smooth
curves will reduce measured energy per completed computation.

Call this the **cursive-semiconductor hypothesis**:

\[
E_{\mathrm{op,cursive}} < E_{\mathrm{op,angular}}.
\]

The proposed mechanism is that abrupt changes of boundary direction crowd
current and electric field lines. Smooth curvature should distribute those
flows over more area, reducing local resistance, field concentration, heat,
reflection, or irreversible dissipation.

## Prior expectation

- I expect smoothing to help at particular geometrical bottlenecks: narrow
  conducting bends, high-field junction edges, radio-frequency transmission
  bends, and structures whose failure threshold is set by a local hotspot.
- I do **not** expect “make every line smooth” to be a general low-energy law
  for a complete ordinary CMOS thinking chip. Most switching energy is likely
  controlled by charged capacitance, supply voltage, activity, leakage,
  short-circuit current, and wire length. A smooth detour can add length and
  capacitance even while reducing a local crowding hotspot.
- Subjective prior: about 0.15 that curvature alone produces a repeatable
  whole-chip energy reduction of at least 5% in a controlled matched-function
  experiment; about 0.70 that deliberately rounded geometry improves at least
  one local current-density, field, signal-integrity, or reliability metric
  in a geometry where crowding is already important.

These probabilities are bookkeeping, not measurements.

## What counts as the independent variable

The intended treatment is **curvature of physical boundaries and centerlines**.
It is not allowed to smuggle in a different transistor count, process,
threshold voltage, supply voltage, logic family, clock rate, workload, cooling
system, conductor cross-section, or error rate and then attribute the result
to cursiveness.

There are at least three treatments that must not be conflated:

1. rounded corners with the same path length and conductor area;
2. globally curvilinear routing that may change path length and packing; and
3. smoothly varying or analog computation, which changes the encoding and
   architecture rather than merely the geometry.

## Primary outcome

\[
E_{\mathrm{op}} =
\frac{\int_0^T V_{\mathrm{DD}}(t) I_{\mathrm{DD}}(t)\,dt}
     {N_{\mathrm{correct\ operations}}}.
\]

Report the distribution over repeated dies, workloads, temperatures, supply
voltages, and clock rates. Energy without correctness is not a successful
computation.

## Falsifiers

The broad claim is falsified if a controlled real-world comparison finds that
the cursive implementation has equal or greater energy per correct operation
over the preregistered operating envelope, within measurement uncertainty.

The proposed corner-loss mechanism is more specifically falsified as the
dominant whole-chip explanation if:

- local corner smoothing changes current-density peaks but does not produce a
  measurable reduction in supply energy;
- energy follows total switched capacitance and wire length more strongly than
  corner count or curvature;
- an equal-area/equal-length rounded bend has no lower resistance or loss than
  the angular control in the relevant CMOS regime; or
- any observed gain disappears when function, timing, area, conductor volume,
  temperature, and error rate are matched.

One counterexample can falsify the universal wording “would reduce energy.”
It cannot establish that rounding never helps in a bounded regime.

## Evidence that would survive the test

The hypothesis survives provisionally if multiple fabricated matched-pair
test structures or chips show lower energy per correct operation for the
curved treatment, with the effect repeating across dies and remaining after
accounting for capacitance, resistance, path length, area, timing, and thermal
differences. Independent replication would be stronger than a single
designer’s demonstration.

## RCCM-facing prior

RCCM may make the geometry easier to reason about by treating the chip as a
field-and-boundary machine: pressure/admittance-like gradients, permitted
channels, stored field state, and irreversible losses. That could generate a
useful design hypothesis. It does not by itself turn a geometric analogy into
a semiconductor law or make the energy claim true. The RCCM account must
recover the units, limiting cases, and measured predictions of established
device and circuit models before it earns physical identity.
