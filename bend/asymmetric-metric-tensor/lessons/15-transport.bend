import Base
import ../fields.bend as F
import ../clebsch.bend as C
import ../transport.bend as D
import ../tensor.bend as T
import ../matrix.bend as M
import ../rational.bend as R
import ../format.bend as Format

def main() -> IO(Unit):
  +point = {M.Row{R.fraction(3n,0n),R.fraction(2n,0n),R.zero(),R.zero()} : M.Row}
  do IO<Unit>:
    IO.print("f=t*x, v=(2,0,0), point t=3,x=2")
    IO.print("material=" ++ Format.show(F.eval(D.material(F.Mul{F.Coord{T.T{}},F.Coord{T.X{}}},
      C.Vector{F.Const{R.fraction(2n,0n)},F.Const{R.zero()},F.Const{R.zero()}}),point)))
    IO.print("rho=1, v=(x,0,0): continuity residual=" ++ Format.show(F.eval(D.continuity(F.Const{R.one()},
      C.Vector{F.Coord{T.X{}},F.Const{R.zero()},F.Const{R.zero()}}),point)))
    IO.print("momentum lhs=" ++ Format.show(F.eval(D.momentum1d(F.Const{R.one()},F.Coord{T.X{}}),point)))
    IO.print("d(x*x^2)/dx=" ++ Format.show(F.eval(F.diff(F.Mul{F.Coord{T.X{}},F.square(F.Coord{T.X{}})},T.X{}),point)))
    IO.print("x*d(x^2)/dx=" ++ Format.show(F.eval(F.Mul{F.Coord{T.X{}},F.diff(F.square(F.Coord{T.X{}}),T.X{})},point)))
