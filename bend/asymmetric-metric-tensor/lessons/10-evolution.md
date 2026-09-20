# Lesson 10 — Unpause a bounded experiment

[Previous: shared faces](09-flux.md) · [Course](../README.md) · [Next: nested budget](11-ledger.md)

## Give the paused cells an existing state

Keep lesson 9's two one-metre-wide cells and frozen face readings `0,−2,0 Pa`.
Place a leading ghost in each cell to mark its **existing y-momentum density**:
left `1`, right `3 kg/(m² s)`. The face imbalance supplies the *change* in
that momentum, not a replacement for what was there.

Unpause for half a second, then stop the clock again:

```text
initial         (1, 3)
gain per second (+2, -2)
half-second     (+1, -1)
new state       (?, ?)
```

**Before running:** fill in the new state and its sum. Now predict four steps.
What if the clock advances by zero seconds in each step?

## Declare the entire small model

| Choice | This lesson |
|---|---|
| State | One signed momentum-density component in each of two cells |
| Geometry | Equal constant cross-section, common positive cell width |
| Face values | Three supplied flux readings, constant for the whole run |
| Feedback | None: momentum does not alter the supplied faces |
| Update | Old momentum plus the supplied boundary impulse per volume |
| Duration | Any nonnegative rational number of seconds |
| Run limit | A finite natural-number count of steps |

This is a frozen-forcing subsystem. It contains no material advection, density
inference, pressure solve, velocity reconstruction, or evolution of `q`, `e`
and `b`. It is the first place to learn the accounting that such a solver
would have to preserve, not a disguised claim to have completed that solver.

## Attach the equation and its units

For each step, with width `h` and duration `Δt`:

$$
m_0^{n+1}=m_0^n+\frac{\Delta t}{h}(F_L-F_M),\qquad
m_1^{n+1}=m_1^n+\frac{\Delta t}{h}(F_M-F_R).
$$

The superscript `n` is a time-step label, **not a power**. A subscript `0` or
`1` selects a cell, not a tensor index.

$$
[\Delta t]\,[F]/[h]
=\mathrm{s}\,\mathrm{Pa}/\mathrm{m}
=\mathrm{kg}/(\mathrm{m}^2\mathrm{s})
=[m].
$$

These are momentum **densities**. Multiply by each cell's common volume
to obtain momenta in `kg m/s`. This is not a velocity update; a density
and momentum-to-velocity closure would be required to make one.

## Run natively

```sh
bend bend/asymmetric-metric-tensor/lessons/10-evolution.bend
bend bend/asymmetric-metric-tensor/PROOF.bend
```

Expected values (printed fractions may be unreduced):

| Run from `(1,3)` | Result | Sum |
|---|---|---|
| Zero steps | `(1,3)` | `4` |
| One half-second step, closed faces | `(2,2)` | `4` |
| Four half-second steps, closed faces | `(5,−1)` | `4` |
| Four zero-time steps | `(1,3)` | `4` |
| One half-second step, open faces `(3,1,0)` | `(2,7/2)` | `11/2` |

Negative signed momentum is allowed. A force can carry a component through
zero and reverse it; it does not create a negative mass.

For these constant supplied rates the arithmetic update equals the exact
integral of that frozen-forcing ODE at step times. That narrow fact is not
convergence evidence for a coupled spatial PDE. There is no CFL condition
for advection here because there is no advection. Fuel bounds the **number
of steps**, not the size of momentum, a wall-clock runtime, or numerical
stability. A tiny step alone cannot supply the missing closure.

## Bend: one owner moves through a finite loop

Read [`State`](../evolution.bend#L11) and [`run`](../evolution.bend#L37):

```python
type State is Type:
  State{left: U.Quantity<U.MomentumDensity{}>, right: U.Quantity<U.MomentumDensity{}>}
```

`is Type` intentionally prevents copying the whole state. `step` consumes the
old state and returns a new one. In the display function we open the state,
reuse its `Data` fields, and rebuild a state to compute the total. We do not
silently make the simulation state itself reusable.

```python
def run(fuel: Nat, +dt: Duration, +width: U.Positive<U.Length{}>, +faces: F.Faces, state: State) -> State:
  match fuel:
    case 0n:
      state
    case 1n+remaining:
      run(remaining, dt, width, faces, step(dt, width, faces, state))
```

The first parameter decreases from `1n+remaining` to its smaller part
`remaining`. Bend checks this termination argument; there is no unbounded
`while` or `@unsafe`. The same duration, geometry and frozen face data may be
reused, so they have `+`. State has one onward path.

This is a pure tail-recursive state transition. IO only prints selected
results. The two cell updates within a step are independent parallel calls;
successive steps depend on the preceding state and cannot run that way.

## What the proof gate establishes

The [evolution contracts](../evolution-laws.bend#L7) fix:

- duration decoding;
- the actual `old + (dt/h)(left−right)` contents of a cell update;
- both cell updates and the actual addition in `total`;
- the **universal one-step boundary identity** below;
- zero-fuel identity and the one-more-step recurrence.

$$
m_0^{n+1}+m_1^{n+1}
=m_0^n+m_1^n+\frac{\Delta t}{h}(F_L-F_R).
$$

[`step_balance`](../evolution-proof.bend#L18) invokes the constructive rational
identity on arbitrary signed starting momenta, all three face values, width
and duration. Neither `total` nor its proof substitutes a cached initial sum.

The root gate checks a universal **single-step** balance and the run recurrence.
It does not contain a separate induction theorem stating the final sum for
every fuel value. Repeated conservation follows mathematically by applying
the single-step identity repeatedly; the native regression runner also checks
multiple finite runs. Keep that scope visible rather than calling example
runs a universal multistep proof.

All of this concerns the exact rational reference. Fractions are unreduced
and grow; mathematical termination does not make large runs cheap or prove
machine overflow bounds. Keep these experiments small.

## Make a false motion rule fail

```sh
bend bend/asymmetric-metric-tensor/lessons/counterexamples/10-zero-time-resets.bend
```

The claim `zero_time_stops_motion` must fail. Zero elapsed time adds no impulse;
it does not discard the initial total momentum of `4`.

For a Bend ownership exercise, try giving `run` a `+state: State` parameter
in a disposable copy. Why does copying permission require `Data`? Why is
making the state affine an API design choice, not a physical conservation law?

## Read the motion source with a new set of questions

Return to the [Condensed motion derivation](../../../RCCM-Condensed.tex#L2273-L2366).
Locate `D v/Dt`, `ρ_eff`, the admittance tensor, and each surface-force
gradient. Now you can ask where each would enter a real time-step function.

The [focused argument](../../../RCCM-GfX-2.tex#L322-L381) introduces
`T^{0i}=c ρ_dyn v^i`, invokes mass continuity, and later writes
`ρ_eff=ρ_tau/α_a`. The Condensed [admittance cancellation](../../../RCCM-Condensed.tex#L2317-L2324)
instead puts `ρ_tau` on the acceleration side and admittance on surface
forces. These statements need a source/closure bridge; spelling alone does
not provide one. We therefore supply momentum and faces explicitly instead
of guessing density from `U`, or equating this state to the raw lower-index
time-space matrix entries.

## Exit exercise and next decision

Reverse every face-flux sign but keep the **same initial state `(1,3)`**.
Predict one half-second update and the total. Do not reverse the starting
momenta unless you deliberately change that separate input.

Then list the missing functions needed for feedback:
`momentum -> velocity`, `velocity/other fields -> pressure and twist`,
`cell fields -> face fluxes`, and boundary rules. Which statement in the
TeX would authorize each one? That dependency map—not an animation—is the
next gate toward a full tau-fluidics simulator.
