import Base
import ../../waves.bend as W
import ../../fields.bend as F
import ../../units.bend as U
import ../../rational.bend as R

def any_speed_solves_wave() -> R.IsZero(F.eval(
    W.box(W.profile(R.fraction(2n,0n)),U.Positive{0n,0n}),F.origin())):
  {==}
