import Base
import ../../rational.bend as R
import ../../units.bend as U
import ../../flux.bend as F
import ../../evolution.bend as E

# No elapsed time does not erase existing momentum.
law zero_time_stops_motion:
  R.Same(U.value(U.MomentumDensity{}, E.total(E.step(E.Duration{0n, 0n},
    U.Positive{0n, 0n}, F.Faces{U.Measure{R.zero()}, U.Measure{R.one()}, U.Measure{R.zero()}},
    E.State{U.Measure{R.one()}, U.Measure{R.fraction(3n, 0n)}}))), R.zero())

def zero_time_stops_motion():
  {==}
