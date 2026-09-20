# Lesson 2 — Mirror or reverse

**Goal:** attach signed values to paired slots, distinguish symmetry from
antisymmetry, and prove their different responses to transposition.[^scope]

[^scope]: This lesson proves exact sign and pair identities, not RCCM's
    physical identifications. The slot signs follow
    [`RCCM-GfX-2.tex`, section 3.3](../../../RCCM-GfX-2.tex#L125).
    The small integer examples exercise sign structure; they are not complete,
    physically admissible fluid states. Capacity and full assembly come later.

## 1. Return to the same sample

Lesson 1 moved an **address** across the diagonal. Now inspect what the
paired addresses contain. The full component map remains:

```text
          t       x       y       z
    t    -q      -e_x    -e_y    -e_z
    x     e_x    1/q     -b_z     b_y
    y     e_y     b_z    1/q     -b_x
    z     e_z    -b_y     b_x    1/q
```

Focus on `tx` and `xt`:

```text
address:       tx                 xt
value:        -e_x               +e_x
```

The two slots belong to one sample. `e_x = alpha * v_perp,x / c` is the
dimensionless slip contribution, not a velocity in metres per second.
`b_i = alpha * t_p * Omega_i` abbreviates the dimensionless twist contribution.
The pressure capacity `q` still controls the diagonal; we leave its calculation
for lesson 3.

Fix the **display order** as `(tx, xt)`. If the algebraic input `e_x` is `+3`,
the values in that order are `(-3, +3)`. If `e_x` changes to `-3`, the same
addresses contain `(+3, -3)`.

An asymmetric tensor need not be wholly antisymmetric. Here it has a
symmetric part `S` and an antisymmetric part `A`. We are learning the paired
entry rules that the later assembler will use.

## 2. Two different pair rules

Given a value `v` at a chosen off-diagonal address:

```text
symmetric:       (v,  v)       mirror the value
antisymmetric:   (v, -v)       reverse the sign across the diagonal
```

These are **value relations**, not instructions for moving an object through
space. A nonzero symmetric pair such as `(+3, +3)` is a generic comparison:
in the focused local matrix above, `S` actually has zero off-diagonal entries.

The `antisymmetric_pair` function takes the value for its **first slot**.
For `(tx, xt)` that input is `-e_x`, not `e_x`. Nor are all upper entries
negative: the `(xz, zx)` pair is `(b_y, -b_y)`.

Before running, predict both operations:

| Pair | Exchange the two entries | Negate both entries |
|---|---|---|
| `(+3, +3)` | ? | ? |
| `(-3, +3)` | ? | ? |
| `(0, 0)` | ? | ? |

Which pairs give the same answer under these two operations?

## 3. Run, then change one input

From the repository root:

```sh
bend bend/asymmetric-metric-tensor/lessons/02-pairs.bend
```

The main comparison is:

```text
Generic symmetric pair -> transpose:
(+3, +3) -> (+3, +3)

Source pair order: (tx, xt); e_x = +3
Original:          (-3, +3)
Transpose pair:    (+3, -3)
Negate both:       (+3, -3)
Reverse e_x:       (+3, -3)
```

In [`02-pairs.bend`](02-pairs.bend#L37), change the input in `main`:

| Input expression | Meaning |
|---|---|
| `Exact.from_nat(3n)` | `+3` |
| `Exact.negate(Exact.from_nat(3n))` | `-3` |
| `Exact.from_nat(0n)` | `0` |

Predict each output first. In particular, would an all-zero example let you
tell a copying bug from a correct antisymmetric constructor?

The display order remains fixed. “Transpose pair” swaps which value occupies
each position in that order; “negate both” reverses signs without exchanging
positions. Those different operations happen to agree on an antisymmetric pair.

## 4. Exact signs, without a numeric framework

[`exact.bend`](../exact.bend#L6) introduces only a signed-integer datatype,
conversion from `Nat`, and negation. It reuses Bend's natural numbers:

```python
type Signed is Data:
  Zero{}
  Positive{predecessor: Nat}
  Negative{predecessor: Nat}
```

`Positive{p}` means `+(1+p)` and `Negative{p}` means `-(1+p)`.
For example, `Positive{2n}` represents `+3`; `from_nat(3n)` constructs it
for you. This choice ensures there is **one zero**, not competing `+0` and
`-0` representations.

Negation preserves magnitude and crosses the sign boundary:

```text
Zero{}       -> Zero{}
Positive{p}  -> Negative{p}
Negative{p}  -> Positive{p}
```

No floating-point comparisons, tolerance, addition or division are involved.
We will introduce fractions when the diagonal's `1/q` needs them.

[`ComponentPair`](../tensor.bend#L33) is a record of two such values:

```python
type ComponentPair is Data:
  ComponentPair{here: Exact.Signed, across: Exact.Signed}
```

This is a generic value container, not a type claiming every pair is
antisymmetric. The guarantees attach to the constructor functions:

```python
def symmetric_pair(+value: Exact.Signed) -> ComponentPair:
  ComponentPair{value, value}

def antisymmetric_pair(+value: Exact.Signed) -> ComponentPair:
  ComponentPair{value, Exact.negate(value)}
```

The `+` permits using the copyable input twice. The record stores values,
not slot addresses; the demo assigns the `(tx, xt)` interpretation explicitly.
Binding all six off-diagonal pairs to their correct axes is the later
assembler's job, not something this pair datatype already guarantees.

## 5. Attach the conventional notation

Write transposition as a superscript `T` and whole-value negation as `-`.
Here a pair abbreviates two mirrored matrix entries, not a two-entry row
vector: `T` exchanges those slots. For these building blocks of the later matrix:

$$
S=(v,v)\quad\Longrightarrow\quad S^T=S
$$

$$
A=(v,-v)\quad\Longrightarrow\quad A^T=-A.
$$

These are not the same equation. A symmetric pair survives the exchange
unchanged. An antisymmetric pair becomes its own **whole-pair negative**.

At zero, both rules hold. On a matrix diagonal, exchanging indices visits
the same slot, so an antisymmetric diagonal value must equal its own negative.
Our three-case sign map shows only zero has that property. A full-matrix
diagonal contract will belong to the assembly lesson; a pair of distinct
off-diagonal values should not be attached twice to one diagonal address.

## 6. Read the contracts and follow the proof

Run the same accumulating package gate:

```sh
bend bend/asymmetric-metric-tensor/PROOF.bend
```

Expected: `All terms check.` The three lesson-1 laws remain unchanged.
Lesson 2 adds twelve laws in [`LAWS.bend`](../LAWS.bend#L27):

| Contract group | What it pins down |
|---|---|
| Natural-number conversion | Zero stays zero; `1+p` becomes `Positive{p}` |
| Sign meaning | Zero, positive and negative inputs each get the specified output |
| Double negation | Negating twice restores every signed value |
| Pair contents | Preserve the supplied first value; copy or negate it into the second |
| Pair operations | Transposition exchanges entries; negation reverses both signs |
| Structural invariants | Symmetric pairs satisfy `Sᵀ = S`; antisymmetric pairs satisfy `Aᵀ = -A` |

The explicit content laws matter. Merely returning `(0,0)` would satisfy both
structural invariants while discarding the input. Likewise, doing nothing
would satisfy double negation without being negation.

### First prove the reusable fact

`negate_twice` uses three constructor cases: zero, positive, negative.
Each returns `{==}` because two sign reversals compute back to the input.
The magnitude `p` remains arbitrary; this is not a test of just `3`.

### Then use it in a larger proof

For any signed value `v`:

```text
transpose(antisymmetric_pair(v))  -> (-v, v)
negate(antisymmetric_pair(v))     -> (-v, -(-v))
```

The first entries match immediately. The second entries match by the fact
we just proved: `-(-v) = v`.

The [Bend proof](../PROOF.bend#L64) reuses that fact with `%`:

```python
def Laws.antisymmetric_transpose(value):
  %Laws.negate_twice(value) : {
    Tensor.ComponentPair{Exact.negate(value), _}
    == Tensor.negate_pair(Tensor.antisymmetric_pair(value)) : Tensor.ComponentPair
  }
  {==}
```

`_` marks the occurrence being rewritten. Here Bend uses the proved equality
to expand the left pair's second entry from `value` to
`negate(negate(value))`; both sides then compute to the same pair.
`{==}` finishes by reflexivity. This is the first proof that **reuses another
proof**, rather than only opening a constructor.

## 7. Let the checker reject the wrong rule

The deliberate [copying counterexample](counterexamples/02-copy-rejected.bend#L8)
tries to claim that copying `+3` produces the required pair `(+3,-3)`:

```sh
bend bend/asymmetric-metric-tensor/lessons/counterexamples/02-copy-rejected.bend
```

**Expected rejection, with a nonzero exit code.** The mismatch is in the
second entry: `Positive{2n}` versus `Negative{2n}`. This fixture is intentionally
invalid and is never imported by `PROOF.bend`.

Using zero would hide this particular bug: copying zero and negating zero
both produce `(0,0)`. The universal constructor laws are not fooled by a
fortunate example.

## 8. Return to the tensor

1. In the source map, `(xy,yx)=(-b_z,+b_z)`. Reverse `b_z`. Which slots
   change, and what happens to each sign?
2. A symmetric pair is `(-4,-4)`. Does transposing it equal negating it?
3. Why can `(0,0)` be both symmetric and antisymmetric?
4. What prevents an implementation that always returns `(0,0)` from passing
   our complete contract?
5. What would still be missing if we had correct pairs but assigned the
   `b_x`, `b_y`, and `b_z` contributions to the wrong axes?

**Keep this distinction:** transposition exchanges positions; negation
reverses values. Antisymmetry is the law connecting their results—not a
claim that they are the same operation.

Next: [lesson 3's capacity-to-diagonal bridge](03-capacity.md),
where a valid pressure fraction determines `-q` and `1/q`.
