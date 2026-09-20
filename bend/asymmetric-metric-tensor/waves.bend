import Base
import ./fields.bend as F
import ./operators.bend as O
import ./tensor.bend as T
import ./matrix.bend as M
import ./rational.bend as R
import ./units.bend as U

# c is the positive dimensionless speed c_phys*T0/L0, constant on this patch.
def box(+field: F.Expr, c: U.Positive<U.Unitless{}>) -> F.Expr:
  +inverse = U.inverse_value(U.Unitless{},c)
  F.sub(O.laplacian(field),F.Mul{F.Const{R.mul(inverse,inverse)},F.second(field,T.T{})})

def profile(speed: R.Q) -> F.Expr:
  F.square(F.sub(F.Coord{T.X{}},F.Mul{F.Const{speed},F.Coord{T.T{}}}))

def reading(point: M.Row) -> R.Q:
  F.eval(profile(R.one()),point)

def residual(point: M.Row) -> R.Q:
  F.eval(box(profile(R.one()),U.Positive{0n,0n}),point)
