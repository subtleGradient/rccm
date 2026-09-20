# Lesson 5 — Ask the tensor a question

**Goal:** recover the two parts from the assembled table and explain why
one kind of probe loses the antisymmetric contribution.[^scope]

[^scope]: This lesson proves exact component-algebra statements for the
    generated Cartesian samples from
    [`RCCM-GfX-2.tex`, section 3.3](../../../RCCM-GfX-2.tex#L125).
    A probe here is an ordinary component contraction, not automatic index
    raising, a norm, physical energy, or time evolution.

## 1. Place two selectors around the table

Keep lesson 4's sample fixed: `q=3/4`, `ex=1/2`, `bz=1/3`, other
contributions zero. Nothing moves through time.

Place one selector along the rows and another along the columns.
Each selector has four rational weights in order `(t,x,y,z)`.
A basis selector puts weight one on a single label and zero elsewhere:

```text
T = (1,0,0,0)       selects t
X = (0,1,0,0)       selects x

row selector T + column selector X  -> tx -> -1/2
row selector X + column selector T  -> xt -> +1/2
```

Here `T` and `X` name four-entry probe vectors, not lesson 1's axis
constructors. With these basis probes, every unselected contribution gets
multiplied by zero. The result reads one address.

Predict before running: if both selectors become `w=(1,1,0,0)`, which four
slots survive? Do the two slip contributions add or cancel?

## 2. Run the questions

```sh
bend bend/asymmetric-metric-tensor/lessons/05-probes.bend
```

Compare the `tx` and `xt` probes, same-vector result, and recovered entries.
The rational values for our example are:

| Question | Value |
|---|---|
| Row `T`, column `X`, antisymmetric `A` | `-1/2` |
| Row `X`, column `T`, antisymmetric `A` | `+1/2` |
| Row `w`, column `w`, full `U` | `7/12` |
| Row `w`, column `w`, antisymmetric `A` | `0` |

The off-diagonal basis results are also those of full `U` in this sample,
because its symmetric off-diagonal entries vanish. The program may print
`-18/36`, `18/36` and `2268/3888`; these are the same values as the reduced
fractions above.

For the full same-vector probe, the surviving entries are:

$$
-\frac34-\frac12+\frac12+\frac43
=-\frac34+\frac43=\frac7{12}.
$$

The twist pair does not contribute here because `w` has zero `y` weight.
The slip pair contributes two terms that cancel. Those are different reasons
for disappearing; track which one applies.

## 3. Recover the two layers

At any address, read both the original entry and the entry across the diagonal.
Average them to keep what agrees; take half their difference to keep what
reverses:

$$
S_{ij}=\frac{U_{ij}+U_{ji}}2,\qquad
A_{ij}=\frac{U_{ij}-U_{ji}}2.
$$

At `tx`, the actual starting pair is `(-1/2,+1/2)`. Its average is zero;
half the ordered difference is `-1/2`. At `xt`, the order reverses, so
the recovered antisymmetric value is `+1/2`.

At `tt`, the mirrored address is still `tt`: averaging `-3/4` with itself
keeps `-3/4`; subtracting it from itself gives zero.

Now use the **generic symmetric comparison** `(-4,-4)`, not the sample's
slip pair. Predict its average and half-difference. Write the original
pair first. Transposition gives `(-4,-4)`, whereas negation gives
`(+4,+4)`. Replacing the supplied pair with `(-4,+4)` changes the question.

## 4. Export the operation

[`Vector4`](../probes.bend#L6) carries four rational weights. The operation
[`bilinear(x,m,y)`](../probes.bend#L47)
uses every component:

$$
B(x,M,y)=\sum_{i\in\{t,x,y,z\}}\sum_{j\in\{t,x,y,z\}}x_iM_{ij}y_j.
$$

Read each term as **row weight × stored entry × column weight**.
The implementation groups all sixteen terms into four diagonal terms and
six mirrored pairs. It is not a shortcut that simply returns zero for `A`.

The demo weights and matrix entries are dimensionless, so these results
are dimensionless. The row superscript in the conventional spelling
`xᵀMy` arranges weights for multiplication; it does not silently insert a
metric or raise an index.

The [recovery operations](../probes.bend#L9) are `symmetric_entry(slot,m)` and
`antisymmetric_entry(slot,m)`. They return values, not claims that every
arbitrary input matrix arose from our assembler.

## 5. Follow the cancellation proof

```sh
bend bend/asymmetric-metric-tensor/PROOF.bend
```

The [recovery laws](../probes-laws.bend#L29) cover every slot of every assembled sample, using
`R.Same` for semantic rational equality. The same-vector law covers every
rational vector `x` and generated antisymmetric matrix `A`:

$$
B(x,A,x)=0.
$$

Proof idea: the four diagonal terms vanish because `A_ii=0`.
Each mirrored pair has the form

$$
x_i a x_j+x_j(-a)x_i=0.
$$

Commutativity brings the weights into the same order; the values are
opposites. Six pair cancellations exhaust the off-diagonal entries.
These are proved exact rational arithmetic steps, built on natural-number
lemmas, not floating-point observations or unproved field axioms.

The gate proves these identities symbolically. The IO demo evaluates concrete
fractions through Bend's native runtime; its displayed results were also
checked against an independent rational calculation. Do not turn a large
native run into one giant `{==}` normalization: a closed version of this
numerical probe overflowed the checker's stack. The universal proofs still
check. Unreduced fractions also grow quickly; this is a reference calculation,
not yet a fast or overflow-bounded engine kernel.

## 6. Reject an overextended law

```sh
bend bend/asymmetric-metric-tensor/lessons/counterexamples/05-two-probes.bend
```

The deliberate false extension says two **different** probes must also
give zero on `A`. Our basis probes refute it: `B(T,A,X)=-1/2`, not zero.
That is the intended equality failure, without prescribing compiler output.
The proof gate excludes this invalid fixture.

## 7. Return without execution

1. Recover `S_xy` and `A_xy` from `(-1/3,+1/3)`.
2. Why does `B(x,A,x)=0` not imply `A=0`?
3. With `w=(0,1,1,0)`, which twist terms cancel? What remains for full `U`?
4. If both `S` and `A` are present, does `Uᵀ=-U` follow?
5. What information is lost if you store only same-vector probe results?

Keep the mark: **a zero answer can belong to the question, not the object.**
