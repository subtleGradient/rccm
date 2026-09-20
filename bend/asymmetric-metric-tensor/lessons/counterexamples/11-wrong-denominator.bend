import Base
import ../../ledger.bend as L
import ../../rational.bend as R

def local_uses_critical() -> R.Same(L.local_fraction(L.Budget{2n, 1n, 2n}), R.fraction(3n, 5n)):
  {==}
