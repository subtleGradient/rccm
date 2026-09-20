import Base
import ./tensor.bend as Tensor
import ./capacity.bend as Capacity
import ./matrix.bend as M
import ./probes.bend as P
import ./probes-laws.bend as Laws
import ./rational.bend as R
import ./rational-proof.bend as RP
import ./rational-laws.bend as RL

def mean_zero(+a: R.Q) -> R.Same(R.half(R.add(a, R.negate(a))), R.zero()):
  RL.zero_same(R.half(R.add(a, R.negate(a))), RL.average_opposite(a))

def mean_reverse_zero(+a: R.Q) -> R.Same(R.half(R.add(R.negate(a), a)), R.zero()):
  %RL.negate_twice(a) : R.Same(R.half(R.add(R.negate(a), _)), R.zero())
  mean_zero(R.negate(a))

def difference_zero(+a: R.Q) -> R.Same(R.half(R.sub(a, a)), R.zero()):
  RL.zero_same(R.half(R.sub(a, a)), RL.difference_same(a))

def difference_reverse(+a: R.Q) -> R.Same(R.half(R.sub(R.negate(a), a)), R.negate(a)):
  %RL.negate_twice(a) : R.Same(R.half(R.sub(R.negate(a), _)), R.negate(a))
  RL.difference_opposite(R.negate(a))

def Laws.basis_t():
  {==}

def Laws.basis_x():
  {==}

def Laws.basis_y():
  {==}

def Laws.basis_z():
  {==}

def Laws.symmetric_rule(slot, matrix):
  {==}

def Laws.antisymmetric_rule(slot, matrix):
  {==}

def Laws.recover_s(sample, slot):
  match sample:
    case M.Sample{capacity, ex, ey, ez, bx, by, bz}:
      match slot:
        case Tensor.Slot{Tensor.T{}, Tensor.T{}}:
          RL.average_same(R.negate(Capacity.q(capacity)))
        case Tensor.Slot{Tensor.T{}, Tensor.X{}}:
          mean_reverse_zero(ex)
        case Tensor.Slot{Tensor.T{}, Tensor.Y{}}:
          mean_reverse_zero(ey)
        case Tensor.Slot{Tensor.T{}, Tensor.Z{}}:
          mean_reverse_zero(ez)
        case Tensor.Slot{Tensor.X{}, Tensor.T{}}:
          mean_zero(ex)
        case Tensor.Slot{Tensor.X{}, Tensor.X{}}:
          RL.average_same(Capacity.inverse(capacity))
        case Tensor.Slot{Tensor.X{}, Tensor.Y{}}:
          mean_reverse_zero(bz)
        case Tensor.Slot{Tensor.X{}, Tensor.Z{}}:
          mean_zero(by)
        case Tensor.Slot{Tensor.Y{}, Tensor.T{}}:
          mean_zero(ey)
        case Tensor.Slot{Tensor.Y{}, Tensor.X{}}:
          mean_zero(bz)
        case Tensor.Slot{Tensor.Y{}, Tensor.Y{}}:
          RL.average_same(Capacity.inverse(capacity))
        case Tensor.Slot{Tensor.Y{}, Tensor.Z{}}:
          mean_reverse_zero(bx)
        case Tensor.Slot{Tensor.Z{}, Tensor.T{}}:
          mean_zero(ez)
        case Tensor.Slot{Tensor.Z{}, Tensor.X{}}:
          mean_reverse_zero(by)
        case Tensor.Slot{Tensor.Z{}, Tensor.Y{}}:
          mean_zero(bx)
        case Tensor.Slot{Tensor.Z{}, Tensor.Z{}}:
          RL.average_same(Capacity.inverse(capacity))

def Laws.recover_a(sample, slot):
  match sample:
    case M.Sample{capacity, ex, ey, ez, bx, by, bz}:
      match slot:
        case Tensor.Slot{Tensor.T{}, Tensor.T{}}:
          difference_zero(R.negate(Capacity.q(capacity)))
        case Tensor.Slot{Tensor.T{}, Tensor.X{}}:
          difference_reverse(ex)
        case Tensor.Slot{Tensor.T{}, Tensor.Y{}}:
          difference_reverse(ey)
        case Tensor.Slot{Tensor.T{}, Tensor.Z{}}:
          difference_reverse(ez)
        case Tensor.Slot{Tensor.X{}, Tensor.T{}}:
          RL.difference_opposite(ex)
        case Tensor.Slot{Tensor.X{}, Tensor.X{}}:
          difference_zero(Capacity.inverse(capacity))
        case Tensor.Slot{Tensor.X{}, Tensor.Y{}}:
          difference_reverse(bz)
        case Tensor.Slot{Tensor.X{}, Tensor.Z{}}:
          RL.difference_opposite(by)
        case Tensor.Slot{Tensor.Y{}, Tensor.T{}}:
          RL.difference_opposite(ey)
        case Tensor.Slot{Tensor.Y{}, Tensor.X{}}:
          RL.difference_opposite(bz)
        case Tensor.Slot{Tensor.Y{}, Tensor.Y{}}:
          difference_zero(Capacity.inverse(capacity))
        case Tensor.Slot{Tensor.Y{}, Tensor.Z{}}:
          difference_reverse(bx)
        case Tensor.Slot{Tensor.Z{}, Tensor.T{}}:
          RL.difference_opposite(ez)
        case Tensor.Slot{Tensor.Z{}, Tensor.X{}}:
          difference_reverse(by)
        case Tensor.Slot{Tensor.Z{}, Tensor.Y{}}:
          RL.difference_opposite(bx)
        case Tensor.Slot{Tensor.Z{}, Tensor.Z{}}:
          difference_zero(Capacity.inverse(capacity))

def Laws.sum4_contents(a, b, c, d):
  {==}

def Laws.sum6_contents(a, b, c, d, e, f):
  {==}

def Laws.paired_contents(a, b, xi, xj, yi, yj):
  {==}

def Laws.bilinear_contents(x, matrix, y):
  match x matrix y:
    case P.Vector4{xt, xx, xy, xz} M.Matrix{M.Row{tt, tx, ty, tz}, M.Row{it, ix, iy, iz}, M.Row{jt, jx, jy, jz}, M.Row{kt, kx, ky, kz}} P.Vector4{yt, yx, yy, yz}:
      {==}

# Proof combinators for the same grouping used by the actual 16-term sum.
def sum4_zero(
  +a: R.Q, +b: R.Q, +c: R.Q, +d: R.Q,
  ea: R.IsZero(a), eb: R.IsZero(b), ec: R.IsZero(c), ed: R.IsZero(d)
) -> R.IsZero(P.sum4(a, b, c, d)):
  RL.sum_zero(
    R.add(a, b), R.add(c, d),
    RL.sum_zero(a, b, ea, eb), RL.sum_zero(c, d, ec, ed)
  )

def sum6_zero(
  +a: R.Q, +b: R.Q, +c: R.Q, +d: R.Q, +e: R.Q, +f: R.Q,
  ea: R.IsZero(a), eb: R.IsZero(b), ec: R.IsZero(c),
  ed: R.IsZero(d), ee: R.IsZero(e), ef: R.IsZero(f)
) -> R.IsZero(P.sum6(a, b, c, d, e, f)):
  RL.sum_zero(
    P.sum4(a, b, c, d), R.add(e, f),
    sum4_zero(a, b, c, d, ea, eb, ec, ed), RL.sum_zero(e, f, ee, ef)
  )

def zero_left(+a: R.Q) -> R.IsZero(R.mul(R.zero(), a)):
  %RL.mul_comm(a, R.zero()) : R.IsZero(_)
  RL.mul_zero_right(a)

# a*u*v + (-a)*v*u = 0, using commutativity and the proved sign rule.
def cancel(+a: R.Q, +u: R.Q, +v: R.Q) -> R.IsZero(P.paired(a, R.negate(a), u, v, u, v)):
  %RL.mul_comm(u, v) : R.IsZero(R.add(
    R.mul(a, R.mul(u, v)), R.mul(R.negate(a), _)
  ))
  +w = R.mul(u, v)
  +term = R.mul(a, w)
  %Equal.sym(R.Q, R.mul(R.negate(a), w), R.negate(term), RL.mul_neg_left(a, w)) :
    R.IsZero(R.add(term, _))
  RL.sub_equal(term, term, {==})

def cancel_reverse(+a: R.Q, +u: R.Q, +v: R.Q) -> R.IsZero(P.paired(R.negate(a), a, u, v, u, v)):
  %RL.negate_twice(a) : R.IsZero(P.paired(R.negate(a), _, u, v, u, v))
  cancel(R.negate(a), u, v)

def diagonal_zero(sample: M.Sample, x: P.Vector4) -> R.IsZero(P.diagonal(x, M.antisymmetric(sample), x)):
  match sample x:
    case M.Sample{capacity, ex, ey, ez, bx, by, bz} P.Vector4{+t, +i, +j, +k}:
      +a = R.mul(t, t)
      +b = R.mul(i, i)
      +c = R.mul(j, j)
      +d = R.mul(k, k)
      sum4_zero(
        R.mul(R.zero(), a), R.mul(R.zero(), b), R.mul(R.zero(), c), R.mul(R.zero(), d),
        zero_left(a), zero_left(b), zero_left(c), zero_left(d)
      )

def off_diagonal_zero(sample: M.Sample, x: P.Vector4) -> R.IsZero(P.off_diagonal(x, M.antisymmetric(sample), x)):
  match sample x:
    case M.Sample{capacity, +ex, +ey, +ez, +bx, +by, +bz} P.Vector4{+t, +i, +j, +k}:
      sum6_zero(
        P.paired(R.negate(ex), ex, t, i, t, i),
        P.paired(R.negate(ey), ey, t, j, t, j),
        P.paired(R.negate(ez), ez, t, k, t, k),
        P.paired(R.negate(bz), bz, i, j, i, j),
        P.paired(by, R.negate(by), i, k, i, k),
        P.paired(R.negate(bx), bx, j, k, j, k),
        cancel_reverse(ex, t, i), cancel_reverse(ey, t, j),
        cancel_reverse(ez, t, k), cancel_reverse(bz, i, j),
        cancel(by, i, k), cancel_reverse(bx, j, k)
      )

def Laws.antisymmetric_quadratic(sample, x):
  RL.sum_zero(
    P.diagonal(x, M.antisymmetric(sample), x),
    P.off_diagonal(x, M.antisymmetric(sample), x),
    diagonal_zero(sample, x), off_diagonal_zero(sample, x)
  )
