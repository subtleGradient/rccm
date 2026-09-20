# Lesson 11 — Nest the pressure budget

[Previous](10-evolution.md) · [Course](../README.md) · [Next](12-normalization.md)

## Two boundaries around the same remaining capacity

Picture the pressure ledger as a six-slot container, not six physical fluid
parcels. Two slots are charged to the background, one to local motion/shear,
three remain. The skin-squeeze cue would read physical pressure; this diagram
instead reads **remaining capacity**, not force on a body.

```text
critical Pc:       [macro macro | local | static static static]
ambient boundary:               [local | static static static]
static boundary:                       [static static static]
```

Before running: what fraction of the large container is ambient? What
fraction of the ambient container remains static? Multiply those readings.
Now move one unit of macro load to local load without changing the static
three. Which readings move; which one stays?

## Denominators are part of the meaning

Write $r=P_{static}$, $\ell=P_{dyn}+P_{shear}$, $m=\Delta P_{macro}$,
all measured in the **same** positive pressure unit:

$$
P_c=r+\ell+m,\quad P_{ambient}=r+\ell,\quad
\alpha_g^2=\frac{r+\ell}{r+\ell+m},\quad
\alpha_a^2=\frac r{r+\ell},\quad
q=\frac r{r+\ell+m}.
$$

The middle boundary cancels in the product. Every ratio has dimensions
`pressure / pressure = 1`. Do not take square roots: the matrix uses $q$,
and rational squares need not have rational roots.

The expected readings are `4/6`, `3/4`, `3/6`; their product is `12/24`.
These are equal **values**, not necessarily equal fraction records.

## Bend: construct the domain, then return a witness

[`Budget`](../ledger.bend#L6) stores `static_predecessor`, so `r=1+p`.
`local_load` and `macro_load` can be zero. This is the regular nonnegative-load
branch; exhausted or overloaded states cannot be represented here. It does
not validate arbitrary measured inputs or calculate shear pressure.

[`capacity`](../ledger.bend#L9) reuses lesson 3's `Regular` rather than
inventing another reciprocal implementation. A TypeScript analogue is a
constructor returning a refined positive-budget type, not a numeric clamp.

The [`capacity_witness` law](../ledger-laws.bend#L22) says `exs state`:
produce both a regular-capacity value and evidence that it has the desired
reading. [`The proof`](../ledger-proof.bend#L11) returns `(value, proof)`.
That is a constructive existential, not a Boolean search or an assertion cast.

## Run, inspect, break

```sh
bend bend/asymmetric-metric-tensor/lessons/11-ledger.bend
bend bend/asymmetric-metric-tensor/PROOF.bend
bend bend/asymmetric-metric-tensor/lessons/counterexamples/11-wrong-denominator.bend
```

The last command must reject `local_uses_critical`. The first three content
laws and the capacity witness quantify over all budget counts. The nested
product law is a **closed exact fixture**, not a universal fraction-cancellation
proof. The displayed cancellation above supplies the ordinary algebraic
argument; keep that distinction when reading the gate.

## Return to the source

[GfX §2](../../../RCCM-GfX-2.tex#L58-L85) supplies this nested ledger.
[Condensed modal admittance](../../../RCCM-Condensed.tex#L2738-L2765)
instead separates longitudinal, transverse and rotational modal capacities.
Those modal factors are not automatically these nested fractions.

**Next probe:** keep `Pc=6` and static `3`, but use local `2`, macro `1`.
Predict both compliance squares, their product, and the tensor's `tt` and `xx`
entries before editing `Budget{2n, 2n, 1n}`.
