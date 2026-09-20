import Base
import ./rational.bend as R
import ./tensor.bend as T
import ./matrix.bend as M

# Polynomial AST in dimensionless (t,x,y,z). A point is M.Row in that order.
type Expr is Data:
  Const{value: R.Q}
  Coord{axis: T.Axis}
  Add{left: Expr, right: Expr}
  Mul{left: Expr, right: Expr}

def eval(expr: Expr, +point: M.Row) -> R.Q:
  match expr:
    case Const{value}:
      value
    case Coord{axis}:
      M.row_at(axis, point)
    case Add{left, right}:
      R.add(eval(left, point), eval(right, point))
    case Mul{left, right}:
      R.mul(eval(left, point), eval(right, point))

def delta(a: T.Axis, b: T.Axis) -> R.Q:
  match a b:
    case T.T{} T.T{}:
      R.one()
    case T.X{} T.X{}:
      R.one()
    case T.Y{} T.Y{}:
      R.one()
    case T.Z{} T.Z{}:
      R.one()
    case _ _:
      R.zero()

def diff(expr: Expr, +axis: T.Axis) -> Expr:
  match expr:
    case Const{value}:
      Const{R.zero()}
    case Coord{other}:
      Const{delta(axis, other)}
    case Add{left, right}:
      Add{diff(left, axis), diff(right, axis)}
    case Mul{+left, +right}:
      Add{Mul{diff(left, axis), right}, Mul{left, diff(right, axis)}}

def neg(expr: Expr) -> Expr:
  Mul{Const{R.negate(R.one())}, expr}

def sub(a: Expr, b: Expr) -> Expr:
  Add{a, neg(b)}

def square(+expr: Expr) -> Expr:
  Mul{expr, expr}

def second(expr: Expr, +axis: T.Axis) -> Expr:
  diff(diff(expr, axis), axis)

def origin() -> M.Row:
  M.Row{R.zero(), R.zero(), R.zero(), R.zero()}

def example() -> Expr:
  Add{square(Coord{T.X{}}), Mul{Coord{T.X{}}, Coord{T.Y{}}}}
