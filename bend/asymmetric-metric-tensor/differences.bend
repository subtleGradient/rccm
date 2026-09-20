import Base
import ./rational.bend as R
import ./units.bend as U

# Two supplied pressures a positive distance apart, ordered left -> right.
# This is a discrete quotient, not a continuum derivative oracle.
def gradient(spacing: U.Positive<U.Length{}>, left: U.Quantity<U.Pressure{}>, right: U.Quantity<U.Pressure{}>) -> U.Quantity<U.ForceDensity{}>:
  U.Measure{R.mul(U.inverse_value(U.Length{}, spacing),
    R.sub(U.value(U.Pressure{}, right), U.value(U.Pressure{}, left)))}
