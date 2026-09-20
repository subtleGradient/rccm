import Base
import ./rational.bend as R
import ./units.bend as U

# AI-drafted public contracts; review separately from their proofs.
law value_contents:
  for -unit: U.UnitTag
  for v: R.Q
  {U.value(unit, U.Measure{v}) == v : R.Q}

law positive_contents:
  for -unit: U.UnitTag
  for n: Nat
  for d: Nat
  {U.positive_value(unit, U.Positive{n, d}) == R.Fraction{1n+n, 0n, d} : R.Q}

law inverse_contents:
  for -unit: U.UnitTag
  for n: Nat
  for d: Nat
  {U.inverse_value(unit, U.Positive{n, d}) == R.Fraction{1n+d, 0n, n} : R.Q}

law reciprocal:
  for -unit: U.UnitTag
  for +v: U.Positive<unit>
  R.Same(R.mul(U.positive_value(unit, v), U.inverse_value(unit, v)), R.one())

law add_contents:
  for -unit: U.UnitTag
  for a: R.Q
  for b: R.Q
  {U.add(unit, U.Measure{a}, U.Measure{b}) == U.Measure{R.add(a, b)} : U.Quantity<unit>}
