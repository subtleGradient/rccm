import Base
import ./fields.bend as F
import ./rational.bend as R
import ./tensor.bend as T
import ./matrix.bend as M

law eval_constant:
  for value: R.Q
  for point: M.Row
  {F.eval(F.Const{value}, point) == value : R.Q}
law eval_coordinate:
  for axis: T.Axis
  for point: M.Row
  {F.eval(F.Coord{axis}, point) == M.row_at(axis, point) : R.Q}
law eval_sum:
  for a: F.Expr
  for b: F.Expr
  for +p: M.Row
  {F.eval(F.Add{a, b}, p) == R.add(F.eval(a, p), F.eval(b, p)) : R.Q}
law eval_product:
  for a: F.Expr
  for b: F.Expr
  for +p: M.Row
  {F.eval(F.Mul{a, b}, p) == R.mul(F.eval(a, p), F.eval(b, p)) : R.Q}
law diff_constant:
  for value: R.Q
  for axis: T.Axis
  {F.diff(F.Const{value}, axis) == F.Const{R.zero()} : F.Expr}
law diff_self:
  for +axis: T.Axis
  {F.diff(F.Coord{axis}, axis) == F.Const{R.one()} : F.Expr}
law diff_sum:
  for a: F.Expr
  for b: F.Expr
  for +axis: T.Axis
  {F.diff(F.Add{a, b}, axis) == F.Add{F.diff(a, axis), F.diff(b, axis)} : F.Expr}
law diff_product:
  for +a: F.Expr
  for +b: F.Expr
  for +axis: T.Axis
  {F.diff(F.Mul{a, b}, axis)
    == F.Add{F.Mul{F.diff(a, axis), b}, F.Mul{a, F.diff(b, axis)}} : F.Expr}
law derivative_fixture:
  R.Same(F.eval(F.diff(F.example(), T.X{}),
    M.Row{R.zero(), R.fraction(3n, 0n), R.fraction(2n, 0n), R.zero()}), R.fraction(8n, 0n))
law cross_coordinate:
  {F.diff(F.Coord{T.Y{}}, T.X{}) == F.Const{R.zero()} : F.Expr}

# Every ordered coordinate/differentiation pair, independently specified by I4.
# Other cross-axis cases are not inferred from one example.
law diff_coordinate:
  for coordinate: T.Axis
  for axis: T.Axis
  {F.diff(F.Coord{coordinate}, axis) == F.Const{M.at(T.Slot{coordinate,axis},
    M.Matrix{
      M.Row{R.one(),R.zero(),R.zero(),R.zero()},
      M.Row{R.zero(),R.one(),R.zero(),R.zero()},
      M.Row{R.zero(),R.zero(),R.one(),R.zero()},
      M.Row{R.zero(),R.zero(),R.zero(),R.one()}})} : F.Expr}
