import Base
import ./tensor.bend as T
import ./rational.bend as R
import ./matrix.bend as M

# Flat eta = diag(-1,1,1,1). This is NOT inversion of U.
def sign(axis: T.Axis, value: R.Q) -> R.Q:
  match axis:
    case T.T{}:
      R.negate(value)
    case T.X{}:
      value
    case T.Y{}:
      value
    case T.Z{}:
      value

def raise(slot: T.Slot, value: R.Q) -> R.Q:
  match slot:
    case T.Slot{row,column}:
      sign(row,sign(column,value))

def upper(+slot: T.Slot, matrix: M.Matrix) -> R.Q:
  raise(slot,M.at(slot,matrix))
