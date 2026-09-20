# Lesson 17 — Contract without losing signs

[Previous](16-indices.md) · [Course](../README.md) · [Next](18-compatibility.md)

## Collect all sixteen contributions

Keep two copies of a stored component table. Raise both indices on the
second, multiply corresponding slots, then sum. You are collecting signed
contributions, not measuring the always-positive Euclidean size of the table.
For a time-space pair `(-e,+e)`, raising gives `(+e,-e)`: **both products
are negative**. For a spatial pair `(-b,+b)`, both products are positive.

**Predict:** pure unit slip versus pure unit twist. Does swapping the sign
of slip change its self-contraction?

$$
U:V=\sum_{\mu,\nu}U_{\mu\nu}V^{\mu\nu},\qquad
A:A=2(|b|^2-|e|^2),\qquad S:S=q^2+3/q^2.
$$

The factor two counts both slots of each pair. These are dimensionless
scalars. They are not action densities until a scale, integration measure
and dynamical action are specified.

## Bend: read the stored entries, then reduce

[`row`](../contraction.bend#L9) consumes two actual stored rows.
[`contract`](../contraction.bend#L17) evaluates four independent equal-size
row jobs in two parallel pairs, then uses the already-specified `sum4`.
It works on arbitrary matrices, not only the seven-parameter tensor recipe.
It does not substitute the compact `2(b²−e²)` formula as its implementation.

For the deliberately algebraic fixture `q=1,e_x=2,b_z=3`, expect
`S:S=4`, `A:A=10`, `S:A=0`, `U:U=14`.
These independently supplied inputs are not asserted to obey a joint
Bernoulli/constitutive closure. They are chosen to make arithmetic visible.

## Why the sectors separate

Across a mirrored pair, a symmetric input contributes the same `s` and
an antisymmetric input contributes `a,-a`. Raising supplies the same
metric sign to both:

$$as+(-a)s=0.$$

The universal [`cross_pair_zero`](../contraction-laws.bend#L37) theorem
checks this cancellation for all exact rationals. Its proof reuses the
negated-product lemma and rewrites to `term−term`. It does not inspect a
finite set of magnitudes.

The full sixteen-entry content contracts are universal. The full-matrix
orthogonality and split tests in this lesson are **closed fixtures**.
The ordinary pairwise argument extends to every symmetric/antisymmetric
matrix under this symmetric metric, but the gate does not yet contain that
general matrix theorem. Do not misreport the fixture as that theorem.

## A source sign that now has an executable check

[GfX §6.1](../../../RCCM-GfX-2.tex#L481-L511) proposes the action from this
contraction and calls its antisymmetric invariant `E²−B²`. With its printed
matrix and `(-,+,+,+)` raising, the actual contraction here is
`2(b²−e²)`. An action prefactor could reverse/rescale it, but one must state
that extra convention; the contraction itself does not.
[Condensed's modal Lagrangian](../../../RCCM-Condensed.tex#L2767-L2792)
is a different proposed construction, not an automatic reconciliation.

```sh
bend bend/asymmetric-metric-tensor/lessons/17-contraction.bend
bend bend/asymmetric-metric-tensor/PROOF.bend
bend bend/asymmetric-metric-tensor/lessons/counterexamples/17-positive-slip.bend
```

The last command rejects `slip_is_positive_norm`.

**Next probe:** set `e_x=b_z=1`. Predict `A:A`. If it vanishes, must every
entry of A vanish? Contrast a zero scalar reading with an empty tensor.
