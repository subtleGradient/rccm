# Lesson 1 — Find a slot

**Goal:** read an address in the asymmetric tensor, predict its transposed
address, and understand a Bend proof that the address operation does its job.[^scope]
No arithmetic beyond keeping two labels in order is needed.

[^scope]: The proofs in this lesson establish index operations, not RCCM's
    physical identifications. The component map comes from
    [`RCCM-GfX-2.tex`, section 3.3](../../../RCCM-GfX-2.tex#L125).

## 1. Place the object

Freeze **one location** in the fluid. Its tensor has a table of components.
This is not a grid of sixteen fluid locations: all sixteen slots describe
the same sample, in the chosen local Cartesian frame.

```text
                   column
             t       x       y       z
       t    -q      -e_x    -e_y    -e_z
row    x     e_x    1/q     -b_z     b_y
       y     e_y     b_z    1/q     -b_x
       z     e_z    -b_y     b_x    1/q
```

Keep the values visible, but leave their calculation for later:
`q = alpha_s²` is remaining pressure capacity,
`e_i = alpha * v_perp,i / c` abbreviates a slip contribution, and
`b_i = alpha * t_p * Omega_i` abbreviates a twist contribution.
These are the dimensionless aliases used in the
[course map](../README.md#the-object-stays-in-view).

**An address reads row first, column second.** Start at row `t`, then move
across to column `x`: you land on `tx`, where this table contains `-e_x`.
Start at row `x`, then column `t`: you land on `xt`, containing `e_x`.
Different slots; same physical location.

The diagonal consists of `tt`, `xx`, `yy`, `zz`: row and column agree.
The other slots come in pairs across that diagonal.

## 2. Move one address

**Swap the row and column.** This reflects an address across the diagonal:

```text
tx ──swap──> xt ──swap──> tx
```

Before running anything, predict:

| Start | After one swap | After two swaps |
|---|---|---|
| `tx` | ? | ? |
| `xy` | ? | ? |
| `yy` | ? | ? |

Does the swap itself need to negate a number?

## 3. Run the map

From the repository root, with Bend 2 installed:

```sh
bend bend/asymmetric-metric-tensor/lessons/01-slots.bend
```

The demonstration prints the sixteen **addresses**, followed by:

```text
Swap a slot, then swap it again:
tx -> xt -> tx

Only an address changed. No component value was negated.
```

In [`01-slots.bend`](01-slots.bend#L42), replace
`Tensor.Slot{Tensor.T{}, Tensor.X{}}` with the other pairs you predicted.
Run again and compare.

The swap does not negate anything. It only chooses the paired address.
The fact that this particular tensor places opposite values in `tx` and `xt`
is a **relationship between its values**, which lesson 2 will formalize.
Changing an address and negating a component are distinct operations.

## 4. Export the map into types and symbols

For a TypeScript-shaped mental model:

```ts
type Axis = "t" | "x" | "y" | "z";
type Slot = { row: Axis; column: Axis };
```

In [`tensor.bend`](../tensor.bend#L5), those are finite, copyable datatypes:

```python
type Axis is Data:
  T{}
  X{}
  Y{}
  Z{}

type Slot is Data:
  Slot{row: Axis, column: Axis}
```

There is no pressure, speed, or scalar value inside `Slot`—only two labels.
`T{}` names the temporal axis; it is not a duration in seconds. This layer
is categorical addressing, so there is no physical-unit arithmetic yet.

The Greek indices in $\hat U_{\mu\nu}$ are placeholders for these axes:
$\mu$ selects the row and $\nu$ the column. In this frame, $\hat U_{tx}$
means “the component at row `t`, column `x`”; the TeX also calls the temporal
index `0`. Transposition reads $(U^T)_{\mu\nu}=U_{\nu\mu}$.
Our operation supplies that swapped address; it does not yet transpose a
stored matrix or perform a coordinate transformation.

The implementation is one constructor case:

```python
def swap(s: Slot) -> Slot:
  match s:
    case Slot{r, c}:
      Slot{c, r}
```

The display code's `+s` permits reusing a copyable value to print several
stages. The actual `swap` consumes its input once and returns a new address.

## 5. Read the contract

[`LAWS.bend`](../LAWS.bend#L8) states three requirements:

| Law | For every input slot… |
|---|---|
| `swap_row` | The new row equals the old column |
| `swap_column` | The new column equals the old row |
| `swap_twice` | Swapping twice returns the original slot |

Here is the first, exactly as Bend reads it:

```python
law swap_row:
  for s: Tensor.Slot
  {Tensor.row(Tensor.swap(s)) == Tensor.column(s) : Tensor.Axis}
```

Read `for s` as **every slot**, not one selected example.
The expression in braces is an equality proposition between two `Axis`
values. It is a type demanding evidence, not a runtime Boolean assertion.
The contract references the actual exported operation.

The initial laws spell out the agreed lesson plan. Future changes to this
file are specification changes for human review—not a way for the
implementation agent to make a difficult proof disappear.

## 6. Follow one proof

Run the package's proof gate:

```sh
bend bend/asymmetric-metric-tensor/PROOF.bend
```

Expected: `All terms check.`

[`PROOF.bend`](../PROOF.bend#L5) imports the laws and supplies this proof:

```python
def Laws.swap_row(s):
  match s:
    case Tensor.Slot{r, c}:
      {==}
```

Unpack an arbitrary slot as `Slot{r, c}`. Then follow both sides:

```text
left:  row(swap(Slot{r,c})) -> row(Slot{c,r}) -> c
right: column(Slot{r,c})                    -> c
```

Both compute to the same thing. `{==}` supplies **reflexivity**: a value
equals itself. It is not an instruction to trust the author; Bend checks
that the two sides actually reduce to matching terms.

There is only one `Slot` constructor. Its fields `r` and `c` remain arbitrary,
so this one case covers all sixteen combinations without listing sixteen
tests. The other two proofs use the same method. In particular:

```text
swap(swap(Slot{r,c})) -> swap(Slot{c,r}) -> Slot{r,c}
```

## 7. Break a weak specification

Suppose we had required **only** “do it twice and return to the start.”
Would that force a real swap?

[`01-noop.bend`](01-noop.bend#L6) contains this candidate:

```python
def no_swap(s: Tensor.Slot) -> Tensor.Slot:
  s
```

It does nothing. Yet it has a valid universal proof of
`no_swap(no_swap(s)) == s`. Check it:

```sh
bend bend/asymmetric-metric-tensor/lessons/01-noop.bend
```

Expected: `All terms check.` The proof is correct; the requirement is weak.

Now test the required row at `tx`. A true swap gives row `x`; the no-op
still gives row `t`. The separate, deliberately invalid
[counterexample file](counterexamples/01-noop-row.bend#L8) tries to prove that
those are equal:

```sh
bend bend/asymmetric-metric-tensor/lessons/counterexamples/01-noop-row.bend
```

**Expected rejection, with a nonzero exit code.** Bend reports a mismatch
between `T{}` and `X{}` at `wrong_row`. This file is a teaching fixture,
excluded from the successful package proof gate. Do not “fix” it by changing
the expected axis to `T`: that would abandon the row-swap requirement.

No edit to the real implementation or approved laws is needed for this
exercise. The fixture demonstrates a concrete failure of the row condition;
the production proof gate establishes the three universal contracts for
the real implementation.

**The mark to keep:** a proof can be correct while its specification is too
weak. State where the row and column must go, not just that a journey returns.

## 8. Return without the checker

1. Trace `zt` through one swap and then another.
2. Which four addresses never move under a swap? What makes them special?
3. Why does `swap_twice` alone fail to exclude the no-op?
4. In the component map, `xy` and `yx` hold opposite twist contributions.
   Does our `swap` create that sign relation, or does it only exchange the
   address labels?

If you can answer and explain these, move on. If one catches, revisit only
that section. Next: **mirror or reverse**—attach signed values to these
paired slots and prove what symmetry and antisymmetry require.
