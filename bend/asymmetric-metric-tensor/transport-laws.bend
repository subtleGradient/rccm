import Base
import ./fields.bend as F
import ./clebsch.bend as C
import ./transport.bend as D
import ./tensor.bend as T
import ./matrix.bend as M
import ./rational.bend as R

law divergence_contents:
  for x: F.Expr
  for y: F.Expr
  for z: F.Expr
  {D.divergence(C.Vector{x,y,z})
    == F.Add{F.Add{F.diff(x,T.X{}),F.diff(y,T.Y{})},F.diff(z,T.Z{})} : F.Expr}
law material_contents:
  for +f: F.Expr
  for vx: F.Expr
  for vy: F.Expr
  for vz: F.Expr
  {D.material(f,C.Vector{vx,vy,vz}) == F.Add{F.diff(f,T.T{}),
    F.Add{F.Add{F.Mul{vx,F.diff(f,T.X{})},F.Mul{vy,F.diff(f,T.Y{})}},
      F.Mul{vz,F.diff(f,T.Z{})}}} : F.Expr}
law continuity_contents:
  for +rho: F.Expr
  for v: C.Vector
  {D.continuity(rho,v) == F.Add{F.diff(rho,T.T{}),D.divergence(C.scale(rho,v))} : F.Expr}
law moving_fixture:
  R.Same(F.eval(D.material(F.Mul{F.Coord{T.T{}},F.Coord{T.X{}}},
    C.Vector{F.Const{R.fraction(2n,0n)},F.Const{R.zero()},F.Const{R.zero()}}),
    M.Row{R.fraction(3n,0n),R.fraction(2n,0n),R.zero(),R.zero()}),R.fraction(8n,0n))
law continuity_not_automatic:
  R.Same(F.eval(D.continuity(F.Const{R.one()},
    C.Vector{F.Coord{T.X{}},F.Const{R.zero()},F.Const{R.zero()}}),F.origin()),R.one())
law coefficient_fixture:
  R.Same(F.eval(F.diff(F.Mul{F.Coord{T.X{}},F.square(F.Coord{T.X{}})},T.X{}),
    M.Row{R.zero(),R.fraction(2n,0n),R.zero(),R.zero()}),R.fraction(12n,0n))
law momentum_fixture:
  R.Same(F.eval(D.momentum1d(F.Const{R.one()},F.Coord{T.X{}}),
    M.Row{R.zero(),R.fraction(2n,0n),R.zero(),R.zero()}),R.fraction(4n,0n))
