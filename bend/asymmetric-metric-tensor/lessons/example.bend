import Base
import ../capacity.bend as Capacity
import ../matrix.bend as M
import ../rational.bend as R

# One shared algebraic sample for lessons 4 and 5.
# R.fraction(n,p) means n/(1+p); this is not a field-evolution solution.
def sample() -> M.Sample:
  M.Sample{
    Capacity.Regular{2n, 1n},
    R.fraction(1n, 1n), R.zero(), R.zero(),
    R.zero(), R.zero(), R.fraction(1n, 2n)
  }
