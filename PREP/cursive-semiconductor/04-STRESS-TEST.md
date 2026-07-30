# Variable-injection stress test

Each scenario attacks the idea that smooth curves carry an automatically
favorable energy sign.

| Injection | What the naive model predicts | What the working model asks | Result |
|---|---|---|---|
| Replace one right-angle route with a long smooth spiral | “Smoother, so lower energy” | Did \(L\), \(C\), \(R\), coupling, or transition count increase? | Universal claim breaks |
| Round a convex gate-oxide corner at fixed device function | Lower field concentration | Does leakage/breakdown improve, and how much of chip power came from that corner? | Local hypothesis survives |
| Use a free-form diagonal to bypass a via and a metal layer | Lower energy because it is curved | Is the gain explained by shorter wire and removed via? | System benefit possible; curvature-only attribution fails |
| Hold layout fixed but ramp voltage slowly and recover charge | No geometry change, so no benefit | Does dissipation fall as ramp time grows relative to \(RC\)? | Temporal cursiveness is a separate mechanism |
| Make a ring-shaped enclosed transistor | Smooth boundary should win | Did gate/diffusion area and capacitance increase? Did packing worsen? | Sign is unresolved; area penalty is real |
| Operate at DC | Sharp bend must waste energy | Does it measurably change \(\int J^2/\sigma\,dV\), not only \(J_{\max}\)? | Often tiny outside high-current bottlenecks |
| Operate at 50 GHz | Same result as DC | What are bend radius/wavelength, impedance, return path, and skin depth? | RF discontinuity may dominate |
| Replace copper with a superconducting nanowire | Smooth should still be a small optimization | Does local crowding set the critical current or trigger a normal hotspot? | Rounding can become decisive |
| Use a photonic waveguide | “Current flows more smoothly” | What are mode confinement and bend-radiation loss? | Different field and loss law |
| Use a ballistic nanoscale channel | Ordinary resistive-fluid picture | Are mean free path, contact resistance, quantum modes, and boundary scattering dominant? | Bulk-flow analogy can fail |
| Heat the chip by 80 °C | Geometry unchanged, energy unchanged | How did mobility and leakage move with temperature? | Material state can dominate geometry |
| Lower \(V_{\mathrm{DD}}\) by 10% only in the angular control | Cursive still expected to win | Dynamic energy changes roughly with \(V^2\) | Test is invalid unless voltage is matched |
| Allow the cursive design to miss timing | It used less power | How many correct operations completed at matched throughput? | False efficiency |
| Pack more smooth wires into the saved area | Shorter routes should save energy | Did coupling capacitance and activity rise? | Area recovery may be spent, not saved |
| Smooth every transistor and route but retain square bond pads and crystal lattice | “All smooth” | At which spatial scale is smoothness defined? | Treatment is ill-posed without resolution |
| Compare a 1970s hand-curved chip to a modern Manhattan chip | Curved chip’s energy decides the claim | Process, voltage, device count, and function differ | Historical comparison is unusable |
| Simulate lower peak current density | Energy reduced | Was total dissipated power integrated and silicon measured? | Simulation/hotspot result is insufficient |
| Print a curvilinear pattern on wafer | Working low-energy chip exists | Was it electrically contacted, clocked, correct, and power-measured? | Manufacturability only |
| Round a corner and observe longer lifetime | Energy reduced | Reliability and energy are different outcomes | Valuable result, wrong claim |
| A smooth route reduces \(R\) but increases \(C\) | Both should improve | Evaluate workload, frequency, and \(E_{\mathrm{op}}\) jointly | Sign can change with regime |

## Absurd edge cases

1. **The cursive Peano chip:** a perfectly smooth space-filling route visits
   almost every point on the die. It has no sharp corners but enormous length,
   capacitance, and delay.
2. **The zero-corner disconnected chip:** every device is a smooth isolated
   circle. It consumes almost no switching energy because it computes nothing.
3. **The hot cursive chip:** a curved route removes a via, allowing twice as
   many compute units in the same area. Total chip power rises while energy per
   operation falls. “Uses less energy” must name its denominator.
4. **The frozen cursive chip:** rounded superconducting wires reduce current
   crowding, but refrigeration dominates wall-plug energy. Device energy and
   system energy point in opposite directions.
5. **The cursive waveform on a square chip:** an adiabatic power clock reduces
   heat with entirely conventional angular layout. The word “smooth” was
   attached to the wrong axis.

## Stress-test update

The model survives only after replacing a binary geometry rule with a causal
graph:

```text
geometry + materials + scale + waveform + workload
→ fields and carriers
→ R/C/L/leakage/timing/errors/temperature
→ energy per correct operation
```

No one arrow can be skipped.
