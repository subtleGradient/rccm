# Lesson 3 — Capacity sets the diagonals

**Goal:** turn a same-unit pressure budget into exact diagonal entries, and
keep the exhausted endpoint outside the reciprocal-bearing state.[^scope]

[^scope]: This lesson formalizes a restricted nonnegative pressure ledger and
    exact arithmetic. The source mapping is
    [`RCCM-GfX-2.tex`, sections 2–3.1](../../../RCCM-GfX-2.tex#L49);
    the proofs do not establish its physical identifications.

## 1. Place a budget beside the sample

Freeze the same location as before. Beside its component table, place a strip
of equal-sized pressure shares. Some remain available; some are used:

```text
total:       [ remaining ][ remaining ][ remaining ][ used ]
diagonal:         tt = -q           xx = yy = zz = 1/q
```

Three shares remain and one is used. The remaining fraction is `3/4`.
Therefore `tt` holds `-3/4`; each spatial diagonal holds `4/3`.
The minus sign belongs to the temporal entry's rule. It does not mean the
remaining pressure is negative.

Keep total capacity fixed at four shares and move two shares from remaining
to used. Before calculating: does `tt` move toward zero or away from it?
Do the spatial entries increase or decrease?

Now calculate:

| Remaining | Used | `q` | `tt = -q` | Each spatial diagonal |
|---|---|---|---|---|
| 4 | 0 | 1 | -1 | 1 |
| 3 | 1 | 3/4 | -3/4 | 4/3 |
| 1 | 3 | 1/4 | -1/4 | 4 |

Less remaining capacity moves the negative temporal entry **toward zero**
and expands the positive spatial entries.

## 2. Run the ledger

From the repository root:

```sh
bend bend/asymmetric-metric-tensor/lessons/03-capacity.bend
```

Compare the regular example with the table, then inspect the exhausted
example. Predict its acceptance or rejection before running. A successful
run checks execution; your prediction explains the boundary.

The [capacity input](../capacity.bend#L6) is:

```python
type Regular is Data:
  Regular{remaining_predecessor: Nat, used: Nat}
```

`Regular{2n, 1n}` means **three** remaining shares and one used share.
The predecessor field makes remaining capacity `1+p`, never zero.
The [inspection function](../capacity.bend#L10) accepts positive remaining
capacity and returns no regular state for zero remaining. This includes
the all-zero input: it has neither a positive total nor a defined fraction.

Think of this as a validated input type, not a runtime clamp.
There is no floor replacing zero with a tiny positive number.

## 3. Attach units and notation

The source ledger places total pressure `P_c` over the combined remaining
and used shares. In this restricted branch:

$$
q=\frac{\text{remaining}}{\text{remaining}+\text{used}}
  =\frac{P_{\mathrm{static}}}{P_c}=\alpha_s^2,\qquad 0<q\leq1.
$$

The used bucket aggregates the loads; it does not derive them from a velocity
or a Clebsch field. Both buckets count the **same pressure unit**. Pressure
divided by pressure is dimensionless, so `q`, `-q`, and `1/q` are dimensionless.
Supplying speed as though it were a pressure share crosses a type boundary.

`q` abbreviates **squared admittance**, not `alpha_s` itself. For `q=3/4`,
no square root is needed to assemble the diagonals. The separate coupling
`alpha` controls off-diagonal contributions later.

Exact fractions use:

```text
Q = Fraction{positive, negative, denominator_predecessor}
value = (positive - negative) / (1 + denominator_predecessor)
```

All three fields are naturals. For example, `Fraction{3n,0n,3n}` represents
`3/4`. Fractions are noncanonical: `3/4` and `6/8` may have different records.
`R.Same(a,b)` expresses proved cross-multiplication equality of values;
structural `{a == b : Q}` demands equal representations. Do not exchange
those contracts. No floating-point tolerance is involved.

## 4. Read the two conservation marks

Run the accumulating gate:

```sh
bend bend/asymmetric-metric-tensor/PROOF.bend
```

The [capacity contracts](../capacity-laws.bend#L5) pin accepted and rejected
inputs, all three formulas, the numerator's bound by the total, and these
semantic identities for every regular state:

$$
q+\mathrm{used\_fraction}=1,\qquad q\cdot\mathrm{inverse}=1.
$$

Proof idea: write remaining as `r=1+p` and total as `t=r+u`.
The first identity has numerator `r+u=t`. The second multiplies `r/t`
by `t/r`. Both denominators are positive by construction. The arithmetic
proofs reduce these equalities to proved natural-number identities, rather
than assuming field axioms or generalizing from the printed example.

## 5. Push against the rejected edge

```sh
bend bend/asymmetric-metric-tensor/lessons/counterexamples/03-zero-reciprocal.bend
```

This deliberately invalid fixture claims `inspect(0n,4n)` supplies a regular
state. It actually returns `None{}`, not `Some{...}`. That rejected equality
keeps the exhausted endpoint outside the input type accepted by `inverse`.
We never create a fraction with denominator zero or replace it with a floor.
Keep the fixture outside the successful proof gate.

## 6. Return without the checker

1. With two remaining shares and three used, find `q`, `tt`, and `xx`.
2. Why is `Regular{0n,0n}` regular rather than exhausted?
3. Does exchanging `tt`'s row and column change `-3/4`? Does negating it?
4. Start with the actual symmetric pair `(-4,-4)`. Write it down, then
   transpose it, then separately negate the original. Do not substitute
   an opposite-sign pair.
5. Why can two unequal fraction records still satisfy `R.Same`?

Next: [assemble the full sample](04-assembly.md).
