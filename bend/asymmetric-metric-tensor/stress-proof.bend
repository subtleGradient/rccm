import Base
import ./units.bend as U
import ./rational.bend as R
import ./rational-laws.bend as RL
import ./rational-proof.bend as RP
import ./natural-proof.bend as N
import ./tensor.bend as Tensor
import ./matrix.bend as M
import ./capacity.bend as C
import ./stress.bend as S
import ./stress-laws.bend as Laws

def Laws.eta_table():
  {==}

def Laws.content(scale, slot, matrix):
  {==}

def product_zero(a: R.Q, b: R.Q, e: R.IsZero(b)) -> R.IsZero(R.mul(a, b)):
  match a b:
    case R.Fraction{p, n, d} R.Fraction{r, s, f}:
      %e : {Nat.add(Nat.mul(p, r), Nat.mul(n, _)) == Nat.add(Nat.mul(p, _), Nat.mul(n, r)) : Nat}
      {==}

def Laws.baseline_zero(scale, slot):
  +address = slot
  product_zero(U.positive_value(U.Pressure{}, scale),
    R.sub(M.at(address, S.eta()), M.at(address, S.eta())),
    RL.sub_equal(M.at(address, S.eta()), M.at(address, S.eta()), {==}))

# Record-level identity; no normalization or cancellation oracle.
def sub_negatives(a: R.Q, b: R.Q) -> {R.sub(R.negate(a), R.negate(b)) == R.sub(b, a) : R.Q}:
  match a b:
    case R.Fraction{+p, +n, +d} R.Fraction{+r, +s, +e}:
      RP.record_equal(
        Nat.add(Nat.mul(n, 1n+e), Nat.mul(r, 1n+d)),
        Nat.add(Nat.mul(p, 1n+e), Nat.mul(s, 1n+d)), R.denominator_product(d, e),
        Nat.add(Nat.mul(r, 1n+d), Nat.mul(n, 1n+e)),
        Nat.add(Nat.mul(s, 1n+d), Nat.mul(p, 1n+e)), R.denominator_product(e, d),
        N.add_comm(Nat.mul(n, 1n+e), Nat.mul(r, 1n+d)),
        N.add_comm(Nat.mul(p, 1n+e), Nat.mul(s, 1n+d)),
        RP.denominator_comm(d, e))

def Laws.temporal(scale, capacity, ex, ey, ez, bx, by, bz):
  +state = capacity
  Equal.cong(R.Q, R.Q, x => R.mul(U.positive_value(U.Pressure{}, scale), x),
    R.sub(R.negate(C.q(state)), R.negate(R.one())),
    R.sub(R.one(), C.q(state)), sub_negatives(C.q(state), R.one()))

def Laws.spatial(scale, direction, capacity, ex, ey, ez, bx, by, bz):
  match direction:
    case Laws.X{}:
      {==}
    case Laws.Y{}:
      {==}
    case Laws.Z{}:
      {==}
