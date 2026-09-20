import Base
import ./tensor.bend as T
import ./matrix.bend as M

# Pullback address map: NEW label -> OLD label. Time is unchanged.
def old_axis(axis: T.Axis) -> T.Axis:
  match axis:
    case T.T{}:
      T.T{}
    case T.X{}:
      T.Y{}
    case T.Y{}:
      T.Z{}
    case T.Z{}:
      T.X{}

# A passive, orientation-preserving spatial cycle on ANY stored matrix.
# Both indices change; no sample recipe or field interpretation is required.
def cycle(matrix: M.Matrix) -> M.Matrix:
  match matrix:
    case M.Matrix{M.Row{tt, tx, ty, tz}, M.Row{xt, xx, xy, xz}, M.Row{yt, yx, yy, yz}, M.Row{zt, zx, zy, zz}}:
      M.Matrix{
        M.Row{tt, ty, tz, tx}, M.Row{yt, yy, yz, yx},
        M.Row{zt, zy, zz, zx}, M.Row{xt, xy, xz, xx}
      }
