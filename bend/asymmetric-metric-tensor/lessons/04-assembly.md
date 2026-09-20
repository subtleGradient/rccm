# Lesson 4 — Assemble the full sample

**Goal:** place capacity, slip, and twist into all sixteen addresses, then
distinguish the assembled object from either of its two parts.[^scope]

[^scope]: This lesson specifies the local Cartesian algebra in
    [`RCCM-GfX-2.tex`, section 3.3](../../../RCCM-GfX-2.tex#L125).
    Supplied capacity and slip/twist contributions are algebraic inputs;
    their assembly does not prove physical field realizability or closure.

## 1. Keep the whole table visible

One location, four row labels, four column labels. Lay down two transparent
tables: capacity on the diagonal, paired contributions off it.

```text
               symmetric S                  antisymmetric A
           t     x     y     z             t     x     y     z
      t   -q     0     0     0        t    0    -ex   -ey   -ez
      x    0    1/q    0     0        x    ex    0    -bz    by
      y    0     0    1/q    0        y    ey    bz    0    -bx
      z    0     0     0    1/q       z    ez   -by    bx    0
```

Add entries **at the same address** to obtain `U=S+A`.
This is not matrix multiplication, and not sixteen neighbouring locations.

Use the capacity from lesson 3: three remaining shares, one used.
Supply `ex=1/2`, `bz=1/3`, and zero for the other four contributions.

Before running, fill `tt`, `xx`, `tx`, `xt`, `xy`, and `yx`.
Then reverse only `bz`. Which two addresses change? Which diagonals move?

## 2. Run the assembled example

```sh
bend bend/asymmetric-metric-tensor/lessons/04-assembly.bend
```

Read the sixteen exact entries as this table of rational values:

```text
          t       x       y       z
    t    -3/4    -1/2      0       0
    x     1/2     4/3    -1/3      0
    y      0      1/3     4/3      0
    z      0       0       0      4/3
```

Exact records need not print in reduced-fraction form. Compare their values,
not merely their representation.

Changing `bz` to `-1/3` swaps the signs at `xy` and `yx`, leaving the
diagonals untouched. Here capacity is a supplied input, so changing a
supplied twist does not automatically recompute a pressure ledger.

## 3. Lock the starting state before moving it

Keep display order `(tx,xt)` fixed. There are three different starting pairs:

| Object | Original pair | After transposition | After negating original |
|---|---|---|---|
| Generic symmetric comparison | `(-4,-4)` | `(-4,-4)` | `(+4,+4)` |
| This sample's `S` | `(0,0)` | `(0,0)` | `(0,0)` |
| This sample's `A` | `(-1/2,+1/2)` | `(+1/2,-1/2)` | `(+1/2,-1/2)` |

The first row is deliberately **not** the generated `S` off-diagonal.
It tests whether you follow the given state rather than replace it with a
familiar antisymmetric example.

Transpose exchanges addresses. Negation changes values in place.
Their results agree on `A`, not on every matrix. In particular, transposing
the full `U` leaves `tt=-3/4`; negating `U` makes that entry `+3/4`.

## 4. Export the assembly into records

The [matrix records](../matrix.bend#L6) store four named rows, each with four
exact rational entries. The [sample record](../matrix.bend#L12) stores a
validated capacity and six signed contributions. The [slot reader](../matrix.bend#L40)
selects a row, then a column: `at(slot,matrix)`.

The seven effective scalar values have different jobs:

| Input | Meaning in the source map | Units after normalization |
|---|---|---|
| `q = alpha_s²` | remaining pressure / total pressure | dimensionless |
| `e_i = alpha * v_perp,i / c` | slip contribution | dimensionless |
| `b_i = alpha * t_p * Omega_i` | twist contribution | dimensionless |

Velocity divided by velocity and time multiplied by inverse time both
lose their units. `alpha` is a dimensionless coupling, not `alpha_s`.
These aliases are not SI electric and magnetic field values.

The implementation accepts the contributions already normalized. It places
them; it does not construct the underlying velocity or vorticity fields.

## 5. Read the universal contract

```sh
bend bend/asymmetric-metric-tensor/PROOF.bend
```

The assembly contract independently pins every slot, then establishes:

$$
S^T=S,\qquad A^T=-A,\qquad U_{ij}=S_{ij}+A_{ij}.
$$

The equalities of rational values use semantic equality where arithmetic
can change the fraction representation. They are not promises that every
equivalent expression produces the same record.

Proof idea: split on the row and column labels. Diagonal cases read the
capacity formulas; off-diagonal cases read the designated signed input.
Double negation handles the reversed pairs. Rational zero/addition facts
connect the two separate tables to the assembled entries.

The unloaded input also produces `diag(-1,1,1,1)`: no used pressure,
no slip, no twist. This anchors the baseline but cannot alone test the
nonzero pair signs.

## 6. Reject a convincing wrong table

```sh
bend bend/asymmetric-metric-tensor/lessons/counterexamples/04-wrong-twist.bend
```

The intended rejected claim puts a wrong twist sign into a specified slot.
For `bz=1/3`, `xy` must hold `-1/3`, not `+1/3`.
Reversing both members would still make an antisymmetric pair, but would
violate the independent source-slot contract. That is why symmetry alone
is too weak a specification. No diagnostic wording is assumed here.

## 7. Return to the same sample

1. Starting from the printed table, list all changed entries under transpose.
2. Why is the full `U` neither symmetric nor antisymmetric in this example?
3. Set only `by` nonzero. Which two slots receive it, with which signs?
4. Can a zero-twist run expose a wrong twist sign?
5. Which missing rule would connect a changed physical twist to a changed
   capacity rather than treating both as supplied inputs?

Next: [ask the tensor a question](05-probes.md).
