import Base
import ./rational.bend as R
import ./units.bend as U
import ./capacity.bend as C
import ./matrix.bend as M

def slip(alpha: U.Quantity<U.Unitless{}>, velocity: U.Quantity<U.Speed{}>, c: U.Positive<U.Speed{}>) -> U.Quantity<U.Unitless{}>:
  U.Measure{R.mul(U.value(U.Unitless{}, alpha),
    R.mul(U.value(U.Speed{}, velocity), U.inverse_value(U.Speed{}, c)))}

def twist(alpha: U.Quantity<U.Unitless{}>, tp: U.Positive<U.Time{}>, omega: U.Quantity<U.Frequency{}>) -> U.Quantity<U.Unitless{}>:
  U.Measure{R.mul(U.value(U.Unitless{}, alpha),
    R.mul(U.positive_value(U.Time{}, tp), U.value(U.Frequency{}, omega)))}

# Deliberately restricted x-slip / z-twist patch; capacity is supplied, not inferred.
def plane(capacity: C.Regular, +alpha: U.Quantity<U.Unitless{}>, vx: U.Quantity<U.Speed{}>,
    c: U.Positive<U.Speed{}>, tp: U.Positive<U.Time{}>, oz: U.Quantity<U.Frequency{}>) -> M.Sample:
  e b = slip(alpha, vx, c) twist(alpha, tp, oz)
  M.Sample{capacity, U.value(U.Unitless{}, e), R.zero(), R.zero(),
    R.zero(), R.zero(), U.value(U.Unitless{}, b)}
