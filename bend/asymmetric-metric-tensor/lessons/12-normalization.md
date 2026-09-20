# Lesson 12 — Normalize slip and twist

[Previous](11-ledger.md) · [Course](../README.md) · [Next](13-fields.md)

## Two sensors, two reference scales

Place a small Cartesian patch in the battle room. A leading ghost measures
**x-directed transverse velocity**; a shoulder–hip couple measures **z-axis
rotation rate**, not translation. The matrix needs dimensionless readings
from each. Compare motion to a speed scale and rotation to a clock:

```text
vx [m/s] -- divide by c [m/s] -- multiply by alpha --> e_x --> tx / xt
Oz [1/s] -- multiply by tp [s] -- multiply by alpha --> b_z --> xy / yx
```

Starting values: `q=1/2`, `alpha=1/2`, `vx=2 m/s`, `c=4 m/s`,
`tp=1/4 s`, `Oz=3/s`. Keep the patch orientation fixed.
**Predict:** which entries change if only `c` doubles? Which if only `tp`
doubles? Does changing either scale turn `alpha` into `alpha_s`?

## Attach the source equation

$$e_x=\alpha v_x/c=1/4,\qquad b_z=\alpha t_p\Omega_z=3/8.$$

Thus `U_tx=-1/4`, `U_xt=1/4`, `U_xy=-3/8`, `U_yx=3/8`.
The same calculation normalizes any signed component; the demo chooses two.
Frequency here is signed angular rate in inverse seconds, not cyclic
frequency in hertz with an implicit extra $2\pi$.

[GfX §3.2](../../../RCCM-GfX-2.tex#L117-L139) specifies the normalization
and matrix signs. Compare [Condensed's Faraday/vorticity mapping](../../../RCCM-Condensed.tex#L3741-L3746):
the normalized `e,b` here are not SI electric/magnetic field definitions.
Nor is a velocity-gradient skew automatically the independent Clebsch field.

## Bend: units at the API boundary

[`slip` and `twist`](../normalization.bend#L7) accept different nominal tags.
The erased type parameter keeps these distinctions in checking without
putting a unit string into every runtime number. `Positive<Speed>` prevents
zero division; `Positive<Time>` explicitly selects positive relaxation time.
The signed `alpha` API performs algebra for any rational: a physical modulus
range is an additional model constraint, not enforced here.

[`plane`](../normalization.bend#L16) shares `+alpha`, computes the two
independent normalizations with a parallel call, then feeds lesson 4's
assembler. That is a deliberately restricted plane fixture: the other four
off-diagonal inputs are zero, and capacity is supplied separately. This is
not a Bernoulli-consistent velocity-to-capacity closure.

The three [laws](../normalization-laws.bend#L8) quantify over all their
declared inputs and specify the actual formulas, not merely a symmetry that
a zero-returning function could satisfy. Their proofs reduce the typed wrappers
and implementation; the physical unit audit above is still a separate job.

## Run and break the boundary

```sh
bend bend/asymmetric-metric-tensor/lessons/12-normalization.bend
bend bend/asymmetric-metric-tensor/PROOF.bend
bend bend/asymmetric-metric-tensor/lessons/counterexamples/12-frequency-is-speed.bend
```

The last command must reject `frequency_is_velocity` because `Frequency`
is not `Speed`, before doing any physics. A nominal tag cannot stop a caller
from manually wrapping a mislabelled raw measurement.

**Next probe:** reverse `Omega_z` only. Predict both spatial pair entries,
both time-space pair entries, and both kinds of diagonal. Then verify.
