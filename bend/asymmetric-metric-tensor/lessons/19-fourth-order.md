# Lesson 19 — Apply the operator twice

[Previous](18-compatibility.md) · [Course](../README.md) · [Next](20-waves.md)

## Feel the bend, then the variation of the bend

Place the scalar profile $\Phi=x^4$ along a straight line through the patch.
Its slope tells how the reading changes as you walk. Its second derivative
tells how that slope changes. The fourth derivative asks for the second
derivative of that second-derivative field.

**Predict at x=1:** $\Phi''$, $\Phi''''$, then
`Phi'' − ell² Phi''''` for `ell=1` and `ell=2`.
Do not square the reading of the second derivative: differentiate it again.

## A three-dimensional operator, a one-dimensional fixture

$$
\Delta f=\partial_x^2f+\partial_y^2f+\partial_z^2f,\quad
\Delta^2f=\Delta(\Delta f),\quad
L_\ell f=\Delta f-\ell^2\Delta^2f.
$$

For $x^4$: $\Delta f=12x^2$, $\Delta^2f=24$.
At x=1 the residuals are `−12` and `−84`.
For $x^2y^2$: $\Delta f=2y^2+2x^2$ and $\Delta^2f=8`.
That mixed example matters: a sum of only pure fourth derivatives would
incorrectly return zero.

[`laplacian`](../operators.bend#L6) reuses the polynomial second derivative.
[`biharmonic`](../operators.bend#L10) composes the whole operator, retaining
the mixed terms automatically. `poisson` squares the supplied constant radius
ratio and multiplies the fourth-order field. This is reuse of transformations,
not an expanded duplicate formula vulnerable to missing cross terms.

## Restore dimensions before matching the TeX

[GfX §6.4](../../../RCCM-GfX-2.tex#L591-L617) proposes

$$\nabla^2\Phi-r_c^2\nabla^4\Phi=4\pi G\rho.$$

For physical potential $[\Phi]=L^2/T^2$:
`[laplacian Phi]=1/T²`, `[biharmonic Phi]=1/(L² T²)`.
The length **square** is required to add the terms.
Our AST uses `x_phys=L0*x`, `Phi_phys=Phi0*f`, and `ell=rc/L0`.
The physical left side is `(Phi0/L0²) L_ell f`.
The API accepts a rational ratio; its square is nonnegative, but it does
not infer a cavitation radius from mass.

## A manufactured source is not a solved boundary problem

We choose the field, apply the operator, and obtain the source it would
require. We have not supplied a density and recovered a field. The negative
source reading at x=1 is not offered as ordinary positive mass density.
These polynomials do not decay at infinity, so do not use them to justify
discarding action boundary terms.

For a fourth-order one-dimensional boundary problem on a finite interval,
one typically needs four scalar boundary conditions, such as value and
slope at each endpoint. No such solve, uniqueness, singularity-resolution
theorem or numerical convergence result is implemented here.

The [universal content laws](../operators-laws.bend#L8) pin composition and
the coefficient square. Four exact fixtures pin known derivatives and signs.
The [focused action's proportionalities and boundary assumptions](../../../RCCM-GfX-2.tex#L564-L599)
are still separate steps.
[Condensed's modal action](../../../RCCM-Condensed.tex#L2767-L2792)
does not supply this missing variational bridge by itself.

```sh
bend bend/asymmetric-metric-tensor/lessons/19-fourth-order.bend
bend bend/asymmetric-metric-tensor/PROOF.bend
bend bend/asymmetric-metric-tensor/lessons/counterexamples/19-forgot-square.bend
```

The last command rejects `radius_is_linear`, which would give `−36`.

**Next probe:** add `7+3x` to the same potential without changing its domain.
Predict the operator residual. Can the residual alone select those two
coefficients, or would you need boundary information?
