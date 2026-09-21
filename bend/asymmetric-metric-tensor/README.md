# Learn the asymmetric metric tensor through Bend

**Status: lessons 1–20 are implemented and checked with Bend 2.0.21.**
The [6–10 plan](COURSE-6-10.md) and [11–20 plan](COURSE-11-20.md)
record the incremental routes and their scope. Continuing from lesson 10?
Start at [11 — Nest the pressure budget](lessons/11-ledger.md#L1).

For the larger destination, read the
[formalization assessment and proposal](../../docs/asymmetric-tensor-formalization-proposal.md).
It audits the present proof scope and proposes a route through a closed
transverse-wave sector, numerical experiments, coupled fields and chemistry.
The proposed milestones are not yet implemented.

- [Lesson 1 — Find a slot](lessons/01-slots.md): a runnable address map,
  three slot-swap laws, their proofs, and a rejected no-op counterexample.
- [Lesson 2 — Mirror or reverse](lessons/02-pairs.md): exact signed values,
  symmetric/antisymmetric pairs, twelve additional laws, proof reuse, and
  a rejected copying counterexample.
- [Lesson 3 — Capacity sets the diagonals](lessons/03-capacity.md): exact
  fractions, a positive-capacity input type, the budget identity and reciprocal.
- [Lesson 4 — Assemble the full sample](lessons/04-assembly.md): a stored
  4 × 4 matrix, an independent sixteen-slot contract and the full `S+A` split.
- [Lesson 5 — Ask the tensor a question](lessons/05-probes.md): recovery from
  stored entries, all sixteen contraction terms, and same-vector cancellation.
- [Lesson 6 — Move the labels, not the field](lessons/06-coordinates.md):
  a passive spatial cycle, two-index mapping and preserved symmetry/skew.
- [Lesson 7 — Give the changed reading a pressure scale](lessons/07-stress.md):
  nominal units, baseline subtraction and the focused `P_c(U−η)` definition.
- [Lesson 8 — Walk between samples](lessons/08-differences.md): positive
  spacing, force-density units and a frozen difference quotient.
- [Lesson 9 — Balance the shared face](lessons/09-flux.md): two cells,
  explicit tensor-flux orientation and exact interior cancellation.
- [Lesson 10 — Unpause a bounded experiment](lessons/10-evolution.md):
  affine state, finite fuel and a universal one-step momentum identity.

The user's runs of lessons 1–2 succeeded. One probe response correctly
described an antisymmetric pair while substituting it for the supplied
symmetric pair. The next lessons explicitly keep the starting state visible;
successful execution alone is not evidence of completing their learning probes.

The destination is a tensor you can read, construct, interrogate, and eventually
use in a simulation. Each lesson opens one part of that object, states a precise
contract, and leaves a Bend-checked proof of the implemented mathematics.[^scope]

[^scope]: A checked proof establishes the stated theorem under its premises
    and the checker’s guarantees. Matching those premises to the TeX is a
    separate source audit; establishing the model's physical identifications
    requires empirical evidence. This course keeps those three jobs distinct.

## The object stays in view

Place one sample at one location, in the focused document's local Cartesian
frame. Its component table has axes `t, x, y, z` on both edges:

```text
          t       x       y       z
    t    -q      -e_x    -e_y    -e_z
    x     e_x    1/q     -b_z     b_y
    y     e_y     b_z    1/q     -b_x
    z     e_z    -b_y     b_x    1/q
```

Here the teaching aliases are:

- `q = alpha_s² = P_static / P_c`: remaining pressure capacity;
- `e_i = alpha * v_perp,i / c`: dimensionless slip contribution;
- `b_i = alpha * t_p * Omega_i`: dimensionless twist contribution.

For the regular, nonnegative-load branch, use `0 < q <= 1`; the exhausted
endpoint `q = 0` has no reciprocal and needs a different state.

These aliases abbreviate the entries of
[`eq:unified_matrix`, section 3.3](../../RCCM-GfX-2.tex#L125); they are not new
SI electric or magnetic field definitions. `alpha` and `alpha_s` are different
quantities. Sixteen entries here come from seven effective scalar values,
not sixteen independently adjustable components. Their physical admissibility
also depends on the source fields and pressure ledger.

The diagonal and the off-diagonal pairs are different parts of one object:

```text
pressure capacity ──> symmetric diagonal S
slip and twist ─────> antisymmetric pairs A
                                  |
                              U = S + A
                                  |
                  stress, probes, fields, eventual evolution
```

The old pressure experiment is therefore useful, but subordinate:
it supplies a restricted `q`. It does not by itself construct `U`.
The new course starts with the table above, rather than making the learner
wait through unrelated arithmetic exercises before seeing the tensor.

## Jobs to be done

| When I am… | I want to… | So I can… | Observable evidence of learning |
|---|---|---|---|
| Looking at sixteen symbols | Find the axes, diagonals and paired slots | Read the object without decoding every symbol afresh | Locate the two entries affected by one twist component |
| Changing one physical input | Predict which entries change and their signs | Debug a tensor by inspection | Reverse `b_z` and predict both affected slots |
| Translating a TeX equation | Know each quantity's units, domain and dependencies | Avoid a plausible-looking but wrong implementation | Explain why `q = 0` is a ledger endpoint but not an admissible reciprocal |
| Asking an AI to implement something | State an independently readable law | Check the implementation without trusting its prose | Explain a law and identify a deliberately broken implementation it rejects |
| Using a tensor in another calculation | Know what that operation preserves or discards | Choose the right observable | Explain why a same-vector quadratic probe cannot see the antisymmetric part |
| Moving from one sample to a field | Separate stored state, spatial variation and evolution | Know what is still needed before anything moves | Distinguish a component difference, a derivative and a time update |
| Building a fast simulator | Preserve the exact reference while introducing approximation | Know what a frame or benchmark actually demonstrates | Read a proof result separately from numerical error and convergence results |

Treat programmer fluency as a useful starting representation, not evidence
that the mathematical prerequisites are already mastered. Begin each lesson
with a short prediction; skip explanations the learner already owns.

## Lesson sequence

All twenty milestones have checked declarations through [`LAWS.bend`](LAWS.bend).
The new contracts are **AI-drafted for human review**, not automatically
human-approved because their proofs pass. The gate contains 180 laws:
112 from lessons 1–10 plus 68 new declarations. The original 112 law bodies
are unchanged. Some new declarations are universal content contracts or
algebraic theorems; others are explicitly closed exact fixtures.

| Lesson | Scene and programming foothold | Implemented artifact and checked scope | Learner's prediction / exit gate |
|---|---|---|---|
| **1. Find a slot** | One sample; four named axes; `(row, column)` as an address | `Axis`, slot addressing and transpose-address operation. Prove that the output row is the input column, the output column is the input row, and swapping twice restores the slot | Point to `tx` versus `xt`; explain why swapping slots does not yet change a value's sign |
| **2. Mirror or reverse** | Compare pairs across the diagonal; introduce symmetric and antisymmetric structure | Exact signed values and an antisymmetric pair constructor. Prove sign reversal twice restores a value and each generated pair has opposite values | Reverse one slip or twist component and identify both affected entries; distinguish symmetry from antisymmetry |
| **3. Capacity sets the diagonals** | A finite pressure budget controls `-q` and `1/q`; units behave like types | Minimal exact fractions and a positive-capacity input contract. Prove the restricted ledger identity and reciprocal identity on their declared domains | Reduce `q`; predict both diagonals. Reject inversion at zero. Explain why `q` is squared admittance |
| **4. Assemble the full sample** | Combine the existing diagonal and paired entries | Local Cartesian `assemble`, with an independent specification for every slot. Prove `Sᵀ = S`, `Aᵀ = -A`, `U = S + A`, and the unloaded result `diag(-1,1,1,1)` | Build a nonzero slip-and-twist example; a wrong sign or axis must fail the slot laws |
| **5. Ask the tensor a question** | Two probe directions select or combine components; a tensor is more than its printed array | Component contractions and, over exact rationals, split recovery `(U+Uᵀ)/2 = S`, `(U-Uᵀ)/2 = A`; prove `xᵀAx = 0` | Explain why a same-vector probe misses `A`, while two different directions can reveal it |
| **6. Move the labels** | The same object under a passive spatial three-cycle | Two-index component mapping, three-cycle return, transpose/negation commutation and structural symmetry/skew preservation on arbitrary stored matrices | Track a twist into its new slots; distinguish relabelling, transposition and index raising |
| **7. Put pressure units back** | Subtract the baseline, then apply the pressure scale | Nominal erased unit tags and positive scales; focused `T = P_c(U−η)`, zero baseline and both diagonal formulas | Separate dimensionless entries from pressure; compare this definition with the Condensed stress-energy bridge |
| **8. Walk between samples** | Two stationary readings and their positive separation | Exact pressure difference quotient; independent content and constant-field-zero laws | Distinguish level, difference, secant slope and continuum derivative; halve the slope by doubling separation |
| **9. Balance a shared face** | Two equal-width cells and three supplied faces | Spatial transport-index contract, independent parallel cell gains, actual sum equals exterior-only negative divergence | Predict both gains; explain why internal cancellation does not forbid boundary exchange |
| **10. Unpause** | Existing signed momentum under supplied frozen fluxes | Affine state, nonnegative time, finite fuel; universal one-step boundary impulse and checked recurrence | Preserve old momentum, identify the omitted feedback/closure, and distinguish termination from stability |

Lessons 1–4 yield the first useful package: a readable, exactly specified
local tensor assembler. Lessons 5–7 make it usable and interpretable. Lessons
8–10 add a frozen-field experiment with explicitly chosen discrete rules.
Games, GPU kernels, general frame changes and downstream physical reductions
are later consumers. The full RCCM dynamics remain an open closure problem.

### Field lessons: 11–20

This second route builds tools to read and question the source fields before
guessing the missing simulation closure. The [plan](COURSE-11-20.md#L1)
was committed first; each lesson then gained its own checked checkpoint.

| Lesson | New artifact and Bend skill | Observable exit gate |
|---|---|---|
| [11. Nest the pressure budget](lessons/11-ledger.md#L1) | Same-unit macro/local/static ledger; constructive existential witness to regular capacity | Move load between macro and local compartments without changing total remaining capacity |
| [12. Normalize slip and twist](lessons/12-normalization.md#L1) | Unit-tagged `alpha*v/c` and `alpha*tp*Omega`; parallel plane-sample adapter | Change the speed reference or relaxation time and predict exactly which matrix entries move |
| [13. Differentiate a field program](lessons/13-fields.md#L1) | Polynomial AST, evaluator and structurally terminating differentiation | Trace both branches of a product derivative; separate a slope field from a sampled slope |
| [14. Build a Clebsch patch](lessons/14-clebsch.md#L1) | Gradient/cross/curl composition on vector programs | Predict internal versus total curl after adding a transverse field |
| [15. Follow a moving sample](lessons/15-transport.md#L1) | Material derivative, continuity residual and uncancelled momentum terms | Explain when a coefficient or density may leave a derivative |
| [16. Raise indices](lessons/16-indices.md#L1) | Explicit Minkowski sign rule and universal involution via proof reuse | Distinguish raising from transposition and predict time-space signs |
| [17. Contract without losing signs](lessons/17-contraction.md#L1) | Sixteen actual entry products, balanced reductions and universal pair cancellation | Explain why a zero self-contraction need not mean a zero antisymmetric tensor |
| [18. Test whether a strain fits](lessons/18-compatibility.md#L1) | Planar displacement-to-strain and Saint-Venant component | Distinguish a compatible displacement fixture from independently supplied strain |
| [19. Apply the operator twice](lessons/19-fourth-order.md#L1) | Full Laplacian composition, mixed fourth derivatives and a manufactured source | Restore dimensions and identify the missing boundary conditions |
| [20. Send a profile across the patch](lessons/20-waves.md#L1) | Wave residual, polymorphic template map and recursive identity proof | Match profile/operator speeds; distinguish parallel probes from dependent time evolution |

The crucial Hyperslice cuts are **supplied/derived**, **partial/material**,
**internal/total curl**, **transpose/raise**, **zero tensor/zero scalar**,
**operator application/boundary solve**, and **universal law/closed fixture**.
Change only one side of a scene at a time, keeping the original state visible.

Proof-reading exit: find a `for`-quantified law, a closed fixture, a `{==}`
reduction and an induction step. Explain why each supplies different evidence.
These lessons do not contain general mechanized real-analysis, full-matrix
orthogonality, wave-linearity or nonlinear-curvature theorems.

### Bend mastery track

The same route deliberately opens more of the language:
`discriminated unions -> equality/rewrite -> recursive Nat proofs ->
reusable Data -> erased nominal tags -> total domain-restricted functions ->
parallel calls -> affine state -> fuel-bounded recursion and native IO`.
Lessons 11–20 continue with
`constructive witnesses -> nominal physical APIs -> recursive syntax trees ->
field transformations -> equality composition -> polynomial operator reuse ->
polymorphic templates -> parallel trees and induction`.
Arrays, GPU calls and foreign effects remain deferred; they are not prerequisites
for understanding the tensor or necessary for these small exact experiments.

### First lesson: the address layer

The [lesson](lessons/01-slots.md) keeps the component map visible and
lights up one pair: `(t,x)` and
`(x,t)`. Ask:

1. If the row and column are swapped, where does the address land?
2. If they are swapped again, where does it return?
3. Does that operation alone require negating the stored value?

The lesson-1 slice contains named axes, slot accessors, swapping and
a tiny demonstration. The agreed coordinate-swap laws and “for every slot,
swap twice is identity” are proven by constructor cases. The broken
candidate “leave the slot unchanged” satisfies double-swap identity but
fails the coordinate-swap laws for off-diagonal slots.
This teaches specification sufficiency as well as proof checking. These
proofs concern index mechanics, not yet a physical property of the continuum.

The proofs check with the installed Bend version using `Base`, pattern
matching and equality. No linear-algebra framework, exact-real library or
renderer is needed.
Keep this lesson short; move straight to signed pairs if the learner already
predicts the slot operations correctly.

### Second lesson: the signed-pair layer

[Lesson 2](lessons/02-pairs.md) attaches exact integer values to paired
entries. It proves the sign operation, pair contents, and the pair-level
identities `Sᵀ = S` and `Aᵀ = -A`. The last proof reuses double negation via
Bend's equality rewrite. The pair record does not yet assign values to axes.

Predict a nonzero pair, reverse the input, then try zero. Zero shows why an
example can hide a copying bug; the content laws prevent a constructor from
passing merely by discarding every input and returning `(0,0)`.

## Package and law ownership

One focused subpackage should own one accumulating tensor specification.
Do **not** fork the tensor implementation or copy its laws into every lesson.

Current layout:

```text
bend/
  asymmetric-metric-tensor/
    README.md                 course map and lesson index
    LAWS.bend                 accumulates contracts for human review
    PROOF.bend                imports LAWS; supplies proofs of its laws
    tensor.bend               original axes, slots and integer pairs
    exact.bend                signed integers, Nat conversion, negation
    rational.bend             exact noncanonical signed fractions
    natural-proof.bend        constructive arithmetic induction lemmas
    capacity.bend             positive capacity and its reciprocal
    matrix.bend               full local Cartesian table and assembly
    probes.bend               split recovery and bilinear contraction
    coordinates.bend          passive two-index spatial cycle
    units.bend                erased nominal tags and positive magnitudes
    stress.bend               focused pressure-scaled deviation
    differences.bend          positive-spacing pressure quotient
    flux.bend                 spatial face selection and two-cell balance
    evolution.bend            affine state and fuel-bounded frozen forcing
    balance-helpers.bend      proved polynomial certificates, not axioms
    ledger.bend               nested budget and capacity witness adapter
    normalization.bend        physical slip/twist to dimensionless entries
    fields.bend               polynomial AST, evaluation and differentiation
    clebsch.bend              vector fields, gradient, cross and curl
    transport.bend            material derivative and continuity residual
    indices.bend              flat-background two-index raising
    contraction.bend          all sixteen metric-aware entry products
    compatibility.bend        planar strain and incompatibility
    operators.bend            Laplacian and biharmonic composition
    waves.bend                constant-speed wave residuals
    batch.bend                polymorphic parallel template map
    *-laws.bend               layer contracts imported by LAWS.bend
    *-proof.bend              layer proofs imported by PROOF.bend
    format.bend               display unreduced exact values
    verify.py                 lessons 1–10 workflows, oracle and mutations
    verify-fields.py          lessons 11–20 plus independent polynomial oracle
    verify-course.py          one entry point for both suites
    COURSE-6-10.md            design record for the first field experiment
    COURSE-11-20.md           design record for the source-field laboratory
    lessons/
      01-slots.md             scene, probe, law reading, proof walkthrough
      01-slots.bend           runnable demonstration
      01-noop.bend            wrong swap; valid proof of the weak law
      02-pairs.md             signed pairs and proof reuse
      02-pairs.bend           runnable sign/transpose comparison
      03-capacity.md/.bend    pressure shares and the reciprocal boundary
      04-assembly.md/.bend    all sixteen entries and the unloaded baseline
      05-probes.md/.bend      selectors, recovery and cancellation
      06-coordinates.md/.bend both indices move; no physical rotation
      07-stress.md/.bend      reference subtraction and pressure units
      08-differences.md/.bend levels, spacing and slope
      09-flux.md/.bend        shared-face cancellation
      10-evolution.md/.bend   old momentum plus finite impulse
      11-ledger.md/.bend      nested denominator boundaries
      12-normalization.md/.bend physical units to matrix entries
      13-fields.md/.bend      an executable derivative compiler
      14-clebsch.md/.bend     two routes to rotational vorticity
      15-transport.md/.bend   moving readings and uncancelled terms
      16-indices.md/.bend     background signature, not transposition
      17-contraction.md/.bend signed scalar from stored entries
      18-compatibility.md/.bend displacement versus arbitrary strain
      19-fourth-order.md/.bend manufactured source, not a solver
      20-waves.md/.bend       profile residuals and parallel probes
      example.bend           shared algebraic input for lessons 4–7
      field.bend             shared frozen-face fixture for lessons 9–10
      counterexamples/
        01-noop-row.bend      deliberately rejected equality claim
        02-copy-rejected.bend deliberately rejected copying claim
        03-zero-reciprocal.bend rejected regular-state claim at zero capacity
        04-wrong-twist.bend   rejected source-sign claim
        05-two-probes.bend    rejected overextension to different probes
        06-one-index.bend     rejected one-index coordinate change
        07-wrong-units.bend   rejected length-as-pressure argument
        08-no-spacing.bend    rejected difference-as-slope claim
        09-row-column.bend    rejected transposed transport index
        10-zero-time-resets.bend rejected loss of initial momentum
        11-*.bend … 20-*.bend one intentionally false claim per new lesson
```

The rational layer was added when capacity required fractions. A fraction
stores `(positive-negative)/(1+denominator_predecessor)`; `Same` compares
values by cross multiplication rather than requiring identical records.
The root gate imports all layer contracts and proofs, not separate competing
specifications for each lesson.

From the repository root:

```sh
bend bend/asymmetric-metric-tensor/lessons/01-slots.bend
bend bend/asymmetric-metric-tensor/lessons/02-pairs.bend
bend bend/asymmetric-metric-tensor/lessons/03-capacity.bend
bend bend/asymmetric-metric-tensor/lessons/04-assembly.bend
bend bend/asymmetric-metric-tensor/lessons/05-probes.bend
bend bend/asymmetric-metric-tensor/lessons/06-coordinates.bend
bend bend/asymmetric-metric-tensor/lessons/07-stress.bend
bend bend/asymmetric-metric-tensor/lessons/08-differences.bend
bend bend/asymmetric-metric-tensor/lessons/09-flux.bend
bend bend/asymmetric-metric-tensor/lessons/10-evolution.bend
bend bend/asymmetric-metric-tensor/lessons/11-ledger.bend
bend bend/asymmetric-metric-tensor/lessons/12-normalization.bend
bend bend/asymmetric-metric-tensor/lessons/13-fields.bend
bend bend/asymmetric-metric-tensor/lessons/14-clebsch.bend
bend bend/asymmetric-metric-tensor/lessons/15-transport.bend
bend bend/asymmetric-metric-tensor/lessons/16-indices.bend
bend bend/asymmetric-metric-tensor/lessons/17-contraction.bend
bend bend/asymmetric-metric-tensor/lessons/18-compatibility.bend
bend bend/asymmetric-metric-tensor/lessons/19-fourth-order.bend
bend bend/asymmetric-metric-tensor/lessons/20-waves.bend
bend bend/asymmetric-metric-tensor/PROOF.bend
```

All twenty-one commands run now. The proof gate prints `All terms check.`
None requires a separate JavaScript compilation step. The deliberately invalid
counterexamples are run separately as explained in the lessons, never imported
by `PROOF.bend`.

Repeatable validation (Python standard library plus installed Bend):

```sh
python3 bend/asymmetric-metric-tensor/verify-course.py --mutations
```

This runs both suites: all twenty native demos and intended failures, the
weak-law example, the accumulated proof gate and earlier pressure regressions.
Independent Python `Fraction` expectations check native APIs under one and
two CPU threads; the field oracle uses sparse polynomial coefficients rather
than copying the Bend derivative AST. Well-typed implementation mutants and
a missing proof must be rejected in temporary copies. Either suite can also
be run separately. Builds live in ignored `bend/build`, never in the source package.
The two-thread check is execution parity, not a speed benchmark or GPU test.

Law-driven loop:

1. We draft a law in plain language, with domains and its TeX source if any.
2. The human approves the corresponding Bend contract before it is frozen.
3. The agent implements code and `def Laws.name` proofs without changing that
   approved contract to make a proof pass.
4. `PROOF.bend` imports `LAWS.bend` and is the package gate. No open claims,
   `?TODO`, unsafe proof escape, or circular assumption of the desired result.
5. A proposed law change is a separate reviewable specification change.

Laws must constrain the actual exported operations. Merely proving a duplicate
toy implementation, repeating a definition as its own expected result, or
proving properties of an unconnected reference does not establish the target
implementation's contract.

## Exact proofs and executable numerics

**Recommendation: exact structural laws first, exact arithmetic as needed,
floating-point execution as a later checked approximation.**

- Start with finite axes and structural identities: no arithmetic library
  required for lesson 1.
- Bend 2.0.21's `Base --types` includes `Nat`, `U32` and `F32`, but does not
  list a signed-integer or rational type. Audit available operations/lemmas
  and compatible proof-bearing libraries first; reuse a reviewed, pinned
  dependency where practical. Add only the missing arithmetic needed for the
  next lesson.
- Use exact signed arithmetic for signs; introduce fractions when `1/q`
  becomes necessary. State rational-value equality explicitly: `1/2` and
  `2/4` need not have identical constructor representations. Prove arithmetic
  lemmas rather than silently assuming a field or relying on an unevaluated
  symbolic expression to establish an algebraic identity.
- Keep every premise visible. For example, reciprocal laws need nonzero
  input; the physical sample contract additionally restricts capacity.
- `F32` is not an exact real field, and its arithmetic did not reduce in the
  earlier checker experiment. Do not rename `tests.bend` to `PROOF.bend` or
  assume that importing laws proves these numerical operations.
- When introducing a numerical adapter, keep regression cases, error bounds,
  conservation residuals and convergence studies. A proof about the exact
  reference transfers to the adapter only through an explicit, established
  connection—not because the functions have matching names.

`LAWS`/`PROOF` therefore become the core mathematical contract, while numerical
tests retain a different job. The existing pressure tests remain intact until
their useful coverage is carried forward.

### Reference-kernel limits

The universal symbolic gates check, including semantic recovery and
`xᵀAx = 0` for every rational vector and generated antisymmetric sample.
Runtime results for all entries, both recovered parts, and signed probes were
also compared with independent rational arithmetic. That is separate evidence
about execution, not an extra physical claim.

The field extensions prove exact shared-face cancellation and a universal
single-step boundary impulse. Their polynomial helper proves normalization
soundness and correspondence to the original rational operations; certificates
are not assumed arithmetic facts. Fuel recurrence and termination are checked,
but there is no separate all-fuel conservation theorem. See
[lesson 10's exact proof scope](lessons/10-evolution.md#what-the-proof-gate-establishes).

Fractions are not reduced, so denominators grow quickly. Evaluating a large
closed full-probe equality inside the checker overflowed its machine stack;
the IO demonstration instead runs the calculation natively, while the gate
checks the general symbolic derivation. No unsafe bypass or new arithmetic
axiom was introduced. Target overflow limits, error-controlled numerical
adapters, performance and engine integration still need their own work.

## The lesson template

Every lesson should fit one prediction-and-feedback loop:

1. **Place it:** one location, pair of slots, probe or boundary.
2. **Change it:** one to three concrete examples; ask for a prediction first.
3. **Name it:** introduce only the notation and mathematics just encountered.
4. **Specify it:** read the law as a programmer reads an interface contract;
   name its domain, units and assumptions.
5. **Prove it:** connect each proof case to the scene, not just to checker output.
6. **Break it:** one meaningful mutation must be rejected by the contract.
7. **Return:** ask for a new prediction and record what the learner demonstrated.

A lesson is done when the learner can explain the invariant and predict a new
case, the approved laws check, the demonstration runs directly in Bend, and
the source/assumption boundary is visible. A green proof without understanding
is not completion of the learning job.

## Source map and open obligations

Use [`RCCM-GfX-2.tex`](../../RCCM-GfX-2.tex) first for this focused branch.
Compare the matching condensed derivations rather than silently merging them.

| Boundary | Current reading / obligation |
|---|---|
| Capacity and physical inputs | Sections 1–2 define Clebsch variables and the nested ledger. A freely assembled matrix is not automatically a realizable field: velocity, vorticity and load relationships need their own contracts. The relation from vorticity to `P_shear` needs closure before deriving a full sample from field data |
| Local matrix versus covariant construction | Section 3.3 supplies the displayed component table; section 3 also supplies a covariant expression with `u_mu` and `h_mu_nu`. Proving the component assembler does not prove their equivalence in arbitrary moving frames. Keep that bridge as a separate obligation |
| Coordinate/version boundary | The [condensed Rosetta-stone metric](../../RCCM-Condensed.tex#L3637) is diagonal with spherical-coordinate entries `r²` and `r² sin²(theta)`. It is not the same component table as the focused local Cartesian asymmetric matrix; require an explicit derivation before asserting equivalence |
| Zero capacity | The ledger can reach `q = 0`; the displayed matrix contains `1/q`. Separate exhausted-ledger state from regular tensor state. Do not import an arbitrary floor to make the reciprocal run |
| Stress definition | The focused [definition](../../RCCM-GfX-2.tex#L147-L170) is implemented. The Condensed [Rosetta bridge](../../RCCM-Condensed.tex#L3730-L3738) instead writes `T = sigma + rho u u`; equality between these identifications remains an obligation |
| Motion-source audit | Focused [§5.1](../../RCCM-GfX-2.tex#L322-L381) moves from `rho_dyn` to `rho_eff`; the identification needs justification. Its ambient-force admittance factor also needs comparison with the Condensed [cancellation and kinematic equation](../../RCCM-Condensed.tex#L2317-L2363). Lessons 9–10 choose an explicitly frozen spatial-flux balance, not a resolution of that gap |
| Discrete choices | Positive spacing, equal cell volumes, supplied faces, first-index spatial transport and `−div F` are explicit. No interpolation, implicit boundary wrap, pressure solve or velocity closure is inherited from the continuous equations |
| Clebsch versus modal fields | [Lesson 14](lessons/14-clebsch.md#L1) implements the focused `lambda grad beta` sector. The Condensed `curl A + curl v_psi` decomposition is related but not identical; smooth polynomial fixtures do not establish a singular topological defect |
| Contraction sign | [Lesson 17](lessons/17-contraction.md#L1) obtains `A:A=2(b²−e²)` using the focused printed matrix and flat `(-,+,+,+)` signature. Section 6.1's `E²−B²` prose needs an explicit normalization/sign bridge |
| Derivatives and action | [Lessons 15–20](COURSE-11-20.md#L11) preserve coefficient constancy, continuity premises, linearized compatibility, integration boundary terms and source normalization as separate obligations. Polynomial operator evaluation is not a boundary/initial-value solve |
| Physical identifications | Einstein reduction, electromagnetic identities and later corollaries need their own premise and evidence audits. They are not earned by the assembler or boundary-balance proofs |

This ledger is part of the course: a blocked proof can expose a missing premise,
a false translation, or an unresolved source step. Record the gap rather than
weakening the law or inventing a constitutive rule without review.
