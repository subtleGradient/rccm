import Base
import ./exact.bend as Exact

# (positive - negative)/(1 + denominator_predecessor).
# Representations are deliberately not normalized; use Same, not record equality.
type Q is Data:
  Fraction{positive: Nat, negative: Nat, denominator_predecessor: Nat}

def zero() -> Q:
  Fraction{0n, 0n, 0n}

def one() -> Q:
  Fraction{1n, 0n, 0n}

def fraction(n: Nat, denominator_predecessor: Nat) -> Q:
  Fraction{n, 0n, denominator_predecessor}

def from_signed(value: Exact.Signed) -> Q:
  match value:
    case Exact.Zero{}:
      zero()
    case Exact.Positive{p}:
      Fraction{1n+p, 0n, 0n}
    case Exact.Negative{p}:
      Fraction{0n, 1n+p, 0n}

def negate(a: Q) -> Q:
  match a:
    case Fraction{p, n, d}:
      Fraction{n, p, d}

# (1+p)(1+q)-1, without truncated subtraction.
def denominator_product(+p: Nat, +q: Nat) -> Nat:
  Nat.add(Nat.add(p, q), Nat.mul(p, q))

def add(a: Q, b: Q) -> Q:
  match a b:
    case Fraction{p, n, +d} Fraction{r, s, +e}:
      Fraction{
        Nat.add(Nat.mul(p, 1n+e), Nat.mul(r, 1n+d)),
        Nat.add(Nat.mul(n, 1n+e), Nat.mul(s, 1n+d)),
        denominator_product(d, e)}

def sub(a: Q, b: Q) -> Q:
  add(a, negate(b))

def mul(a: Q, b: Q) -> Q:
  match a b:
    case Fraction{+p, +n, d} Fraction{+r, +s, e}:
      Fraction{
        Nat.add(Nat.mul(p, r), Nat.mul(n, s)),
        Nat.add(Nat.mul(p, s), Nat.mul(n, r)),
        denominator_product(d, e)}

def half(a: Q) -> Q:
  match a:
    case Fraction{p, n, +d}:
      Fraction{p, n, 1n+Nat.add(d, d)}

def Same(a: Q, b: Q) -> Type:
  match a b:
    case Fraction{p, n, d} Fraction{r, s, e}:
      {Nat.add(Nat.mul(p, 1n+e), Nat.mul(s, 1n+d))
        == Nat.add(Nat.mul(n, 1n+e), Nat.mul(r, 1n+d)) : Nat}

def IsZero(a: Q) -> Type:
  match a:
    case Fraction{p, n, d}:
      {p == n : Nat}
