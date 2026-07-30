# Working model: cursive geometry is a control surface, not an energy law

Updated after the adversarial evidence search: 2026-07-30

The frozen prior is preserved in git commit `9d27b1f`. It tested:

\[
E_{\mathrm{op,cursive}} < E_{\mathrm{op,angular}}
\]

for matched function, process, voltage, throughput, temperature, reliability,
and correctness.

## Verdict on the original claim

The universal version is rejected. “Smooth” is not itself a term in the CMOS
energy ledger. Geometry changes energy only by changing a physical mediator:
capacitance, resistance, inductance, electric-field concentration, current
density, path length, via count, coupling, leakage, breakdown, timing, cooling,
or error rate. Those mediators can move in opposite directions.

The narrower model that survives is:

\[
\Delta E_{\mathrm{op}}
=
\Delta E(C,R,L,I_{\mathrm{leak}},t_{\mathrm{rise/fall}},
\text{activity},\text{topology},T,\text{errors}),
\]

where curvature may alter some arguments but has no fixed-sign coefficient of
its own.

The strongest presently justified statements are:

1. **Local field shaping is real.** Rounding a high-field silicon corner can
   reduce oxide leakage or improve breakdown. Smoothing or mitering some
   conductor bends can reduce current/field crowding or reflections.
2. **Optimized free-form routing is promising.** Curvilinear paths can be
   shorter around obstacles and can eliminate vias or whole routing layers.
   Imec has demonstrated wafer printability and design-level path/via
   reductions.
3. **Whole-chip energy is unresolved.** The located curvilinear-semiconductor
   studies did not report a fabricated, matched, system-level energy-per-
   correct-operation comparison. Imec explicitly deferred that evaluation.
4. **Temporal cursiveness is a different mechanism.** Slowly ramped,
   energy-recovering or adiabatic voltage waveforms have reduced measured
   energy in fabricated CMOS. That result concerns the path through voltage
   state-space, not rounded metal or transistor outlines.

## Bayesian update

These are subjective bookkeeping probabilities, not measured frequencies:

- curvature alone yields a repeatable whole-chip reduction of at least 5%:
  prior `0.15` → posterior `0.05`;
- globally optimized curvilinear routing improves at least one
  power/performance/area metric in an advanced-node design: `0.55`;
- targeted rounding improves a local hotspot, leakage, breakdown, reliability,
  or signal-integrity metric when that failure mode is active:
  prior `0.70` → posterior `0.85`;
- an already published matched-silicon experiment directly settles the
  whole-chip energy claim: below `0.10` given the search and Imec’s explicit
  statement that system-level evaluation remained future work.

## Four meanings of “cursive” that must remain separate

| Treatment | What changes | Candidate benefit | Main confound |
|---|---|---|---|
| Rounded corner | Local boundary curvature | Lower peak field/current density | Area and local capacitance |
| Free-form routing | Global path topology | Shorter wires, fewer vias/layers | It is no longer a curvature-only test |
| Smooth waveform | Trajectory through voltage/time | Charge recovery, lower dissipation | Lower speed and clock-generation cost |
| Analog/neuromorphic state | Computational encoding | Fewer digital transitions for some tasks | Precision, noise, training, ADC/DAC cost |

## Dimension-space correction

Curvature has dimensions of inverse length:

\[
[\kappa]=L^{-1}.
\]

It cannot determine energy by itself. A predictive law needs dimensionless
geometry such as `κw` (curvature times wire width), electrical scale ratios
such as length divided by wavelength or signal rise length, and material
properties such as conductivity, permittivity, mobility, and breakdown field.
“No sharp corners” without those scales is an aesthetic constraint, not a
physical model.

## Primary outcome and controls

\[
E_{\mathrm{op}} =
\frac{\int_0^T V_{\mathrm{DD}}(t) I_{\mathrm{DD}}(t)\,dt}
     {N_{\mathrm{correct\ operations}}}.
\]

A curvature-only test must match netlist, process, terminal positions, path
length, conductor volume, timing target, voltage, workload, temperature, and
error rate. A system-optimization test may allow those to vary, but then the
causal claim becomes “free-form routing improved the system,” not “curves
dissipate less.”

## RCCM interpretation

RCCM is useful here as a **geometry-first compiler**:

```text
boundary shape
→ field/gradient distribution
→ allowed flux and stored state
→ impedance/admittance
→ dissipation or recovery
→ measured energy per correct operation
```

Its `RCCM-Condensed.tex` sections on kinematic impedance, LC/acoustic
isomorphism, and Poynting flux provide this spatial vocabulary. They do not
yet provide semiconductor band structure, carrier statistics, mobility,
scattering, recombination, MOS electrostatics, compact transistor models, or a
curvature-dependent constitutive law. Therefore RCCM can simplify hypothesis
generation and control design; standard semiconductor transport and Maxwell/
circuit models must still calculate the sign and size of the effect.

This is model-layer separation: useful analogy and structural mapping survive;
physical identity and predictive sufficiency have not been established.
