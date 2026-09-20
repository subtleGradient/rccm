import Base
import ../../contraction.bend as C
import ../../matrix.bend as M
import ../../rational.bend as R

def slip_is_positive_norm() -> R.Same(C.contract(M.antisymmetric(C.fixture(R.one(),R.zero())),
    M.antisymmetric(C.fixture(R.one(),R.zero()))),R.fraction(2n,0n)):
  {==}
