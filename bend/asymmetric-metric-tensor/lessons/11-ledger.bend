import Base
import ../ledger.bend as L
import ../rational.bend as R
import ../format.bend as Format

def main() -> IO(Unit):
  +budget = {L.Budget{2n, 1n, 2n} : L.Budget}
  do IO<Unit>:
    IO.print("static=3, local=1, macro=2; Pc=6 pressure units")
    IO.print("alpha_g^2=" ++ Format.show(L.ambient(budget)))
    IO.print("alpha_a^2=" ++ Format.show(L.local_fraction(budget)))
    IO.print("q=" ++ Format.show(L.total(budget)))
    IO.print("product=" ++ Format.show(R.mul(L.ambient(budget), L.local_fraction(budget))))
