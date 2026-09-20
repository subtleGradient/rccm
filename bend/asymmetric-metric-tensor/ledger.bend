import Base
import ./rational.bend as R
import ./capacity.bend as C

# Pressure counts share one positive reference unit. Static capacity is nonzero.
type Budget is Data:
  Budget{static_predecessor: Nat, local_load: Nat, macro_load: Nat}

def capacity(budget: Budget) -> C.Regular:
  match budget:
    case Budget{p, local, macro}:
      C.Regular{p, Nat.add(local, macro)}

def total(budget: Budget) -> R.Q:
  C.q(capacity(budget))

def ambient(budget: Budget) -> R.Q:
  match budget:
    case Budget{+p, +local, macro}:
      R.fraction(1n+Nat.add(p, local), Nat.add(p, Nat.add(local, macro)))

def local_fraction(budget: Budget) -> R.Q:
  match budget:
    case Budget{+p, local, macro}:
      R.fraction(1n+p, Nat.add(p, local))
