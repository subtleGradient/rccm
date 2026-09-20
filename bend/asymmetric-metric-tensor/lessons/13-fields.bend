import Base
import ../fields.bend as F
import ../rational.bend as R
import ../matrix.bend as M
import ../tensor.bend as T
import ../format.bend as Format

def main() -> IO(Unit):
  +point = {M.Row{R.zero(), R.fraction(3n, 0n), R.fraction(2n, 0n), R.zero()} : M.Row}
  do IO<Unit>:
    IO.print("f=x*x+x*y; point (t,x,y,z)=(0,3,2,0)")
    IO.print("f=" ++ Format.show(F.eval(F.example(), point)))
    IO.print("dx=" ++ Format.show(F.eval(F.diff(F.example(), T.X{}), point)))
    IO.print("dy=" ++ Format.show(F.eval(F.diff(F.example(), T.Y{}), point)))
    IO.print("dxx=" ++ Format.show(F.eval(F.second(F.example(), T.X{}), point)))
