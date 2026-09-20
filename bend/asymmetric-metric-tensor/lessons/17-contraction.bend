import Base
import ../contraction.bend as C
import ../matrix.bend as M
import ../rational.bend as R
import ../format.bend as Format

def main() -> IO(Unit):
  +sample = C.fixture(R.fraction(2n,0n),R.fraction(3n,0n))
  do IO<Unit>:
    IO.print("Algebra fixture q=1, e_x=2, b_z=3; not a closed physical state")
    IO.print("S.S=" ++ Format.show(C.contract(M.symmetric(sample),M.symmetric(sample))))
    IO.print("A.A=" ++ Format.show(C.contract(M.antisymmetric(sample),M.antisymmetric(sample))))
    IO.print("S.A=" ++ Format.show(C.contract(M.symmetric(sample),M.antisymmetric(sample))))
    IO.print("U.U=" ++ Format.show(C.contract(M.assemble(sample),M.assemble(sample))))
