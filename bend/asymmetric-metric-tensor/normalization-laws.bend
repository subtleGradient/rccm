import Base
import ./rational.bend as R
import ./units.bend as U
import ./normalization.bend as N
import ./matrix.bend as M
import ./capacity.bend as C

law slip_contents:
  for a: R.Q
  for v: R.Q
  for n: Nat
  for d: Nat
  {N.slip(U.Measure{a}, U.Measure{v}, U.Positive{n, d})
    == U.Measure{R.mul(a, R.mul(v, R.fraction(1n+d, n)))} : U.Quantity<U.Unitless{}>}
law twist_contents:
  for a: R.Q
  for n: Nat
  for d: Nat
  for omega: R.Q
  {N.twist(U.Measure{a}, U.Positive{n, d}, U.Measure{omega})
    == U.Measure{R.mul(a, R.mul(R.fraction(1n+n, d), omega))} : U.Quantity<U.Unitless{}>}
law plane_contents:
  for capacity: C.Regular
  for +a: U.Quantity<U.Unitless{}>
  for v: U.Quantity<U.Speed{}>
  for c: U.Positive<U.Speed{}>
  for tp: U.Positive<U.Time{}>
  for omega: U.Quantity<U.Frequency{}>
  {N.plane(capacity, a, v, c, tp, omega) == M.Sample{capacity,
    U.value(U.Unitless{}, N.slip(a, v, c)), R.zero(), R.zero(), R.zero(), R.zero(),
    U.value(U.Unitless{}, N.twist(a, tp, omega))} : M.Sample}
