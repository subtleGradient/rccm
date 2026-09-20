# Lesson 14 — Build a Clebsch patch

[Previous](13-fields.md) · [Course](../README.md) · [Next](15-transport.md)

## Cross two maps

Keep the Cartesian room. Paint two scalar readings on it:
`lambda=x+y`, `beta=x*z`. At `(1,0,1)`, hands following each map's steepest
increase point along $\nabla\lambda=(1,1,0)$ and $\nabla\beta=(1,0,1)$.
The cross product has an axis perpendicular to both, oriented by the
right-hand rule. That is the rotation-axis reading, not a translational push.

**Predict:** is its z-component positive or negative? What happens if you
exchange the two gradient inputs?

## Two routes to the same internal vorticity

The rotational velocity is
$$\mathbf v_{rot}=\lambda\nabla\beta=((x+y)z,0,(x+y)x).$$
Differentiate its components:
$$\nabla\times\mathbf v_{rot}=(x,-x,-z).$$
Independently cross the scalar gradients:
$$\nabla\lambda\times\nabla\beta=(1,1,0)\times(z,0,x)=(x,-x,-z).$$

Both yield `(1,-1,-1)` at the chosen point. This instantiates the product
rule $\nabla\times(\lambda\nabla\beta)=\nabla\lambda\times\nabla\beta+
\lambda\nabla\times\nabla\beta$, with the last term zero for smooth polynomials.

[GfX §1](../../../RCCM-GfX-2.tex#L31-L44) calls this rotational-sector curl
$\Omega$. Add transverse velocity `(0,2x,0)` and the **total** curl gains
`(0,0,2)`, becoming `(1,-1,1)`. The two sensors no longer read the same thing.
This smooth field is not a singular vortex core, quantized mass or dislocation.

## Bend: vector programs, not just vectors of numbers

[`Vector`](../clebsch.bend#L7) holds three `Expr` values.
[`gradient`, `cross`, `curl`](../clebsch.bend#L10) transform those programs;
`eval` samples the result afterward. In `curl`, every component program
is used twice, so the pattern explicitly requests `+` copies.
The gradient computes two similar independent derivatives in parallel.

`eval` returns `M.Row{0,x,y,z}` for reuse of the course's axis selectors:
the zero time slot is padding, not a computed temporal component.
[`velocity`](../clebsch.bend#L46) assembles all three focused source terms.
It does not assert that arbitrary supplied terms are mutually orthogonal.

The [content laws](../clebsch-laws.bend#L8) quantify over arbitrary component
programs; they pin every cross/curl sign. Three closed laws check the actual
curl against hand-calculated numbers. `two_routes_fixture` covers every
axis at **one fixed field and point**, not every Clebsch field.

## Units and source comparison

The executable fixture is nondimensional. Restore common `L0,T0` scales:
velocity has scale `L0/T0`, vorticity `1/T0`. One compatible choice is
dimensionless $\beta$ and $\lambda$ with units `L²/T`, so
$\lambda\nabla\beta$ has velocity units.
[Lesson 12](12-normalization.md#L18) then supplies the separate normalization.

[Condensed's decomposition](../../../RCCM-Condensed.tex#L2729-L2735)
uses $\nabla h+\nabla\times A+\nabla\times v_\psi$. It is not the identical
parameterization with renamed fields. Do not silently replace one by the other.

```sh
bend bend/asymmetric-metric-tensor/lessons/14-clebsch.bend
bend bend/asymmetric-metric-tensor/PROOF.bend
bend bend/asymmetric-metric-tensor/lessons/counterexamples/14-total-curl.bend
```

The final command rejects `total_is_internal`.

**Next probe:** remove only the transverse field, then replace `lambda` by
`-lambda`. Predict rotational velocity, internal curl and normalized `b_z`.
Which matrix pairs reverse? Keep `q` supplied and unchanged.
