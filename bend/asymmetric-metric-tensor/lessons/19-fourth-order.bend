import Base
import ../operators.bend as O
import ../fields.bend as F
import ../matrix.bend as M
import ../rational.bend as R
import ../format.bend as Format

def main() -> IO(Unit):
  +point = {M.Row{R.zero(),R.one(),R.zero(),R.zero()} : M.Row}
  do IO<Unit>:
    IO.print("phi=x^4, point x=1, dimensionless reference coordinates")
    IO.print("laplacian=" ++ Format.show(F.eval(O.laplacian(O.quartic()),point)))
    IO.print("biharmonic=" ++ Format.show(F.eval(O.biharmonic(O.quartic()),point)))
    IO.print("source rc/L0=1: " ++ Format.show(F.eval(O.poisson(O.quartic(),R.one()),point)))
    IO.print("source rc/L0=2: " ++ Format.show(F.eval(O.poisson(O.quartic(),R.fraction(2n,0n)),point)))
    IO.print("biharmonic x^2*y^2: " ++ Format.show(F.eval(O.biharmonic(O.mixed()),point)))
