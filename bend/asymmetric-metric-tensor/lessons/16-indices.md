# Lesson 16 — Raise indices, not addresses

[Previous](15-transport.md) · [Course](../README.md) · [Next](17-contraction.md)

## Keep the address card in place

Put a `+2` card in the `tx` slot. Do not move it across the diagonal or rotate
the room. Raising both indices asks the **background metric** how this
component contributes with upper indices. Each time index contributes a
minus sign; each spatial index contributes a plus.

```text
tt: two time signs -> +2
tx: one time sign  -> -2
xy: no time sign   -> +2
```

**Predict:** what happens to `xt`? What if we raise/lower both indices again?
Why is that operation unlike transposing the address?

## State the metric before computing

With the flat Cartesian background $\eta=\operatorname{diag}(-1,1,1,1)$,
and $x^0=ct$, $\eta^{-1}=\eta$:

$$U^{\mu\nu}=\eta^{\mu\alpha}\eta^{\nu\beta}U_{\alpha\beta}
=s_\mu s_\nu U_{\mu\nu},\qquad s=(-1,1,1,1).$$

There is **no sum** on the final componentwise expression's free $\mu,\nu$.
The matrix entries and sign factors are dimensionless.
This is [GfX's declared background convention](../../../RCCM-GfX-2.tex#L94-L107)
made explicit for the [section-6 contraction](../../../RCCM-GfX-2.tex#L481-L490).
It is not inversion of $U$, a general curved-metric raising algorithm,
a boost, or the passive spatial cycle from lesson 6.

[Condensed's metric example](../../../RCCM-Condensed.tex#L3642-L3659)
uses spherical-coordinate factors such as $r^2$. Its component table is
not an interchangeable flat Cartesian raising matrix.

## Bend: reuse a theorem, don't sample every number

[`sign`](../indices.bend#L7) has four exhaustive axis cases.
[`raise`](../indices.bend#L18) applies it to **both** indices.
[`upper`](../indices.bend#L23) reads the actual stored matrix slot.

The [laws](../indices-laws.bend#L7) specify every sign and the two-index
composition. `raise_twice` quantifies over **every address and rational**,
including noncanonical signed fractions. Its [proof](../indices-proof.bend#L20)
splits into sixteen address cases, then reuses the existing universal
`negate_twice` theorem. In the `tt` case it composes two equalities with
`Equal.trans`. No list of example magnitudes substitutes for that theorem.

An involution alone would also accept a no-op. The four sign-content laws
exclude that wrong implementation. This is the same specification lesson
as lesson 1, now protecting a physical sign convention.

```sh
bend bend/asymmetric-metric-tensor/lessons/16-indices.bend
bend bend/asymmetric-metric-tensor/PROOF.bend
bend bend/asymmetric-metric-tensor/lessons/counterexamples/16-euclidean-time.bend
```

The final command rejects `time_space_unchanged`.

**Next probe:** in the assembled tensor, `U_tx=-e_x`, `U_xt=e_x`.
Write their raised values, then both products
`U_tx*U^tx` and `U_xt*U^xt`. Do they cancel or reinforce?
