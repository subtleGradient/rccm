import Base
import ./exact.bend as Exact
import ./rational.bend as R

# Value equality is R.Same; record equality is used only where explicitly stated.
law negate_twice:
  for a: R.Q
  {R.negate(R.negate(a)) == a : R.Q}
law mul_comm:
  for +a: R.Q
  for +b: R.Q
  {R.mul(a, b) == R.mul(b, a) : R.Q}
law average_same:
  for +a: R.Q
  R.Same(R.half(R.add(a, a)), a)
law average_opposite:
  for +a: R.Q
  R.IsZero(R.half(R.add(a, R.negate(a))))
law difference_opposite:
  for +a: R.Q
  R.Same(R.half(R.sub(a, R.negate(a))), a)
law difference_same:
  for +a: R.Q
  R.IsZero(R.half(R.sub(a, a)))
law zero_same:
  for +a: R.Q
  for e: R.IsZero(a)
  R.Same(a, R.zero())
law sum_zero:
  for +a: R.Q
  for +b: R.Q
  for ea: R.IsZero(a)
  for eb: R.IsZero(b)
  R.IsZero(R.add(a, b))
law sub_equal:
  for +a: R.Q
  for b: R.Q
  for e: {a == b : R.Q}
  R.IsZero(R.sub(a, b))
law ratio_reciprocal:
  for +p: Nat
  for +q: Nat
  R.Same(R.mul(R.fraction(1n+p, q), R.fraction(1n+q, p)), R.one())
law partition_unit:
  for +p: Nat
  for +u: Nat
  R.Same(R.add(R.fraction(1n+p, Nat.add(p, u)), R.fraction(u, Nat.add(p, u))), R.one())
law same_refl:
  for +a: R.Q
  R.Same(a, a)
law mul_zero_right:
  for a: R.Q
  R.IsZero(R.mul(a, R.zero()))
law add_zero_left:
  for +a: R.Q
  {R.add(R.zero(), a) == a : R.Q}
law add_zero_right:
  for +a: R.Q
  {R.add(a, R.zero()) == a : R.Q}
law mul_neg_left:
  for +a: R.Q
  for +b: R.Q
  {R.mul(R.negate(a), b) == R.negate(R.mul(a, b)) : R.Q}

# Content contracts constrain the exported arithmetic for arbitrary numerators.
# They are independent constructor equations, not invariances of a toy operation.
law zero_content:
  {R.zero() == R.Fraction{0n, 0n, 0n} : R.Q}
law one_content:
  {R.one() == R.Fraction{1n, 0n, 0n} : R.Q}
law fraction_content:
  for n: Nat
  for d: Nat
  {R.fraction(n, d) == R.Fraction{n, 0n, d} : R.Q}
law signed_zero:
  {R.from_signed(Exact.Zero{}) == R.Fraction{0n, 0n, 0n} : R.Q}
law signed_positive:
  for p: Nat
  {R.from_signed(Exact.Positive{p}) == R.Fraction{1n+p, 0n, 0n} : R.Q}
law signed_negative:
  for p: Nat
  {R.from_signed(Exact.Negative{p}) == R.Fraction{0n, 1n+p, 0n} : R.Q}
law negate_content:
  for p: Nat
  for n: Nat
  for d: Nat
  {R.negate(R.Fraction{p, n, d}) == R.Fraction{n, p, d} : R.Q}
law add_content:
  for p: Nat
  for n: Nat
  for d: Nat
  for r: Nat
  for s: Nat
  for e: Nat
  {R.add(R.Fraction{p, n, d}, R.Fraction{r, s, e}) == R.Fraction{
    Nat.add(Nat.mul(p, 1n+e), Nat.mul(r, 1n+d)),
    Nat.add(Nat.mul(n, 1n+e), Nat.mul(s, 1n+d)),
    Nat.add(Nat.add(d, e), Nat.mul(d, e))} : R.Q}
law sub_content:
  for p: Nat
  for n: Nat
  for d: Nat
  for r: Nat
  for s: Nat
  for e: Nat
  {R.sub(R.Fraction{p, n, d}, R.Fraction{r, s, e}) == R.Fraction{
    Nat.add(Nat.mul(p, 1n+e), Nat.mul(s, 1n+d)),
    Nat.add(Nat.mul(n, 1n+e), Nat.mul(r, 1n+d)),
    Nat.add(Nat.add(d, e), Nat.mul(d, e))} : R.Q}
law mul_content:
  for p: Nat
  for n: Nat
  for d: Nat
  for r: Nat
  for s: Nat
  for e: Nat
  {R.mul(R.Fraction{p, n, d}, R.Fraction{r, s, e}) == R.Fraction{
    Nat.add(Nat.mul(p, r), Nat.mul(n, s)),
    Nat.add(Nat.mul(p, s), Nat.mul(n, r)),
    Nat.add(Nat.add(d, e), Nat.mul(d, e))} : R.Q}
law half_content:
  for p: Nat
  for n: Nat
  for d: Nat
  {R.half(R.Fraction{p, n, d}) == R.Fraction{p, n, 1n+Nat.add(d, d)} : R.Q}
