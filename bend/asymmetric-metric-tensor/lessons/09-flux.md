# Lesson 9 — Balance the shared face

[Previous: differences](08-differences.md) · [Course](../README.md)

## Place two cells

Stand in the left of two equal-width cells. Their common wall is an imaginary
sampling face, not a solid support. Stand back and see both cells at once:

```text
left boundary          shared face           right boundary
     F_L      [cell 0]      F_M      [cell 1]      F_R
                  width h                width h
```

All three readings use the **same positive x direction**. They are not already
signed by each cell's outward normal. A positive flux leaves the cell on its
left and enters the cell on its right.

For the frozen fixture, track **y-momentum transported along x**. The selected
tensor component is `T_xy`: transport direction first, momentum component
second. Sideways transport and the line connecting cells are distinct.

**Before running:** the faces read `0, −2, 0 Pa`, with `h=1 m`. Which cell
gains y-momentum? Can an internal face alone change the sum across both cells?

## Run it

```sh
bend bend/asymmetric-metric-tensor/lessons/09-flux.bend
bend bend/asymmetric-metric-tensor/PROOF.bend
```

Expected values:

| Face readings `(F_L,F_M,F_R)` | Left gain | Right gain | Sum |
|---|---:|---:|---:|
| `(0,−2,0) Pa` | `+2 N/m³` | `−2 N/m³` | `0` |
| `(3,1,0) Pa` | `+2 N/m³` | `+1 N/m³` | `3 N/m³` |

The first fixture samples `T_xy` from three matrices using `P_c=2 Pa`;
the middle has `b_z=1`, and the boundaries have zero twist. Its `q=1` and
independently supplied twist are an algebraic sign fixture, not a claim that
those fields jointly solve the pressure/Clebsch ledger.
The second fixture supplies face fluxes directly to expose boundary exchange.
Unreduced fractions can print different numerators and denominators.

## Count the same face twice, with opposite roles

Lesson 8's divergence reading is `(right−left)/h`. Our conservative **gain**
is its negative:

$$
g_0=\frac{F_L-F_M}{h},\qquad
g_1=\frac{F_M-F_R}{h}.
$$

Add the actual two cell results:

$$
g_0+g_1
=\frac{F_L-\cancel{F_M}+\cancel{F_M}-F_R}{h}
=\frac{F_L-F_R}{h}.
$$

The shared face cancels, however large or small its signed value.
Equal exterior values give zero total gain. Non-equal exterior values
exchange momentum with the surroundings. Conservation does **not** mean
“the sum never changes regardless of boundaries.”

For cells with equal cross-section `A` and width `h`, multiplying by the cell
volume `Ah` converts the density-rate sum to the total momentum rate:
`Ah(g_0+g_1)=A(F_L−F_R)`. Unequal cell volumes need volume weights; this
two-cell API deliberately has one shared width.

## Put the indices in the source equation

The focused source starts from
[`∂_μ T^{μν}=0`](../../../RCCM-GfX-2.tex#L291-L295).
With `x⁰=ct`, write `m_i=T^{0i}/c` and retain x variation only:

$$
\partial_t m_i+\partial_x T^{xi}=0.
$$

Here `i` is the selected momentum direction, and `x` is the differentiated
direction. For **spatial-spatial entries only**, raising both indices with
`η=diag(−1,1,1,1)` leaves their numerical signs unchanged. Thus our spatial
`T_xy` table entry is a possible supplied `F_y` in this restricted balance.
The API's [`Spatial`](../flux.bend#L9) type excludes time indices.

This does not identify the stored matrix's time-space entries with the
independently supplied momentum state in lesson 10. The omitted time/field
closure remains an explicit boundary.

Read the [expanded flux in the focused source](../../../RCCM-GfX-2.tex#L322-L344):
`Q^{ji}=P_dyn δ^{ji}+ρ_dyn v^i v^j−τ^{ji}`. Its update is `−div Q`.
If you instead isolate ordinary stress `τ` on the force side, its contribution
is `+div τ`. These conventions cannot share a sign by spelling alone.

Now return to the [Condensed modal-force discussion](../../../RCCM-Condensed.tex#L2328-L2339).
Locate each gradient/divergence and its admittance coefficient. This course's
face balance is a numerical definition for a declared flux, not a derivation
of those coefficients or a claim that the antisymmetric part is ordinary
viscous shear stress.

## Bend: share the face, not mutable state

Read [`rates`](../flux.bend#L43):

```python
case Faces{left, +middle, right}:
  a b = gain(width, left, middle) gain(width, middle, right)
  Rates{a, b}
```

`middle` is `Data`. The `+` allows both calls to read the **same value**.
The two calls have no dependency on each other's answer; the parallel let
makes that independence explicit. Both inputs have the same shape, though
exact integer sizes can still make their runtimes differ.

This two-cell exercise teaches scheduling, not a performance win: fork overhead
can exceed the work. It runs natively on the CPU; no `!` or GPU claim is added.
The IO demo prints results only after the pure calls complete.

## Law, proof, and mutation

[`shared_face_cancels`](../flux-laws.bend#L69) compares the **sum of the computed
cell gains** with the exterior-only expression for every signed rational face
reading and positive width. It does not return a cached zero or define the
total to be the boundary expression. The proof opens the `Faces` record and
applies the constructive exact-rational telescoping theorem.

The other contracts fix the transport row, all three sampled values, both
cell updates, and the sum. A both-cells-zero implementation cannot pass them.

```sh
bend bend/asymmetric-metric-tensor/lessons/counterexamples/09-row-column.bend
```

This must fail at `wrong_transport_index`, comparing `T_xy=−2` with
`T_yx=+2` in the same matrix. Symmetric test data would hide that bug.

## Return probe

Keep the outside faces zero and change the shared face from `−2` to `−5 Pa`.
Predict **both** gains before summing them. Next change only the right boundary
to `+1 Pa`: does the internal cancellation stop working, or does the boundary
now explain a nonzero sum?

[Continue to lesson 10: unpause](10-evolution.md).
