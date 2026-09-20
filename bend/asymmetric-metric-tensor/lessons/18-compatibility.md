# Lesson 18 — Test whether a strain fits

[Previous](17-contraction.md) · [Course](../README.md) · [Next](19-fourth-order.md)

## Stretch a marked sheet without cutting it

Place a small marked sheet in the xy plane. Displacement `u` tells where each
mark moves; infinitesimal strain measures the local changes of length and
angle. A smooth, single-valued displacement gives mutually compatible local
instructions. An arbitrary collection of stretch instructions may not.

Keep this a small-strain kinematic test, not a claim that a large polynomial
displacement is physically small over the whole infinite plane.
**Predict:** does independently choosing `epsilon_xx`, `epsilon_xy` and
`epsilon_yy` guarantee that one uncut planar displacement produces them?

## Extract one useful component, not all curvature

For a planar displacement:

$$\varepsilon_{xx}=\partial_xu_x,\quad
\varepsilon_{yy}=\partial_yu_y,\quad
\varepsilon_{xy}=\tfrac12(\partial_yu_x+\partial_xu_y).$$

Choose $(i,j,k,l)=(x,y,x,y)$ in
[GfX's four-index formula](../../../RCCM-GfX-2.tex#L520-L548):

$$
\mathrm{Inc}_{xyxy}=\partial_y^2\varepsilon_{xx}
+\partial_x^2\varepsilon_{yy}
-\partial_y\partial_x\varepsilon_{xy}
-\partial_x\partial_y\varepsilon_{xy}.
$$

The two mixed derivatives are separate terms. `Strain` stores a symmetric
xy/yx pair once; this is a **planar infinitesimal-strain** API, not the
asymmetric spacetime matrix itself.

For `u=(x*y²,0)`, the strain is `(xx,xy,yy)=(y²,xy,0)`;
the residual is `2+0−1−1=0`.
For isotropic `xx=yy=x²+y²`, `xy=0`, it is `2+2=4`.
This second field can be read as the focused spatial strain
`(S_ii−1)/2` if `q=1/[1+2(x²+y²)]`; that interpretation supplies a capacity
field but does not solve its dynamics.

## Bend: compose small transformations

[`from_displacement`](../compatibility.bend#L10) reuses `diff`; it does not
hard-code a derivative for the chosen example. [`inc`](../compatibility.bend#L16)
reuses it again. Each stage returns syntax that the same interpreter can
sample. This is a small compiler pipeline with inspectable intermediate values.

The [two content laws](../compatibility-laws.bend#L8) quantify over every
input expression. Two closed tests distinguish zero and nonzero residuals.
The gate does **not** prove compatibility for all smooth displacements, nor
that this one planar component detects every possible 3D incompatibility.
Ordinary commutation of polynomial mixed derivatives explains the compatible
fixture; there is no singularity or branch cut in it.

If displacement has physical scale `L0`, strain is dimensionless; the
physical incompatibility has scale `1/L0²`.
[Condensed's strain route](../../../RCCM-Condensed.tex#L3697-L3716)
uses the same derivative combination. The nonlinear connection, global
topology/Burgers vector and identification with physical curvature remain
separate from this local linear operator.

```sh
bend bend/asymmetric-metric-tensor/lessons/18-compatibility.bend
bend bend/asymmetric-metric-tensor/PROOF.bend
bend bend/asymmetric-metric-tensor/lessons/counterexamples/18-all-strain-fits.bend
```

The last command rejects `every_strain_is_compatible`.

**Next probe:** start from the compatible strain `(y²,xy,0)` and add `x²`
only to `yy`, holding the other two fields fixed. Predict the new residual.
Which missing adjustment would a displacement-generated change have supplied?
