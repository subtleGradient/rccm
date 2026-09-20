# Lesson 13 — Differentiate a field program

[Previous](12-normalization.md) · [Course](../README.md) · [Next](14-clebsch.md)

## Walk on a frozen height map

Use the godlike view over a flat coordinate floor. Height is the scalar
reading $f=x^2+xy$; it is not physical elevation or a gravity potential.
Stand at `(t,x,y,z)=(0,3,2,0)`. A hand sweeping in `x` samples the local
slope with `y` fixed; sweeping in `y` asks a different question.

**Predict before running:** the height, the two slopes, and how the x-slope
changes per unit x. Keep the starting point visible.

## A field is code you can transform

[`Expr`](../fields.bend#L7) is a tiny AST: constants, coordinates, addition,
multiplication. `eval` executes it at a point. `diff` compiles it into a new
field program:

$$
\partial_x k=0,\quad \partial_x x=1,\quad \partial_x y=0,\quad
\partial_x(a+b)=\partial_xa+\partial_xb,\quad
\partial_x(ab)=(\partial_xa)b+a(\partial_xb).
$$

For this map: $f(3,2)=15$, $\partial_xf=2x+y=8$,
$\partial_yf=x=3$, $\partial_x^2f=2$.
Both factors of `x*x` change when x changes; dropping either branch halves
its slope. A derivative is the infinitesimal slope, unlike lesson 8's
secant between two samples. Polynomial differentiation needs no grid spacing.

All AST coordinates and values in lessons 13–20 are **dimensionless** unless
a lesson explicitly restores scales. If $x_{phys}=L_0 x$ and
$f_{phys}=F_0 f$, the physical derivative is
$(F_0/L_0)\partial_x f$. Time uses its own reference $T_0$.
The AST deliberately does not enforce units inside an expression.

## Bend: termination follows the tree

Read [`eval`](../fields.bend#L13) beside [`diff`](../fields.bend#L37).
Each recursive call consumes a smaller subtree. Put `expr` first so Bend's
left-to-right termination check sees the decreasing argument. No fuel or
`@unsafe` is needed for a finite syntax tree.

In `Mul{+left,+right}`, the `+` allows each subtree to be used both as a
factor and as derivative input. An ordinary closure is affine and cannot
stand in for freely reusable source syntax. This is why we store an AST.
We leave arbitrary unbalanced AST branches sequential; independent calls
are not automatically **balanced** parallel work.

The [universal laws](../fields-laws.bend#L7) specify interpreter constructors
and derivative rewrites. `diff_self` uses exhaustive cases; product/sum rules
reduce directly. `derivative_fixture` and `cross_coordinate` are closed checks.
The additional [`diff_coordinate`](../fields-laws.bend#L51) law specifies the
whole four-by-four identity table: each coordinate differentiates to one in
its own direction and zero in all twelve ordered cross-axis cases.
There is no mechanized real-analysis limit theorem here: these are an exact
polynomial interpreter and its formal differentiation rules.

## Run and remove a branch

```sh
bend bend/asymmetric-metric-tensor/lessons/13-fields.bend
bend bend/asymmetric-metric-tensor/PROOF.bend
bend bend/asymmetric-metric-tensor/lessons/counterexamples/13-one-product-term.bend
```

The last command rejects `one_product_term`: at x=3 the derivative of x²
is 6, not 3. Try writing the faulty AST explicitly and trace the missing edge.

## Back to the tensor

[GfX's gradient and curl](../../../RCCM-GfX-2.tex#L31-L44) now become
operations on field programs, rather than supplied numbers.
[Condensed's material derivative](../../../RCCM-Condensed.tex#L3662-L3674)
uses these same partial derivatives but adds a path through the field.
This AST implements neither all smooth functions nor singular/multivalued fields.

**Next probe:** move only `y` from 2 to 5. Predict `f`, `dx`, `dy` and `dxx`.
Which readings notice that move even though the differentiation direction is x?
