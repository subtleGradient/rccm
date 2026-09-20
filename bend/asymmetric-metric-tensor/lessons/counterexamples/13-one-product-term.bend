import Base
import ../../fields.bend as F
import ../../rational.bend as R
import ../../matrix.bend as M
import ../../tensor.bend as T

def one_product_term() -> R.Same(F.eval(F.diff(F.square(F.Coord{T.X{}}), T.X{}),
    M.Row{R.zero(), R.fraction(3n, 0n), R.zero(), R.zero()}), R.fraction(3n, 0n)):
  {==}
