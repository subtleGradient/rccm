import Base

# Exact signed integers for the sign laws; no floating-point primitives.
# Positive{p} means +(1+p), Negative{p} means -(1+p).
# One SignedZero constructor avoids separate +0 and -0 representations.
type Signed is Data:
  SignedZero{}
  Positive{predecessor: Nat}
  Negative{predecessor: Nat}

def from_nat(n: Nat) -> Signed:
  match n:
    case 0n:
      SignedZero{}
    case 1n+p:
      Positive{p}

def negate(value: Signed) -> Signed:
  match value:
    case SignedZero{}:
      SignedZero{}
    case Positive{p}:
      Negative{p}
    case Negative{p}:
      Positive{p}
