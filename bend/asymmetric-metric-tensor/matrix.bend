import Base
import ./tensor.bend as Tensor
import ./capacity.bend as Capacity
import ./rational.bend as R

# A stored 4 x 4 component table, not a closure or a matrix-shaped display.
type Row is Data:
  Row{t: R.Q, x: R.Q, y: R.Q, z: R.Q}

type Matrix is Data:
  Matrix{t: Row, x: Row, y: Row, z: Row}

type Sample is Data:
  Sample{capacity: Capacity.Regular, ex: R.Q, ey: R.Q, ez: R.Q, bx: R.Q, by: R.Q, bz: R.Q}

def row_at(axis: Tensor.Axis, row: Row) -> R.Q:
  match axis row:
    case Tensor.T{} Row{t, x, y, z}:
      t
    case Tensor.X{} Row{t, x, y, z}:
      x
    case Tensor.Y{} Row{t, x, y, z}:
      y
    case Tensor.Z{} Row{t, x, y, z}:
      z

def select_row(axis: Tensor.Axis, matrix: Matrix) -> Row:
  match axis matrix:
    case Tensor.T{} Matrix{t, x, y, z}:
      t
    case Tensor.X{} Matrix{t, x, y, z}:
      x
    case Tensor.Y{} Matrix{t, x, y, z}:
      y
    case Tensor.Z{} Matrix{t, x, y, z}:
      z

def at(slot: Tensor.Slot, matrix: Matrix) -> R.Q:
  match slot:
    case Tensor.Slot{r, c}:
      row_at(c, select_row(r, matrix))

def transpose(matrix: Matrix) -> Matrix:
  match matrix:
    case Matrix{Row{tt, tx, ty, tz}, Row{xt, xx, xy, xz}, Row{yt, yx, yy, yz}, Row{zt, zx, zy, zz}}:
      Matrix{
        Row{tt, xt, yt, zt}, Row{tx, xx, yx, zx},
        Row{ty, xy, yy, zy}, Row{tz, xz, yz, zz}
      }

def negate(matrix: Matrix) -> Matrix:
  match matrix:
    case Matrix{Row{tt, tx, ty, tz}, Row{xt, xx, xy, xz}, Row{yt, yx, yy, yz}, Row{zt, zx, zy, zz}}:
      Matrix{
        Row{R.negate(tt), R.negate(tx), R.negate(ty), R.negate(tz)},
        Row{R.negate(xt), R.negate(xx), R.negate(xy), R.negate(xz)},
        Row{R.negate(yt), R.negate(yx), R.negate(yy), R.negate(yz)},
        Row{R.negate(zt), R.negate(zx), R.negate(zy), R.negate(zz)}
      }

def symmetric(sample: Sample) -> Matrix:
  match sample:
    case Sample{+capacity, ex, ey, ez, bx, by, bz}:
      +spatial = Capacity.inverse(capacity)
      Matrix{
        Row{R.negate(Capacity.q(capacity)), R.zero(), R.zero(), R.zero()},
        Row{R.zero(), spatial, R.zero(), R.zero()},
        Row{R.zero(), R.zero(), spatial, R.zero()},
        Row{R.zero(), R.zero(), R.zero(), spatial}
      }

def antisymmetric(sample: Sample) -> Matrix:
  match sample:
    case Sample{capacity, +ex, +ey, +ez, +bx, +by, +bz}:
      Matrix{
        Row{R.zero(), R.negate(ex), R.negate(ey), R.negate(ez)},
        Row{ex, R.zero(), R.negate(bz), by},
        Row{ey, bz, R.zero(), R.negate(bx)},
        Row{ez, R.negate(by), bx, R.zero()}
      }

# Direct assembly of RCCM-GfX-2.tex eq:unified_matrix.
# All six signed contributions are supplied; no constitutive law is invented.
def assemble(sample: Sample) -> Matrix:
  match sample:
    case Sample{+capacity, +ex, +ey, +ez, +bx, +by, +bz}:
      +spatial = Capacity.inverse(capacity)
      Matrix{
        Row{R.negate(Capacity.q(capacity)), R.negate(ex), R.negate(ey), R.negate(ez)},
        Row{ex, spatial, R.negate(bz), by},
        Row{ey, bz, spatial, R.negate(bx)},
        Row{ez, R.negate(by), bx, spatial}
      }

def vacuum() -> Sample:
  Sample{Capacity.Regular{0n, 0n}, R.zero(), R.zero(), R.zero(), R.zero(), R.zero(), R.zero()}
