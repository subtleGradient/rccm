# Theoretical framework: a thinking chip as a controlled field landscape

## 1. Terrain first

A conventional digital chip is a layered landscape:

```text
power rails             reservoirs that maintain two voltage basins
metal interconnect      paths along which electromagnetic energy propagates
gate dielectric         boundary that blocks DC gate flow but transmits field
semiconductor channel   terrain whose carrier density can be reshaped
source and drain        carrier-access regions on opposite sides of the gate
clock                   repeated schedule for changing and capturing state
memory node             a field/charge configuration made persistent by feedback
```

The physically important object is not an electron running through a miniature
maze. It is a coupled field-and-carrier state distributed across the chip.
Electromagnetic energy generally propagates in the field around conductors,
while charge carriers in the conductors respond and dissipate some of that
energy.

## 2. Why a semiconductor can be a valve

Pure silicon has a filled valence band, an empty conduction band at zero
temperature, and an energy gap between them. Doping installs controlled
populations of mobile electrons or holes.

An nMOS transistor places two electron-rich regions—source and drain—in a
p-type body. An insulated gate sits over the gap. Raising gate voltage changes
the electrostatic potential under the oxide. Past the operating threshold, it
creates an electron-rich inversion layer joining source to drain.

Spatially:

```text
gate low                         gate high

source   blocked terrain drain   source ===== channel ===== drain
 n+       p-type gap      n+      n+       inversion layer    n+
            OFF                                  ON
```

The gate is therefore not a mechanical flap. It is a boundary actuator that
reshapes the allowed carrier terrain.

## 3. From one valve to logic

A CMOS inverter places a pMOS route from the high rail to the output and an
nMOS route from the output to ground.

| Input | pMOS high route | nMOS low route | Output basin |
|---|---|---|---|
| low | conducting | blocked | high |
| high | blocked | conducting | low |

Series and parallel transistor networks form NAND, NOR, and other functions.
Feedback between gates forms latches and memory. Clocked state elements create
an ordered sequence. Arithmetic units, memory arrays, interconnect, and control
compose those microscopic transitions into a processor. Software does not add
a new physical force; it selects an astronomically structured route through
the machine’s possible state transitions.

In RCCM/Topolect language:

```text
bit          = one of two robust basins
transistor   = field-controlled pass boundary
logic gate   = junction of permitted and forbidden routes
clock edge   = scheduled terrain change
memory       = basin stabilized by feedback
program      = constrained itinerary through state-space
thinking     = recurrent measurement, transformation, storage, and selection
```

This is a teaching isomorphism. It is not evidence that a silicon processor
literally operates by the proposed \(\boldsymbol{\tau}\)-fluid.

## 4. Where the energy goes

When an output rises, the supply moves charge onto the output node’s effective
capacitance. The energy stored in that field is:

\[
U_C=\frac12 C_LV_{\mathrm{DD}}^2.
\]

For ordinary abrupt RC charging from a fixed supply, another
\(\frac12 C_LV_{\mathrm{DD}}^2\) is dissipated in the charging path. Discharging
the node dissipates the stored half. Thus a full charge/discharge event costs
approximately \(C_LV_{\mathrm{DD}}^2\) from the supply, before adding leakage
and short-circuit current. Over a workload:

\[
P_{\mathrm{dyn}}\approx aC_{\mathrm{sw}}V_{\mathrm{DD}}^2f.
\]

This tells us immediately why the cursive claim needs a mediator. Shape only
matters if it changes \(C_{\mathrm{sw}}\), voltage, activity, leakage, the
resistive path, timing, errors, or energy recovery.

## 5. The legitimate corner mechanism

In an ordinary conducting region:

\[
\nabla\cdot\mathbf J=0,\qquad
\mathbf J=\sigma\mathbf E=-\sigma\nabla\phi.
\]

The material boundary determines the solution. At an abrupt turn, equipotential
surfaces and current streamlines can compress near an inner edge, raising
\(|\mathbf J|\). Local heat density is:

\[
p(\mathbf x)=\mathbf J\cdot\mathbf E
=\frac{|\mathbf J|^2}{\sigma}.
\]

Rounding can lower the peak. But total resistive power is the volume integral:

\[
P_R=\int_V p(\mathbf x)\,dV.
\]

Peak reduction, integrated loss, capacitance, and whole-chip energy are four
different observables. A hotspot can determine breakdown or electromigration
while contributing almost nothing to the chip’s energy total.

## 6. Three predictions with different signs

### Curvature-only prediction

Match path length, cross-section, conductor volume, terminal locations, device
netlist, and surroundings. Rounding a severe bottleneck should reduce peak
field/current density. The predicted energy change is small and may be below
measurement resolution in ordinary digital routing.

### Free-form-routing prediction

Allow the route topology to change. A B-spline or all-angle path can cross an
obstacle by a shorter route, remove vias, or avoid a metal layer. Then
resistance, capacitance, and delay may all fall. This is the promising Imec
mechanism. Its causal label is **path/via optimization**, not “curves are
intrinsically slippery.”

### Temporal-cursive prediction

Keep the layout fixed but charge capacitance with a linear voltage ramp over
time \(T\gg RC\). Approximate ramp current is \(I=CV/T\), giving:

\[
E_R=I^2RT
=\frac{RC}{T}CV^2.
\]

As \(T\) increases, ideal resistive dissipation falls, and an energy-recovery
network can return stored charge. Real savings compete with leakage, clock
generation, area, and reduced speed. This mechanism has fabricated-CMOS
evidence, but it is smooth motion through state-space rather than smooth
physical outlines.

## 7. RCCM claim ladder

| Rung | Status |
|---|---|
| Spatial pedagogy: fields, boundaries, reservoirs, routes | Strongly useful |
| Structural analogy: impedance as resistance to permitted flow | Useful |
| Dimensional compatibility of stored energy/pressure-like ledgers | Auditable case by case |
| Maxwell/circuit recovery claimed in the TeX | Formal RCCM proposal |
| Semiconductor transport recovered from RCCM | Not supplied |
| Curvature-to-chip-energy prediction from RCCM | Not supplied |
| Fabricated cursive RCCM thinking chip | Not demonstrated |

The RCCM source makes the hypothesis simpler to **factor**: draw the boundary,
solve the gradient, identify flux, separate storage from loss, and close the
ledger. It does not make the physical claim easier to **assume**.

## 8. The real-world falsification demonstration

### Test vehicle

Fabricate a test chip with many randomized, mirrored copies of four matched
macros on the same die:

1. **M — Manhattan reference:** foundry-standard angular layout.
2. **R — radius-only:** same netlist, terminal positions, wire length,
   conductor volume, spacing, layer/via count, and extracted load, with local
   corners rounded.
3. **F — free-form optimized:** same function and timing target, but the router
   may shorten paths and remove vias/layers using curves.
4. **T — temporal-cursive control:** M’s physical layout driven by an
   adiabatic/ramped supply or clock.

Use two levels:

- replicated passive bend/field coupons and inverter chains to isolate
  \(R,C,L\), leakage, breakdown, and transition energy;
- a small fixed-function compute macro such as a multiply-accumulate array
  with on-chip result checking, to measure energy per correct operation.

Ring oscillators are useful for delay and transition-energy extraction, but
they are not by themselves a “thinking” workload. The compute macro supplies
the correctness denominator.

### Measurements

Across at least 30 dies and a preregistered voltage/frequency/temperature grid:

- supply-energy integral and idle leakage;
- correct operations and timing failures;
- extracted \(R,C,L\), metal length, area, layer/via count;
- local current-density/field proxy structures;
- peak temperature and reliability stress;
- confidence interval for paired \(E_{\mathrm{op}}\) differences.

### Falsification decisions

- Preregister a minimum worthwhile saving \(\delta=1\%\). For
  \(\Delta=(E_R-E_M)/E_M\), if the paired 95% confidence interval lies wholly
  above \(-\delta\), reject the claim that rounding saves at least 1%. If the
  interval lies wholly inside \([-\delta,+\delta]\), establish practical
  equivalence at that process and scale; if it lies above zero, the rounded
  treatment is worse.
- If `F < M` but `R ≈ M`, free-form routing works through shorter paths/fewer
  vias; the naive “smooth flow” story is invalidated.
- If `R < M` only in leakage, high-voltage, or high-current regimes, retain a
  bounded hotspot claim and reject the universal chip claim.
- If `T < M`, temporal smoothing is supported independently of physical
  curvature.
- If any apparent gain disappears after matching correctness and throughput,
  it is invalidated as an energy-efficiency result.

### Present outcome

This experiment has not been run here. The closest located real-world evidence
is Imec’s wafer-printed curvilinear routing, which establishes manufacturability
but not electrical energy, and its design studies, which predict shorter paths
and fewer vias. Therefore a direct fabricated whole-chip invalidation attempt
currently **fails for lack of the decisive matched measurement**, not because
the hypothesis has passed it.

The universal wording is still rejected: ordinary CMOS energy accounting,
scale dependence, real corner experiments, and countervailing length/area/
capacitance effects show that smoothness cannot carry a guaranteed sign.
