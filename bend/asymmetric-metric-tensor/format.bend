import Base
import ./rational.bend as R

# Presentation only. Arithmetic deliberately keeps unreduced exact fractions.
def fraction_text(numerator: String, denominator_predecessor: Nat) -> String:
  match denominator_predecessor:
    case 0n:
      numerator
    case 1n+p:
      numerator ++ "/" ++ Nat.show(2n+p)

def compared(order: Cmp, positive: Nat, negative: Nat, d: Nat) -> String:
  match order:
    case EQ{}:
      "0"
    case LT{}:
      fraction_text("-" ++ Nat.show(Nat.sub(negative, positive)), d)
    case GT{}:
      fraction_text(Nat.show(Nat.sub(positive, negative)), d)

def show(value: R.Q) -> String:
  match value:
    case R.Fraction{+p, +n, d}:
      compared(Nat.cmp(p, n), p, n, d)
