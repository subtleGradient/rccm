import Base
import ../../rational.bend as R
import ../../units.bend as U
import ../../differences.bend as D

# A 2 Pa difference over 2 m is 1 Pa/m, not 2 Pa/m.
law missing_distance:
  R.Same(U.value(U.ForceDensity{}, D.gradient(U.Positive{1n, 0n},
    U.Measure{R.zero()}, U.Measure{R.fraction(2n, 0n)})), R.fraction(2n, 0n))

def missing_distance():
  {==}
