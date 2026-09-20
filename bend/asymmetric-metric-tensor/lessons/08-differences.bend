import Base
import ../tensor.bend as T
import ../capacity.bend as C
import ../matrix.bend as M
import ../stress.bend as S
import ../units.bend as U
import ../rational.bend as R
import ../format.bend as F
import ../differences.bend as D

def loaded() -> M.Sample:
  M.Sample{C.Regular{0n, 1n}, R.zero(), R.zero(), R.zero(), R.zero(), R.zero(), R.zero()}

def show(label: String, value: U.Quantity<U.ForceDensity{}>) -> IO(Unit):
  IO.print(label ++ F.show(U.value(U.ForceDensity{}, value)) ++ " N/m^3")

def main() -> IO(Unit):
  +left = S.component(U.Positive{1n, 0n}, T.Slot{T.X{}, T.X{}}, M.assemble(M.vacuum()))
  +right = S.component(U.Positive{1n, 0n}, T.Slot{T.X{}, T.X{}}, M.assemble(loaded()))
  do IO<Unit>:
    IO.print("Frozen T_xx samples: left = 0 Pa, right = 2 Pa.")
    show("One metre: ", D.gradient(U.Positive{0n, 0n}, left, right))
    show("Two metres: ", D.gradient(U.Positive{1n, 0n}, left, right))
    show("Reverse the readings, not the axis: ", D.gradient(U.Positive{0n, 0n}, right, left))
    show("Uniform nonzero field: ", D.gradient(U.Positive{0n, 0n}, right, right))
