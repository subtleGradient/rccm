import Base

# Exact signed integers for the sign laws; no floating-point primitives.
# Positive{p} means +(1+p), Negative{p} means -(1+p).
# One Zero constructor avoids separate +0 and -0 representations.
type Signed is Data:
  Zero{}
  Positive{predecessor: Nat}
  Negative{predecessor: Nat}

def from_nat(n: Nat) -> Signed:
  match n:
    case 0n:
      Zero{}
    case 1n+p:
      Positive{p}

def negate(value: Signed) -> Signed:
  match value:
    case Zero{}:
      Zero{}
    case Positive{p}:
      Negative{p}
    case Negative{p}:
      Positive{p}
