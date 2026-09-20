# Lesson 6 — Move the labels, not the field

**Goal:** follow a reading to its new address when both tensor indices change.[^scope]

[^scope]: We check exact relabeling algebra, not physical validation of RCCM
    or full Lorentz covariance. The new contracts are AI-drafted for human
    review, not already approved.

## 1. Keep the room still

Stand in a paused room with a stationary supplied field. Imagine a shoulder–hip
couple marking its twist: the cue's input is the supplied antisymmetric
component, not a new force calculation. Your body, the field, and the clock
stay fixed. Only the transparent coordinate labels change. No material object
rotates, and no event advances.

Use the [shared sample](example.bend#L8): `q=3/4`, `ex=1/2`, `bz=1/3`,
the other supplied contributions zero. All table entries are dimensionless.
The labels on **both** table edges change by:

| New label | Old direction it names |
|---|---|
| t | t |
| x | y |
| y | z |
| z | x |

This is a **new-to-old** lookup. It preserves handedness: a spatial three-cycle
is two swaps, so its determinant is `+1`. It is not a reflection.

The full starting table and its new addresses are visible here:

```text
old U     t      x      y      z       new U'    t      x      y      z
t       -3/4   -1/2     0      0       t       -3/4     0      0    -1/2
x        1/2    4/3   -1/3     0       x         0     4/3     0     1/3
y         0     1/3    4/3     0       y         0      0     4/3     0
z         0      0      0     4/3      z        1/2   -1/3     0     4/3
```

Before running: cover the new table. Old `xy` contains `-1/3`.
Which new row names old `x`? Which new column names old `y`?
Predict the new address and its sign. Does the unchanged address `xy`
still ask the same physical question?

## 2. Run the address change

From the repository root:

```sh
bend bend/asymmetric-metric-tensor/lessons/06-coordinates.bend
```

This IO entry point runs natively. Expected output:

```text
Same field, new labels: (t,x,y,z) -> old (t,y,z,x)
old xy = -1/3
new zx = -1/3
new xy = 0
old tx = -1/2
new tz = -1/2
old tt = -3/4
new tt = -3/4
```

The mark is **old `xy` -> new `zx`**. The value did not change sign;
the address moved. Time stays time, but time–space addresses still change
their spatial label.

## 3. Export the map

Let `p` be the new-to-old lookup above. Then

$$U'_{ij}=U_{p(i),p(j)}.$$

With `J`'s columns equal to the new basis vectors expressed in the old basis,
`J_ai = 1` exactly when `a=p(i)`, and otherwise zero:

$$U'=J^T U J.$$

This is the permutation specialization of the two-covariant-index rule.
Both index sums select one old address. Entries and permutation weights are
dimensionless, so the type/dimension of the reading is unchanged.

The [implementation](../coordinates.bend#L6) has only two public operations:
`old_axis` and `cycle`. `cycle` accepts **any stored matrix**, not just
matrices built by the sample recipe. Its pattern opens all sixteen fields;
the constructor places each exactly once in its new slot. No arithmetic,
normalization, sample reconstruction or `b`-vector transformation is hidden.
In particular this is not a prescription for treating axial vorticity as a
polar vector under reflections.

For a TypeScript reader, `match` is exhaustive discriminated-union dispatch,
and `M.Matrix{...}` constructs an immutable record. In the
[demo](06-coordinates.bend#L8), `+old` and `+new` allow reuse of `Data`
values; `+` there means permission to copy, not addition or positive sign.
Pattern matching the matrix reveals its fields to both runtime and checker.
The permutation is only wiring, so introducing fork/join tasks would add
overhead without independent arithmetic to parallelize.

Keep three operations separate:

| Operation | What changes? |
|---|---|
| Transpose | Swap the two addresses: `U_ij -> U_ji`, in the same basis |
| Index raising | Contract with an inverse metric; index variance changes, potentially including signs and scale |
| Passive frame change | Keep the physical object; change the basis labels on **both** slots |

An observer boost also mixes time and space. This lesson implements no boost.
The `T` in `J^T` is ordinary transpose, not an index-raising instruction.

## 4. Check and walk one proof

```sh
bend bend/asymmetric-metric-tensor/coordinates-proof.bend
bend bend/asymmetric-metric-tensor/PROOF.bend
```

The standalone [contracts](../coordinates-laws.bend#L7) independently pin all
four axis mappings, then require the component rule for every matrix and every
pair of axes, return after three cycles, and preservation of symmetric and
antisymmetric structure. The root gate imports these contracts and proofs
alongside the preceding lessons.

Follow [the component proof](../coordinates-proof.bend#L16) at `row=Z`,
`column=X`:

1. Open an arbitrary matrix, leaving `xy` an arbitrary exact rational value.
2. The new matrix's `zx` field reduces to the original variable `xy`.
3. Independently, `p(Z)=X` and `p(X)=Y`, so the contract's right side
   reads the original `xy` field.
4. `{==}` closes the goal because both sides reduce to the **same variable**.

All sixteen axis cases are checked; no finite list of numerical samples
stands in for the universal matrix parameter.

The [structure proofs](../coordinates-proof.bend#L68) reuse the checked fact
`transpose(cycle(U)) = cycle(transpose(U))`. If `transpose(U)=U`, applying
`cycle` to both sides finishes symmetric preservation. If
`transpose(U)=negate(U)`, use the additional checked commutation with
negation. `Equal.cong` transports a supplied equality through `cycle`;
`Equal.trans` joins equality steps. These are implications with explicit
proof inputs, not assumed axioms that arbitrary matrices are symmetric.
Exact stored values are only rearranged, so structural equality is enough;
there is no numerical tolerance.

## 5. Break just one index

```sh
bend bend/asymmetric-metric-tensor/lessons/counterexamples/06-one-index.bend
```

The [candidate](counterexamples/06-one-index.bend#L9) is valid Bend code:
it reads `U[p(row),column]`. Its false law claims that this suffices at new
`zx`. It instead reads old `xx=4/3`; the correct result is old `xy=-1/3`.
The command must fail at `one_index_is_enough`, with expected
`Fraction{4n,0n,2n}` versus observed `Fraction{0n,1n,2n}`.
The `2n` denominator predecessor means denominator three.
This is an equality diagnostic, not a syntax/type error in the candidate.

## 6. Source and return

The focused source's [section 3 decomposition](../../../RCCM-GfX-2.tex#L88)
and [Cartesian matrix](../../../RCCM-GfX-2.tex#L125) supply the sample's
component meaning. The broader [Rosetta-stone metric](../../../RCCM-Condensed.tex#L3637)
uses a different, symmetric spherical presentation. Do not import its
`r²` or angular factors into this Cartesian relabeling. The present
permutation exercise is a bounded mathematical extension of the stored
component contract, not a proof of the sources' physical identifications.

**Math exercise:** write the `4 × 4` matrix `J` in order `(t,x,y,z)`.
Multiply only the selectors needed to find `(J^T U J)_zx`. Then show that
`J³=I` by following each basis label rather than doing sixteen sums.

**Next return probe:** leave the same field fixed and cycle labels a second
time. Where does the original `xy=-1/3` reading now live? Track both indices
before checking with another call to `cycle`.
