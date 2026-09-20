import Base
import ../../fields.bend as F
import ../../tensor.bend as T
import ../../matrix.bend as M
import ../../rational.bend as R

def coefficient_is_constant() -> R.Same(F.eval(F.diff(
    F.Mul{F.Coord{T.X{}},F.square(F.Coord{T.X{}})},T.X{}),
    M.Row{R.zero(),R.fraction(2n,0n),R.zero(),R.zero()}),R.fraction(8n,0n)):
  {==}
