import Base
import ./tensor.bend as Tensor
import ./matrix.bend as M
import ./rational.bend as R

type Vector4 is Data:
  Vector4{t: R.Q, x: R.Q, y: R.Q, z: R.Q}

def symmetric_entry(+slot: Tensor.Slot, +matrix: M.Matrix) -> R.Q:
  R.half(R.add(M.at(slot, matrix), M.at(Tensor.swap(slot), matrix)))

def antisymmetric_entry(+slot: Tensor.Slot, +matrix: M.Matrix) -> R.Q:
  R.half(R.sub(M.at(slot, matrix), M.at(Tensor.swap(slot), matrix)))

def sum4(a: R.Q, b: R.Q, c: R.Q, d: R.Q) -> R.Q:
  R.add(R.add(a, b), R.add(c, d))

def sum6(a: R.Q, b: R.Q, c: R.Q, d: R.Q, e: R.Q, f: R.Q) -> R.Q:
  R.add(sum4(a, b, c, d), R.add(e, f))

# The two ordinary contraction terms from mirrored matrix slots.
def paired(a: R.Q, b: R.Q, xi: R.Q, xj: R.Q, yi: R.Q, yj: R.Q) -> R.Q:
  R.add(R.mul(a, R.mul(xi, yj)), R.mul(b, R.mul(xj, yi)))

def diagonal(x: Vector4, matrix: M.Matrix, y: Vector4) -> R.Q:
  match x matrix y:
    case Vector4{xt, xx, xy, xz} M.Matrix{M.Row{tt, _, _, _}, M.Row{_, sx, _, _}, M.Row{_, _, sy, _}, M.Row{_, _, _, sz}} Vector4{yt, yx, yy, yz}:
      sum4(
        R.mul(tt, R.mul(xt, yt)), R.mul(sx, R.mul(xx, yx)),
        R.mul(sy, R.mul(xy, yy)), R.mul(sz, R.mul(xz, yz))
      )

def off_diagonal(x: Vector4, matrix: M.Matrix, y: Vector4) -> R.Q:
  match x matrix y:
    case Vector4{+xt, +xx, +xy, +xz} M.Matrix{M.Row{_, tx, ty, tz}, M.Row{it, _, iy, iz}, M.Row{jt, jx, _, jz}, M.Row{kt, kx, ky, _}} Vector4{+yt, +yx, +yy, +yz}:
      sum6(
        paired(tx, it, xt, xx, yt, yx),
        paired(ty, jt, xt, xy, yt, yy),
        paired(tz, kt, xt, xz, yt, yz),
        paired(iy, jx, xx, xy, yx, yy),
        paired(iz, kx, xx, xz, yx, yz),
        paired(jz, ky, xy, xz, yy, yz)
      )

# All sixteen terms x_i M_ij y_j, grouped rather than omitted.
# Works on an arbitrary stored matrix, not just generated skew matrices.
def bilinear(+x: Vector4, +matrix: M.Matrix, +y: Vector4) -> R.Q:
  R.add(diagonal(x, matrix, y), off_diagonal(x, matrix, y))

def basis(axis: Tensor.Axis) -> Vector4:
  match axis:
    case Tensor.T{}:
      Vector4{R.one(), R.zero(), R.zero(), R.zero()}
    case Tensor.X{}:
      Vector4{R.zero(), R.one(), R.zero(), R.zero()}
    case Tensor.Y{}:
      Vector4{R.zero(), R.zero(), R.one(), R.zero()}
    case Tensor.Z{}:
      Vector4{R.zero(), R.zero(), R.zero(), R.one()}
