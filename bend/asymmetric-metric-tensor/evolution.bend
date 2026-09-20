import Base
import ./rational.bend as R
import ./units.bend as U
import ./flux.bend as F

# Nonnegative duration in seconds; unlike width, zero is meaningful.
type Duration is Data:
  Duration{numerator: Nat, denominator_predecessor: Nat}

# Deliberately affine: a simulation state has one owner.
type State is Type:
  State{left: U.Quantity<U.MomentumDensity{}>, right: U.Quantity<U.MomentumDensity{}>}

def seconds(dt: Duration) -> U.Quantity<U.Time{}>:
  match dt:
    case Duration{n, d}:
      U.Measure{R.fraction(n, d)}

def advance(dt: Duration, width: U.Positive<U.Length{}>, momentum: U.Quantity<U.MomentumDensity{}>, left: U.Quantity<U.Pressure{}>, right: U.Quantity<U.Pressure{}>) -> U.Quantity<U.MomentumDensity{}>:
  coefficient = R.mul(U.value(U.Time{}, seconds(dt)), U.inverse_value(U.Length{}, width))
  U.Measure{R.add(U.value(U.MomentumDensity{}, momentum),
    R.mul(coefficient, R.sub(U.value(U.Pressure{}, left), U.value(U.Pressure{}, right))))}

def step(+dt: Duration, +width: U.Positive<U.Length{}>, faces: F.Faces, state: State) -> State:
  match faces state:
    case F.Faces{left, +middle, right} State{p, q}:
      a b = advance(dt, width, p, left, middle) advance(dt, width, q, middle, right)
      State{a, b}

# Total observes the two current values; no cached initial/boundary total.
def total(state: State) -> U.Quantity<U.MomentumDensity{}>:
  match state:
    case State{left, right}:
      U.add(U.MomentumDensity{}, left, right)

# First argument decreases structurally. Frozen inputs are Data; state is not.
def run(fuel: Nat, +dt: Duration, +width: U.Positive<U.Length{}>, +faces: F.Faces, state: State) -> State:
  match fuel:
    case 0n:
      state
    case 1n+remaining:
      run(remaining, dt, width, faces, step(dt, width, faces, state))
