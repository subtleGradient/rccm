# From one tensor to a bounded field experiment

This is the build plan for lessons 6–10, following the checked local tensor
in lessons 1–5. The destination is a reader who can track a tensor through
coordinates, units, space and a small time update, and can explain which of
those claims Bend checked.[^scope]

**Delivery:** all five lessons are implemented. Start at the
[lesson index](README.md#lesson-sequence); run the accumulated
[`PROOF.bend`](PROOF.bend) and [native verification](verify.py).
The following plan is retained as the design record, not unfinished status.

[^scope]: The proofs establish the written contracts, within Bend's checker
    and runtime boundaries. Source correspondence, numerical convergence
    and independent physical validation are separate jobs. The new laws are
    AI-drafted specifications for human review, not already human-approved.

## Terrain and jobs to be done

```text
one local table
    -> move coordinate labels without moving the fluid
    -> subtract the reference and restore pressure units
    -> sample more than one location with a declared distance
    -> balance the same face between two cells
    -> apply a declared impulse, then repeat with finite fuel
```

| Lesson | Reader's job | New mathematics | New Bend foothold | Artifact / exit evidence |
|---|---|---|---|---|
| 6 — Move the labels, not the fluid | Follow the same physical reading into new addresses | Passive spatial permutation; two-index transformation | Total pattern matching; composing functions; proof reuse | Relabel a stored matrix; prove the component rule and preservation of the split; predict where the old `xy` entry goes |
| 7 — Put pressure units back | Distinguish dimensionless capacity from stress | `T = P_c(U − η)`; reference subtraction; dimensions | Nominal unit types; erased type information; modules | A stress component API, zero baseline and time-diagonal law; reject a dimensionally wrong call |
| 8 — Walk between samples | Tell level, difference and slope apart | Positive spacing; exact one-dimensional difference quotient | Domain types; pure transformations; explicit inputs | A frozen stencil; prove constant input gives zero; predict the effect of doubling spacing |
| 9 — Balance the shared face | Count each internal interaction once with opposite signs | Spatial stress divergence; telescoping boundary balance | Shared `Data`, explicit `+`, independent parallel calls | Two equal-width cells and three supplied faces; prove that internal contributions cancel |
| 10 — Unpause a bounded experiment | Preserve existing momentum while adding an impulse | `momentum density += time × force density`; explicit time discretization | Affine state; structurally decreasing fuel; native IO | A finite run under frozen faces; checked step contents and momentum bookkeeping; predict a sign-reversed or zero-time run |

Every lesson follows **scene -> starting state -> prediction -> direct run ->
notation -> source -> law -> proof -> broken candidate -> return probe**.
Write the starting addresses, units and boundary values before transforming
them. A successful run does not answer the learner's prediction for them.

## Decisions and boundaries

- **Coordinates:** start with an orientation-preserving three-cycle of spatial
  axes, keeping time fixed. This exposes both indices without silently turning
  an axis reflection into a rotation or needing a general matrix inverse.
  Transposition, index raising and observer boosts are different operations.
- **Units:** keep the existing exact rational representation. Add the smallest
  nominal unit boundary the public operations need, not a general units algebra.
  A tag catches API mix-ups; it cannot verify the provenance of a measured value.
- **Space:** use an explicit positive distance and three externally supplied
  face samples. No implicit periodic wrap, edge padding or interpolation.
  A finite difference is an exact calculation on samples, not an exact
  continuum derivative for every possible underlying field.
- **Balance:** contract the spatial derivative index explicitly. For an
  asymmetric tensor, selecting a row instead of a column can reverse a twist
  contribution. Keep the face orientation and force convention visible.
- **Time:** evolve one momentum-density component in two equal-width cells,
  with a supplied frozen stress field and no advection. This is a deliberately
  bounded forced subsystem, not a closed tau-fluid solver. Do not update
  capacity from momentum by guessing a density law.
- **Performance:** preserve the exact reference first. Use independent balanced
  CPU calls where they naturally exist, but do not promise a speedup for two
  tiny cells. GPU, arrays and foreign effects follow only when a larger
  workload actually needs them; read their Bend guides at that point.

## Source route and implementation gate

Read `RCCM-Condensed.tex`'s tensor definition, Rosetta-stone stress mapping,
and motion equations first, then compare `RCCM-GfX-2.tex` §§3–5. Record the
index, density and admittance-factor boundaries before the dynamics lesson.
The focused matrix remains the component contract established in lessons 1–5;
neither source silently completes the other.

The exact reference is also a learning tool for source criticism:

1. What was defined?
2. What follows algebraically from that definition?
3. Which continuum equation is proposed?
4. Which numerical or boundary rule did this course choose?
5. What observation could test the physical identification?

The completed audit preserves three visible gaps:

- The focused [`T=P_c(U−η)` definition](../../RCCM-GfX-2.tex#L147-L170)
  is not automatically the Condensed
  [`T=sigma+rho u u` bridge](../../RCCM-Condensed.tex#L3730-L3738).
- The focused [density/force argument](../../RCCM-GfX-2.tex#L322-L381)
  and the Condensed [admittance cancellation](../../RCCM-Condensed.tex#L2317-L2324)
  do not specify one unique executable closure.
- The course chooses supplied frozen spatial faces, equal cell volumes and
  negative-divergence gain. Its one-step identity is universal; its finite
  recurrence is checked, but no separate all-fuel conservation theorem,
  runtime magnitude bound or PDE convergence theorem is claimed.

## Incremental delivery

1. Commit this plan before extending the implementation.
2. Add each lesson's implementation, separate laws and proofs, walkthrough,
   direct native demo and an expected-failure example.
3. Import every successful layer through root `LAWS.bend` / `PROOF.bend`;
   keep deliberately false examples out of the successful gate.
4. Check the accumulated gate, run the demo, confirm the intended failure,
   then commit and push to `local` before the next lesson checkpoint.
5. Finish with an automated native regression runner, independent exact
   numerical expectations, isolated well-typed mutations, and a clean-archive
   check so the course does not depend on untracked files.

Existing law bodies remain fixed. If a new draft needs revision, record why;
never weaken a claim merely to turn a red checker green. Keep proof successes,
native execution results and learner responses in separate ledger entries.

## After these five

The next decisions are the constitutive closure and source coefficient audit,
then boundary conditions, conservation and convergence on a larger mesh.
Only then choose floating-point tolerances, arrays, GPU scheduling or an engine
adapter. General covariance, recovered electromagnetic/Einstein equations and
the full RCCM physical identification are not delivered by this small experiment.
