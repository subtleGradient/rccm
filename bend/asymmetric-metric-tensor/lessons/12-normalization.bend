import Base
import ../rational.bend as R
import ../units.bend as U
import ../normalization.bend as N
import ../matrix.bend as M
import ../capacity.bend as C
import ../tensor.bend as T
import ../format.bend as Format

def main() -> IO(Unit):
  +matrix = M.assemble(N.plane(C.Regular{2n, 3n}, U.Measure{R.fraction(1n, 1n)},
    U.Measure{R.fraction(2n, 0n)}, U.Positive{3n, 0n},
    U.Positive{0n, 3n}, U.Measure{R.fraction(3n, 0n)}))
  do IO<Unit>:
    IO.print("q=1/2; alpha=1/2; vx=2 m/s; c=4 m/s; tp=1/4 s; Omega_z=3/s")
    IO.print("U_tx=" ++ Format.show(M.at(T.Slot{T.T{}, T.X{}}, matrix)))
    IO.print("U_xt=" ++ Format.show(M.at(T.Slot{T.X{}, T.T{}}, matrix)))
    IO.print("U_xy=" ++ Format.show(M.at(T.Slot{T.X{}, T.Y{}}, matrix)))
    IO.print("U_yx=" ++ Format.show(M.at(T.Slot{T.Y{}, T.X{}}, matrix)))
