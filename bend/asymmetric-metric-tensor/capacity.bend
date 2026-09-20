import Base
import ./rational.bend as R

# Remaining = 1+remaining_predecessor, total = remaining+used.
# This construction guarantees 0 < remaining/total <= 1.
type Regular is Data:
  Regular{remaining_predecessor: Nat, used: Nat}

# No reciprocal-bearing state is produced at zero remaining capacity.
def inspect(remaining: Nat, used: Nat) -> Maybe<Regular>:
  match remaining:
    case 0n:
      None{}
    case 1n+p:
      Some{Regular{p, used}}

def q(state: Regular) -> R.Q:
  match state:
    case Regular{+p, used}:
      R.fraction(1n+p, Nat.add(p, used))

def used_fraction(state: Regular) -> R.Q:
  match state:
    case Regular{p, +used}:
      R.fraction(used, Nat.add(p, used))

def inverse(state: Regular) -> R.Q:
  match state:
    case Regular{+p, used}:
      R.fraction(1n+Nat.add(p, used), p)
