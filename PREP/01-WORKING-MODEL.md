# TauLab Working Model

## Prior that was attacked

> The equations and identifications in `RCCM-Condensed.tex` already define one
> closed continuum model that can be translated directly into a numerical
> solver, and a learned surrogate can later reproduce that solver.

## Falsification result

The prior is false in its direct form.

The corpus contains candidate pieces of a model—continuity and momentum
language, modal admittances, pressure budgets, a proposed Lagrangian,
Maxwell-shaped identities, particle topology stories, and interaction
mappings—but does not yet supply one dimensionally closed set of state
variables, constitutive equations, transition dynamics, boundary conditions,
and probability rules sufficient for arbitrary subatomic simulation.

## Updated hypothesis

> A useful RCCM research program can be implemented by converting the corpus
> into immutable, explicitly completed candidate theories. Each missing closure
> is introduced as a minimal versioned hypothesis; each version is compiled,
> solved, convergence-tested, calibrated only on declared evidence, and then
> attacked with protected holdouts. Learned models may accelerate the numerical
> solver but may not certify independent scientific results.

## First executable candidate

`RCCM-v0` is a **compressible micropolar viscoelastic diffuse-interface
continuum**. This title describes a proposed implementation bridge; it is not a
claim that the existing RCCM corpus derives the complete bridge.

Primary resolved state:

```text
mass density
+ linear momentum density
+ total energy density
+ independent angular momentum / microrotation
+ symmetric elastic memory
+ cavity phase
= TauState
```

Candidate observable route:

```text
TauState
→ derived pressure, strain, vorticity, microrotation, and topology
→ RCCM candidate observables
→ reference equations and experimental measurements
```

The solver does not contain separately coded gravity, Coulomb force, magnetic
force, particle identities, or decay recipes. Those are targets whose
appearance must be measured rather than assumed.

## Expected failure modes

1. The proposed free energy may not admit stable finite-energy cavities.
2. Vortices may diffuse or collapse rather than behave as persistent matter.
3. Pressure, transverse, and rotational observables may not obey the claimed
   inverse-square or Maxwell limits.
4. A single parameter set may fit one benchmark and fail another.
5. Results may vary with grid scale, domain size, or boundary treatment.
6. Micropolar and strain sectors may fail to reproduce the claimed gauge and
   `SU(3)` structures.
7. Deterministic field evolution may not reproduce quantum probabilities,
   statistics, contextuality, or entanglement.
8. A learned surrogate may conserve one-step error while drifting
   topologically over long rollouts.

## Redraw conditions

Rewrite or retire a theory version when any of the following occurs:

- an equation fails dimensional or tensor-shape validation;
- no converged numerical solution exists in its declared domain;
- a claimed emergent object disappears under refinement;
- a protected holdout fails outside declared uncertainty;
- a parameter dependency reaches protected evidence;
- a surrogate cannot remain inside its certified error and invariant bounds;
- a simpler rival model explains the same observations with fewer assumptions.

## Scientific status

At project start, this working model is an implementation hypothesis. It is not
an experimentally tested finding, an accepted replacement for the Standard
Model, or evidence that the tau ontology is physically real.

