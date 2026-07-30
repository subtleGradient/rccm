# TauLab Theoretical Framework

## Status

This document defines the first **implementation hypothesis** for RCCM-v0. It
is designed to make the corpus executable and falsifiable. It is not presented
as a derivation from established physics or as the unique completion of RCCM.

## Domain

- Three-dimensional Euclidean computational domain.
- Global coordinate time.
- Structured finite-volume cells.
- Periodic, reflecting, driven, or absorbing boundary families declared by
  each experiment.
- Normalized tau units with `c = rho0 = L0 = 1`.

## Primary state

For every resolved cell:

| Symbol | Meaning | Shape | Dimension |
|---|---|---|---|
| `rho` | mass density | scalar | `M L^-3` |
| `m` | linear momentum density `rho v` | vector | `M L^-2 T^-1` |
| `E` | total energy density | scalar | `M L^-1 T^-2` |
| `s` | intrinsic angular-momentum density | vector | `M L^-1 T^-1` |
| `C` | symmetric elastic conformation/memory | symmetric tensor | `1` |
| `phi` | cavity phase | scalar | `1` |

Derived fields include velocity, internal energy, microrotation, pressure,
symmetric stress, couple stress, chemical potential, divergence, vorticity,
Helmholtz sectors, rotational velocity, and topological observables.

## Candidate closure

The theory bundle must instantiate one free-energy density with these explicit
parts:

```text
bulk compressive energy
+ internal thermal energy
+ symmetric elastic-memory energy
+ microrotation/couple energy
+ cavity double-well energy
+ cavity-interface gradient energy
```

Pressure and reversible stresses are derivatives of this shared free energy.
Relaxation, viscosity, spin coupling, thermal conduction, and cavity mobility
are declared dissipative operators with nonnegative coefficients.

No observable extractor may feed back into this free energy or its evolution.

## Governing evolution

RCCM-v0 contains:

1. conservation of mass;
2. conservation of linear momentum with pressure, symmetric/couple, viscous,
   and diffuse-interface stresses;
3. conservation of total energy including boundary/source work and declared
   dissipation;
4. balance of intrinsic angular momentum and microrotation;
5. objective Maxwell-type evolution of symmetric elastic memory;
6. advective diffuse-interface evolution of cavity phase.

The numerical implementation may operator-split conservative transport from
stiff constitutive response, but the split operators and their error order are
part of the solver identity.

## Dimensional repairs

The RCCM expression

```text
|curl(v)| → c
```

is not dimensionally valid. RCCM-v0 instead defines:

```text
omegaFluid = curl(v)        # T^-1
vRot = ellRot * omegaFluid  # L T^-1
```

Only `vRot` may be compared with `c`. `ellRot` is a versioned parameter or
derived local scale with an acyclic dependency.

## Kinematic sectors

The primary velocity is decomposed diagnostically:

```text
v = gradient(h) + curl(A) + harmonic remainder
```

Independent microrotation is not the same object as `curl(v)`. Their
difference drives couple stress and spin relaxation in the candidate closure.

The symmetric elastic tensor is decomposed into:

- one volumetric trace;
- five symmetric traceless components.

Independent microrotation supplies three rotational components. The combined
count is a kinematic `5 + 3` ledger, not an `SU(3)` proof.

## Observable extractors

Initial extractors may measure:

- mass-energy contained by a control volume;
- winding, circulation, helicity, and cavity topology;
- pressure/compliance terrain and its gradient;
- transverse disturbance and Maxwell-equation residuals;
- microrotation/vorticity axes and torque;
- force and momentum transfer through a control surface.

Names such as `particle`, `charge`, `gravity`, and `magnetism` remain candidate
labels until the corresponding validation gates pass.

## Solver contract

The reference discretization is:

- second-order conservative finite volume on a structured grid;
- deterministic double-precision CPU execution;
- explicit conservative transport under a reported CFL bound;
- implicit or semi-implicit stiff constitutive updates;
- full experiment and checkpoint identity in every result.

The Metal backend implements the same discrete operators and is validated
against the CPU backend rather than against a visual result.

## Scientific comparison

A theory version can progress only through:

```text
formal closure
→ numerical convergence
→ stable continuum primitives
→ emergent topological objects
→ reference-equation residuals
→ calibrated experimental agreement
→ protected holdouts
→ distinguishing prediction
→ external reproduction
```

