import Base
import ../flux.bend as F
import ../units.bend as U
import ../format.bend as Format
import ./field.bend as Example

def show(rates: F.Rates) -> IO(Unit):
  match rates:
    case F.Rates{+left, +right}:
      do IO<Unit>:
        IO.print("left gain = " ++ Format.show(U.value(U.ForceDensity{}, left)) ++ " N/m^3")
        IO.print("right gain = " ++ Format.show(U.value(U.ForceDensity{}, right)) ++ " N/m^3")
        IO.print("sum = " ++ Format.show(U.value(U.ForceDensity{}, F.total(F.Rates{left, right}))) ++ " N/m^3")

def main() -> IO(Unit):
  do IO<Unit>:
    IO.print("Closed fixture: x-faces carry T_xy = 0, -2, 0 Pa; width = 1 m.")
    show(F.rates(U.Positive{0n, 0n}, Example.closed_faces()))
    IO.print("Open fixture: face fluxes = 3, 1, 0 Pa; width = 1 m.")
    show(F.rates(U.Positive{0n, 0n}, Example.open_faces()))
