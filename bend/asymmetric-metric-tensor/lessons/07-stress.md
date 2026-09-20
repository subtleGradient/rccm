# Lesson 7 — Give the changed reading a pressure scale

**Goal:** subtract a reference table, then attach a pressure scale to every
remaining component. This lesson introduces the unit boundary.

[Previous: coordinate labels](06-coordinates.md) · [Course](../README.md)

## 1. Place the body and its reference

Imagine your body immersed in fluid. Pressure acts over the whole boundary:
equal inward pushes feel like an all-over squeeze, not a single downward pull.
That cue's input is **physical pressure**, not the capacity fraction `q`.
Give `q` a separate capacity gauge: three of four shares remain. Give `1/q`
a separate spatial-weight gauge. Neither gauge is itself a skin pressure.

Now lay two component tables beside the body. One is the reference reading,
`eta = diag(-1,1,1,1)`; the other is the changed reading `U`. At each address,
subtract the reference before turning the difference into pressure units.
The tables are local component records, not sixteen patches of skin.
This lesson does not yet integrate boundary traction or predict acceleration.

## 2. Source and model boundary

Read [the focused field definition](../../../RCCM-GfX-2.tex#L147-L170)
first, then compare the [Condensed Rosetta section](../../../RCCM-Condensed.tex#L3642-L3745)
and [motion section](../../../RCCM-Condensed.tex#L2273-L2366).
We implement the focused definition `T_hat = Pc (U_hat - eta)`.
The broader Condensed instead writes `T = sigma + rho u u` at
[its stress-energy bridge](../../../RCCM-Condensed.tex#L3730-L3738);
these are not automatically identical. `U_hat` is not an ordinary symmetric
metric `g`, and this raw four-dimensional asymmetric table is not automatically
ordinary three-dimensional Cauchy stress. The formal checks below establish
algebra and API contracts, not those physical identifications. Keep the source
comparison as an explicit bridge to investigate, not a silent substitution.

## 3. Follow one address at a time

All indices below remain **lower indices**, in Cartesian `t,x,y,z` order:

$$
\hat T_{\mu\nu}=P_c(\hat U_{\mu\nu}-\eta_{\mu\nu}).
$$

For the assembled regular sample, the raw table is:

```text
             t              x               y               z
t       Pc(1-q)          -Pc ex           -Pc ey           -Pc ez
x        Pc ex          Pc(1/q-1)         -Pc bz            Pc by
y        Pc ey            Pc bz          Pc(1/q-1)         -Pc bx
z        Pc ez           -Pc by            Pc bx          Pc(1/q-1)
```

No raised time-space identities are inferred here. Transposing addresses is
still different from raising an index.

Return to lesson 4: `q=3/4`, `ex=1/2`, `bz=1/3`; other contributions vanish.
Set `Pc=12 Pa`.

| Address | Changed reading | Reference | Difference | Scaled result |
|---|---:|---:|---:|---:|
| `tt` | `-3/4` | `-1` | `1/4` | `3 Pa` |
| `xx`, `yy`, `zz` | `4/3` | `1` | `1/3` | `4 Pa` |
| `tx` | `-1/2` | `0` | `-1/2` | `-6 Pa` |
| `xy` | `-1/3` | `0` | `-1/3` | `-4 Pa` |

At the reference table itself, every difference is zero for **every**
positive pressure scale. Keep the changed table fixed and double only `Pc`:
predict the four displayed results before running anything.

## 4. Export the pressure boundary into Bend

The [public component function](../stress.bend#L18) takes
`U.Positive<U.Pressure{}>` and returns `U.Quantity<U.Pressure{}>`.
Inside it, the exact rational calculation is pressure times a dimensionless
difference. Thus `[T] = [Pc] = Pa = N/m²`; the component is not force density
`N/m³`. A later spatial derivative needs its own length scale.

The [unit records](../units.bend#L13) use `-unit`: the tag is erased from
native execution, but the checker retains it. Think of a TypeScript nominal
brand with a constructor domain, not a runtime string attached to each value.
`Positive{n,d}` represents `(1+n)/(1+d)`, so every constructible scale is
strictly positive. `Positive{11n,0n}` is `12`, not `11`.
`Quantity.Measure` can contain a signed rational: a positive scale does not
force all components positive.

Erasure does not permit passing a length as pressure. Equally, the tag cannot
certify a real instrument's calibration or prevent a caller deliberately
labelling an arbitrary numeric reading as pressure.

## 5. Run the native example

From the repository root:

```sh
bend bend/asymmetric-metric-tensor/lessons/07-stress.bend
```

For an explicit native binary, choose an output path in the workspace:

```sh
mkdir -p bend/build
bend bend/asymmetric-metric-tensor/lessons/07-stress.bend -o bend/build/stress-demo
./bend/build/stress-demo
```

Expected output:

```text
q=3/4, Pc=12 Pa; raw lower-index readings:
T_tt = 12/4 Pa
T_xx = 12/3 Pa
T_tx = -12/2 Pa
T_xy = -12/3 Pa
```

These are deliberately **unreduced fractions**: `12/4=3`, `12/3=4`,
`-12/2=-6`, and `-12/3=-4`. The formatter subtracts the positive and negative
numerator parts; it does not reduce by a greatest common divisor.
The [demo](07-stress.bend#L12) evaluates independent readings in parallel pairs.

## 6. Read each law beside its proof

```sh
bend bend/asymmetric-metric-tensor/stress-proof.bend
bend bend/asymmetric-metric-tensor/units-proof.bend
bend bend/asymmetric-metric-tensor/PROOF.bend
```

Each should report `All terms check.` The root gate imports both the units
and stress contracts and their proofs.

The new [laws](../stress-laws.bend#L9) are **AI-drafted for human review**:

| Law | Quantified scope | Why the proof closes |
|---|---|---|
| `eta_table` | Complete explicit reference | The stored entries reduce to the independently written table |
| `content` | Any positive pressure, any matrix, any slot | Expand the component implementation against the explicit reference |
| `baseline_zero` | Any positive pressure and slot | A value minus itself has equal signed numerators; multiplication preserves zero |
| `temporal` | Any regular capacity and six signed inputs | Rearrange `(-q)-(-1)` to `1-q`, then preserve equality through scaling |
| `spatial` | Any of three spatial diagonals, regular capacity, and six signed inputs | Select the diagonal `1/q`, subtract `1`, scale |

The [proof helper](../stress-proof.bend#L32) for temporal rearrangement uses
natural-number addition commutativity and denominator-product commutativity.
It proves record equality here; it does not assume a normalization oracle.
`baseline_zero` instead uses `R.IsZero`: equal positive and negative numerator
parts denote zero even when the record is not literally `R.zero()`.
The fixed example is a readable witness, not a substitute for these universal
contracts. `content` also covers matrices not produced by the sample assembler.

## 7. Make the wrong unit hit the API boundary

```sh
bend bend/asymmetric-metric-tensor/lessons/counterexamples/07-wrong-units.bend
```

Expected failure: `S.component` expects `U.Positive<U.Pressure{}>` but receives
`U.Positive<U.Length{}>`. The file parses and imports successfully; it fails
at that call, not because of a missing module. Do not “fix” the exercise by
discarding the tag and relabelling the numeric value.

## 8. Exercises and return probe

1. Explain why the temporal subtraction adds `1`, while a spatial diagonal
   subtraction removes `1`.
2. Keep `Pc=12 Pa` and move capacity to `q=1/2`. Calculate both diagonal
   readings. Why do they not increase by the same factor?
3. Keep `q` fixed and reverse `bz`. Locate the two changed stress addresses;
   explain why neither diagonal moves in this supplied-input model.
4. Which additional definitions would be needed to identify this focused
   table with the Condensed `sigma + rho u u` decomposition?
5. Why does a pressure reading alone not determine the body's acceleration?

**Return probe:** freeze `q`, `ex`, and `bz`; change only `Pc` from `12 Pa`
to `24 Pa`. Predict `Ttt`, `Txx`, `Ttx`, and `Txy`, then identify which
dimensionless gauges stayed still while the pressure readings changed.

[Continue to lesson 8: spatial differences](08-differences.md).
