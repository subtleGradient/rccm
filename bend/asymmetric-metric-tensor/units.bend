import Base
import ./rational.bend as R

# Nominal SI tags, not a general dimensional-algebra engine.
type UnitTag is Data:
  Unitless{}
  Pressure{}
  Length{}
  Time{}
  ForceDensity{}
  MomentumDensity{}
  Speed{}
  Frequency{}

# The checker sees the unit parameter; native code erases it.
type Quantity<-unit: UnitTag> is Data:
  Measure{value: R.Q}

type Positive<-unit: UnitTag> is Data:
  Positive{numerator_predecessor: Nat, denominator_predecessor: Nat}

def value(-unit: UnitTag, quantity: Quantity<unit>) -> R.Q:
  match quantity:
    case Measure{v}:
      v

def positive_value(-unit: UnitTag, quantity: Positive<unit>) -> R.Q:
  match quantity:
    case Positive{n, d}:
      R.fraction(1n+n, d)

# Numerical reciprocal; its physical units belong to the caller's typed API.
def inverse_value(-unit: UnitTag, quantity: Positive<unit>) -> R.Q:
  match quantity:
    case Positive{n, d}:
      R.fraction(1n+d, n)

def add(-unit: UnitTag, a: Quantity<unit>, b: Quantity<unit>) -> Quantity<unit>:
  Measure{R.add(value(unit, a), value(unit, b))}
