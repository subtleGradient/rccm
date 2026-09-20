import Base
import ./operators.bend as O
import ./fields.bend as F
import ./tensor.bend as T
import ./rational.bend as R
import ./matrix.bend as M

law laplacian_contents:
  for +f: F.Expr
  {O.laplacian(f) == F.Add{F.Add{F.second(f,T.X{}),F.second(f,T.Y{})},F.second(f,T.Z{})} : F.Expr}
law biharmonic_contents:
  for f: F.Expr
  {O.biharmonic(f) == O.laplacian(O.laplacian(f)) : F.Expr}
law poisson_contents:
  for +f: F.Expr
  for +radius: R.Q
  {O.poisson(f,radius) == F.sub(O.laplacian(f),
    F.Mul{F.Const{R.mul(radius,radius)},O.biharmonic(f)}) : F.Expr}
law quadratic_curvature_fixture:
  R.Same(F.eval(O.laplacian(O.quartic()),M.Row{R.zero(),R.one(),R.zero(),R.zero()}),R.fraction(12n,0n))
law fourth_derivative_fixture:
  R.Same(F.eval(O.biharmonic(O.quartic()),F.origin()),R.fraction(24n,0n))
law mixed_derivative_fixture:
  R.Same(F.eval(O.biharmonic(O.mixed()),F.origin()),R.fraction(8n,0n))
law source_fixture:
  R.Same(F.eval(O.poisson(O.quartic(),R.one()),
    M.Row{R.zero(),R.one(),R.zero(),R.zero()}),R.negate(R.fraction(12n,0n)))
