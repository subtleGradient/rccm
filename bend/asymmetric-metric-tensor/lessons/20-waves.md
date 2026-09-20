# Lesson 20 — Send a profile across the patch

[Previous](19-fourth-order.md) · [Course](../README.md) · [Plan](../COURSE-11-20.md)

## Let the map move; keep the probes separate

Place a parabolic scalar reading $f(t,x)=(x-t)^2$ in the room. Its zero
travels along `x=t`. Four cameras sit at separate **events**:
`(t,x)=(0,0),(0,1),(1,1),(1,3)`, all with y=z=0.
These are independent questions to a supplied field, not four dependent
time steps of a simulation.

**Predict:** the four readings. Then compare the second time derivative with
the second spatial derivative. What changes for the profile `(x−2t)²`
if the operator's speed remains 1?

## The wave operator

$$\square_c f=-c^{-2}\partial_t^2 f+\Delta f.$$

For $(x-vt)^2$, the residual is $2-2v^2/c^2$.
Matched unit speed gives zero; `v=2,c=1` gives `−6`.
The four profile readings are `0,1,0,4`; the four matched residuals are zero.

[`box`](../waves.bend#L10) uses a positive speed and the existing Laplacian.
The speed is dimensionless `c_phys*T0/L0`; a physical component with scale
`U0` has residual scale `U0/L0²`. The coefficient is constant on the patch.
Moving a variable coefficient through this operator would reintroduce
lesson 15's missing derivatives.

[GfX §6.5](../../../RCCM-GfX-2.tex#L619-L645) applies this operator
componentwise to `U=S+A`. Each fixed component can be an expression of the
kind tested here; linearity gives the mathematical split. The code does not
assemble a dynamically admissible reciprocal-`q` tensor field merely by
putting arbitrary wave profiles in its slots.
[Condensed's modal action](../../../RCCM-Condensed.tex#L2724-L2792)
and [Rosetta map](../../../RCCM-Condensed.tex#L3637-L3755) remain comparison
routes, not a supplied closure turning this scalar fixture into the full model.

## Bend: specialize a reusable, balanced map

[`Tree<A>`](../batch.bend#L6) stores the shape of a batch.
[`map`](../batch.bend#L10) is polymorphic in its input/output types and takes
a **template** function `~f`. Unlike an affine runtime closure, the template
is closed syntax specialized at compile time and may be called at every leaf.
The call `B.map(~M.Row,~R.Q,~W.reading,B.points())` makes that export explicit.

The two child maps run in parallel and join as a `Fork`. Equal-depth trees
with the same field program per leaf supply similar workloads. The type
permits unbalanced trees too; scheduling quality is a caller obligation.
The pure result preserves leaf order even if jobs finish out of order.
Printing is deliberately sequenced afterward.

The universal [`map_identity`](../waves-laws.bend#L31) proof uses structural
induction: leaf reduces; fork rewrites both smaller subtrees using the induction
hypotheses. It covers every finite rational tree, not only the four cameras.
Additional leaf/fork contracts pin the actual profile-map behavior.

## What passed, and what did not get claimed

| Evidence | Delivered scope |
|---|---|
| Universal checked rules | Wave-operator AST contents; identity map on every rational tree; profile-map constructors |
| Closed exact fixtures | Matched/mismatched wave residuals; nonzero superposition and split readings |
| Native regression | Readings agree with independent exact expectations on CPU threads 1 and 2 |
| Not delivered | General mechanized wave linearity, a PDE solver, initial/boundary evolution, convergence, GPU speedup, measured physical propagation |

No finite-difference grid is used here. This is analytical polynomial
differentiation evaluated exactly at selected rational points. Termination
of syntax recursion is not a runtime budget: large derivative ASTs and
unreduced rational numerators/denominators grow quickly.

```sh
bend bend/asymmetric-metric-tensor/lessons/20-waves.bend
bend bend/asymmetric-metric-tensor/PROOF.bend
bend bend/asymmetric-metric-tensor/lessons/counterexamples/20-any-speed.bend
mkdir -p bend/build
bend bend/asymmetric-metric-tensor/lessons/20-waves.bend -o bend/build/tensor-waves
bend/build/tensor-waves --threads 1
bend/build/tensor-waves --threads 2
```

The false claim `any_speed_solves_wave` must fail. Matching parallel results
tests scheduling behavior, not a performance improvement.

## Capstone: leave a source-to-proof ledger

Choose one tensor component and write five lines:

1. **Supplied:** coordinates, reference scales, background metric, field program.
2. **Derived:** derivatives, normalized entry, chosen contraction/operator.
3. **Checked:** name one universal law and one closed fixture; explain the difference.
4. **Still assumed:** physical identification, coefficient constancy, closure,
   boundary/initial data, and any source-to-field implication.
5. **Falsifier:** one changed input or implementation that must break a claim.

**Next probe:** set both profile speed and operator speed to 2. Predict the
residual and the zero's path. Then explain why a zero residual still cannot
choose the initial shape, amplitude or boundary data for you.
