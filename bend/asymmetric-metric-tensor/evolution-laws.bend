import Base
import ./rational.bend as R
import ./units.bend as U
import ./flux.bend as F
import ./evolution.bend as E

law duration_contents:
  for n: Nat
  for d: Nat
  {E.seconds(E.Duration{n, d}) == U.Measure{R.fraction(n, d)} : U.Quantity<U.Time{}>}

law advance_contents:
  for n: Nat
  for d: Nat
  for wn: Nat
  for wd: Nat
  for p: R.Q
  for left: R.Q
  for right: R.Q
  {U.value(U.MomentumDensity{}, E.advance(E.Duration{n, d}, U.Positive{wn, wd},
    U.Measure{p}, U.Measure{left}, U.Measure{right})) == R.add(p,
      R.mul(R.mul(R.fraction(n, d), R.fraction(1n+wd, wn)), R.sub(left, right))) : R.Q}

law step_contents:
  for +dt: E.Duration
  for +width: U.Positive<U.Length{}>
  for p: U.Quantity<U.MomentumDensity{}>
  for q: U.Quantity<U.MomentumDensity{}>
  for left: U.Quantity<U.Pressure{}>
  for +middle: U.Quantity<U.Pressure{}>
  for right: U.Quantity<U.Pressure{}>
  {E.step(dt, width, F.Faces{left, middle, right}, E.State{p, q})
    == E.State{E.advance(dt, width, p, left, middle), E.advance(dt, width, q, middle, right)} : E.State}

law total_contents:
  for p: R.Q
  for q: R.Q
  {U.value(U.MomentumDensity{}, E.total(E.State{U.Measure{p}, U.Measure{q}}))
    == R.add(p, q) : R.Q}

# One universal step: actual output sum = old sum + exterior impulse.
law step_balance:
  for +dt: E.Duration
  for +width: U.Positive<U.Length{}>
  for +p: R.Q
  for +q: R.Q
  for +left: R.Q
  for middle: R.Q
  for +right: R.Q
  R.Same(U.value(U.MomentumDensity{}, E.total(E.step(dt, width,
    F.Faces{U.Measure{left}, U.Measure{middle}, U.Measure{right}}, E.State{U.Measure{p}, U.Measure{q}}))),
    R.add(R.add(p, q), R.mul(
      R.mul(U.value(U.Time{}, E.seconds(dt)), U.inverse_value(U.Length{}, width)), R.sub(left, right))))

law no_fuel:
  for dt: E.Duration
  for width: U.Positive<U.Length{}>
  for faces: F.Faces
  for state: E.State
  {E.run(0n, dt, width, faces, state) == state : E.State}

law one_more_step:
  for fuel: Nat
  for +dt: E.Duration
  for +width: U.Positive<U.Length{}>
  for +faces: F.Faces
  for state: E.State
  {E.run(1n+fuel, dt, width, faces, state)
    == E.run(fuel, dt, width, faces, E.step(dt, width, faces, state)) : E.State}
