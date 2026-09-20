import Base
import ./coordinates.bend as C
import ./coordinates-laws.bend as Laws
import ./tensor.bend as T
import ./matrix.bend as M

def Laws.time_axis():
  {==}
def Laws.x_axis():
  {==}
def Laws.y_axis():
  {==}
def Laws.z_axis():
  {==}

def Laws.component(matrix, row, column):
  match matrix:
    case M.Matrix{M.Row{tt, tx, ty, tz}, M.Row{xt, xx, xy, xz}, M.Row{yt, yx, yy, yz}, M.Row{zt, zx, zy, zz}}:
      match row column:
        case T.T{} T.T{}:
          {==}
        case T.T{} T.X{}:
          {==}
        case T.T{} T.Y{}:
          {==}
        case T.T{} T.Z{}:
          {==}
        case T.X{} T.T{}:
          {==}
        case T.X{} T.X{}:
          {==}
        case T.X{} T.Y{}:
          {==}
        case T.X{} T.Z{}:
          {==}
        case T.Y{} T.T{}:
          {==}
        case T.Y{} T.X{}:
          {==}
        case T.Y{} T.Y{}:
          {==}
        case T.Y{} T.Z{}:
          {==}
        case T.Z{} T.T{}:
          {==}
        case T.Z{} T.X{}:
          {==}
        case T.Z{} T.Y{}:
          {==}
        case T.Z{} T.Z{}:
          {==}

def Laws.three_cycles(matrix):
  match matrix:
    case M.Matrix{M.Row{tt, tx, ty, tz}, M.Row{xt, xx, xy, xz}, M.Row{yt, yx, yy, yz}, M.Row{zt, zx, zy, zz}}:
      {==}

def Laws.transpose_commutes(matrix):
  match matrix:
    case M.Matrix{M.Row{tt, tx, ty, tz}, M.Row{xt, xx, xy, xz}, M.Row{yt, yx, yy, yz}, M.Row{zt, zx, zy, zz}}:
      {==}

def Laws.negate_commutes(matrix):
  match matrix:
    case M.Matrix{M.Row{tt, tx, ty, tz}, M.Row{xt, xx, xy, xz}, M.Row{yt, yx, yy, yz}, M.Row{zt, zx, zy, zz}}:
      {==}

def Laws.symmetric_preserved(matrix, symmetric):
  Equal.trans(M.Matrix, M.transpose(C.cycle(matrix)), C.cycle(M.transpose(matrix)), C.cycle(matrix),
    Laws.transpose_commutes(matrix),
    Equal.cong(M.Matrix, M.Matrix, C.cycle, M.transpose(matrix), matrix, symmetric))

def Laws.antisymmetric_preserved(matrix, antisymmetric):
  Equal.trans(M.Matrix, M.transpose(C.cycle(matrix)), C.cycle(M.transpose(matrix)), M.negate(C.cycle(matrix)),
    Laws.transpose_commutes(matrix),
    Equal.trans(M.Matrix, C.cycle(M.transpose(matrix)), C.cycle(M.negate(matrix)), M.negate(C.cycle(matrix)),
      Equal.cong(M.Matrix, M.Matrix, C.cycle, M.transpose(matrix), M.negate(matrix), antisymmetric),
      Equal.sym(M.Matrix, M.negate(C.cycle(matrix)), C.cycle(M.negate(matrix)), Laws.negate_commutes(matrix))))
