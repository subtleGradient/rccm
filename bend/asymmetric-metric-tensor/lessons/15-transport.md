# Lesson 15 — Follow a moving sample

[Previous](14-clebsch.md) · [Course](../README.md) · [Next](16-indices.md)

## The map can stay still while your reading changes

Place yourself on a floor painted with scalar value `f=x`. The paint never
changes. Your leading velocity ghost points along x at speed `2`. A fixed
camera reads no time change; your hand moving through the map reads an
increase. Neither view is wrong: they follow different paths.

**Predict:** if velocity reverses but the map does not, which reading reverses?
Now let the map itself vary as `f=t*x`. At `t=3,x=2`, with `v=(2,0,0)`,
predict the fixed-camera change and the moving-sample change separately.

## Add path motion explicitly

$$
\frac{Df}{Dt}=\partial_t f+\mathbf v\cdot\nabla f=x+2t=8.
$$

The partial term is `2`; the travel term is `6`. With reference scales
`f0,L0,T0`, velocity is scaled by `L0/T0`, so both terms restore units `f0/T0`.
[`material`](../transport.bend#L16) composes the previous gradient with a
new dot product. The scalar field needs `+`: its temporal and spatial
derivatives consume separate copies of the AST.

This follows [GfX §5.1](../../../RCCM-GfX-2.tex#L324-L344).
[Condensed's Rosetta correspondence](../../../RCCM-Condensed.tex#L3662-L3674)
also names the material derivative, but its identification with a general
covariant derivative is a model bridge, not a universal tensor identity.

## Do not delete a continuity residual before checking it

In one spatial direction, the ordinary product rule gives

$$
\partial_t(\rho v)+\partial_x(\rho v^2)
=\rho(\partial_t v+v\partial_xv)
+v\underbrace{[\partial_t\rho+\partial_x(\rho v)]}_{C}.
$$

[`continuity`](../transport.bend#L19) computes `C`; it does not set it to
zero. For supplied `rho=1,v=x`, `C=1`. At x=2 the left side is 4, while
`rho Dv/Dt=2` and the extra `v C=2`. This is a manufactured counterexample
to **automatic continuity**, not a mass-conserving fluid solution.
Density-to-velocity feedback remains unspecified.

## A coefficient is another field unless declared constant

For `a=x`, `g=x²`, at x=2:
`d(a*g)/dx=12`, but `a*dg/dx=8`; the omitted `da/dx*g` is 4.
The two [source equations](../../../RCCM-GfX-2.tex#L361-L380) also expose
a different bookkeeping issue: dividing by `rho_tau/alpha_a` multiplies
**every** right-hand term by `alpha_a`, yet the final ambient term lacks it.
No operator implemented here repairs or authorizes that missing bridge.
The [Condensed admittance route](../../../RCCM-Condensed.tex#L2278-L2326)
is a separate proposed density/force construction.

The first three [laws](../transport-laws.bend#L9) are universal AST-content
contracts. The four following laws check specific exact readings. There is
no general mass-continuity theorem or full momentum-PDE derivation in this gate.

```sh
bend bend/asymmetric-metric-tensor/lessons/15-transport.bend
bend bend/asymmetric-metric-tensor/PROOF.bend
bend bend/asymmetric-metric-tensor/lessons/counterexamples/15-pull-coefficient.bend
```

The last command rejects `coefficient_is_constant`.

**Next probe:** replace `a=x` by constant `a=2`, keeping `g=x²` and x=2.
Predict both product-derivative routes. Which premise, not which numerical
coincidence, lets the coefficient cross the derivative?
