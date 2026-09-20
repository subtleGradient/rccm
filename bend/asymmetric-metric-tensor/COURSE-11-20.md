# Lessons 11–20 — From supplied entries to readable field laws

**Build plan, committed before implementation.** The starting hold is lessons
1–10: a local Cartesian tensor, exact arithmetic, stress, spatial differences
and a finite frozen-forcing experiment. The next hold is a reader who can
construct small source fields, follow differential operators, and audit the
tensor's contractions without treating a printed formula as a black box.[^scope]

[^scope]: Bend checks the written contracts under its checker guarantees.
    Universal laws, closed exact fixtures, native regression tests, continuum
    arguments and empirical physical validation are different evidence.
    New contracts are AI-drafted specifications for human review.

## Jobs and route

| Lesson | When reading the TeX, I need to… | Mathematical foothold | Bend mastery | Artifact / exit prediction |
|---|---|---|---|---|
| 11 — Nest the pressure budget | Track which denominator a compliance uses | `q = alpha_g² alpha_a²`; positive residuals | Data constructors, domain invariants, existential witnesses | A lossless ledger-to-capacity adapter; move load between macro and local compartments |
| 12 — Normalize slip and twist | Turn velocity and frequency into dimensionless entries | `e = alpha v/c`, `b = alpha t_p Omega` | Erased nominal units, typed APIs, reusable records | Normalizers feeding the existing matrix; double `c` or `t_p` separately |
| 13 — Differentiate a field program | Read `partial` as an operation, not decoration | Polynomial partial derivatives and product rule | Recursive syntax trees, interpreter, structural termination | An exact expression evaluator/differentiator; predict `d(x*x)/dx` |
| 14 — Build a Clebsch patch | Find where the off-diagonal twist comes from | Gradient, cross product, curl of `lambda grad beta` | Composition, independent parallel components, reusable data | Compare two independently computed curls; add transverse curl without relabelling it internal vorticity |
| 15 — Follow a moving sample | Separate temporal change, advection and continuity | Material derivative; coefficient product rule | Composing typed expression transformations and proof fixtures | A continuity residual and a variable-coefficient counterexample; predict motion through a stationary ramp |
| 16 — Raise indices, not addresses | Know what the upper indices do | Flat `eta = diag(-1,1,1,1)` raising on both slots | Exhaustive matches and proof reuse | A component raising rule and universal involution; predict the `tx` and `xy` signs |
| 17 — Contract without losing signs | Read the section-6 scalar correctly | Sixteen-term Lorentz contraction versus Euclidean sum | Reusing stored matrices, balanced reductions, algebraic witnesses | Actual entry-by-entry contraction; compare pure slip with pure twist |
| 18 — Test whether a strain fits | Distinguish displacement-generated strain from arbitrary strain | A planar Saint-Venant component | Small composable AST transformations, exact fixtures | Compatible and incompatible polynomial patches; change only `epsilon_yy` |
| 19 — Apply the operator twice | Understand the fourth-order Poisson term | Laplacian, biharmonic, dimensions and boundary data | Reuse rather than duplicate derivative code | Manufactured polynomial residual; double the regularization length |
| 20 — Send a profile across the patch | Read the source-free wave operator and evaluate many probes | `box = -c^-2 partial_t² + laplacian` | Templates, polymorphic balanced trees, fork/join and native execution | Traveling-profile residuals and a parallel batch; distinguish evaluating a solution from solving an initial-value problem |

Every lesson includes a scene, fully stated starting values, prediction before
execution, notation and units, source anchors in both TeX files, a runnable
demo, separately declared laws/proofs, an intentional failed claim, and a
return probe. State exactly which claims quantify over arbitrary inputs.

## Design choices

1. **Exact reference before a larger mesh.** Reuse the existing rational
   implementation. Keep polynomials and batches small: unreduced denominators
   grow, and exact arithmetic is not an efficient production PDE solver.
2. **A small expression language, not a general CAS.** Constants, coordinates,
   sums and products suffice for these manufactured fields. Smooth polynomial
   fields avoid branch cuts and singularities; they cannot demonstrate a
   topological defect. Division by a field, roots, trig and symbolic
   simplification remain out of scope.
3. **Explicit dimensional boundary.** Physical entry normalization has nominal
   unit types. Polynomial fixtures use declared nondimensional coordinates
   and reference scales, not silently SI-valued bare numbers.
4. **Flat-background index raising.** Do not invert the asymmetric matrix or
   confuse raising with transposition, a passive frame change or a boost.
5. **Operators before claims of reductions.** A nonzero incompatibility or a
   fourth derivative is an algebraic result; it does not prove curvature,
   singularity resolution, or a physical action principle.
6. **Parallelize independent probes, not successive time steps.** A balanced
   binary tree of equal-size jobs gives templates and fork/join a real purpose.
   No GPU speed claim or machine-accuracy theorem follows from small examples.

## Source route and audit marks

Read the focused source first for this construction, then compare the broad
reference:

- [GfX §§1–3](../../RCCM-GfX-2.tex#L31-L139): Clebsch fields, nested budget,
  local matrix and normalized entries.
- [GfX §5.1](../../RCCM-GfX-2.tex#L324-L380) versus
  [Condensed motion](../../RCCM-Condensed.tex#L2273-L2366): continuity,
  effective density and placement of admittance are not one closed PDE.
- [GfX §6.1](../../RCCM-GfX-2.tex#L478-L511): use the stated `(-,+,+,+)`
  signature to calculate the contraction rather than borrowing its sign from
  the prose description of a Maxwell invariant.
- [GfX §6.2](../../RCCM-GfX-2.tex#L515-L550) and
  [Condensed compatibility](../../RCCM-Condensed.tex#L3697-L3716): a linear
  compatibility calculation is not the missing nonlinear connection proof.
- [GfX §§6.3–6.5](../../RCCM-GfX-2.tex#L552-L645): proportionalities,
  discarded boundary terms, source normalization and constant coefficients
  must remain explicit before the fourth-order and source-free operators.
- [Condensed Rosetta stone](../../RCCM-Condensed.tex#L3637-L3755) and
  [modal action](../../RCCM-Condensed.tex#L2724-L2829) are comparison routes,
  not interchangeable definitions completing the focused branch.

Known implementation boundary: section 5 divides by `rho_tau/alpha_a` but
does not carry `alpha_a` onto the ambient term in its final line. Likewise,
factoring `alpha` out of a derivative requires it to be constant on that
patch. Lessons must expose these choices rather than repair the TeX silently.

## Delivery and verification

Implement in order, one reviewable checkpoint per lesson. Before each commit:
run the accumulated `PROOF.bend`, execute the demo, and check that its false
claim fails for the intended reason. Push each checkpoint to `local`.
Extend automated verification with exact independent expectations, intended
failures and well-typed implementation mutations. Finish with a clean tracked
archive run and verify the local destination hash.

The course index tracks implementation status. Learner mastery remains open
until the reader answers the prediction and transfer probes; passing programs
do not supply those answers.
