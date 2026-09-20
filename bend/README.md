# Bend lab 01: one pressure budget

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
Verified with Bend **2.0.21** and Node **24.1.0**.

From the repository root, the JavaScript route needs no C compiler:

```sh
mkdir -p bend/build
bend bend/main.bend -o bend/build/main.js
node bend/build/main.js
```

Expected output:

```text
P_dyn / P_c = 0.25
P_static / P_c = alpha_s_sq = 0.75
```

If `bend` is not on your `PATH`, use `~/.bend/bin/bend` instead.
With a working native compiler, the shortcut is `bend bend/main.bend`.
Native execution was not verified here: Apple's compiler requested Xcode
licence acceptance. No system settings or licence acceptance were changed.

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
mkdir -p bend/build
bend bend/tests.bend --check-only
bend bend/tests.bend -o bend/build/tests.js
node bend/build/tests.js
```

Expected: `PASS: 10 pressure sample cases`. With a working native compiler,
`bend bend/tests.bend` compiles and runs the same checks.

The cases cover rest, intermediate speeds, exhaustion, negative speed,
over-limit speed, infinity and NaN. Valid cases check the expected split and
the sum with absolute tolerance `0.000001`. Invalid input is rejected, not
silently clamped. `1.0` is accepted only as an exhausted **ledger endpoint**;
that does not make a downstream inverse-admittance calculation safe.

`--check-only` checks types, not these numerical results: `F32` operations are
runtime primitives in this version. No universal pressure-budget law or
native/GPU parity is claimed.

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

The next small step is **two locations with different speeds**: compare the
resulting static pressures. A difference is not yet a force or a time step;
those need distance, pressure scale, and an explicit motion equation.

The direction is:

```text
one sample -> many locations -> spatial differences -> time evolution -> engine integration
     ^
   we are here
```

First milestone: predict the split and explain why the speed is squared.
