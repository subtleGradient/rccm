import Base
import ../../rational.bend as R
import ../../units.bend as U
import ../../normalization.bend as N

def frequency_is_velocity(omega: U.Quantity<U.Frequency{}>) -> U.Quantity<U.Unitless{}>:
  N.slip(U.Measure{R.one()}, omega, U.Positive{0n, 0n})
