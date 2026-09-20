import Base
import ../indices.bend as I
import ../tensor.bend as T
import ../rational.bend as R
import ../format.bend as Format

def main() -> IO(Unit):
  do IO<Unit>:
    IO.print("Same supplied component value +2, different addresses; eta=(-,+,+,+)")
    IO.print("raised tt=" ++ Format.show(I.raise(T.Slot{T.T{},T.T{}},R.fraction(2n,0n))))
    IO.print("raised tx=" ++ Format.show(I.raise(T.Slot{T.T{},T.X{}},R.fraction(2n,0n))))
    IO.print("raised xy=" ++ Format.show(I.raise(T.Slot{T.X{},T.Y{}},R.fraction(2n,0n))))
