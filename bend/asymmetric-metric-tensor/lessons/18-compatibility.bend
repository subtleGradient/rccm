import Base
import ../compatibility.bend as C
import ../fields.bend as F
import ../matrix.bend as M
import ../rational.bend as R
import ../format.bend as Format

def main() -> IO(Unit):
  +point = {M.Row{R.zero(),R.one(),R.one(),R.zero()} : M.Row}
  do IO<Unit>:
    IO.print("Planar infinitesimal strain; component Inc_xyxy")
    IO.print("u=(x*y^2,0): " ++ Format.show(F.eval(C.inc(C.compatible()),point)))
    IO.print("epsilon_xx=epsilon_yy=x^2+y^2, xy=0: " ++ Format.show(F.eval(C.inc(C.incompatible()),point)))
