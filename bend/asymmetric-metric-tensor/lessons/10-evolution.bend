import Base
import ../rational.bend as R
import ../units.bend as U
import ../evolution.bend as E
import ../format.bend as Format
import ./field.bend as Example

def initial() -> E.State:
  E.State{U.Measure{R.one()}, U.Measure{R.fraction(3n, 0n)}}

def show(label: String, state: E.State) -> IO(Unit):
  match state:
    case E.State{+left, +right}:
      do IO<Unit>:
        IO.print(label ++ ": (" ++ Format.show(U.value(U.MomentumDensity{}, left)) ++ ", "
          ++ Format.show(U.value(U.MomentumDensity{}, right)) ++ ")")
        IO.print("sum = " ++ Format.show(U.value(U.MomentumDensity{}, E.total(E.State{left, right}))))

def main() -> IO(Unit):
  do IO<Unit>:
    IO.print("y-momentum densities in kg/(m^2 s); frozen faces 0,-2,0 Pa.")
    IO.print("Cell width = 1 m; dt = 1/2 s. Initial values = (1,3).")
    show("Zero steps", E.run(0n, E.Duration{1n, 1n}, U.Positive{0n, 0n}, Example.closed_faces(), initial()))
    show("One step", E.run(1n, E.Duration{1n, 1n}, U.Positive{0n, 0n}, Example.closed_faces(), initial()))
    show("Four steps", E.run(4n, E.Duration{1n, 1n}, U.Positive{0n, 0n}, Example.closed_faces(), initial()))
    show("Four zero-time steps", E.run(4n, E.Duration{0n, 0n}, U.Positive{0n, 0n}, Example.closed_faces(), initial()))
    IO.print("Open faces 3,1,0 Pa; one half-second step:")
    show("Boundary impulse", E.run(1n, E.Duration{1n, 1n}, U.Positive{0n, 0n}, Example.open_faces(), initial()))
