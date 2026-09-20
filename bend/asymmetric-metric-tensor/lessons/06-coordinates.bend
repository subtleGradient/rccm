import Base
import ../coordinates.bend as C
import ../tensor.bend as T
import ../matrix.bend as M
import ../format.bend as Format
import ./example.bend as Example

def main() -> IO(Unit):
  +old = M.assemble(Example.sample())
  +new = C.cycle(old)
  do IO<Unit>:
    IO.print("Same field, new labels: (t,x,y,z) -> old (t,y,z,x)")
    IO.print("old xy = " ++ Format.show(M.at(T.Slot{T.X{}, T.Y{}}, old)))
    IO.print("new zx = " ++ Format.show(M.at(T.Slot{T.Z{}, T.X{}}, new)))
    IO.print("new xy = " ++ Format.show(M.at(T.Slot{T.X{}, T.Y{}}, new)))
    IO.print("old tx = " ++ Format.show(M.at(T.Slot{T.T{}, T.X{}}, old)))
    IO.print("new tz = " ++ Format.show(M.at(T.Slot{T.T{}, T.Z{}}, new)))
    IO.print("old tt = " ++ Format.show(M.at(T.Slot{T.T{}, T.T{}}, old)))
    IO.print("new tt = " ++ Format.show(M.at(T.Slot{T.T{}, T.T{}}, new)))
