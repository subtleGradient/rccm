import Base
import ./rational.bend as R
import ./units.bend as U
import ./differences.bend as D

# The numerator order and positive-distance reciprocal are specified separately
# from any future motion rule. These are draft contracts for human review.
law quotient_contents:
  for n: Nat
  for d: Nat
  for left: R.Q
  for right: R.Q
  {U.value(U.ForceDensity{}, D.gradient(U.Positive{n, d}, U.Measure{left}, U.Measure{right}))
    == R.mul(R.fraction(1n+d, n), R.sub(right, left)) : R.Q}

law constant_field:
  for spacing: U.Positive<U.Length{}>
  for +value: R.Q
  R.IsZero(U.value(U.ForceDensity{},
    D.gradient(spacing, U.Measure{value}, U.Measure{value})))
