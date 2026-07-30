# RCCM Table 1 in TypeScript Notation

This note translates **Table 1: Kinematic Nomenclature & Metric Constants**
from `RCCM-Condensed.tex` into TypeScript-shaped notation.

The purpose is to learn how to parse the mathematical notation. The code is a
conceptual translation of the document's vocabulary, not a numerical
implementation or an independent validation of its physical claims.

## Terrain

Read each mathematical symbol as an identifier plus a shape:

- A subscript usually refines the variable's name.
- Parentheses apply a function to an input.
- Bold symbols or square brackets usually indicate a vector, matrix, or
  tensor-like structure.
- `≡` means “is defined as” or “is identified with.”
- `∝` means “is proportional to.”
- `→` means “approaches” in a limiting process.
- A superscript `−1` on a matrix means matrix inversion.

## Primitive quantities

The following declarations give names to the quantities that appear in the
table. Their numerical values are deliberately left unspecified.

```ts
type Scalar = number
type Radius = number
type Time = number
type Velocity = number
type Pressure = number
type MassDensity1D = number
type MassDensity3D = number
type Area = number

declare const tau: Scalar
declare const t: Time
declare const tau0: Time
declare const Rh0: Radius
declare const lambdaC: Radius
declare const planckLength: Radius

declare const speedOfLight: Velocity
declare const volumetricMassDensity: MassDensity3D
declare const transverseYieldArea: Area
declare const lorentzFactor: Scalar
declare const reducedPlanckConstant: Scalar
```

These aliases are pedagogical. A later implementation could replace `number`
with branded dimensional types so that invalid unit combinations fail during
type-checking.

## Spacetime values

```ts
const absoluteMetricTime = tau
// bold τ

const properTime = t
// t

const cosmologicalAge = tau0
// τ₀

const horizonRadiusNow = Rh0
// Rₕ,₀
```

The subscript `0` usually denotes a baseline or present-epoch value here. It
does not mean JavaScript array access.

## Equivalent names and boundary radii

The symbol `≡` introduces a definition or an asserted identification.

```ts
const topologicalBoundaryRadius = lambdaC
// Rₕ,ₚ ≡ λc

const cavitationRadius = planckLength
// lₚ
```

This is closest to giving one value a clearer alias:

```ts
const Rhp = lambdaC
```

## Velocity fields

Parentheses indicate that the symbol is a function evaluated at an input:

```ts
declare function v0(radius: Radius): Velocity
declare function vPhi(radius: Radius): Velocity

const macroscopicVelocity = (radius: Radius): Velocity => v0(radius)
// v₀(r)

const circulationVelocity = (radius: Radius): Velocity => vPhi(radius)
// v_obs(r) ≡ v_φ(r)
```

The mathematical expression:

```text
v₀(r)
```

has almost exactly the same syntax as:

```ts
v0(r)
```

## Acoustic yield pressure

The document defines:

\[
P_c \equiv \frac{1}{2}\rho_\tau c^2
\]

In TypeScript notation:

```ts
const acousticYieldPressure: Pressure =
  0.5 * volumetricMassDensity * speedOfLight ** 2
// P_c ≡ ½ρ_τc²
```

Important syntax translations:

- Mathematical adjacency means multiplication:
  `ρτ c²` becomes `rhoTau * c ** 2`.
- TypeScript exponentiation uses `**`.
- TypeScript's `^` operator means bitwise XOR, not exponentiation.
- `½` becomes `0.5`.

The associated baseline tension is the negative of this pressure:

```ts
const baselineTension: Pressure = -acousticYieldPressure
// T_c = -P_c
```

## Dynamic pressure deficit

```ts
declare const dynamicPressureDeficit: Pressure
// P_dyn
```

`dyn` is a descriptive subscript meaning “dynamic.” It is part of the
quantity's name, not an operation.

## Refractive index and null geodesics

```ts
declare function n(radius: Radius): Scalar

const refractiveIndex = (radius: Radius): Scalar => n(radius)
// n(r)
```

The table associates this function with a null-geodesic constraint:

```ts
declare const dsSquared: Scalar

const isNullGeodesic = dsSquared === 0
// ds² = 0
```

The mathematical `=` states an equation or constraint. TypeScript's `===`
performs a runtime comparison, so this translation expresses the corresponding
boolean test rather than replacing the mathematical meaning of equality.

## Deborah number

The document describes the Deborah number as:

\[
De = \omega t_r
\]

In TypeScript:

```ts
declare const angularFrequency: Scalar
declare const relaxationTime: Time

const deborahNumber =
  angularFrequency * relaxationTime
// De = ωt_r
```

The absence of an operator between `ω` and `t_r` means multiplication.

## Winding number

```ts
type WindingNumber = number

declare const windingNumber: WindingNumber
// W
```

The document uses `W` for the chirality or winding of a topological cavity.
Depending on the model, example values might be `+1` and `-1`.

## Scalar admittance

The document defines:

\[
\alpha_s \equiv \frac{1}{\gamma}
\]

In TypeScript:

```ts
const scalarAdmittance: Scalar =
  1 / lorentzFactor
// α_s ≡ 1/γ
```

It also describes a residual pressure ratio:

```ts
const residualPressureRatio: Scalar =
  1 - dynamicPressureDeficit / acousticYieldPressure
// 1 - P_dyn/P_c
```

The notation `α_s` means “alpha with the label `s`.” A useful identifier is
therefore either `alphaS` or the more semantic `scalarAdmittance`.

## Baseline transverse admittance

```ts
const fineStructureConstant: Scalar = 1 / 137
// α ≈ 1/137

const rotationalTransverseCoupling: Scalar =
  fineStructureConstant
// α_(↻⊥) ≡ α
```

The symbol `≈` means approximately equal. The expression `1 / 137` is a rough
value, not an exact definition of the fine-structure constant.

## Admittance tensor

The expression:

\[
[\boldsymbol{\alpha}]
\]

means that `α` is being treated as a matrix or tensor rather than one scalar.

For a simplified diagonal representation:

```ts
type Matrix3 = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
]

declare const longitudinalAdmittance: Scalar
declare const transverseAdmittance: Scalar
declare const rotationalAdmittance: Scalar

const admittanceTensor: Matrix3 = [
  [longitudinalAdmittance, 0, 0],
  [0, transverseAdmittance, 0],
  [0, 0, rotationalAdmittance],
]
```

The directional subscripts translate as:

```ts
const alphaParallel = longitudinalAdmittance
// α_∥

const alphaPerpendicular = transverseAdmittance
// α_⊥

const alphaRotational = rotationalAdmittance
// α_↻
```

The full tensor could contain off-diagonal coupling terms. The diagonal matrix
above represents only the three modal components explicitly named by the
table.

## Impedance tensor

The document defines:

\[
[\boldsymbol{Z}_\tau] \equiv
[\boldsymbol{\alpha}]^{-1}
\]

In TypeScript-shaped notation:

```ts
declare function inverseMatrix(matrix: Matrix3): Matrix3

const impedanceTensor: Matrix3 =
  inverseMatrix(admittanceTensor)
// [Z_τ] ≡ [α]⁻¹
```

`[α]⁻¹` means the matrix inverse. It does not generally mean mapping every
element `x` to `1 / x`.

For an individual scalar mode, however, the document defines:

```ts
const impedanceForMode = (
  modalAdmittance: Scalar,
): Scalar => 1 / modalAdmittance
// Z_i ≡ 1/α_i
```

## Directional impedance projections

The document assigns different physical interpretations to the directional
components:

```ts
declare const apparentEffectiveMass: Scalar
declare const proportionalityConstant: Scalar
declare const radius: Radius

const longitudinalImpedance =
  apparentEffectiveMass
// Z_τ(∥) = m*

const transverseImpedance =
  proportionalityConstant * refractiveIndex(radius)
// Z_τ(⊥) ∝ n(r)

const rotationalImpedance =
  reducedPlanckConstant
// Z_τ(↻) = ħ

const totalScalarImpedance =
  lorentzFactor
// Z_s = γ
```

The proportionality symbol is important:

```text
A ∝ B
```

means:

```ts
declare const proportionalityConstant: number

const A = proportionalityConstant * B
```

It does not specify the multiplier, and therefore does not state exact
equality by itself.

## Linear and volumetric density

```ts
declare const linearMassDensity: MassDensity1D
// ε_τ

const volumetricDensity: MassDensity3D =
  linearMassDensity / transverseYieldArea
// ρ_τ = ε_τ / A_yield
```

The geometry of the units is:

```text
mass / length
─────────────────
 length²

= mass / length³
```

In other words:

```ts
type LinearDensity = "kg/m"
type AreaUnit = "m²"
type VolumetricDensity = "kg/m³"
```

## Symbol decoder

| Mathematical notation | TypeScript-shaped reading |
|---|---|
| `τ₀` | `tau0` or `cosmologicalAge` |
| `Rₕ,₀` | `Rh0` or `horizonRadiusNow` |
| `v₀(r)` | `v0(r)` or `macroscopicVelocity(r)` |
| `c²` | `speedOfLight ** 2` |
| `ρτ c²` | `rhoTau * speedOfLight ** 2` |
| `½x` | `0.5 * x` |
| `x/y` | `x / y` |
| `≡` | definition or asserted identity, often rendered with `const` |
| `=` | equation or constraint; not automatically assignment |
| `≈` | approximately equal |
| `∝` | equal up to an unspecified multiplier |
| `vφ → c` | `vPhi` approaches `c` as a limit |
| `[α]⁻¹` | `inverseMatrix(alphaTensor)` |
| `α∥`, `α⊥`, `α↻` | directional components of `alpha` |
| `m*` | effective mass; the star is not multiplication |

## Parsing one complete row

Start with:

\[
P_c \equiv \frac{1}{2}\rho_\tau c^2
\]

Its syntax tree is:

```text
acousticYieldPressure
└── defined as
    └── multiply
        ├── 0.5
        ├── volumetricMassDensity
        └── square(speedOfLight)
```

The TypeScript-shaped result is:

```ts
const acousticYieldPressure =
  0.5 * volumetricMassDensity * speedOfLight ** 2
```

This row supplies several reusable holds:

1. Subscripts refine names.
2. Adjacent quantities multiply.
3. Superscripts apply powers.
4. Fractions divide.
5. `≡` introduces a definition or identification.

## Return

When encountering a new equation in the document:

1. Rename every symbol semantically.
2. Make all hidden multiplication explicit.
3. Translate powers to `**`.
4. Distinguish definitions, equations, approximations, proportions, and
   limits.
5. Identify whether each value is a scalar, function, vector, or matrix.
6. Only then inspect the physics claimed by the equation.

Source: `RCCM-Condensed.tex`, **Table 1: Kinematic Nomenclature & Metric
Constants**.
