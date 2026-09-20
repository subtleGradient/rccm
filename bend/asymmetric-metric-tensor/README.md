# Learn the asymmetric metric tensor through Bend

**Status: lessons 1–7 are implemented and checked with Bend 2.0.21.
Lessons 8–10 are being built from the [next-five plan](COURSE-6-10.md).**

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

These are incremental milestones, not a commitment to build the whole course
at once. Lessons 1–5 have checked Bend declarations through [`LAWS.bend`](LAWS.bend).
The later laws below remain **mathematical specifications to draft and review**.

| Lesson | Scene and programming foothold | Small artifact and candidate proof | Learner's prediction / exit gate |
|---|---|---|---|
| **1. Find a slot** | One sample; four named axes; `(row, column)` as an address | `Axis`, slot addressing and transpose-address operation. Prove that the output row is the input column, the output column is the input row, and swapping twice restores the slot | Point to `tx` versus `xt`; explain why swapping slots does not yet change a value's sign |
| **2. Mirror or reverse** | Compare pairs across the diagonal; introduce symmetric and antisymmetric structure | Exact signed values and an antisymmetric pair constructor. Prove sign reversal twice restores a value and each generated pair has opposite values | Reverse one slip or twist component and identify both affected entries; distinguish symmetry from antisymmetry |
| **3. Capacity sets the diagonals** | A finite pressure budget controls `-q` and `1/q`; units behave like types | Minimal exact fractions and a positive-capacity input contract. Prove the restricted ledger identity and reciprocal identity on their declared domains | Reduce `q`; predict both diagonals. Reject inversion at zero. Explain why `q` is squared admittance |
| **4. Assemble the full sample** | Combine the existing diagonal and paired entries | Local Cartesian `assemble`, with an independent specification for every slot. Prove `Sᵀ = S`, `Aᵀ = -A`, `U = S + A`, and the unloaded result `diag(-1,1,1,1)` | Build a nonzero slip-and-twist example; a wrong sign or axis must fail the slot laws |
| **5. Ask the tensor a question** | Two probe directions select or combine components; a tensor is more than its printed array | Component contractions and, over exact rationals, split recovery `(U+Uᵀ)/2 = S`, `(U-Uᵀ)/2 = A`; prove `xᵀAx = 0` | Explain why a same-vector probe misses `A`, while two different directions can reveal it |
| **6. Change the coordinate labels** | The same object described using rotated/relabelled spatial axes | Start with a declared spatial-axis permutation and the covariant component rule `U' = Jᵀ U J`. Prove preservation of the symmetric/antisymmetric split for that transformation | Track a twist into its new slots; distinguish transposition from raising an index and from a change of frame |
| **7. Turn strain into stress** | Subtract the baseline, then apply the pressure scale | Implement section 4's definition `T = P_c (U - eta)`. Prove zero deviation stress at the baseline and `T_00 = P_c(1-q)` | Separate dimensionless tensor entries from pressure/energy-density units; identify what was defined versus derived |
| **8. Place neighbouring samples** | Several stationary locations; explicit spacing and boundaries | An exact discrete difference operator. Prove a constant field has zero difference and an interior-flux cancellation identity for the chosen stencil | Distinguish a sample from a field and a discrete operator from a continuum derivative |
| **9. Choose a rule for motion** | A field changes through time under an explicit evolution hypothesis | Only after the motion-source audit: one bounded time step with stated constitutive/boundary rules. Prove the selected discrete bookkeeping invariant; measure numerical error separately | Name the evolved state, closure, boundary flux and time-step restriction; do not infer a solver from the matrix alone |

Lessons 1–4 yield the first useful package: a readable, exactly specified
local tensor assembler. Lessons 5–7 make it usable and interpretable. Lessons
8–9 begin a simulation, conditional on the required equations being closed.
Games, GPU kernels, general frame changes and downstream physical reductions
are later consumers, not prerequisites for the first lesson.

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
    LAWS.bend                 imports implementation; approved contracts
    PROOF.bend                imports LAWS; supplies proofs of its laws
    tensor.bend               original axes, slots and integer pairs
    exact.bend                signed integers, Nat conversion, negation
    rational.bend             exact noncanonical signed fractions
    natural-proof.bend        constructive arithmetic induction lemmas
    capacity.bend             positive capacity and its reciprocal
    matrix.bend               full local Cartesian table and assembly
    probes.bend               split recovery and bilinear contraction
    *-laws.bend               layer contracts imported by LAWS.bend
    *-proof.bend              layer proofs imported by PROOF.bend
    format.bend               display unreduced exact values
    lessons/
      01-slots.md             scene, probe, law reading, proof walkthrough
      01-slots.bend           runnable demonstration
      01-noop.bend            wrong swap; valid proof of the weak law
      02-pairs.md             signed pairs and proof reuse
      02-pairs.bend           runnable sign/transpose comparison
      03-capacity.md/.bend    pressure shares and the reciprocal boundary
      04-assembly.md/.bend    all sixteen entries and the unloaded baseline
      05-probes.md/.bend      selectors, recovery and cancellation
      example.bend           shared algebraic input for lessons 4–5
      counterexamples/
        01-noop-row.bend      deliberately rejected equality claim
        02-copy-rejected.bend deliberately rejected copying claim
        03-zero-reciprocal.bend rejected regular-state claim at zero capacity
        04-wrong-twist.bend   rejected source-sign claim
        05-two-probes.bend    rejected overextension to different probes
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
bend bend/asymmetric-metric-tensor/PROOF.bend
```

All six commands run now. The proof gate prints `All terms check.`
None requires a separate JavaScript compilation step. The deliberately invalid
counterexamples are run separately as explained in the lessons, never imported
by `PROOF.bend`.

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
| Motion-source audit | Section 5.1 moves from `rho_dyn` in the grouped momentum terms to `rho_eff`; the identification needs justification. Dividing its force equation by `rho_tau / alpha_a` also appears to multiply the ambient-pressure force by `alpha_a`, whereas `eq:kinematic_ns` omits that factor. Resolve or explicitly choose and label an implementation hypothesis before lesson 9 |
| Physical identifications | Section 4's stress definition is an initial algebra target; Einstein reduction, electromagnetic identities and later corollaries need their own premise and evidence audits. They are not earned by passing the assembler laws |

This ledger is part of the course: a blocked proof can expose a missing premise,
a false translation, or an unresolved source step. Record the gap rather than
weakening the law or inventing a constitutive rule without review.
