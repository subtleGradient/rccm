import Base
import ../../operators.bend as O
import ../../fields.bend as F
import ../../matrix.bend as M
import ../../rational.bend as R

def radius_is_linear() -> R.Same(F.eval(O.poisson(O.quartic(),R.fraction(2n,0n)),
    M.Row{R.zero(),R.one(),R.zero(),R.zero()}),R.negate(R.fraction(36n,0n))):
  {==}
