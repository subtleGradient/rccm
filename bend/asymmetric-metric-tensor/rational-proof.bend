import Base
import ./exact.bend as Exact
import ./rational.bend as R
import ./rational-laws.bend as Laws
import ./natural-proof.bend as N

def add_cong(-a: Nat, -b: Nat, -c: Nat, -d: Nat, ab: {a == b : Nat}, cd: {c == d : Nat}) -> {Nat.add(a, c) == Nat.add(b, d) : Nat}:
  %ab : {Nat.add(a, c) == Nat.add(_, d) : Nat}
  %cd : {Nat.add(a, c) == Nat.add(a, _) : Nat}
  {==}

def record_equal(-p: Nat, -n: Nat, -d: Nat, -r: Nat, -s: Nat, -e: Nat, pr: {p == r : Nat}, ns: {n == s : Nat}, de: {d == e : Nat}) -> {R.Fraction{p, n, d} == R.Fraction{r, s, e} : R.Q}:
  %pr : {R.Fraction{p, n, d} == R.Fraction{_, s, e} : R.Q}
  %ns : {R.Fraction{p, n, d} == R.Fraction{p, _, e} : R.Q}
  %de : {R.Fraction{p, n, d} == R.Fraction{p, n, _} : R.Q}
  {==}

def denominator_comm(+d: Nat, +e: Nat) -> {R.denominator_product(d, e) == R.denominator_product(e, d) : Nat}:
  add_cong(Nat.add(d, e), Nat.add(e, d), Nat.mul(d, e), Nat.mul(e, d), N.add_comm(d, e), N.mul_comm(d, e))

# The predecessor encoding really represents the product of positive denominators.
def denominator_value(+d: Nat, +e: Nat) -> {1n+R.denominator_product(d, e) == Nat.mul(1n+d, 1n+e) : Nat}:
  %N.sym(Nat.mul(d, 1n+e), Nat.add(d, Nat.mul(d, e)), N.mul_succ(d, e)) : {1n+R.denominator_product(d, e) == 1n+Nat.add(e, _) : Nat}
  %N.add_swap(d, e, Nat.mul(d, e)) : {1n+R.denominator_product(d, e) == 1n+_ : Nat}
  Equal.cong(Nat, Nat, x => 1n+x,
    Nat.add(Nat.add(d, e), Nat.mul(d, e)), Nat.add(d, Nat.add(e, Nat.mul(d, e))),
    N.add_assoc(d, e, Nat.mul(d, e)))

def Laws.negate_twice(a):
  match a:
    case R.Fraction{p, n, d}:
      {==}

def Laws.mul_comm(a, b):
  match a b:
    case R.Fraction{p, n, d} R.Fraction{r, s, e}:
      record_equal(
        Nat.add(Nat.mul(p, r), Nat.mul(n, s)), Nat.add(Nat.mul(p, s), Nat.mul(n, r)), R.denominator_product(d, e),
        Nat.add(Nat.mul(r, p), Nat.mul(s, n)), Nat.add(Nat.mul(r, n), Nat.mul(s, p)), R.denominator_product(e, d),
        add_cong(Nat.mul(p, r), Nat.mul(r, p), Nat.mul(n, s), Nat.mul(s, n), N.mul_comm(p, r), N.mul_comm(n, s)),
        Equal.trans(Nat, Nat.add(Nat.mul(p, s), Nat.mul(n, r)), Nat.add(Nat.mul(s, p), Nat.mul(r, n)), Nat.add(Nat.mul(r, n), Nat.mul(s, p)),
          add_cong(Nat.mul(p, s), Nat.mul(s, p), Nat.mul(n, r), Nat.mul(r, n), N.mul_comm(p, s), N.mul_comm(n, r)),
          N.add_comm(Nat.mul(s, p), Nat.mul(r, n))),
        denominator_comm(d, e))

def Laws.average_opposite(a):
  match a:
    case R.Fraction{p, n, d}:
      N.add_comm(Nat.mul(p, 1n+d), Nat.mul(n, 1n+d))

def Laws.difference_same(a):
  Laws.average_opposite(a)

def Laws.zero_same(a, e):
  match a:
    case R.Fraction{p, n, d}:
      %e : {Nat.add(Nat.mul(p, 1n), 0n) == Nat.add(Nat.mul(_, 1n), 0n) : Nat}
      {==}

def Laws.sum_zero(a, b, ea, eb):
  match a b:
    case R.Fraction{p, n, d} R.Fraction{r, s, e}:
      %ea : {Nat.add(Nat.mul(p, 1n+e), Nat.mul(r, 1n+d)) == Nat.add(Nat.mul(_, 1n+e), Nat.mul(s, 1n+d)) : Nat}
      %eb : {Nat.add(Nat.mul(p, 1n+e), Nat.mul(r, 1n+d)) == Nat.add(Nat.mul(p, 1n+e), Nat.mul(_, 1n+d)) : Nat}
      {==}

def opposite_sum(a: R.Q) -> R.IsZero(R.add(a, R.negate(a))):
  match a:
    case R.Fraction{p, n, +d}:
      N.add_comm(Nat.mul(p, 1n+d), Nat.mul(n, 1n+d))

def Laws.sub_equal(a, b, e):
  %e : R.IsZero(R.sub(a, _))
  opposite_sum(a)

def Laws.same_refl(a):
  match a:
    case R.Fraction{p, n, d}:
      N.add_comm(Nat.mul(p, 1n+d), Nat.mul(n, 1n+d))

def Laws.mul_zero_right(a):
  match a:
    case R.Fraction{p, n, d}:
      {==}

def Laws.mul_neg_left(a, b):
  match a b:
    case R.Fraction{p, n, d} R.Fraction{r, s, e}:
      record_equal(
        Nat.add(Nat.mul(n, r), Nat.mul(p, s)), Nat.add(Nat.mul(n, s), Nat.mul(p, r)), R.denominator_product(d, e),
        Nat.add(Nat.mul(p, s), Nat.mul(n, r)), Nat.add(Nat.mul(p, r), Nat.mul(n, s)), R.denominator_product(d, e),
        N.add_comm(Nat.mul(n, r), Nat.mul(p, s)), N.add_comm(Nat.mul(n, s), Nat.mul(p, r)), {==})

def denominator_zero(+d: Nat) -> {R.denominator_product(d, 0n) == d : Nat}:
  %N.sym(Nat.mul(d, 0n), 0n, N.mul_zero(d)) : {Nat.add(Nat.add(d, 0n), _) == d : Nat}
  Equal.trans(Nat, Nat.add(Nat.add(d, 0n), 0n), Nat.add(d, 0n), d, N.add_zero(Nat.add(d, 0n)), N.add_zero(d))

def numerator_one(+p: Nat) -> {Nat.add(Nat.mul(p, 1n), 0n) == p : Nat}:
  Equal.trans(Nat, Nat.add(Nat.mul(p, 1n), 0n), Nat.mul(p, 1n), p, N.add_zero(Nat.mul(p, 1n)), N.mul_one(p))

def Laws.add_zero_left(a):
  match a:
    case R.Fraction{p, n, d}:
      record_equal(Nat.mul(p, 1n), Nat.mul(n, 1n), Nat.add(d, 0n), p, n, d,
        N.mul_one(p), N.mul_one(n), N.add_zero(d))

def Laws.add_zero_right(a):
  match a:
    case R.Fraction{p, n, d}:
      record_equal(Nat.add(Nat.mul(p, 1n), 0n), Nat.add(Nat.mul(n, 1n), 0n), R.denominator_product(d, 0n), p, n, d,
        numerator_one(p), numerator_one(n), denominator_zero(d))

def positive_unit(+n: Nat, +d: Nat, e: {n == 1n+d : Nat}) -> R.Same(R.Fraction{n, 0n, d}, R.one()):
  Equal.trans(Nat, Nat.add(Nat.mul(n, 1n), 0n), n, Nat.add(1n+d, 0n), numerator_one(n),
    Equal.trans(Nat, n, 1n+d, Nat.add(1n+d, 0n), e, N.sym(Nat.add(1n+d, 0n), 1n+d, N.add_zero(1n+d))))

def Laws.ratio_reciprocal(p, q):
  %N.sym(Nat.add(Nat.mul(1n+p, 0n), 0n), 0n,
    Equal.trans(Nat, Nat.add(Nat.mul(1n+p, 0n), 0n), Nat.mul(1n+p, 0n), 0n, N.add_zero(Nat.mul(1n+p, 0n)), N.mul_zero(1n+p))) : R.Same(R.Fraction{Nat.add(Nat.mul(1n+p, 1n+q), 0n), _, R.denominator_product(q, p)}, R.one())
  positive_unit(Nat.add(Nat.mul(1n+p, 1n+q), 0n), R.denominator_product(q, p),
    Equal.trans(Nat, Nat.add(Nat.mul(1n+p, 1n+q), 0n), Nat.mul(1n+p, 1n+q), 1n+R.denominator_product(q, p), N.add_zero(Nat.mul(1n+p, 1n+q)),
      Equal.trans(Nat, Nat.mul(1n+p, 1n+q), Nat.mul(1n+q, 1n+p), 1n+R.denominator_product(q, p), N.mul_comm(1n+p, 1n+q),
        N.sym(1n+R.denominator_product(q, p), Nat.mul(1n+q, 1n+p), denominator_value(q, p)))))

def Laws.partition_unit(p, u):
  positive_unit(Nat.add(Nat.mul(1n+p, 1n+Nat.add(p, u)), Nat.mul(u, 1n+Nat.add(p, u))), R.denominator_product(Nat.add(p, u), Nat.add(p, u)),
    Equal.trans(Nat,
      Nat.add(Nat.mul(1n+p, 1n+Nat.add(p, u)), Nat.mul(u, 1n+Nat.add(p, u))),
      Nat.mul(1n+Nat.add(p, u), 1n+Nat.add(p, u)), 1n+R.denominator_product(Nat.add(p, u), Nat.add(p, u)),
      N.sym(Nat.mul(1n+Nat.add(p, u), 1n+Nat.add(p, u)), Nat.add(Nat.mul(1n+p, 1n+Nat.add(p, u)), Nat.mul(u, 1n+Nat.add(p, u))), N.add_mul(1n+p, u, 1n+Nat.add(p, u))),
      N.sym(1n+R.denominator_product(Nat.add(p, u), Nat.add(p, u)), Nat.mul(1n+Nat.add(p, u), 1n+Nat.add(p, u)), denominator_value(Nat.add(p, u), Nat.add(p, u)))))

# Doubling a numerator and then halving its rational value preserves it.
def double_scale(+x: Nat, +d: Nat) -> {Nat.mul(Nat.add(Nat.mul(x, d), Nat.mul(x, d)), d) == Nat.mul(x, Nat.add(Nat.mul(d, d), Nat.mul(d, d))) : Nat}:
  Equal.trans(Nat,
    Nat.mul(Nat.add(Nat.mul(x, d), Nat.mul(x, d)), d),
    Nat.add(Nat.mul(Nat.mul(x, d), d), Nat.mul(Nat.mul(x, d), d)),
    Nat.mul(x, Nat.add(Nat.mul(d, d), Nat.mul(d, d))),
    N.add_mul(Nat.mul(x, d), Nat.mul(x, d), d),
    Equal.trans(Nat,
      Nat.add(Nat.mul(Nat.mul(x, d), d), Nat.mul(Nat.mul(x, d), d)),
      Nat.add(Nat.mul(x, Nat.mul(d, d)), Nat.mul(x, Nat.mul(d, d))),
      Nat.mul(x, Nat.add(Nat.mul(d, d), Nat.mul(d, d))),
      add_cong(Nat.mul(Nat.mul(x, d), d), Nat.mul(x, Nat.mul(d, d)), Nat.mul(Nat.mul(x, d), d), Nat.mul(x, Nat.mul(d, d)), N.mul_assoc(x, d, d), N.mul_assoc(x, d, d)),
      N.sym(Nat.mul(x, Nat.add(Nat.mul(d, d), Nat.mul(d, d))), Nat.add(Nat.mul(x, Nat.mul(d, d)), Nat.mul(x, Nat.mul(d, d))), N.mul_add(x, Nat.mul(d, d), Nat.mul(d, d)))))

def half_denominator(+d: Nat) -> {2n+Nat.add(R.denominator_product(d, d), R.denominator_product(d, d)) == Nat.add(Nat.mul(1n+d, 1n+d), Nat.mul(1n+d, 1n+d)) : Nat}:
  Equal.trans(Nat,
    2n+Nat.add(R.denominator_product(d, d), R.denominator_product(d, d)),
    Nat.add(1n+R.denominator_product(d, d), 1n+R.denominator_product(d, d)),
    Nat.add(Nat.mul(1n+d, 1n+d), Nat.mul(1n+d, 1n+d)),
    Equal.cong(Nat, Nat, x => 1n+x,
      1n+Nat.add(R.denominator_product(d, d), R.denominator_product(d, d)),
      Nat.add(R.denominator_product(d, d), 1n+R.denominator_product(d, d)),
      N.sym(Nat.add(R.denominator_product(d, d), 1n+R.denominator_product(d, d)), 1n+Nat.add(R.denominator_product(d, d), R.denominator_product(d, d)), N.add_succ(R.denominator_product(d, d), R.denominator_product(d, d)))),
    add_cong(1n+R.denominator_product(d, d), Nat.mul(1n+d, 1n+d), 1n+R.denominator_product(d, d), Nat.mul(1n+d, 1n+d), denominator_value(d, d), denominator_value(d, d)))

def average_numerator(+x: Nat, +d: Nat) -> {Nat.mul(Nat.add(Nat.mul(x, 1n+d), Nat.mul(x, 1n+d)), 1n+d) == Nat.mul(x, 2n+Nat.add(R.denominator_product(d, d), R.denominator_product(d, d))) : Nat}:
  %N.sym(2n+Nat.add(R.denominator_product(d, d), R.denominator_product(d, d)), Nat.add(Nat.mul(1n+d, 1n+d), Nat.mul(1n+d, 1n+d)), half_denominator(d)) : {Nat.mul(Nat.add(Nat.mul(x, 1n+d), Nat.mul(x, 1n+d)), 1n+d) == Nat.mul(x, _) : Nat}
  double_scale(x, 1n+d)

def Laws.average_same(a):
  match a:
    case R.Fraction{p, n, d}:
      +h = {2n+Nat.add(R.denominator_product(d, d), R.denominator_product(d, d)) : Nat}
      %N.sym(Nat.mul(Nat.add(Nat.mul(p, 1n+d), Nat.mul(p, 1n+d)), 1n+d), Nat.mul(p, h), average_numerator(p, d)) : {Nat.add(_, Nat.mul(n, h)) == Nat.add(Nat.mul(Nat.add(Nat.mul(n, 1n+d), Nat.mul(n, 1n+d)), 1n+d), Nat.mul(p, h)) : Nat}
      %N.sym(Nat.mul(Nat.add(Nat.mul(n, 1n+d), Nat.mul(n, 1n+d)), 1n+d), Nat.mul(n, h), average_numerator(n, d)) : {Nat.add(Nat.mul(p, h), Nat.mul(n, h)) == Nat.add(_, Nat.mul(p, h)) : Nat}
      N.add_comm(Nat.mul(p, h), Nat.mul(n, h))

def Laws.difference_opposite(a):
  match a:
    case R.Fraction{p, n, d}:
      Laws.average_same(R.Fraction{p, n, d})

def Laws.zero_content():
  {==}
def Laws.one_content():
  {==}
def Laws.fraction_content(n, d):
  {==}
def Laws.signed_zero():
  {==}
def Laws.signed_positive(p):
  {==}
def Laws.signed_negative(p):
  {==}
def Laws.negate_content(p, n, d):
  {==}
def Laws.add_content(p, n, d, r, s, e):
  {==}
def Laws.sub_content(p, n, d, r, s, e):
  {==}
def Laws.mul_content(p, n, d, r, s, e):
  {==}
def Laws.half_content(p, n, d):
  {==}
