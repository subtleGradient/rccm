# Bend tau-fluidics learning lab

## Active direction: learn the asymmetric tensor through laws

The [asymmetric metric tensor course](asymmetric-metric-tensor/README.md)
is the route for programmers learning the mathematics. The tensor
is the central object; pressure capacity is one input to its construction.
Each lesson adds a small piece of shared implementation and explicit laws,
with proofs checked by Bend. The new lesson contracts are AI-drafted for
human review; checked does not mean already approved.

- [Lesson 1 — Find a slot](asymmetric-metric-tensor/lessons/01-slots.md):
  read the component map, predict an address swap, and follow its proofs.
- [Lesson 2 — Mirror or reverse](asymmetric-metric-tensor/lessons/02-pairs.md):
  attach exact signed values, compare symmetry with antisymmetry, and reuse
  a proof to connect transposition with sign reversal.
- [Lesson 3 — Capacity sets the diagonals](asymmetric-metric-tensor/lessons/03-capacity.md):
  turn a same-unit pressure budget into exact `-q` and `1/q`.
- [Lesson 4 — Assemble the full sample](asymmetric-metric-tensor/lessons/04-assembly.md):
  construct the full 4 × 4 tensor under a sixteen-slot contract.
- [Lesson 5 — Ask the tensor a question](asymmetric-metric-tensor/lessons/05-probes.md):
  recover the two parts and prove why a same-vector probe cannot see `A`.
- [Lesson 6 — Move the labels](asymmetric-metric-tensor/lessons/06-coordinates.md):
  trace both indices through a passive spatial cycle.
- [Lesson 7 — Restore pressure units](asymmetric-metric-tensor/lessons/07-stress.md):
  apply the focused stress definition through nominal unit-tagged APIs.
- [Lesson 8 — Walk between samples](asymmetric-metric-tensor/lessons/08-differences.md):
  separate pressure levels, differences and slopes.
- [Lesson 9 — Balance the shared face](asymmetric-metric-tensor/lessons/09-flux.md):
  prove interior cancellation between independent cell gains.
- [Lesson 10 — Unpause](asymmetric-metric-tensor/lessons/10-evolution.md):
  consume affine state through a finite frozen-forcing run.

All ten are implemented. The [next-five plan](asymmetric-metric-tensor/COURSE-6-10.md)
records their learning jobs, Bend techniques and scientific boundaries.

```sh
bend bend/asymmetric-metric-tensor/lessons/01-slots.bend
bend bend/asymmetric-metric-tensor/lessons/02-pairs.bend
bend bend/asymmetric-metric-tensor/lessons/03-capacity.bend
bend bend/asymmetric-metric-tensor/lessons/04-assembly.bend
bend bend/asymmetric-metric-tensor/lessons/05-probes.bend
bend bend/asymmetric-metric-tensor/lessons/06-coordinates.bend
bend bend/asymmetric-metric-tensor/lessons/07-stress.bend
bend bend/asymmetric-metric-tensor/lessons/08-differences.bend
bend bend/asymmetric-metric-tensor/lessons/09-flux.bend
bend bend/asymmetric-metric-tensor/lessons/10-evolution.bend
bend bend/asymmetric-metric-tensor/PROOF.bend
python3 bend/asymmetric-metric-tensor/verify.py --mutations
```

No JavaScript build step is part of the primary learning path. The final command
checks native workflows, independent exact values and intentionally broken
implementations in disposable copies. The frozen-face experiment is not a
closed RCCM velocity/pressure solver.

## Existing warm-up: one pressure budget

This earlier numerical experiment remains runnable. It will inform the
capacity lesson, but its runtime tests are not the tensor proof gate.

Start with **one location in the fluid**, frozen in time. Represent its total
pressure budget by a full bar below. Motion uses part of that bar; static
pressure is the part left over.[^status]

```text
At rest:        [                 static: 100%                 ]
At half speed:  [ dynamic: 25% ][          static: 75%           ]
At the limit:   [                 dynamic: 100%                 ]
```

No mesh, particles, graphics, time stepping, or GPU setup yet. This is one
pure calculation that can later be applied at many locations.

[^status]: This implements a restricted RCCM pressure relation, not an
    independently validated physical model. Tests check the numerical
    translation; they do not establish its physical identifications.

## Run it

Requires **Bend 2** (the language in `bend guide`, not the older Bend language).
Verified directly with Bend **2.0.21**.

From the repository root:

```sh
bend bend/main.bend
```

Expected output:

```text
P_dyn / P_c = 0.25
P_static / P_c = alpha_s_sq = 0.75
```

If `bend` is not on your `PATH`, use `~/.bend/bin/bend` instead.
This IO example runs through Bend's native compiler. Both the example and
regressions now run successfully here; the earlier Xcode licence blocker
was no longer present on the follow-up run. No system settings were changed.

## Change one thing

Open [`main.bend`](main.bend) and change `Pressure.sample(0.5)`.
The input is **speed divided by limiting speed**, not metres per second.

Before running again:

1. Predict the two output fractions for `0.25`.
2. Compare with `0.5`: when speed doubles, does the used fraction double?
3. Try `1.0`, then `1.01`. Where does this sample's allowed domain end?

Answers to check against:

| Speed fraction | Dynamic fraction | Static fraction, `alpha_s_sq` |
|---|---|---|
| `0.0` | `0.0` | `1.0` |
| `0.25` | `0.0625` | `0.9375` |
| `0.5` | `0.25` | `0.75` |
| `1.0` | `1.0` | `0.0` |
| `1.01` | rejected | rejected |

**The invariant:** the two pressure fractions add to one, within floating-point
rounding. Doubling speed multiplies the used fraction by four, while both
speeds remain in the domain.

## Attach the symbols

Let $s = |v|/c$ be the speed fraction. In this restricted sample:

$$
P_c = \tfrac12 \rho_\tau c^2,\qquad
P_{dyn} = \tfrac12 \rho_\tau |v|^2
$$

Dividing cancels the common density and scale:

$$
\frac{P_{dyn}}{P_c} = s^2,\qquad
\alpha_s^2 = \frac{P_{static}}{P_c} = 1-s^2.
$$

Both pressures have dimensions $M L^{-1} T^{-2}$; both ratios are
dimensionless. We do not need to guess a physical density or put the speed
of light into a game engine to inspect these fractions.

`alpha_s_sq` is **squared admittance**, not `alpha_s`. At half speed,
`alpha_s_sq = 0.75`; admittance itself would be $\sqrt{0.75}$.
The sample does not compute that square root or any reciprocal.

## Code and checks

| File | Job |
|---|---|
| [`pressure.bend`](pressure.bend) | `sample`: a speed fraction in, `Some{Budget{used, remaining}}` or `None{}` out |
| [`main.bend`](main.bend) | One editable input and labelled output |
| [`tests.bend`](tests.bend) | Ten runtime regression cases; nonzero exit on failure |

The kernel reuses Bend's `Base` floating-point arithmetic, comparisons and
`Maybe`; there is no new numeric library or engine framework. `+` permits
reuse of a value; the helper exists because Bend matches parameters rather
than computed expressions. Call `sample`, which checks the domain, rather
than its implementation helper.

```sh
bend bend/tests.bend
```

Expected: `PASS: 10 pressure sample cases`.

The cases cover rest, intermediate speeds, exhaustion, negative speed,
over-limit speed, infinity and NaN. Valid cases check the expected split and
the sum with absolute tolerance `0.000001`. Invalid input is rejected, not
silently clamped. `1.0` is accepted only as an exhausted **ledger endpoint**;
that does not make a downstream inverse-admittance calculation safe.

`--check-only` checks types, not these numerical results: `F32` operations are
runtime primitives in this version. No universal pressure-budget law or
GPU parity is claimed.

## Source boundary and next foothold

- [`RCCM-GfX-2.tex`, section 2](../RCCM-GfX-2.tex): specialize the nested
  ledger to **zero macroscopic load, zero shear load, and one translational
  speed**. Then $P_{ambient}=P_c$ and $P_{static}=P_c-P_{dyn}$.
- [`RCCM-Condensed.tex`, “Viscoelastic Phase Stiffening & Time Dilation”](../RCCM-Condensed.tex):
  `eq:admittance_pressure_ratio` gives the same $\alpha_s^2=1-|v|^2/c^2$.
  The glossary sometimes calls the residual ratio `alpha_s`; this code
  follows the explicit **squared** relation, not that shorthand.
- This is not a port of the OpenFOAM sketch or TauLab's evolution model.
  In particular, it does not inherit the OpenFOAM sketch's `0.01` floor.

This experiment now feeds the capacity stage of the
[tensor-first route](asymmetric-metric-tensor/README.md#lesson-sequence).
Before adding multiple locations or motion, learn where this remaining
fraction sits in the tensor: its negative in the time diagonal, its reciprocal
in each spatial diagonal of the focused TeX's local Cartesian matrix.
