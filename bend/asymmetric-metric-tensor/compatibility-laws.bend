import Base
import ./compatibility.bend as C
import ./fields.bend as F
import ./tensor.bend as T
import ./rational.bend as R
import ./matrix.bend as M

law strain_contents:
  for +ux: F.Expr
  for +uy: F.Expr
  {C.from_displacement(ux,uy) == C.Strain{F.diff(ux,T.X{}),
    F.Mul{F.Const{R.fraction(1n,1n)},F.Add{F.diff(ux,T.Y{}),F.diff(uy,T.X{})}},
    F.diff(uy,T.Y{})} : C.Strain}
law inc_contents:
  for xx: F.Expr
  for +xy: F.Expr
  for yy: F.Expr
  {C.inc(C.Strain{xx,xy,yy}) == F.sub(
    F.Add{F.second(xx,T.Y{}),F.second(yy,T.X{})},
    F.Add{F.diff(F.diff(xy,T.X{}),T.Y{}),F.diff(F.diff(xy,T.Y{}),T.X{})}) : F.Expr}
law compatible_fixture:
  R.IsZero(F.eval(C.inc(C.compatible()),M.Row{R.zero(),R.one(),R.one(),R.zero()}))
law incompatible_fixture:
  R.Same(F.eval(C.inc(C.incompatible()),F.origin()),R.fraction(4n,0n))
